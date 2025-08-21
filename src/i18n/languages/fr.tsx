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
};
