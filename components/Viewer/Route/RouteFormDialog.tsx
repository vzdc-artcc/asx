'use client';
import React, {useContext, useEffect, useState} from 'react';
import {AirspaceViewerConfigContext} from "@/contexts/AirspaceViewerConfigContext";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@mui/material";
import {Add, Edit} from "@mui/icons-material";
import {toast} from "react-toastify";
import {fetchRouteCoordinates} from "@/actions/route";
import {RouteDisplayData} from "@/types/route";

type Props = {
    open: boolean;
    onClose: () => void;
    editRoute?: RouteDisplayData;
};

export default function RouteFormDialog({ open, onClose, editRoute }: Props) {
    const config = useContext(AirspaceViewerConfigContext);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [routeString, setRouteString] = useState('');
    const isEdit = !!editRoute;

    useEffect(() => {
        if (open) {
            setName(editRoute?.name ?? '');
            setRouteString(editRoute?.routeString ?? '');
        }
    }, [open, editRoute]);

    const handleSubmit = async () => {
        if (routeString.trim() === '' || name.trim() === '') {
            toast.error("Route name and route string cannot be empty.");
            return;
        }

        const duplicate = config.data?.routes.find(
            (r) => r.routeString === routeString.trim() && r.id !== editRoute?.id
        );
        if (duplicate) {
            toast.error("This route already exists.");
            return;
        }

        const shouldFetch = !isEdit || routeString.trim() !== editRoute!.routeString;
        let coordinates = editRoute?.coordinates ?? [];

        if (shouldFetch) {
            setLoading(true);
            const result = await fetchRouteCoordinates(routeString.trim().toUpperCase());

            if (typeof result === 'string') {
                toast.error(`Error ${isEdit ? 'updating' : 'adding'} route: ${result}`);
                setLoading(false);
                return;
            }

            if (result.length === 0) {
                toast.error("No coordinates found for the provided route string.");
                setLoading(false);
                return;
            }

            coordinates = result;
        }

        if (isEdit) {
            const updatedRoutes = config.data?.routes.map((route) =>
                route.id === editRoute!.id
                    ? { ...route, name: name.trim(), routeString: routeString.trim(), coordinates }
                    : route
            ) || [];
            config.updateRoutes?.(updatedRoutes);
            toast.success("Route updated successfully!");
        } else {
            const newRoutes = [
                ...config.data?.routes || [],
                {
                    id: Date.now().toString(),
                    name: name.trim(),
                    routeString: routeString.trim(),
                    coordinates,
                    displayed: true,
                    showLabels: false,
                }
            ];
            config.updateRoutes?.(newRoutes);
            toast.success("Route added successfully!");
        }

        setLoading(false);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{isEdit ? 'Edit' : 'Add'} Route/Point</DialogTitle>
            <DialogContent>
                <TextField disabled={loading} variant="filled" label="Route Name" required fullWidth value={name} onChange={(e) => setName(e.target.value)} sx={{mb: 2}} />
                <TextField disabled={loading} variant="filled" label="Route/Point String" required fullWidth value={routeString} onChange={(e) => setRouteString(e.target.value)}
                helperText="FAA ONLY.  Airports must be in ICAO format and FRDs are supported.  SIDs and STARs are supported only if the departure and destination airport are included.  For example, KIAD JCOBY4... OR ...ALDAN4 KRDU.  SIDs and STARs are only processed until they diverge based on configuration, if applicable." />
            </DialogContent>
            <DialogActions>
                <Button color="inherit" size="small" onClick={onClose} disabled={loading}>Close</Button>
                <Button size="small" variant="contained" startIcon={isEdit ? <Edit /> : <Add />} onClick={handleSubmit} disabled={loading}>{isEdit ? 'Save' : 'Add'}</Button>
            </DialogActions>
        </Dialog>
    );
}
