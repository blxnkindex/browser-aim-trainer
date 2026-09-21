import * as T from "three";

export class HitDetection {
    private raycaster = new T.Raycaster();
    private screenCenter = new T.Vector2(0, 0);

    constructor(private camera: T.Camera) {}

    check(targets: T.Object3D[]): T.Object3D | null {
        this.raycaster.setFromCamera(this.screenCenter, this.camera);
        const hits = this.raycaster.intersectObjects(targets, true);
        return hits.length > 0 ? hits[0].object : null;
    }
}