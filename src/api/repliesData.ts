import { getAxiosApi } from ".";
import { useQuery } from "@tanstack/react-query";
import { Replies } from "@/constants/reports/types";
import { REPORTS_API_URL } from "@/constants/urls";

async function getReportReplies(reportId: number): Promise<Replies> {
    const api = await getAxiosApi();
    const res = await api.get(`${REPORTS_API_URL}/${reportId}`);
    return res.data;
}

export const useGetReportReplies = (reportId?: number) => {
    return useQuery<Replies>({
        queryKey: reportId ? ["reportReplies", reportId] : ["reportReplies"],
        queryFn: () => getReportReplies(reportId!),
        enabled: !!reportId,
    });
};
