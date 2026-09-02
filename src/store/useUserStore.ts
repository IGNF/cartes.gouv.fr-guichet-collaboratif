import { User } from "@/constants/user/types";
import { CommunityRole } from "@/constants/user/types";
import { create } from "zustand";

interface UserStore {
    user: User;
    role: CommunityRole | null;
    isLoadingUser: boolean | null;
    setUser: (user: User, communityId: string) => void;
    setIsLoadingUser: (value: boolean) => void;
}

export const useUserStore = create<UserStore>((set) => ({
    user: null,
    role: null,
    isLoadingUser: null,
    setUser: (user, communityId) => {
        const role = user?.communitiesMember.find((community) => community.communityId === communityId)?.role ?? null;
        set({ user, role });
    },
    setIsLoadingUser: (value) => {
        set({ isLoadingUser: value });
    },
}));
