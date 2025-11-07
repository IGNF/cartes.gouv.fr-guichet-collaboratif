import { Feature } from "ol";

export enum ContributionType {
    CREATE = "create",
    MODIFY = "modify",
    DELETE = "delete",
}

export interface Contribution {
    feature: Feature;
    initialFeature: Feature;
    layer: string;
    type: ContributionType;
}
