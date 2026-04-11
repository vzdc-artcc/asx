'use client';
import React, {useState} from 'react';
import {Button} from "@mui/material";
import {Add} from "@mui/icons-material";
import RouteFormDialog from "@/components/Viewer/Route/RouteFormDialog";

export default function RouteAddForm() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button variant="contained" size="small" startIcon={<Add />} sx={{ width: '100%' }} onClick={() => setOpen(true)}>Add Route/Point</Button>
            <RouteFormDialog open={open} onClose={() => setOpen(false)} />
        </>
    );
}
