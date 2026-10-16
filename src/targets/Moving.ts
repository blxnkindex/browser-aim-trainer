import * as T from "three";

import { Behaviour } from "./Behaviour";
import { Target } from "./Target";

export type DirectionMode =
    | "cardinal"
    | "free"
    | "horizontal"
    | "vertical";

export interface MovementBounds {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}

export interface MovingConfig {
    speed: number;
    directionMode: DirectionMode;
    bounds: MovementBounds;
    directionChangeMin?: number;
    directionChangeMax?: number;
    randomInitialDirection?: boolean;
    initialDirection?: T.Vector3;
    changeDirectionOnTimer?: boolean;
    allowEntryFromOutside?: boolean;
    onExitBounds?: (target: Target) => void;
}

export class Moving implements Behaviour {
    private direction = new T.Vector3();
    private changeTimer = 0;
    private nextDirectionChange = 0;
    private enteringFromOutside: boolean;

    constructor(private readonly config: MovingConfig) {
        this.enteringFromOutside = config.allowEntryFromOutside ?? false;

        if (config.initialDirection) {
            this.setDirection(config.initialDirection);
        } else {
            this.chooseDirection();
        }

        if (config.changeDirectionOnTimer === false) {
            this.nextDirectionChange = Infinity;
        } else {
            this.setNextDirectionChange();
        }
    }

    update(target: Target, delta: number): void {
        target.mesh.position.addScaledVector(this.direction, this.config.speed * delta);

        const position = target.mesh.position;
        const { minX, maxX, minY, maxY } = this.config.bounds;

        if (this.enteringFromOutside) {
            const enteredBounds = position.x >= minX && position.x <= maxX;

            if (enteredBounds) {
                this.enteringFromOutside = false;
            }
        }

        if (!this.enteringFromOutside) {
            if (position.x < minX || position.x > maxX) {
                if (this.config.onExitBounds) {
                    this.config.onExitBounds(target);
                    return;
                }

                if (position.x < minX) {
                    position.x = minX;
                    this.direction.x = Math.abs(this.direction.x);
                } else if (position.x > maxX) {
                    position.x = maxX;
                    this.direction.x = -Math.abs(this.direction.x);
                }
            }
        }

        if (position.y < minY) {
            position.y = minY;
            this.direction.y = Math.abs(this.direction.y);
        } else if (position.y > maxY) {
            position.y = maxY;
            this.direction.y = -Math.abs(this.direction.y);
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

        if (
            this.config.changeDirectionOnTimer === false ||
            min === undefined ||
            max === undefined
        ) {
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