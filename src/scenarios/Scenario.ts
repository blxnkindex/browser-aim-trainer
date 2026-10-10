import * as T from "three";

import { Environment } from "../environment/Environment";
import { Target } from "../targets/Target";
import { Moving, DirectionMode } from "../targets/Moving";

export type ScenarioState = "idle" | "running" | "paused" | "finished";

export type SpawnMode = "backWall";
export type TargetRange = "none" | "half" | "full";

export interface ScenarioConfig {
    targetCount: number;
    movement: "static" | "moving";
    directionMode?: DirectionMode;
    directionChangeMin?: number;
    directionChangeMax?: number;
    environment: string;
    spawnMode: SpawnMode;
    targetXRange: TargetRange;
    targetYRange: TargetRange;
}

export class Scenario {
    readonly config: ScenarioConfig;
    private readonly targets: Target[] = [];
    private readonly duration: number;
    private readonly targetSize: number;
    private readonly movementSpeed: number;
    private readonly environment: Environment;
    private readonly spawnOffset = 0.5;

    private startedAt = 0;
    private pausedAt = 0;
    private state: ScenarioState = "idle";

    constructor(
        private readonly scene: T.Scene,
        config: ScenarioConfig,
        targetColor: string,
        duration: number,
        targetSize: number,
        movementSpeed: number,
        environment: Environment
    ) {
        this.config = config;
        this.duration = duration;
        this.targetSize = targetSize;
        this.movementSpeed = movementSpeed;
        this.environment = environment;

        const bounds = this.environment.getSpawnBounds(this.spawnOffset + this.targetSize);
        const movementBounds = {
            minX: bounds.minX,
            maxX: bounds.maxX,
            minY: bounds.minY,
            maxY: bounds.maxY,
        };

        for (let i = 0; i < config.targetCount; i++) {
            const behaviour = config.movement === "moving"
                ? new Moving({
                    speed: this.movementSpeed,
                    directionMode: config.directionMode ?? "horizontal",
                    directionChangeMin: config.directionChangeMin,
                    directionChangeMax: config.directionChangeMax,
                    bounds: movementBounds,
                })
                : undefined;

            const target = new Target(scene, this.targetSize, behaviour, targetColor);

            target.mesh.visible = false;
            this.targets.push(target);
        }
    }

    start() {
        this.startedAt = performance.now();
        this.state = "running";

        for (const target of this.targets) {
            target.mesh.visible = true;
            this.spawnTarget(target, 0);
        }
    }

    respawnTarget(target: Target) {
        if (!this.isActive) {
            return;
        }

        this.spawnTarget(target, this.elapsed);
    }

    private getRange(boundsMin: number, boundsMax: number, range: TargetRange) {
        const center = (boundsMin + boundsMax) / 2;
        const halfRange = (boundsMax - boundsMin) / 2;

        switch (range) {
            case "none":
                return { min: center, max: center };
            case "half":
                return { min: center - halfRange / 2, max: center + halfRange / 2 };
            case "full":
                return { min: boundsMin, max: boundsMax };
        }
    }

    private spawnTarget(target: Target, gameTime: number) {
        const bounds = this.environment.getSpawnBounds(this.spawnOffset + this.targetSize);

        let position: T.Vector3;

        switch (this.config.spawnMode) {
            case "backWall": {
                const xRange = this.getRange(bounds.minX, bounds.maxX, this.config.targetXRange);
                const yRange = this.getRange(bounds.minY, bounds.maxY, this.config.targetYRange);
                const x = T.MathUtils.randFloat(xRange.min, xRange.max);
                const y = T.MathUtils.randFloat(yRange.min, yRange.max);

                position = this.environment.getBackWallPosition(x, this.spawnOffset + this.targetSize);
                position.y = y;

                break;
            }

            default:
                throw new Error(`Unknown spawn mode: ${this.config.spawnMode}`);
        }

        target.spawn(position, gameTime);
    }

    end() {
        this.state = "finished";

        for (const target of this.targets) {
            target.destroy(this.scene);
        }

        this.targets.length = 0;
    }

    get activeTargets(): readonly Target[] {
        return this.targets;
    }

    get elapsed() {
        if (this.startedAt === 0) {
            return 0;
        }

        return performance.now() - this.startedAt;
    }

    get remaining() {
        return Math.max(0, this.duration - this.elapsed);
    }

    get finished() {
        return this.elapsed >= this.duration;
    }

    get isActive() {
        return this.state === "running" && !this.finished;
    }

    get currentState() {
        return this.state;
    }

    get isPaused() {
        return this.state === "paused";
    }

    pause() {
        if (this.state !== "running") {
            return;
        }

        this.pausedAt = performance.now();
        this.state = "paused";
    }

    resume() {
        if (this.state !== "paused") {
            return;
        }

        this.startedAt += performance.now() - this.pausedAt;
        this.state = "running";
    }

    update(delta: number) {
        if (this.state !== "running") {
            return;
        }

        for (const target of this.targets) {
            target.update(delta);
        }
    }
}