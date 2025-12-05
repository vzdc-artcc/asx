'use client';
import React, {useContext} from 'react';
import {Box, Checkbox, FormControlLabel, FormGroup, IconButton, Stack, Tooltip, Typography} from "@mui/material";
import {getConditionChips} from "@/lib/chips";
import {AirspaceViewerConfigContext} from "@/contexts/AirspaceViewerConfigContext";
import {SectorMappingWithConditions} from "@/types/airspace_viewer";
import FacilityColorPicker from "@/components/Viewer/FacilitySelector/FacilityColorPicker";
import {getMappingColor} from "@/lib/color";
import {SpeakerNotes, SpeakerNotesOff} from "@mui/icons-material";
import SectorLegendToggle from "@/components/Viewer/FacilitySelector/SectorLegendToggle";

export default function SectorCheckboxes({sectors}: { sectors: SectorMappingWithConditions[], }) {

    const config = useContext(AirspaceViewerConfigContext);

    if (!config?.data) {
        return <></>
    }

    const activeSectors = config.data.activeSectors.filter((sector) => sectors.map(s => s.id).includes(sector.id));
    const allActiveSectorIds = config.data.activeSectors.map(s => s.id);

    const onAddSector = (sectorId: string) => {
        const newSectorIds = [...allActiveSectorIds, sectorId];
        config.updateSectors?.(newSectorIds);
    }

    const onRemoveSector = (sectorId: string) => {
        const newSectorIds = allActiveSectorIds.filter(id => id !== sectorId);
        config.updateSectors?.(newSectorIds);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;

        if (checked) {
            onAddSector(e.target.id);
        } else {
            onRemoveSector(e.target.id);
        }
    }

    return (
        <FormGroup>
            {sectors.sort((a, b) => a.name.localeCompare(b.name)).map(sector => (
                <FormControlLabel key={sector.id}
                                  control={<Checkbox id={sector.id}
                                                     checked={!!activeSectors.find((s) => s.id === sector.id)}
                                                     onChange={handleChange}/>} sx={{mb: 2,}} label={
                    <>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography>{sector.name}</Typography>
                            <FacilityColorPicker
                                existingColor={getMappingColor(!!config.data?.liveConsolidations, sector, config.data?.colorOverrides || [])}
                                onChange={(color) => config.updateColor?.(sector.id, color)}/>
                            <SectorLegendToggle sectorId={sector.id} />
                            {getConditionChips(sector.mappings.flatMap(mapping => mapping.airspaceCondition).filter((ac) => !!ac))}
                        </Stack>
                        <Typography variant="subtitle2">{sector.frequency}</Typography>
                    </>
                }/>
            ))}
        </FormGroup>
    );
}