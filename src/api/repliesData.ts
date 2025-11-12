import { Replies } from "@/constants/reports/types";
import { axiosApi } from ".";
import { REPORTS_API_URL } from "@/constants/urls";
import { useQuery } from "@tanstack/react-query";

async function getReportReplies(reportId: number): Promise<Replies> {
    const res = await axiosApi.get(`${REPORTS_API_URL}/${reportId}`);
    return res.data;
}

export const useGetReportReplies = (reportId?: number) => {
    return useQuery<Replies>({
        queryKey: reportId ? ["reportReplies", reportId] : ["reportReplies"],
        queryFn: () => getReportReplies(reportId!),
        enabled: !!reportId,
    });
};

// const { data } = useQuery<Replies>({
//     queryKey: reportId ? ["report", reportId] : ["report"],
//     queryFn: () => getReportReplies(reportId!),
//     enabled: !!reportId,
// });

// export const useGetCommunityByIdAPI = (communityId: string) => {
//     const { community } = useCommunityStore();
//     const { user } = useUserStore();
//     queryClient = useQueryClient();
//     return useQuery({
//         queryKey: ["COMMUNITY_DATA_" + communityId],
//         queryFn: () => getCommunityById(communityId),
//         retry: 2,
//         enabled: !community && isDigital(communityId) && !!user,
//     });
// };
