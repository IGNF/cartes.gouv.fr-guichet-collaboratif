import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "@/i18n";
import { Feature } from "ol";
import Layer from "ol/layer/Layer";
import VectorSource, { VectorSourceEvent } from "ol/source/Vector";
import useReportTools from "@/hooks/reports/useReportTools";
import { useMapStore, useReportStore } from "@/store";
import { ClickedTool, ReportTool, toolNames } from "@/constants/reports/types";
import { getReportAllFeatures, REPORTS_LAYER_TYPE } from "@/constants/reports/utils";
import Button from "@codegouvfr/react-dsfr/Button";
import SketchList from "./SketchList";
import ImportSketchFile from "./ImportSketchFile";
import { STATUS_NOT_ALLOWED } from "@/constants/utils";

interface Props {
    clickedTool?: ClickedTool;
    handleToolClick?: (tool: ReportTool | undefined) => void;
    hideToolsDiv?: boolean;
    onSubmitSketch?: () => void;
    expendedDrawing?: boolean;
}

const DrawingForm: React.FC<Props> = ({ clickedTool, handleToolClick, hideToolsDiv, onSubmitSketch, expendedDrawing }) => {
    const [showSketch, setShowSketch] = useState<boolean>(false);
    const { map } = useMapStore();
    const { selectedReport, selectedFeatures, setSelectedFeatures, editReport } = useReportStore();

    const importFileRef = useRef<HTMLInputElement>(null);

    const { t } = useTranslation({ DrawingForm });

    const reportTools = useReportTools();
    const reportLayer = map?.getAllLayers().find((layer) => layer.get("type") === REPORTS_LAYER_TYPE);
    const reportSource = reportLayer?.getSource() as VectorSource;

    const drawingLayer = map?.getAllLayers().find((layer: Layer & { gpResultLayerId?: string }) => layer.gpResultLayerId === "drawing");
    const drawingSource = drawingLayer?.getSource() as VectorSource;

    const handleDrawingAdd = useCallback(
        (e: VectorSourceEvent) => {
            if (e.feature) {
                if (e.type === "addfeature") {
                    if (selectedReport) {
                        e.feature.set("reportData", selectedReport);
                    } else {
                        e.feature.set("new", true);
                        if (!selectedFeatures.length) {
                            e.feature.set("main", true);
                        }
                    }
                }
            }
        },
        [selectedFeatures, selectedReport]
    );

    const handleDrawingChange = useCallback(() => {
        setSelectedFeatures(drawingSource.getFeatures());
    }, [drawingSource, setSelectedFeatures]);

    useEffect(() => {
        drawingSource?.on("addfeature", handleDrawingAdd);
        drawingSource?.on("change", handleDrawingChange);

        return () => {
            drawingSource?.un("addfeature", handleDrawingAdd);
            drawingSource?.un("change", handleDrawingChange);
        };
    }, [drawingSource, handleDrawingAdd, handleDrawingChange]);

    useEffect(() => {
        let selectedReportFeatures: Feature[] = [];
        let reportMainFeature: Feature | undefined;

        if (selectedReport) {
            const editTool = reportTools.find((t) => t.name === toolNames.edit);
            if (handleToolClick) handleToolClick(editTool);
            selectedReportFeatures = getReportAllFeatures(selectedReport);
            if (handleToolClick) handleToolClick(editTool);
            drawingSource?.addFeatures(selectedReportFeatures);
            const clusterFeatures = reportSource
                ?.getFeatures()
                .map((f) => {
                    if (f.get("features")) return f.get("features");
                    return f;
                })
                .flat();
            reportMainFeature = clusterFeatures.find((f) => f.get("reportData").id === selectedReport?.id && f.get("main"));
            if (reportMainFeature) reportSource?.removeFeature(reportMainFeature);
        }

        if (drawingSource) setSelectedFeatures(drawingSource.getFeatures());
        return () => {
            if (selectedReport) {
                drawingSource?.removeFeatures(selectedReportFeatures);
                const clusterFeatures = reportSource
                    ?.getFeatures()
                    .map((f) => {
                        if (f.get("features")) return f.get("features");
                        return f;
                    })
                    .flat();
                const reportMainFeatureUpdated = clusterFeatures.find((f) => f.get("reportData")?.id === selectedReport?.id && f.get("main"));
                if (reportMainFeature && !reportMainFeatureUpdated) {
                    reportSource?.addFeature(reportMainFeature);
                }
                setSelectedFeatures([]);
            }
        };
    }, [selectedReport, drawingSource, reportSource, reportTools, handleToolClick, setSelectedFeatures]);

    const getToolPriority = (tool: ReportTool) => {
        if (isToolDisabled(tool)) return "primary";
        if (clickedTool?.name === tool.name && clickedTool.clicked) return "secondary";
        return "tertiary";
    };

    const isToolDisabled = (tool: ReportTool): boolean => {
        if (!selectedFeatures.length && tool.name !== toolNames.point) {
            return true;
        }
        return false;
    };

    return (
        <>
            <SketchList showSketch={showSketch} expendedDrawing={expendedDrawing} />

            {!hideToolsDiv && editReport && !showSketch && (
                <Button className="fr-mt-4v" onClick={() => setShowSketch(!showSketch)}>
                    {showSketch
                        ? t("hide_sketchToEdit")
                        : editReport && selectedReport && selectedReport.sketch
                          ? t("edit_sketchToEdit")
                          : t("show_sketchToEdit")}
                </Button>
            )}

            {((!hideToolsDiv && showSketch) || !selectedFeatures.length || (!STATUS_NOT_ALLOWED.includes(selectedReport?.status ?? "") && !editReport)) && (
                <>
                    <p className="fr-text--sm fr-mb-1v">{t("drawing_message")} </p>
                    <div className="report-tools">
                        <p className="fr-mt-4v fr-mb-2v fr-text--sm">{t("creation_tools")}</p>
                        <div>
                            {reportTools
                                .filter((tool) => tool.type === "create")
                                .map((tool) => (
                                    <Button
                                        key={tool.name}
                                        id={`${tool.name}-report-drawer-${tool.type}`}
                                        onClick={() => {
                                            if (tool.name === toolNames.import) {
                                                importFileRef?.current?.click();
                                                return;
                                            }
                                            if (handleToolClick) handleToolClick(tool);
                                        }}
                                        priority={getToolPriority(tool)}
                                        title={tool.title}
                                        className="gpf-btn--tertiary drawing-tool"
                                        disabled={isToolDisabled(tool)}
                                    >
                                        <></>
                                    </Button>
                                ))}
                            <ImportSketchFile inputRef={importFileRef} />
                        </div>
                    </div>

                    <div className="report-tools">
                        <p className="fr-mt-4v fr-mb-2v fr-text--sm">{t("edit_tools")}</p>
                        <div>
                            {reportTools
                                .filter((tool) => tool.type === "edit")
                                .map((tool) => (
                                    <Button
                                        key={tool.name}
                                        id={`${tool.name}-report-drawer-${tool.type}`}
                                        onClick={() => {
                                            if (handleToolClick) handleToolClick(tool);
                                        }}
                                        priority={clickedTool?.name === tool.name && clickedTool.clicked ? "secondary" : "tertiary"}
                                        title={tool.title}
                                        className="gpf-btn--tertiary drawing-tool"
                                    >
                                        <></>
                                    </Button>
                                ))}
                        </div>
                    </div>
                </>
            )}
            {showSketch && (
                <div className="report__actions">
                    {editReport && <Button onClick={onSubmitSketch}>{t("save_sketch")}</Button>}
                    <Button priority="secondary" onClick={() => setShowSketch(!showSketch)}>
                        {t("hide_sketchToEdit")}
                    </Button>
                </div>
            )}
        </>
    );
};

export default DrawingForm;
