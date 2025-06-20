import { ClickedTool, CommunityReport, GeometryFeatueParams, ReportTool, SketchFeatureType, toolNames } from "@/constants/reports/types";
import { getReportAllFeatures, reportTools } from "@/constants/reports/utils";
import { getFeatureDiam, mainMarker, markersStyles, otherMarkers } from "@/constants/utils";
import { useMapStore } from "@/store";
import Button from "@codegouvfr/react-dsfr/Button";

import { Feature } from "ol";
import { Coordinate } from "ol/coordinate";
import { Circle } from "ol/geom";
import Layer from "ol/layer/Layer";
import { Size } from "ol/size";
import VectorSource, { VectorSourceEvent } from "ol/source/Vector";
import { Fill, Style } from "ol/style";
import ImageStyle from "ol/style/Image";
import { useCallback, useEffect, useMemo } from "react";
import Drawing from "geopf-extensions-openlayers/src/packages/Controls/Drawing/Drawing";
import { Control } from "ol/control";

const hoveredFeatureStyle: { strockWidth: number; imageScale: number | Size } = { strockWidth: 1, imageScale: 1 };

interface Props {
    features: Feature[];
    selectedReport: CommunityReport | undefined;
    clickedTool: ClickedTool;
    setFeatures: (features: Feature[]) => void;
    handleToolClick: (tool: ReportTool | undefined) => void;
}

const DrawingForm: React.FC<Props> = ({ features, selectedReport, clickedTool, setFeatures, handleToolClick }) => {
    const { map } = useMapStore();

    const reportLayer = map?.getAllLayers().find((layer) => layer.get("title") === "Signalements");
    const reportSource = reportLayer?.getSource() as VectorSource;

    const drawingLayer = map?.getAllLayers().find((layer: Layer & { gpResultLayerId?: string }) => layer.gpResultLayerId === "drawing");
    const drawingSource = drawingLayer?.getSource() as VectorSource;

    const mainFeature = useMemo(() => {
        if (selectedReport) {
            return features.find((f) => f.get("reportData") && f.get("main") && !f.get("new"));
        }
        return features.find((f) => f.get("new") && f.get("main"));
    }, [features, selectedReport]);

    const sketchFeatures = useMemo(() => {
        return features.filter((feat) => feat !== mainFeature);
    }, [features, mainFeature]);

    const handleDrawingChange = useCallback(
        (e: VectorSourceEvent) => {
            if (e.feature) {
                if (e.type === "addfeature") {
                    if (selectedReport) {
                        e.feature.set("reportData", selectedReport);
                    } else {
                        e.feature.set("new", true);
                        if (!features.length) {
                            e.feature.set("main", true);
                        }
                    }
                    setFeatures([...features, e.feature]);
                } else if (e.type === "removefeature") {
                    const newFatures = features.filter((feat) => feat !== e.feature);
                    setFeatures(newFatures);
                }
            }
        },
        [features, selectedReport, setFeatures]
    );

    useEffect(() => {
        drawingSource?.on("addfeature", handleDrawingChange);
        drawingSource?.on("removefeature", handleDrawingChange);

        return () => {
            drawingSource?.un("addfeature", handleDrawingChange);
            drawingSource?.un("removefeature", handleDrawingChange);
        };
    }, [drawingSource, features, selectedReport, clickedTool, setFeatures, handleDrawingChange]);

    useEffect(() => {
        let selectedReportFeatures: Feature[] = [];
        let reportMainFeature: Feature | undefined;

        if (selectedReport) {
            const editTool = reportTools.find((t) => t.name === toolNames.edit);
            handleToolClick(editTool);
            selectedReportFeatures = getReportAllFeatures(selectedReport);
            handleToolClick(editTool);
            drawingSource?.addFeatures(selectedReportFeatures);
            reportMainFeature = reportSource?.getFeatures().find((f) => f.get("reportData").id === selectedReport?.id);
            if (reportMainFeature) reportSource?.removeFeature(reportMainFeature);
        }
        if (drawingSource) setFeatures(drawingSource?.getFeatures());
        return () => {
            if (selectedReport) {
                drawingSource?.removeFeatures(selectedReportFeatures);
                const reportMainFeatureUpdated = reportSource?.getFeatures().find((f) => f.get("reportData").id === selectedReport?.id);
                if (reportMainFeature && !reportMainFeatureUpdated) {
                    reportSource?.addFeature(reportMainFeature);
                }
                setFeatures([]);
            }
        };
    }, [selectedReport, drawingSource, reportSource, handleToolClick, setFeatures]);

    useEffect(() => {
        const drawingControl: typeof Drawing = map
            ?.getControls()
            .getArray()
            .find((c: Control) => "layer" in c && c.layer === drawingLayer);
        if (drawingControl) {
            if (mainFeature) {
                drawingControl.options.markersList = otherMarkers;
            }
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

    const getToolPriority = (tool: ReportTool) => {
        if (isToolDisabled(tool)) return "primary";
        if (clickedTool.name === tool.name && clickedTool.clicked) return "secondary";
        return "tertiary";
    };

    const isToolDisabled = (tool: ReportTool): boolean => {
        if (!features.length && tool.name !== toolNames.point) {
            return true;
        }
        return false;
    };

    const handleFeatureRemove = (feature: Feature) => {
        reportSource?.removeFeature(feature);
        drawingSource?.removeFeature(feature);
        hoveredFeatureStyle.strockWidth = 1;
        hoveredFeatureStyle.imageScale = 1;
        setFeatures(features.filter((feat) => feat !== feature));
    };

    const handleHoverFeature = (feature: Feature, mouseEnter: boolean) => {
        const featureStyle = feature.getStyle() as Style;
        const featureText = "getText" in featureStyle && featureStyle.getText();
        if (mouseEnter) {
            if (featureText) {
                hoveredFeatureStyle.strockWidth = getFeatureDiam(feature);
                featureText?.getStroke()?.setWidth(hoveredFeatureStyle.strockWidth * 2);
            } else {
                if ("getStroke" in featureStyle) {
                    hoveredFeatureStyle.strockWidth = getFeatureDiam(feature);
                    featureStyle?.getStroke()?.setWidth(hoveredFeatureStyle.strockWidth * 2);
                }
                if ("getImage" in featureStyle) {
                    hoveredFeatureStyle.imageScale = getFeatureDiam(feature);
                    featureStyle?.getImage()?.setScale(hoveredFeatureStyle.imageScale + 0.3);
                }
            }
        } else {
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
        <>
            <p className="fr-text--sm fr-mb-1v ">Vous pouvez ici réaliser/importer un croquis explicatif sur la carte:</p>
            <div className="report-tools">
                <p className="fr-mt-4v fr-mb-2v fr-text--sm">Outils de création</p>
                <div>
                    {reportTools
                        .filter((tool) => tool.type === "create")
                        .map((tool) => (
                            <Button
                                key={tool.name}
                                id={`${tool.type}-sketch-${tool.name}`}
                                onClick={() => {
                                    handleToolClick(tool);
                                }}
                                priority={getToolPriority(tool)}
                                title={tool.title}
                                disabled={isToolDisabled(tool)}
                            >
                                <img width={20} height={20} src={tool.imgSrc} alt={tool.name} />
                            </Button>
                        ))}
                </div>
            </div>
            <div className="report-tools">
                <p className="fr-mt-4v fr-mb-2v fr-text--sm">Outils de modification</p>
                <div>
                    {reportTools
                        .filter((tool) => tool.type === "edit")
                        .map((tool) => (
                            <Button
                                key={tool.name}
                                id={`${tool.type}-sketch-${tool.name}`}
                                onClick={() => {
                                    handleToolClick(tool);
                                }}
                                priority={clickedTool.name === tool.name && clickedTool.clicked ? "secondary" : "tertiary"}
                                title={tool.title}
                            >
                                <img width={20} height={20} src={tool.imgSrc} alt={tool.name} />
                            </Button>
                        ))}
                </div>
            </div>
            {sketchFeatures.length > 0 && (
                <div className="report-features">
                    {sketchFeatures.map((feature, index) => {
                        const featureType = feature.getGeometry()?.getType();
                        const featureStyle = feature.getStyle() as Style;
                        const featureImage = featureStyle?.getImage() as ImageStyle & { getSrc: () => string };
                        const markerStyle = markersStyles.find((m) => m.imgSrc === featureImage?.getSrc());
                        const featureText = featureStyle && "getText" in featureStyle && featureStyle?.getText();

                        let icon = reportTools.find((tool) => tool.featureType === featureType)?.imgSrc;
                        let text = featureType ? SketchFeatureType[featureType] : "";
                        if (featureText) {
                            icon = reportTools.find((tool) => tool.name === toolNames.tooltip)?.imgSrc;
                            text = featureText?.getText() as string;
                        }

                        if (markerStyle) {
                            icon = markerStyle.imgSrc;
                            text = markerStyle.name;
                        }

                        return (
                            <div
                                key={`feature_${index}`}
                                onMouseEnter={() => handleHoverFeature(feature, true)}
                                onMouseLeave={() => handleHoverFeature(feature, false)}
                            >
                                <img width={20} height={20} src={icon} alt={text} />
                                <span>{text}</span>
                                <Button
                                    iconId="ri-delete-bin-2-fill"
                                    priority={"tertiary"}
                                    onClick={() => handleFeatureRemove(feature)}
                                    title="Supprimer"
                                    size="small"
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
};

export default DrawingForm;
