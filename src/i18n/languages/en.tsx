import type { Translations } from "../types";
import { AppHeaderEnTranslations } from "@/components/Layout/locale/AppHeader.locale";
import { MapToolbarEnTranslations } from "@/components/Layout/locale/MapToolbar.locale";
import { AppFooterEnTranslations } from "@/components/Layout/locale/AppFooter.locale";
import { NotConnectedEnTranslations } from "@/pages/locale/NotConnected.locale";
import { NotFoundEnTranslations } from "@/pages/locale/NotFound.locale";

export const translations: Translations<"en"> = {
    AppFooter: AppFooterEnTranslations,
    AppHeader: AppHeaderEnTranslations,
    MapToolbar: MapToolbarEnTranslations,
    NotConnected: NotConnectedEnTranslations,
    NotFound: NotFoundEnTranslations,
};
