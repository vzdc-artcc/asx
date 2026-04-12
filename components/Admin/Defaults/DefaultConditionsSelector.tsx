'use client';
import React from 'react';
import {AirspaceCondition, AirspaceConditionContainer} from "@/generated/prisma/browser";
import Form from "next/form";
import FormSaveButton from "@/components/Admin/Form/FormSaveButton";
import {Autocomplete, TextField} from "@mui/material";
import {updateDefaults} from "@/actions/defaults";
import {toast} from "react-toastify";

type ConditionWithContainer = AirspaceCondition & { container: AirspaceConditionContainer };

export default function DefaultConditionsSelector({active, allConditions}: {
    active: ConditionWithContainer[],
    allConditions: ConditionWithContainer[],
}) {

    const [conditions, setConditions] = React.useState<ConditionWithContainer[]>(active);

    const handleSubmit = async () => {

        const containerIds = conditions.map((c) => c.container.id);
        const uniqueContainerIds = [...new Set(containerIds)];
        if (containerIds.length !== uniqueContainerIds.length) {
            toast.error('You cannot have multiple conditions for the same container.');
            return;
        }

        const ids = conditions.map((c) => c.id);

        await updateDefaults(ids);

        toast.success('Default conditions updated successfully.');
    }

    return (
        <Form action={handleSubmit}>
            <Autocomplete
                options={allConditions}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                value={conditions}
                multiple
                getOptionLabel={(option) => `${option.container.name}/${option.name}`}
                renderInput={(params) => <TextField {...params} label="Airspace Condition(s)" variant="filled"/>}
                onChange={(event, newValue) => setConditions(newValue)}
                sx={{mb: 2,}}
            />
            <FormSaveButton/>
        </Form>
    );
}