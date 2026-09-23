import { Skin } from "./Skin";

export class Weapon {
    private element: HTMLImageElement;

    private skin: Skin | null = null;
    private clickAudio: HTMLAudioElement | null = null;
    private hitAudios: HTMLAudioElement[] = [];
    private sfxVolume = 50;

    private leftHanded = false;
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

        this.updateTransform();

        this.clickAudio = new Audio(
            this.toAssetUrl(skin.clickSoundUrl)
        );

        this.hitAudios = skin.hitSoundUrls
            .filter((url) => url.length > 0)
            .map((url) => new Audio(this.toAssetUrl(url)));

        this.hitAudios = skin.hitSoundUrls
            .filter((url) => url.length > 0)
            .map((url) => new Audio(this.toAssetUrl(url)));

        this.setSfxVolume(this.sfxVolume);
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

    setSfxVolume(volume: number): void {
        this.sfxVolume = Math.max(0, Math.min(100, volume));

        const volumeValue = this.sfxVolume / 100;

        if (this.clickAudio) {
            this.clickAudio.volume = volumeValue;
        }

        for (const audio of this.hitAudios) {
            audio.volume = volumeValue;
        }
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
    
    private updateTransform(): void {
    if (!this.skin) {
        return;
    }

    const scaleX = this.leftHanded
        ? -this.skin.scale
        : this.skin.scale;

    this.element.style.transform = [
        `translate(${this.skin.offsetX}px, ${this.skin.offsetY}px)`,
        `scale(${scaleX}, ${this.skin.scale})`,
    ].join(" ");
}
}