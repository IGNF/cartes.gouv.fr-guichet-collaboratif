import { CommunityReport, SketchFeatureType } from "@/constants/reports/types";
import { getFeatureDiam } from "@/constants/utils";
import { useMapStore } from "@/store";
import Button from "@codegouvfr/react-dsfr/Button";
import CreateLabelImg from "geopf-extensions-openlayers/src/packages/CSS/Controls/Drawing/img/dsfr/create-label.svg";
import CreateLineImg from "geopf-extensions-openlayers/src/packages/CSS/Controls/Drawing/img/dsfr/create-line.svg";
import CreatePointImg from "geopf-extensions-openlayers/src/packages/CSS/Controls/Drawing/img/dsfr/create-point.svg";
import CreatePolygonImg from "geopf-extensions-openlayers/src/packages/CSS/Controls/Drawing/img/dsfr/create-polygon.svg";
import DeleteImg from "geopf-extensions-openlayers/src/packages/CSS/Controls/Drawing/img/dsfr/delete.svg";
import EditGeomImg from "geopf-extensions-openlayers/src/packages/CSS/Controls/Drawing/img/dsfr/edit-geom.svg";
import EditStyleImg from "geopf-extensions-openlayers/src/packages/CSS/Controls/Drawing/img/dsfr/edit-style.svg";
import EditTextImg from "geopf-extensions-openlayers/src/packages/CSS/Controls/Drawing/img/dsfr/edit-text.svg";
import { Feature } from "ol";
import Layer from "ol/layer/Layer";
import { Size } from "ol/size";
import VectorSource, { VectorSourceEvent } from "ol/source/Vector";
import { Style } from "ol/style";
import { useEffect, useMemo, useState } from "react";

enum toolNames {
    point = "drawing-tool-point",
    line = "drawing-tool-line",
    polygon = "drawing-tool-polygon",
    text = "drawing-tool-text",
    edit = "drawing-tool-edit",
    display = "drawing-tool-display",
    tooltip = "drawing-tool-tooltip",
    remove = "drawing-tool-remove",
}
interface ReportTool {
    type: string;
    name: string;
    imgSrc: string;
    order: number;
    title: string;
    featureType?: string;
}

const reportCreationTools: ReportTool[] = [
    { type: "creation", name: toolNames.point, imgSrc: CreatePointImg, order: 0, title: "Créer un signalement", featureType: "Point" },
    { type: "creation", name: toolNames.line, imgSrc: CreateLineImg, order: 1, title: "Dessiner des lignes", featureType: "LineString" },
    { type: "creation", name: toolNames.polygon, imgSrc: CreatePolygonImg, order: 2, title: "Dessiner des polygones", featureType: "Polygon" },
    { type: "creation", name: toolNames.text, imgSrc: CreateLabelImg, order: 3, title: "Ecrire sur la carte", featureType: "Write" },
];

const reportEditTools: ReportTool[] = [
    { type: "edit", name: toolNames.edit, imgSrc: EditGeomImg, order: 0, title: "Editer les georèmes" },
    { type: "edit", name: toolNames.display, imgSrc: EditStyleImg, order: 1, title: "Editer le style" },
    { type: "edit", name: toolNames.tooltip, imgSrc: EditTextImg, order: 2, title: "Editer le texte" },
    { type: "edit", name: toolNames.remove, imgSrc: DeleteImg, order: 3, title: "Supprimer des objets" },
];

const hoveredFeatureStyle: { strockWidth: number; imageScale: number | Size } = { strockWidth: 1, imageScale: 0.5 };

interface Props {
    features: Feature[];
    selectedReport: CommunityReport | undefined;
    setFeatures: (features: Feature[]) => void;
}

const DrawingForm: React.FC<Props> = ({ features, selectedReport, setFeatures }) => {
    const [clickedTool, setClickedTool] = useState({ name: "", clicked: false });

    const { map, clickedFeature, setClickedFeature } = useMapStore();

    const reportLayer = map?.getAllLayers().find((layer) => layer.get("title") === "Signalements");
    const reportSource = reportLayer?.getSource() as VectorSource;

    const drawingLayer = map?.getAllLayers().find((layer: Layer & { gpResultLayerId?: string }) => layer.gpResultLayerId === "drawing");
    const drawingSource = drawingLayer?.getSource() as VectorSource;

    const mainFeature = useMemo(() => {
        if (clickedFeature?.get("new")) {
            return drawingSource.getFeatures().find((f) => f.get("new") && f.get("main"));
        } else {
            return features.find((f) => f.get("main"));
        }
    }, [clickedFeature, drawingSource, features]);

    const handleClick = (name: string) => {
        const toolButton = document.querySelector(`button[id*="${name}"]`) as HTMLButtonElement | null;
        if (toolButton) {
            toolButton.click();
        }
    };

    useEffect(() => {
        const handleDrawingChange = (e: VectorSourceEvent) => {
            if (e.feature) {
                if (e.type === "addfeature") {
                    if (selectedReport) {
                        e.feature.set("reportData", selectedReport);
                    } else {
                        e.feature.set("new", true);
                        if (!features.length) {
                            e.feature.set("main", true);
                            setClickedFeature(e.feature);
                        }
                    }
                    setFeatures([...features, e.feature]);
                } else if (e.type === "removefeature") {
                    const newFatures = features.filter((feat) => feat !== e.feature);
                    setFeatures(newFatures);
                    if (!newFatures.length) {
                        setClickedFeature(null);
                    }
                }
            }
        };

        drawingSource?.on("addfeature", handleDrawingChange);
        drawingSource?.on("removefeature", handleDrawingChange);

        return () => {
            drawingSource?.un("addfeature", handleDrawingChange);
            drawingSource?.un("removefeature", handleDrawingChange);
        };
    }, [drawingSource, features, selectedReport, clickedTool, setFeatures, setClickedFeature]);

    useEffect(() => {
        let selectedReportFeatures: Feature[] = [];
        let reportFeaturesDrawing: Feature[] = [];
        if (selectedReport) {
            selectedReportFeatures = reportSource?.getFeatures().filter((feature: Feature) => feature.get("reportData").id === selectedReport.id) || [];
            reportFeaturesDrawing = drawingSource?.getFeatures().filter((feature: Feature) => feature.get("reportData").id === selectedReport.id) || [];
        } else {
            reportFeaturesDrawing = drawingSource?.getFeatures().filter((feature: Feature) => feature.get("new")) || [];
        }
        setFeatures([...selectedReportFeatures, ...reportFeaturesDrawing]);
    }, [reportSource, drawingSource, selectedReport, setFeatures]);

    useEffect(() => {
        const mainPointFeatureStyle = mainFeature?.getStyle() as Style;
        mainPointFeatureStyle?.getImage()?.setScale(0.8);
        mainFeature?.changed();
        return () => {
            mainPointFeatureStyle?.getImage()?.setScale(0.5);
            mainFeature?.changed();
        };
    }, [mainFeature]);

    useEffect(() => {
        if (selectedReport) {
            features.forEach((feature) => {
                if (feature.getStyle()) (feature.getStyle() as Style)?.setZIndex(5);
                feature?.changed();
            });
        }

        return () => {
            if (selectedReport) {
                features.forEach((feature) => {
                    if (feature.getStyle()) (feature.getStyle() as Style)?.setZIndex(1);
                    feature?.changed();
                });
            }
        };
    }, [features, selectedReport]);

    const getToolPriority = (tool: ReportTool) => {
        if (isToolDisabled(tool)) return "primary";
        if (clickedTool.name === tool.name && clickedTool.clicked) return "secondary";
        return "tertiary";
    };

    const isToolDisabled = (tool: ReportTool): boolean => {
        if (!mainFeature && tool.name !== toolNames.point) {
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
        const featureText = featureStyle.getText();
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
                    {reportCreationTools.map((tool) => (
                        <Button
                            key={tool.name}
                            onClick={() => {
                                handleClick(tool.name);
                                setClickedTool(() => {
                                    return { name: tool.name, clicked: clickedTool.name === tool.name ? !clickedTool.clicked : true };
                                });
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
                    {reportEditTools.map((tool) => (
                        <Button
                            key={tool.name}
                            onClick={() => {
                                handleClick(tool.name);
                                setClickedTool(() => {
                                    return { name: tool.name, clicked: clickedTool.name === tool.name ? !clickedTool.clicked : true };
                                });
                            }}
                            priority={clickedTool.name === tool.name && clickedTool.clicked ? "secondary" : "tertiary"}
                            title={tool.title}
                        >
                            <img width={20} height={20} src={tool.imgSrc} alt={tool.name} />
                        </Button>
                    ))}
                </div>
            </div>
            {features.length > 0 && (
                <div className="report-features">
                    {features
                        .filter((feat) => feat !== mainFeature)
                        .map((feature, index) => {
                            const featureType = feature.getGeometry()?.getType();
                            const featureText = (feature.getStyle() as Style)?.getText();
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
                                                ? reportEditTools.find((tool) => tool.name === toolNames.tooltip)?.imgSrc
                                                : reportCreationTools.find((tool) => tool.featureType === featureType)?.imgSrc
                                        }
                                        alt={featureType ? SketchFeatureType[featureType] : ""}
                                    />
                                    <span>{featureText ? featureText.getText() : featureType ? SketchFeatureType[featureType] : ""}</span>
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
