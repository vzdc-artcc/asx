'use client';
import React, {useContext, useEffect, useState} from 'react';
import {AirspaceViewerConfigContext} from "@/contexts/AirspaceViewerConfigContext";
import {
    AirspaceConditionWithContainer,
    MappingJsonWithConditions,
    SectorMappingWithConditions
} from "@/types/airspace_viewer";
import {MappingJson} from "@prisma/client";
import {getMappingColor} from "@/lib/color";
import {Box, Card, CardContent, Chip, Stack, Typography} from "@mui/material";
import {Info} from "@mui/icons-material";
import LeafletMap from "@/components/Viewer/LeafletMap/Map";
import Geojson from "@/components/GeoJSON/GeoJSON";
import AltitudeInformationWrapper from "@/components/Viewer/Tooltips/AltitudeInformationWrapper";
import ColorLegendWrapper from "@/components/Viewer/Tooltips/ColorLegendWrapper";
import {useColorScheme} from "@mui/material/styles";
import {AirspaceViewerDataContext} from "@/contexts/AirspaceViewerDataContext";
import { Polyline, CircleMarker, Tooltip as LeafletTooltip } from 'react-leaflet';

const CENTER_LAT = Number(process.env['NEXT_PUBLIC_MAP_DEFAULT_CENTER_LAT']) || 36.5;
const CENTER_LONG = Number(process.env['NEXT_PUBLIC_MAP_DEFAULT_CENTER_LONG']) || -77;
const ZOOM = Number(process.env['NEXT_PUBLIC_MAP_DEFAULT_ZOOM']) || 6.5;

type GeoJsonRequest = {
    key: string;
    color: string;
};

export type GeoJsonFile = {
    key: string;
    json: {
        name: string,
        crs: {
            properties: {
                name: string,
                color: string,
            },
        },
    },
    color: string;
};

export default function Map() {

    const config = useContext(AirspaceViewerConfigContext);
    const allData = useContext(AirspaceViewerDataContext);
    const {colorScheme} = useColorScheme();
    const [files, setFiles] = useState<GeoJsonFile[]>([]);
    const [ownedBy, setOwnedBy] = useState<{ [key: string]: string, }>();
    const [colorLegend, setColorLegend] = useState<{ color: string, name: string, frequency: string, }[]>([]);
    const [errorText, setErrorText] = useState<string>();

    useEffect(() => {
        if (!config?.data || !allData) {
            return;
        }

        const {
            activeAirspaceConditions: activeConditions,
            activeVideoMaps,
            activeSectors,
            liveConsolidations,
            colorOverrides,
        } = config.data;

        const geoJsonToRequest: GeoJsonRequest[] = [];
        const newColorLegend: { color: string; name: string; frequency: string }[] = [];
        const colorLegendSet = new Set<string>();
        const newOwnedBy: { [key: string]: string } = {};
        let errorOccurred = undefined;

        for (const videoMap of activeVideoMaps) {
            const mappingJson = getMappingJsonForConditions(videoMap.mappings, activeConditions);
            if (typeof mappingJson === 'string') {
                errorOccurred = mappingJson;
                break;
            }
            if (mappingJson) {
                const colorOverride = colorOverrides.find(override => override.id === videoMap.id);
                geoJsonToRequest.push({
                    key: mappingJson.jsonKey,
                    color: colorOverride?.color ?? videoMap.color,
                });
            }
        }

        for (const sector of activeSectors) {
            const mappingJson = getMappingJsonForConditions(sector.mappings, activeConditions);
            if (typeof mappingJson === 'string') {
                errorOccurred = mappingJson;
                break;
            }

            const sectorColor = getMappingColor(!!liveConsolidations, sector, colorOverrides);
            geoJsonToRequest.push({
                key: mappingJson.jsonKey,
                color: sectorColor,
            });

            if (liveConsolidations) {
                const legendKey = `${sectorColor}::${sector.name}`;
                if (!colorLegendSet.has(legendKey)) {
                    colorLegendSet.add(legendKey);
                    newColorLegend.push({
                        color: sectorColor,
                        name: sector.name,
                        frequency: sector.frequency,
                    });
                }

                const secondarySectorIds = liveConsolidations
                    .filter(consolidation => consolidation.primarySectorId === sector.idsRadarSectorId)
                    .flatMap(consolidation => consolidation.secondarySectorIds);

                const secondarySectors = addSecondaryConsolidationSectors(secondarySectorIds, allData.allRadarFacilities.flatMap((fac) => fac.sectors));

                for (const secondarySector of secondarySectors) {
                    const secondaryMappingJson = getMappingJsonForConditions(secondarySector.mappings, activeConditions);
                    if (typeof secondaryMappingJson === 'string') {
                        errorOccurred = secondaryMappingJson;
                        break;
                    }
                    if (secondaryMappingJson) {
                        geoJsonToRequest.push({
                            key: secondaryMappingJson.jsonKey,
                            color: sectorColor,
                        });
                        newOwnedBy[secondaryMappingJson.jsonKey] = mappingJson.jsonKey;
                    }
                }
            }
        }
        (async () => {
            if (errorOccurred) {
                setErrorText(errorOccurred);
                setFiles([]);
                return;
            }
            const fetched = await fulfillGeoJsonRequests(geoJsonToRequest);
            setFiles(fetched);
            setColorLegend(newColorLegend);
            setOwnedBy(Object.keys(newOwnedBy).length ? newOwnedBy : undefined);
            setErrorText(undefined);
        })();
    }, [allData, config]);

    if (errorText) {
        return ErrorCard(errorText);
    }

    if (files.length === 0) {
        return EmptyViewer;
    }

    const routes = config?.data?.routes.filter((route) => route.displayed) || [];

    return (
        <Card sx={{height: '100%', display: 'flex', flexDirection: 'column',}}>
            <CardContent sx={{
                p: '0 !important',
                flex: '1 1 auto',
                backgroundColor: colorScheme === 'dark' ? '#4e4e4e' : 'lightgray',
            }}>
                <Box sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    flex: '1 1 auto',
                }}>
                    <LeafletMap
                        zoomSnap={0.1}
                        center={[CENTER_LAT, CENTER_LONG]}
                        zoom={ZOOM}
                        style={{
                            position: 'absolute',
                            background: 'transparent',
                            width: '100%',
                            height: '100%',
                        }}
                    >
                        {files.map((file) => (
                            <Geojson
                                key={file.key}
                                data={file.json}
                                style={{weight: 1, color: file.color}}
                                interactive={false}
                            />
                        ))}
                        {}
                        {/* Render routes: polyline for route path, and waypoint labels when enabled */}
                        {routes.map((route) => {
                            const colorOverride = config?.data?.colorOverrides.find((c) => c.id === route.id)?.color || '#FF0000';
                            const positions = route.coordinates.map((c) => [c.latitude, c.longitude] as [number, number]);

                            return (
                                <React.Fragment key={route.id}>
                                    {positions.length >= 2 && (
                                        <Polyline positions={positions} pathOptions={{color: colorOverride, weight: 2}} />
                                    )}

                                    {route.showLabels && route.coordinates.map((coord, idx) => (
                                        <CircleMarker
                                            key={`${route.id}-wp-${idx}`}
                                            center={[coord.latitude, coord.longitude]}
                                            radius={4}
                                            pathOptions={{color: colorOverride, fillColor: colorOverride, fillOpacity: 1}}
                                            interactive={false}
                                        >
                                            <LeafletTooltip direction="right" permanent offset={[8, 0]}>
                                                {coord.name}
                                            </LeafletTooltip>
                                        </CircleMarker>
                                    ))}
                                </React.Fragment>
                            );
                        })}

                        <AltitudeInformationWrapper sectors={files} ownedBy={ownedBy || {}}/>
                        <ColorLegendWrapper colorLegend={colorLegend}/>
                    </LeafletMap>
                </Box>
            </CardContent>
        </Card>
    );
}

const getMappingJsonForConditions = (
    mappings: MappingJsonWithConditions[],
    activeConditions: AirspaceConditionWithContainer[],
): MappingJson | string => {
    const noConditionMapping = mappings.find((mapping) => !mapping.airspaceCondition);
    const mappingWithCondition = mappings.find((mapping) =>
        mapping.airspaceCondition &&
        activeConditions.some((condition) => condition.id === mapping.airspaceCondition?.id)
    );

    if (mappingWithCondition) {
        return mappingWithCondition;
    }

    if (noConditionMapping) {
        return noConditionMapping;
    } else {
        return `One or more maps require that certain airspace conditions be set before they can be displayed.  You can see which airspace conditions are needed next to each video and sector map.`;
    }
}

const addSecondaryConsolidationSectors = (secondarySectorIds: string[], allSectors: SectorMappingWithConditions[]) => {
    return allSectors.filter(sector => secondarySectorIds.includes(sector.idsRadarSectorId));
}

const fetchJson = async (key: string) => {
    const res = await fetch(`https://utfs.io/f/${key}`);
    return await res.json();
}

const fulfillGeoJsonRequests = async (requests: GeoJsonRequest[]) => {
    return await Promise.all(
        requests.map(async (request) => {
            const json = await fetchJson(request.key);

            return {
                key: request.key,
                json,
                color: request.color,
            };
        })
    );
};

const EmptyViewer = (
    <Card>
        <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" sx={{mb: 1,}}>
                <Info color="info"/>
                <Typography variant="h5">Welcome to the Airspace Map!</Typography>
            </Stack>
            <Typography gutterBottom>Select a video map and start adding facilities to visualize the
                airspace.</Typography>
            <Typography variant="subtitle2">NOTE: A majority of TRACON/RAPCON sectors and video maps require an
                airspace
                condition to be set prior to enabling them. Add an airspace condition above by pressing the +
                button.</Typography>
        </CardContent>
    </Card>
);

const ErrorCard = (message: string) => (
    <Card>
        <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" sx={{mb: 1,}}>
                <Info color="error"/>
                <Typography variant="h5">Unable to Render Map</Typography>
            </Stack>
            <Typography gutterBottom>{message}</Typography>
            <Typography fontWeight="bold">Airspace conditions are added at the top of the page and maps that require a
                certain condition to be set are denoted with a <Chip color="primary" size="small" label="LABEL"/>. Maps
                can and will change based on the conditions set since airspace can depend on external
                factors.</Typography>
        </CardContent>
    </Card>
);
