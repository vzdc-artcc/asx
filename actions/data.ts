'use server';

import prisma from "@/lib/db";
import {AirspaceViewerDataContextType} from "@/contexts/AirspaceViewerDataContext";
import {AirspaceConditionWithContainer, VideoMapWithMappings} from "@/types/airspace_viewer";

export const fetchAllAirspaceViewerData = async (): Promise<AirspaceViewerDataContextType> => {
    const allContainers = await prisma.airspaceConditionContainer.findMany({
        include: {
            conditions: {
                include: {
                    container: true,
                },
            },
        },
        orderBy: {
            order: "asc",
        },
    });

    const allVideoMaps = await prisma.videoMap.findMany({
        where: {
            NOT: {
                mappings: {
                    none: {},
                },
            },
        },
        include: {
            mappings: {
                include: {
                    airspaceCondition: {
                        include: {
                            container: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            order: "asc",
        },
    });

    const allFacilities = await prisma.radarFacility.findMany({
        include: {
            sectors: {
                include: {
                    mappings: {
                        include: {
                            airspaceCondition: {
                                include: {
                                    container: true,
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: {
            order: "asc",
        },
    });

    return {
        allAirspaceContainers: allContainers,
        allVideoMaps: allVideoMaps,
        allRadarFacilities: allFacilities,
    };
}

export const fetchDefaultInformation = async (): Promise<{
    defaultConditions: AirspaceConditionWithContainer[],
    defaultVideoMaps: VideoMapWithMappings[]
}> => {
    const defaultConditions = await prisma.activeConsolidationsDefaultConditions.findFirst({
        include: {
            conditions: {
                include: {
                    container: true,
                },
            },
        },
    });

    const defaultVideoMaps = await prisma.videoMap.findMany({
        where: {
            defaultEnabled: true,
        },
        include: {
            mappings: {
                include: {
                    airspaceCondition: {
                        include: {
                            container: true,
                        },
                    },
                },
            },
        }
    });
    return {defaultConditions: defaultConditions?.conditions || [], defaultVideoMaps};
}