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
import { DrawingFormEnTranslations } from "@/features/reports/forms/locale/DrawingForm.locale";
import { ImportSketchFileEnTranslations } from "@/features/reports/forms/locale/ImportSketchFile.locale";
import { ReportFormEnTranslations } from "@/features/reports/forms/locale/ReportForm.locale";
import { ThemeFormEnTranslations } from "@/features/reports/forms/locale/ThemeForm.locale";
import { CenterMessageEnTranslations } from "@/features/reports/locale/CenterMessage.locale";

export const translations: Translations<"en"> = {
    AppFooter: AppFooterEnTranslations,
    AppHeader: AppHeaderEnTranslations,
    MapToolbar: MapToolbarEnTranslations,
    NotConnected: NotConnectedEnTranslations,
    NotFound: NotFoundEnTranslations,
    Carte: CarteEnTranslations,
    GetReportsLayer: GetReportsLayerEnTranslations,
    AttachmentList: AttachmentListEnTranslations,
    ConfirmCancelModal: ConfirmCancelModalEnTranslations,
    DrawingForm: DrawingFormEnTranslations,
    ImportSketchFile: ImportSketchFileEnTranslations,
    ReportForm: ReportFormEnTranslations,
    ThemeForm: ThemeFormEnTranslations,
    CenterMessage: CenterMessageEnTranslations,
};
