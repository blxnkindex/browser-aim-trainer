import { ScenarioConfig } from "../scenarios/Scenario";

export class ScenarioSettings<T extends string> {
    private element: HTMLDivElement;

    private timeSelect: HTMLSelectElement;
    private sizeSelect: HTMLSelectElement;
    private speedSelect: HTMLSelectElement;

    private speedLabel: HTMLLabelElement;

    private customTimeInput: HTMLInputElement;
    private customSizeInput: HTMLInputElement;
    private customSpeedInput: HTMLInputElement;

    private selectedConfig: ScenarioConfig | null = null;

    constructor(
        private readonly scenarios: Record<T, ScenarioConfig>,
        private readonly onStart: (config: ScenarioConfig) => void,
        private readonly onBack: () => void
    ) {
        this.element = document.createElement("div");
        this.element.id = "scenario-config";

        const title = document.createElement("h1");
        title.textContent = "CUSTOMISE SCENARIO";

        // Time
        const timeLabel = document.createElement("label");
        timeLabel.textContent = "Time";

        this.timeSelect = document.createElement("select");

        for (const time of [15, 30, 60]) {
            const option = document.createElement("option");
            option.value = String(time);
            option.textContent = `${time}s`;
            this.timeSelect.appendChild(option);
        }

        const customTimeOption = document.createElement("option");
        customTimeOption.value = "custom";
        customTimeOption.textContent = "Custom";
        this.timeSelect.appendChild(customTimeOption);

        this.customTimeInput = document.createElement("input");
        this.customTimeInput.type = "number";
        this.customTimeInput.min = "1";
        this.customTimeInput.step = "1";
        this.customTimeInput.value = "30";
        this.customTimeInput.style.display = "none";

        this.timeSelect.addEventListener("change", () => {
            this.customTimeInput.style.display =
                this.timeSelect.value === "custom"
                    ? "block"
                    : "none";
        });

        // Target size
        const sizeLabel = document.createElement("label");
        sizeLabel.textContent = "Target Size";

        this.sizeSelect = document.createElement("select");

        const sizes = [
            { name: "Small", value: 0.3 },
            { name: "Medium", value: 0.5 },
            { name: "Large", value: 0.8 },
        ];

        for (const size of sizes) {
            const option = document.createElement("option");
            option.value = String(size.value);
            option.textContent = size.name;
            this.sizeSelect.appendChild(option);
        }

        const customSizeOption = document.createElement("option");
        customSizeOption.value = "custom";
        customSizeOption.textContent = "Custom";
        this.sizeSelect.appendChild(customSizeOption);

        this.customSizeInput = document.createElement("input");
        this.customSizeInput.type = "number";
        this.customSizeInput.min = "0.1";
        this.customSizeInput.step = "0.05";
        this.customSizeInput.value = "0.5";
        this.customSizeInput.style.display = "none";

        this.sizeSelect.addEventListener("change", () => {
            this.customSizeInput.style.display =
                this.sizeSelect.value === "custom"
                    ? "block"
                    : "none";
        });

        // Movement speed
        this.speedLabel = document.createElement("label");
        this.speedLabel.textContent = "Movement Speed";

        this.speedSelect = document.createElement("select");

        const speeds = [
            { name: "Slow", value: 1 },
            { name: "Medium", value: 3 },
            { name: "Fast", value: 5 },
        ];

        for (const speed of speeds) {
            const option = document.createElement("option");
            option.value = String(speed.value);
            option.textContent = speed.name;
            this.speedSelect.appendChild(option);
        }

        const customSpeedOption = document.createElement("option");
        customSpeedOption.value = "custom";
        customSpeedOption.textContent = "Custom";
        this.speedSelect.appendChild(customSpeedOption);

        this.customSpeedInput = document.createElement("input");
        this.customSpeedInput.type = "number";
        this.customSpeedInput.min = "0";
        this.customSpeedInput.step = "0.1";
        this.customSpeedInput.value = "3";
        this.customSpeedInput.style.display = "none";

        this.speedSelect.addEventListener("change", () => {
            this.customSpeedInput.style.display =
                this.speedSelect.value === "custom"
                    ? "block"
                    : "none";
        });

        // Start
        const startButton = document.createElement("button");
        startButton.textContent = "START";

        startButton.addEventListener("click", () => {
            if (!this.selectedConfig) return;

            const duration =
                this.timeSelect.value === "custom"
                    ? Number(this.customTimeInput.value) * 1000
                    : Number(this.timeSelect.value) * 1000;

            const targetSize =
                this.sizeSelect.value === "custom"
                    ? Number(this.customSizeInput.value)
                    : Number(this.sizeSelect.value);

            const movementSpeed =
                this.speedSelect.value === "custom"
                    ? Number(this.customSpeedInput.value)
                    : Number(this.speedSelect.value);

            const config: ScenarioConfig = {
                ...this.selectedConfig,
                duration,
                targetSize,
                movementSpeed,
            };

            this.onStart(config);
        });

        // Back
        const backButton = document.createElement("button");
        backButton.textContent = "BACK";

        backButton.addEventListener("click", () => {
            this.onBack();
        });

        // Build UI
        this.element.appendChild(title);

        this.element.appendChild(timeLabel);
        this.element.appendChild(this.timeSelect);
        this.element.appendChild(this.customTimeInput);

        this.element.appendChild(sizeLabel);
        this.element.appendChild(this.sizeSelect);
        this.element.appendChild(this.customSizeInput);

        this.element.appendChild(this.speedLabel);
        this.element.appendChild(this.speedSelect);
        this.element.appendChild(this.customSpeedInput);

        this.element.appendChild(startButton);
        this.element.appendChild(backButton);

        document.body.appendChild(this.element);

        this.hide();
    }

    show(id: T) {
        this.selectedConfig = this.scenarios[id];

        // Defaults
        this.timeSelect.value = "30";
        this.sizeSelect.value = "0.3";

        this.customTimeInput.style.display = "none";
        this.customSizeInput.style.display = "none";
        this.customSpeedInput.style.display = "none";

        const isMoving =
            this.selectedConfig.movement === "moving";

        this.speedLabel.style.display =
            isMoving ? "block" : "none";

        this.speedSelect.style.display =
            isMoving ? "block" : "none";

        this.element.style.display = "flex";
    }

    hide() {
        this.element.style.display = "none";
    }
}