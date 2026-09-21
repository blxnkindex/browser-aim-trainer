import { ScenarioConfig } from "../scenarios/Scenario";

export const scenarios = {
    "1w2t": {
        duration: 30_000,
        targetSize: 0.25,
        targetCount: 2,
        movement: "static",
    } satisfies ScenarioConfig,

    "1w6t": {
        duration: 30_000,
        targetSize: 0.25,
        targetCount: 6,
        movement: "static",
    } satisfies ScenarioConfig,

    "dynamicclick": {
        duration: 30_000,
        targetSize: 0.25,
        targetCount: 5,
        movement: "moving",
        directionMode: "free",
        directionChangeMin: 0.8,
        directionChangeMax: 2.0,
    } satisfies ScenarioConfig,

    "beanclick": {
        duration: 30_000,
        targetSize: 0.5,
        targetCount: 2,
        movement: "moving",
        directionMode: "horizontal",
    } satisfies ScenarioConfig,
};