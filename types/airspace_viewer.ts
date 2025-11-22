import {
    AirspaceCondition,
    AirspaceConditionContainer,
    MappingJson,
    RadarFacility,
    SectorMapping,
    VideoMap
} from "@prisma/client";

export type AirspaceConditionWithContainer = AirspaceCondition & {
    container: AirspaceConditionContainer;
};
export type MappingJsonWithConditions = MappingJson & {
    airspaceCondition?: AirspaceConditionWithContainer | null;
};
export type AirspaceContainerWithConditions = AirspaceConditionContainer & {
    conditions: AirspaceCondition[];
};
export type VideoMapWithMappings = VideoMap & {
    mappings: MappingJsonWithConditions[];
};
export type RadarFacilityWithSectors = RadarFacility & {
    sectors: SectorMappingWithConditions[];
};
export type SectorMappingWithConditions = SectorMapping & {
    mappings: MappingJsonWithConditions[];
};