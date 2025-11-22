import React from 'react';
import {AirspaceViewerDataProvider} from "@/contexts/AirspaceViewerDataContext";
import {Box, Button, Card, CardContent, Container, Divider, Grid2, Stack, Typography} from "@mui/material";
import {AirspaceViewerConfigProvider} from "@/contexts/AirspaceViewerConfigContext";
import AirspaceConditionSelector from "@/components/Viewer/AirspaceCondition/AirspaceConditionSelector";
import VideoMapSelector from "@/components/Viewer/VideoMapSelector/VideoMapSelector";
import FacilitySelector from "@/components/Viewer/FacilitySelector/FacilitySelector";
import Map from "@/components/Viewer/Map/Map";
import {Home, Info} from "@mui/icons-material";
import Link from "next/link";
import ConfigImportExportButton from "@/components/Viewer/ConfigImportExportButton";

const {IDS_CONSOLIDATIONS_URL} = process.env;

export default async function AirspaceViewer({useConsolidations}: { useConsolidations?: boolean }) {

    let idsConsolidations = undefined;
    if (useConsolidations) {
        const res = await fetch(IDS_CONSOLIDATIONS_URL || '', {
            next: {
                revalidate: 10,
            },
        });

        if (res.ok) {
            idsConsolidations = await res.json();
        } else {
            return (
                <Container maxWidth="lg" sx={{mt: 2,}}>
                    <Card>
                        <CardContent>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{mb: 1,}}>
                                <Info color="error"/>
                                <Typography variant="h5">Unable to Load Active Consolidations</Typography>
                            </Stack>
                            <Typography gutterBottom>We could not communicate with the I.D.S. properly in order to fetch
                                the
                                most up to date radar consolidations.</Typography>
                            <Typography gutterBottom>If this problem persists, inform the Webmaster or the web
                                team.</Typography>
                            <Link href="/" style={{color: 'inherit', textDecoration: 'none',}}>
                                <Button variant="contained" size="large" startIcon={<Home/>}>
                                    Home
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </Container>
            );
        }
    }

    return (
        <AirspaceViewerDataProvider>
            <AirspaceViewerConfigProvider liveConsolidations={idsConsolidations}>
                <Grid2 container columns={10} spacing={2} sx={{m: 2}}>
                    <Grid2 size={10}>
                        <AirspaceConditionSelector/>
                    </Grid2>
                    <Grid2 size={{xs: 10, md: 3, xl: 2,}}
                           sx={{height: {xs: '300px', md: 'calc(100vh - 64px - 96px)',},}}>
                        <Card sx={{height: '100%', overflow: 'auto',}}>
                            <CardContent>
                                <Box sx={{height: '100%',}}>
                                    <Typography variant="h6" textAlign="center" gutterBottom>Map
                                        Settings <ConfigImportExportButton/></Typography>
                                    <Divider sx={{my: 2,}}/>
                                    <VideoMapSelector/>
                                    <Divider sx={{my: 2,}}/>
                                    <FacilitySelector/>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid2>
                    <Grid2 size={{xs: 10, md: 7, xl: 8,}}
                           sx={{height: {xs: '100vh', md: 'calc(100vh - 64px - 96px)',},}}>
                        <Map/>
                    </Grid2>
                </Grid2>
            </AirspaceViewerConfigProvider>
        </AirspaceViewerDataProvider>
    );
}