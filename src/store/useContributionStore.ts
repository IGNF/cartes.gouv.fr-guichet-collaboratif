import { Contribution } from "@/constants/contributions/types";
import { create } from "zustand";

interface ContributionStore {
    contributions: Contribution[];
    isReviewContribution: boolean;
    setContributions: (contributions: Contribution[]) => void;
    toggleReviewContribution: () => void;
}

export const useContributionStore = create<ContributionStore>((set, get) => ({
    contributions: [],
    isReviewContribution: false,
    setContributions: (contributions) => set({ contributions }),
    toggleReviewContribution: () => set({ isReviewContribution: !get().isReviewContribution }),
}));
