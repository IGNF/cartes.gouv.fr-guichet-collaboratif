import { User } from "@/constants/user/types";
import { create } from "zustand";

interface UserStore {
    user: User;
    isLoadingUser: boolean | null;
    setUser: (user: User | null) => void;
    setIsLoadingUser: (value: boolean) => void;
}

export const useUserStore = create<UserStore>((set) => ({
    user: null,
    isLoadingUser: null,
    setUser: (user) => {
        set({ user });
    },
    setIsLoadingUser: (value) => {
        set({ isLoadingUser: value });
    },
}));
