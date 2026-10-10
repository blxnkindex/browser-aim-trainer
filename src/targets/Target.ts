import * as T from "three";
import { Behaviour } from "./Behaviour";

export class Target {
    readonly mesh: T.Mesh;
    spawnedAt = 0;

    constructor(
        scene: T.Scene,
        size = 0.5,
        private readonly behaviour?: Behaviour,
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

    destroy(scene: T.Scene) {
        scene.remove(this.mesh);
        this.mesh.geometry.dispose();

        if (Array.isArray(this.mesh.material)) {
            this.mesh.material.forEach((material) => material.dispose());
        } else {
            this.mesh.material.dispose();
        }
    }

    update(delta: number) {
        this.behaviour?.update(this, delta);
    }
}