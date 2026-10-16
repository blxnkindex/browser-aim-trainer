
import { ScenarioConfig } from "../scenarios/Scenario";

type ScenarioCategory = "clicking" | "tracking" | "switching" | "training";

const categories: { id: ScenarioCategory; label: string }[] = [
    { id: "clicking", label: "CLICKING" },
    { id: "tracking", label: "TRACKING" },
    { id: "switching", label: "SWITCHING" },
    { id: "training", label: "TRAINING" },
];

export class MainMenu<T extends string> {
    private element: HTMLDivElement;
    private scenarioSelect: HTMLSelectElement;
    private categoryControls: HTMLDivElement;
    private playButton: HTMLButtonElement;
    private settingsButton: HTMLButtonElement;

    private selectedCategory: ScenarioCategory = "clicking";

    constructor(
        private scenarios: Record<T, ScenarioConfig>,
        private onPlay: (scenarioId: T) => void,
        private onSettings: () => void
    ) {
        this.element = document.createElement("div");
        this.element.id = "menu";

        // Header
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

        // Scenario selection
        const scenarioSection = document.createElement("div");
        scenarioSection.className = "menu-section";

        const categoryLabel = document.createElement("label");
        categoryLabel.className = "ui-label";
        categoryLabel.textContent = "SCENARIO CATEGORY";

        this.categoryControls = document.createElement("div");
        this.categoryControls.className =
            "target-color-controls scenario-category-controls";

        for (const category of categories) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "target-color-preset";
            button.textContent = category.label;

            button.addEventListener("click", () => {
                this.selectedCategory = category.id;
                this.updateCategorySelection();
                this.updateScenarioOptions();
            });

            this.categoryControls.appendChild(button);
        }

        const scenarioLabel = document.createElement("label");
        scenarioLabel.className = "ui-label";
        scenarioLabel.textContent = "SCENARIO";
        scenarioLabel.htmlFor = "scenario-select";

        this.scenarioSelect = document.createElement("select");
        this.scenarioSelect.id = "scenario-select";
        this.scenarioSelect.className = "ui-select";

        scenarioSection.appendChild(categoryLabel);
        scenarioSection.appendChild(this.categoryControls);
        scenarioSection.appendChild(scenarioLabel);
        scenarioSection.appendChild(this.scenarioSelect);

        // Actions
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

        // Footer
        const footer = document.createElement("div");
        footer.className = "menu-footer";

        const version = document.createElement("span");
        version.textContent = "AIM TRAINER // WEB";

        const session = document.createElement("span");
        session.textContent = "LOCAL SESSION";

        footer.appendChild(version);
        footer.appendChild(session);

        // Assemble menu
        this.element.appendChild(header);
        this.element.appendChild(scenarioSection);
        this.element.appendChild(actions);
        this.element.appendChild(footer);

        document.body.appendChild(this.element);

        this.updateCategorySelection();
        this.updateScenarioOptions();

        this.playButton.addEventListener("click", () => {
            if (this.scenarioSelect.value) {
                this.onPlay(this.scenarioSelect.value as T);
            }
        });

        this.settingsButton.addEventListener("click", () => {
            this.onSettings();
        });
    }

    private updateCategorySelection(): void {
        const buttons =
            this.categoryControls.querySelectorAll<HTMLButtonElement>(
                ".target-color-preset"
            );

        categories.forEach((category, index) => {
            buttons[index]?.classList.toggle(
                "selected",
                category.id === this.selectedCategory
            );
        });
    }

    private updateScenarioOptions(): void {
        const previousSelection = this.scenarioSelect.value;

        this.scenarioSelect.replaceChildren();

        const scenarioIds = (
            Object.keys(this.scenarios) as T[]
        ).filter((id) => {
            const category = this.scenarios[id].category ?? "training";
            return category === this.selectedCategory;
        });

        for (const id of scenarioIds) {
            const option = document.createElement("option");
            option.value = id;
            option.textContent = id;
            this.scenarioSelect.appendChild(option);
        }

        if (scenarioIds.includes(previousSelection as T)) {
            this.scenarioSelect.value = previousSelection;
        } else if (scenarioIds.length > 0) {
            this.scenarioSelect.value = scenarioIds[0];
        }

        this.playButton.disabled = scenarioIds.length === 0;
    }

    show(): void {
        this.element.style.display = "flex";
    }

    hide(): void {
        this.element.style.display = "none";
    }
}
