'use client';
import React from 'react';
import {Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField} from "@mui/material";
import {AirspaceContainerWithConditions} from "@/components/Viewer/AirspaceViewer";
import {AirspaceCondition} from "@prisma/client";
import {toast} from "react-toastify";

export default function AirspaceConditionDialog({
                                                    open,
                                                    onClose,
                                                    containerOptions,
                                                    defaultSelectedContainer,
                                                    defaultSelectedCondition,
                                                    onSubmit
                                                }: {
    open: boolean,
    onClose: () => void,
    containerOptions: AirspaceContainerWithConditions[],
    defaultSelectedContainer?: AirspaceContainerWithConditions,
    defaultSelectedCondition?: AirspaceCondition,
    onSubmit: (conditionId: string) => void,
}) {

    const [selectedContainer, setSelectedContainer] = React.useState<AirspaceContainerWithConditions | null>(null);
    const [selectedCondition, setSelectedCondition] = React.useState<AirspaceCondition | null>(defaultSelectedCondition || null);

    const submit = () => {
        if ((!selectedContainer && !defaultSelectedContainer) || (!selectedCondition && !defaultSelectedCondition)) {
            toast.error('You must select a container and a condition.');
            return;
        }

        onSubmit(selectedCondition?.id || '');
        setSelectedContainer(null);
        setSelectedCondition(null);
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Set Airspace Condition</DialogTitle>
            <DialogContent>
                <Stack direction="column" spacing={2}>
                    <Autocomplete
                        disabled={!!defaultSelectedContainer}
                        options={containerOptions}
                        getOptionLabel={(option) => `${option.name}`}
                        onChange={(e, value) => {
                            setSelectedContainer(value);
                        }}
                        defaultValue={defaultSelectedContainer}
                        value={defaultSelectedContainer ?? selectedContainer}
                        renderInput={(params) => <TextField {...params} label="Airspace/Airport" variant="filled"/>}
                    />

                    <Autocomplete
                        options={(defaultSelectedContainer ?? selectedContainer)?.conditions || []}
                        disabled={!selectedContainer && !defaultSelectedContainer}
                        getOptionLabel={(option) => `${option.name}`}
                        onChange={(e, value) => {
                            setSelectedCondition(value);
                        }}
                        defaultValue={defaultSelectedCondition}
                        value={defaultSelectedCondition ?? selectedCondition}
                        renderInput={(params) => <TextField {...params}
                                                            helperText="You must select an option above first."
                                                            label="Condition" variant="filled"/>}
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="outlined" color="inherit">Cancel</Button>
                <Button onClick={submit} variant="contained">Save</Button>
            </DialogActions>
        </Dialog>
    );

}