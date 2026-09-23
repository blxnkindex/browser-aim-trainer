import { userconfig, saveConfig } from "../config/UserConfig";

export class SettingsMenu {
    private element: HTMLDivElement;
    private sensitivityInput: HTMLInputElement;
    private targetColorInput: HTMLInputElement;

    constructor(onBack: () => void, onSkins: () => void) {
        this.element = document.createElement("div");
        this.element.id = "settings";

        const title = document.createElement("h1");
        title.textContent = "SETTINGS";

        // Sensitivity
        const sensitivityLabel = document.createElement("label");
        sensitivityLabel.textContent = "Sensitivity";

        this.sensitivityInput = document.createElement("input");
        this.sensitivityInput.type = "number";
        this.sensitivityInput.step = "0.01";
        this.sensitivityInput.min = "0.01";
        this.sensitivityInput.value = userconfig.sensitivity.toString();

        this.sensitivityInput.addEventListener("change", () => {
            const value = Number(this.sensitivityInput.value);

            if (Number.isFinite(value) && value > 0) {
                userconfig.sensitivity = value;
            } else {
                this.sensitivityInput.value =
                    userconfig.sensitivity.toString();
            }
        });
        // Target colour
        const targetColorLabel = document.createElement("label");
        targetColorLabel.textContent = "Target Colour";

        const targetColorControls = document.createElement("div");
        targetColorControls.className = "target-color-controls";

        const targetColorOptions = [
            { name: "RED", color: "#FF0000" },
            { name: "YELLOW", color: "#FFFF00" },
            { name: "PURPLE", color: "#9B59B6" },
        ];

        this.targetColorInput = document.createElement("input");
        this.targetColorInput.type = "color";
        this.targetColorInput.value = userconfig.targetColor;
        this.targetColorInput.style.display = "none";

        for (const option of targetColorOptions) {
            const preset = document.createElement("button");
            preset.type = "button";
            preset.className = "target-color-preset";
            preset.textContent = option.name;
            preset.style.backgroundColor = option.color;

            preset.addEventListener("click", () => {
                userconfig.targetColor = option.color;
                this.targetColorInput.value = option.color;
            });

            targetColorControls.appendChild(preset);
        }

        // Custom colour button
        const customColorButton = document.createElement("button");
        customColorButton.type = "button";
        customColorButton.className = "target-color-preset target-color-custom";
        customColorButton.textContent = "CUSTOM";

        customColorButton.addEventListener("click", () => {
            this.targetColorInput.click();
        });

        this.targetColorInput.addEventListener("input", () => {
            userconfig.targetColor = this.targetColorInput.value;
        });

        targetColorControls.appendChild(customColorButton);
        targetColorControls.appendChild(this.targetColorInput);
        // Crosshair
        const crosshairLabel = document.createElement("label");
        crosshairLabel.textContent = "Crosshair Code";

        const crosshairInput = document.createElement("input");
        crosshairInput.type = "text";
        crosshairInput.placeholder = "Paste Valorant crosshair code";
        crosshairInput.value = userconfig.crosshairCode;

        // Skins
        const skinsButton = document.createElement("button");
        skinsButton.textContent = "SKINS";

        skinsButton.addEventListener("click", () => {
            onSkins();
        });

        // Back
        const backButton = document.createElement("button");
        backButton.textContent = "BACK";

        backButton.addEventListener("click", () => {
            userconfig.crosshairCode = crosshairInput.value.trim();

            saveConfig();
            onBack();
        });

        this.element.appendChild(title);

        this.element.appendChild(sensitivityLabel);
        this.element.appendChild(this.sensitivityInput);

        this.element.appendChild(targetColorLabel);
        this.element.appendChild(targetColorControls);

        this.element.appendChild(crosshairLabel);
        this.element.appendChild(crosshairInput);

        this.element.appendChild(skinsButton);
        this.element.appendChild(backButton);

        document.body.appendChild(this.element);

        this.hide();
    }

    show() {
        this.sensitivityInput.value =
            userconfig.sensitivity.toString();

        this.targetColorInput.value =
            userconfig.targetColor;

        this.element.style.display = "flex";
    }

    hide() {
        this.element.style.display = "none";
    }
}