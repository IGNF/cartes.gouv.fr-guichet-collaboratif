import { useQuery } from "@tanstack/react-query";
import { transformExtent } from "ol/proj";
import { Extent, isEmpty } from "ol/extent";
import { parseContentRange } from "@/constants/utils";
import { REPORTS_API_URL } from "@/constants/urls";
import { useCommunityStore } from "@/store/useCommunityStore";
import { useUserStore } from "@/store/useUserStore";
import { useReportStore } from "@/store/useReportStore";
import { CommunityReport, FilterState, PostReport, reportData, SketchReport, StatusKey, Reply } from "@/constants/reports/types";
import { getAxiosApi } from ".";

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
    searchReport: string = "",
    sortBy: string = ""
): Promise<{
    data: CommunityReport[];
    total: number;
    currentPage: number;
    searchReport?: string;
    limitPerPage?: number;
}> {
    searchReport = useReportStore.getState().searchReport;

    const safeLimit = !limit || limit < 1 ? 10 : limit;

    let url = `${REPORTS_API_URL}?communities=${communityId}&limit=${safeLimit}&page=${currentPage}`;

    if (filters?.status) {
        url += `&status=${encodeURIComponent(filters?.status)}`;
    }

    if (filters?.author !== null && filters?.author !== undefined) {
        url += `&author=${encodeURIComponent(String(filters?.author))}`;
    }

    if (filters?.departement) {
        url += `&departements=${encodeURIComponent(filters?.departement)}`;
    }

    if (filters?.commune) {
        url += `&commune=${encodeURIComponent(filters?.commune)}`;
    }

    if (filters?.theme) {
        const attributesFilter = [{ community: communityId, theme: filters?.theme }];
        url += `&attributes=${encodeURIComponent(JSON.stringify(attributesFilter))}`;
    }

    if (filters?.opening_date) {
        url += `&opening_date=${encodeURIComponent(filters?.opening_date)}`;
    }

    if (sortBy) {
        url += `&sort=${encodeURIComponent(sortBy)}`;
    }
    const api = await getAxiosApi();
    const res = await api.get(url);
    const contentRange = res.headers["content-range"];

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

export async function postReportsReply(reportsIds: number | number[], body: Reply): Promise<Reply[] | null> {
    try {
        const idsArray = Array.isArray(reportsIds) ? reportsIds : [reportsIds];

        const api = await getAxiosApi();
        const results = await Promise.all(
            idsArray.map(async (reportId) => {
                const urlReply = `${REPORTS_API_URL}/${reportId}/replies`;
                const response = await api.post(urlReply, body, {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                });
                return response.data;
            })
        );

        return results;
    } catch {
        return null;
    }
}

export async function getCommunityThemes(communityId: number): Promise<string[]> {
    const api = await getAxiosApi();
    const url = `${REPORTS_API_URL}?communities=${communityId}&fields=attributes`;
    const res = await api.get(url);

    const reports: Array<{ attributes: Array<{ theme: string }> }> = res.data ?? [];

    const themes = reports.flatMap((report) => (Array.isArray(report.attributes) ? report.attributes.map((attr) => attr.theme) : []));

    const uniqueThemes = [...new Set(themes.filter(Boolean))];

    return uniqueThemes;
}

export async function getCommunityReports(communityId: number, extent: Extent): Promise<CommunityReport[] | null> {
    const boxExtent = transformExtent(extent, "EPSG:3857", "EPSG:4326");
    if (!isFinite(boxExtent[0]) || isEmpty(boxExtent)) return null;
    const limit = 100;
    const api = await getAxiosApi();
    const data = [];
    const res = await api.get(`${REPORTS_API_URL}?communities=${communityId}` + `&limit=${limit}` + `&box=${boxExtent}`);
    if (!res.data || (res.status !== 200 && res.status !== 206)) return null;

    data.push(...res.data);
    const total = parseInt(res.headers["content-range"]?.split("/")[1]) || limit;
    const pages = Array.from({ length: Math.ceil(total / limit) - 1 }, (_, i) => i + 2);

    if (pages.length > 0) {
        const resAll = await Promise.all(
            pages.map((page) =>
                api.get(
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
            opening_date: report.opening_date,
            author: report.author,
            commune: report.commune,
            departement: report.departement,
            attachments: report.attachments.map((attachment) => {
                return {
                    id: attachment.id,
                    short_fileName: attachment.short_fileName,
                    mime_type: attachment.mime_type,
                    size: attachment.size,
                    uri: attachment.uri,
                };
            }),
            sketch: sketchReport,
        };
    });
}

export async function getCommunityReportById(reportId: number): Promise<CommunityReport | null> {
    const api = await getAxiosApi();
    const res = await api.get(`${REPORTS_API_URL}/${reportId}`);

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
                short_fileName: attachment.short_fileName,
                mime_type: attachment.mime_type,
                size: attachment.size,
                uri: attachment.uri,
            };
        }),
        sketch: sketchReport,
        author: report.author,
    };
}

export async function postCommunityReport(report: PostReport): Promise<CommunityReport | null> {
    const api = await getAxiosApi();
    const res = await api.post(`${REPORTS_API_URL}`, report);

    if (!res.data || res.status !== 201) return null;

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
                short_fileName: attachment.short_fileName,
                mime_type: attachment.mime_type,
                size: attachment.size,
                uri: attachment.uri,
            };
        }),
        sketch: sketchReport,
        author: newReport.author,
    };
}

export async function updateCommunityReport(report: PostReport, reportId: number): Promise<CommunityReport | null> {
    const api = await getAxiosApi();
    const res = await api.patch(`${REPORTS_API_URL}/${reportId}`, report);

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
                short_fileName: attachment.short_fileName,
                mime_type: attachment.mime_type,
                size: attachment.size,
                uri: attachment.uri,
            };
        }),
        sketch: sketchReport,
    };
}

export async function deleteCommunityReportAPI(report: CommunityReport): Promise<boolean> {
    const api = await getAxiosApi();
    const res = await api.delete(`${REPORTS_API_URL}/${report.id}`);

    if (res.status !== 204) return false;

    return true;
}

export const useGetCommunityReportByIdAPI = (reportId: number) => {
    const { community } = useCommunityStore();
    const { user } = useUserStore();
    return useQuery({
        queryKey: ["REPORT_DATA_" + reportId],
        queryFn: () => getCommunityReportById(reportId),
        retry: 2,
        enabled: !!community && !!user,
    });
};
