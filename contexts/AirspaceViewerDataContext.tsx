'use client';
import {AirspaceContainerWithConditions, RadarFacilityWithSectors, VideoMapWithMappings} from "@/types/airspace_viewer";
import React, {createContext, useEffect, useState} from "react";
import {fetchAllAirspaceViewerData} from "@/actions/data";

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
        });
    }, []);

    return (
        <AirspaceViewerDataContext.Provider value={data}>
            {children}
        </AirspaceViewerDataContext.Provider>
    )
}