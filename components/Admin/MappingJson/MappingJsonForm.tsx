'use client';
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import {AirspaceCondition, AirspaceConditionContainer, MappingJson, SectorMapping, VideoMap} from "@/generated/prisma/browser";
import Form from "next/form";
import {useState} from "react";
import FormSaveButton from "../Form/FormSaveButton";
import {toast} from "react-toastify";
import {updateSectorMappingJsons} from "@/actions/sectorMapping";
import {updateVideoMapJsons} from "@/actions/videoMap";

export type AirspaceConditionWithContainer = AirspaceCondition & { container: AirspaceConditionContainer };
export type MappingJsonWithCondition = MappingJson & { airspaceCondition?: AirspaceConditionWithContainer };

export type NewMapping = {
    airspaceConditionId?: string;
    videoMapId?: string;
    sectorMappingId?: string;
    file: File;
};

export default function MappingJsonForm({parent, mappings: existingMappings = [], allConditions}: {
    parent: VideoMap | SectorMapping,
    mappings?: MappingJsonWithCondition[],
    allConditions: AirspaceConditionWithContainer[],
}) {

    const [mappings, setMappings] = useState<MappingJsonWithCondition[]>(existingMappings);
    const [newMappings, setNewMappings] = useState<NewMapping[]>([]);

    const [selectedCondition, setSelectedCondition] = useState<AirspaceConditionWithContainer | null>(null);

    const addNewMapping = async (formData: FormData) => {
        const airspaceConditionId = selectedCondition?.id;
        let videoMapId;
        let sectorMappingId;

        if ('idsRadarSectorId' in parent) {
            sectorMappingId = parent.id;
        } else {
            videoMapId = parent.id;
        }

        const file = formData.get('file') as File;

        if (!selectedCondition) {
            setMappings([]);
            setNewMappings([{airspaceConditionId, videoMapId, sectorMappingId, file}]);

            toast.warning('All existing mappings deleted.');
        } else {
            setNewMappings([...newMappings, {airspaceConditionId, videoMapId, sectorMappingId, file}]);
        }

        toast.success('New mapping added. Make sure to save your changes at the end.');

        setSelectedCondition(null);
    }

    const submitChanges = async () => {
        const isSectorMapping = 'idsRadarSectorId' in parent;

        const conditionIds = mappings.map(m => m.airspaceConditionId);
        const newConditionIds = newMappings.map(m => m.airspaceConditionId);

        if (newConditionIds.some(id => conditionIds.includes(id || null))) {
            toast.error('You have added a condition that already exists in the mappings.  Please remove the duplicates.');
            return;
        }

        if (isSectorMapping) {
            await submitSectorMappingChanges();
        } else {
            await submitVideoMapChanges();
        }
    }

    const submitSectorMappingChanges = async () => {
        const mappingsToDelete = existingMappings.map(m => m.id).filter(id => !mappings.find(m => m.id === id));

        const res = await updateSectorMappingJsons(mappingsToDelete, newMappings);

        if (res) {
            toast.success('Changes saved.');

            setNewMappings([]);
            window.location.reload();
        } else {
            toast.error('There was an error saving the changes.');
        }
    }

    const submitVideoMapChanges = async () => {
        const mappingsToDelete = existingMappings.map(m => m.id).filter(id => !mappings.find(m => m.id === id));

        const res = await updateVideoMapJsons(mappingsToDelete, newMappings);

        if (res) {
            toast.success('Changes saved.');

            setNewMappings([]);
            window.location.reload();
        } else {
            toast.error('There was an error saving the changes.');
        }
    }

    return (
        <Stack direction="column" spacing={1}>
            {mappings.map(mapping => (
                <Card key={mapping.id} variant="outlined">
                    <CardContent>
                        <Typography variant="h6">{mapping.jsonKey}</Typography>
                        {mapping.airspaceCondition ?
                            <Typography>Condition: {mapping.airspaceCondition.container.name}/{mapping.airspaceCondition.name}</Typography> :
                            <Typography>Condition: N/A</Typography>}
                    </CardContent>
                    <CardActions>
                        <Button variant="outlined" color="inherit" onClick={() => {
                            setMappings(mappings.filter(m => m.id !== mapping.id));
                            toast.success('Mapping removed');
                        }}>Delete</Button>
                    </CardActions>
                </Card>
            ))}
            {newMappings.map((mapping, index) => (
                <Card key={index} variant="outlined">
                    <CardContent>
                        <Typography variant="h6">NEW - File Upload</Typography>
                        {mapping.airspaceConditionId ?
                            <Typography>Condition: {allConditions.find(c => c.id === mapping.airspaceConditionId)?.container.name}/{allConditions.find(c => c.id === mapping.airspaceConditionId)?.name}</Typography> :
                            <Typography>Condition: N/A</Typography>}
                    </CardContent>
                    <CardActions>
                    <Button variant="outlined" color="inherit" onClick={() => {
                        setNewMappings(newMappings.filter((_, i) => i !== index));
                        toast.success('Mapping removed');
                    }}>Delete</Button>
                    </CardActions>
                </Card>
            ))}
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6">New Mapping</Typography>
                    <Form action={addNewMapping}>
                        <Stack direction="column" spacing={1}>
                            <Typography variant="subtitle2">JSON file</Typography>
                            <input type="hidden" name="parentId" value={parent.id} />
                            <input type="file" name="file" accept=".json,.geojson"/>
                            <Autocomplete 
                                options={allConditions}
                                getOptionLabel={(option) => `${option.container.name}/${option.name}`}
                                onChange={(e, value) => {
                                    setSelectedCondition(value);
                                }}
                                value={selectedCondition}
                                renderInput={(params) => <TextField {...params} label="Condition (optional)" variant="filled" />}
                            />
                            { !selectedCondition && <Alert severity="warning">You have not selected a condition for this mapping.  This will delete all the other new and existing mappings.</Alert> }
                            <Box>
                                <FormSaveButton />
                            </Box>
                        </Stack>
                    </Form>
                </CardContent>
            </Card>
            <Button variant="contained" size="large" onClick={submitChanges}>Submit Changes</Button>
        </Stack>
    )
}