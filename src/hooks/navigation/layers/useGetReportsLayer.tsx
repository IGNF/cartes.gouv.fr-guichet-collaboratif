import { useMemo } from "react";
import { useCommunityStore } from "@/store/useCommunityStore";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Feature } from "ol";
import { Geometry, Point } from "ol/geom";
import { getCommunityReports } from "@/api/reportsData";
import { Style, Fill, Stroke, Text, Icon } from "ol/style";
import { getLonLatFromPoint, reportImgStatus } from "@/constants/utils";
import { CommunityReport } from "@/constants/reports/types";
import { PointString, StatusMessage } from "@/constants/communities/types";
import { bbox } from "ol/loadingstrategy";

function useGetReportsLayer(communityId: number) {
    const { addAlertMessage, setCommunityReports } = useCommunityStore();

    const reportLayer = useMemo(() => {
        const reportSource = new VectorSource<Feature<Geometry>>({
            loader: async function (extent) {
                try {
                    const reports = await getCommunityReports(communityId, extent);

                    if (!reports) {
                        addAlertMessage(StatusMessage.error, `Erreur dans le chargement de la couche Signalements`);
                        return null;
                    }
                    setCommunityReports(reports);
                    const features = reports.map((report: CommunityReport) => {
                        const lonLat = getLonLatFromPoint(report.geometry as PointString);
                        const feature = new Feature({
                            geometry: new Point(lonLat),
                            reportData: report,
                        });

                        feature.setStyle(
                            new Style({
                                image: new Icon({
                                    src: reportImgStatus[report.status].img,
                                    scale: 0.5,
                                }),
                                text: new Text({
                                    text: report.themes[0].theme,
                                    offsetY: -15,
                                    fill: new Fill({ color: "#000" }),
                                    stroke: new Stroke({ color: "#fff", width: 3 }),
                                }),
                            })
                        );
                        return feature;
                    });
                    reportSource.addFeatures(features);
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
    }, [communityId, addAlertMessage, setCommunityReports]);

    return reportLayer;
}

export default useGetReportsLayer;
