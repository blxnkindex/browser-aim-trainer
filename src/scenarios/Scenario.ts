import * as T from "three";
import { Target } from "../targets/Target";
import { Moving, DirectionMode } from "../targets/Moving";

export type ScenarioState = | "idle" | "running" | "paused" | "finished";

export interface ScenarioConfig {
    duration: number;
    targetSize: number;
    targetCount: number;
    movement: "static" | "moving";
    movementSpeed?: number;
    directionMode?: DirectionMode;
    directionChangeMin?: number;
    directionChangeMax?: number;
}

export class Scenario {
    readonly config: ScenarioConfig;

    private readonly targets: Target[] = [];

    private startedAt = 0;
    private pausedAt = 0;
    private state: ScenarioState = "idle";

    constructor(
        private readonly scene: T.Scene,
        config: ScenarioConfig,
        targetColor: string
    ) {
        this.config = config;

        for (let i = 0; i < config.targetCount; i++) {
            const behaviour = config.movement === "moving" ? new Moving({speed: config.movementSpeed ?? 3, directionMode: config.directionMode ?? "horizontal", directionChangeMin: config.directionChangeMin, directionChangeMax: config.directionChangeMax }) : undefined;
            const target = new Target( scene, config.targetSize, undefined, behaviour, targetColor);
            target.mesh.visible = false;
            this.targets.push(target);
        }
    }

    start() {
        this.startedAt = performance.now();
        this.state = "running";
        for (const target of this.targets) {
            target.mesh.visible = true;
            target.spawn(0);
        }
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
        return Math.max(0, this.config.duration - this.elapsed);
    }

    get finished() {
        return this.elapsed >= this.config.duration;
    }

    get isActive() {
        return (this.state === "running" && !this.finished);
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