'use client';
import React, {useState} from 'react';
import {Dialog, DialogContent, IconButton} from "@mui/material";
import {FormatColorReset, Palette} from "@mui/icons-material";
import {HexColorPicker} from "react-colorful";

export default function FacilityColorPicker({existingColor, onChange}: {
    existingColor?: string,
    onChange?: (color?: string) => void,
}) {

    const [open, setOpen] = useState(false);
    const [color, setColor] = useState<string | undefined>(existingColor);

    const handleColorChange = (newColor?: string) => {
        setColor(newColor);
        onChange?.(newColor);
    }

    return (
        <>
            <IconButton size="small" onClick={() => setOpen(true)}>
                <Palette fontSize="small" sx={{color: existingColor,}}/>
            </IconButton>
            <IconButton size="small" onClick={() => handleColorChange(undefined)}>
                <FormatColorReset fontSize="small"/>
            </IconButton>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogContent>
                    <HexColorPicker color={color} onChange={handleColorChange}/>
                </DialogContent>
            </Dialog>
        </>
    );
}