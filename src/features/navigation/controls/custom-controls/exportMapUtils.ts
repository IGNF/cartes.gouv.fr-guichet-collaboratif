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

export type PAGE_ORIENTATION = "portrait" | "landscape";
export type EXPORT_FORMAT = "PNG" | "JPEG" | "PDF";

export const PAPER_RATIO = 210 / 297;

export const EXPORT_SIZE_OPTIONS = ["A4", "A3", "A2", "A1", "A0", "A5", "B4", "B5"];

export const MARGIN_OPTIONS = [
    { value: "0", label: "Pas de marge - 0mm" },
    { value: "5", label: "Petite marge - 5mm" },
    { value: "10", label: "Moyenne marge - 10mm" },
] as const;

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

const FALLBACK_SIZE = "A4";

const DRAW = {
    TITLE_HEIGHT_PX: 44,
    TITLE_FONT_SCALE: 0.05,
    SCALE_BAR_FONT_SIZE: 10,
    SCALE_BAR_PADDING: 4,
    SCALE_BAR_OFFSET_X: 10,
    SCALE_BAR_OFFSET_Y: 20,
    SCALE_BAR_MIN_HEIGHT: 14,
    BORDER_LINE_WIDTH: 2,
    SCALE_LINE_WIDTH: 1.5,
    TITLE_BORDER_COLOR: "rgba(0, 0, 145, 1)",
    TITLE_BG_COLOR: "rgba(255, 255, 255, 1)",
    TITLE_TEXT_COLOR: "rgba(22, 22, 22, 1)",
    SCALE_BAR_BG: "rgba(255, 255, 255, 0.85)",
    SCALE_BAR_STROKE: "rgba(51, 51, 51, 1)",
    SCALE_BAR_TEXT: "rgba(34, 34, 34, 1)",
} as const;

const MIME_TYPE: Record<Exclude<EXPORT_FORMAT, "PDF">, string> = {
    PNG: "image/png",
    JPEG: "image/jpeg",
};

const FILE_EXT: Record<Exclude<EXPORT_FORMAT, "PDF">, string> = {
    PNG: ".png",
    JPEG: ".jpeg",
};

const getPaperMm = (dimensions: string, orientation: PAGE_ORIENTATION): [number, number] => {
    const [pw, ph] = PAPER_SIZES_MM[dimensions] ?? PAPER_SIZES_MM[FALLBACK_SIZE];
    return orientation === "landscape" ? [ph, pw] : [pw, ph];
};

const getPaperPx = (dimensions: string, orientation: PAGE_ORIENTATION, pr: number, dpi = 120): [number, number] => {
    const [wMm, hMm] = getPaperMm(dimensions, orientation);
    const mmToPx = (dpi / 25.4) * pr;
    return [Math.round(wMm * mmToPx), Math.round(hMm * mmToPx)];
};

const marginToPx = (marginMm: number, dimensions: string, orientation: PAGE_ORIENTATION, paperWPx: number): number => {
    const [wMm] = getPaperMm(dimensions, orientation);
    return Math.round(marginMm * (paperWPx / wMm));
};

const withTranslation = (ctx: CanvasRenderingContext2D, x: number, y: number, draw: () => void) => {
    ctx.save();
    ctx.translate(x, y);
    draw();
    ctx.restore();
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
    ctx.fillStyle = DRAW.TITLE_BG_COLOR;
    ctx.fillRect(0, 0, w, h);
    ctx.font = `bold ${DRAW.TITLE_FONT_SCALE * pr * innerHeight}px Marianne, Arial, sans-serif`;
    ctx.fillStyle = DRAW.TITLE_TEXT_COLOR;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, w / 2, h / 2);
    ctx.strokeStyle = DRAW.TITLE_BORDER_COLOR;
    ctx.lineWidth = DRAW.BORDER_LINE_WIDTH * pr;
    ctx.beginPath();
    ctx.moveTo(0, h - pr);
    ctx.lineTo(w, h - pr);
    ctx.stroke();
};

const drawScaleBar = (ctx: CanvasRenderingContext2D, mapEl: HTMLElement, canvasH: number, pr: number) => {
    const inner = mapEl.querySelector<HTMLElement>(".ol-scale-line-inner");
    if (!inner) return;
    const text = inner.textContent ?? "";
    const [w, h] = [inner.offsetWidth * pr, Math.max(inner.offsetHeight, DRAW.SCALE_BAR_MIN_HEIGHT) * pr];
    const [x, y] = [DRAW.SCALE_BAR_OFFSET_X * pr, canvasH - h - DRAW.SCALE_BAR_OFFSET_Y * pr];
    const pad = DRAW.SCALE_BAR_PADDING * pr;
    ctx.fillStyle = DRAW.SCALE_BAR_BG;
    ctx.fillRect(x - pad, y - pad, w + pad * 2, h + pad * 2);
    ctx.strokeStyle = DRAW.SCALE_BAR_STROKE;
    ctx.lineWidth = DRAW.SCALE_LINE_WIDTH * pr;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w, y);
    ctx.stroke();
    ctx.font = `bold ${DRAW.SCALE_BAR_FONT_SIZE * pr}px Arial, sans-serif`;
    ctx.fillStyle = DRAW.SCALE_BAR_TEXT;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + w / 2, y + h / 2);
};

export interface ExportOpts {
    orientation: PAGE_ORIENTATION;
    dimensions: string;
    margin: number;
    title: string;
    hasTitle: boolean;
    hasScale: boolean;
    format: EXPORT_FORMAT;
    previewMap: OlMap;
}

const buildOutputCanvas = (
    previewCanvas: HTMLCanvasElement,
    previewEl: HTMLElement,
    opts: Omit<ExportOpts, "format" | "previewMap">,
    pr: number
): HTMLCanvasElement => {
    const { orientation, dimensions, margin, title, hasTitle, hasScale } = opts;
    const [paperW, paperH] = getPaperPx(dimensions, orientation, pr);
    const marginPx = marginToPx(margin, dimensions, orientation, paperW);
    const titleH = hasTitle && title.trim() ? Math.round(DRAW.TITLE_HEIGHT_PX * pr) : 0;

    const out = document.createElement("canvas");
    out.width = paperW;
    out.height = paperH;
    const ctx = out.getContext("2d")!;

    ctx.fillStyle = "rgba(255, 255, 255, 1)";
    ctx.fillRect(0, 0, paperW, paperH);

    const innerW = paperW - marginPx * 2;
    if (titleH > 0) withTranslation(ctx, marginPx, marginPx, () => drawTitle(ctx, title, innerW, titleH, pr));

    const mapArea = { x: marginPx, y: marginPx + titleH, w: innerW, h: paperH - marginPx * 2 - titleH };
    ctx.drawImage(previewCanvas, mapArea.x, mapArea.y, mapArea.w, mapArea.h);

    if (hasScale) withTranslation(ctx, mapArea.x, mapArea.y, () => drawScaleBar(ctx, previewEl, mapArea.h, pr));

    return out;
};

const saveAsPdf = (canvas: HTMLCanvasElement, dimensions: string, orientation: PAGE_ORIENTATION, title: string, pr: number) => {
    const pxToMm = 25.4 / 96 / pr;
    const [wMm, hMm] = [canvas.width * pxToMm, canvas.height * pxToMm];
    const doc = new jsPDF({ orientation: orientation === "landscape" ? "landscape" : "portrait", unit: "mm", format: dimensions.toLocaleLowerCase() });
    const [dw, dh] = [doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight()];
    const s = Math.min(dw / wMm, dh / hMm);
    doc.addImage(canvas.toDataURL("image/png"), "PNG", (dw - wMm * s) / 2, (dh - hMm * s) / 2, wMm * s, hMm * s);
    doc.save(`${title}.pdf`);
};

const saveAsImage = (canvas: HTMLCanvasElement, format: Exclude<EXPORT_FORMAT, "PDF">, title: string) => {
    const a = document.createElement("a");
    a.download = title + FILE_EXT[format];
    a.href = canvas.toDataURL(MIME_TYPE[format], format === "JPEG" ? 0.99 : undefined);
    a.click();
};

export const exportMap = (_mainMap: OlMap, { format, previewMap, ...opts }: ExportOpts) => {
    const previewEl = previewMap.getTargetElement() as HTMLElement;
    const previewCanvas = compositeCanvases(previewEl);
    if (!previewCanvas) return;

    const pr = window.devicePixelRatio || 1;
    const out = buildOutputCanvas(previewCanvas, previewEl, opts, pr);

    if (format === "PDF") saveAsPdf(out, opts.dimensions, opts.orientation, opts.title, pr);
    else saveAsImage(out, format, opts.title);
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
