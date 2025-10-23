import type { Translations } from "../types";
import { AppHeaderEnTranslations } from "@/components/Layout/locale/AppHeader.locale";
import { MapToolbarEnTranslations } from "@/components/Layout/locale/MapToolbar.locale";
import { AppFooterEnTranslations } from "@/components/Layout/locale/AppFooter.locale";
import { NotConnectedEnTranslations } from "@/pages/locale/NotConnected.locale";
import { NotFoundEnTranslations } from "@/pages/locale/NotFound.locale";
import { CarteEnTranslations } from "@/pages/locale/Carte.locale";
import { GetReportsLayerEnTranslations } from "@/features/navigation/layers/locale/GetReportsLayer.locale";
import { AttachmentListEnTranslations } from "@/features/reports/forms/locale/AttachmentList.locale";
import { ConfirmCancelModalEnTranslations } from "@/features/reports/forms/locale/ConfirmCancelModal.locale";
import { OpenReplyReportModalEnTranslations } from "@/features/reports/forms/locale/OpenReplyReportModal.locale";
import { ConfirmDeleteReportModalEnTranslations } from "@/features/reports/forms/locale/ConfirmDeleteReportModal.locale";
import { DrawingFormEnTranslations } from "@/features/reports/forms/locale/DrawingForm.locale";
import { ImportSketchFileEnTranslations } from "@/features/reports/forms/locale/ImportSketchFile.locale";
import { ReportFormEnTranslations } from "@/features/reports/forms/locale/ReportForm.locale";
import { ThemeFormEnTranslations } from "@/features/reports/forms/locale/ThemeForm.locale";
import { CenterMessageEnTranslations } from "@/features/reports/locale/CenterMessage.locale";
import { CreateReportEnTranslations } from "@/features/reports/locale/CreateReport.locale";
import { EditReportEnTranslations } from "@/features/reports/locale/EditReport.locale";
import { ShowReportEnTranslations } from "@/features/reports/locale/ShowReport.locale";
import { useGetReportsLayerEnTranslations } from "@/hooks/navigation/layers/locale/useGetReportsLayer.locale";
import { useGetWFSLayerEnTranslations } from "@/hooks/navigation/layers/locale/useGetWFSLayer.locale";
import { useGetWMSLayerEnTranslations } from "@/hooks/navigation/layers/locale/useGetWMSLayer.locale";
import { useGetWMTSLayerEnTranslations } from "@/hooks/navigation/layers/locale/useGetWMTSLayer.locale";
import { DrawerComponentEnTranslations } from "@/components/locale/DrawerComponent.locale";
import { DrawingControlEnTranslations } from "@/features/navigation/controls/locale/DrawingControl.locale";
import { CatalogControlEnTranslations } from "@/features/navigation/controls/locale/CatalogControl.locale";
import { useCenterViewToReportControlEnTranslations } from "@/features/navigation/controls/locale/useCenterViewToReportControl.locale";
import { useGetMapControlsEnTranslations } from "@/features/navigation/controls/locale/useGetMapControls.locale";
import { useReportToolsEnTranslations } from "@/hooks/reports/locale/useReportTools.locale";
import { FeatureTypeLayerLegendsEnTranslations } from "@/features/navigation/layers/legends/locale/FeatureTypeLayerLegends.locale";
import { ShowFeatureTypeFormEnTranslations } from "@/features/working-layer/forms/locale/ShowFeatureTypeForm.locale";
import { ClickableFeaturesModalEnTranslations } from "@/features/working-layer/modal/locale/ClickableFeaturesModal.locale";
import { FormAttachmentsEnTranslations } from "@/features/reports/forms/locale/FormAttachments.locale";
import { WorkingLayerControlEnTranslations } from "@/features/navigation/controls/locale/WorkingLayerControl.locale";
import { WorkingLayerLabelMapEnTranslations } from "@/features/navigation/controls/locale/WorkingLayerLabelMap.locale";
import { MesureLengthControlEnTranslations } from "@/features/navigation/controls/locale/MesureLengthControl.locale";
import { CustomControlsEnTranslations } from "@/features/navigation/controls/cusom-controls/locale/index.locale";

export const translations: Translations<"en"> = {
    AppFooter: AppFooterEnTranslations,
    AppHeader: AppHeaderEnTranslations,
    MapToolbar: MapToolbarEnTranslations,
    DrawerComponent: DrawerComponentEnTranslations,
    NotConnected: NotConnectedEnTranslations,
    NotFound: NotFoundEnTranslations,
    Carte: CarteEnTranslations,
    GetReportsLayer: GetReportsLayerEnTranslations,
    AttachmentList: AttachmentListEnTranslations,
    ConfirmCancelModal: ConfirmCancelModalEnTranslations,
    OpenReplyReportModal: OpenReplyReportModalEnTranslations,
    ConfirmDeleteReportModal: ConfirmDeleteReportModalEnTranslations,
    DrawingForm: DrawingFormEnTranslations,
    ImportSketchFile: ImportSketchFileEnTranslations,
    ReportForm: ReportFormEnTranslations,
    ThemeForm: ThemeFormEnTranslations,
    CenterMessage: CenterMessageEnTranslations,
    CreateReport: CreateReportEnTranslations,
    EditReport: EditReportEnTranslations,
    ShowReport: ShowReportEnTranslations,
    useGetReportsLayer: useGetReportsLayerEnTranslations,
    useGetWFSLayer: useGetWFSLayerEnTranslations,
    useGetWMSLayer: useGetWMSLayerEnTranslations,
    useGetWMTSLayer: useGetWMTSLayerEnTranslations,
    DrawingControl: DrawingControlEnTranslations,
    CatalogControl: CatalogControlEnTranslations,
    useCenterViewToReportControl: useCenterViewToReportControlEnTranslations,
    useGetMapControls: useGetMapControlsEnTranslations,
    useReportTools: useReportToolsEnTranslations,
    FeatureTypeLayerLegends: FeatureTypeLayerLegendsEnTranslations,
    ShowFeatureTypeForm: ShowFeatureTypeFormEnTranslations,
    ClickableFeaturesModal: ClickableFeaturesModalEnTranslations,
    FormAttachments: FormAttachmentsEnTranslations,
    WorkingLayerControl: WorkingLayerControlEnTranslations,
    WorkingLayerLabelMap: WorkingLayerLabelMapEnTranslations,
    MesureLengthControl: MesureLengthControlEnTranslations,
    CustomControls: CustomControlsEnTranslations,
};
