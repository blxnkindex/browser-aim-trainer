import * as T from "three";

import { Behaviour } from "./Behaviour";

export class Target {
    readonly mesh: T.Mesh;
    spawnedAt = 0;

    constructor(
        scene: T.Scene,
        size = 0.5,
        private behaviour?: Behaviour,
        color = "#ff0000"
    ) {
        const geometry = new T.SphereGeometry(size, 12, 12);
        const material = new T.MeshBasicMaterial({ color });

        this.mesh = new T.Mesh(geometry, material);
        scene.add(this.mesh);
    }

    spawn(position: T.Vector3, gameTime?: number) {
        this.mesh.position.copy(position);
        this.spawnedAt = gameTime ?? performance.now();
    }

    setBehaviour(behaviour: Behaviour | undefined) {
        this.behaviour = behaviour;
    }

    destroy(scene: T.Scene) {
        scene.remove(this.mesh);
        this.mesh.geometry.dispose();

        const material = this.mesh.material;

        if (Array.isArray(material)) {
            for (const item of material) {
                item.dispose();
            }
        } else {
            material.dispose();
        }
    }

    update(delta: number) {
        this.behaviour?.update(this, delta);
    }
}