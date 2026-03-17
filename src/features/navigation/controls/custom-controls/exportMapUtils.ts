import OlMap from "ol/Map";
import View from "ol/View";
import { ScaleLine } from "ol/control";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import WebGLVectorLayer from "ol/layer/WebGLVector";
import LayerGroup from "ol/layer/Group";
import ImageLayer from "ol/layer/Image";
import type { FlatStyleLike } from "ol/style/flat";
import { jsPDF } from "jspdf";

export type PageOrientation = "portrait" | "landscape";
export type ExportFormat = "PNG" | "JPEG" | "PDF";

export const PAPER_RATIO = 210 / 297;
export const ExportSizeOption = ["A4", "A3", "A2", "A1", "A0", "A5", "B4", "B5"];
export const MARGIN_OPTIONS = [
    { value: "0", label: "Pas de marge - 0mm" },
    { value: "5", label: "Petite marge - 5mm" },
    { value: "10", label: "Moyenne marge - 10mm" },
];

const PAPER_SIZES_MM: Record<string, [number, number]> = {
    A0: [841, 1189],
    A1: [594, 841],
    A2: [420, 594],
    A3: [297, 420],
    A4: [210, 297],
    A5: [148, 210],
    B4: [250, 353],
    B5: [176, 250],
};

export const paperSizePx = (dimensions: string, orientation: PageOrientation, pr: number, dpi = 180): [number, number] => {
    const [pw, ph] = PAPER_SIZES_MM[dimensions] ?? PAPER_SIZES_MM["A4"];
    const [wMm, hMm] = orientation === "landscape" ? [ph, pw] : [pw, ph];
    const mmToPx = (dpi / 25.4) * pr;
    return [Math.round(wMm * mmToPx), Math.round(hMm * mmToPx)];
};

const cloneSingleLayer = (layer: import("ol/layer/Base").default) => {
    try {
        const p = { opacity: layer.getOpacity(), minZoom: layer.getMinZoom(), maxZoom: layer.getMaxZoom() };
        if (layer instanceof TileLayer) return new TileLayer({ ...p, source: layer.getSource() ?? undefined });
        if (layer instanceof WebGLVectorLayer)
            return new WebGLVectorLayer({
                ...p,
                source: (layer as WebGLVectorLayer).getSource() ?? undefined,
                style: (layer as unknown as { style_: FlatStyleLike }).style_,
            });
        if (layer instanceof VectorLayer) return new VectorLayer({ ...p, source: layer.getSource() ?? undefined, style: layer.getStyle() ?? undefined });
        if (layer instanceof ImageLayer) return new ImageLayer({ ...p, source: layer.getSource() ?? undefined });
        return null;
    } catch {
        return null;
    }
};

export const cloneLayers = (map: OlMap): import("ol/layer/Base").default[] => {
    const out: import("ol/layer/Base").default[] = [];
    map.getLayers().forEach((layer) => {
        if (!layer.getVisible()) return;
        if (layer instanceof LayerGroup) {
            const subs: import("ol/layer/Base").default[] = [];
            layer.getLayers().forEach((sub) => {
                if (sub.getVisible()) {
                    const c = cloneSingleLayer(sub);
                    if (c) subs.push(c);
                }
            });
            if (subs.length) {
                const g = new LayerGroup({ layers: subs });
                g.setOpacity(layer.getOpacity());
                out.push(g);
            }
        } else {
            const c = cloneSingleLayer(layer);
            if (c) out.push(c);
        }
    });
    return out;
};

export const compositeCanvases = (mapEl: HTMLElement): HTMLCanvasElement | null => {
    const canvases = mapEl.querySelector(".ol-viewport")?.querySelectorAll<HTMLCanvasElement>("canvas");
    if (!canvases?.length) return null;
    const [first] = Array.from(canvases);
    const out = document.createElement("canvas");
    [out.width, out.height] = [first.width, first.height];
    const ctx = out.getContext("2d")!;
    canvases.forEach((c) => {
        if (c.width > 0 && c.height > 0) ctx.drawImage(c, 0, 0);
    });
    return out;
};

const drawTitle = (ctx: CanvasRenderingContext2D, text: string, w: number, h: number, pr: number) => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.font = `bold ${0.05 * pr * innerHeight}px Marianne, Arial, sans-serif`;
    ctx.fillStyle = "#161616";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, w / 2, h / 2);
    ctx.strokeStyle = "#000091";
    ctx.lineWidth = 2 * pr;
    ctx.beginPath();
    ctx.moveTo(0, h - pr);
    ctx.lineTo(w, h - pr);
    ctx.stroke();
};

const drawScaleBar = (ctx: CanvasRenderingContext2D, mapEl: HTMLElement, canvasH: number, pr: number) => {
    const inner = mapEl.querySelector<HTMLElement>(".ol-scale-line-inner");
    if (!inner) return;
    const text = inner.textContent ?? "";
    const [w, h] = [inner.offsetWidth * pr, Math.max(inner.offsetHeight, 14) * pr];
    const [x, y] = [10 * pr, canvasH - h - 20 * pr];
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillRect(x - 4 * pr, y - 4 * pr, w + 8 * pr, h + 8 * pr);
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1.5 * pr;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w, y);
    ctx.stroke();
    ctx.font = `bold ${10 * pr}px Arial, sans-serif`;
    ctx.fillStyle = "#222";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + w / 2, y + h / 2);
};

export interface ExportOpts {
    orientation: PageOrientation;
    dimensions: string;
    margin: number;
    title: string;
    hasTitle: boolean;
    hasScale: boolean;
    format: ExportFormat;
    previewMap: OlMap;
}

export const exportMap = (_mainMap: OlMap, { orientation, dimensions, margin, title, hasTitle, hasScale, format, previewMap }: ExportOpts) => {
    const previewEl = previewMap.getTargetElement() as HTMLElement;
    const previewCanvas = compositeCanvases(previewEl);
    if (!previewCanvas) return;

    const pr = window.devicePixelRatio || 1;

    const [paperW, paperH] = paperSizePx(dimensions, orientation, pr);
    const marginPx = Math.round(
        margin * (paperW / (orientation === "landscape" ? (PAPER_SIZES_MM[dimensions]?.[1] ?? 297) : (PAPER_SIZES_MM[dimensions]?.[0] ?? 210)))
    );
    const titleH = hasTitle && title.trim() ? Math.round(44 * pr) : 0;

    const out = document.createElement("canvas");
    out.width = paperW;
    out.height = paperH;
    const ctx = out.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, out.width, out.height);

    const innerW = paperW - marginPx * 2;
    if (titleH > 0) {
        ctx.save();
        ctx.translate(marginPx, marginPx);
        drawTitle(ctx, title, innerW, titleH, pr);
        ctx.restore();
    }

    const mapAreaX = marginPx;
    const mapAreaY = marginPx + titleH;
    const mapAreaW = innerW;
    const mapAreaH = paperH - marginPx * 2 - titleH;

    ctx.drawImage(previewCanvas, mapAreaX, mapAreaY, mapAreaW, mapAreaH);

    if (hasScale) {
        ctx.save();
        ctx.translate(mapAreaX, mapAreaY);
        drawScaleBar(ctx, previewEl, mapAreaH, pr);
        ctx.restore();
    }

    if (format === "PDF") {
        const pxToMm = 25.4 / 96 / pr;
        const [wMm, hMm] = [out.width * pxToMm, out.height * pxToMm];
        const isLs = orientation === "landscape";
        const doc = new jsPDF({
            orientation: isLs ? "landscape" : "portrait",
            unit: "mm",
            format: dimensions.toLocaleLowerCase(),
        });
        const [dw, dh] = [doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight()];
        const s = Math.min(dw / wMm, dh / hMm);
        doc.addImage(out.toDataURL("image/png"), "PNG", (dw - wMm * s) / 2, (dh - hMm * s) / 2, wMm * s, hMm * s);
        doc.save(title + ".pdf");
    } else {
        const a = document.createElement("a");
        a.download = format === "PNG" ? "carte.png" : "carte.jpeg";
        a.href = format === "PNG" ? out.toDataURL("image/png") : out.toDataURL("image/jpeg", 0.99);
        a.click();
    }
};

export const createPreviewMap = (target: HTMLDivElement, mainMap: OlMap) => {
    const view = mainMap.getView();
    const scaleControl = new ScaleLine({ units: "metric" });
    const previewMap = new OlMap({
        target,
        layers: cloneLayers(mainMap),
        controls: [scaleControl],
        view: new View({ center: view.getCenter(), zoom: view.getZoom(), projection: view.getProjection() }),
    });
    return { previewMap, scaleControl };
};
