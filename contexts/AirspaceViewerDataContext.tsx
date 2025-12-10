'use client';
import {AirspaceContainerWithConditions, RadarFacilityWithSectors, VideoMapWithMappings} from "@/types/airspace_viewer";
import React, {createContext, useEffect, useState} from "react";
import {fetchAllAirspaceViewerData} from "@/actions/data";
import {fetchJson} from "@/lib/json";

export type AirspaceViewerDataContextType = {
    allAirspaceContainers: AirspaceContainerWithConditions[];
    allVideoMaps: VideoMapWithMappings[];
    allRadarFacilities: RadarFacilityWithSectors[];
}

export const AirspaceViewerDataContext = createContext<AirspaceViewerDataContextType | undefined>(undefined);

export const AirspaceViewerDataProvider = ({children}: { children: React.ReactNode }) => {
    const [data, setData] = useState<AirspaceViewerDataContextType>();

    useEffect(() => {
        fetchAllAirspaceViewerData().then((res) => {
            setData(res);
            const allMappings =
                [...res.allVideoMaps.flatMap(vm => vm.mappings),
                    ...res.allRadarFacilities.flatMap(rf => rf.sectors.flatMap(s => s.mappings))];
            const allKeys = allMappings.map((m) => m.jsonKey);
            console.log(`Loading ${allKeys.length} keys`);
            allKeys.forEach((key, i) => {
                fetchJson(key).then(() => console.log(`Loaded ${i + 1}/${allKeys.length}`));
            });
        });
    }, []);

    return (
        <AirspaceViewerDataContext.Provider value={data}>
            {children}
        </AirspaceViewerDataContext.Provider>
    )
}