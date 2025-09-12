import { useEffect, useMemo } from "react";
import { useCommunityStore } from "@/store/useCommunityStore";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { getCommunityReports } from "@/api/reportsData";
import { getFeaturePoint } from "@/constants/utils";
import { CommunityReport, SketchFeatureType } from "@/constants/reports/types";
import { StatusMessage } from "@/constants/communities/types";
import { bbox } from "ol/loadingstrategy";
import { useQueryClient } from "@tanstack/react-query";
import { transformExtent } from "ol/proj";
import { useMapStore, useReportStore } from "@/store";
import { isEmpty } from "ol/extent";
import { useTranslation } from "@/i18n";
import { REPORTS_LAYER_TYPE } from "@/constants/reports/utils";

function useGetReportsLayer(communityId: number) {
    const { addAlertMessage } = useCommunityStore();
    const { reports, setReports } = useReportStore();
    const { map } = useMapStore();
    const queryClient = useQueryClient();

    const { t } = useTranslation({ useGetReportsLayer });

    const reportLayer = useMemo(() => {
        const reportSource = new VectorSource<Feature<Geometry>>({
            loader: async function (extent) {
                try {
                    const boxExtent = transformExtent(extent, "EPSG:3857", "EPSG:4326");
                    if (!isFinite(boxExtent[0]) || isEmpty(boxExtent)) return;
                    const queryKey = `GET_REPORTS_communities=${communityId}` + `_limit=20` + `_box=${boxExtent}`;
                    const reports = await queryClient.fetchQuery({
                        queryKey: [queryKey],
                        queryFn: () => getCommunityReports(communityId, extent),
                        retry: !isFinite(boxExtent[0]) || isEmpty(boxExtent) ? 0 : 1,
                    });

                    if (!reports) {
                        addAlertMessage(StatusMessage.error, t("loading_report_layer_error"));
                        return null;
                    }
                    setReports(reports);
                } catch (error) {
                    addAlertMessage(StatusMessage.error, t("loading_report_layer_error"), 5000);
                    console.error(error);
                }
            },
            strategy: bbox,
        });
        const reportLayer = new VectorLayer<VectorSource<Feature<Geometry>>>({
            source: reportSource,
        });
        reportLayer?.set("name", REPORTS_LAYER_TYPE);
        return reportLayer;
    }, [communityId, queryClient, addAlertMessage, setReports, t]);

    useEffect(() => {
        reportLayer?.getSource()?.removeFeatures(
            reportLayer
                ?.getSource()
                ?.getFeatures()
                .filter((f) => f.get("main") && !Array.isArray(f.getStyle())) || []
        );
        reports.forEach((report: CommunityReport) => {
            const mainFeatData = {
                type: SketchFeatureType.Point,
                geometry: report.geometry,
            };
            const featureExist = reportLayer
                ?.getSource()
                ?.getFeatures()
                .find((f) => f.get("main") && f.get("reportData").id === report.id);
            if (featureExist) return;
            reportLayer?.getSource()?.addFeature(getFeaturePoint(report, mainFeatData, true));
        });
    }, [map, reports, reportLayer]);

    return reportLayer;
}

export default useGetReportsLayer;
