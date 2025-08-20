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

export const translations: Translations<"fr"> = {
    AppFooter: AppFooterFrTranslations,
    AppHeader: AppHeaderFrTranslations,
    MapToolbar: MapToolbarFrTranslations,
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
};
