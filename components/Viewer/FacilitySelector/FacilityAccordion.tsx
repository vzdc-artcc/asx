'use client';
import React, {useContext, useState} from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Checkbox,
    IconButton,
    Stack,
    Typography
} from "@mui/material";
import {Delete, ExpandMore} from "@mui/icons-material";
import SectorCheckboxes from "@/components/Viewer/FacilitySelector/SectorCheckboxes";
import {AirspaceViewerDataContext} from "@/contexts/AirspaceViewerDataContext";
import {AirspaceViewerConfigContext} from "@/contexts/AirspaceViewerConfigContext";
import FacilityColorPicker from "@/components/Viewer/FacilitySelector/FacilityColorPicker";
import {getMappingColor} from "@/lib/color";
import {RadarFacilityWithSectors} from "@/types/airspace_viewer";

export default function FacilityAccordion({facility, onDelete, disableDelete}: {
    facility: RadarFacilityWithSectors,
    onDelete: (facilityId: string) => void,
    disableDelete?: boolean,
}) {

    const [open, setOpen] = useState(false);

    const allData = useContext(AirspaceViewerDataContext);
    const config = useContext(AirspaceViewerConfigContext);

    if (!config?.data || !allData) {
        return <></>
    }

    const sectors = facility.sectors.filter((s) => !config.data?.liveConsolidations || config.data.liveConsolidations.some(lc => lc.primarySectorId === s.idsRadarSectorId));
    const activeSectors = config.data.activeSectors.filter(sector => sectors.map(s => s.id).includes(sector.id));
    const selectAll = activeSectors.length === sectors.length;

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!config.data) return;


        if (event.target.checked) {
            const newSectorIds = [
                ...config.data.activeSectors.map(s => s.id),
                ...sectors
                    .map(s => s.id)
                    .filter(id => !config.data?.activeSectors.some(as => as.id === id))
            ];
            config.updateSectors?.(newSectorIds);
        } else {
            const newSectorIds = config.data.activeSectors
                .map(s => s.id)
                .filter(id => !sectors.map(s => s.id).includes(id));
            config.updateSectors?.(newSectorIds);
        }
    };

    const allSectorsSameColor = activeSectors.length > 0 && activeSectors.every(sector => getMappingColor(!!config.data?.liveConsolidations, sector, config.data!.colorOverrides) === getMappingColor(!!config.data?.liveConsolidations, activeSectors[0], config.data!.colorOverrides));
    const everySectorSameColor = sectors.length > 0 && sectors.every(sector => getMappingColor(!!config.data?.liveConsolidations, sector, config.data!.colorOverrides) === getMappingColor(!!config.data?.liveConsolidations, sectors[0], config.data!.colorOverrides));

    let color;
    if (allSectorsSameColor) {
        color = getMappingColor(!!config.data?.liveConsolidations, activeSectors[0], config.data!.colorOverrides);
    } else if (everySectorSameColor) {
        color = getMappingColor(!!config.data?.liveConsolidations, sectors[0], config.data!.colorOverrides);
    } else {
        color = undefined;
    }

    const updateAllActiveSectorColors = (color?: string) => {
        sectors.forEach((sector) => config.updateMappingColor?.(sector.id, color));
    }

    return (
        <Accordion variant="outlined" expanded={open}>
            <AccordionSummary component="div" expandIcon={
                <IconButton size="small" onClick={() => setOpen((o) => !o)}>
                    <ExpandMore/>
                </IconButton>
            }>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Checkbox
                        checked={selectAll}
                        onChange={handleSelectAll}
                    />
                    <Typography>{facility.name} ({activeSectors.length}/{sectors.length})</Typography>
                    <Box>
                        <FacilityColorPicker existingColor={color} onChange={updateAllActiveSectorColors}/>
                        <IconButton disabled={disableDelete} onClick={() => onDelete(facility.id)} size="small">
                            <Delete/>
                        </IconButton>
                    </Box>
                </Stack>
            </AccordionSummary>
            <AccordionDetails>
                <SectorCheckboxes sectors={sectors}/>
            </AccordionDetails>
        </Accordion>
    );

}