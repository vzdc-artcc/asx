'use client';
import {
    AirspaceConditionWithContainer,
    RadarFacilityWithSectors,
    SectorMappingWithConditions,
    VideoMapWithMappings
} from "@/types/airspace_viewer";
import React, {createContext, useCallback, useContext, useEffect, useState} from "react";
import {fetchDefaultInformation} from "@/actions/data";
import {AirspaceViewerDataContext} from "@/contexts/AirspaceViewerDataContext";
import {IdsConsolidation} from "@/types/ids";
import {RouteDisplayData} from "@/types/route";

export type ColorOverride = {
    id: string;
    color: string;
}

export type AirspaceViewerConfig = {
    data?: AirspaceViewerData;
    updateColor?: (id: string, color?: string) => void;
    updateVideoMaps?: (videoMapIds: string[]) => void;
    updateSectors?: (sectorIds: string[]) => void;
    updateFacilities?: (facilityIds: string[]) => void;
    updateConditions?: (conditionIds: string[]) => void;
    updateConfig?: (newData: AirspaceViewerData) => void;
    updateRoutes?: (routes: RouteDisplayData[]) => void;
}

export type AirspaceViewerData = {
    activeAirspaceConditions: AirspaceConditionWithContainer[];
    activeVideoMaps: VideoMapWithMappings[];
    activeSectors: SectorMappingWithConditions[];
    activeFacilities: RadarFacilityWithSectors[];
    liveConsolidations?: IdsConsolidation[];
    renderableIds?: string[];
    colorOverrides: ColorOverride[];
    routes: RouteDisplayData[];
};

export const defaultValue: AirspaceViewerConfig = {};

export const AirspaceViewerConfigContext = createContext<AirspaceViewerConfig>(defaultValue);

export const AirspaceViewerConfigProvider = ({liveConsolidations, children}: {
    liveConsolidations?: IdsConsolidation[],
    children: React.ReactNode,
}) => {
    const [data, setData] = useState<AirspaceViewerConfig>(defaultValue);
    const allData = useContext(AirspaceViewerDataContext);

    const updateConditions = useCallback((conditionIds: string[]) => {
        if (!allData) return;

        const selectedConditions = allData.allAirspaceContainers.flatMap((container) =>
            container.conditions.filter((condition) => conditionIds.includes(condition.id))
        );

        setData((prevData) => ({
            ...prevData,
            data: {
                ...prevData.data,
                activeAirspaceConditions: selectedConditions,
            } as AirspaceViewerData,
        }));
    }, [allData]);

    const updateVideoMaps = useCallback((videoMapIds: string[]) => {
        if (!allData) return;

        const selectedVideoMaps = allData.allVideoMaps.filter((videoMap) => videoMapIds.includes(videoMap.id));

        setData((prevData) => ({
            ...prevData,
            data: {
                ...prevData.data,
                activeVideoMaps: selectedVideoMaps,
            } as AirspaceViewerData,
        }));
    }, [allData]);

    const updateFacilities = useCallback((facilityIds: string[]) => {
        if (!allData) return;

        const selectedFacilities = allData.allRadarFacilities.filter((facility) => facilityIds.includes(facility.id));

        setData((prevData) => ({
            ...prevData,
            data: {
                ...prevData.data,
                activeFacilities: selectedFacilities,
                activeSectors: prevData.data?.activeSectors.filter((sector) =>
                    selectedFacilities.some((facility) => facility.sectors.some((s) => s.id === sector.id))
                ) || [],
            } as AirspaceViewerData,
        }));


    }, [allData]);

    const updateSectors = useCallback((sectorIds: string[]) => {
        if (!allData) return;

        const selectedSectors: SectorMappingWithConditions[] = [];

        for (const facility of allData.allRadarFacilities) {
            for (const sector of facility.sectors) {
                if (sectorIds.includes(sector.id)) {
                    selectedSectors.push(sector);
                }
            }
        }

        setData((prevData) => ({
            ...prevData,
            data: {
                ...prevData.data,
                activeSectors: selectedSectors,
            } as AirspaceViewerData,
        }));
    }, [allData]);

    const updateColor = useCallback((id: string, color?: string) => {
        setData((prevData) => {
            if (!prevData.data) return prevData;

            if (!color) {
                const newColorOverrides = prevData.data.colorOverrides.filter((co) => co.id !== id);
                return {
                    ...prevData,
                    data: {
                        ...prevData.data,
                        colorOverrides: newColorOverrides,
                    } as AirspaceViewerData,
                };
            }

            const newColorOverrides = prevData.data.colorOverrides.filter((co) => co.id !== id);
            newColorOverrides.push({id, color});

            return {
                ...prevData,
                data: {
                    ...prevData.data,
                    colorOverrides: newColorOverrides,
                } as AirspaceViewerData,
            };
        });
    }, []);

    const updateConfig = useCallback((newData: AirspaceViewerData) => {
        setData((prevData) => ({
            ...prevData,
            data: newData,
        }));
    }, []);

    const updateRoutes = useCallback((routes: RouteDisplayData[]) => {
        setData((prevData) => ({
            ...prevData,
            data: {
                ...prevData.data,
                routes,
            } as AirspaceViewerData,
        }));
    }, []);

    useEffect(() => {
        if (!allData) {
            return;
        }

        fetchDefaultInformation().then(({defaultConditions, defaultVideoMaps}) => {
            const result: AirspaceViewerData = {
                activeAirspaceConditions: defaultConditions,
                liveConsolidations,
                activeVideoMaps: defaultVideoMaps,
                activeSectors: [],
                activeFacilities: [],
                colorOverrides: [],
                routes: [],
            };

            if (liveConsolidations) {
                const renderableIds: string[] = [];
                const activeSectors: SectorMappingWithConditions[] = [];

                for (const consol of liveConsolidations) {
                    const primarySector = findSectorByIdsId(consol.primarySectorId, allData?.allRadarFacilities);
                    if (primarySector) {
                        renderableIds.push(primarySector.id);
                        const radarFacility = allData?.allRadarFacilities.find((fac) =>
                            fac.sectors.some((sector) => sector.idsRadarSectorId === consol.primarySectorId)
                        );
                        if (radarFacility) {
                            if (radarFacility.autoSelectActiveConsolidations) {
                                activeSectors.push(primarySector);
                            }

                            if (!result.activeFacilities.some((fac) => fac.id === radarFacility.id)) {
                                result.activeFacilities.push(radarFacility);
                            }
                        }

                    }
                }

                result.activeSectors = activeSectors;
                result.renderableIds = renderableIds;
            }

            setData({
                data: result,
                updateConditions,
                updateVideoMaps,
                updateFacilities,
                updateSectors,
                updateColor,
                updateConfig,
                updateRoutes,
            });
        });
    }, [liveConsolidations, allData, updateConditions, updateVideoMaps, updateFacilities, updateSectors, updateColor, updateConfig, updateRoutes]);

    return (
        <AirspaceViewerConfigContext.Provider value={data}>
            {children}
        </AirspaceViewerConfigContext.Provider>
    )
}

const findSectorByIdsId = (idsId: string, allFacilities?: RadarFacilityWithSectors[]): SectorMappingWithConditions | undefined => {
    return allFacilities?.flatMap((fac) => fac.sectors).find((sector) => sector.idsRadarSectorId === idsId);
}