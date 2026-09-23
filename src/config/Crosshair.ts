import * as T from "three";

const COLORS = ["#FFFFFF","#00FF00","#7FFF00","#DFFF00","#FFFF00","#00FFFF","#FF00FF","#FF0000",]

export const DEFAULT_CROSSHAIR_CODE =  "0;P;h;0;f;0;0l;4;0o;0;0a;1;0f;0;1b;0";

export interface CrosshairLayer {
    color: number;
    hexColor: {
        enabled: boolean;
        value: string;
    };
    outlines: {
        enabled: boolean;
        width: number;
        alpha: number;
    };
    dot: {
        enabled: boolean;
        width: number;
        alpha: number;
    };
    overwriteFireMul: boolean;
    inner: CrosshairLines;
    outer: CrosshairLines;
}

export interface CrosshairLines {
    enabled: boolean;
    width: number;
    length: number;
    vertical: {
        enabled: boolean;
        length: number;
    };
    offset: number;
    alpha: number;
    moveMul: {
        enabled: boolean;
        mul: number;
    };
    fireMul: {
        enabled: boolean;
        mul: number;
    };
}

export interface CrosshairProfile {
    general: {
        advancedOptions: boolean;
        adsUsePrimary: boolean;
        hideOnFire: boolean;
        followSpectating: boolean;
    };
    primary: CrosshairLayer;
    ads: CrosshairLayer;
    sniper: {
        color: number;
        hexColor: {
            enabled: boolean;
            value: string;
        };
        dot: {
            enabled: boolean;
            width: number;
            alpha: number;
        };
    };
}

function defaultLayer(): CrosshairLayer {
    return {
        color: 0,
        hexColor: {
            enabled: false,
            value: "FFFFFFFF",
        },
        outlines: {
            enabled: true,
            width: 1,
            alpha: 0.5,
        },
        dot: {
            enabled: false,
            width: 2,
            alpha: 1,
        },
        overwriteFireMul: false,
        inner: {
            enabled: true,
            width: 2,
            length: 6,
            vertical: {
                enabled: false,
                length: 6,
            },
            offset: 3,
            alpha: 0.8,
            moveMul: {
                enabled: false,
                mul: 1,
            },
            fireMul: {
                enabled: true,
                mul: 1,
            },
        },
        outer: {
            enabled: true,
            width: 2,
            length: 2,
            vertical: {
                enabled: false,
                length: 2,
            },
            offset: 10,
            alpha: 0.35,
            moveMul: {
                enabled: true,
                mul: 1,
            },
            fireMul: {
                enabled: true,
                mul: 1,
            },
        },
    };
}

export function defaultCrosshairProfile(): CrosshairProfile {
    return {
        general: {
            advancedOptions: false,
            adsUsePrimary: true,
            hideOnFire: false,
            followSpectating: true,
        },
        primary: defaultLayer(),
        ads: defaultLayer(),
        sniper: {
            color: 0,
            hexColor: {
                enabled: false,
                value: "FFFFFFFF",
            },
            dot: {
                enabled: true,
                width: 1,
                alpha: 0.75,
            },
        },
    };
}

function num(value: string, fallback: number): number {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function setPath(object: unknown, path: string, value: unknown): void {
    const parts = path.split(".");
    let current = object as Record<string, unknown>;
    for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]] as Record<string, unknown>;
    }
    current[parts[parts.length - 1]] = value;
}

type CodeMapEntry = [path: string, convert: (value: string) => unknown];

const CODE_MAP: Record<string, CodeMapEntry> = {
    "0:s": [
        "general.advancedOptions",
        value => !!Number(value),
    ],
    "0:c": [
        "general.adsUsePrimary",
        value => !!Number(value),
    ],
    "0:p": [
        "general.adsUsePrimary",
        value => !!Number(value),
    ],
    "P:c": [
        "primary.color",
        value => clamp(Math.round(num(value, 0)), 0, 8),
    ],
    "P:u": [
        "primary.hexColor.value",
        value => value.replace(/^#/, "").toUpperCase(),
    ],
    "P:b": [
        "primary.hexColor.enabled",
        value => !!Number(value),
    ],
    "P:h": [
        "primary.outlines.enabled",
        value => !!Number(value),
    ],
    "P:t": [
        "primary.outlines.width",
        value => clamp(Math.round(num(value, 1)), 1, 6),
    ],
    "P:o": [
        "primary.outlines.alpha",
        value => clamp(num(value, 0.5), 0, 1),
    ],
    "P:d": [
        "primary.dot.enabled",
        value => !!Number(value),
    ],
    "P:z": [
        "primary.dot.width",
        value => clamp(Math.round(num(value, 2)), 1, 6),
    ],
    "P:a": [
        "primary.dot.alpha",
        value => clamp(num(value, 1), 0, 1),
    ],
    "P:f": [
        "general.hideOnFire",
        value => !!Number(value),
    ],
    "P:m": [
        "primary.overwriteFireMul",
        value => !!Number(value),
    ],
    "P:0b": [
        "primary.inner.enabled",
        value => !!Number(value),
    ],
    "P:0t": [
        "primary.inner.width",
        value => clamp(Math.round(num(value, 2)), 0, 10),
    ],
    "P:0l": [
        "primary.inner.length",
        value => clamp(Math.round(num(value, 6)), 0, 20),
    ],
    "P:0v": [
        "primary.inner.vertical.length",
        value => clamp(Math.round(num(value, 6)), 0, 20),
    ],
    "P:0g": [
        "primary.inner.vertical.enabled",
        value => !!Number(value),
    ],
    "P:0o": [
        "primary.inner.offset",
        value => clamp(Math.round(num(value, 3)), 0, 20),
    ],
    "P:0a": [
        "primary.inner.alpha",
        value => clamp(num(value, 0.8), 0, 1),
    ],
    "P:0m": [
        "primary.inner.moveMul.enabled",
        value => !!Number(value),
    ],
    "P:0f": [
        "primary.inner.fireMul.enabled",
        value => !!Number(value),
    ],
    "P:0s": [
        "primary.inner.moveMul.mul",
        value => clamp(num(value, 1), 0, 3),
    ],
    "P:0e": [
        "primary.inner.fireMul.mul",
        value => clamp(num(value, 1), 0, 3),
    ],
    "P:1b": [
        "primary.outer.enabled",
        value => !!Number(value),
    ],
    "P:1t": [
        "primary.outer.width",
        value => clamp(Math.round(num(value, 2)), 0, 10),
    ],
    "P:1l": [
        "primary.outer.length",
        value => clamp(Math.round(num(value, 2)), 0, 10),
    ],
    "P:1v": [
        "primary.outer.vertical.length",
        value => clamp(Math.round(num(value, 2)), 0, 20),
    ],
    "P:1g": [
        "primary.outer.vertical.enabled",
        value => !!Number(value),
    ],
    "P:1o": [
        "primary.outer.offset",
        value => clamp(Math.round(num(value, 10)), 0, 40),
    ],
    "P:1a": [
        "primary.outer.alpha",
        value => clamp(num(value, 0.35), 0, 1),
    ],
    "P:1m": [
        "primary.outer.moveMul.enabled",
        value => !!Number(value),
    ],
    "P:1f": [
        "primary.outer.fireMul.enabled",
        value => !!Number(value),
    ],
    "P:1s": [
        "primary.outer.moveMul.mul",
        value => clamp(num(value, 1), 0, 3),
    ],
    "P:1e": [
        "primary.outer.fireMul.mul",
        value => clamp(num(value, 1), 0, 3),
    ],
};

export function parseValorantCrosshairCode(raw: string): CrosshairProfile {
    const code = String(raw || "").trim().replace(/\s+/g, "").replace(/^['"]|['"]$/g, "");
    if (!code) {
        throw new Error("Crosshair code is empty");
    }
    const parts = code.split(";");
    if (parts[0] !== "0") {
        throw new Error(
            "Invalid Valorant crosshair code"
        );
    }
    const profile = defaultCrosshairProfile();
    let section = "0";
    let expectingKey = true;
    let key = "";
    for (let i = 1; i < parts.length; i++) {
        const token = parts[i];
        if (token === "P" || token === "A" || token === "S") {
            section = token;
            expectingKey = true;
            key = "";
            continue;
        }

        if (expectingKey) {
            key = token;
            expectingKey = false;
            continue;
        }

        const value = token;
        expectingKey = true;

        const entry = CODE_MAP[`${section}:${key}`];
        if (!entry) {
            continue;
        }
        setPath(profile, entry[0], entry[1](value));
    }

    if (profile.primary.hexColor.enabled || profile.primary.color === 8) {
        profile.primary.color = 8;
        profile.primary.hexColor.enabled = true;
    }
    return profile;
}

export function parseValorantCrosshairCodeSafe(code: string): CrosshairProfile {
    try {
        return parseValorantCrosshairCode(code);
    } catch (error) {
        console.error("Crosshair parse failed:", code, error);
        return defaultCrosshairProfile();
    }
}

export function resolveCrosshairColor(layer: CrosshairLayer): string {
    if (layer.color === 8 || layer.hexColor.enabled) {
        const hex = layer.hexColor.value.replace(/^#/, "").slice(0, 6);
        return `#${hex}`;
    }

    return COLORS[clamp(layer.color | 0, 0, 7)];
}

function drawSegment(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number
    , outlinePad: {
        xy: number;
        wh: number;
    }
    , outlines: CrosshairLayer["outlines"],
    alpha: number
): void {
    if (width === 0 || height === 0) {
        return;
    }

    ctx.globalAlpha = alpha;
    ctx.fillRect(x, y, width, height);

    if (outlines.enabled) {
        ctx.globalAlpha = outlines.alpha;

        ctx.strokeRect(x - outlinePad.xy, y - outlinePad.xy, width + outlinePad.wh, height + outlinePad.wh);
    }
}

function drawLayer(ctx: CanvasRenderingContext2D, layer: CrosshairLayer, center: number, hideTop: boolean): void {
    const outlines = layer.outlines;

    const outlinePad = {
        xy: 0.5 * outlines.width,
        wh: outlines.width,
    };

    ctx.strokeStyle = "#000";
    ctx.lineWidth = outlines.width;
    ctx.fillStyle = resolveCrosshairColor(layer);

    const parts = ["inner","dot","outer",] as const;

    for (const name of parts) {
        if (name === "dot") {
            if (!layer.dot.enabled) {
                continue;
            }

            const width = layer.dot.width;
            const position = center - Math.ceil(width / 2);
            ctx.globalAlpha = layer.dot.alpha;

            ctx.fillRect(position, position, width, width);

            if (outlines.enabled) {
                ctx.globalAlpha = outlines.alpha;

                ctx.strokeRect(position - outlinePad.xy, position - outlinePad.xy, width + outlinePad.wh, width + outlinePad.wh);
            }
            continue;
        }

        const lines = layer[name];
        if (!lines.enabled) {
            continue;
        }

        let offset = lines.offset;

        if (lines.fireMul.enabled && !layer.overwriteFireMul) {
            offset += 4;
        }

        const width = lines.width;
        let length = lines.length;
        const alpha = lines.alpha;
        const parity = width % 2;

        // Right
        drawSegment(ctx, center + offset, Math.floor(center - width / 2), length, width, outlinePad, outlines, alpha);
        // Left
        drawSegment(ctx, center - offset - length - parity, Math.floor(center - width / 2), length, width, outlinePad, outlines, alpha);

        if (lines.vertical.enabled) {
            length = lines.vertical.length;
        }

        // Bottom
        drawSegment(ctx, Math.floor(center - width / 2), center + offset, width, length, outlinePad, outlines, alpha);

        // Top
        if (!hideTop) {
            drawSegment(ctx, Math.floor(center - width / 2), center - offset - length - parity, width, length, outlinePad, outlines, alpha);
        }
    }
    ctx.globalAlpha = 1;
}

export function renderCrosshair(canvas: HTMLCanvasElement, profile: CrosshairProfile): void {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        return;
    }
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const center = canvas.width / 2;

    drawLayer(ctx, profile.primary, center, false);
}

export function createCrosshairCanvas(size = 128): HTMLCanvasElement {
    const canvas = document.createElement("canvas");

    canvas.width = size;
    canvas.height = size;

    return canvas;
}

export const crosshairPresets = [
    {
        name: "DOT",
        image: "/assets/xhairs/dot.png",
        code: "0;P;d;1;f;0;0t;4;0l;1;0o;0;0a;1;0f;0;1b;0",
    },
    {
        name: "TENZ",
        image: "/assets/xhairs/tenz.png",
        code: "0;s;1;P;c;5;h;0;m;1;0l;4;0o;2;0a;1;0f;0;1b;0;S;c;4;o;1",
    },
    {
        name: "YAY",
        image: "/assets/xhairs/yay.png",
        code: "0;P;h;0;f;0;0l;4;0o;0;0a;1;0f;0;1b;0",
    },
];