import { Contribution, ContributionType, FeatureTypeMode } from "@/constants/contributions/types";
import { Feature } from "ol";
import { create } from "zustand";

interface ContributionStore {
    contributions: Contribution[];
    isReviewContribution: boolean;
    contrToCancel: Contribution[];
    featureTypeMode: FeatureTypeMode;
    isModifying: boolean;
    setContributions: (contributions: Contribution[]) => void;
    setReviewContribution: (isReview: boolean) => void;
    setContrToCancel: (contributions: Contribution[]) => void;
    saveContribution: (feat: Feature, type: ContributionType, initialFeat: Feature | null, mapWorkingLayer: string) => void;
    setIsModifying: (isModifying: boolean) => void;
}

export const useContributionStore = create<ContributionStore>((set, get) => ({
    contributions: [],
    isReviewContribution: false,
    contrToCancel: [],
    featureTypeMode: FeatureTypeMode.VIEW,
    isModifying: false,
    setContributions: (contributions) => set({ contributions }),
    setReviewContribution: (isReview) => set({ isReviewContribution: isReview }),
    setContrToCancel: (contributions) => set({ contrToCancel: contributions }),
    setIsModifying: (isModifying) => set({ isModifying }),
    saveContribution: (feat, type, initialFeat, mapWorkingLayer) => {
        const { contributions, setContributions } = get();
        const contrExist = contributions.find((contr) => contr.feature === feat);

        const newContr: Contribution = {
            feature: feat,
            initialFeature: initialFeat ?? feat?.clone(),
            layer: mapWorkingLayer,
            type,
        };

        let newContributions = [...contributions, newContr];

        if (contrExist) {
            newContr.initialFeature = contrExist.initialFeature;
            newContributions = [...contributions.filter((contr) => contr.feature !== contrExist.feature), newContr];
            if (contrExist.type === ContributionType.CREATE) {
                if (type === ContributionType.DELETE) {
                    newContributions = [...contributions.filter((contr) => contr.feature !== newContr.feature)];
                }
                if (type === ContributionType.MODIFY) {
                    newContr.type = ContributionType.CREATE;
                    newContributions = [...contributions.filter((contr) => contr.feature !== contrExist.feature), newContr];
                }
            }
            if (type === ContributionType.MODIFY) {
                newContributions = [...contributions.filter((contr) => contr.feature !== contrExist.feature), newContr];
            }
        }
        setContributions(newContributions);
    },
}));
