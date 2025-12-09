import { Contribution, FeatureTypeMode } from "@/constants/contributions/types";
import { create } from "zustand";

interface ContributionStore {
    contributions: Contribution[];
    isReviewContribution: boolean;
    contrToCancel: Contribution[];
    featureTypeMode: FeatureTypeMode;
    setContributions: (contributions: Contribution[]) => void;
    setReviewContribution: (isReview: boolean) => void;
    setContrToCancel: (contributions: Contribution[]) => void;
    setFeatureTypeMode: (mode: FeatureTypeMode) => void;
}

export const useContributionStore = create<ContributionStore>((set) => ({
    contributions: [],
    isReviewContribution: false,
    contrToCancel: [],
    featureTypeMode: FeatureTypeMode.VIEW,
    setContributions: (contributions) => set({ contributions }),
    setReviewContribution: (isReview) => set({ isReviewContribution: isReview }),
    setContrToCancel: (contributions) => set({ contrToCancel: contributions }),
    setFeatureTypeMode: (mode) => set({ featureTypeMode: mode }),
}));
