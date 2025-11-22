import {Chip} from "@mui/material";
import React from "react";
import {AirspaceConditionWithContainer} from "@/types/airspace_viewer";

export const getConditionChips = (conditions: AirspaceConditionWithContainer[]) => {
    const containers = conditions.map(condition => condition.container);
    const uniqueContainerNames = Array.from(new Set(containers.map(container => container.name)));
    return uniqueContainerNames.map((name, idx) => (
        <Chip key={idx} color="primary" size="small" label={name}/>
));
}