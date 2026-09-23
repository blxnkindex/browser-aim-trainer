import * as T from "three";
import { userConfig } from "../config/UserConfig";
import { VALORANT_YAW } from "../config/Valorant";


export class Camera {
    private readonly rig: T.Object3D;
    private readonly pitchObject: T.Object3D;
    private readonly cam: T.PerspectiveCamera;

    private yaw = 0;
    private pitch = 0;

    constructor(camera: T.PerspectiveCamera) {
        this.cam = camera;

        this.rig = new T.Object3D();
        this.pitchObject = new T.Object3D();

        this.pitchObject.add(this.cam);
        this.rig.add(this.pitchObject);

        this.cam.position.set(0, 0, 0);

        document.addEventListener("mousemove", this.moveMouse);
    }

    get object() {
        return this.rig;
    }

private moveMouse = (event: MouseEvent) => {
    if (document.pointerLockElement === null) return;

    const radiansPerCount = (VALORANT_YAW * userConfig.sensitivity * Math.PI) / 180;

    this.yaw -= event.movementX * radiansPerCount;
    this.pitch -= event.movementY * radiansPerCount;

    const limit = Math.PI / 2 - 0.01;

    this.pitch = T.MathUtils.clamp(this.pitch, -limit, limit);

    this.rig.rotation.y = this.yaw;
    this.pitchObject.rotation.x = this.pitch;
};

    dispose() {
        document.removeEventListener("mousemove", this.moveMouse);
    }
}