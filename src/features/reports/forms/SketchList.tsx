import { GeometryFeatueParams, SketchFeatureType, toolNames } from "@/constants/reports/types";
import { reportTools } from "@/constants/reports/utils";
import { getFeatureDiam, handleCenterToFeature, mainMarker, markersStyles, otherMarkers } from "@/constants/utils";
import { useMapStore, useReportStore } from "@/store";
import Button from "@codegouvfr/react-dsfr/Button";
import Drawing from "geopf-extensions-openlayers/src/packages/Controls/Drawing/Drawing";
import { Feature } from "ol";
import { Control } from "ol/control";
import { Coordinate } from "ol/coordinate";
import { Circle } from "ol/geom";
import Layer from "ol/layer/Layer";
import { Size } from "ol/size";
import VectorSource from "ol/source/Vector";
import { Fill, Style } from "ol/style";
import ImageStyle from "ol/style/Image";
import { useEffect, useMemo } from "react";

const hoveredFeatureStyle: { strockWidth: number; imageScale: number | Size } = { strockWidth: 1, imageScale: 1 };

const SketchList = () => {
    const { map } = useMapStore();
    const { selectedFeatures, isShowReport, setSelectedFeatures } = useReportStore();

    const reportLayer = map?.getAllLayers().find((layer) => layer.get("title") === "Signalements");
    const reportSource = reportLayer?.getSource() as VectorSource;

    const drawingLayer = map?.getAllLayers().find((layer: Layer & { gpResultLayerId?: string }) => layer.gpResultLayerId === "drawing");
    const drawingSource = drawingLayer?.getSource() as VectorSource;

    const mainFeature = useMemo(() => selectedFeatures.find((f) => f.get("main")), [selectedFeatures]);
    const sketchFeatures = useMemo(() => selectedFeatures.filter((f) => !f.get("main")), [selectedFeatures]);

    useEffect(() => {
        const drawingControl: typeof Drawing = map
            ?.getControls()
            .getArray()
            .find((c: Control) => "layer" in c && c.layer === drawingLayer);

        if (drawingControl && mainFeature) {
            drawingControl.options.markersList = otherMarkers;
        }

        const mainFeatureStyle = mainFeature?.getStyle() as Style;
        mainFeature?.setStyle([
            new Style({
                geometry: (f) => {
                    const center = (f.getGeometry() as GeometryFeatueParams)?.getCoordinates() as Coordinate;
                    const mapResolution = map?.getView().getResolution() || 1;
                    return new Circle(center, 50 * mapResolution);
                },
                fill: new Fill({ color: "rgba(0,0,145,0.2)" }),
                zIndex: 2,
            }),
            mainFeatureStyle,
        ]);
        mainFeature?.changed();
        return () => {
            mainFeature?.setStyle(mainFeatureStyle);
            mainFeature?.changed();
            if (drawingControl) {
                drawingControl.options.markersList = [mainMarker, ...otherMarkers];
            }
        };
    }, [mainFeature, drawingLayer, map]);

    const handleRemoveFeature = (feature: Feature) => {
        reportSource?.removeFeature(feature);
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

    return (
        <div className="report-features">
            {isShowReport() && !sketchFeatures.length && <p>Aucun croquis associé</p>}
            {sketchFeatures.map((feature, index) => {
                const featureType = feature.getGeometry()?.getType();
                const featureStyle = feature.getStyle() as Style;

                let icon = reportTools.find((tool) => tool.featureType?.includes(featureType!))?.imgSrc;
                let text = featureType ? SketchFeatureType[featureType] : "";

                if (featureStyle) {
                    const featureImage = "getImage" in featureStyle ? (featureStyle?.getImage() as ImageStyle & { getSrc: () => string }) : null;
                    const markerStyle = markersStyles.find((m) => m.imgSrc === featureImage?.getSrc());
                    const featureText = "getText" in featureStyle && featureStyle?.getText();
                    if (featureText && featureText?.getText()) {
                        icon = reportTools.find((tool) => tool.name === toolNames.tooltip)?.imgSrc;
                        text = featureText?.getText() as string;
                    }
                    if (markerStyle) {
                        icon = markerStyle.imgSrc;
                        text = markerStyle.name;
                    }
                }
                return (
                    <div
                        key={`feature_${index}`}
                        onMouseEnter={() => handleHoverFeature(feature, true)}
                        onMouseLeave={() => handleHoverFeature(feature, false)}
                    >
                        <div className="sketch" onClick={() => handleCenterToFeature(map, feature)}>
                            <img width={20} height={20} src={icon} alt={text} />
                            <span>{text}</span>
                        </div>

                        {!isShowReport() && (
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
