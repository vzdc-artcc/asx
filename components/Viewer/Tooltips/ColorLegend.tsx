'use client';
import React from 'react';
import {Box, Paper, Stack, Typography} from "@mui/material";

function ColorLegend({colorLegend}: { colorLegend: { color: string, name: string, frequency: string, }[], }) {

    if (colorLegend.length === 0) return <></>;

    return (
        <Paper
            sx={{
                minWidth: "1vw",
                maxWidth: "350px",
                minHeight: "1vw",
                maxHeight: "500px",
                position: "absolute",
                left: 0,
                bottom: 0,
                zIndex: 999,
                m: 2,
                mb: 4,
                p: 2,
            }}
        >
            <Typography variant="subtitle2" sx={{ textAlign: 'center' }} gutterBottom>Active Positions</Typography>
            {colorLegend.map((c, idx) => (
                <Stack key={idx} direction="row" spacing={2} sx={{mt: 1, alignItems: 'center'}}>
                    <Paper style={{background: c.color, width: '20px', height: '20px',}}></Paper>
                    <Box>
                        <Typography variant="body2">{c.name}</Typography>
                        <Typography variant="subtitle2">{c.frequency}</Typography>
                    </Box>

                </Stack>
            ))}
        </Paper>
    );
}

export default ColorLegend;