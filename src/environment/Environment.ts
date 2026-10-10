import * as T from "three";

import { Wall, WallConfig } from "./Wall";

export interface EnvironmentDefinition {
    walls: WallConfig[];
}

export interface SpawnBounds {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    backZ: number;
    backCurveRadius?: number;
}

export class Environment {
    public readonly object: T.Group;
    private readonly walls: Wall[] = [];

    constructor(definition: EnvironmentDefinition) {
        this.object = new T.Group();

        for (const wallConfig of definition.walls) {
            const wall = new Wall(wallConfig);

            this.walls.push(wall);
            this.object.add(wall.object);
        }
    }

    getSpawnBounds(offset: number): SpawnBounds {
        let minX = -Infinity;
        let maxX = Infinity;
        let minY = -Infinity;
        let maxY = Infinity;
        let backZ = Infinity;
        let backCurveRadius: number | undefined;

        for (const wall of this.walls) {
            const config = wall.config;
            const halfWidth = config.width / 2;
            const halfDepth = config.depth / 2;

            if (config.height === 0 && config.depth > 0) {
                if (config.position.y < 0) {
                    // Floor
                    minY = Math.max(minY, config.position.y + offset);
                } else {
                    // Ceiling
                    maxY = Math.min(maxY, config.position.y - offset);
                }
            }

            // Side walls
            if (config.height > 0 && config.depth > 0 && !config.curveRadius) {
                const xMin = config.position.x - halfWidth;
                const xMax = config.position.x + halfWidth;

                if (config.position.x < 0) {
                    // Left wall
                    minX = Math.max(minX, xMax + offset);
                }

                if (config.position.x > 0) {
                    // Right wall
                    maxX = Math.min(maxX, xMin - offset);
                }
            }

            // Back wall
            if (config.height > 0 && config.position.z < backZ) {
                backZ = config.position.z + halfDepth + offset;
                backCurveRadius = config.curveRadius;
            }
        }

        if (!Number.isFinite(minX) || !Number.isFinite(maxX) || !Number.isFinite(minY) || !Number.isFinite(maxY) || !Number.isFinite(backZ)) {
            throw new Error("Could not determine spawn bounds from environment.");
        }

        if (minX > maxX) {
            throw new Error("Environment spawn X bounds are invalid.");
        }

        if (minY > maxY) {
            throw new Error("Environment spawn Y bounds are invalid.");
        }

        return { minX, maxX, minY, maxY, backZ, backCurveRadius };
    }

    getBackWallPosition(x: number, offset: number): T.Vector3 {
        let backWall: WallConfig | undefined;

        for (const wall of this.walls) {
            const config = wall.config;

            if (config.height > 0 && (!backWall || config.position.z < backWall.position.z)) {
                backWall = config;
            }
        }

        if (!backWall) {
            throw new Error("Could not find a back wall.");
        }

        if (!backWall.curveRadius) {
            return new T.Vector3(x, 0, backWall.position.z + backWall.depth / 2 + offset);
        }

        const radius = backWall.curveRadius;
        const angle = Math.asin(x / radius);
        const surfaceX = radius * Math.sin(angle);
        const surfaceZ = backWall.position.z + radius - radius * Math.cos(angle);

        const normalX = -Math.sin(angle);
        const normalZ = Math.cos(angle);

        return new T.Vector3(
            surfaceX + normalX * offset,
            0,
            surfaceZ + normalZ * offset
        );
    }

    dispose(): void {
        for (const wall of this.walls) {
            wall.dispose();
        }

        this.walls.length = 0;
    }
}