import * as T from "three";

export class TrainingBox {
    constructor(scene: T.Scene) {
        const size = 20;
        const divisions = 20;

        const floor = new T.GridHelper(size, divisions);
        floor.position.set(0, -10, -7.5);
        scene.add(floor);

        const ceiling = new T.GridHelper(size, divisions);
        ceiling.position.set(0, 10, -7.5);
        ceiling.rotation.x = Math.PI;
        scene.add(ceiling);

        const backWall = new T.GridHelper(size, divisions);
        backWall.position.set(0, 0, -17.5);
        backWall.rotation.x = Math.PI / 2;
        scene.add(backWall);

        const leftWall = new T.GridHelper(size, divisions);
        leftWall.position.set(-10, 0, -7.5);
        leftWall.rotation.z = Math.PI / 2;
        scene.add(leftWall);

        const rightWall = new T.GridHelper(size, divisions);
        rightWall.position.set(10, 0, -7.5);
        rightWall.rotation.z = Math.PI / 2;
        scene.add(rightWall);
    }
}