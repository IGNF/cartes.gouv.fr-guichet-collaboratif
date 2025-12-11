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
export enum TransactionType {
    PENDING = "pending",
    COMMITTED = "commited",
    ROLLBACKED = "rollbacked",
    FAILED = "failed",
    CONFLICTING = "conflicting",
    CANCELLED = "cancelled",
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

export interface TransactionStatus {
    id: number;
    user_id: number;
    user_name: string;
    numrec: number;
    started_at: string;
    finished_at: string | null;
    status: TransactionType;
    comment: string;
    message: string;
    actions: TransactionAction[];
    groups: number[];
}

export interface TransactionAction {
    id: number;
    table: number;
    state: ContributionType;
    server_feature_id: string | null;
    client_feature_id: string | null;
    data: Record<string, unknown>;
}
