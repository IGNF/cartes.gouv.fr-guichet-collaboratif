import { useEffect } from "react";
import { useCommunityStore } from "@/store/useCommunityStore";
import { useLocalStorageStore } from "@/store/useLocalStorageStore";
import useGetReportsLayer from "@/hooks/navigation/layers/useGetReportsLayer";
import { LocalLayer } from "@/constants/localStorage/types";
import { ReportLegendsHTML } from "./legends/ReportLegends";

const GetReportsLayer: React.FC = () => {
    const { community, mapLayers, addMapLayer } = useCommunityStore();
    const { localStorageData } = useLocalStorageStore();
    const reportLayerSource = useGetReportsLayer(community?.id || 0);

    const localLayer: LocalLayer | undefined = localStorageData?.layers.find((l) => l.name === "Signalements");

    useEffect(() => {
        reportLayerSource?.setOpacity(localLayer ? localLayer.opacity : 1);
        reportLayerSource?.setVisible(localLayer ? localLayer.visibility : true);
        reportLayerSource?.set("title", "Signalements");
        reportLayerSource?.set("type", "reports");
        reportLayerSource?.set("legends", "Légende signalements");
        reportLayerSource?.set("description", ReportLegendsHTML);
        if (reportLayerSource) {
            const reportLayer = { source: reportLayerSource, title: "Signalements", order: localLayer ? localLayer.order : 999 };
            addMapLayer(reportLayer);
        }
    }, [reportLayerSource, localLayer, mapLayers, addMapLayer]);

    return null;
};

export default GetReportsLayer;
