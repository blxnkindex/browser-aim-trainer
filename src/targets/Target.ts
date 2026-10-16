
import * as T from "three";

import { Behaviour } from "./Behaviour";

export class Target {
    readonly mesh: T.Mesh;
    spawnedAt = 0;
    health: number | null;

    private healthBarBackground: T.Sprite | null = null;
    private healthBarFill: T.Sprite | null = null;
    private healthBarMaterials: T.SpriteMaterial[] = [];

    private readonly healthBarWidth: number;
    private readonly healthBarHeight: number;

    constructor(
        scene: T.Scene,
        size = 0.5,
        private behaviour?: Behaviour,
        color = "#ff0000",
        private readonly maxHealth?: number
    ) {
        const geometry = new T.SphereGeometry(size, 12, 12);
        const material = new T.MeshBasicMaterial({ color });

        this.mesh = new T.Mesh(geometry, material);
        this.health = maxHealth ?? null;

        this.healthBarWidth = size * 2.4;
        this.healthBarHeight = size * 0.22;

        scene.add(this.mesh);

        // Only create a health bar for targets with health configured.
        if (maxHealth !== undefined && maxHealth > 0) {
            this.createHealthBar(size);
        }
    }

    private createHealthBar(size: number) {
        const backgroundMaterial = new T.SpriteMaterial({
            color: "#222222",
            depthTest: false,
            depthWrite: false,
            transparent: true,
        });

        const fillMaterial = new T.SpriteMaterial({
            color: "#35e06f",
            depthTest: false,
            depthWrite: false,
            transparent: true,
        });

        this.healthBarMaterials.push(
            backgroundMaterial,
            fillMaterial
        );

        this.healthBarBackground = new T.Sprite(backgroundMaterial);
        this.healthBarFill = new T.Sprite(fillMaterial);

        this.healthBarBackground.scale.set(
            this.healthBarWidth,
            this.healthBarHeight,
            1
        );

        this.healthBarFill.scale.set(
            this.healthBarWidth,
            this.healthBarHeight,
            1
        );

        // Place the bar above the target.
        this.healthBarBackground.position.set(0, size * 1.5, 0);
        this.healthBarFill.position.set(0, size * 1.5, 0.01);

        // Render above the target geometry.
        this.healthBarBackground.renderOrder = 10;
        this.healthBarFill.renderOrder = 11;

        // Attach both sprites to the target so they follow its movement.
        this.mesh.add(this.healthBarBackground);
        this.mesh.add(this.healthBarFill);

        this.updateHealthBar();
    }

    private updateHealthBar() {
        if (
            this.health === null ||
            this.maxHealth === undefined ||
            this.maxHealth <= 0 ||
            !this.healthBarBackground ||
            !this.healthBarFill
        ) {
            return;
        }

        const ratio = T.MathUtils.clamp(
            this.health / this.maxHealth,
            0,
            1
        );

        // Hide the bar until the target has taken damage.
        const visible = ratio < 1;

        this.healthBarBackground.visible = visible;
        this.healthBarFill.visible = visible;

        // Shrink the fill from left to right.
        this.healthBarFill.scale.x = this.healthBarWidth * ratio;
        this.healthBarFill.position.x =
            -this.healthBarWidth * (1 - ratio) / 2;

        // Change colour as health gets lower.
        if (ratio > 0.5) {
            this.healthBarFill.material.color.set("#35e06f");
        } else if (ratio > 0.25) {
            this.healthBarFill.material.color.set("#ffd447");
        } else {
            this.healthBarFill.material.color.set("#ff4545");
        }
    }

    spawn(position: T.Vector3, gameTime?: number) {
        this.mesh.position.copy(position);
        this.spawnedAt = gameTime ?? performance.now();

        // Restore health and hide the health bar on respawn.
        this.health = this.maxHealth ?? null;
        this.updateHealthBar();
    }

    takeDamage(amount: number): boolean {
        if (
            this.health === null ||
            this.health <= 0 ||
            amount <= 0
        ) {
            return false;
        }

        this.health = Math.max(0, this.health - amount);
        this.updateHealthBar();

        return this.health === 0;
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

        // Dispose the health bar materials as well.
        for (const healthBarMaterial of this.healthBarMaterials) {
            healthBarMaterial.dispose();
        }

        this.healthBarMaterials = [];
        this.healthBarBackground = null;
        this.healthBarFill = null;
    }

    update(delta: number) {
        this.behaviour?.update(this, delta);
    }
}
