export type WaypointCoordinate = {
    name: string;
    latitude: number;
    longitude: number;
}

export type RouteDisplayData = {
    id: string;
    name: string;
    routeString: string;
    coordinates: WaypointCoordinate[];
    displayed: boolean;
    showLabels: boolean;
    error?: string;
}