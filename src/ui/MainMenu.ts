import { ScenarioConfig } from "../scenarios/Scenario";

export class MainMenu<T extends string> {
    private element: HTMLDivElement;
    private scenarioSelect: HTMLSelectElement;
    private playButton: HTMLButtonElement;
    private settingsButton: HTMLButtonElement;

    constructor(
        private scenarios: Record<T, ScenarioConfig>,
        private onPlay: (scenarioId: T) => void,
        private onSettings: () => void
    ) {
        this.element = document.createElement("div");
        this.element.id = "menu";

        const header = document.createElement("div");
        header.className = "menu-header";
        const eyebrow = document.createElement("div");
        eyebrow.className = "menu-eyebrow";
        eyebrow.textContent = "AIM TRAINING SYSTEM";
        const title = document.createElement("h1");
        title.textContent = "AIM TRAINER";
        const status = document.createElement("div");
        status.className = "menu-status";
        status.innerHTML = `
            <span class="menu-status-indicator"></span>
            SYSTEM READY
        `;
        header.appendChild(eyebrow);
        header.appendChild(title);
        header.appendChild(status);

        const scenarioSection = document.createElement("div");
        scenarioSection.className = "menu-section";
        const scenarioLabel = document.createElement("label");
        scenarioLabel.className = "ui-label";
        scenarioLabel.textContent = "SCENARIO";
        scenarioLabel.htmlFor = "scenario-select";
        this.scenarioSelect = document.createElement("select");
        this.scenarioSelect.id = "scenario-select";
        this.scenarioSelect.className = "ui-select";
        for (const id of Object.keys(this.scenarios) as T[]) {
            const option = document.createElement("option");
            option.value = id;
            option.textContent = id;
            this.scenarioSelect.appendChild(option);
        }
        scenarioSection.appendChild(scenarioLabel);
        scenarioSection.appendChild(this.scenarioSelect);

        const actions = document.createElement("div");
        actions.className = "menu-actions";
        this.playButton = document.createElement("button");
        this.playButton.className = "ui-button ui-button-primary";
        this.playButton.textContent = "PLAY";
        this.settingsButton = document.createElement("button");
        this.settingsButton.className = "ui-button";
        this.settingsButton.textContent = "SETTINGS";
        actions.appendChild(this.playButton);
        actions.appendChild(this.settingsButton);

        const footer = document.createElement("div");
        footer.className = "menu-footer";
        const version = document.createElement("span");
        version.textContent = "AIM TRAINER // WEB";
        const session = document.createElement("span");
        session.textContent = "LOCAL SESSION";
        footer.appendChild(version);
        footer.appendChild(session);

        this.element.appendChild(header);
        this.element.appendChild(scenarioSection);
        this.element.appendChild(actions);
        this.element.appendChild(footer);

        document.body.appendChild(this.element);

        this.playButton.addEventListener("click", () => {
            const id = this.scenarioSelect.value as T;
            this.onPlay(id);
        });

        this.settingsButton.addEventListener("click", () => {
            this.onSettings();
        });
    }

    show(): void {
        this.element.style.display = "flex";
    }

    hide(): void {
        this.element.style.display = "none";
    }
}