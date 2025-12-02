import { useCallback, useEffect, useMemo } from "react";
import { Feature } from "ol";
import { Control } from "ol/control";
import Layer from "ol/layer/Layer";
import { Size } from "ol/size";
import VectorSource from "ol/source/Vector";
import { Style } from "ol/style";
import ImageStyle from "ol/style/Image";
import Drawing from "geopf-extensions-openlayers/src/packages/Controls/Drawing/Drawing";
import useReportTools from "@/hooks/reports/useReportTools";
import { useCommunityStore, useMapStore, useReportStore } from "@/store";
import { StatusMessage } from "@/constants/communities/types";
import { SketchFeatureType, toolNames } from "@/constants/reports/types";
import { REPORTS_LAYER_TYPE } from "@/constants/reports/utils";
import { selectionCircleStyle } from "@/constants/styles";
import { getFeatureDiam, handleCenterToFeature, mainMarker, markersStyles, otherMarkers } from "@/constants/utils";
import Button from "@codegouvfr/react-dsfr/Button";

const hoveredFeatureStyle: { strockWidth: number; imageScale: number | Size } = { strockWidth: 1, imageScale: 1 };

interface Props {
    showSketch: boolean;
    expendedDrawing?: boolean;
}

const SketchList = ({ showSketch, expendedDrawing }: Props) => {
    const { map } = useMapStore();
    const { addAlertMessage } = useCommunityStore();
    const { selectedFeatures, setSelectedFeatures, editReport } = useReportStore();

    const clusterLayer = map?.getAllLayers().find((layer) => layer.get("type") === REPORTS_LAYER_TYPE);
    const clusterSource = clusterLayer?.getSource() as VectorSource;

    const drawingLayer = map?.getAllLayers().find((layer: Layer & { gpResultLayerId?: string }) => layer.gpResultLayerId === "drawing");
    const drawingSource = drawingLayer?.getSource() as VectorSource;

    const mainFeature = useMemo(() => selectedFeatures.find((f) => f.get("main")), [selectedFeatures]);
    const sketchFeatures = useMemo(() => selectedFeatures.filter((f) => !f.get("main")), [selectedFeatures]);

    const reportTools = useReportTools();

    const isMainFeatureClustered = useCallback(() => {
        if (!clusterSource) return false;
        const clusterFeatures = clusterSource.getFeatures()?.find((f) => f.get("features")?.find((cf: Feature) => cf === mainFeature));
        return clusterFeatures?.get("features")?.length > 1;
    }, [mainFeature, clusterSource]);

    useEffect(() => {
        if (!map) return;
        const drawingControl = map
            ?.getControls()
            .getArray()
            .find((c: Control) => "layer" in c && c instanceof Drawing);

        if (drawingControl && mainFeature) {
            drawingControl.options.markersList = otherMarkers;
        }

        const mainFeatureStyle = mainFeature?.getStyle() as Style;

        if (!isMainFeatureClustered()) {
            mainFeature?.setStyle([selectionCircleStyle(map), mainFeatureStyle]);
            mainFeature?.changed();
        }
        return () => {
            if (!isMainFeatureClustered()) {
                if (Array.isArray(mainFeatureStyle)) {
                    mainFeature?.setStyle(mainFeatureStyle[1]);
                } else {
                    mainFeature?.setStyle(mainFeatureStyle);
                }

                mainFeature?.changed();
            }
            if (drawingControl) {
                drawingControl.options.markersList = [mainMarker, ...otherMarkers];
            }
        };
    }, [mainFeature, drawingLayer, map, isMainFeatureClustered]);

    const handleRemoveFeature = (feature: Feature) => {
        clusterSource?.removeFeature(feature);
        drawingSource?.removeFeature(feature);
        hoveredFeatureStyle.strockWidth = 1;
        hoveredFeatureStyle.imageScale = 1;
        setSelectedFeatures(selectedFeatures.filter((feat) => feat !== feature));
    };

    const handleHoverFeature = (feature: Feature, mouseEnter: boolean) => {
        const featureStyle = feature.getStyle() as Style;
        const featureText = featureStyle && "getText" in featureStyle && featureStyle.getText();
        if (mouseEnter) {
            if (featureText) {
                hoveredFeatureStyle.strockWidth = getFeatureDiam(feature);
                featureText?.getStroke()?.setWidth(hoveredFeatureStyle.strockWidth * 2);
            } else if (featureStyle) {
                if ("getStroke" in featureStyle) {
                    hoveredFeatureStyle.strockWidth = getFeatureDiam(feature);
                    featureStyle?.getStroke()?.setWidth(hoveredFeatureStyle.strockWidth * 2);
                }
                if ("getImage" in featureStyle) {
                    hoveredFeatureStyle.imageScale = getFeatureDiam(feature);
                    featureStyle?.getImage()?.setScale(hoveredFeatureStyle.imageScale + 0.3);
                }
            }
        } else if (featureStyle) {
            if (featureText) {
                featureText?.getStroke()?.setWidth(hoveredFeatureStyle.strockWidth);
            } else {
                if ("getStroke" in featureStyle) featureStyle?.getStroke()?.setWidth(hoveredFeatureStyle.strockWidth);
                if ("getImage" in featureStyle) featureStyle?.getImage()?.setScale(hoveredFeatureStyle.imageScale);
            }
        }
        feature.changed();
    };

    const handleClickFeature = useCallback(
        (feature: Feature) => {
            try {
                handleCenterToFeature(map, feature);
            } catch {
                addAlertMessage(StatusMessage.error, "Impossible d'afficher ce croquis : sa géométrie est vide ou non définie.");
            }
        },
        [map, addAlertMessage]
    );
    return (
        <div className="report-features">
            {!sketchFeatures.length && editReport && <p>Aucun croquis associé</p>}
            {sketchFeatures.map((feature, index) => {
                const featureType = feature.getGeometry()?.getType();
                const featureStyle = feature.getStyle() as Style;

                let icon = reportTools.find((tool) => tool.featureType?.includes(featureType!))?.imgSrc;
                let text = featureType ? SketchFeatureType[featureType] : "";

                if (featureStyle) {
                    const featureText = "getText" in featureStyle && featureStyle?.getText();
                    if (featureText && featureText?.getText()) {
                        icon = reportTools.find((tool) => tool.name === toolNames.tooltip)?.imgSrc;
                        text = featureText?.getText() as string;
                    }
                    const featureImage = "getImage" in featureStyle ? (featureStyle?.getImage() as ImageStyle & { getSrc: () => string }) : null;
                    if (featureImage) {
                        const markerStyle = "getSrc" in featureImage ? markersStyles.find((m) => m.imgSrc === featureImage?.getSrc()) : null;
                        if (markerStyle) {
                            icon = markerStyle.imgSrc;
                            text = markerStyle.name;
                        }
                    }
                }
                return (
                    <div
                        key={`feature_${index}`}
                        onMouseEnter={() => handleHoverFeature(feature, true)}
                        onMouseLeave={() => handleHoverFeature(feature, false)}
                    >
                        <div className="sketch" onClick={() => handleClickFeature(feature)}>
                            <img width={20} height={20} src={icon} alt={text} />
                            <span>{text}</span>
                        </div>

                        {(expendedDrawing || showSketch) && (
                            <Button
                                iconId="ri-delete-bin-2-fill"
                                priority={"tertiary"}
                                onClick={() => handleRemoveFeature(feature)}
                                title="Supprimer"
                                size="small"
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default SketchList;
