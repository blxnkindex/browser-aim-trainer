import { Skin } from "./Skin";

export class Weapon {
    private element: HTMLImageElement;

    private skin: Skin | null = null;
    private clickAudio: HTMLAudioElement | null = null;
    private hitAudios: HTMLAudioElement[] = [];

    private nextHitSoundIndex = 0;

    constructor() {
        const element = document.getElementById("weapon");

        if (!(element instanceof HTMLImageElement)) {
            throw new Error("Weapon element #weapon was not found.");
        }

        this.element = element;
        this.hide();
    }

    equipSkin(skin: Skin): void {
        this.skin = skin;
        this.nextHitSoundIndex = 0;

        this.element.src = this.toAssetUrl(skin.uiImgUrl);

        this.element.style.transform = [
            `translate(${skin.offsetX}px, ${skin.offsetY}px)`,
            `scale(${skin.scale})`,
        ].join(" ");

        this.clickAudio = new Audio(
            this.toAssetUrl(skin.clickSoundUrl)
        );

        this.hitAudios = skin.hitSoundUrls
            .filter((url) => url.length > 0)
            .map((url) => new Audio(this.toAssetUrl(url)));
    }

    fire(): void {
        if (!this.skin) {
            return;
        }

        this.playClickSound();
    }

    playHitSound(): void {
        if (this.hitAudios.length === 0) {
            return;
        }

        const audio = this.hitAudios[this.nextHitSoundIndex];

        audio.currentTime = 0;
        void audio.play().catch(() => {});

        this.nextHitSoundIndex =
            (this.nextHitSoundIndex + 1) % this.hitAudios.length;
    }

    resetHitSoundSequence(): void {
        this.nextHitSoundIndex = 0;
    }

    setImage(src: string): void {
        this.element.src = this.toAssetUrl(src);
    }

    show(): void {
        this.element.style.display = "block";
    }

    hide(): void {
        this.element.style.display = "none";
    }

    setLeftHanded(leftHanded: boolean): void {
        this.element.classList.toggle("is-left-hand", leftHanded);
    }

    get elementRef(): HTMLImageElement {
        return this.element;
    }

    private playClickSound(): void {
        if (!this.clickAudio) {
            return;
        }

        this.clickAudio.currentTime = 0;
        void this.clickAudio.play().catch(() => {});
    }

    private toAssetUrl(path: string): string {
        if (path.startsWith("/")) {
            return path;
        }

        return `/${path}`;
    }
}