import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const CommunityToolbarFrTranslations: Translations<"fr">["CommunityToolbar"] = {
    save: "Enregistrer les contributions",
    save_pending: "Vérification du statut en cours",
    save_success: "Les contributions ont été sauvegardées",
    save_error: "Les contributions n'ont pas pu être sauvegardées",
    save_missing_configuration: "Certaines contributions ne peuvent pas être sauvegardées car leur base de données ou leur table est manquante",
    history: "Passer en revue les contributions",
    share: "Partager",
    settings: "Paramètres du guichet",
    share_success: "Le lien du guichet a été copié dans le presse-papier",
    share_error: "Impossible de copier le lien",
};

export const CommunityToolbarEnTranslations: Translations<"en">["CommunityToolbar"] = {
    save: "Save contributions",
    save_pending: "Checking contributions status",
    save_success: "Contributions have been successfully saved",
    save_error: "Unable to save contributions",
    save_missing_configuration: "Some contributions cannot be saved because their database or table is missing",
    history: "Review contributions",
    share: "Share",
    settings: "Community settings",
    share_success: "Community link has been copied to the clipboard",
    share_error: "Unable to copy the link",
};

const { i18n } = declareComponentKeys<
    "save" | "save_pending" | "save_success" | "save_error" | "save_missing_configuration" | "history" | "share" | "settings" | "share_success" | "share_error"
>()("CommunityToolbar");
export type I18n = typeof i18n;
