import { ClickedTool, ReportTool, toolNames } from "@/constants/reports/types";
import { getReportAllFeatures, reportTools } from "@/constants/reports/utils";
import { useMapStore, useReportStore } from "@/store";
import Button from "@codegouvfr/react-dsfr/Button";

import { Feature } from "ol";
import Layer from "ol/layer/Layer";
import VectorSource, { VectorSourceEvent } from "ol/source/Vector";
import { useCallback, useEffect, useRef } from "react";
import SketchList from "./SketchList";
import ImportSketchFile from "./ImportSketchFile";

interface Props {
    clickedTool: ClickedTool;
    handleToolClick: (tool: ReportTool | undefined) => void;
}

const DrawingForm: React.FC<Props> = ({ clickedTool, handleToolClick }) => {
    const { map } = useMapStore();
    const { selectedReport, selectedFeatures, setSelectedFeatures } = useReportStore();

    const importFileRef = useRef<HTMLInputElement>(null);

    const reportLayer = map?.getAllLayers().find((layer) => layer.get("title") === "Signalements");
    const reportSource = reportLayer?.getSource() as VectorSource;

    const drawingLayer = map?.getAllLayers().find((layer: Layer & { gpResultLayerId?: string }) => layer.gpResultLayerId === "drawing");
    const drawingSource = drawingLayer?.getSource() as VectorSource;

    const handleDrawingChange = useCallback(
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
                    setSelectedFeatures([...selectedFeatures, e.feature]);
                } else if (e.type === "removefeature") {
                    const newFatures = selectedFeatures.filter((feat) => feat !== e.feature);
                    setSelectedFeatures(newFatures);
                }
            }
        },
        [selectedFeatures, selectedReport, setSelectedFeatures]
    );

    useEffect(() => {
        drawingSource?.on("addfeature", handleDrawingChange);
        drawingSource?.on("removefeature", handleDrawingChange);

        return () => {
            drawingSource?.un("addfeature", handleDrawingChange);
            drawingSource?.un("removefeature", handleDrawingChange);
        };
    }, [drawingSource, handleDrawingChange]);

    useEffect(() => {
        let selectedReportFeatures: Feature[] = [];
        let reportMainFeature: Feature | undefined;

        if (selectedReport) {
            const editTool = reportTools.find((t) => t.name === toolNames.edit);
            handleToolClick(editTool);
            selectedReportFeatures = getReportAllFeatures(selectedReport);
            handleToolClick(editTool);
            drawingSource?.addFeatures(selectedReportFeatures);
            reportMainFeature = reportSource?.getFeatures().find((f) => f.get("reportData").id === selectedReport?.id && f.get("main"));
            if (reportMainFeature) reportSource?.removeFeature(reportMainFeature);
        }
        if (drawingSource) setSelectedFeatures(drawingSource?.getFeatures());
        return () => {
            if (selectedReport) {
                drawingSource?.removeFeatures(selectedReportFeatures);
                const reportMainFeatureUpdated = reportSource?.getFeatures().find((f) => f.get("reportData").id === selectedReport?.id && f.get("main"));
                if (reportMainFeature && !reportMainFeatureUpdated) {
                    reportSource?.addFeature(reportMainFeature);
                }
                setSelectedFeatures([]);
            }
        };
    }, [selectedReport, drawingSource, reportSource, handleToolClick, setSelectedFeatures]);

    const getToolPriority = (tool: ReportTool) => {
        if (isToolDisabled(tool)) return "primary";
        if (clickedTool.name === tool.name && clickedTool.clicked) return "secondary";
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
                                    id={`${tool.name}-report-drawer-${tool.type}`}
                                    onClick={() => {
                                        if (tool.name === toolNames.import) {
                                            importFileRef?.current?.click();
                                            return;
                                        }
                                        handleToolClick(tool);
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
                    <p className="fr-mt-4v fr-mb-2v fr-text--sm">Outils de modification</p>
                    <div>
                        {reportTools
                            .filter((tool) => tool.type === "edit")
                            .map((tool) => (
                                <Button
                                    key={tool.name}
                                    id={`${tool.name}-report-drawer-${tool.type}`}
                                    onClick={() => {
                                        handleToolClick(tool);
                                    }}
                                    priority={clickedTool.name === tool.name && clickedTool.clicked ? "secondary" : "tertiary"}
                                    title={tool.title}
                                    className="gpf-btn--tertiary drawing-tool"
                                >
                                    <></>
                                </Button>
                            ))}
                    </div>
                </div>
            </>

            <SketchList />
        </>
    );
};

export default DrawingForm;
