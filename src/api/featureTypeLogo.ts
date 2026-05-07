import { getAxiosApi } from ".";

const logoCache = new Map<string, string | undefined>();

const blobToDataUrl = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Failed to read blob"));
        reader.onloadend = () => resolve(String(reader.result));
        reader.readAsDataURL(blob);
    });
};

export const appendLogoSize = (logoUri?: string, width = 50, height = 50): string | undefined => {
    if (!logoUri) return undefined;
    const separator = logoUri.includes("?") ? "&" : "?";
    return `${logoUri}${separator}width=${width}&height=${height}`;
};

export const resolveLogoUri = async (logoUri?: string): Promise<string | undefined> => {
    if (!logoUri) return undefined;
    if (logoUri.startsWith("data:")) return logoUri;
    if (logoCache.has(logoUri)) return logoCache.get(logoUri);

    if (typeof window === "undefined") {
        logoCache.set(logoUri, logoUri);
        return logoUri;
    }

    try {
        const api = await getAxiosApi();
        const res = await api.get(logoUri, { responseType: "blob" });
        const contentType = res.headers["content-type"] as string | undefined;
        if (!contentType || !contentType.startsWith("image/")) {
            throw new Error("Invalid image response");
        }
        const dataUrl = await blobToDataUrl(res.data);
        logoCache.set(logoUri, dataUrl);
        return dataUrl;
    } catch {
        logoCache.set(logoUri, undefined);
        return undefined;
    }
};
