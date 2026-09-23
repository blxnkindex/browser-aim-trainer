import { userConfig, saveConfig } from "../config/UserConfig";
import { crosshairPresets } from "../config/Crosshair"

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
        this.sensitivityInput.value = userConfig.sensitivity.toString();

        this.sensitivityInput.addEventListener("change", () => {
            const value = Number(this.sensitivityInput.value);

            if (Number.isFinite(value) && value > 0) {
                userConfig.sensitivity = value;
            } else {
                this.sensitivityInput.value =
                    userConfig.sensitivity.toString();
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
        this.targetColorInput.value = userConfig.targetColor;
        this.targetColorInput.style.display = "none";

        for (const option of targetColorOptions) {
            const preset = document.createElement("button");
            preset.type = "button";
            preset.className = "target-color-preset";
            preset.textContent = option.name;
            preset.style.backgroundColor = option.color;

            preset.addEventListener("click", () => {
                userConfig.targetColor = option.color;
                this.targetColorInput.value = option.color;

                targetColorControls
                    .querySelectorAll(".target-color-preset")
                    .forEach((element) => element.classList.remove("selected"));

                preset.classList.add("selected");
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

            targetColorControls
                .querySelectorAll(".target-color-preset")
                .forEach((element) => element.classList.remove("selected"));

            customColorButton.classList.add("selected");
        });

        this.targetColorInput.addEventListener("input", () => {
            userConfig.targetColor = this.targetColorInput.value;

            targetColorControls
                .querySelectorAll(".target-color-preset")
                .forEach((element) => element.classList.remove("selected"));

            customColorButton.classList.add("selected");
        });

        targetColorControls.appendChild(customColorButton);
        targetColorControls.appendChild(this.targetColorInput);

        // Crosshair
        const crosshairLabel = document.createElement("label");
        crosshairLabel.textContent = "Crosshair Code";

        const crosshairInput = document.createElement("input");
        crosshairInput.type = "text";
        crosshairInput.placeholder = "Paste Valorant crosshair code";
        crosshairInput.value = userConfig.crosshairCode;

        const crosshairPresetsContainer = document.createElement("div");
        crosshairPresetsContainer.className = "crosshair-presets";

        for (const preset of crosshairPresets) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "crosshair-preset";

            const preview = document.createElement("div");
            preview.className = "crosshair-preset-preview";

            const image = document.createElement("img");
            image.src = preset.image;
            image.alt = preset.name;

            preview.appendChild(image);

            const name = document.createElement("div");
            name.className = "crosshair-preset-name";
            name.textContent = preset.name;

            button.appendChild(preview);
            button.appendChild(name);

            button.addEventListener("click", () => {
                userConfig.crosshairCode = preset.code;
                crosshairInput.value = preset.code;

                crosshairPresetsContainer
                    .querySelectorAll(".crosshair-preset")
                    .forEach((element) => element.classList.remove("selected"));

                button.classList.add("selected");
            });

            crosshairPresetsContainer.appendChild(button);
        }

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
            userConfig.crosshairCode = crosshairInput.value.trim();

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

        this.element.appendChild(crosshairLabel);
        this.element.appendChild(crosshairInput);
        this.element.appendChild(crosshairPresetsContainer);

        this.element.appendChild(skinsButton);
        this.element.appendChild(backButton);

        document.body.appendChild(this.element);

        this.hide();
    }

    show() {
        this.sensitivityInput.value =
            userConfig.sensitivity.toString();

        this.targetColorInput.value =
            userConfig.targetColor;

        this.element.style.display = "flex";
    }

    hide() {
        this.element.style.display = "none";
    }
}