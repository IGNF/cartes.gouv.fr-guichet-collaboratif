import { ClickedTool, CommunityReport, ReportTool, SketchFeatureType, toolNames } from "@/constants/reports/types";
import { getReportAllFeatures, reportTools } from "@/constants/reports/utils";
import { getFeatureDiam } from "@/constants/utils";
import { useMapStore } from "@/store";
import Button from "@codegouvfr/react-dsfr/Button";

import { Feature } from "ol";
import Layer from "ol/layer/Layer";
import { Size } from "ol/size";
import VectorSource, { VectorSourceEvent } from "ol/source/Vector";
import { Style } from "ol/style";
import { useCallback, useEffect, useMemo } from "react";

const hoveredFeatureStyle: { strockWidth: number; imageScale: number | Size } = { strockWidth: 1, imageScale: 0.5 };

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
        const mainPointFeatureStyle = mainFeature?.getStyle() as Style;
        mainPointFeatureStyle?.getImage()?.setScale(0.8);
        mainFeature?.changed();
        return () => {
            mainPointFeatureStyle?.getImage()?.setScale(0.5);
            mainFeature?.changed();
        };
    }, [mainFeature]);

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
        hoveredFeatureStyle.imageScale = 0.5;
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
                        const featureText = featureStyle && "getText" in featureStyle && featureStyle?.getText();

                        return (
                            <div
                                key={`feature_${index}`}
                                onMouseEnter={() => handleHoverFeature(feature, true)}
                                onMouseLeave={() => handleHoverFeature(feature, false)}
                            >
                                <img
                                    width={20}
                                    height={20}
                                    src={
                                        featureText
                                            ? reportTools.find((tool) => tool.name === toolNames.tooltip)?.imgSrc
                                            : reportTools.find((tool) => tool.featureType === featureType)?.imgSrc
                                    }
                                    alt={featureType ? SketchFeatureType[featureType] : ""}
                                />
                                <span>{featureText ? featureText?.getText() : featureType ? SketchFeatureType[featureType] : ""}</span>
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
