export const VALORANT_YAW = 0.07;
export const VALORANT_HFOV = 103;

export function valorantVFOV(aspect: number): number {
    const horizontalFovRad = (VALORANT_HFOV * Math.PI) / 180;
    const verticalFovRad = 2 * Math.atan(Math.tan(horizontalFovRad / 2) / aspect);
    return (verticalFovRad * 180) / Math.PI;
}