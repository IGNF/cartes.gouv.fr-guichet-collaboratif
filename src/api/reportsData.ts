import { useCommunityStore } from "@/store/useCommunityStore";
import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/store/useUserStore";
import { useReportStore } from "@/store/useReportStore";
import { CommunityReport, FilterState, PostReport, reportData, SketchReport, StatusKey } from "@/constants/reports/types";
import { REPORTS_API_URL } from "@/constants/urls";
import { transformExtent } from "ol/proj";
import { Extent, isEmpty } from "ol/extent";
import { axiosApi } from ".";
import { parseContentRange } from "@/constants/utils";

export const isDigital = (value: string): boolean => {
    const regex = /^[1-9]\d*$/;
    return regex.test(value);
};

export const getCommunityReportSketch = (report: reportData) => {
    const sketchJson = report.sketch ? JSON.parse(report.sketch) : null;
    return sketchJson
        ? {
              name: sketchJson.name,
              desc: sketchJson.name,
              contexte: {
                  lat: sketchJson.name,
                  lon: sketchJson.name,
                  zoom: sketchJson.name,
              },
              objects: sketchJson.objects,
          }
        : null;
};

export async function getTableReports(
    communityId: number,
    limit: number = 100,
    currentPage: number = 1,
    filters?: FilterState,
    contentRange: string = "1-10/100",
    searchReport: string = ""
): Promise<{
    data: CommunityReport[];
    total: number;
    currentPage: number;
    contentRange?: string;
    searchReport?: string;
    limitPerPage?: number;
}> {
    searchReport = useReportStore.getState().searchReport;

    let url = `${REPORTS_API_URL}?communities=${communityId}&limit=${limit}&page=${currentPage}`;

    if (filters?.status) {
        url += `&status=${encodeURIComponent(filters?.status)}`;
    }

    if (filters?.author !== null && filters?.author !== undefined) {
        url += `&author=${encodeURIComponent(String(filters?.author))}`;
    }

    if (filters?.department) {
        url += `&departements=${encodeURIComponent(filters?.department)}`;
    }

    if (filters?.theme) {
        const attributesFilter = [{ community: communityId, theme: filters?.theme }];
        url += `&attributes=${encodeURIComponent(JSON.stringify(attributesFilter))}`;
    }

    if (searchReport) url += `&comment=%${encodeURIComponent(searchReport)}%`;

    const res = await axiosApi.get(url);
    contentRange = res.headers["content-range"];

    const { total, currentPage: parsedCurrentPage } = parseContentRange(contentRange);
    currentPage = parsedCurrentPage ?? currentPage;
    if (!res.data) return { data: [], total, currentPage };

    return {
        data: res.data ?? [],
        total,
        currentPage,
        searchReport,
    };
}

export async function getCommunityThemes(communityId: number): Promise<string[]> {
    const url = `${REPORTS_API_URL}?communities=${communityId}&fields=attributes`;
    const res = await axiosApi.get(url);

    const reports: Array<{ attributes: Array<{ theme: string }> }> = res.data ?? [];

    const themes = reports.flatMap((report) => (Array.isArray(report.attributes) ? report.attributes.map((attr) => attr.theme) : []));

    const uniqueThemes = [...new Set(themes.filter(Boolean))];

    return uniqueThemes;
}

export async function getCommunityReports(communityId: number, extent: Extent): Promise<CommunityReport[] | null> {
    const boxExtent = transformExtent(extent, "EPSG:3857", "EPSG:4326");
    if (!isFinite(boxExtent[0]) || isEmpty(boxExtent)) return null;
    const limit = 100;
    const data = [];
    const res = await axiosApi.get(`${REPORTS_API_URL}?communities=${communityId}` + `&limit=${limit}` + `&box=${boxExtent}`);
    if (!res.data || (res.status !== 200 && res.status !== 206)) return null;

    data.push(...res.data);
    const total = parseInt(res.headers["content-range"]?.split("/")[1]) || limit;
    const pages = Array.from({ length: Math.ceil(total / limit) - 1 }, (_, i) => i + 2);

    if (pages.length > 0) {
        const resAll = await Promise.all(
            pages.map((page) =>
                axiosApi.get(
                    `${REPORTS_API_URL}?communities=${communityId}` +
                        `&limit=${limit}` +
                        `&page=${page}` +
                        `&box=${transformExtent(extent, "EPSG:3857", "EPSG:4326")}`
                )
            )
        );

        if (!resAll.length) return null;
        resAll.forEach((res) => data.push(...res.data));
    }

    return data.map((report: reportData) => {
        const sketchReport: SketchReport | null = getCommunityReportSketch(report);
        return {
            id: report.id,
            geometry: report.geometry,
            comment: report.comment,
            themes: report.attributes,
            status: report.status as StatusKey,
            attachments: report.attachments.map((attachment) => {
                return {
                    id: attachment.id,
                    name: attachment.short_fileName,
                    type: attachment.mime_type,
                    size: attachment.size,
                    url: attachment.uri,
                };
            }),
            sketch: sketchReport,
        };
    });
}

async function getCommunityReportById(reportId: number): Promise<CommunityReport | null> {
    const res = await axiosApi.get(`${REPORTS_API_URL}/${reportId}`);

    if (!res.data || res.status !== 200) return null;
    const report: reportData = res.data;
    if (!report) return null;
    const sketchReport: SketchReport | null = getCommunityReportSketch(report);
    return {
        id: report.id,
        geometry: report.geometry,
        comment: report.comment,
        themes: report.attributes,
        status: report.status as StatusKey,
        attachments: report.attachments.map((attachment) => {
            return {
                id: attachment.id,
                name: attachment.short_fileName,
                type: attachment.mime_type,
                size: attachment.size,
                url: attachment.uri,
            };
        }),
        sketch: sketchReport,
    };
}

export async function postCommunityReport(report: PostReport): Promise<CommunityReport | null> {
    const res = await axiosApi.post(`${REPORTS_API_URL}`, report);

    if (!res.data || res.status !== 200) return null;

    const newReport: reportData = res.data;

    const sketchReport: SketchReport | null = getCommunityReportSketch(newReport);
    return {
        id: newReport.id,
        geometry: newReport.geometry,
        comment: newReport.comment,
        themes: newReport.attributes,
        status: newReport.status as StatusKey,
        attachments: newReport.attachments.map((attachment) => {
            return {
                id: attachment.id,
                name: attachment.short_fileName,
                type: attachment.mime_type,
                size: attachment.size,
                url: attachment.uri,
            };
        }),
        sketch: sketchReport,
    };
}

export async function updateCommunityReport(report: PostReport, reportId: number): Promise<CommunityReport | null> {
    const res = await axiosApi.put(`${REPORTS_API_URL}/${reportId}`, report);

    if (!res.data || res.status !== 200) return null;

    const newReport: reportData = res.data;

    const sketchReport: SketchReport | null = getCommunityReportSketch(newReport);
    return {
        id: newReport.id,
        geometry: newReport.geometry,
        comment: newReport.comment,
        themes: newReport.attributes,
        status: newReport.status as StatusKey,
        attachments: newReport.attachments.map((attachment) => {
            return {
                id: attachment.id,
                name: attachment.short_fileName,
                type: attachment.mime_type,
                size: attachment.size,
                url: attachment.uri,
            };
        }),
        sketch: sketchReport,
    };
}

export async function deleteCommunityReportAPI(report: CommunityReport): Promise<boolean> {
    const res = await axiosApi.delete(`${REPORTS_API_URL}/${report.id}`);

    if (res.status !== 204) return false;

    return true;
}

export const useGetCommunityReportByIdAPI = (reportId: number) => {
    const { community } = useCommunityStore();
    const { user } = useUserStore();
    return useQuery({
        queryKey: ["REPORT_DATA_" + reportId],
        queryFn: () => getCommunityReportById(reportId),
        retry: (failureCount, error) => {
            console.log(failureCount);
            return error instanceof TypeError;
        },
        enabled: !!community && !!user,
    });
};
