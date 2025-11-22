import {ColorOverride} from "@/contexts/AirspaceViewerConfigContext";
import {SectorMapping} from "@prisma/client";

export const getMappingColor = (liveConsolidations: boolean, sector: SectorMapping, colorOverrides: ColorOverride[]) => {
    const override = colorOverrides.find(co => co.id === sector.id);
    if (override) {
        return override.color;
    }

    return liveConsolidations ? sector.consolidationColor : sector.explorerColor;
}