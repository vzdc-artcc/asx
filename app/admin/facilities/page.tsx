import FacilityTable from "@/components/Admin/Facility/FacilityTable";
import { Add } from "@mui/icons-material";
import { Reorder } from "@mui/icons-material";
import { Box, Button, Card, CardContent, Link, Stack, Typography } from "@mui/material";

export default async function Page() {
    return (
        <Card>
            <CardContent>
                <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="h5">Radar Facilities</Typography>
                    <Box>
                        <Link href="/admin/order/facilities" style={{color: 'inherit',}}>
                            <Button variant="outlined" color="inherit" size="small" startIcon={<Reorder />}
                                    sx={{mr: 1,}}>Order</Button>
                        </Link>
                        <Link href="/admin/facilities/new">
                            <Button variant="contained" startIcon={<Add/>}>New Radar Facility</Button>
                        </Link>
                    </Box>
                </Stack>
                <FacilityTable />
            </CardContent>
        </Card>
    );
}