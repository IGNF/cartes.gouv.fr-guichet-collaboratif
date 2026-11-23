import GeoJSON from "ol/format/GeoJSON";
import WKT from "ol/format/WKT";

import { CommunityReport, SketchObject, SketchReport } from "@/constants/reports/types";
import { ESPACECO_URL } from "@/constants/urls";

export type ReportExportFormat = "csv" | "geojson";

export interface ExportColumn {
    key: string;
    label: string;
}

type ExportRow = Record<string, unknown>;
type GeoJSONGeometry = ReturnType<GeoJSON["writeGeometryObject"]>;

interface GeoJSONReportFeature {
    type: "Feature";
    geometry: GeoJSONGeometry;
    properties: ExportRow;
}

interface GeoJSONFeatureCollection {
    type: "FeatureCollection";
    features: GeoJSONReportFeature[];
}

interface ReportTheme {
    theme?: string;
    attributes?: unknown;
}

const escapeCsvValue = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const toGeoJSONPropertyValue = (value: unknown) => {
    if (value === null || value === undefined || ["string", "number", "boolean"].includes(typeof value)) return value ?? null;
    if (Array.isArray(value) && value.every((item) => item === null || ["string", "number", "boolean"].includes(typeof item))) {
        return value.join(";");
    }
    return JSON.stringify(value);
};

const getThemes = (report: CommunityReport): ReportTheme[] => {
    const themes = report.attributes ?? report.themes;
    return Array.isArray(themes) ? (themes as unknown as ReportTheme[]) : [];
};

const addFlattenedThemeProperties = (properties: ExportRow, report: CommunityReport) => {
    const themes = getThemes(report);
    properties.themes = themes
        .map(({ theme }) => theme)
        .filter(Boolean)
        .join(";");

    themes.forEach(({ theme, attributes }, themeIndex) => {
        const themeName = theme || `theme_${themeIndex + 1}`;
        if (!attributes || typeof attributes !== "object" || Array.isArray(attributes)) return;

        Object.entries(attributes).forEach(([attributeName, value]) => {
            properties[`${themeName}.${attributeName}`] = toGeoJSONPropertyValue(value);
        });
    });
};

const parseSketch = (sketch: CommunityReport["sketch"]): SketchReport | null => {
    if (typeof sketch !== "string") return sketch ?? null;
    return JSON.parse(sketch) as SketchReport;
};

const addSketchProperties = (properties: ExportRow, sketchObject: SketchObject, sketchIndex: number) => {
    properties.geometry_role = "sketch";
    properties.sketch_index = sketchIndex;
    properties.sketch_type = sketchObject.type;

    Object.entries(sketchObject.style ?? {}).forEach(([name, value]) => {
        properties[`sketch_style_${name}`] = toGeoJSONPropertyValue(value);
    });
    Object.entries(sketchObject.attributes ?? {}).forEach(([name, value]) => {
        properties[`sketch_attribute_${name}`] = toGeoJSONPropertyValue(value);
    });
};

export const toCSV = (rows: ExportRow[], columns: ExportColumn[]) =>
    [columns.map(({ label }) => escapeCsvValue(label)).join(";"), ...rows.map((row) => columns.map(({ key }) => escapeCsvValue(row[key])).join(";"))].join(
        "\n"
    );

export const toGeoJSON = (reports: CommunityReport[]) => {
    const wktFormat = new WKT();
    const geoJSONFormat = new GeoJSON();

    const featureCollection: GeoJSONFeatureCollection = {
        type: "FeatureCollection",
        features: reports.flatMap((report) => {
            const readGeometry = (wkt: string) =>
                wktFormat.readGeometry(wkt, {
                    dataProjection: "EPSG:4326",
                    featureProjection: "EPSG:4326",
                });
            const sketch = parseSketch(report.sketch);
            const properties: ExportRow = {
                id: report.id,
                report_id: report.id,
                status: report.status,
                comment: report.comment,
                author: report.author?.username ?? null,
                author_id: report.author?.id ?? null,
                opening_date: report.opening_date ?? null,
                updating_date: report.updating_date ?? null,
                closing_date: report.closing_date ?? null,
                commune: report.commune?.title ?? null,
                commune_code: report.commune?.name ?? null,
                departement: report.departement?.title ?? null,
                departement_code: report.departement?.name ?? null,
                documents: report.attachments.map((attachment) => `${ESPACECO_URL}/document/download/${attachment.id}`).join(";"),
                replies: JSON.stringify(report.replies ?? []),
                geometry_role: "report",
            };

            addFlattenedThemeProperties(properties, report);

            const writeGeometry = (wkt: string) =>
                geoJSONFormat.writeGeometryObject(readGeometry(wkt), {
                    dataProjection: "EPSG:4326",
                    featureProjection: "EPSG:4326",
                });
            const reportFeature: GeoJSONReportFeature = {
                type: "Feature",
                geometry: writeGeometry(report.geometry),
                properties,
            };
            const sketchFeatures: GeoJSONReportFeature[] =
                sketch?.objects.map((sketchObject, sketchIndex) => {
                    const sketchProperties = { ...properties };
                    addSketchProperties(sketchProperties, sketchObject, sketchIndex);

                    return {
                        type: "Feature",
                        geometry: writeGeometry(sketchObject.geometry),
                        properties: sketchProperties,
                    };
                }) ?? [];

            return [reportFeature, ...sketchFeatures];
        }),
    };

    return JSON.stringify(featureCollection, null, 2);
};

export const downloadReportExport = (content: string, format: ReportExportFormat) => {
    const isCsv = format === "csv";
    const blob = new Blob([isCsv ? `\uFEFF${content}` : content], {
        type: isCsv ? "text/csv;charset=utf-8;" : "application/geo+json;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `export-reports.${isCsv ? "csv" : "geojson"}`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
};
