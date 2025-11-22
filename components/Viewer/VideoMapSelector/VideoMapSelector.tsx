'use client';
import React, {SyntheticEvent, useContext} from 'react';
import {Autocomplete, Box, Chip, TextField, Typography} from "@mui/material";
import {getConditionChips} from "@/lib/chips";
import {AirspaceViewerDataContext} from "@/contexts/AirspaceViewerDataContext";
import {AirspaceViewerConfigContext} from "@/contexts/AirspaceViewerConfigContext";
import FacilityColorPicker from "@/components/Viewer/FacilitySelector/FacilityColorPicker";
import {VideoMapWithMappings} from "@/types/airspace_viewer";

export default function VideoMapSelector() {
    const allData = useContext(AirspaceViewerDataContext);
    const config = useContext(AirspaceViewerConfigContext);

    if (!allData || !config.data) {
        return <></>;
    }

    const activeVideoMaps = config.data.activeVideoMaps.sort((a, b) => b.order - a.order).sort((a, b) => a.order - b.order);
    const allVideoMaps = allData.allVideoMaps.sort((a, b) => a.order - b.order);

    const handleChange = (e: SyntheticEvent, v: VideoMapWithMappings[]) => {
        const newVideoMapIds = v.map(vm => vm.id);
        config.updateVideoMaps?.(newVideoMapIds);
    }

    return (
        (<Autocomplete
            multiple
            fullWidth
            options={allVideoMaps as VideoMapWithMappings[]}
            limitTags={3}
            renderTags={(values, getTagProps) => values.map((value, index) => (
                // eslint-disable-next-line react/jsx-key
                (<Chip label={<span>{value.name} <FacilityColorPicker
                    existingColor={config.data?.colorOverrides.find((c) => c.id === value.id)?.color || value.color}
                    onChange={(color) => config.updateMappingColor?.(value.id, color)}/></span>} {...getTagProps({index,})} />)
            ))}
            onChange={handleChange}
            value={activeVideoMaps as VideoMapWithMappings[]}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => <TextField {...params} label="Video Map(s)" variant="filled"/>}
            renderOption={(props, option: VideoMapWithMappings) => {
                const {key, ...optionProps} = props;
                return (
                    <Box
                        component="li"
                        key={key}
                        {...optionProps}>
                        <Typography sx={{mr: 1,}}>{option.name}</Typography>
                        {getConditionChips(option.mappings.flatMap(mapping => mapping.airspaceCondition).filter((ac) => !!ac))}
                    </Box>
                )
            }}
        />)
    );
}