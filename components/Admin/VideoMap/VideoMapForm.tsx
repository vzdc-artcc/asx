'use client';
import {VideoMap} from "@prisma/client";
import Form from "next/form"
import FormSaveButton from "../Form/FormSaveButton";
import {Checkbox, FormControlLabel, TextField} from "@mui/material";
import {createOrUpdateVideoMap} from "@/actions/videoMap";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";

export default function VideoMapForm({ videoMap }: { videoMap?: VideoMap, }) {

    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        const { errors, videoMap: newVm } = await createOrUpdateVideoMap(formData);

        if (errors) {
            toast.error(errors.map(e => e.message).join('. '));
            return;    
        }

        toast.success(`Video map ${videoMap ? 'updated' : 'created'}.`);
        if (!videoMap) {
            router.push(`/admin/video-maps/${newVm.id}`);
        }
    }

    return (
        <Form action={handleSubmit}>
            <input type="hidden" name="id" value={videoMap?.id || ''} />
            <TextField name="name" label="Name *" variant="filled" defaultValue={videoMap?.name} fullWidth sx={{ mb: 2, }} />
            <TextField name="color" label="Color *" variant="filled" defaultValue={videoMap?.color} fullWidth
                       sx={{mb: 2,}}/>
            <FormControlLabel control={<Checkbox defaultChecked={videoMap?.defaultEnabled} name="defaultEnabled"/>}
                              label="Enabled by default?"/>
            <br/>
            <FormSaveButton />
        </Form>
    );

}