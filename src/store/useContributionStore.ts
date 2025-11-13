import { Contribution } from "@/constants/contributions/types";
import { create } from "zustand";

interface ContributionStore {
    contributions: Contribution[];
    isReviewContribution: boolean;
    setContributions: (contributions: Contribution[]) => void;
    setReviewContribution: (isReview: boolean) => void;
}

export const useContributionStore = create<ContributionStore>((set) => ({
    contributions: [],
    isReviewContribution: false,
    setContributions: (contributions) => set({ contributions }),
    setReviewContribution: (isReview) => set({ isReviewContribution: isReview }),
}));
