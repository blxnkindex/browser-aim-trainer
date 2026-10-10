import * as T from "three";

export interface WallConfig {
    width: number;
    height: number;
    depth: number;
    position: T.Vector3;
    rotation?: T.Euler;
    grid?: boolean;
    gridSize?: number;
    curveRadius?: number;
}

export class Wall {
    public readonly object: T.Group;
    public readonly config: WallConfig;
    private readonly mesh: T.Mesh;
    private readonly gridLines: T.LineSegments | null;

    constructor(config: WallConfig) {
        this.config = config;
        this.object = new T.Group();

        const geometry = config.curveRadius
            ? this.createCurvedGeometry(config.width, config.height, config.curveRadius)
            : new T.BoxGeometry(config.width, config.height, config.depth);

        const material = new T.MeshBasicMaterial({
            color: 0x808080,
            side: T.DoubleSide,
        });

        this.mesh = new T.Mesh(geometry, material);
        this.object.add(this.mesh);

        this.gridLines = config.grid
            ? config.curveRadius
                ? this.createCurvedGrid(config.width, config.height, config.curveRadius, config.gridSize ?? 1)
                : this.createGrid(config.width, config.height, config.depth, config.gridSize ?? 1)
            : null;

        if (this.gridLines) {
            this.object.add(this.gridLines);
        }

        this.object.position.copy(config.position);

        if (config.rotation) {
            this.object.rotation.copy(config.rotation);
        }
    }

    private createCurvedGeometry(width: number, height: number, radius: number): T.BufferGeometry {
        const segments = Math.max(32, Math.ceil(width * 4));
        const vertices: number[] = [];
        const indices: number[] = [];
        const halfHeight = height / 2;
        const halfWidth = width / 2;
        const maxAngle = Math.asin(halfWidth / radius);

        for (let i = 0; i <= segments; i++) {
            const angle = -maxAngle + (maxAngle * 2 * i) / segments;
            const x = radius * Math.sin(angle);
            const z = radius - radius * Math.cos(angle);

            vertices.push(x, -halfHeight, z);
            vertices.push(x, halfHeight, z);
        }

        for (let i = 0; i < segments; i++) {
            const bottomLeft = i * 2;
            const topLeft = bottomLeft + 1;
            const bottomRight = bottomLeft + 2;
            const topRight = bottomLeft + 3;

            indices.push(bottomLeft, bottomRight, topLeft);
            indices.push(topLeft, bottomRight, topRight);
        }

        const geometry = new T.BufferGeometry();

        geometry.setAttribute("position", new T.Float32BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        return geometry;
    }

    private createCurvedGrid(width: number, height: number, radius: number, gridSize: number): T.LineSegments {
        const vertices: number[] = [];
        const halfHeight = height / 2;
        const halfWidth = width / 2;
        const maxAngle = Math.asin(halfWidth / radius);
        const segments = Math.max(32, Math.ceil(width * 4));
        const offset = 0.002;

        const addLine = (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) => {
            vertices.push(x1, y1, z1, x2, y2, z2);
        };

        const pointOnCurve = (angle: number, y: number) => {
            const x = radius * Math.sin(angle);
            const z = radius - radius * Math.cos(angle);
            return new T.Vector3(x, y, z);
        };

        const addVerticalLines = () => {
            const divisions = Math.floor(width / gridSize);

            for (let i = 0; i <= divisions; i++) {
                const x = -halfWidth + Math.min(i * gridSize, width);
                const angle = Math.asin(x / radius);
                const point = pointOnCurve(angle, 0);

                const normalX = -Math.sin(angle);
                const normalZ = Math.cos(angle);

                addLine(
                    point.x + normalX * offset,
                    -halfHeight,
                    point.z + normalZ * offset,
                    point.x + normalX * offset,
                    halfHeight,
                    point.z + normalZ * offset
                );
            }

            const lastX = -halfWidth + divisions * gridSize;

            if (Math.abs(lastX - halfWidth) > 1e-6) {
                const angle = maxAngle;
                const point = pointOnCurve(angle, 0);
                const normalX = -Math.sin(angle);
                const normalZ = Math.cos(angle);

                addLine(
                    point.x + normalX * offset,
                    -halfHeight,
                    point.z + normalZ * offset,
                    point.x + normalX * offset,
                    halfHeight,
                    point.z + normalZ * offset
                );
            }
        };

        const addHorizontalLines = () => {
            const divisions = Math.floor(height / gridSize);

            for (let i = 0; i <= divisions; i++) {
                const y = -halfHeight + Math.min(i * gridSize, height);

                for (let j = 0; j < segments; j++) {
                    const angle1 = -maxAngle + (maxAngle * 2 * j) / segments;
                    const angle2 = -maxAngle + (maxAngle * 2 * (j + 1)) / segments;

                    const point1 = pointOnCurve(angle1, y);
                    const point2 = pointOnCurve(angle2, y);

                    const normalX1 = -Math.sin(angle1);
                    const normalZ1 = Math.cos(angle1);
                    const normalX2 = -Math.sin(angle2);
                    const normalZ2 = Math.cos(angle2);

                    addLine(
                        point1.x + normalX1 * offset,
                        point1.y,
                        point1.z + normalZ1 * offset,
                        point2.x + normalX2 * offset,
                        point2.y,
                        point2.z + normalZ2 * offset
                    );
                }
            }

            const lastY = -halfHeight + divisions * gridSize;

            if (Math.abs(lastY - halfHeight) > 1e-6) {
                const y = halfHeight;

                for (let j = 0; j < segments; j++) {
                    const angle1 = -maxAngle + (maxAngle * 2 * j) / segments;
                    const angle2 = -maxAngle + (maxAngle * 2 * (j + 1)) / segments;

                    const point1 = pointOnCurve(angle1, y);
                    const point2 = pointOnCurve(angle2, y);

                    const normalX1 = -Math.sin(angle1);
                    const normalZ1 = Math.cos(angle1);
                    const normalX2 = -Math.sin(angle2);
                    const normalZ2 = Math.cos(angle2);

                    addLine(
                        point1.x + normalX1 * offset,
                        point1.y,
                        point1.z + normalZ1 * offset,
                        point2.x + normalX2 * offset,
                        point2.y,
                        point2.z + normalZ2 * offset
                    );
                }
            }
        };

        addVerticalLines();
        addHorizontalLines();

        const geometry = new T.BufferGeometry();

        geometry.setAttribute(
            "position",
            new T.Float32BufferAttribute(vertices, 3)
        );

        const material = new T.LineBasicMaterial({
            color: 0x303030,
        });

        return new T.LineSegments(geometry, material);
    }

    private createGrid(width: number, height: number, depth: number, gridSize: number): T.LineSegments {
        const vertices: number[] = [];

        const addLine = (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) => {
            vertices.push(x1, y1, z1);
            vertices.push(x2, y2, z2);
        };

        const halfWidth = width / 2;
        const halfHeight = height / 2;
        const halfDepth = depth / 2;
        const offset = 0.002;

        const addAxisLines = (min: number, max: number, spacing: number, callback: (value: number) => void) => {
            const divisions = Math.floor((max - min) / spacing);

            for (let i = 0; i <= divisions; i++) {
                const value = min + i * spacing;

                if (i === divisions) {
                    callback(max);
                } else {
                    callback(value);
                }
            }

            const last = min + divisions * spacing;

            if (Math.abs(last - max) > 1e-6) {
                callback(max);
            }
        };

        // Front / Back
        addAxisLines(-halfWidth, halfWidth, gridSize, (x) => {
            addLine(x, -halfHeight, halfDepth + offset, x, halfHeight, halfDepth + offset);
            addLine(x, -halfHeight, -halfDepth - offset, x, halfHeight, -halfDepth - offset);
        });

        addAxisLines(-halfHeight, halfHeight, gridSize, (y) => {
            addLine(-halfWidth, y, halfDepth + offset, halfWidth, y, halfDepth + offset);
            addLine(-halfWidth, y, -halfDepth - offset, halfWidth, y, -halfDepth - offset);
        });

        // Left / Right
        addAxisLines(-halfDepth, halfDepth, gridSize, (z) => {
            addLine(-halfWidth - offset, -halfHeight, z, -halfWidth - offset, halfHeight, z);
            addLine(halfWidth + offset, -halfHeight, z, halfWidth + offset, halfHeight, z);
        });

        addAxisLines(-halfHeight, halfHeight, gridSize, (y) => {
            addLine(-halfWidth - offset, y, -halfDepth, -halfWidth - offset, y, halfDepth);
            addLine(halfWidth + offset, y, -halfDepth, halfWidth + offset, y, halfDepth);
        });

        // Top / Bottom
        addAxisLines(-halfWidth, halfWidth, gridSize, (x) => {
            addLine(x, halfHeight + offset, -halfDepth, x, halfHeight + offset, halfDepth);
            addLine(x, -halfHeight - offset, -halfDepth, x, -halfHeight - offset, halfDepth);
        });

        addAxisLines(-halfDepth, halfDepth, gridSize, (z) => {
            addLine(-halfWidth, halfHeight + offset, z, halfWidth, halfHeight + offset, z);
            addLine(-halfWidth, -halfHeight - offset, z, halfWidth, -halfHeight - offset, z);
        });

        const gridGeometry = new T.BufferGeometry();

        gridGeometry.setAttribute(
            "position",
            new T.Float32BufferAttribute(vertices, 3)
        );

        const gridMaterial = new T.LineBasicMaterial({
            color: 0x303030,
        });

        return new T.LineSegments(gridGeometry, gridMaterial);
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