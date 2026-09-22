import * as T from "three";
import { Wall, WallConfig } from "./Wall";

export interface EnvironmentDefinition {
    walls: WallConfig[];
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

    dispose(): void {
        for (const wall of this.walls) {
            wall.dispose();
        }
        this.walls.length = 0;
    }
}