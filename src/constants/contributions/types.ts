import { Feature, MapBrowserEvent } from "ol";
import { Draw, Modify, Select, Snap, Translate } from "ol/interaction";
import { DrawEvent } from "ol/interaction/Draw";
import { ModifyEvent } from "ol/interaction/Modify";
import { SelectEvent } from "ol/interaction/Select";
import { CustomControlItem } from "../communities/types";

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
    COMMITTED = "committed",
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

export type CustomInteraction = Select | Modify | Draw | Translate | null;

export interface InteractionsFuncsProps {
    selectInteractionFunc: (e: SelectEvent) => void;
    removeInteractionFunc: (e: SelectEvent) => void;
    modifyInteractionFunc: (e: ModifyEvent) => void;
    modifyInteractionFuncStart: (e: ModifyEvent) => void;
    drawInteractionFunc: (e: DrawEvent) => void;
    copyInteractionFunc: () => void;
    splitLineInteractionFuncEnd: (e: MapBrowserEvent) => void;
    splitLineInteractionFuncPointer: (e: MapBrowserEvent) => void;
    getInteractionByType: (type: string | null, target: string) => CustomInteraction;
    handleClick: (control: CustomControlItem) => void;
}

export interface InteractionsProps {
    selectInteraction: Select;
    modifyInteraction: Modify;
    drawPointInteraction: Draw;
    drawLineInteraction: Draw;
    drawPolygonInteraction: Draw;
    translateInteraction: Translate;
    splitInteraction: Modify;
    snapInteraction: Snap;
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
