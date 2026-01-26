import { OperatorType } from "../communities/types";

export interface ConditionRule {
    id: number;
    type: string;
    comparator: string;
    values: string[];
}

export type ConditionGroup = ConditionProps & {
    id: number;
};

export type ConditionElement = ConditionRule | ConditionGroup;

export interface ConditionProps {
    andOr: boolean;
    elements: ConditionElement[];
}

export enum GroupOperator {
    ET = "ET",
    OU = "OU",
}

export type Rule = {
    id: string;
    field: string;
    ruleOperator: OperatorType;
    values: string[];
};

export type Group = {
    id: string;
    operator: GroupOperator;
    rules: Array<Rule | Group>;
};

export interface RuleSearch {
    name: string;
    operator: OperatorType;
    value: string[];
}

export interface GroupSearch {
    groupOp: GroupOperator;
    rules: (RuleSearch | GroupSearch)[];
}

export type BuildFilterResponse = Record<string, unknown>;

export type SearchResultItem = { [key: string]: string | number };

export interface SavedSearch {
    id: string;
    name: string;
    searchRoot: Group;
    searchMax: number;
    searchExtent: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface SavedSearchesStore {
    localSavedSearches: SavedSearch[];
    userSavedSearches: SavedSearch[];
    loadLocalSavedSearches: (communityName: string) => void;
    saveSearchLocally: (communityName: string, name: string, search: Omit<SavedSearch, "id" | "name" | "createdAt" | "updatedAt">) => void;
    deleteLocalSearch: (communityName: string, searchId: string) => void;
    updateLocalSearch: (communityName: string, searchId: string, name: string, search: Omit<SavedSearch, "id" | "name" | "createdAt" | "updatedAt">) => void;
}
