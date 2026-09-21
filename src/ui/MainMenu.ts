import { ScenarioConfig } from "../scenarios/Scenario";

export class MainMenu<T extends string> {
    private element: HTMLDivElement;
    private scenarioSelect: HTMLSelectElement;

    constructor(
        private scenarios: Record<T, ScenarioConfig>,
        onStart: (id: T) => void,
        onSettings: () => void
    ) {
        this.element = document.createElement("div");
        this.element.id = "menu";

        const title = document.createElement("h1");
        title.textContent = "AIM TRAINER";

        const label = document.createElement("label");
        label.textContent = "Scenario";

        this.scenarioSelect = document.createElement("select");

        for (const id of Object.keys(scenarios) as T[]) {
            const option = document.createElement("option");

            option.value = id;
            option.textContent = id;

            this.scenarioSelect.appendChild(option);
        }

        const playButton = document.createElement("button");
        playButton.textContent = "PLAY";

        playButton.addEventListener("click", () => {
            onStart(this.scenarioSelect.value as T);
        });

        this.element.appendChild(title);
        this.element.appendChild(label);
        this.element.appendChild(this.scenarioSelect);
        this.element.appendChild(playButton);
        document.body.appendChild(this.element);

        const settingsButton = document.createElement("button");
        settingsButton.textContent = "SETTINGS";

        settingsButton.addEventListener("click", () => {
            onSettings();
        });
        this.element.appendChild(settingsButton);
    }

    show() {
        this.element.style.display = "flex";
    }

    hide() {
        this.element.style.display = "none";
    }
}