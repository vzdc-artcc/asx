import React from 'react';
import {CircularProgress, Stack} from "@mui/material";

export default function Loading() {
    return (
        <Stack direction="row" sx={{ justifyContent: 'center' }}>
            <CircularProgress size={80}/>
        </Stack>
    );
}