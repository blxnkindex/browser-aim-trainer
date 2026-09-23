import { Skin } from "../weapon/Skin";
import { SkinCatalog } from "../weapon/SkinCatalog";

export class SkinSelector {
    private element: HTMLDivElement;

    private currentImage: HTMLImageElement;
    private currentThumbnail: HTMLImageElement;
    private currentName: HTMLDivElement;

    private grid: HTMLDivElement;

    private onSelect: (skin: Skin) => void;

    constructor(
        skinCatalog: SkinCatalog,
        currentSkin: Skin | null,
        onSelect: (skin: Skin) => void,
        onBack: () => void
    ) {
        this.onSelect = onSelect;

        this.element = document.createElement("div");
        this.element.id = "skins";

        const title = document.createElement("h1");
        title.textContent = "SKINS";

        // Current skin

        const currentSection = document.createElement("section");
        currentSection.className = "skins-current";

        const currentLabel = document.createElement("div");
        currentLabel.className = "skins-section-label";
        currentLabel.textContent = "CURRENT SKIN";

        const currentCard = document.createElement("div");
        currentCard.className = "skins-current-card";

        const currentPreview = document.createElement("div");
        currentPreview.className = "skins-current-preview";

        this.currentImage = document.createElement("img");
        this.currentImage.className = "skins-current-image";

        this.currentThumbnail = document.createElement("img");
        this.currentThumbnail.className =
            "skins-current-thumbnail";

        currentPreview.appendChild(this.currentImage);
        currentPreview.appendChild(this.currentThumbnail);

        const currentInfo = document.createElement("div");
        currentInfo.className = "skins-current-info";

        this.currentName = document.createElement("div");
        this.currentName.className = "skins-current-name";

        currentInfo.appendChild(this.currentName);

        currentCard.appendChild(currentPreview);
        currentCard.appendChild(currentInfo);

        currentSection.appendChild(currentLabel);
        currentSection.appendChild(currentCard);

        // Selection

        const selectionSection = document.createElement("section");
        selectionSection.className = "skins-selection";

        const selectionLabel = document.createElement("div");
        selectionLabel.className = "skins-section-label";
        selectionLabel.textContent = "SELECT SKIN";

        this.grid = document.createElement("div");
        this.grid.className = "skins-grid";

        const skins = skinCatalog.getAll();

        for (const skin of skins) {
            this.grid.appendChild(
                this.createSkinCard(skin, currentSkin)
            );
        }

        selectionSection.appendChild(selectionLabel);
        selectionSection.appendChild(this.grid);

        // Back

        const backButton = document.createElement("button");
        backButton.className = "ui-button skins-back";
        backButton.textContent = "BACK";

        backButton.addEventListener("click", () => {
            onBack();
        });

        this.element.appendChild(title);
        this.element.appendChild(currentSection);
        this.element.appendChild(selectionSection);
        this.element.appendChild(backButton);

        document.body.appendChild(this.element);

        this.setCurrentSkin(currentSkin);

        this.hide();
    }

    show(currentSkin: Skin | null): void {
        this.setCurrentSkin(currentSkin);
        this.updateSelectedCard(currentSkin);

        this.element.style.display = "flex";
    }

    hide(): void {
        this.element.style.display = "none";
    }

    private createSkinCard(
        skin: Skin,
        currentSkin: Skin | null
    ): HTMLButtonElement {
        const card = document.createElement("button");

        card.className = "skin-card";
        card.dataset.skinId = skin.id;

        if (currentSkin?.id === skin.id) {
            card.classList.add("is-selected");
        }

        const image = document.createElement("img");
        image.className = "skin-card-image";
        image.src = this.toAssetUrl(skin.thumbUrl);
        image.alt = skin.name;

        const info = document.createElement("div");
        info.className = "skin-card-info";

        const name = document.createElement("div");
        name.className = "skin-card-name";
        name.textContent = skin.name;

        const category = document.createElement("div");
        category.className = "skin-card-category";
        category.textContent = skin.category;

        info.appendChild(name);

        if (skin.category) {
            info.appendChild(category);
        }

        card.appendChild(image);
        card.appendChild(info);

        card.addEventListener("click", () => {
            this.selectSkin(skin);
        });

        return card;
    }

    private selectSkin(skin: Skin): void {
        this.setCurrentSkin(skin);
        this.updateSelectedCard(skin);

        this.onSelect(skin);
    }

    private setCurrentSkin(skin: Skin | null): void {
        if (!skin) {
            this.currentImage.removeAttribute("src");
            this.currentThumbnail.removeAttribute("src");

            this.currentImage.alt = "";
            this.currentThumbnail.alt = "";

            this.currentName.textContent = "NONE";

            return;
        }

        this.currentImage.src =
            this.toAssetUrl(skin.uiImgUrl);

        this.currentThumbnail.src =
            this.toAssetUrl(skin.thumbUrl);

        this.currentImage.alt = skin.name;
        this.currentThumbnail.alt =
            `${skin.name} thumbnail`;

        this.currentName.textContent = skin.name;
    }

    private updateSelectedCard(
        currentSkin: Skin | null
    ): void {
        const cards =
            this.grid.querySelectorAll<HTMLButtonElement>(
                ".skin-card"
            );

        for (const card of cards) {
            card.classList.toggle(
                "is-selected",
                card.dataset.skinId === currentSkin?.id
            );
        }
    }

    private toAssetUrl(path: string): string {
        if (path.startsWith("/")) {
            return path;
        }

        return `/${path}`;
    }
}