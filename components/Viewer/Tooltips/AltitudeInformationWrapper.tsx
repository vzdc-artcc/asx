'use client'
import dynamic from 'next/dynamic';
import {GeoJsonFile} from "@/components/Viewer/Map/Map";

const DynamicTooltips = dynamic(() => import('./AltitudeInformation'), {
    ssr: false
});

const AltitudeInformationWrapper = ({sectors, ownedBy}: {
    sectors: GeoJsonFile[],
    ownedBy: { [key: string]: string, }
}) => {
    return <DynamicTooltips sectors={sectors} manualOwnedBy={ownedBy}/>
}

export default AltitudeInformationWrapper;