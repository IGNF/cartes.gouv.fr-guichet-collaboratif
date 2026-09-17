import GeoJSON from "ol/format/GeoJSON";
import WKT from "ol/format/WKT";

import { CommunityReport } from "@/constants/reports/types";
import { SERVER_URL } from "@/constants/urls";

export type ReportExportFormat = "csv" | "geojson";

export interface ExportColumn {
    key: string;
    label: string;
}

type ExportRow = Record<string, unknown>;
type GeoJSONGeometry = ReturnType<GeoJSON["writeGeometryObject"]>;

interface GeoJSONFeature {
    type: "Feature";
    geometry: GeoJSONGeometry;
    properties: ExportRow;
}

interface GeoJSONFeatureCollection {
    type: "FeatureCollection";
    features: GeoJSONFeature[];
}

interface ReportTheme {
    theme?: string;
    attributes?: unknown;
}

const escapeCsvValue = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const getThemes = (report: CommunityReport): ReportTheme[] => {
    const themes = report.attributes ?? report.themes;
    return Array.isArray(themes) ? (themes as unknown as ReportTheme[]) : [];
};

const addFlattenedThemeProperties = (properties: ExportRow, report: CommunityReport) => {
    const themes = getThemes(report);
    properties.themes = themes.map(({ theme }) => theme).filter(Boolean);

    themes.forEach(({ theme, attributes }, themeIndex) => {
        const themeName = theme || `theme_${themeIndex + 1}`;
        if (!attributes || typeof attributes !== "object" || Array.isArray(attributes)) return;

        Object.entries(attributes).forEach(([attributeName, value]) => {
            properties[`${themeName}.${attributeName}`] = value;
        });
    });
};

const parseSketch = (sketch: CommunityReport["sketch"]) => {
    if (typeof sketch !== "string") return sketch ?? null;
    return JSON.parse(sketch) as unknown;
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
        features: reports.map((report) => {
            const geometry = wktFormat.readGeometry(report.geometry, {
                dataProjection: "EPSG:4326",
                featureProjection: "EPSG:4326",
            });
            const properties: ExportRow = {
                id: report.id,
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
                documents: report.attachments.map((attachment) => `${SERVER_URL}/document/download/${attachment.id}`),
                replies: report.replies ?? [],
                sketch: parseSketch(report.sketch),
            };

            addFlattenedThemeProperties(properties, report);

            return {
                type: "Feature",
                geometry: geoJSONFormat.writeGeometryObject(geometry, {
                    dataProjection: "EPSG:4326",
                    featureProjection: "EPSG:4326",
                }),
                properties,
            };
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
