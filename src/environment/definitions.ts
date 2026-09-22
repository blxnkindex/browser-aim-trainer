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