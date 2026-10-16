import * as T from "three";

import { EnvironmentDefinition } from "./Environment";

export const box: EnvironmentDefinition = {
    walls: [
        {
            width: 20,
            height: 0,
            depth: 20,
            position: new T.Vector3(0, -10, -7.5),
            grid: true,
            gridSize: 1,
        },
        {
            width: 20,
            height: 0,
            depth: 20,
            position: new T.Vector3(0, 10, -7.5),
            grid: true,
            gridSize: 1,
        },
        {
            width: 20,
            height: 20,
            depth: 0,
            position: new T.Vector3(0, 0, -17.5),
            grid: true,
            gridSize: 1,
        },
        {
            width: 0,
            height: 20,
            depth: 20,
            position: new T.Vector3(-10, 0, -7.5),
            grid: true,
            gridSize: 1,
        },
        {
            width: 0.2,
            height: 20,
            depth: 20,
            position: new T.Vector3(10, 0, -7.5),
            grid: true,
            gridSize: 1,
        },
    ],
};

export const smallBox: EnvironmentDefinition = {
    walls: [
        {
            width: 10,
            height: 0,
            depth: 35,
            position: new T.Vector3(0, -5, -10),
            grid: true,
            gridSize: 1,
        },
        {
            width: 10,
            height: 0,
            depth: 35,
            position: new T.Vector3(0, 5, -10),
            grid: true,
            gridSize: 1,
        },
        {
            width: 20,
            height: 20,
            depth: 0,
            position: new T.Vector3(0, 0, -17.5),
            grid: true,
            gridSize: 1,
        },
        {
            width: 0,
            height: 10,
            depth: 35,
            position: new T.Vector3(-5, 0, -10),
            grid: true,
            gridSize: 1,
        },
        {
            width: 0.2,
            height: 10,
            depth: 35,
            position: new T.Vector3(5, 0, -10),
            grid: true,
            gridSize: 1,
        },
    ],
};

export const smallFarBox: EnvironmentDefinition = {
    walls: [
        {
            width: 10,
            height: 0,
            depth: 52.5,
            position: new T.Vector3(0, -5, -18.75),
            grid: true,
            gridSize: 1,
        },
        {
            width: 10,
            height: 0,
            depth: 52.5,
            position: new T.Vector3(0, 5, -18.75),
            grid: true,
            gridSize: 1,
        },
        {
            width: 20,
            height: 20,
            depth: 0,
            position: new T.Vector3(0, 0, -35),
            grid: true,
            gridSize: 1,
        },
        {
            width: 0,
            height: 10,
            depth: 52.5,
            position: new T.Vector3(-5, 0, -18.75),
            grid: true,
            gridSize: 1,
        },
        {
            width: 0.2,
            height: 10,
            depth: 52.5,
            position: new T.Vector3(5, 0, -18.75),
            grid: true,
            gridSize: 1,
        },
    ],
};

export const wideBox: EnvironmentDefinition = {
    walls: [
        {
            width: 40,
            height: 0,
            depth: 20,
            position: new T.Vector3(0, -10, -7.5),
            grid: true,
            gridSize: 1,
        },
        {
            width: 40,
            height: 0,
            depth: 20,
            position: new T.Vector3(0, 10, -7.5),
            grid: true,
            gridSize: 1,
        },
        {
            width: 40,
            height: 20,
            depth: 0,
            position: new T.Vector3(0, 0, -17.5),
            grid: true,
            gridSize: 1,
        },
        {
            width: 0,
            height: 20,
            depth: 20,
            position: new T.Vector3(-20, 0, -7.5),
            grid: true,
            gridSize: 1,
        },
        {
            width: 0.2,
            height: 20,
            depth: 20,
            position: new T.Vector3(20, 0, -7.5),
            grid: true,
            gridSize: 1,
        },
    ],
};

export const curvedBox: EnvironmentDefinition = {
    walls: [
        {
            width: 20,
            height: 0,
            depth: 20,
            position: new T.Vector3(0, -10, -7.5),
            grid: true,
            gridSize: 1,
        },
        {
            width: 20,
            height: 0,
            depth: 20,
            position: new T.Vector3(0, 10, -7.5),
            grid: true,
            gridSize: 1,
        },
        {
            width: 20,
            height: 20,
            depth: 0,
            position: new T.Vector3(0, 0, -17.5),
            curveRadius: 25,
            grid: true,
            gridSize: 1,
        },
        {
            width: 0,
            height: 20,
            depth: 20,
            position: new T.Vector3(-10, 0, -7.5),
            grid: true,
            gridSize: 1,
        },
        {
            width: 0.2,
            height: 20,
            depth: 20,
            position: new T.Vector3(10, 0, -7.5),
            grid: true,
            gridSize: 1,
        },
    ],
};

export const hallwayGaps: EnvironmentDefinition = {
    walls: [
        {
            // FLOOR
            width: 8,
            height: 0,
            depth: 37.5,
            position: new T.Vector3(0, -3, -16.25),
            grid: true,
            gridSize: 1,
        },
        {
            // CEILING
            width: 8,
            height: 0,
            depth: 37.5,
            position: new T.Vector3(0, 3, -16.25),
            grid: true,
            gridSize: 1,
        },
        {
            // BACK WALL
            width: 20,
            height: 25,
            depth: 0.2,
            position: new T.Vector3(0, 0, -35),
            grid: true,
            gridSize: 1,
        },
        // LEFT SIDE
        {
            // LONG FRONT SECTION
            width: 1.25,
            height: 20,
            depth: 20,
            position: new T.Vector3(-3, 0, -7.5),
            grid: true,
            gridSize: 1,
        },
        {
            // MIDDLE SECTION
            width: 1.25,
            height: 20,
            depth: 4.5,
            position: new T.Vector3(-3, 0, -20.75),
            grid: true,
            gridSize: 1,
        },
        {
            // BACK SECTION
            width: 1.25,
            height: 20,
            depth: 6,
            position: new T.Vector3(-3, 0, -30.5),
            grid: true,
            gridSize: 1,
        },
        // RIGHT SIDE
        {
            // LONG FRONT SECTION
            width: 1.25,
            height: 20,
            depth: 20,
            position: new T.Vector3(3, 0, -7.5),
            grid: true,
            gridSize: 1,
        },
        {
            // MIDDLE SECTION
            width: 1.25,
            height: 20,
            depth: 4.5,
            position: new T.Vector3(3, 0, -20.75),
            grid: true,
            gridSize: 1,
        },
        {
            // BACK SECTION
            width: 1.25,
            height: 20,
            depth: 6,
            position: new T.Vector3(3, 0, -30.5),
            grid: true,
            gridSize: 1,
        },
    ],
};

export const hallwaySingleGap: EnvironmentDefinition = {
    walls: [
        {
            // FLOOR
            width: 8,
            height: 0,
            depth: 22.5,
            position: new T.Vector3(0, -3, -8.75),
            grid: true,
            gridSize: 1,
        },
        {
            // CEILING
            width: 8,
            height: 0,
            depth: 22.5,
            position: new T.Vector3(0, 3, -8.75),
            grid: true,
            gridSize: 1,
        },
        {
            // BACK WALL
            width: 20,
            height: 25,
            depth: 0.2,
            position: new T.Vector3(0, 0, -20),
            grid: true,
            gridSize: 1,
        },

        // LEFT SIDE
        {
            // FRONT SECTION — ENDS BEFORE THE GAP
            width: 1.25,
            height: 20,
            depth: 16,
            position: new T.Vector3(-3, 0, -2.5),
            grid: true,
            gridSize: 1,
        },

        // RIGHT SIDE — SOLID WALL
        {
            width: 1.25,
            height: 20,
            depth: 22.5,
            position: new T.Vector3(3, 0, -8.75),
            grid: true,
            gridSize: 1,
        },
    ],
};

export const environments: Record<string, EnvironmentDefinition> = {
    box,
    smallBox,
    smallFarBox,
    wideBox,
    curvedBox,
    hallwayGaps,
    hallwaySingleGap,
};