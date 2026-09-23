import * as T from "three";

import "./style.css";

import { Score } from "./sys/Score";
import { Camera } from "./player/Camera";
import { HitDetection } from "./sys/HitDetection";
import { Scenario, ScenarioConfig } from "./scenarios/Scenario";
import { HUD } from "./ui/HUD";
import { scenarios } from "./scenarios/definitions";
import { MainMenu } from "./ui/MainMenu";
import { ScenarioSettings } from "./ui/ScenarioSettings";
import { valorantVFOV } from "./config/Valorant";
import { SettingsMenu } from "./ui/Settings";
import { userconfig } from "./config/UserConfig";
import { Environment } from "./environment/Environment";
import { box } from "./environment/definitions";
import { Weapon } from "./weapon/Weapon";
import { Skin } from "./weapon/Skin";
import { SkinCatalog } from "./weapon/SkinCatalog";
import { SkinSelector } from "./ui/SkinSettings";

const canvas = document.querySelector<HTMLCanvasElement>("#game");

if (!canvas) {
    throw new Error("Game canvas not found");
}

const renderer = new T.WebGLRenderer({canvas, antialias: true,});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth,window.innerHeight);

const scene = new T.Scene();
scene.background = new T.Color(0x111111);
const environment = new Environment(box);
scene.add(environment.object);

const aspect = window.innerWidth / window.innerHeight;
const camera = new T.PerspectiveCamera(valorantVFOV(aspect), aspect, 0.1, 1000);
const cameraController = new Camera(camera);
scene.add(cameraController.object);

const weapon = new Weapon();
const skinCatalog = new SkinCatalog();
let currentSkin = null as Skin | null;
let skinSelector: SkinSelector;

skinCatalog.load()
    .then(() => {
        const warden = skinCatalog.getById("warden");

        if (!warden) {
            throw new Error("Warden skin was not found.");
        }

        currentSkin = warden;
        weapon.equipSkin(warden);
        weapon.show();

        skinSelector = new SkinSelector(
            skinCatalog,
            currentSkin,
            (skin) => {
                currentSkin = skin;
                weapon.equipSkin(skin);
            },
            () => {
                skinSelector.hide();
                settings.show();
            }
        );
    })
    .catch((error) => {
        console.error("Failed to load skin catalog:", error);
    });

let scenario: Scenario | null = null;
let score: Score | null = null;
let hitDetection: HitDetection | null = null;
let hud: HUD | null = null;

const requestLock = async (): Promise<boolean> => {
    try {
        const promise = canvas.requestPointerLock({
            unadjustedMovement: true,
        } as PointerLockOptions);

        if (promise && "then" in promise) {
            await promise;
        }

        return true;
    } catch (err: any) {
        if (err?.name === "NotSupportedError") {
            try {
                const fallback = canvas.requestPointerLock();

                if (fallback && "then" in fallback) {
                    await fallback;
                }

                return true;
            } catch (fallbackErr) {
                console.warn(
                    "Pointer lock fallback failed:",
                    fallbackErr
                );

                return false;
            }
        }
        console.warn("Pointer lock request failed:",err);
        return false;
    }
};

const startScenario = async () => {
    if (!scenario || !score || !hud) {
        return;
    }

    score.reset();
    scenario.start();

    const locked = await requestLock();

    if (!locked) {
        console.warn("Failed to lock pointer");
    }
    hud.hideResults();
};

const pauseScenario = () => {
    if (!scenario || !hud) {
        return;
    }

    if (!scenario.isActive) {
        return;
    }
    scenario.pause();
    hud.showPaused(resumeScenario);
};

const exitScenario = () => {
    if (!scenario || !score || !hud) {
        return;
    }

    score.reset();
    document.exitPointerLock();
    scenario.end();
    hud.hidePaused();
    hud.hideResults();
    menu.show();
};

const resumeScenario = () => {
    if (!scenario || !scenario.isPaused) {
        return;
    }

    requestLock();
};

type ScenarioId = keyof typeof scenarios;

let currentConfig: ScenarioConfig | null = null;
const startGame = async (config: ScenarioConfig) => {
    currentConfig = config;

    scenario = scenario = new Scenario(scene,config,userconfig.targetColor);
    score = new Score();
    hitDetection = new HitDetection(camera);

    if (!hud) {
        hud = new HUD(
            scenario,
            score,
            () => {
                if (currentConfig) {
                    startGame(currentConfig);
                }
            },
            exitScenario
        );
    } else {
        hud.setScenario(scenario, score);
    }

    await startScenario();
};

const configMenu = new ScenarioSettings(
    scenarios,
    async (config) => {
        configMenu.hide();
        await startGame(config);
    },
    () => {
        configMenu.hide();
        menu.show();
    }
);

const menu = new MainMenu(
    scenarios,
    (id) => {
        menu.hide();
        configMenu.show(id);
    },
    () => {
        menu.hide();
        settings.show();
    }
);

const settings = new SettingsMenu(
    () => {
        settings.hide();
        menu.show();
    },
    () => {
        settings.hide();
        if (skinSelector) {
            skinSelector.show(currentSkin);
        }
    }
);

document.addEventListener("pointerlockchange", () => {
        if (!scenario || !hud) {
            return;
        }

        if (document.pointerLockElement !== null) {
            if (scenario.currentState === "paused") {
                scenario.resume();
            }

            hud.hidePaused();
            return;
        }

        if (scenario.currentState === "running") {
            pauseScenario();
        }
    }
);

document.addEventListener("pointerlockerror", () => {
        if (!scenario || !hud) {
            return;
        }

        if (scenario.isPaused) {
            hud.enableResume();
        }
    }
);

window.addEventListener("keydown", (e) => {
    if (!scenario || !hud) {
        return;
    }

    if (e.code === "Escape") {
        if (scenario.isPaused && !hud.isResumeDisabled) {
            resumeScenario();
        }
    }
});

canvas.addEventListener("mousedown", () => {
    if (!scenario || !score || !hitDetection) {
        return;
    }

    if (!scenario.isActive) {
        return;
    }

    if (document.pointerLockElement !== canvas) {
        requestLock();
        return;
    }

    weapon.fire();
    const hit = hitDetection.check(scenario.activeTargets.map(target => target.mesh));
    if (hit) {
        const hitTarget = scenario.activeTargets.find(
            target => target.mesh === hit
        );

        if (hitTarget) {
            score.recordShot(
                true,
                performance.now() - hitTarget.spawnedAt
            );

            weapon.playHitSound();

            hitTarget.spawn();
        } else {
            score.recordShot(false, 0);
            weapon.resetHitSoundSequence();
        }
    } else {
        score.recordShot(false, 0);
        weapon.resetHitSoundSequence();
    }
});

window.addEventListener("resize", () => {
    const aspect = window.innerWidth / window.innerHeight;

    camera.aspect = aspect;
    camera.fov = valorantVFOV(aspect);

    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
});

let lastTimestamp = 0;
function animate(timestamp: number) {
    const delta = lastTimestamp === 0 ? 0 : (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (scenario) {
        scenario.update(delta);
    }

    if (hud) {
        hud.update(timestamp);
    }

    if (scenario && hud && scenario.finished && scenario.currentState === "running") {
        scenario.end();
        document.exitPointerLock();
        hud.showResults();
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);