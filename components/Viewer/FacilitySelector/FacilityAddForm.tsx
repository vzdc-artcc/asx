'use client';
import React, {SyntheticEvent, useContext, useState} from 'react';
import {RadarFacility} from "@prisma/client";
import {Autocomplete, Box, IconButton, Stack, TextField,} from "@mui/material";
import Form from "next/form";
import {Add} from "@mui/icons-material";
import {toast} from "react-toastify";
import {AirspaceViewerDataContext} from "@/contexts/AirspaceViewerDataContext";
import {AirspaceViewerConfigContext} from "@/contexts/AirspaceViewerConfigContext";

export default function FacilityAddForm({onSubmit}: {
    onSubmit: (facilityId: string) => void,
}) {

    const [selectedFacility, setSelectedFacility] = useState<RadarFacility | null>(null);

    const allData = useContext(AirspaceViewerDataContext);
    const config = useContext(AirspaceViewerConfigContext);

    if (!config?.data || !allData) {
        return <></>
    }

    const activeFacilities = config.data.activeFacilities;
    const availableFacilities = allData.allRadarFacilities.filter(facility =>
        !activeFacilities.some(active => active.id === facility.id)
    );

    const handleChange = (event: SyntheticEvent, value: RadarFacility | null) => {
        setSelectedFacility(value);
    }

    const handleSubmit = () => {
        if (!selectedFacility || !availableFacilities.flatMap((f) => f.id).includes(selectedFacility.id)) {
            toast.error('You must select a valid facility.');
            return;
        }

        onSubmit(selectedFacility.id);
        // toast.success(`${selectedFacility.name} added to explorer!`);
        setSelectedFacility(null);
    }

    return (
        <Form action={handleSubmit}>
            <Stack direction="row" spacing={1} alignItems="center">
                <Autocomplete
                    size="small"
                    disabled={availableFacilities.length === 0}
                    fullWidth
                    options={availableFacilities}
                    onChange={handleChange}
                    value={selectedFacility}
                    getOptionLabel={(option) => option.name}
                    renderInput={(params) => <TextField {...params} label="Add Facility" variant="outlined"/>}
                />
                <Box>
                    <IconButton onClick={handleSubmit} disabled={availableFacilities.length === 0}>
                        <Add/>
                    </IconButton>
                </Box>
            </Stack>
        </Form>

    );

}