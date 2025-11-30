'use client';
import React, {useContext, useState} from 'react';
import {AirspaceViewerConfigContext} from "@/contexts/AirspaceViewerConfigContext";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@mui/material";
import {Add} from "@mui/icons-material";
import {toast} from "react-toastify";
import {fetchRouteCoordinates} from "@/actions/route";

export default function RouteAddForm() {

    const config = useContext(AirspaceViewerConfigContext);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [routeString, setRouteString] = useState('');

    const handleAddRoute = async () => {
        if (routeString.trim() === '' || name.trim() === '') {
            toast.error("Route string cannot be empty.");
            return;
        }

        if (config.data?.routes.find((r) => r.routeString === routeString.trim())) {
            toast.error("This route already exists.");
            return;
        }

        setLoading(true)
        const routeCoordinates = await fetchRouteCoordinates(routeString.trim().toUpperCase());

        if (typeof routeCoordinates === 'string') {
            toast.error(`Error adding route: ${routeCoordinates}`);
            setLoading(false);
            return;
        }

        if (routeCoordinates.length === 0) {
            toast.error("No coordinates found for the provided route string.");
            setLoading(false);
            return;
        }

        const newRoutes = [
            ...config.data?.routes || [],
            {
                id: Date.now().toString(),
                name: name.trim(),
                routeString: routeString.trim(),
                coordinates: routeCoordinates,
                displayed: true,
                showLabels: false,
            }
        ]

        config.updateRoutes?.(newRoutes);
        setName('');
        setRouteString('');
        setOpen(false);
        setLoading(false);
        toast.success("Route added successfully!");
    }
    return (
        <>
            <Button variant="contained" size="small" startIcon={<Add />} sx={{ width: '100%', }} onClick={() => setOpen(true)}>Add Route/Point</Button>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Add Route/Point</DialogTitle>
                <DialogContent>
                    <TextField disabled={loading} variant="filled" label="Route Name" required fullWidth value={name} onChange={(e) => setName(e.target.value)} sx={{mb: 2,}} />
                    <TextField disabled={loading} variant="filled" label="Route/Point String" required fullWidth value={routeString} onChange={(e) => setRouteString(e.target.value)}
                    helperText="FAA ONLY.  Airports must be in ICAO format and FRDs are supported.  SIDs and STARs are supported only if the departure and destination airport are included.  For example, KIAD JCOBY4... OR ...ALDAN4 KRDU.  SIDs and STARs are only processed until they diverge based on configuration, if applicable." />
                </DialogContent>
                <DialogActions>
                    <Button color="inherit" size="small" disabled={loading}>Close</Button>
                    <Button size="small" variant="contained" startIcon={<Add />} onClick={handleAddRoute} disabled={loading}>Add</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}