import { Feature } from "ol";

export enum ContributionType {
    CREATE = "Insert",
    MODIFY = "Update",
    DELETE = "Delete",
}

export enum FeatureTypeMode {
    VIEW = "view",
    EDIT = "edit",
}

export interface Contribution {
    feature: Feature;
    initialFeature: Feature;
    layer: string;
    type: ContributionType;
}

export interface TransactionApi {
    database: number;
    body: { comment: string; actions: object[] };
}
