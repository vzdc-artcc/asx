'use client';
import React, {useContext, useState} from 'react';
import {IconButton, Tooltip} from "@mui/material";
import {Add} from "@mui/icons-material";
import AirspaceConditionDialog from "@/components/Viewer/AirspaceCondition/AirspaceConditionDialog";
import {AirspaceViewerDataContext} from "@/contexts/AirspaceViewerDataContext";
import {AirspaceViewerConfigContext} from "@/contexts/AirspaceViewerConfigContext";

export default function AirspaceConditionAddButton() {

    const allData = useContext(AirspaceViewerDataContext);
    const config = useContext(AirspaceViewerConfigContext);
    const [open, setOpen] = useState(false);

    if (!allData || !config.data) {
        return <></>;
    }

    const allContainers = allData.allAirspaceContainers;
    const conditions = config.data.activeAirspaceConditions;
    const activeConditionIds = conditions.map(condition => condition.id);

    const conditionedAirports = allContainers.flatMap(container => container.conditions).filter(condition => activeConditionIds.includes(condition.id));

    const disabled = conditionedAirports.length === allContainers.length;

    const submit = (conditionId: string) => {
        const newConditionIds = [...activeConditionIds, conditionId];
        config.updateConditions?.(newConditionIds);
        close();
    }

    const close = () => {
        setOpen(false);
    }

    return (
        <>
            <Tooltip title="Add Airport Condition">
                <IconButton onClick={() => setOpen(true)} disabled={disabled}>
                    <Add/>
                </IconButton>
            </Tooltip>
            <AirspaceConditionDialog open={open} onClose={close}
                                     containerOptions={allContainers.filter(container => !conditionedAirports.some(condition => condition.containerId === container.id))}
                                     onSubmit={submit}/>
        </>
    );
}