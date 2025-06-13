import { useCommunityStore } from "@/store/useCommunityStore";
import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/store/useUserStore";
import { CommunityReport, PostReport, reportData, SketchReport, StatusKey } from "@/constants/reports/types";
import { REPORTS_API_URL } from "@/constants/urls";
import { transformExtent } from "ol/proj";
import { Extent } from "ol/extent";
import { axiosApi } from ".";

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

export async function getCommunityReports(communityId: number, extent: Extent): Promise<CommunityReport[] | null> {
    const res = await axiosApi.get(`${REPORTS_API_URL}?communities=${communityId}` + `&limit=20` + `&box=${transformExtent(extent, "EPSG:3857", "EPSG:4326")}`);
    if (!res.data || (res.status !== 200 && res.status !== 206)) return null;

    return res.data.map((report: reportData) => {
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

/* export const useGetCommunityReportsAPI = (communityId: number) => {
    const { community } = useCommunityStore();
    const { user } = useUserStore();

    return useQuery({
        queryKey: ["COMMUNITY_REPORTS_DATA_" + communityId],
        queryFn: () => getCommunityReports(communityId),
        retry: (failureCount, error) => {
            console.log(failureCount);
            return error instanceof TypeError;
        },
        enabled: !!community && !!user,
    });
}; */
