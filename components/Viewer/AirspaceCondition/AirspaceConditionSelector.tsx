'use client';
import React, {useContext, useState} from 'react';
import {Chip, Paper, Stack, Typography} from "@mui/material";
import AirspaceConditionAddButton from "@/components/Viewer/AirspaceCondition/AirspaceConditionAddButton";
import {AirspaceCondition} from "@prisma/client";
import AirspaceConditionDialog from "@/components/Viewer/AirspaceCondition/AirspaceConditionDialog";
import {AirspaceViewerConfigContext} from "@/contexts/AirspaceViewerConfigContext";
import {AirspaceViewerDataContext} from "@/contexts/AirspaceViewerDataContext";
import {AirspaceConditionWithContainer} from "@/types/airspace_viewer";

export default function AirspaceConditionSelector() {

    const config = useContext(AirspaceViewerConfigContext);
    const allData = useContext(AirspaceViewerDataContext);

    const [editOpen, setEditOpen] = useState(false);
    const [editCondition, setEditCondition] = useState<AirspaceConditionWithContainer | null>(null);

    if (!config.data || !allData) {
        return <></>;
    }

    const conditions = config.data.activeAirspaceConditions.sort((a, b) => a.container.order - b.container.order);
    const containers = allData.allAirspaceContainers.sort((a, b) => a.order - b.order);


    const deleteCondition = (condition: AirspaceCondition) => {
        const newConditionIds = conditions.filter(c => c.id !== condition.id).map((c) => c.id);
        config.updateConditions?.(newConditionIds);
    }

    const closeEdit = () => {
        setEditOpen(false);
        setEditCondition(null);
    }

    const submitEdit = (conditionId: string) => {
        const newConditionIds = conditions.map(c => c.id === (editCondition?.id || '') ? conditionId : c.id);
        config.updateConditions?.(newConditionIds);
        closeEdit();
    }

    const getContainer = (containerId?: string) => {
        const container = containers.find(c => c.id === containerId);
        if (!container) {
            return undefined;
        }
        return container;
    }

    return (
        <>
            <AirspaceConditionDialog open={editOpen} onClose={closeEdit} containerOptions={containers}
                                     defaultSelectedCondition={editCondition || undefined}
                                     defaultSelectedContainer={getContainer(editCondition?.containerId)}
                                     onSubmit={submitEdit}/>
            <Paper sx={{p: 0.5,}}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <AirspaceConditionAddButton/>
                    <Stack direction="row" spacing={1} sx={{overflowX: 'auto',}}>
                        {conditions.map(condition => (
                            <Chip key={condition.id}
                                  onClick={() => {
                                      setEditCondition(condition);
                                      setEditOpen(true);
                                  }}
                                  label={`${condition.container.name}/${condition.name}`}
                                  onDelete={() => deleteCondition(condition)}/>
                        ))}
                        {conditions.length === 0 &&
                            <Typography variant="subtitle1">Add airspace conditions here.</Typography>}
                    </Stack>
                </Stack>
            </Paper>
        </>


    );
}