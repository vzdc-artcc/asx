'use client';
import React, {useCallback, useEffect, useState} from 'react';
import {useMap, useMapEvent,} from "react-leaflet";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import * as leafletPip from "@mapbox/leaflet-pip";
import L from "leaflet";
import {GeoJsonObject} from "geojson";
import {Paper, Typography} from "@mui/material";
import {GeoJsonFile} from "@/components/Viewer/Map/Map";

export default function AltitudeInformation({sectors, manualOwnedBy}: {
    sectors: GeoJsonFile[],
    manualOwnedBy: { // noinspection JSUnusedLocalSymbols
        [key: string]: string,
    }
}) {

    const [displayedAltitudes, setDisplayedAltitudes] = useState<{
        name: string,
        key: string,
        ownedBy: string,
        altitude: string,
    }[]>([]);
    const [lat, setLat] = useState<number>();
    const [lng, setLng] = useState<number>();
    const map = useMap();

    const getOwnerSector = useCallback((sector: GeoJsonFile, ownedBy?: string) => {
        if (!ownedBy) return sector;

        const ownedSector = sectors.find(s => s.key === ownedBy);

        return ownedSector || sector;
    }, [sectors]);

    const getPolygonsContaining = useCallback((geoJson: GeoJsonObject) => {
        if (!lat || !lng) return [];

        const polygon = L.geoJSON(geoJson);

        return leafletPip.pointInLayer([lng, lat], polygon);
    }, [lat, lng]);

    useMapEvent('mousemove', (e: L.LeafletMouseEvent) => {
        setLat(e.latlng.lat);
        setLng(e.latlng.lng);
    });


    useEffect(() => {
        if (!map || lat == null || lng == null) return;

        const next: {
            name: string;
            key: string;
            ownedBy: string;
            altitude: string;
        }[] = [];

        for (const sector of sectors) {
            const polygons = getPolygonsContaining(sector.json as unknown as GeoJsonObject);
            const ownerSector = getOwnerSector(sector, manualOwnedBy[sector.key]);

            if (polygons.length === 0) continue;

            const altitudes: string[] = Object.entries(polygons[0].feature.properties)
                .filter(([k, v]) => k !== 'fid' && !!v)
                .map(([_, v]) => String(v));

            let firstNonNullAltitude = altitudes.find(Boolean);
            if (!firstNonNullAltitude) continue;

            const splitShelves = firstNonNullAltitude.split(' - ');

            for (let i = 0; i < splitShelves.length; i++) {
                const shelf = splitShelves[i];
                let altitudeComponents = shelf.replace('FL', '').replace('SFC', '000').split(' ');

                if (altitudeComponents.length !== 2) continue;
                const allNumbers = altitudeComponents.every(c => !isNaN(Number(c)));
                if (!allNumbers) continue;

                if (Number(altitudeComponents[1]) < Number(altitudeComponents[0])) {
                    altitudeComponents.reverse();
                }

                altitudeComponents = altitudeComponents.map(c => Number(c) === 0 ? '000' : c);
                splitShelves[i] = altitudeComponents.join('-');
            }

            firstNonNullAltitude = splitShelves.join(' / ');

            next.push({
                name: ownerSector.json?.name || ownerSector.key,
                altitude: firstNonNullAltitude,
                key: sector.key,
                ownedBy: ownerSector.key
            });
        }

        // keep last occurrence per sector.key (similar to original logic)
        const unique = new Map<string, typeof next[0]>();
        for (let i = next.length - 1; i >= 0; i--) {
            unique.set(next[i].key, next[i]);
        }

        setDisplayedAltitudes(Array.from(unique.values()));
    }, [map, lat, lng, sectors, getOwnerSector, getPolygonsContaining, manualOwnedBy]);

    const filteredDisplayedAltitudes = displayedAltitudes.filter((a) => sectors.map((s) => s.key).includes(a.key));

    return filteredDisplayedAltitudes.length > 0 && (
        <Paper
            sx={{
                minWidth: "1vw",
                maxWidth: "350px",
                minHeight: "1vw",
                position: "absolute",
                right: 0,
                top: 0,
                zIndex: 999,
                m: 2,
                p: 2,
            }}
        >
            <Typography variant="subtitle2" textAlign="center" gutterBottom>Sector Altitudes</Typography>
            {filteredDisplayedAltitudes
                .sort((a, b) => a.name.localeCompare(b.name))
                .sort((a, b) => a.altitude.localeCompare(b.altitude))
                .map((a, idx) => (
                    <Typography key={a.key + idx}
                                variant="body2">{a.name}: <b>{a.altitude.replace('000', 'SFC')}</b></Typography>
                ))}
        </Paper>
    );
}