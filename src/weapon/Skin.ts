export interface Skin {
    id: string;
    name: string;

    assetFolder: string;

    uiFile: string;
    thumbFile: string;

    uiImgUrl: string;
    thumbUrl: string;

    uiGifUrl: string;
    raiseGifUrl: string;
    inspectGifUrl: string;
    reloadGifUrl: string;

    raiseMs: number;
    inspectMs: number;
    reloadMs: number;
    fireMs: number;

    clickSoundUrl: string;
    reloadSoundUrl: string;
    hitSoundUrls: string[];

    offsetX: number;
    offsetY: number;
    scale: number;

    defaultUnlocked: boolean;
    purchasable: boolean;
    gachaEnabled: boolean;
    enabled: boolean;

    sortOrder: number;

    behavior: string | null;
    behaviorVersion: number;

    category: string;
    variantGroup: string;
    variantLabel: string;

    nameI18n: Record<string, string>;
}