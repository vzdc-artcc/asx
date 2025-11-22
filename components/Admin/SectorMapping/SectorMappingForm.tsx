'use client';
import {Box, Stack, TextField} from "@mui/material";
import {RadarFacility, SectorMapping} from "@prisma/client";
import Form from "next/form";
import FormSaveButton from "../Form/FormSaveButton";
import {createOrUpdateSectorMapping} from "@/actions/sectorMapping";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";

export default function SectorMappingForm({ radarFacility, sectorMapping }: { radarFacility: RadarFacility, sectorMapping?: SectorMapping }) {

    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        const { errors, sectorMapping: newSectorMapping } = await createOrUpdateSectorMapping(formData);

        if (errors) {
            toast.error(errors.map(e => e.message).join('. '));
            return;
        }

        toast.success(`Sector mapping ${sectorMapping ? 'updated' : 'created'}.`);
        if (!sectorMapping) {
            router.push(`/admin/facilities/${radarFacility.id}/sectors/${newSectorMapping.id}`);
        }
    }

    return (
        <Form action={handleSubmit}>
            <input type="hidden" name="id" value={sectorMapping?.id || ''} />
            <input type="hidden" name="radarFacilityId" value={radarFacility.id} />
            <Stack direction="column" spacing={2}>
                <TextField name="name" label="Name *" variant="filled" defaultValue={sectorMapping?.name} fullWidth />
                <TextField name="frequency" label="Frequency *" variant="filled" defaultValue={sectorMapping?.frequency}
                           fullWidth/>
                <TextField name="explorerColor" label="Airspace Explorer Color *" variant="filled"
                           defaultValue={sectorMapping?.explorerColor}
                           fullWidth/>
                <TextField name="consolidationColor" label="Live Consolidation Color *" variant="filled"
                           defaultValue={sectorMapping?.consolidationColor}
                           fullWidth/>
                <TextField name="idsRadarSectorId"
                           helperText="This will be used for radar consolidations.  The ID will be located in the URL and in the Edit window of each sector: /admin/radars/<RADAR FACILITY>/sectors/<SECTOR ID>"
                           label="IDS Radar Sector ID *" placeholder="This must be EXACTLY the ID displayed in the IDS."
                           variant="filled" defaultValue={sectorMapping?.idsRadarSectorId || ''} fullWidth/>
                <Box>
                    <FormSaveButton />
                </Box>
            </Stack>
        </Form>
    );
    
}