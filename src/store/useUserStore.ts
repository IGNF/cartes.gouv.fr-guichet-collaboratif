import { create } from "zustand";

export type User = {
    id: string;
    name: string;
} | null;

interface UserStore {
    user: User;
    isLoadingUser: boolean | null;
    setUser: (user: User) => void;
    clearUser: () => void;
    setIsLoadingUser: (value: boolean) => void;
}

export const useUserStore = create<UserStore>((set) => ({
    user: null,
    isLoadingUser: null,
    setUser: (user) => {
        set({ user });
    },
    clearUser: () => {
        set({ user: null });
    },
    setIsLoadingUser: (value) => {
        set({ isLoadingUser: value });
    },
}));
