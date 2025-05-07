import axios from "axios";
import { USER_PROFILE_API_URL } from "@/constants/urls";
import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/store/useUserStore";
import { User } from "@/constants/user/types";

async function getUserProfile(): Promise<User> {
    const res = await axios.get(USER_PROFILE_API_URL, {
        headers: { "X-Requested-With": "XMLHttpRequest" },
    });
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
