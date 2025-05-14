import { useCommunityStore } from "@/store/useCommunityStore";
import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/store/useUserStore";
import { CommunityReport, StatusKey } from "@/constants/reports/types";
import { REPORTS_API_URL } from "@/constants/urls";
import axios from "axios";
import { transformExtent } from "ol/proj";
import { Extent } from "ol/extent";
import { CommunityTheme } from "@/constants/communities/types";

type reportData = {
    id: number;
    geometry: string;
    comment: string;
    attributes: CommunityTheme[];
    status: StatusKey;
};

export const isDigital = (value: string): boolean => {
    const regex = /^[1-9]\d*$/;
    return regex.test(value);
};

export async function getCommunityReports(communityId: number, extent: Extent): Promise<CommunityReport[] | null> {
    const res = await axios.get(
        `${REPORTS_API_URL}?communities=${communityId}` +
            `&fields=id,status,geometry,attributes,comment` +
            `&box=${transformExtent(extent, "EPSG:3857", "EPSG:4326")}`,
        {
            headers: { "X-Requested-With": "XMLHttpRequest" },
        }
    );
    if (!res.data || (res.status !== 200 && res.status !== 206)) return null;

    return res.data.map((report: reportData) => {
        return {
            id: report.id,
            geometry: report.geometry,
            comment: report.comment,
            themes: report.attributes,
            status: report.status as StatusKey,
        };
    });
}

async function getCommunityReportById(reportId: number): Promise<CommunityReport | null> {
    const res = await axios.get(`${REPORTS_API_URL}/${reportId}`, {
        headers: { "X-Requested-With": "XMLHttpRequest" },
    });

    if (!res.data || res.status !== 200) return null;
    const report: reportData = res.data;
    if (!report) return null;
    return {
        id: report.id,
        geometry: report.geometry,
        comment: report.comment,
        themes: report.attributes,
        status: report.status as StatusKey,
    };
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
