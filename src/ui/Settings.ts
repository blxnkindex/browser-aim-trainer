import {
    userconfig,
    saveConfig,
} from "../config/UserConfig";

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

        this.targetColorInput = document.createElement("input");
        this.targetColorInput.type = "color";
        this.targetColorInput.value = userconfig.targetColor;

        this.targetColorInput.addEventListener("input", () => {
            userconfig.targetColor =
                this.targetColorInput.value;
        });

        const crosshairLabel = document.createElement("label");
        crosshairLabel.textContent = "Crosshair Code";

        const crosshairInput = document.createElement("input");
        
        crosshairInput.type = "text";
        crosshairInput.placeholder = "Paste Valorant crosshair code";
        crosshairInput.value = userconfig.crosshairCode;

        crosshairLabel.appendChild(crosshairInput);

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
        this.element.appendChild(this.targetColorInput);
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