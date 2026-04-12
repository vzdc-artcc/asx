'use client';
import React, {useContext, useState} from 'react';
import {AirspaceViewerConfigContext} from "@/contexts/AirspaceViewerConfigContext";
import {toast} from "react-toastify";
import {IconButton, List, ListItem, ListItemText, Tooltip, Typography} from "@mui/material";
import {Delete, Edit, Label, LabelOff, Visibility, VisibilityOff} from "@mui/icons-material";
import FacilityColorPicker from "@/components/Viewer/FacilitySelector/FacilityColorPicker";
import RouteFormDialog from "@/components/Viewer/Route/RouteFormDialog";
import {RouteDisplayData} from "@/types/route";

export default function RouteList() {

    const config = useContext(AirspaceViewerConfigContext);
    const [editingRoute, setEditingRoute] = useState<RouteDisplayData | null>(null);

    const onDeleteRoute = (routeId: string) => {
        const updatedRoutes = config.data?.routes.filter((route) => route.id !== routeId) || [];
        config.updateRoutes?.(updatedRoutes);
        toast.success("Route deleted successfully!");
    }

    const onToggleDisplayRoute = (routeId: string) => {
        const updatedRoutes = config.data?.routes.map((route) => {
            if (route.id === routeId) {
                return { ...route, displayed: !route.displayed };
            }
            return route;
        }) || [];
        config.updateRoutes?.(updatedRoutes);
    }

    const onToggleShowLabels = (routeId: string) => {
        const updatedRoutes = config.data?.routes.map((route) => {
            if (route.id === routeId) {
                return { ...route, showLabels: !route.showLabels };
            }
            return route;
        }) || [];
        config.updateRoutes?.(updatedRoutes);
    }

    const onUpdateRouteColor = (routeId: string, color?: string) => {
        config.updateColor?.(routeId, color);
    }

    return (
        <>
            <Typography variant="subtitle2" sx={{ textAlign: 'center' }} gutterBottom>Active Routes/Points</Typography>
            {config.data?.routes.length === 0 &&
                <Typography sx={{ textAlign: 'center' }}>No routes added</Typography>
            }
            <List>
                {config.data?.routes.map((route) => (
                    <ListItem key={route.id}>
                        <Tooltip title={route.routeString}>
                            <ListItemText primary={route.name} />
                        </Tooltip>
                        <FacilityColorPicker existingColor={config.data?.colorOverrides.find((c) => c.id === route.id)?.color || '#FF0000'} onChange={(color) => {
                            onUpdateRouteColor(route.id, color);
                        }}/>
                        <Tooltip title="Toggle Display Route">
                            <IconButton onClick={() => onToggleDisplayRoute(route.id)}>
                                {route.displayed ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Toggle Show Labels">
                            <IconButton onClick={() => onToggleShowLabels(route.id)}>
                                {route.showLabels ? <LabelOff /> : <Label />}
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Route">
                            <IconButton onClick={() => setEditingRoute(route)}>
                                <Edit />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Route">
                            <IconButton onClick={() => onDeleteRoute(route.id)}>
                                <Delete />
                            </IconButton>
                        </Tooltip>
                    </ListItem>
                ))}
            </List>

            <RouteFormDialog open={!!editingRoute} onClose={() => setEditingRoute(null)} editRoute={editingRoute ?? undefined} />
        </>
    );
}
