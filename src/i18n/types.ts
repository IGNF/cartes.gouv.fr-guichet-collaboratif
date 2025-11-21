import type { GenericTranslations } from "i18nifty";

export const languages = ["fr", "en"] as const;

export const fallbackLanguage = "fr";

export const languagesDisplayNames: Record<Language, string> = {
    fr: "Français",
    en: "English",
};

export type Language = (typeof languages)[number];

export type ComponentKey =
    | import("../components/Layout/locale/AppFooter.locale").I18n
    | import("../components/Layout/locale/AppHeader.locale").I18n
    | import("../components/Layout/locale/MapToolbar.locale").I18n
    | import("../components/locale/DrawerComponent.locale").I18n
    | import("../pages/locale/NotConnected.locale").I18n
    | import("../pages/locale/NotFound.locale").I18n
    | import("../pages/locale/Carte.locale").I18n
    | import("../features/contributions/locale/ContributionList.locale").I18n
    | import("../features/contributions/locale/ContributionsConfirmReset.locale").I18n
    | import("../features/contributions/locale/ReviewContributions.locale").I18n
    | import("../features/navigation/layers/locale/GetReportsLayer.locale").I18n
    | import("../features/navigation/layers/legends/locale/FeatureTypeLayerLegends.locale").I18n
    | import("../features/navigation/controls/locale/DrawingControl.locale").I18n
    | import("../features/navigation/controls/locale/CatalogControl.locale").I18n
    | import("../features/navigation/controls/cusom-controls/locale/CenterReportControl.locale").I18n
    | import("../features/navigation/controls/locale/useGetMapControls.locale").I18n
    | import("../features/navigation/controls/locale/WorkingLayerControl.locale").I18n
    | import("../features/navigation/controls/locale/WorkingLayerLabelMap.locale").I18n
    | import("../features/navigation/controls/locale/MesureLengthControl.locale").I18n
    | import("../features/navigation/controls/cusom-controls/locale/index.locale").I18n
    | import("../features/reports/forms/locale/AttachmentList.locale").I18n
    | import("../features/reports/forms/locale/ConfirmCancelModal.locale").I18n
    | import("../features/reports/forms/locale/OpenReplyReportModal.locale").I18n
    | import("../features/reports/forms/locale/ConfirmDeleteReportModal.locale").I18n
    | import("../features/reports/forms/locale/DrawingForm.locale").I18n
    | import("../features/reports/forms/locale/ImportSketchFile.locale").I18n
    | import("../features/reports/forms/locale/ReportForm.locale").I18n
    | import("../features/reports/forms/locale/ThemeComponent.locale").I18n
    | import("../features/reports/forms/locale/ThemeForm.locale").I18n
    | import("../features/reports/locale/CenterMessage.locale").I18n
    | import("../features/reports/locale/CreateReport.locale").I18n
    | import("../features/reports/locale/EditReport.locale").I18n
    | import("../features/reports/locale/ShowReport.locale").I18n
    | import("../features/reports/locale/ReportTracking.locale").I18n
    | import("../features/working-layer/forms/locale/ShowFeatureTypeForm.locale").I18n
    | import("../features/working-layer/modal/locale/ClickableFeaturesModal.locale").I18n
    | import("../hooks/navigation/layers/locale/useGetReportsLayer.locale").I18n
    | import("../hooks/navigation/layers/locale/useGetWFSLayer.locale").I18n
    | import("../hooks/navigation/layers/locale/useGetWMSLayer.locale").I18n
    | import("../hooks/navigation/layers/locale/useGetWMTSLayer.locale").I18n
    | import("../hooks/reports/locale/useReportTools.locale").I18n
    | import("../features/reports/forms/locale/FormAttachments.locale").I18n;

export type Translations<L extends Language> = GenericTranslations<ComponentKey, Language, typeof fallbackLanguage, L>;
