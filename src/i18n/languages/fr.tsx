import type { Translations } from "../types";
import { AppHeaderFrTranslations } from "@/components/Layout/locale/AppHeader.locale";
import { MapToolbarFrTranslations } from "@/components/Layout/locale/MapToolbar.locale";
import { AppFooterFrTranslations } from "@/components/Layout/locale/AppFooter.locale";
import { NotConnectedFrTranslations } from "@/pages/locale/NotConnected.locale";
import { NotFoundFrTranslations } from "@/pages/locale/NotFound.locale";
import { CarteFrTranslations } from "@/pages/locale/Carte.locale";
import { GetReportsLayerFrTranslations } from "@/features/navigation/layers/locale/GetReportsLayer.locale";
import { AttachmentListFrTranslations } from "@/features/reports/forms/locale/AttachmentList.locale";
import { ConfirmCancelModalFrTranslations } from "@/features/reports/forms/locale/ConfirmCancelModal.locale";
import { OpenReplyReportModalFrTranslations } from "@/features/reports/forms/locale/OpenReplyReportModal.locale";
import { ConfirmDeleteReportModalFrTranslations } from "@/features/reports/forms/locale/ConfirmDeleteReportModal.locale";
import { DrawingFormFrTranslations } from "@/features/reports/forms/locale/DrawingForm.locale";
import { ImportSketchFileFrTranslations } from "@/features/reports/forms/locale/ImportSketchFile.locale";
import { ReportFormFrTranslations } from "@/features/reports/forms/locale/ReportForm.locale";
import { ThemeFormFrTranslations } from "@/features/reports/forms/locale/ThemeForm.locale";
import { CenterMessageFrTranslations } from "@/features/reports/locale/CenterMessage.locale";
import { CreateReportFrTranslations } from "@/features/reports/locale/CreateReport.locale";
import { EditReportFrTranslations } from "@/features/reports/locale/EditReport.locale";
import { ShowReportFrTranslations } from "@/features/reports/locale/ShowReport.locale";
import { useGetReportsLayerFrTranslations } from "@/hooks/navigation/layers/locale/useGetReportsLayer.locale";
import { useGetWFSLayerFrTranslations } from "@/hooks/navigation/layers/locale/useGetWFSLayer.locale";
import { useGetWMSLayerFrTranslations } from "@/hooks/navigation/layers/locale/useGetWMSLayer.locale";
import { useGetWMTSLayerFrTranslations } from "@/hooks/navigation/layers/locale/useGetWMTSLayer.locale";
import { DrawerComponentFrTranslations } from "@/components/locale/DrawerComponent.locale";
import { DrawingControlFrTranslations } from "@/features/navigation/controls/locale/DrawingControl.locale";
import { CatalogControlFrTranslations } from "@/features/navigation/controls/locale/CatalogControl.locale";
import { useCenterViewToReportControlFrTranslations } from "@/features/navigation/controls/locale/useCenterViewToReportControl.locale";
import { useGetMapControlsFrTranslations } from "@/features/navigation/controls/locale/useGetMapControls.locale";
import { useReportToolsFrTranslations } from "@/hooks/reports/locale/useReportTools.locale";
import { FeatureTypeLayerLegendsFrTranslations } from "@/features/navigation/layers/legends/locale/FeatureTypeLayerLegends.locale";
import { ShowFeatureTypeFormFrTranslations } from "@/features/working-layer/forms/locale/ShowFeatureTypeForm.locale";
import { ClickableFeaturesModalFrTranslations } from "@/features/working-layer/modal/locale/ClickableFeaturesModal.locale";

export const translations: Translations<"fr"> = {
    AppFooter: AppFooterFrTranslations,
    AppHeader: AppHeaderFrTranslations,
    MapToolbar: MapToolbarFrTranslations,
    DrawerComponent: DrawerComponentFrTranslations,
    NotConnected: NotConnectedFrTranslations,
    NotFound: NotFoundFrTranslations,
    Carte: CarteFrTranslations,
    GetReportsLayer: GetReportsLayerFrTranslations,
    AttachmentList: AttachmentListFrTranslations,
    ConfirmCancelModal: ConfirmCancelModalFrTranslations,
    OpenReplyReportModal: OpenReplyReportModalFrTranslations,
    ConfirmDeleteReportModal: ConfirmDeleteReportModalFrTranslations,
    DrawingForm: DrawingFormFrTranslations,
    ImportSketchFile: ImportSketchFileFrTranslations,
    ReportForm: ReportFormFrTranslations,
    ThemeForm: ThemeFormFrTranslations,
    CenterMessage: CenterMessageFrTranslations,
    CreateReport: CreateReportFrTranslations,
    EditReport: EditReportFrTranslations,
    ShowReport: ShowReportFrTranslations,
    useGetReportsLayer: useGetReportsLayerFrTranslations,
    useGetWFSLayer: useGetWFSLayerFrTranslations,
    useGetWMSLayer: useGetWMSLayerFrTranslations,
    useGetWMTSLayer: useGetWMTSLayerFrTranslations,
    DrawingControl: DrawingControlFrTranslations,
    CatalogControl: CatalogControlFrTranslations,
    useCenterViewToReportControl: useCenterViewToReportControlFrTranslations,
    useGetMapControls: useGetMapControlsFrTranslations,
    useReportTools: useReportToolsFrTranslations,
    FeatureTypeLayerLegends: FeatureTypeLayerLegendsFrTranslations,
    ShowFeatureTypeForm: ShowFeatureTypeFormFrTranslations,
    ClickableFeaturesModal: ClickableFeaturesModalFrTranslations,
};
