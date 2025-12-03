import { Feature } from "ol";

export enum ContributionType {
    CREATE = "Insert",
    MODIFY = "Update",
    DELETE = "Delete",
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
