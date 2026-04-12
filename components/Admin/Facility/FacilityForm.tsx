'use client';
import {Checkbox, FormControlLabel, TextField} from "@mui/material";
import {RadarFacility} from "@/generated/prisma/browser";
import Form from "next/form";
import FormSaveButton from "../Form/FormSaveButton";
import {createOrUpdateFacility} from "@/actions/facility";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";

export default function FacilityForm({ facility }: { facility?: RadarFacility, }) {

    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        const { errors, facility: newFacility } = await createOrUpdateFacility(formData);

        if (errors) {
            toast.error(errors.map(e => e.message).join('. '));
            return;
        }

        toast.success(`Facility ${facility ? 'updated' : 'created'}.`);
        if (!facility) {
            router.push(`/admin/facilities/${newFacility.id}/sectors`);
        }

    }

    return (
        <Form action={handleSubmit}>
            <input type="hidden" value={facility?.id} name="id" />
            <TextField name="name" label="Name *" variant="filled" defaultValue={facility?.name} fullWidth sx={{ mb: 2, }} />
            <FormControlLabel control={<Checkbox defaultChecked={facility?.autoSelectActiveConsolidations}
                                                 name="autoSelectActiveConsolidations"/>}
                              label="Default all selected in active consolidations?"/>
            <TextField name="ids" placeholder="This must be EXACTLY the ID displayed in the IDS."
                       label="I.D.S. Radar Facility I.D." variant="filled" disabled={!!facility} fullWidth sx={{mb: 2,}}
                       helperText="If you provide a VALID I.D.S. Radar facility ID, the system will automatically create all the sectors for you.  It will NOT upload any JSON files though.  The ID is located on the radar facility edit page on the I.D.S for the desired facility."/>
            <FormSaveButton />
        </Form>
    )

}