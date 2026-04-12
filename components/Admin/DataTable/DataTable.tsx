'use client';
import React, {useCallback, useEffect, useState} from 'react';
import {
    DataGrid,
    getGridStringOperators,
    GridColDef,
    GridFilterItem,
    GridFilterModel,
    GridPaginationModel,
    GridSortModel,
} from "@mui/x-data-grid";
import {toast} from "react-toastify";
import {Box} from "@mui/material";
import {useRouter, useSearchParams} from "next/navigation";

export const equalsOnlyFilterOperator = getGridStringOperators().filter((operator) => operator.value === 'equals');
export const containsOnlyFilterOperator = getGridStringOperators().filter((operator) => operator.value === 'contains');

export default function DataTable<T>(
    {
        columns,
        initialPagination = {page: 0, pageSize: 10},
        pageSizeOptions = [5, 10, 20],
        initialFilter,
        initialSort,
        fetchData
    }:
    {
        columns: GridColDef[],
        initialPagination?: GridPaginationModel,
        pageSizeOptions?: number[],
        initialFilter?: GridFilterItem,
        initialSort?: GridSortModel,
        fetchData: (pagination: GridPaginationModel, sortModel: GridSortModel, filter?: GridFilterItem) => Promise<{
            data: T[],
            rowCount: number,
        }>,
    }
) {

    const searchParams = useSearchParams();
    const router = useRouter();

    // Initialize state with defaults first using initializer functions
    const [data, setData] = useState<T[]>();
    const [pagination, setPagination] = useState<GridPaginationModel>(() => {
        const page = Number(searchParams.get('page')) || initialPagination.page;
        const pageSize = Number(searchParams.get('pageSize')) || initialPagination.pageSize;
        return {page, pageSize};
    });
    const [rowCount, setRowCount] = useState(0);
    const [filter, setFilter] = useState<GridFilterItem | undefined>(() => {
        const filterField = searchParams.get('filterField');
        const filterValue = searchParams.get('filterValue');
        const filterOperator = searchParams.get('filterOperator');
        return filterField && filterValue && filterOperator
            ? {field: filterField, value: filterValue, operator: filterOperator}
            : initialFilter;
    });
    const [sortModel, setSortModel] = useState<GridSortModel>(() => {
        const sortField = searchParams.get('sortField');
        const sortDirection = searchParams.get('sortDirection');
        return sortField && sortDirection
            ? [{field: sortField, sort: sortDirection as 'asc' | 'desc'}]
            : initialSort || [];
    });

    const updateQueryParams = useCallback((params: Record<string, string>) => {
        const newParams = new URLSearchParams(searchParams.toString());
        Object.entries(params).forEach(([key, value]) => {
            newParams.set(key, value);
        });
        router.push(`?${newParams.toString()}`);
    }, [router, searchParams]);

    useEffect(() => {
        let ignore = false;

        fetchData(pagination, sortModel, filter)
            .then(({data, rowCount}) => {
                if (!ignore) {
                    setData(data);
                    setRowCount(rowCount);
                }
            })
            .catch(() => {
                if (!ignore) {
                    toast.error('Failed to fetch data');
                }
            });

        return () => {
            ignore = true;
        };
    }, [fetchData, filter, pagination, sortModel]);


    const handleFilterChange = useCallback((newFilters: GridFilterModel) => {
        if (newFilters.quickFilterValues?.join(',')) {
            const filterCol = columns.find((c) => c.filterable === undefined || c.filterable);
            if (!filterCol) return;

            setFilter({
                field: filterCol.field,
                operator: 'contains',
                value: newFilters.quickFilterValues.join(','),
            });

            updateQueryParams({
                filterField: filterCol.field,
                filterValue: newFilters.quickFilterValues.join(','),
                filterOperator: 'contains',
            });

            return;
        }

        const newFilter = newFilters.items[0];
        setFilter(newFilter);
        if (newFilter) {
            updateQueryParams({
                filterField: newFilter.field || '',
                filterValue: newFilter.value?.toString() || '',
                filterOperator: newFilter.operator || ''
            });
        }
    }, [columns, updateQueryParams]);

    const handlePaginationModelChange = useCallback((newPagination: GridPaginationModel) => {
        setPagination(newPagination);
        updateQueryParams({
            page: newPagination.page.toString(),
            pageSize: newPagination.pageSize.toString()
        });
    }, [updateQueryParams]);

    const handleSortChange = useCallback((newSortModel: GridSortModel) => {
        setSortModel(newSortModel);
        if (newSortModel.length > 0) {
            updateQueryParams({
                sortField: newSortModel[0].field,
                sortDirection: newSortModel[0].sort || 'asc'
            });
        } else {
            updateQueryParams({
                sortField: '',
                sortDirection: ''
            });
        }
    }, [updateQueryParams]);

    return (
        <Box sx={{boxSizing: 'border-box', width: '100%',}}>
            <DataGrid
                sx={{
                    mt: 2,
                    fontFamily: 'Roboto, "Helvetica Neue", sans-serif',
                    fontSize: '0.875rem',
                    '& .MuiDataGrid-root': {
                        fontFamily: 'Roboto, "Helvetica Neue", sans-serif',
                    },
                    '& .MuiDataGrid-cell': {
                        fontFamily: 'Roboto, "Helvetica Neue", sans-serif',
                        fontSize: '0.875rem',
                    },
                    '& .MuiDataGrid-columnHeader': {
                        fontFamily: 'Roboto, "Helvetica Neue", sans-serif',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                    },
                    '& .MuiDataGrid-toolbarContainer': {
                        fontFamily: 'Roboto, "Helvetica Neue", sans-serif',
                    },
                }}
                loading={!data}
                rows={data || []}
                autoHeight
                columns={columns}
                pagination
                paginationMode="server"
                filterMode="server"
                sortingMode="server"
                paginationModel={pagination}
                rowCount={rowCount}
                onPaginationModelChange={handlePaginationModelChange}
                onFilterModelChange={handleFilterChange}
                sortModel={sortModel}
                onSortModelChange={handleSortChange}
                pageSizeOptions={pageSizeOptions}
                showToolbar
                disableRowSelectionOnClick
            />
        </Box>
    );
}