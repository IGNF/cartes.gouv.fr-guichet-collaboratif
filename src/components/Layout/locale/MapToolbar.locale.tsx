import { declareComponentKeys } from "i18nifty";
import type { Translations } from "../../../i18n/types";
import { JSX } from "react";

export const MapToolbarFrTranslations: Translations<"fr">["MapToolbar"] = {
    community_title: ({ communityName }: { communityName: string }) => `Guichet - ${communityName || "Aucun titre"}`,
    save_contributions: ({ contributionCount }: { contributionCount: number | null }) =>
        `Enregistrer vos contributions ${contributionCount ? `(${contributionCount})` : ""}`,
    show_more: "Afficher plus",
    object_created: ({ count }: { count: number }) => (
        <>
            Objets créés : <span className="map-toolbar-line-count">{count}</span>
        </>
    ),
    object_modified: ({ count }: { count: number }) => (
        <>
            Objets modifiés : <span className="map-toolbar-line-count">{count}</span>
        </>
    ),
    object_deleted: ({ count }: { count: number }) => (
        <>
            Objets supprimés : <span className="map-toolbar-line-count">{count}</span>
        </>
    ),
    review: "Revoir vos objets créés et modifiés avant de les enregistrer",
    reset: "Réinitialiser",
    manage: "Gérer le guichet",
    working_layer: "Couche de travail :",
    seismicity_zone: "Zones de sismicité",
    all_reports: "Tous les signalements",
    read_only: "Lecture",
};

export const MapToolbarEnTranslations: Translations<"en">["MapToolbar"] = {
    community_title: ({ communityName }: { communityName: string }) => `Community - ${communityName || "No title"}`,
    save_contributions: ({ contributionCount }: { contributionCount: number | null }) =>
        `Save your contributions ${contributionCount ? `(${contributionCount})` : ""}`,
    show_more: "Show more",
    object_created: ({ count }: { count: number }) => (
        <>
            Objects created: <span className="map-toolbar-line-count">{count}</span>
        </>
    ),
    object_modified: ({ count }: { count: number }) => (
        <>
            Objects modified: <span className="map-toolbar-line-count">{count}</span>
        </>
    ),
    object_deleted: ({ count }: { count: number }) => (
        <>
            Objects deleted: <span className="map-toolbar-line-count">{count}</span>
        </>
    ),
    review: "Review your created and modified objects before saving them",
    reset: "Reset",
    manage: "Manage community",
    working_layer: "Working layer:",
    seismicity_zone: "Seismicity zones",
    all_reports: "All reports",
    read_only: "Read only",
};

const { i18n } = declareComponentKeys<
    | { K: "community_title"; P: { communityName: string }; R: string }
    | { K: "save_contributions"; P: { contributionCount: number | null }; R: string }
    | "show_more"
    | { K: "object_created"; P: { count: number }; R: JSX.Element }
    | { K: "object_modified"; P: { count: number }; R: JSX.Element }
    | { K: "object_deleted"; P: { count: number }; R: JSX.Element }
    | "review"
    | "reset"
    | "manage"
    | "working_layer"
    | "seismicity_zone"
    | "all_reports"
    | "read_only"
>()("MapToolbar");
export type I18n = typeof i18n;
