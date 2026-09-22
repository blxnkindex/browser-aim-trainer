import * as T from "three";

export interface WallConfig {
    width: number;
    height: number;
    depth: number;
    position: T.Vector3;
    rotation?: T.Euler;
    grid?: boolean;
    gridSize?: number;
}

export class Wall {
    public readonly object: T.Group;

    private readonly mesh: T.Mesh;
    private readonly gridLines: T.LineSegments | null;

    constructor(config: WallConfig) {
        this.object = new T.Group();

        const geometry = new T.BoxGeometry(
            config.width,
            config.height,
            config.depth
        );

        const material = new T.MeshBasicMaterial({
            color: 0x808080,
        });

        this.mesh = new T.Mesh(geometry, material);
        this.object.add(this.mesh);

        this.gridLines = config.grid
            ? this.createGrid(
                  config.width,
                  config.height,
                  config.depth,
                  config.gridSize ?? 1
              )
            : null;

        if (this.gridLines) {
            this.object.add(this.gridLines);
        }

        this.object.position.copy(config.position);

        if (config.rotation) {
            this.object.rotation.copy(config.rotation);
        }
    }

    private createGrid(
        width: number,
        height: number,
        depth: number,
        gridSize: number
    ): T.LineSegments {
        const vertices: number[] = [];

        const addLine = (
            x1: number,
            y1: number,
            z1: number,
            x2: number,
            y2: number,
            z2: number
        ) => {
            vertices.push(x1, y1, z1);
            vertices.push(x2, y2, z2);
        };

        const halfWidth = width / 2;
        const halfHeight = height / 2;
        const halfDepth = depth / 2;

        const offset = 0.002;

        const addAxisLines = (
            min: number,
            max: number,
            spacing: number,
            callback: (value: number) => void
        ) => {
            const divisions = Math.floor((max - min) / spacing);

            for (let i = 0; i <= divisions; i++) {
                const value = min + i * spacing;

                // Snap the final line exactly to the edge.
                if (i === divisions) {
                    callback(max);
                } else {
                    callback(value);
                }
            }

            // If the spacing does not land on the far edge,
            // explicitly add the edge as a grid line.
            const last = min + divisions * spacing;

            if (Math.abs(last - max) > 1e-6) {
                callback(max);
            }
        };

        // ---------------------------------------------------------
        // Front / Back
        // ---------------------------------------------------------

        addAxisLines(
            -halfWidth,
            halfWidth,
            gridSize,
            (x) => {
                addLine(
                    x,
                    -halfHeight,
                    halfDepth + offset,
                    x,
                    halfHeight,
                    halfDepth + offset
                );

                addLine(
                    x,
                    -halfHeight,
                    -halfDepth - offset,
                    x,
                    halfHeight,
                    -halfDepth - offset
                );
            }
        );

        addAxisLines(
            -halfHeight,
            halfHeight,
            gridSize,
            (y) => {
                addLine(
                    -halfWidth,
                    y,
                    halfDepth + offset,
                    halfWidth,
                    y,
                    halfDepth + offset
                );

                addLine(
                    -halfWidth,
                    y,
                    -halfDepth - offset,
                    halfWidth,
                    y,
                    -halfDepth - offset
                );
            }
        );

        // ---------------------------------------------------------
        // Left / Right
        // ---------------------------------------------------------

        addAxisLines(
            -halfDepth,
            halfDepth,
            gridSize,
            (z) => {
                addLine(
                    -halfWidth - offset,
                    -halfHeight,
                    z,
                    -halfWidth - offset,
                    halfHeight,
                    z
                );

                addLine(
                    halfWidth + offset,
                    -halfHeight,
                    z,
                    halfWidth + offset,
                    halfHeight,
                    z
                );
            }
        );

        addAxisLines(
            -halfHeight,
            halfHeight,
            gridSize,
            (y) => {
                addLine(
                    -halfWidth - offset,
                    y,
                    -halfDepth,
                    -halfWidth - offset,
                    y,
                    halfDepth
                );

                addLine(
                    halfWidth + offset,
                    y,
                    -halfDepth,
                    halfWidth + offset,
                    y,
                    halfDepth
                );
            }
        );

        // ---------------------------------------------------------
        // Top / Bottom
        // ---------------------------------------------------------

        addAxisLines(
            -halfWidth,
            halfWidth,
            gridSize,
            (x) => {
                addLine(
                    x,
                    halfHeight + offset,
                    -halfDepth,
                    x,
                    halfHeight + offset,
                    halfDepth
                );

                addLine(
                    x,
                    -halfHeight - offset,
                    -halfDepth,
                    x,
                    -halfHeight - offset,
                    halfDepth
                );
            }
        );

        addAxisLines(
            -halfDepth,
            halfDepth,
            gridSize,
            (z) => {
                addLine(
                    -halfWidth,
                    halfHeight + offset,
                    z,
                    halfWidth,
                    halfHeight + offset,
                    z
                );

                addLine(
                    -halfWidth,
                    -halfHeight - offset,
                    z,
                    halfWidth,
                    -halfHeight - offset,
                    z
                );
            }
        );

        const gridGeometry = new T.BufferGeometry();

        gridGeometry.setAttribute(
            "position",
            new T.Float32BufferAttribute(vertices, 3)
        );

        const gridMaterial = new T.LineBasicMaterial({
            color: 0x303030,
        });

        return new T.LineSegments(
            gridGeometry,
            gridMaterial
        );
    }

    dispose(): void {
        this.mesh.geometry.dispose();

        if (Array.isArray(this.mesh.material)) {
            for (const material of this.mesh.material) {
                material.dispose();
            }
        } else {
            this.mesh.material.dispose();
        }

        if (this.gridLines) {
            this.gridLines.geometry.dispose();

            if (Array.isArray(this.gridLines.material)) {
                for (const material of this.gridLines.material) {
                    material.dispose();
                }
            } else {
                this.gridLines.material.dispose();
            }
        }
    }
}