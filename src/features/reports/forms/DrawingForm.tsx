import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "@/i18n";
import { isAxiosError } from "axios";
import { Feature } from "ol";
import Layer from "ol/layer/Layer";
import VectorSource, { VectorSourceEvent } from "ol/source/Vector";
import useReportTools from "@/hooks/reports/useReportTools";
import { useMapStore, useReportStore, useUserStore } from "@/store";
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
    onSubmitSketch?: () => Promise<void>;
    expendedDrawing?: boolean;
}

const DrawingForm: React.FC<Props> = ({ clickedTool, handleToolClick, hideToolsDiv, onSubmitSketch, expendedDrawing }) => {
    const [showSketch, setShowSketch] = useState<boolean>(false);
    const sketchSnapshotRef = useRef<Feature[]>([]);

    const { user } = useUserStore();
    const { map, setClickedTool } = useMapStore();
    const { selectedReport, selectedFeatures, setSelectedFeatures, editReport } = useReportStore();

    const importFileRef = useRef<HTMLInputElement>(null);

    const { t } = useTranslation({ DrawingForm });

    const reportTools = useReportTools();
    const reportLayer = map?.getAllLayers().find((layer) => layer.get("type") === REPORTS_LAYER_TYPE);
    const reportSource = reportLayer?.getSource() as VectorSource;

    const drawingLayer = map?.getAllLayers().find((layer: Layer & { gpResultLayerId?: string }) => layer.gpResultLayerId === "drawing");
    const drawingSource = drawingLayer?.getSource() as VectorSource;

    const lastFeaturesRef = useRef<Feature[]>([]);

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

    const changeCallCountRef = useRef(0);
    const lastChangeLogRef = useRef(0);

    const handleDrawingChange = useCallback(() => {
        changeCallCountRef.current += 1;
        const now = Date.now();

        if (now - lastChangeLogRef.current > 500) {
            changeCallCountRef.current = 0;
            lastChangeLogRef.current = now;
        }

        const features = drawingSource.getFeatures();
        if (features.length !== lastFeaturesRef.current.length || features.some((f, i) => f !== lastFeaturesRef.current[i])) {
            lastFeaturesRef.current = features;
            setSelectedFeatures(features);
        }
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
            selectedReportFeatures = getReportAllFeatures(selectedReport);

            const existingIds = new Set(drawingSource?.getFeatures().map((f) => f.getId()) ?? []);
            const featurestoAdd = selectedReportFeatures.filter((f) => !existingIds.has(f.getId()));
            if (drawingSource && featurestoAdd.length > 0) {
                drawingSource.addFeatures(featurestoAdd);
            }

            lastFeaturesRef.current = selectedReportFeatures;
            setSelectedFeatures(selectedReportFeatures);

            const editTool = reportTools.find((t) => t.name === toolNames.edit);
            handleToolClick?.(editTool);

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

        return () => {
            if (selectedReport && drawingSource) {
                drawingSource.removeFeatures(selectedReportFeatures);
                const clusterFeatures = reportSource
                    ?.getFeatures()
                    .map((f) => (f.get("features") ? f.get("features") : f))
                    .flat();
                const reportMainFeatureUpdated = clusterFeatures.find((f) => f.get("reportData")?.id === selectedReport.id && f.get("main"));
                if (reportMainFeature && !reportMainFeatureUpdated) {
                    reportSource?.addFeature(reportMainFeature);
                }
                lastFeaturesRef.current = [];
                setSelectedFeatures([]);
                drawingSource.clear();
            }
        };
    }, [selectedReport?.id, drawingSource, reportSource]);

    const getToolPriority = (tool: ReportTool) => {
        if (isToolDisabled(tool)) return "primary";
        if (clickedTool?.name === tool.name && clickedTool.clicked) return "secondary";
        return "tertiary";
    };
    const isToolDisabled = (tool: ReportTool): boolean => {
        if (!selectedReport && tool.type === "create") {
            return false;
        }

        if (!selectedFeatures.length && tool.name !== toolNames.point) {
            return true;
        }
        return false;
    };
    const isOwner = Number(user?.id) === Number(selectedReport?.author?.id);

    const releaseActiveTool = () => {
        if (clickedTool?.clicked && clickedTool.name) {
            const activeToolBtn = document.querySelector(`button[id*="${clickedTool.name}"].drawing-tool-active`) as HTMLButtonElement | null;
            activeToolBtn?.click();
            setClickedTool({ name: clickedTool.name, clicked: false });
        }
    };

    return (
        <>
            <SketchList showSketch={showSketch} expendedDrawing={expendedDrawing} />

            {!hideToolsDiv && editReport && !showSketch && (
                <Button
                    priority="secondary"
                    className="fr-mt-4v"
                    onClick={() => {
                        sketchSnapshotRef.current = editReport && selectedReport ? getReportAllFeatures(selectedReport) : (drawingSource?.getFeatures() ?? []);
                        setShowSketch(true);
                    }}
                >
                    {selectedReport?.sketch ? t("edit_sketchToEdit") : t("show_sketchToEdit")}
                </Button>
            )}

            {((!editReport && hideToolsDiv === false) ||
                (showSketch && !STATUS_NOT_ALLOWED.includes(selectedReport?.status ?? "")) ||
                (!STATUS_NOT_ALLOWED.includes(selectedReport?.status ?? "") && editReport === false && isOwner)) && (
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
                    {editReport && (
                        <Button
                            onClick={async () => {
                                if (drawingSource) {
                                    setSelectedFeatures(drawingSource.getFeatures());
                                }
                                releaseActiveTool();
                                setShowSketch(false);
                                if (onSubmitSketch) {
                                    try {
                                        await onSubmitSketch();
                                    } catch (error) {
                                        if (isAxiosError(error) && error.response?.status === 403) {
                                            // Not recoverable — revert to original state
                                            if (drawingSource) {
                                                drawingSource.clear();
                                                drawingSource.addFeatures(sketchSnapshotRef.current);
                                                setSelectedFeatures(sketchSnapshotRef.current);
                                            }
                                        } else {
                                            // Recoverable (400, network…) — re-open for retry
                                            setShowSketch(true);
                                        }
                                    }
                                }
                            }}
                        >
                            {t("save_sketch")}
                        </Button>
                    )}
                    <Button
                        priority="secondary"
                        onClick={() => {
                            releaseActiveTool();
                            if (drawingSource) {
                                drawingSource.clear();
                                drawingSource.addFeatures(sketchSnapshotRef.current);
                                setSelectedFeatures(sketchSnapshotRef.current);
                            }
                            setShowSketch(false);
                        }}
                    >
                        {t("hide_sketchToEdit")}
                    </Button>
                </div>
            )}
        </>
    );
};

export default DrawingForm;
