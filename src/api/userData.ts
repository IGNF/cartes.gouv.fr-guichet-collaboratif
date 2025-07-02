import { USER_PROFILE_API_URL } from "@/constants/urls";
import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/store/useUserStore";
import { User } from "@/constants/user/types";
import { axiosApi } from ".";

async function getUserProfile(): Promise<User> {
    const res = await axiosApi.get(USER_PROFILE_API_URL);
    if (res.data.code === 401) {
        return null;
    }
    return {
        id: `${res.data.id}`,
        name: res.data.user_name,
    };
}

export const useGetUserProfileAPI = () => {
    const { user } = useUserStore();
    return useQuery({
        queryKey: ["USER_DATA"],
        queryFn: () => getUserProfile(),
        retry: (failureCount, error) => {
            console.log(failureCount);
            return error instanceof TypeError;
        },
        enabled: !user,
    });
};
