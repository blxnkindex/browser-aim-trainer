export interface UserConfig {
    sensitivity: number;
    targetColor: string;
    crosshairCode: string;
}

const DEFAULT_CONFIG: UserConfig = {
    sensitivity: 0.25,
    targetColor: "#ff0000",
    crosshairCode: "0;P;d;1;f;0;0t;4;0l;1;0o;0;0a;1;0f;0;1b;0",
};

const SAVE_KEY = "aim-trainer-settings";

function loadConfig(): UserConfig {
    const saved = localStorage.getItem(SAVE_KEY);

    if (!saved) {
        return { ...DEFAULT_CONFIG };
    }

    try {
        const parsed = JSON.parse(saved);

        return {
            sensitivity: typeof parsed.sensitivity === "number" ? parsed.sensitivity : DEFAULT_CONFIG.sensitivity,
            targetColor: typeof parsed.targetColor === "string" ? parsed.targetColor : DEFAULT_CONFIG.targetColor,
            crosshairCode: typeof parsed.crosshairCode === "string" ? parsed.crosshairCode : DEFAULT_CONFIG.crosshairCode,
        };
    } catch {
        return { ...DEFAULT_CONFIG };
    }
}

export const userconfig: UserConfig = loadConfig();

export function saveConfig() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(userconfig));
}