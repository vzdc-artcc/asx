'use client';
import {Box, Stack, TextField} from "@mui/material";
import Form from "next/form";
import FormSaveButton from "../Form/FormSaveButton";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";
import {AirspaceCondition, AirspaceConditionContainer} from "@/generated/prisma/browser";
import {createOrUpdateAirspaceContainer} from "@/actions/airspace";

export default function AirspaceContainerForm({container, conditions = [],}: {
    container?: AirspaceConditionContainer,
    conditions?: AirspaceCondition[],
}) {

    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {

        const {errors,} = await createOrUpdateAirspaceContainer(formData);

        if (errors) {
            toast.error(errors.map(e => e.message).join('. '));
            return;
        }

        toast.success(`Airport ${container ? 'updated' : 'created'}.`);
        if (!container) {
            router.push('/admin/containers');
        }
    }

    return (
        <Form action={handleSubmit}>
            <input type="hidden" name="id" value={container?.id || ''}/>
            <Stack direction="column" spacing={2}>
                <TextField name="name" label="Name *" variant="filled" defaultValue={container?.name} fullWidth/>
                <TextField name="conditions" label="Conditions *" placeholder="Seperate with a comma (,)" variant="filled" defaultValue={conditions.map(c => c.name).join(',')} fullWidth />
                <Box>
                    <FormSaveButton />
                </Box>
            </Stack>
        </Form>
    )
}