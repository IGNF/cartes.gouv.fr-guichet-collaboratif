import { declareComponentKeys } from "i18nifty";
import type { Translations } from "../../../i18n/types";
import { JSX } from "react";
import { Contribution } from "@/constants/contributions/types";
import { FEATURE_TYPE_DATA_PROPERTY } from "@/constants";

export const MapToolbarFrTranslations: Translations<"fr">["MapToolbar"] = {
    community_title: ({ communityName }: { communityName: string }) => `Guichet - ${communityName || "Aucun titre"}`,
    save_contributions: ({ contributionCount }: { contributionCount: number | null }) =>
        `Enregistrer vos contributions ${contributionCount ? `(${contributionCount})` : ""}`,
    save_contribution_success: "Toute les contributions sont enregistrées",
    save_contribution_error: ({ notPostedContrs }: { notPostedContrs: Contribution[] }) =>
        "Erreur de l'neregistrement des contributions : " + notPostedContrs.map((contr) => contr.feature.get(FEATURE_TYPE_DATA_PROPERTY).id).join(", "),
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
    reset: "Annuler",
    manage: "Gérer le guichet",
    seismicity_zone: "Zones de sismicité",
    all_reports: "Tous les signalements",
    error: "Les contributions n'ont pas pu être sauvegardées",
    statut: "Vérification du statut en cours",
    success: "Les contributions ont pu être sauvegardées",
};

export const MapToolbarEnTranslations: Translations<"en">["MapToolbar"] = {
    community_title: ({ communityName }: { communityName: string }) => `Community - ${communityName || "No title"}`,
    save_contributions: ({ contributionCount }: { contributionCount: number | null }) =>
        `Save your contributions ${contributionCount ? `(${contributionCount})` : ""}`,
    save_contribution_success: "All contributions have been successfully saved.",
    save_contribution_error: ({ notPostedContrs }: { notPostedContrs: Contribution[] }) =>
        "Error saving contributions: " + notPostedContrs.map((contr) => contr.feature.get(FEATURE_TYPE_DATA_PROPERTY).id).join(", "),
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
    seismicity_zone: "Seismicity zones",
    all_reports: "All reports",
    error: "Unable to save contributions",
    statut: "Checking contributions status",
    success: "Contributions have been successfully saved",
};

const { i18n } = declareComponentKeys<
    | { K: "community_title"; P: { communityName: string }; R: string }
    | { K: "save_contributions"; P: { contributionCount: number | null }; R: string }
    | "save_contribution_success"
    | { K: "save_contribution_error"; P: { notPostedContrs: Contribution[] }; R: string }
    | "show_more"
    | { K: "object_created"; P: { count: number }; R: JSX.Element }
    | { K: "object_modified"; P: { count: number }; R: JSX.Element }
    | { K: "object_deleted"; P: { count: number }; R: JSX.Element }
    | "review"
    | "reset"
    | "manage"
    | "seismicity_zone"
    | "all_reports"
    | "error"
    | "statut"
    | "success"
>()("MapToolbar");
export type I18n = typeof i18n;
