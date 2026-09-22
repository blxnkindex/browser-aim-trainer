import * as T from "three";
import { Behaviour } from "./Behaviour";

export interface TargetBounds {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
}

export class Target {
    readonly mesh: T.Mesh;
    spawnedAt = 0;

    constructor(
        scene: T.Scene,
        size = 0.5,
        private readonly bounds: TargetBounds = {
            minX: -5,
            maxX: 5,
            minY: -3.5,
            maxY: 3.5,
            minZ: -9,
            maxZ: -9,
        },
        private readonly behaviour?: Behaviour,
        color = "#ff0000"
    ) {
        const geometry = new T.SphereGeometry(size, 12, 12);
        const material = new T.MeshBasicMaterial({color,});

        this.mesh = new T.Mesh(geometry, material);
        scene.add(this.mesh);
        this.spawn();
    }

    spawn() {
        this.mesh.position.set(
            T.MathUtils.randFloat(
                this.bounds.minX,
                this.bounds.maxX
            ),
            T.MathUtils.randFloat(
                this.bounds.minY,
                this.bounds.maxY
            ),
            T.MathUtils.randFloat(
                this.bounds.minZ,
                this.bounds.maxZ
            )
        );

        this.spawnedAt = performance.now();
    }

    destroy(scene: T.Scene) {
        scene.remove(this.mesh);
        this.mesh.geometry.dispose();

        if (Array.isArray(this.mesh.material)) {
            this.mesh.material.forEach(material => material.dispose());
        } else {
            this.mesh.material.dispose();
        }
    }

    update(delta: number) {
        this.behaviour?.update(this, delta);
    }
}