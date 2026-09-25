import { userConfig, saveConfig } from "../config/UserConfig";
import { crosshairPresets } from "../config/Crosshair";

export class SettingsMenu {
    private element: HTMLDivElement;
    private sensitivityInput: HTMLInputElement;
    private targetColorInput: HTMLInputElement;
    private targetColorControls: HTMLDivElement;
    private customColorButton: HTMLButtonElement;
    private crosshairInput: HTMLInputElement;
    private crosshairPresetsContainer: HTMLDivElement;
    private viewmodelInput: HTMLInputElement;
    private sfxVolumeInput: HTMLInputElement;
    private sfxVolumeValue: HTMLSpanElement;

    constructor(
        onBack: () => void,
        onSkins: () => void,
        onSfxVolumeChange: (volume: number) => void,
        onHandednessChange: (leftHanded: boolean) => void
    ) {
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

        this.targetColorControls = document.createElement("div");
        this.targetColorControls.className = "target-color-controls";

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
                this.updateTargetColorSelection();
            });

            this.targetColorControls.appendChild(preset);
        }

        // Custom colour
        this.customColorButton = document.createElement("button");
        this.customColorButton.type = "button";
        this.customColorButton.className =
            "target-color-preset target-color-custom";
        this.customColorButton.textContent = "CUSTOM";

        this.customColorButton.addEventListener("click", () => {
            this.targetColorInput.click();
            this.updateTargetColorSelection();
        });

        this.targetColorInput.addEventListener("input", () => {
            userConfig.targetColor = this.targetColorInput.value;
            this.updateTargetColorSelection();
        });

        this.targetColorControls.appendChild(this.customColorButton);
        this.targetColorControls.appendChild(this.targetColorInput);

        // Crosshair
        const crosshairLabel = document.createElement("label");
        crosshairLabel.textContent = "Crosshair Code";

        this.crosshairInput = document.createElement("input");
        this.crosshairInput.type = "text";
        this.crosshairInput.placeholder = "Paste Valorant crosshair code";
        this.crosshairInput.value = userConfig.crosshairCode;

        this.crosshairPresetsContainer = document.createElement("div");
        this.crosshairPresetsContainer.className = "crosshair-presets";

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
                this.crosshairInput.value = preset.code;
                this.updateCrosshairSelection();
            });

            this.crosshairPresetsContainer.appendChild(button);
        }

        this.crosshairInput.addEventListener("input", () => {
            userConfig.crosshairCode = this.crosshairInput.value.trim();
            this.updateCrosshairSelection();
        });

        // Viewmodel
        const viewmodelLabel = document.createElement("label");
        viewmodelLabel.textContent = "Viewmodel";

        const viewmodelControls = document.createElement("label");
        viewmodelControls.className = "setting-toggle";

        this.viewmodelInput = document.createElement("input");
        this.viewmodelInput.type = "checkbox";
        this.viewmodelInput.checked = userConfig.showViewmodel;

        const viewmodelText = document.createElement("span");
        viewmodelText.textContent = "SHOW VIEWMODEL";

        this.viewmodelInput.addEventListener("change", () => {
            userConfig.showViewmodel = this.viewmodelInput.checked;
        });

        viewmodelControls.appendChild(this.viewmodelInput);
        viewmodelControls.appendChild(viewmodelText);

        // Handedness
        const handednessLabel = document.createElement("label");
        handednessLabel.textContent = "Handedness";

        const handednessControls = document.createElement("div");
        handednessControls.className = "handedness-controls";

        const rightHandButton = document.createElement("button");
        rightHandButton.type = "button";
        rightHandButton.textContent = "RIGHT";

        const leftHandButton = document.createElement("button");
        leftHandButton.type = "button";
        leftHandButton.textContent = "LEFT";

        const updateHandednessButtons = () => {
            rightHandButton.classList.toggle(
                "active",
                !userConfig.leftHanded
            );

            leftHandButton.classList.toggle(
                "active",
                userConfig.leftHanded
            );
        };

        rightHandButton.addEventListener("click", () => {
            userConfig.leftHanded = false;
            updateHandednessButtons();
            onHandednessChange(false);
        });

        leftHandButton.addEventListener("click", () => {
            userConfig.leftHanded = true;
            updateHandednessButtons();
            onHandednessChange(true);
        });

        handednessControls.appendChild(leftHandButton);
        handednessControls.appendChild(rightHandButton);

        updateHandednessButtons();

        // SFX Volume
        const sfxVolumeLabel = document.createElement("label");
        sfxVolumeLabel.textContent = "SFX Volume";

        const sfxVolumeControls = document.createElement("div");
        sfxVolumeControls.className = "volume-controls";

        this.sfxVolumeInput = document.createElement("input");
        this.sfxVolumeInput.type = "range";
        this.sfxVolumeInput.min = "0";
        this.sfxVolumeInput.max = "100";
        this.sfxVolumeInput.step = "1";
        this.sfxVolumeInput.value =
            userConfig.sfxVolume.toString();

        this.sfxVolumeValue = document.createElement("span");
        this.sfxVolumeValue.textContent =
            `${userConfig.sfxVolume}%`;

        this.sfxVolumeInput.addEventListener("input", () => {
            const value = Number(this.sfxVolumeInput.value);

            userConfig.sfxVolume = value;
            this.sfxVolumeValue.textContent = `${value}%`;

            onSfxVolumeChange(value);
        });

        sfxVolumeControls.appendChild(this.sfxVolumeInput);
        sfxVolumeControls.appendChild(this.sfxVolumeValue);

        // Skins
        const skinsButton = document.createElement("button");
        skinsButton.type = "button";
        skinsButton.textContent = "SKINS";

        skinsButton.addEventListener("click", () => {
            onSkins();
        });

        // Back
        const backButton = document.createElement("button");
        backButton.type = "button";
        backButton.textContent = "BACK";

        backButton.addEventListener("click", () => {
            userConfig.crosshairCode =
                this.crosshairInput.value.trim();

            saveConfig();
            onBack();
        });

        this.element.appendChild(title);

        this.element.appendChild(sensitivityLabel);
        this.element.appendChild(this.sensitivityInput);

        this.element.appendChild(targetColorLabel);
        this.element.appendChild(this.targetColorControls);

        this.element.appendChild(crosshairLabel);
        this.element.appendChild(this.crosshairInput);
        this.element.appendChild(this.crosshairPresetsContainer);

        this.element.appendChild(viewmodelLabel);
        this.element.appendChild(viewmodelControls);

        this.element.appendChild(handednessLabel);
        this.element.appendChild(handednessControls);

        this.element.appendChild(sfxVolumeLabel);
        this.element.appendChild(sfxVolumeControls);

        this.element.appendChild(skinsButton);
        this.element.appendChild(backButton);

        document.body.appendChild(this.element);

        this.hide();
    }

    private updateCrosshairSelection(): void {
        const buttons =
            this.crosshairPresetsContainer.querySelectorAll<HTMLButtonElement>(
                ".crosshair-preset"
            );

        crosshairPresets.forEach((preset, index) => {
            buttons[index]?.classList.toggle(
                "selected",
                userConfig.crosshairCode.trim() === preset.code.trim()
            );
        });
    }

    private updateTargetColorSelection(): void {
        this.targetColorControls
            .querySelectorAll(".target-color-preset")
            .forEach((element) => element.classList.remove("selected"));

        const targetColorOptions = ["#FF0000", "#FFFF00", "#9B59B6"];
        const currentIndex = targetColorOptions.findIndex(
            (color) => color.toLowerCase() === userConfig.targetColor.toLowerCase()
        );

        if (currentIndex !== -1) {
            this.targetColorControls.children[currentIndex]?.classList.add(
                "selected"
            );
        } else {
            this.customColorButton.classList.add("selected");
        }
    }

    show(): void {
        this.sensitivityInput.value =
            userConfig.sensitivity.toString();

        this.targetColorInput.value =
            userConfig.targetColor;

        this.crosshairInput.value =
            userConfig.crosshairCode;

        this.viewmodelInput.checked =
            userConfig.showViewmodel;

        this.sfxVolumeInput.value =
            userConfig.sfxVolume.toString();

        this.sfxVolumeValue.textContent =
            `${userConfig.sfxVolume}%`;

        this.updateTargetColorSelection();
        this.updateCrosshairSelection();

        this.element.style.display = "flex";
    }

    hide(): void {
        this.element.style.display = "none";
    }
}