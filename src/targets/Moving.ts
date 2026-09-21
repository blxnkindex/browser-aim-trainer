import * as T from "three";

import { Behaviour } from "./Behaviour";
import { Target } from "./Target";

export type DirectionMode =
    | "cardinal"
    | "free"
    | "horizontal"
    | "vertical";

export interface MovingConfig {
    speed: number;
    directionMode: DirectionMode;
    directionChangeMin?: number;
    directionChangeMax?: number;
    randomInitialDirection?: boolean;
}

export class Moving implements Behaviour {
    private direction = new T.Vector3();
    private changeTimer = 0;
    private nextDirectionChange = 0;

    constructor(
        private readonly config: MovingConfig
    ) {
        this.chooseDirection();
    }

    update(target: Target, delta: number): void {
        target.mesh.position.addScaledVector(this.direction, this.config.speed * delta);

        const x = target.mesh.position.x;
        const y = target.mesh.position.y;

        if (x > 5 || x < -5) {
            this.direction.x *= -1;
        }

        if (y > 3.5 || y < -3.5) {
            this.direction.y *= -1;
        }

        this.changeTimer += delta;

        if (this.changeTimer >= this.nextDirectionChange) {
            this.changeTimer = 0;
            this.chooseDirection();
            this.setNextDirectionChange();
        }
    }

    private setNextDirectionChange() {
        const min = this.config.directionChangeMin;
        const max = this.config.directionChangeMax;

        if (min === undefined || max === undefined) {
            this.nextDirectionChange = Infinity;
            return;
        }

        this.nextDirectionChange = T.MathUtils.randFloat(min, max);
    }

    private chooseDirection() {
        const { directionMode } = this.config;

        if (directionMode === "horizontal") {
            this.direction.set(Math.random() < 0.5 ? -1 : 1, 0, 0);
            return;
        }

        if (directionMode === "vertical") {
            this.direction.set(0, Math.random() < 0.5 ? -1 : 1, 0);
            return;
        }

        if (directionMode === "cardinal") {
            const axis = Math.floor(Math.random() * 2);
            const sign = Math.random() < 0.5 ? -1 : 1;

            this.direction.set(0, 0, 0);
            this.direction.setComponent(axis, sign);
            return;
        }

        // Free movement, but restricted to the X/Y plane.
        this.direction.set(Math.random() * 2 - 1, Math.random() * 2 - 1, 0).normalize();
    }

    setDirection(direction: T.Vector3) {
        this.direction.copy(direction).normalize();
    }
}