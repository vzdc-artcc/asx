'use client';
import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {Box, Dialog, DialogContent, IconButton, Stack, TextField, Tooltip} from "@mui/material";
import {FormatColorReset, Palette} from "@mui/icons-material";
import {HexColorPicker} from "react-colorful";
import {AirspaceViewerConfigContext} from "@/contexts/AirspaceViewerConfigContext";
import {useDebounce} from "use-debounce";

const DEFAULT_COLOR_OPTIONS = [
    // create hex colors for red, green, blue, yellow, orange, purple, pink, brown, gray, black, white
    '#FF0000',
    '#00FF00',
    '#0000FF',
    '#FFFF00',
    '#FFA500',
    '#A52A2A',
    '#000000',
    '#FFFFFF',
    '#00FFFF',
    '#FF00FF',
];

export default function FacilityColorPicker({existingColor, onChange}: {
    existingColor?: string,
    onChange?: (color?: string) => void,
}) {

    const config = useContext(AirspaceViewerConfigContext);
    const [open, setOpen] = useState(false);
    const [color, setColor] = useState<string | undefined>(existingColor);
    const [debouncedColor] = useDebounce(color, 250);

    const manuallySetColors = useMemo(() => {
        const arr = config.data?.colorOverrides?.map((co) => co.color) || [];
        return Array.from(new Set([...arr, ...DEFAULT_COLOR_OPTIONS]));
    }, [config.data?.colorOverrides]);

    const handleColorChange = (newColor?: string) => {
        setColor(newColor);
    };

    const onChangeRef = useRef(onChange);
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        if (!debouncedColor || /^#([0-9A-F]{3}){1,2}$/i.test(debouncedColor || '')) {
            onChangeRef.current?.(debouncedColor);
        }
    }, [debouncedColor]);

    return (
        <>
            <IconButton size="small" onClick={() => setOpen(true)}>
                <Palette fontSize="small" sx={{color: existingColor,}}/>
            </IconButton>
            <Tooltip title="Reset Color">
                <IconButton size="small" onClick={() => handleColorChange(undefined)}>
                    <FormatColorReset fontSize="small"/>
                </IconButton>
            </Tooltip>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
                <DialogContent>
                    <Stack direction="column" spacing={2} alignItems="center">
                        <HexColorPicker color={color || existingColor} onChange={handleColorChange}/>
                        <Stack direction="row" spacing={1} sx={{overflowX: 'auto', width: '100%', pb: 0.5,}}>
                            {manuallySetColors.map((color, i) => (
                                <Tooltip key={i} title={color}>
                                    <Box style={{
                                        backgroundColor: color,
                                        border: 'none',
                                        padding: '8px',
                                        borderRadius: 3,
                                        cursor: 'pointer'
                                    }} onClick={() => handleColorChange(color)}></Box>
                                </Tooltip>
                            ))}
                        </Stack>
                        <TextField fullWidth size="small" label="HEX Color" placeholder="#FFFFFF"
                                   value={color || existingColor} onChange={(e) => handleColorChange(e.target.value)}/>
                    </Stack>
                </DialogContent>
            </Dialog>
        </>
    );
}