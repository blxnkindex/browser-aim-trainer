import { Target } from "./Target";

export interface Behaviour {
    update(target: Target, delta: number): void;
}