import { Scenario } from "../scenarios/Scenario";
import { Score } from "../sys/Score";
import {
    parseValorantCrosshairCodeSafe,
    renderCrosshair,
} from "../config/Crosshair";

import { userconfig } from "../config/UserConfig";

export class HUD {
    private timerElement: HTMLDivElement;
    private scoreElement: HTMLDivElement;
    private fpsElement: HTMLDivElement;
    private resultsElement: HTMLDivElement;
    private resumeButton: HTMLButtonElement;
    private pauseElement: HTMLDivElement;
    private mainMenuButton: HTMLButtonElement;

    private crosshairCanvas: HTMLCanvasElement;


    private lastFrameTime = performance.now();
    private frameCount = 0;
    private fps = 0;

    private cooldownInterval: number | null = null;

    constructor(
        private scenario: Scenario | null = null,
        private score: Score | null = null,
        private onRestart: () => void,
        private onMainMenu: () => void
    ) {
        this.timerElement = document.createElement("div");
        this.scoreElement = document.createElement("div");
        this.fpsElement = document.createElement("div");
        this.resultsElement = document.createElement("div");
        this.pauseElement = document.createElement("div");
        this.resumeButton = document.createElement("button");
        this.mainMenuButton = document.createElement("button");

        this.timerElement.id = "timer";
        this.scoreElement.id = "score";
        this.fpsElement.id = "fps";
        this.resultsElement.id = "results";
        this.pauseElement.id = "pause";
        this.resumeButton.id = "resume-button";
        this.resultsElement.style.display = "none";
        this.pauseElement.innerHTML = "<div>PAUSED</div>";
        this.resumeButton.textContent = "RESUME";
        this.mainMenuButton.textContent = "MAIN MENU";
        this.pauseElement.style.display = "none";

        document.body.appendChild(this.timerElement);
        document.body.appendChild(this.scoreElement);
        document.body.appendChild(this.fpsElement);
        document.body.appendChild(this.resultsElement);
        document.body.appendChild(this.pauseElement);
        this.pauseElement.appendChild(this.resumeButton);
        this.pauseElement.appendChild(this.mainMenuButton);

        this.mainMenuButton.addEventListener("click", () => {
            this.onMainMenu();
        });

        this.crosshairCanvas =
            document.getElementById("xhair") as HTMLCanvasElement;

        this.refreshCrosshair();

        this.hideCrosshair();
    }

    update(timestamp: number) {
        if (!this.scenario || !this.score) {
            return;
        }

        this.frameCount++;

        if (timestamp - this.lastFrameTime >= 500) {
            this.fps =
                this.frameCount /
                ((timestamp - this.lastFrameTime) / 1000);

            this.frameCount = 0;
            this.lastFrameTime = timestamp;
        }

        if (this.scenario.isPaused) {
            this.timerElement.textContent = "PAUSED";
        } else {
            this.timerElement.textContent =
                `${(this.scenario.remaining / 1000).toFixed(1)}s`;
        }
        this.scoreElement.textContent = `Score: ${this.score.pts} | Hits: ${this.score.hits} | Shots: ${this.score.shots} | Accuracy: ${(this.score.accuracy * 100).toFixed(1)}%`;
        this.fpsElement.textContent = `FPS: ${Math.round(this.fps)}`;
    }

    setScenario(scenario: Scenario, score: Score) {
        this.scenario = scenario;
        this.score = score;

        const crosshairProfile =
            parseValorantCrosshairCodeSafe(
                userconfig.crosshairCode
            );

        renderCrosshair(
            this.crosshairCanvas,
            crosshairProfile
        );
    }

    showResults() {
        if (!this.score) {
            return;
        }
        
        this.hideCrosshair();

        this.timerElement.style.display = "none";
        this.scoreElement.style.display = "none";
        this.resultsElement.innerHTML = `
            <div>Score: ${this.score.pts}</div>
            <div>Accuracy: ${(this.score.accuracy * 100).toFixed(1)}%</div>
            <div>Average Reaction: ${this.score.averageReactionTime.toFixed(0)} ms</div>
            <div>Best Reaction: ${this.score.bestReactionTime.toFixed(0)} ms</div>
            <button id="restart-button">PLAY AGAIN</button>
        `;

        this.resultsElement.style.display = "block";

        const restartButton =
            this.resultsElement.querySelector<HTMLButtonElement>("#restart-button");

        restartButton?.addEventListener("click", () => {
            this.resultsElement.style.display = "none";
            this.onRestart();
        });
    }

    hideResults() {
        this.timerElement.style.display = "block";
        this.scoreElement.style.display = "block";
        this.resultsElement.style.display = "none";
        this.showCrosshair();
    }

    get isResumeDisabled(): boolean {
        return this.resumeButton.disabled;
    }

    private clearCooldown() {
        if (this.cooldownInterval !== null) {
            clearInterval(this.cooldownInterval);
            this.cooldownInterval = null;
        }
    }

    showPaused(onResume: () => void) {
        this.pauseElement.style.display = "block";
        this.clearCooldown();

        // Browser enforces a ~1.25s security cooldown on requestPointerLock after ESC exit.
        // We buffer it slightly to 1300ms to guarantee Chrome's internal timer has expired.
        const COOLDOWN_MS = 1300;
        const startTime = performance.now();

        this.resumeButton.disabled = true;

        const updateButtonState = () => {
            const elapsed = performance.now() - startTime;
            const remaining = COOLDOWN_MS - elapsed;

            if (remaining <= 0) {
                this.enableResume();
            } else {
                const seconds = (remaining / 1000).toFixed(1);
                this.resumeButton.textContent = `RESUME (${seconds}s)`;
            }
        };

        updateButtonState();
        this.cooldownInterval = window.setInterval(updateButtonState, 50);

        this.resumeButton.onclick = () => {
            if (this.resumeButton.disabled) return;
            this.resumeButton.disabled = true;
            this.resumeButton.textContent = "RESUMING...";
            onResume();
        };
    }

    enableResume() {
        this.clearCooldown();
        this.resumeButton.disabled = false;
        this.resumeButton.textContent = "RESUME";
    }

    hidePaused() {
        this.clearCooldown();
        this.pauseElement.style.display = "none";
        this.resumeButton.disabled = false;
        this.resumeButton.textContent = "RESUME";
    }

    showCrosshair() {
        this.crosshairCanvas.style.display = "block";
    }

    hideCrosshair() {
        this.crosshairCanvas.style.display = "none";
    }

    refreshCrosshair() {
        const crosshairProfile =
            parseValorantCrosshairCodeSafe(
                userconfig.crosshairCode
            );

        renderCrosshair(
            this.crosshairCanvas,
            crosshairProfile
        );
    }
}