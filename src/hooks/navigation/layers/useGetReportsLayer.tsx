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

function useGetReportsLayer(communityId: number) {
    const { addAlertMessage } = useCommunityStore();
    const { reports, setReports } = useReportStore();
    const { map } = useMapStore();
    const queryClient = useQueryClient();

    const reportLayer = useMemo(() => {
        const reportSource = new VectorSource<Feature<Geometry>>({
            loader: async function (extent) {
                try {
                    const queryKey = `GET_REPORTS_communities=${communityId}` + `_limit=20` + `_box=${transformExtent(extent, "EPSG:3857", "EPSG:4326")}`;
                    const reports = await queryClient.fetchQuery({
                        queryKey: [queryKey],
                        queryFn: () => getCommunityReports(communityId, extent),
                    });

                    if (!reports) {
                        addAlertMessage(StatusMessage.error, `Erreur dans le chargement de la couche Signalements`);
                        return null;
                    }
                    setReports(reports);
                } catch (error) {
                    addAlertMessage(StatusMessage.error, `Erreur dans le chargement de la couche Signalements`, 5000);
                    console.error(error);
                }
            },
            strategy: bbox,
        });
        const reportLayer = new VectorLayer<VectorSource<Feature<Geometry>>>({
            source: reportSource,
        });

        return reportLayer;
    }, [communityId, queryClient, addAlertMessage, setReports]);

    useEffect(() => {
        reportLayer?.getSource()?.removeFeatures(
            reportLayer
                ?.getSource()
                ?.getFeatures()
                .filter((f) => f.get("main")) || []
        );
        reports.forEach((report: CommunityReport) => {
            const mainFeatData = {
                type: SketchFeatureType.Point,
                geometry: report.geometry,
            };
            reportLayer?.getSource()?.addFeature(getFeaturePoint(report, mainFeatData, true));
        });
    }, [map, reports, reportLayer]);

    return reportLayer;
}

export default useGetReportsLayer;
