import { ScenarioConfig } from "../scenarios/Scenario";

export const scenarios = {
    "closeMicroFlicks": {
        name: "closeMicroFlicks",
        targetCount: 2,
        movement: "static",
        environment: "smallBox",
        spawnMode: "backWall",
        targetXRange: "full",
        targetYRange: "full",
    },

    "wideFlicks": {
        name: "wideFlicks",
        targetCount: 6,
        movement: "static",
        environment: "wideBox",
        spawnMode: "backWall",
        targetXRange: "full",
        targetYRange: "full",
    },
    "dynamicClick": {
        name: "dynamicClick",
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
        name: "beanclick",
        targetCount: 2,
        movement: "moving",
        directionMode: "horizontal",
        environment: "box",
        spawnMode: "backWall",
        targetXRange: "half",
        targetYRange: "half",
    },
    "peekFlicks": {
        name: "peekFlicks",
        targetCount: 2,
        movement: "moving",
        directionMode: "horizontal",
        environment: "hallwayGaps",
        spawnMode: "wallGaps",
        targetXRange: "full",
        targetYRange: "none",
    },
    
    "angleHold": {
        name: "angleHold",
        targetCount: 1,
        movement: "moving",
        directionMode: "horizontal",
        environment: "hallwaySingleGap",
        spawnMode: "wallGaps",
        targetXRange: "full",
        targetYRange: "none",
    },

    "smallFlicks": {
        name: "smallFlicks",
        targetCount: 3,
        movement: "static",
        environment: "smallFarBox",
        spawnMode: "backWall",
        targetXRange: "full",
        targetYRange: "full",
    },
} satisfies Record<string, ScenarioConfig>;