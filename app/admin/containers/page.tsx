import AirspaceContainerTable from "@/components/Admin/AirspaceContainer/AirspaceContainerTable";
import {Add, Reorder} from "@mui/icons-material";
import {Box, Button, Card, CardContent, Stack, Typography} from "@mui/material";
import Link from "next/link";

export default async function Page() {

    return (
        <Card>
            <CardContent>
                <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="h5">Airspace Condition Containers</Typography>
                    <Box>
                        <Link href="/admin/order/containers" style={{color: 'inherit',}}>
                            <Button variant="outlined" color="inherit" size="small" startIcon={<Reorder/>}
                                    sx={{mr: 1,}}>Order</Button>
                        </Link>
                        <Link href="/admin/containers/new">
                            <Button variant="contained" startIcon={<Add/>}>New Airspace Condition Container</Button>
                        </Link>
                    </Box>
                </Stack>
                <AirspaceContainerTable/>
            </CardContent>
        </Card>
    );
}