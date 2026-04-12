'use server';

import prisma from "@/lib/db";
import {GridFilterItem, GridPaginationModel, GridSortModel} from "@mui/x-data-grid";
import {Prisma} from "@/generated/prisma/client";
import {after} from "next/server";
import {log} from "./log";
import {OrderItem} from "@/components/Admin/Order/OrderList";
import {z} from "zod";
import {revalidatePath} from "next/cache";

export const fetchAirspaceContainers = async (pagination: GridPaginationModel, sort: GridSortModel, filter?: GridFilterItem) => {
    const orderBy: Prisma.AirspaceConditionContainerOrderByWithRelationInput = {};

    if (sort.length > 0) {
        orderBy[sort[0].field as keyof Prisma.AirspaceConditionContainerOrderByWithRelationInput] = sort[0].sort === 'asc' ? 'asc' : 'desc';
    }

    return prisma.$transaction([
        prisma.airspaceConditionContainer.count({
            where: getWhere(filter),
        }),
        prisma.airspaceConditionContainer.findMany({
            orderBy,
            where: getWhere(filter),
            take: pagination.pageSize,
            skip: pagination.page * pagination.pageSize,
            include: {
                conditions: true,
            },
        }),
    ]);
}

const getWhere = (filter?: GridFilterItem): Prisma.AirspaceConditionContainerWhereInput => {
    if (!filter) {
        return {};
    }

    switch (filter.field) {
        case 'name':
            return {
                name: {
                    [filter.operator]: filter.value as string,
                    mode: 'insensitive',
                }
            };
        case 'conditions':
            return {
                conditions: {
                    some: {
                        name: {
                            [filter.operator]: filter.value as string,
                            mode: 'insensitive',
                        }
                    }
                }
            };
        default:
            return {};
    }
}

export const deleteAirspaceContainer = async (id: string) => {
    const acc = await prisma.airspaceConditionContainer.delete({
        where: {
            id,
        },
    });

    revalidatePath('/admin/airports');

    after(async () => {
        await log('DELETE', 'AIRSPACE_CONDITION_CONTAINER', `Deleted container ${acc.name}`);
    });
}

export const updateAirspaceContainerOrder = async (items: OrderItem[]) => {
    for (const item of items) {
        await prisma.airspaceConditionContainer.update({
            where: {
                id: item.id,
            },
            data: {
                order: item.order,
            },
        });
    }

    after(async () => {
        await log('UPDATE', 'AIRSPACE_CONDITION_CONTAINER', 'Updated container order');
    });
}

export const createOrUpdateAirspaceContainer = async (data: FormData) => {

    const airportZ = z.object({
        id: z.string().optional(),
        name: z.string().nonempty("Name is required"),
        conditions: z.array(z.string()).nonempty("Conditions are required"),
    });

    const result = airportZ.safeParse({
        id: data.get('id') as string,
        name: data.get('name') as string,
        conditions: (data.get('conditions') as string)?.split(',').map((c) => c.trim()) || [],
    });

    if (!result.success) {
        return { errors: result.error.issues, };
    }

    if (result.data.id) {

        // Get current conditions
        const currentConditions = await prisma.airspaceCondition.findMany({
            where: {
                containerId: result.data.id,
            },
        });

        // Delete only conditions that are not in the new list
        await prisma.airspaceCondition.deleteMany({
            where: {
                AND: [
                    {containerId: result.data.id},
                    { name: { notIn: result.data.conditions } }
                ]
            },
        });

        // Get existing condition names to avoid duplicates
        const existingConditionNames = currentConditions.map(c => c.name);

        const container = await prisma.airspaceConditionContainer.update({
            where: {
                id: result.data.id,
            },
            data: {
                name: result.data.name,
                conditions: {
                    create: result.data.conditions
                        .filter(name => !existingConditionNames.includes(name))
                        .map((c) => ({ name: c })),
                },
            },
            include: {
                conditions: true,
            },
        });

        after(async () => {
            await log('UPDATE', 'AIRSPACE_CONDITION_CONTAINER', `Updated container ${container.name}`);
        });

        revalidatePath(`/admin/airports/${container.id}`);

        return {airport: container};
    } else {
        const container = await prisma.airspaceConditionContainer.create({
            data: {
                name: result.data.name,
                conditions: {
                    create: result.data.conditions.map((c) => ({ name: c })),
                },
            },
            include: {
                conditions: true,
            },
        });

        after(async () => {
            await log('CREATE', 'AIRSPACE_CONDITION_CONTAINER', `Created airport ${container.name}`);
        });

        return {container,};
    }

}