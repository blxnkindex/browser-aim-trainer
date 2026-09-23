import { Skin } from "./Skin";

interface SkinCatalogFile {
    skins: Skin[];
}

export class SkinCatalog {
    private skins: Skin[] = [];
    private skinsById = new Map<string, Skin>();

    async load(): Promise<void> {
        const response = await fetch("/assets/skins/skins.json");

        if (!response.ok) {
            throw new Error(
                `Failed to load skin catalog: ${response.status} ${response.statusText}`
            );
        }

        const data = (await response.json()) as SkinCatalogFile;

        if (!Array.isArray(data.skins)) {
            throw new Error("Skin catalog does not contain a valid skins array.");
        }

        this.skins = data.skins.filter((skin) => skin.enabled !== false);

        this.skinsById.clear();

        for (const skin of this.skins) {
            this.skinsById.set(skin.id, skin);
        }
    }

    getAll(): Skin[] {
        return [...this.skins];
    }

    getEnabled(): Skin[] {
        return this.skins.filter((skin) => skin.enabled);
    }

    getById(id: string): Skin | undefined {
        return this.skinsById.get(id);
    }

    has(id: string): boolean {
        return this.skinsById.has(id);
    }

    getByCategory(category: string): Skin[] {
        return this.skins.filter(
            (skin) => skin.category === category
        );
    }

    getByVariantGroup(variantGroup: string): Skin[] {
        return this.skins.filter(
            (skin) => skin.variantGroup === variantGroup
        );
    }
}