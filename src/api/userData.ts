import { USER_PROFILE_API_URL } from "@/constants/urls";
import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/store/useUserStore";
import { User, UserAPIData } from "@/constants/user/types";
import { axiosApi } from ".";

async function getUserProfile(): Promise<User> {
    const res = await axiosApi.get(USER_PROFILE_API_URL);
    if (res.status > 206) {
        return null;
    }

    const user: UserAPIData = res.data;
    return {
        id: `${user.id}`,
        name: user.username,
        communitiesMember: user.communities_member.map((cm) => {
            return {
                communityId: cm.community_id,
                role: cm.role,
            };
        }),
    };
}

export const useGetUserProfileAPI = () => {
    const { user } = useUserStore();
    return useQuery({
        queryKey: ["USER_DATA"],
        queryFn: () => getUserProfile(),
        retry: 1,
        enabled: !user,
    });
};
