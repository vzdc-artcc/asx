'use server';

import prisma from "@/lib/db";
import {GridFilterItem, GridPaginationModel, GridSortModel} from "@mui/x-data-grid";
import {Prisma, VideoMap} from "@prisma/client";
import {after} from "next/server";
import {log} from "./log";
import {OrderItem} from "@/components/Admin/Order/OrderList";
import z from "zod";
import {revalidatePath} from "next/cache";
import {NewMapping} from "@/components/Admin/MappingJson/MappingJsonForm";
import {UTApi} from "uploadthing/server";

const ut = new UTApi();

export const fetchVideoMaps = async (pagination: GridPaginationModel, sort: GridSortModel, filter?: GridFilterItem) => {

    const orderBy: Prisma.VideoMapOrderByWithRelationInput = {};
    if (sort.length > 0) {
        orderBy.name = sort[0].sort === 'asc' ? 'asc' : 'desc';
    }

    return prisma.$transaction([
        prisma.videoMap.count({
            where: getWhere(filter),
        }),
        prisma.videoMap.findMany({
            orderBy,
            where: getWhere(filter),
            take: pagination.pageSize,
            skip: pagination.page * pagination.pageSize,
        })
    ]);
}

const getWhere = (filter?: GridFilterItem): Prisma.VideoMapWhereInput => {
    if (!filter) {
        return {};
    }

    return {
        name: {
            [filter.operator]: filter.value as string,
            mode: 'insensitive',
        }
    };
}

export const deleteVideoMap = async (id: string) => {
    const vm = await prisma.videoMap.delete({
        where: {
            id,
        },
        include: {
            mappings: true,
        },
    });

    revalidatePath('/admin/video-maps');

    after(async () => {
        await ut.deleteFiles(vm.mappings.map(mj => mj.jsonKey));

        await log('DELETE', 'VIDEO_MAP', `Deleted video map ${vm.name}`);
    });
}

export const updateVideoMapOrder = async (items: OrderItem[]) => {
    for (const item of items) {
        await prisma.videoMap.update({
            where: {
                id: item.id,
            },
            data: {
                order: item.order,
            },
        });
    }

    after(async () => {
        await log('UPDATE', 'VIDEO_MAP', 'Updated video map order');
    });
}

export const createOrUpdateVideoMap = async (formData: FormData) => {
    
    const vmZ = z.object({
        id: z.string().optional(),
        defaultEnabled: z.boolean().optional(),
        name: z.string().nonempty("Name is required"),
        color: z.string().min(1, "Color is required.")
            .transform((s) => {
                const t = String(s).trim();
                return t.startsWith('#') ? t : `#${t}`;
            })
            .refine(s => /^#[0-9A-Fa-f]{6}$/.test(s), {message: 'Explorer Color must be a 6-digit HEX color prefixed with #'}),
    })

    const result = vmZ.safeParse({
        id: formData.get('id') as string,
        defaultEnabled: formData.get('defaultEnabled') === 'on',
        name: formData.get('name') as string,
        color: formData.get('color') as string,
    });

    if (!result.success) {
        return { errors: result.error.errors, };
    }

    if (result.data.id) {
        const vm = await prisma.videoMap.update({
            where: {
                id: result.data.id,
            },
            data: {
                name: result.data.name,
                defaultEnabled: result.data.defaultEnabled,
                color: result.data.color,
            },
        });

        after(async () => {
            await log('UPDATE', 'VIDEO_MAP', `Updated video map ${vm.name}`);
        });

        revalidatePath(`/admin/video-maps/${vm.id}`);

        return { videoMap: vm };
    } else {
        const vm = await prisma.videoMap.create({
            data: {
                name: result.data.name,
                defaultEnabled: result.data.defaultEnabled,
                color: result.data.color,
            },
        });

        after(async () => {
            await log('CREATE', 'VIDEO_MAP', `Created video map ${vm.name}`);
        });

        return { videoMap: vm };
    }
}

export const updateVideoMapJsons = async (deleteIds: string[], newMappings: NewMapping[]) => {

    for (const id of deleteIds) {
        const mj = await prisma.mappingJson.delete({
            where: {
                id,
            },
        });

        if (mj) {
            await ut.deleteFiles(mj.jsonKey);
        }
    }

    let videoMap: VideoMap | undefined;

    for (const mapping of newMappings) {

        const res = await ut.uploadFiles(mapping.file);
        
        if (res.error) {
            return false;
        }

        const mj = await prisma.mappingJson.create({
            data: {
                airspaceConditionId: mapping.airspaceConditionId,
                videoMapId: mapping.videoMapId,
                jsonKey: res.data.key,
            },
            include: {
                videoMap: true,
            },
        });

        if (!videoMap) {
            videoMap = mj.videoMap as VideoMap;
        }
    }

    after(async () => {
        if (videoMap) {
            await log('UPDATE', 'VIDEO_MAP', `Updated video map '${videoMap.name}' JSON files.`);
        }
    });

    if (videoMap) {
        revalidatePath(`/admin/video-maps/${videoMap.id}`);
    }

    return true;
}
