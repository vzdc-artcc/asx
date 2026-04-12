import VideoMapTable from "@/components/Admin/VideoMap/VideoMapTable";
import { Add, Reorder } from "@mui/icons-material";
import { Box, Button, Card, CardContent, Link, Stack, Typography } from "@mui/material";

export default async function Page() {
    return (
        <Card>
            <CardContent>
                <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="h5">Video Maps</Typography>
                    <Box>
                        <Link href="/admin/order/video-maps" style={{color: 'inherit',}}>
                            <Button variant="outlined" color="inherit" size="small" startIcon={<Reorder />}
                                    sx={{mr: 1,}}>Order</Button>
                        </Link>
                        <Link href="/admin/video-maps/new">
                            <Button variant="contained" startIcon={<Add/>}>New Video Map</Button>
                        </Link>
                    </Box>
                </Stack>
                <VideoMapTable />
            </CardContent>
        </Card>
    );
}