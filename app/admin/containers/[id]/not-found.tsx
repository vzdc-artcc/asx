import {Stack, Typography} from "@mui/material";
import {Info} from "@mui/icons-material";

export default function NotFound() {
    return (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Info color="error"/>
            <Typography>Airspace container not found.</Typography>
        </Stack>
    );
}