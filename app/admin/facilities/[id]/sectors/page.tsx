import SectorMappingTable from "@/components/Admin/SectorMapping/SectorMappingTable";
import prisma from "@/lib/db";
import {Add} from "@mui/icons-material";
import {Box, Button, Card, CardContent, Link, Stack, Typography} from "@mui/material";
import {notFound} from "next/navigation";
import SectorMappingIdsAddButton from "@/components/Admin/SectorMapping/SectorMappingIDSAddButton";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {

    const { id } = await params;

    const facility = await prisma.radarFacility.findUnique({
        where: {
            id,
        },
        include: {
            sectors: true,
        },
    });

    if (!facility) {
        notFound();
    }

    return (
        <Card>
            <CardContent>
                <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="h5">{facility.name} - Sectors</Typography>
                    <Box>
                        <SectorMappingIdsAddButton facilityId={facility.id}/>
                        <Link href={`/admin/facilities/${facility.id}/sectors/new`} style={{color: 'inherit',}}>
                            <Button variant="contained" startIcon={<Add/>}>New Sector Mapping</Button>
                        </Link>
                    </Box>
                </Stack>
                <SectorMappingTable facility={facility} />
            </CardContent>
        </Card>
    )
}