'use client';
import React, {useContext, useState} from 'react';
import {AirspaceViewerConfigContext, AirspaceViewerData} from "@/contexts/AirspaceViewerConfigContext";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Tooltip,
    Typography
} from "@mui/material";
import {Download, ImportExport, Upload} from "@mui/icons-material";
import {toast} from "react-toastify";

export default function ConfigImportExportButton() {

    const config = useContext(AirspaceViewerConfigContext);
    const [open, setOpen] = useState(false);
    const [configText, setConfigText] = useState('');
    const [loading, setLoading] = useState(false);

    if (!config.data) {
        return <></>;
    }

    const downloadConfig = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config.data));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "vzdc_asx_map_settings.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    const importConfig = () => {
        if (!configText) {
            toast.error('No configuration data to import. Please select a valid file.');
            return;
        }
        setLoading(true);
        try {
            config.updateConfig?.(configText as unknown as AirspaceViewerData);
            toast.success('Map settings imported successfully!');
            setOpen(false);
        } catch {
            toast.error('Failed to import map settings. Please check the file and try again.');
        }
        setLoading(false);
    }

    return (
        <>
            <Tooltip title="Import/Export Map Settings">
                <IconButton onClick={() => setOpen(true)}>
                    <ImportExport/>
                </IconButton>
            </Tooltip>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Import/Export Current Map Settings</DialogTitle>
                <DialogContent>
                    <Typography fontWeight="bold" gutterBottom>Export</Typography>
                    <Button variant="contained" size="large" onClick={downloadConfig} startIcon={<Download/>}>Download
                        Map Settings</Button>
                    <br/>
                    <Typography variant="caption">There is no guarantee that the export will last for a long time. Any
                        changes to the facilities, video maps, sectors, airspace conditions, and IDS real time
                        consolidations can and most probably will break file.</Typography>
                    <Divider sx={{my: 2,}}/>
                    <Typography fontWeight="bold" gutterBottom>Import</Typography>
                    <input type="file" accept=".json" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                                try {
                                    const importedConfig = JSON.parse(event.target?.result as string);
                                    setConfigText(importedConfig);
                                } catch {
                                    toast.error('Invalid JSON file. Please try again.');
                                }
                            };
                            reader.readAsText(file);
                        }
                    }}/>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" size="small" onClick={importConfig} disabled={loading}
                            startIcon={<Upload/>}>Import</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}