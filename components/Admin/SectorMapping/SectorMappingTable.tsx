'use client';

import {GridColDef} from "@mui/x-data-grid";
import {RadarFacility} from "@/generated/prisma/browser";
import DataTable, {containsOnlyFilterOperator, equalsOnlyFilterOperator} from "../DataTable/DataTable";
import {toast} from "react-toastify";
import DeleteButton from "../GridButton/DeleteButton";
import EditButton from "../GridButton/EditButton";
import {deleteSectorMapping, fetchSectorMappings} from "@/actions/sectorMapping";

export default function SectorMappingTable({ facility }: { facility: RadarFacility, }) {

    const columns: GridColDef[] = [
        {
            field: 'name',
            headerName: 'Name',
            flex: 1,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
        {
            field: 'idsRadarSectorId',
            headerName: 'IDS Radar Sector ID',
            flex: 1,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            flex: 1,
            getActions: (params) => [
                <EditButton key={params.row.id} id={params.row.id} label="Edit Sector Mapping" editUrl={`/admin/facilities/${params.row.radarFacilityId}/sectors/${params.row.id}`} />,
                <DeleteButton key={params.row.id} id={params.row.id} label="Delete Sector Mapping" deleteFunction={deleteSectorMapping} onSuccess={() => toast.success(`${params.row.name} deleted successfully!`)} warningMessage="Deleting this sector mapping will remove all the JSON files associated with it.  Click again to confirm." />
            ],
        }
    ];

    return (
        <DataTable columns={columns} fetchData={async (pagination, sort, filter) => {
            const fetchedSectorMappings = await fetchSectorMappings(facility, pagination, sort, filter);
            return {data: fetchedSectorMappings[1], rowCount: fetchedSectorMappings[0]};
        }}/>
    )
}