import { ScenarioConfig } from "../scenarios/Scenario";

export const scenarios = {
    "closeMicroFlicks": {
        targetCount: 2,
        movement: "static",
        environment: "smallBox",
        spawnMode: "backWall",
        targetXRange: "full",
        targetYRange: "full",
    },

    "wideFlicks": {
        targetCount: 6,
        movement: "static",
        environment: "wideBox",
        spawnMode: "backWall",
        targetXRange: "full",
        targetYRange: "full",
    },

    "dynamicClick": {
        targetCount: 5,
        movement: "moving",
        directionMode: "free",
        directionChangeMin: 0.8,
        directionChangeMax: 2.0,
        environment: "wideBox",
        spawnMode: "backWall",
        targetXRange: "full",
        targetYRange: "full",
    },

    "beanclick": {
        targetCount: 2,
        movement: "moving",
        directionMode: "horizontal",
        environment: "box",
        spawnMode: "backWall",
        targetXRange: "full",
        targetYRange: "full",
    },
    "smallFlicks": {
        targetCount: 3,
        movement: "static",
        environment: "smallFarBox",
        spawnMode: "backWall",
        targetXRange: "full",
        targetYRange: "full",
    },
} satisfies Record<string, ScenarioConfig>;