'use client';

import {GridColDef} from "@mui/x-data-grid";
import DataTable, {containsOnlyFilterOperator, equalsOnlyFilterOperator} from "../DataTable/DataTable";
import {toast} from "react-toastify";
import DeleteButton from "../GridButton/DeleteButton";
import EditButton from "../GridButton/EditButton";
import {deleteAirspaceContainer, fetchAirspaceContainers} from "@/actions/airspace";
import {AirspaceCondition} from "@/generated/prisma/browser";

export default function AirspaceContainerTable() {

    const columns: GridColDef[] = [
        {
            field: 'name',
            headerName: 'Name',
            flex: 1,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
        {
            field: 'conditions',
            headerName: 'Conditions',
            flex: 1,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
            renderCell: (params) => params.row.conditions.map((c: AirspaceCondition) => c.name).join(', '),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            type: 'actions',
            flex: 1,
            getActions: (params) => [
                <EditButton key={params.row.id} id={params.row.id} label="Edit Airspace Container"
                            editUrl={`/admin/containers/${params.row.id}`}/>,
                <DeleteButton key={params.row.id} id={params.row.id} label="Delete Airspace Container"
                              deleteFunction={deleteAirspaceContainer}
                              onSuccess={() => toast.success(`${params.row.icao} deleted successfully!`)}
                              warningMessage="Deleting this video map will remove all the conditions associated with it.  Click again to confirm."/>
            ],
        }
    ];

    return (
        <DataTable columns={columns} fetchData={async (pagination, sort, filter) => {
            const fetchedAirspaceContainers = await fetchAirspaceContainers(pagination, sort, filter);
            return {data: fetchedAirspaceContainers[1], rowCount: fetchedAirspaceContainers[0]};
        }}/>
    );
}