
import * as T from "three";

import { Environment } from "../environment/Environment";
import { Target } from "../targets/Target";
import { Moving, DirectionMode } from "../targets/Moving";

export type ScenarioState = "idle" | "running" | "paused" | "finished";
export type SpawnMode = "backWall" | "wallGaps";
export type TargetRange = "none" | "half" | "full";
export type InteractionMode = "click" | "holdFire";

export interface ScenarioConfig {
    name: string;
    category: "clicking" | "tracking" | "switching" | "training";
    targetCount: number;
    movement: "static" | "moving";
    environment: string;
    spawnMode: SpawnMode;
    targetXRange: TargetRange;
    targetYRange: TargetRange;
    directionMode?: DirectionMode;
    directionChangeMin?: number;
    directionChangeMax?: number;
    directionChangeDuration?: number;
    turnSpeedMultiplier?: number;
    acceleration?: number;
    turnRate?: number;
    turnDirection?: "clockwise" | "counterclockwise" | "random";
    interactionMode?: InteractionMode;
    targetHealth?: number;
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
        environment: Environment,
    ) {
        this.config = config;
        this.duration = duration;
        this.targetSize = targetSize;
        this.movementSpeed = movementSpeed;
        this.environment = environment;

        for (let i = 0; i < config.targetCount; i++) {
            const behaviour = config.movement === "moving" ? this.createMovementBehaviour() : undefined;
            const target = new Target(scene, this.targetSize, behaviour, targetColor, config.targetHealth);

            target.mesh.visible = false;
            this.targets.push(target);
        }
    }

    private createMovementBehaviour(): Moving {
        const bounds = this.environment.getSpawnBounds(this.spawnOffset + this.targetSize);

        return new Moving({
            speed: this.movementSpeed,
            directionMode: this.config.directionMode ?? "horizontal",
            directionChangeMin: this.config.directionChangeMin,
            directionChangeMax: this.config.directionChangeMax,
            directionChangeDuration: this.config.directionChangeDuration,
            turnSpeedMultiplier: this.config.turnSpeedMultiplier,
            acceleration: this.config.acceleration,
            turnRate: this.config.turnRate,
            turnDirection: this.config.turnDirection,
            bounds: { minX: bounds.minX, maxX: bounds.maxX, minY: bounds.minY, maxY: bounds.maxY },
        });
    }

    start(): void {
        this.startedAt = performance.now();
        this.state = "running";

        for (const target of this.targets) {
            target.mesh.visible = true;
            this.spawnTarget(target, 0);
        }
    }

    respawnTarget(target: Target): void {
        if (!this.isActive) return;
        this.spawnTarget(target, this.elapsed);
    }

    damageTarget(target: Target, delta: number): boolean {
        if (!this.isActive || this.config.interactionMode !== "holdFire" || this.config.targetHealth === undefined) {
            return false;
        }

        const killed = target.takeDamage(50 * delta);

        if (killed) this.respawnTarget(target);
        return killed;
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

    private spawnTarget(target: Target, gameTime: number): void {
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

            case "wallGaps": {
                const gaps = this.environment.getSideWallGaps();

                if (gaps.length === 0) {
                    throw new Error(`No side-wall gaps found in environment "${this.config.environment}".`);
                }

                const gap = gaps[Math.floor(Math.random() * gaps.length)];
                const direction = gap.side === "left" ? 1 : -1;
                const offset = this.config.name === "angleHold"
                    ? T.MathUtils.randFloat(-4, 0)
                    : this.config.name === "hellHold"
                        ? T.MathUtils.randFloat(-2, 0)
                        : 0;

                const targetOffset = offset + this.spawnOffset + this.targetSize - 2.5;
                position = new T.Vector3(gap.x + direction * targetOffset, 0, gap.centerZ + T.MathUtils.randFloat(-0.5, 0.5));

                const exitBounds = this.environment.getBackWallXBounds();

                target.setBehaviour(new Moving({
                    speed: this.movementSpeed,
                    directionMode: "horizontal",
                    bounds: { minX: exitBounds.minX, maxX: exitBounds.maxX, minY: 0, maxY: 0 },
                    initialDirection: new T.Vector3(direction, 0, 0),
                    changeDirectionOnTimer: false,
                    allowEntryFromOutside: true,
                    onExitBounds: (exitedTarget) => {
                        if (!this.isActive) return;
                        exitedTarget.mesh.visible = false;
                        this.respawnTarget(exitedTarget);
                        exitedTarget.mesh.visible = true;
                    },
                }));
                break;
            }

            default:
                throw new Error(`Unknown spawn mode: ${this.config.spawnMode}`);
        }

        target.spawn(position, gameTime);
    }

    end(): void {
        this.state = "finished";

        for (const target of this.targets) target.destroy(this.scene);
        this.targets.length = 0;
    }

    get activeTargets(): readonly Target[] {
        return this.targets;
    }

    get elapsed(): number {
        return this.startedAt === 0 ? 0 : performance.now() - this.startedAt;
    }

    get remaining(): number {
        return Math.max(0, this.duration - this.elapsed);
    }

    get finished(): boolean {
        return this.elapsed >= this.duration;
    }

    get isActive(): boolean {
        return this.state === "running" && !this.finished;
    }

    get currentState(): ScenarioState {
        return this.state;
    }

    get isPaused(): boolean {
        return this.state === "paused";
    }

    pause(): void {
        if (this.state !== "running") return;
        this.pausedAt = performance.now();
        this.state = "paused";
    }

    resume(): void {
        if (this.state !== "paused") return;
        this.startedAt += performance.now() - this.pausedAt;
        this.state = "running";
    }

    update(delta: number): void {
        if (this.state !== "running") return;
        for (const target of this.targets) target.update(delta);
    }
}
