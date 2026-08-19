import { FeatureTypeColumn } from "@/constants/communities/types";
import { Contribution, ContributionType, FeatureTypeMode } from "@/constants/contributions/types";
import { SearchResultItem } from "@/constants/savedSearches/types";
import { FEATURE_TYPE_DATA_PROPERTY, FEATURE_TYPE_GEOSERVICE_PROPERTY } from "@/constants";
import { CommunityGeoservice } from "@/constants/communities/types";
import { Feature } from "ol";
import { create } from "zustand";

interface ContributionStore {
    contributions: Contribution[];
    isReviewContribution: boolean;
    contrToCancel: Contribution[];
    featureTypeMode: FeatureTypeMode;
    isModifying: boolean;
    selectedObjects: Feature[];
    columnsToModify: FeatureTypeColumn[];
    searchResult: SearchResultItem[];
    searchItemToDelete: Feature | null;
    setContributions: (contributions: Contribution[]) => void;
    setReviewContribution: (isReview: boolean) => void;
    setContrToCancel: (contributions: Contribution[]) => void;
    saveContribution: (feat: Feature, type: ContributionType, initialFeat: Feature | null, mapWorkingLayer: string) => void;
    setIsModifying: (isModifying: boolean) => void;
    setFeatureTypeMode: (mode: FeatureTypeMode) => void;
    setSelectedObjects: (objects: Feature[]) => void;
    setColumnsToModify: (columns: FeatureTypeColumn[]) => void;
    searchResultPage: number;
    setSearchResultPage: (page: number) => void;
    setSearchResult: (result: SearchResultItem[]) => void;
    setSearchItemToDelete: (item: Feature | null) => void;
}

export const useContributionStore = create<ContributionStore>((set, get) => ({
    contributions: [],
    isReviewContribution: false,
    contrToCancel: [],
    featureTypeMode: FeatureTypeMode.VIEW,
    isModifying: false,
    selectedObjects: [],
    columnsToModify: [],
    searchResult: [],
    searchItemToDelete: null,
    setContributions: (contributions) => set({ contributions }),
    setReviewContribution: (isReview) => set({ isReviewContribution: isReview }),
    setContrToCancel: (contributions) => set({ contrToCancel: contributions }),
    setIsModifying: (isModifying) => set({ isModifying }),
    setFeatureTypeMode: (mode) => set({ featureTypeMode: mode }),
    setSelectedObjects: (objects) => set({ selectedObjects: objects }),
    setColumnsToModify: (columns) => set({ columnsToModify: columns }),
    searchResultPage: 1,
    setSearchResultPage: (page) => set({ searchResultPage: page }),
    setSearchResult: (result) => set({ searchResult: result, searchResultPage: 1 }),
    setSearchItemToDelete: (item) => set({ searchItemToDelete: item }),
    saveContribution: (feat, type, initialFeat, mapWorkingLayer) => {
        if (!feat) return;
        const { contributions, setContributions } = get();

        const getBackendId = (f: Feature): unknown => {
            const geoservice = f.get(FEATURE_TYPE_GEOSERVICE_PROPERTY) as CommunityGeoservice | undefined;
            const data = f.get(FEATURE_TYPE_DATA_PROPERTY) as Record<string, unknown> | undefined;
            return geoservice?.idName && data ? data[geoservice.idName] : undefined;
        };
        const featBackendId = getBackendId(feat);
        const contrExist = contributions.find(
            (contr) => contr.feature === feat || (featBackendId !== undefined && getBackendId(contr.feature) === featBackendId)
        );

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
