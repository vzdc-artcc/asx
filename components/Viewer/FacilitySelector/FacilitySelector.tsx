'use client';
import React, {useContext} from 'react';
import {Box, Divider, Typography} from "@mui/material";
import FacilityAddForm from "@/components/Viewer/FacilitySelector/FacilityAddForm";
import FacilityAccordion from "@/components/Viewer/FacilitySelector/FacilityAccordion";
import {AirspaceViewerDataContext} from "@/contexts/AirspaceViewerDataContext";
import {AirspaceViewerConfigContext} from "@/contexts/AirspaceViewerConfigContext";

export default function FacilitySelector() {

    const allData = useContext(AirspaceViewerDataContext);
    const config = useContext(AirspaceViewerConfigContext);

    if (!config?.data || !allData) {
        return <></>
    }

    const activeFacilities = config.data.activeFacilities;

    const onAddFacility = (facilityId: string) => {
        const newFacilityIds = [...activeFacilities.map(f => f.id), facilityId];
        config.updateFacilities?.(newFacilityIds);
        // const facility = allFacilities.find(facility => facility.id === facilityId);
        // toast.success(`${facility?.name} added to explorer!`);
    }

    const onDeleteFacility = (facilityId: string) => {
        const newFacilityIds = activeFacilities
            .map(f => f.id)
            .filter(id => id !== facilityId);
        config.updateFacilities?.(newFacilityIds);
        // const facility = allFacilities.find(facility => facility.id === facilityId);
        // toast.info(`${facility?.name} removed from explorer.`);
    }

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>
            {!config.data?.liveConsolidations && <>
                <FacilityAddForm onSubmit={onAddFacility}/>
                <Divider sx={{my: 2,}}/>
            </>}
            <Typography variant="subtitle2" textAlign="center"
                        gutterBottom>{config.data?.liveConsolidations ? 'Online' : 'Selected'} Facilities</Typography>
            {activeFacilities.length === 0 &&
                <Typography variant="subtitle1" textAlign="center">No
                    facilities {config.data.liveConsolidations ? 'online' : 'selected'}</Typography>}
            <Box sx={{flex: 1, overflow: 'auto'}}>
                {activeFacilities.map(facility => (
                    <FacilityAccordion key={facility.id} facility={facility} onDelete={onDeleteFacility}
                                       disableDelete={!!config.data?.liveConsolidations}/>
                ))}
            </Box>
        </Box>
    );
}