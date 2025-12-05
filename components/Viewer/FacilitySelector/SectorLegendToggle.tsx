'use client';
import React, {useContext} from 'react';
import {IconButton} from "@mui/material";
import {SpeakerNotes, SpeakerNotesOff} from "@mui/icons-material";
import {AirspaceViewerConfigContext} from "@/contexts/AirspaceViewerConfigContext";

function SectorLegendToggle({ sectorId }: { sectorId: string }) {

    const config = useContext(AirspaceViewerConfigContext);

    const handleToggleLegend = () => {

        const legendIds = config.data?.legendIds || [];
        if (legendIds.includes(sectorId)) {
            const newLegendIds = legendIds.filter(id => id !== sectorId);
            config.updateLegends?.(newLegendIds);
        } else {
            const newLegendIds = [...legendIds, sectorId];
            config.updateLegends?.(newLegendIds);
        }
    }

    return (
        <IconButton onClick={handleToggleLegend} size="small">
            {(config.data?.legendIds || []).includes(sectorId) ? <SpeakerNotesOff fontSize="small"/> :
                <SpeakerNotes fontSize="small"/>}
        </IconButton>
    );
}

export default SectorLegendToggle;