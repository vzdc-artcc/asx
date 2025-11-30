'use server';

import {WaypointCoordinate} from "@/types/route";

const {ROUTE_DECODE_URL} = process.env;

export const fetchRouteCoordinates = async (routeString: string): Promise<WaypointCoordinate[] | string> => {
    const res = await fetch(`${ROUTE_DECODE_URL}?route=${encodeURIComponent(routeString)}`);

    if (!res.ok) {
        return "Unable to fetch route coordinates.";
    }

    const data = await res.json();
    return data as WaypointCoordinate[];
}