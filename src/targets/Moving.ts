
import * as T from "three";

import { Behaviour } from "./Behaviour";
import { Target } from "./Target";

export type DirectionMode = "cardinal" | "free" | "horizontal" | "vertical";

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
    acceleration?: number;
    turnRate?: number;
    turnDirection?: "clockwise" | "counterclockwise" | "random";
    directionChangeDuration?: number;
    turnSpeedMultiplier?: number;
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
    private currentSpeed: number;
    private turnSign: 1 | -1 = 1;

    private isChangingDirection = false;
    private transitionElapsed = 0;
    private transitionStartAngle = 0;
    private transitionEndAngle = 0;
    private transitionStartSpeed = 0;
    private transitionMinimumSpeed = 0;
    private transitionStartDirection = new T.Vector3();
    private transitionEndDirection = new T.Vector3();

    private readonly turnAxis = new T.Vector3(0, 0, 1);

    constructor(private readonly config: MovingConfig) {
        this.enteringFromOutside = config.allowEntryFromOutside ?? false;
        this.currentSpeed = config.acceleration === undefined ? config.speed : 0;

        this.chooseTurnDirection();

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
        if (delta <= 0) return;

        if (this.isChangingDirection) {
            this.updateDirectionTransition(delta);
        } else {
            if (this.config.acceleration !== undefined) {
                this.currentSpeed = Math.min(this.config.speed, this.currentSpeed + this.config.acceleration * delta);
            }

            if (this.config.directionMode === "free") {
                const turnRate = this.config.turnRate ?? 0;
                if (turnRate !== 0) this.direction.applyAxisAngle(this.turnAxis, this.turnSign * turnRate * delta);
            }
        }

        target.mesh.position.addScaledVector(this.direction, this.currentSpeed * delta);

        const position = target.mesh.position;
        const { minX, maxX, minY, maxY } = this.config.bounds;

        if (this.enteringFromOutside && position.x >= minX && position.x <= maxX) {
            this.enteringFromOutside = false;
        }

        if (!this.enteringFromOutside && (position.x < minX || position.x > maxX)) {
            if (this.config.onExitBounds) {
                this.config.onExitBounds(target);
                return;
            }

            if (position.x < minX) {
                position.x = minX;
                this.direction.x = Math.abs(this.direction.x);
            } else {
                position.x = maxX;
                this.direction.x = -Math.abs(this.direction.x);
            }

            this.cancelDirectionTransition();
        }

        if (position.y < minY) {
            position.y = minY;
            this.direction.y = Math.abs(this.direction.y);
            this.cancelDirectionTransition();
        } else if (position.y > maxY) {
            position.y = maxY;
            this.direction.y = -Math.abs(this.direction.y);
            this.cancelDirectionTransition();
        }

        if (!this.isChangingDirection) {
            this.changeTimer += delta;

            if (this.changeTimer >= this.nextDirectionChange) {
                this.changeTimer = 0;

                if ((this.config.directionChangeDuration ?? 0) > 0) {
                    this.beginDirectionTransition();
                } else {
                    this.chooseTurnDirection();
                    this.chooseDirection();
                }

                this.setNextDirectionChange();
            }
        }
    }

    private chooseTurnDirection(): void {
        const turnDirection = this.config.turnDirection ?? "counterclockwise";

        if (turnDirection === "clockwise") {
            this.turnSign = -1;
        } else if (turnDirection === "counterclockwise") {
            this.turnSign = 1;
        } else {
            this.turnSign = Math.random() < 0.5 ? -1 : 1;
        }
    }

    private beginDirectionTransition(): void {
        this.transitionStartDirection.copy(this.direction);

        this.chooseTurnDirection();
        this.chooseDirection();

        this.transitionEndDirection.copy(this.direction);
        this.direction.copy(this.transitionStartDirection);

        this.transitionElapsed = 0;
        this.transitionStartSpeed = this.currentSpeed;
        this.transitionMinimumSpeed = Math.min(
            this.transitionStartSpeed,
            this.config.speed * T.MathUtils.clamp(this.config.turnSpeedMultiplier ?? 0.3, 0, 1),
        );

        if (this.config.directionMode === "horizontal" || this.config.directionMode === "vertical") {
            this.isChangingDirection = true;
            return;
        }

        const startAngle = Math.atan2(this.transitionStartDirection.y, this.transitionStartDirection.x);
        const desiredAngle = Math.atan2(this.transitionEndDirection.y, this.transitionEndDirection.x);
        const fullRotation = Math.PI * 2;

        const angleDifference = this.turnSign === 1
            ? ((desiredAngle - startAngle) % fullRotation + fullRotation) % fullRotation
            : -(((startAngle - desiredAngle) % fullRotation + fullRotation) % fullRotation);

        this.transitionStartAngle = startAngle;
        this.transitionEndAngle = startAngle + angleDifference;
        this.isChangingDirection = true;
    }

    private updateDirectionTransition(delta: number): void {
        const duration = this.config.directionChangeDuration ?? 0;

        if (duration <= 0) {
            this.isChangingDirection = false;
            return;
        }

        this.transitionElapsed += delta;

        const progress = T.MathUtils.clamp(this.transitionElapsed / duration, 0, 1);
        const easedProgress = progress * progress * (3 - 2 * progress);
        const reversingOnAxis = this.config.directionMode === "horizontal" || this.config.directionMode === "vertical";

        if (reversingOnAxis) {
            if (progress < 0.5) {
                this.direction.copy(this.transitionStartDirection);
                this.currentSpeed = this.getTransitionSpeed(progress * 2, this.transitionStartSpeed, this.transitionMinimumSpeed);
            } else {
                if (this.config.directionMode === "horizontal") {
                    this.direction.set(-this.transitionStartDirection.x, 0, 0);
                } else {
                    this.direction.set(0, -this.transitionStartDirection.y, 0);
                }

                this.currentSpeed = this.getTransitionSpeed((progress - 0.5) * 2, this.transitionMinimumSpeed, this.config.speed);
            }
        } else {
            const angle = this.transitionStartAngle + (this.transitionEndAngle - this.transitionStartAngle) * easedProgress;
            this.direction.set(Math.cos(angle), Math.sin(angle), 0);

            if (progress < 0.5) {
                this.currentSpeed = this.getTransitionSpeed(progress * 2, this.transitionStartSpeed, this.transitionMinimumSpeed);
            } else {
                this.currentSpeed = this.getTransitionSpeed((progress - 0.5) * 2, this.transitionMinimumSpeed, this.config.speed);
            }
        }

        if (progress >= 1) {
            this.direction.copy(this.transitionEndDirection);
            this.currentSpeed = this.config.speed;
            this.isChangingDirection = false;
            this.transitionElapsed = 0;
        }
    }

    private getTransitionSpeed(progress: number, startSpeed: number, endSpeed: number): number {
        const easedProgress = progress * progress * (3 - 2 * progress);
        return T.MathUtils.lerp(startSpeed, endSpeed, easedProgress);
    }

    private cancelDirectionTransition(): void {
        this.isChangingDirection = false;
        this.transitionElapsed = 0;

        if (this.config.acceleration === undefined) this.currentSpeed = this.config.speed;
    }

    private setNextDirectionChange(): void {
        const min = this.config.directionChangeMin;
        const max = this.config.directionChangeMax;

        if (this.config.changeDirectionOnTimer === false || min === undefined || max === undefined) {
            this.nextDirectionChange = Infinity;
            return;
        }

        this.nextDirectionChange = T.MathUtils.randFloat(min, max);
    }

    private chooseDirection(): void {
        const { directionMode } = this.config;

        if (directionMode === "horizontal") {
            this.direction.set(-this.direction.x || (Math.random() < 0.5 ? -1 : 1), 0, 0);
            return;
        }

        if (directionMode === "vertical") {
            this.direction.set(0, -this.direction.y || (Math.random() < 0.5 ? -1 : 1), 0);
            return;
        }

        if (directionMode === "cardinal") {
            const axis = Math.floor(Math.random() * 2);
            const sign = Math.random() < 0.5 ? -1 : 1;

            this.direction.set(0, 0, 0);
            this.direction.setComponent(axis, sign);
            return;
        }

        this.direction.set(Math.random() * 2 - 1, Math.random() * 2 - 1, 0).normalize();
    }

    setDirection(direction: T.Vector3): void {
        if (direction.lengthSq() === 0) return;
        this.direction.copy(direction).normalize();
    }
}
