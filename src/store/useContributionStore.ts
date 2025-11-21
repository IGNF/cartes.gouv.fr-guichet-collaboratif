import { Contribution } from "@/constants/contributions/types";
import { create } from "zustand";

interface ContributionStore {
    contributions: Contribution[];
    isReviewContribution: boolean;
    contrToCancel: Contribution[];
    setContributions: (contributions: Contribution[]) => void;
    setReviewContribution: (isReview: boolean) => void;
    setContrToCancel: (contributions: Contribution[]) => void;
}

export const useContributionStore = create<ContributionStore>((set) => ({
    contributions: [],
    isReviewContribution: false,
    contrToCancel: [],
    setContributions: (contributions) => set({ contributions }),
    setReviewContribution: (isReview) => set({ isReviewContribution: isReview }),
    setContrToCancel: (contributions) => set({ contrToCancel: contributions }),
}));
