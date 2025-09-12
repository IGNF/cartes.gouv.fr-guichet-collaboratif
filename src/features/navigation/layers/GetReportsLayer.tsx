import { useEffect } from "react";
import { useCommunityStore } from "@/store/useCommunityStore";
import { useLocalStorageStore } from "@/store/useLocalStorageStore";
import useGetReportsLayer from "@/hooks/navigation/layers/useGetReportsLayer";
import { LocalLayer } from "@/constants/localStorage/types";
import { ReportLegendsHTML } from "./legends/ReportLegends";
import { useTranslation } from "@/i18n";
import { REPORTS_LAYER_TYPE } from "@/constants/reports/utils";

const GetReportsLayer: React.FC = () => {
    const { community, mapLayers, addMapLayer } = useCommunityStore();
    const { localStorageData } = useLocalStorageStore();
    const reportLayerSource = useGetReportsLayer(community?.id || 0);

    const { t } = useTranslation({ GetReportsLayer });

    const localLayer: LocalLayer | undefined = localStorageData?.layers.find((l) => l.name === t("reports_title"));

    useEffect(() => {
        reportLayerSource?.setOpacity(localLayer ? localLayer.opacity : 1);
        reportLayerSource?.setVisible(localLayer ? localLayer.visibility : true);
        reportLayerSource?.set("title", t("reports_title"));
        reportLayerSource?.set("type", REPORTS_LAYER_TYPE);
        reportLayerSource?.set("legends", t("reports_legend"));
        reportLayerSource?.set("description", ReportLegendsHTML);
        if (reportLayerSource) {
            const reportLayer = {
                source: reportLayerSource,
                name: REPORTS_LAYER_TYPE,
                title: t("reports_title"),
                order: localLayer ? localLayer.order : Infinity,
            };
            addMapLayer(reportLayer);
        }
    }, [reportLayerSource, localLayer, mapLayers, addMapLayer, t]);

    return null;
};

export default GetReportsLayer;
