import axios from "axios";
import { USER_PROFILE_API_URL } from "@/constants/urls";
import { useQuery } from "@tanstack/react-query";
import { User, useUserStore } from "@/store/useUserStore";

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

export const useGetUSerProfile = () => {
    const { user } = useUserStore();
    return useQuery({
        queryKey: ["user_infos"],
        queryFn: () => getUserProfile(),
        enabled: !user,
    });
};
