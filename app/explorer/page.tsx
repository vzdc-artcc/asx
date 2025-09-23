import React from 'react';
import AirspaceViewer from "@/components/Viewer/AirspaceViewer";
import prisma from "@/lib/db";

export default async function Page() {

    const defaultConditions = await prisma.activeConsolidationsDefaultConditions.findFirst({
        include: {
            conditions: true,
        },
    });

    return (
        <AirspaceViewer defaultConditions={defaultConditions?.conditions || []}/>
    );
}