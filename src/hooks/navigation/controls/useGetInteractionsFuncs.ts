import VectorSource from "ol/source/Vector";
import { SelectEvent } from "ol/interaction/Select";
import { Feature, MapBrowserEvent } from "ol";
import VectorLayer from "ol/layer/Vector";
import WebGLVectorLayer from "ol/layer/WebGLVector";
import { ContributionType, CustomInteraction, InteractionsProps } from "@/constants/contributions/types";
import { ModifyEvent } from "ol/interaction/Modify";
import { DrawEvent } from "ol/interaction/Draw";
import { DragPan } from "ol/interaction";
import { FEATURE_TYPE_DATA_PROPERTY, FEATURE_TYPE_NEW_PROPERTY, FEATURE_TYPE_SELECTED_PROPERTY, POINTER_HIT_DETECTION_TOLERENCE } from "@/constants";
import { addFeatureProperties, addInteractionToMap, isPointOnSegment, removeInteractionFromMap, setFeatNewCoords } from "@/constants/contributions/utils";
import { GeometryFeatueParams } from "@/constants/reports/types";
import { Coordinate } from "ol/coordinate";
import BaseEvent from "ol/events/Event";
import { useCommunityStore, useContributionStore, useMapStore, useModalStore } from "@/store";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { CustomControlItem, GeoserviceFeatureTypeProp, InteractionType, StatusMessage } from "@/constants/communities/types";
import { REPORTS_LAYER_TYPE } from "@/constants/reports/utils";
import { LineString, SimpleGeometry } from "ol/geom";
import { FeatureTypeMode } from "@/constants/contributions/types";
import { useTranslation } from "@/i18n";
import ShortestPathWorker from "./shortestPath/shortestPath.worker.ts?worker";
import type { ShortestPathWorkerRequest, ShortestPathWorkerResponse } from "./shortestPath/shortestPath.worker";

let initialFeat: Feature | null = null;
let lastPointedFeat: Feature | null = null;
let clipboardFeature: Feature | null = null;

const useGetInteractionsFuncs = (props: InteractionsProps) => {
    const { map, mapWorkingLayer, clickedControl, clickedMapFeature, setClickedControl, setClickedMapFeature } = useMapStore();
    const { contributions, selectedObjects, saveContribution, setIsModifying, setSelectedObjects, setFeatureTypeMode } = useContributionStore();
    const { searchModal, exportMapModal } = useModalStore();
    const { communityLayers, addAlertMessage, removeAlertMessage } = useCommunityStore();

    const { t } = useTranslation({ useGetInteractionsFuncs });

    const currentCommunityLayer = useMemo(() => communityLayers?.find((l) => l?.geoservice?.layer === mapWorkingLayer), [communityLayers, mapWorkingLayer]);

    /*geoservice id not layer id! */
    const snaptoIds = useMemo(
        () =>
            currentCommunityLayer?.snapto
                ?.split(",")
                .map((value) => Number(value.trim()))
                .filter((value) => !Number.isNaN(value)) ?? [],
        [currentCommunityLayer?.snapto]
    );

    /* Since there is no proper shortest path params in API
    We use filter over SnapTo to keep line layers as support */
    const shortestPathNetworkLayers = useMemo(
        () => (communityLayers ?? []).filter((l) => snaptoIds.includes(l.geoservice.id) && l.geoservice.featureType === GeoserviceFeatureTypeProp.LINE),
        [communityLayers, snaptoIds]
    );

    const shortestPathNetworkLayerNames = useMemo(() => shortestPathNetworkLayers.map((l) => l.geoservice.layer), [shortestPathNetworkLayers]);

    const isShortestPathLayer = currentCommunityLayer?.geoservice.featureType === GeoserviceFeatureTypeProp.LINE;

    const lineLayerIds = useMemo(
        () => new Set((communityLayers ?? []).filter((l) => l.geoservice.featureType === GeoserviceFeatureTypeProp.LINE).map((l) => l.geoservice.id)),
        [communityLayers]
    );

    const isShortestPathReady = Boolean(isShortestPathLayer && snaptoIds.some((id) => lineLayerIds.has(id)));

    const shortestPathLayerNames = useMemo(() => shortestPathNetworkLayers.map((l) => l.geoservice.title), [shortestPathNetworkLayers]);

    const currentMapWorkingSource = useMemo(
        () =>
            map
                ?.getAllLayers()
                .find((l) => l.get("name") === mapWorkingLayer)
                ?.getSource() as VectorSource,
        [map, mapWorkingLayer]
    );

    const clickableLayer = map
        ?.getAllLayers()
        .find((layer) => layer.get("name") === mapWorkingLayer && (layer instanceof VectorLayer || layer instanceof WebGLVectorLayer));
    const clickableSource = clickableLayer?.getSource() as VectorSource;

    const {
        selectInteraction,
        dragInteraction,
        modifyInteraction,
        modifyFeatures,
        drawPointInteraction,
        drawLineInteraction,
        drawPolygonInteraction,
        translateInteraction,
        translateFeatures,
        splitInteraction,
    } = props;

    // Add ref to get the latest interactions in ol event
    const registeredPasteHandlerRef = useRef<((e: MapBrowserEvent) => void) | null>(null);
    const shortestPathStartRef = useRef<{ feature: Feature; coordinate: Coordinate } | null>(null);

    const shortestPathWorkerRef = useRef<Worker | null>(null);
    const shortestPathPendingRef = useRef<Map<number, (path: Coordinate[] | null) => void>>(new Map());
    const shortestPathRequestIdRef = useRef(0);
    const isComputingShortestPathRef = useRef(false);
    const shortestPathInteractionFuncRef = useRef<((e: MapBrowserEvent) => void) | null>(null);
    const registeredShortestPathHandlerRef = useRef<((e: MapBrowserEvent) => void) | null>(null);

    useEffect(() => {
        const worker = new ShortestPathWorker();
        const pending = shortestPathPendingRef.current;
        worker.onmessage = (event: MessageEvent<ShortestPathWorkerResponse>) => {
            const { id, path } = event.data;
            const resolve = pending.get(id);
            if (resolve) {
                pending.delete(id);
                resolve(path);
            }
        };
        shortestPathWorkerRef.current = worker;
        return () => {
            worker.terminate();
            shortestPathWorkerRef.current = null;
            pending.clear();
        };
    }, []);

    const runShortestPathWorker = useCallback(
        (request: Omit<ShortestPathWorkerRequest, "id">) =>
            new Promise<Coordinate[] | null>((resolve) => {
                const worker = shortestPathWorkerRef.current;
                if (!worker) {
                    resolve(null);
                    return;
                }
                const id = ++shortestPathRequestIdRef.current;
                shortestPathPendingRef.current.set(id, resolve);
                worker.postMessage({ id, ...request });
            }),
        []
    );

    const pasteInteractionFuncRef = useRef<((e: MapBrowserEvent) => void) | null>(null);

    const selectInteractionFunc = useCallback(
        (e: SelectEvent) => {
            const selectedFeatures = e.selected;
            const deselectedFeatures = e.deselected;
            selectedFeatures.forEach((feat) => {
                feat.set(FEATURE_TYPE_SELECTED_PROPERTY, true);
            });
            deselectedFeatures.forEach((feat) => {
                feat.unset(FEATURE_TYPE_SELECTED_PROPERTY);
            });

            const newSelectedObjects = [...selectedObjects.filter((feat) => !deselectedFeatures.includes(feat)), ...selectedFeatures];
            if (newSelectedObjects.length > 0) {
                setClickedMapFeature(newSelectedObjects[0]);
            } else {
                setClickedMapFeature(null);
            }

            setSelectedObjects(newSelectedObjects);
        },
        [selectedObjects, setSelectedObjects, setClickedMapFeature]
    );

    const dragInteractionFunc = useCallback(() => {
        const extent = dragInteraction.getGeometry().getExtent();
        if (!extent) return;
        const featuresAtExtent = clickableSource?.getFeaturesInExtent(extent);

        featuresAtExtent.forEach((feat) => {
            if (!selectInteraction.getFeatures().getArray().includes(feat)) {
                selectInteraction.selectFeature(feat);
            }
        });
        const newSelectedObjects = selectInteraction.getFeatures().getArray();
        setSelectedObjects(newSelectedObjects);
        if (newSelectedObjects.length > 0) {
            setClickedMapFeature(newSelectedObjects[0]);
        }
    }, [clickableSource, dragInteraction, selectInteraction, setClickedMapFeature, setSelectedObjects]);

    const removeInteractionFunc = useCallback(
        (e: SelectEvent) => {
            selectInteraction.clearSelection();
            const features = e.selected;
            const feat = features[0];
            if (!feat) return;
            if (currentMapWorkingSource) {
                currentMapWorkingSource?.removeFeature(feat);
                saveContribution(feat, ContributionType.DELETE, initialFeat, mapWorkingLayer);
            }
        },
        [currentMapWorkingSource, selectInteraction, mapWorkingLayer, saveContribution]
    );

    const modifyInteractionFunc = useCallback(
        (e: ModifyEvent) => {
            setIsModifying(false);
            const shouldKeepSelectDisabled =
                clickedControl?.interaction === InteractionType.MODIFY || clickedControl?.interaction === InteractionType.TRANSLATE_OBJECT;
            const features = e.features.getArray();
            const feat = features[0];
            if (!feat || !initialFeat) {
                initialFeat = null;
                if (!shouldKeepSelectDisabled) {
                    selectInteraction.setActive(true);
                }
                return;
            }

            const currentGeom = feat.getGeometry();
            const initialGeom = initialFeat.getGeometry();
            const currentCoords = (currentGeom as GeometryFeatueParams | null)?.getCoordinates?.();
            const initialCoords = (initialGeom as GeometryFeatueParams | null)?.getCoordinates?.();
            const hasGeometryChanged =
                currentCoords !== undefined && initialCoords !== undefined && JSON.stringify(currentCoords) !== JSON.stringify(initialCoords);

            if (hasGeometryChanged) {
                saveContribution(feat, ContributionType.MODIFY, initialFeat, mapWorkingLayer);
            }
            initialFeat = null;
            if (!shouldKeepSelectDisabled) {
                selectInteraction.setActive(true);
            }
            if (clickedControl?.interaction === InteractionType.TRANSLATE_OBJECT) {
                const dragPan = map
                    ?.getInteractions()
                    .getArray()
                    .find((i) => i instanceof DragPan) as DragPan | undefined;
                if (dragPan) {
                    dragPan.setActive(true);
                }
            }
        },
        [mapWorkingLayer, saveContribution, setIsModifying, selectInteraction, clickedControl, map]
    );

    const modifyInteractionFuncStart = useCallback(
        (e: ModifyEvent) => {
            setIsModifying(true);
            const features = e.features.getArray();
            const feat = features[0];
            if (!feat) {
                setIsModifying(false);
                return;
            }
            initialFeat = feat.clone();

            if (clickedControl?.interaction === InteractionType.TRANSLATE_OBJECT) {
                const dragPan = map
                    ?.getInteractions()
                    .getArray()
                    .find((i) => i instanceof DragPan) as DragPan | undefined;
                if (dragPan) {
                    dragPan.setActive(false);
                }
            }
        },
        [setIsModifying, clickedControl, map]
    );

    const drawInteractionFunc = useCallback(
        (e: DrawEvent) => {
            const feature = e.feature;
            const geoservice = currentCommunityLayer?.geoservice;
            const geometryNameColumn = geoservice?.columns.find((col) => col.name === geoservice.geometryName);
            if (currentMapWorkingSource) {
                addFeatureProperties(
                    feature,
                    currentCommunityLayer?.geoservice,
                    contributions.filter((contr) => contr.type === ContributionType.CREATE)
                );
                feature.set(FEATURE_TYPE_NEW_PROPERTY, true);
                if (geometryNameColumn?.is3d) setFeatNewCoords(feature);
                currentMapWorkingSource.addFeature(feature);
                saveContribution(feature, ContributionType.CREATE, initialFeat, mapWorkingLayer);
                setClickedMapFeature(feature);
            }
        },
        [currentMapWorkingSource, currentCommunityLayer?.geoservice, contributions, mapWorkingLayer, saveContribution, setClickedMapFeature]
    );

    const pasteInteractionFunc = useCallback(
        (e: MapBrowserEvent) => {
            if (!clipboardFeature || !currentMapWorkingSource) return;

            const geoservice = currentCommunityLayer?.geoservice;
            const geometryNameColumn = geoservice?.columns.find((col) => col.name === geoservice.geometryName);

            const pastedFeature = clipboardFeature.clone();

            const geometry = pastedFeature.getGeometry() as SimpleGeometry | undefined;
            if (geometry) {
                const extent = geometry.getExtent();
                const centerX = (extent[0] + extent[2]) / 2;
                const centerY = (extent[1] + extent[3]) / 2;
                geometry.translate(e.coordinate[0] - centerX, e.coordinate[1] - centerY);
            }

            const createdContributions = contributions.filter((contr) => contr.type === ContributionType.CREATE);
            const sourceFeatureTypeData = pastedFeature.get(FEATURE_TYPE_DATA_PROPERTY);

            if (sourceFeatureTypeData && typeof sourceFeatureTypeData === "object") {
                const nextFeatureTypeData = { ...sourceFeatureTypeData };
                if (geoservice?.idName) {
                    nextFeatureTypeData[`${geoservice.idName}`] = createdContributions.length + 1;
                    pastedFeature.set(`${geoservice.idName}`, createdContributions.length + 1);
                }
                pastedFeature.set(FEATURE_TYPE_DATA_PROPERTY, nextFeatureTypeData);
            } else {
                addFeatureProperties(pastedFeature, geoservice, createdContributions);
            }

            pastedFeature.set(FEATURE_TYPE_NEW_PROPERTY, true);
            if (geometryNameColumn?.is3d) setFeatNewCoords(pastedFeature);

            currentMapWorkingSource.addFeature(pastedFeature);
            saveContribution(pastedFeature, ContributionType.CREATE, null, mapWorkingLayer);
            setClickedMapFeature(pastedFeature);
            setSelectedObjects([]);
            setClickedControl(null);
            if (registeredPasteHandlerRef.current) {
                map?.un("singleclick", registeredPasteHandlerRef.current);
                registeredPasteHandlerRef.current = null;
            }
            clipboardFeature = null;
        },
        [
            currentMapWorkingSource,
            currentCommunityLayer?.geoservice,
            contributions,
            mapWorkingLayer,
            saveContribution,
            setClickedMapFeature,
            setClickedControl,
            setSelectedObjects,
            map,
        ]
    );

    useEffect(() => {
        pasteInteractionFuncRef.current = pasteInteractionFunc;
    }, [pasteInteractionFunc]);

    const pasteAtCoordinate = useCallback((coordinate?: Coordinate) => {
        if (!coordinate) return;
        pasteInteractionFuncRef.current?.({ coordinate } as MapBrowserEvent);
    }, []);

    const copyInteractionFunc = useCallback((): boolean => {
        const features = selectInteraction.getFeatures().getArray();
        const sourceFeature = features[0] ?? clickedMapFeature;

        if (!sourceFeature) return false;

        if (registeredPasteHandlerRef.current) {
            map?.un("singleclick", registeredPasteHandlerRef.current);
            registeredPasteHandlerRef.current = null;
        }
        clipboardFeature = sourceFeature.clone();

        // Pass the event with the feature through OL
        const stablePasteHandler = (e: MapBrowserEvent) => {
            pasteInteractionFuncRef.current?.(e);
        };
        map?.on("singleclick", stablePasteHandler);
        registeredPasteHandlerRef.current = stablePasteHandler;
        return true;
    }, [selectInteraction, clickedMapFeature, map]);

    const clearShortestPathStart = useCallback(() => {
        if (shortestPathStartRef.current?.feature) {
            shortestPathStartRef.current.feature.unset(FEATURE_TYPE_SELECTED_PROPERTY);
            shortestPathStartRef.current.feature.changed();
        }
        shortestPathStartRef.current = null;
    }, []);

    /*
    Handles two-click shortest path creation.
    the resulting feature is saved to the working layer as a creation.
     */
    const shortestPathInteractionFunc = useCallback(
        async (e: MapBrowserEvent) => {
            if (!map || !clickableSource || mapWorkingLayer === REPORTS_LAYER_TYPE) return;

            if (!isShortestPathLayer) {
                clearShortestPathStart();
                return;
            }

            if (!isShortestPathReady) {
                addAlertMessage(StatusMessage.warning, t("shortest_path_not_ready"), 3000);
                clearShortestPathStart();
                return;
            }

            if (isComputingShortestPathRef.current) {
                addAlertMessage(StatusMessage.info, t("shortest_path_computing"), 3000);
                return;
            }

            const networkLayerNames = shortestPathNetworkLayerNames.length > 0 ? shortestPathNetworkLayerNames : [mapWorkingLayer];

            const featuresAtPixel = map.getFeaturesAtPixel(e.pixel, {
                layerFilter: (layer) => networkLayerNames.includes(layer.get("name")),
                hitTolerance: POINTER_HIT_DETECTION_TOLERENCE,
            });

            const targetFeature = (featuresAtPixel?.[0] as Feature | undefined) ?? null;
            if (!targetFeature) return;

            if (!shortestPathStartRef.current) {
                shortestPathStartRef.current = { feature: targetFeature, coordinate: e.coordinate };
                targetFeature.set(FEATURE_TYPE_SELECTED_PROPERTY, true);
                targetFeature.changed();
                addAlertMessage(StatusMessage.info, t("shortest_path_select_end"), 5000);
                return;
            }

            const startFeature = shortestPathStartRef.current.feature;
            if (startFeature === targetFeature) {
                addAlertMessage(StatusMessage.info, t("shortest_path_same_object"), 2000);
                return;
            }

            const geoservice = currentCommunityLayer?.geoservice;
            if (!currentMapWorkingSource || !geoservice) {
                clearShortestPathStart();
                return;
            }
            if (geoservice.featureType !== GeoserviceFeatureTypeProp.LINE) {
                addAlertMessage(StatusMessage.warning, t("shortest_path_not_supported"), 2000);
                clearShortestPathStart();
                return;
            }

            // Use all loaded wfs features to build the graph
            const allFeatures = networkLayerNames.flatMap((layerName) => {
                const networkLayer = map.getAllLayers().find((l) => l.get("name") === layerName);
                const networkSource = networkLayer?.getSource() as VectorSource | undefined;
                return networkSource?.getFeatures() ?? [];
            });

            const lines: Coordinate[][] = [];
            const startLineIndices: number[] = [];
            const endLineIndices: number[] = [];
            allFeatures.forEach((feature) => {
                const geometry = feature.getGeometry();
                if (!geometry || geometry.getType() !== "LineString") return;
                const coords = (geometry as LineString).getCoordinates();
                if (!coords.length) return;
                const index = lines.length;
                lines.push(coords);
                if (feature === startFeature) startLineIndices.push(index);
                if (feature === targetFeature) endLineIndices.push(index);
            });

            const startRef = shortestPathStartRef.current.coordinate;
            const endRef = e.coordinate;
            const outputSource = currentMapWorkingSource;
            const outputLayerName = mapWorkingLayer;
            const createContributions = contributions.filter((contr) => contr.type === ContributionType.CREATE);

            isComputingShortestPathRef.current = true;
            const computingAlertId = addAlertMessage(StatusMessage.info, t("shortest_path_computing"), null);

            let pathCoords: Coordinate[] | null;
            try {
                pathCoords = await runShortestPathWorker({ lines, startLineIndices, endLineIndices, startRef, endRef });
            } finally {
                isComputingShortestPathRef.current = false;
                removeAlertMessage(computingAlertId);
            }

            if (!pathCoords || pathCoords.length < 2) {
                addAlertMessage(StatusMessage.error, t("shortest_path_no_path"), 2000);
                clearShortestPathStart();
                return;
            }

            const geometryNameColumn = geoservice.columns.find((col) => col.name === geoservice.geometryName);
            const newFeature = new Feature({ geometry: new LineString(pathCoords) });

            addFeatureProperties(newFeature, geoservice, createContributions);
            newFeature.set(FEATURE_TYPE_NEW_PROPERTY, true);
            if (geometryNameColumn?.is3d) setFeatNewCoords(newFeature);

            outputSource.addFeature(newFeature);
            saveContribution(newFeature, ContributionType.CREATE, null, outputLayerName);
            setSelectedObjects([]);
            setClickedMapFeature(newFeature);
            setFeatureTypeMode(FeatureTypeMode.EDIT);

            addAlertMessage(StatusMessage.success, t("shortest_path_created"), 2000);
            clearShortestPathStart();
        },
        [
            map,
            clickableSource,
            mapWorkingLayer,
            shortestPathNetworkLayerNames,
            isShortestPathLayer,
            isShortestPathReady,
            addAlertMessage,
            removeAlertMessage,
            runShortestPathWorker,
            t,
            clearShortestPathStart,
            currentMapWorkingSource,
            currentCommunityLayer?.geoservice,
            contributions,
            saveContribution,
            setSelectedObjects,
            setClickedMapFeature,
            setFeatureTypeMode,
        ]
    );

    // Always point to the latest shortest path handler so the stable listener uses fresh state.
    useEffect(() => {
        shortestPathInteractionFuncRef.current = shortestPathInteractionFunc;
    }, [shortestPathInteractionFunc]);

    const registerShortestPathListener = useCallback(() => {
        if (!map) return;
        if (registeredShortestPathHandlerRef.current) {
            map.un("singleclick", registeredShortestPathHandlerRef.current);
            registeredShortestPathHandlerRef.current = null;
        }
        const stableHandler = (e: MapBrowserEvent) => {
            shortestPathInteractionFuncRef.current?.(e);
        };
        map.on("singleclick", stableHandler);
        registeredShortestPathHandlerRef.current = stableHandler;
    }, [map]);

    const unregisterShortestPathListener = useCallback(() => {
        if (registeredShortestPathHandlerRef.current) {
            map?.un("singleclick", registeredShortestPathHandlerRef.current);
            registeredShortestPathHandlerRef.current = null;
        }
    }, [map]);

    const splitLineInteractionFuncPointer = useCallback(
        (e: MapBrowserEvent) => {
            const features = map?.getFeaturesAtPixel(e.pixel, {
                layerFilter: (layer) => layer.get("name") === mapWorkingLayer,
                hitTolerance: POINTER_HIT_DETECTION_TOLERENCE,
            });

            if (features?.length) {
                const pointedFeat = features[0] as Feature;
                if (pointedFeat !== lastPointedFeat) {
                    lastPointedFeat?.unset(FEATURE_TYPE_SELECTED_PROPERTY);
                    pointedFeat?.set(FEATURE_TYPE_SELECTED_PROPERTY, true);
                    lastPointedFeat = pointedFeat;
                }
            } else {
                lastPointedFeat?.unset(FEATURE_TYPE_SELECTED_PROPERTY);
                lastPointedFeat = null;
            }
        },
        [map, mapWorkingLayer]
    );

    const splitLineInteractionFuncEnd = useCallback(
        (e: MapBrowserEvent) => {
            const features = map?.getFeaturesAtPixel(e.pixel, {
                layerFilter: (layer) => layer.get("name") === mapWorkingLayer,
                hitTolerance: 1,
            });

            if (features?.length) {
                const originalFeat = features[0] as Feature;
                const initialFeat = originalFeat.clone();
                const originalFeatGeometry = originalFeat.getGeometry() as GeometryFeatueParams;
                const createdFeat = originalFeat.clone();
                const createdFeatGeometry = createdFeat.getGeometry() as GeometryFeatueParams;

                const originalFeatGeometryCoords = originalFeatGeometry?.getCoordinates() as Coordinate[];
                if (!originalFeatGeometryCoords) return;

                const newCoords = originalFeatGeometry?.getClosestPoint(e.coordinate) as Coordinate;

                let splitIntex = 0;
                for (let i = 0; i < originalFeatGeometryCoords.length; i++) {
                    const start = originalFeatGeometryCoords[i] as Coordinate;
                    const end = originalFeatGeometryCoords[i + 1] as Coordinate;
                    if (isPointOnSegment(start, end, newCoords)) {
                        splitIntex = i;
                        break;
                    }
                }

                const newCoordsOriginal = [...originalFeatGeometryCoords.slice(0, splitIntex + 1), newCoords];
                const newCoordsCreated = [newCoords, ...originalFeatGeometryCoords.slice(splitIntex + 1)];

                clickableSource.removeFeature(originalFeat);
                originalFeatGeometry?.setCoordinates(newCoordsOriginal);
                createdFeatGeometry?.setCoordinates(newCoordsCreated);

                createdFeat.set(FEATURE_TYPE_DATA_PROPERTY, {
                    ...createdFeat.get(FEATURE_TYPE_DATA_PROPERTY),
                    [`${currentCommunityLayer?.geoservice.idName}`]: contributions.filter((contr) => contr.type === ContributionType.CREATE).length + 1,
                });

                originalFeat.unset(FEATURE_TYPE_SELECTED_PROPERTY);
                clickableSource.addFeatures([originalFeat, createdFeat]);

                saveContribution(originalFeat, ContributionType.MODIFY, initialFeat, mapWorkingLayer);
                saveContribution(createdFeat, ContributionType.CREATE, null, mapWorkingLayer);

                setClickedMapFeature(createdFeat);
                setClickedControl(null);
                removeInteractionFromMap(InteractionType.SPLIT_LINE, map!);
            }
        },
        [map, mapWorkingLayer, clickableSource, contributions, currentCommunityLayer?.geoservice, saveContribution, setClickedMapFeature, setClickedControl]
    );

    const getInteractionByType = useCallback(
        (type: string | null, target: string): CustomInteraction => {
            if (!clickableLayer || !clickableSource) return null;
            let interaction: CustomInteraction;

            selectInteraction.un("select", selectInteractionFunc);
            selectInteraction.un("select", removeInteractionFunc);
            modifyInteraction.un("modifystart", modifyInteractionFuncStart);
            modifyInteraction.un("modifyend", modifyInteractionFunc);
            translateInteraction.un("translatestart", modifyInteractionFuncStart);
            translateInteraction.un("translateend", modifyInteractionFunc);
            drawPointInteraction.un("drawend", drawInteractionFunc);
            drawLineInteraction.un("drawend", drawInteractionFunc);
            drawPolygonInteraction.un("drawend", drawInteractionFunc);

            // Any tool other than shortest path must drop the stale shortest-path
            // click listener, otherwise it keeps hijacking SELECT/MODIFY clicks.
            if (type !== InteractionType.SHORTEST_PATH) {
                unregisterShortestPathListener();
            }

            switch (type) {
                case InteractionType.SELECT:
                    interaction = selectInteraction;
                    interaction.on("select", selectInteractionFunc);
                    break;
                case InteractionType.REMOVE:
                    interaction = selectInteraction;
                    interaction.on("select", removeInteractionFunc);
                    break;
                case InteractionType.MODIFY:
                    interaction = modifyInteraction;
                    interaction.on("modifystart", modifyInteractionFuncStart);
                    interaction.on("modifyend", modifyInteractionFunc);
                    break;
                case InteractionType.ADD_OBJECT:
                    interaction = drawPointInteraction;
                    if (target === "line") interaction = drawLineInteraction;
                    if (target === "polygon") interaction = drawPolygonInteraction;
                    interaction.on("drawend", drawInteractionFunc);
                    break;
                case InteractionType.TRANSLATE_OBJECT:
                    interaction = translateInteraction;
                    interaction.on("translatestart", modifyInteractionFuncStart);
                    interaction.on("translateend", modifyInteractionFunc);
                    break;
                case InteractionType.SPLIT_LINE:
                    interaction = splitInteraction;
                    map?.on("singleclick", splitLineInteractionFuncEnd);
                    map?.on("pointermove", splitLineInteractionFuncPointer);
                    break;
                case InteractionType.SHORTEST_PATH:
                    registerShortestPathListener();
                    return null;
                default:
                    return null;
            }
            if (interaction) interaction.set("type", type);
            return interaction;
        },
        [
            map,
            clickableLayer,
            clickableSource,
            selectInteraction,
            drawLineInteraction,
            drawPointInteraction,
            drawPolygonInteraction,
            modifyInteraction,
            splitInteraction,
            translateInteraction,
            selectInteractionFunc,
            removeInteractionFunc,
            modifyInteractionFunc,
            modifyInteractionFuncStart,
            drawInteractionFunc,
            splitLineInteractionFuncEnd,
            splitLineInteractionFuncPointer,
            registerShortestPathListener,
            unregisterShortestPathListener,
        ]
    );

    const handleClick = useCallback(
        (control: CustomControlItem) => {
            if (control.interaction !== InteractionType.SHORTEST_PATH) {
                clearShortestPathStart();
            }
            if (control.interaction === InteractionType.SEARCH) {
                if (mapWorkingLayer !== REPORTS_LAYER_TYPE) {
                    searchModal.open();
                }
            }
            if (control.interaction === InteractionType.REMOVE) {
                selectInteraction.clearSelection();
            }

            if (control.interaction === InteractionType.EXPORT_IMAGE) {
                exportMapModal.open();
                return;
            }
            if (control.interaction !== InteractionType.MODIFY && control.interaction !== InteractionType.TRANSLATE_OBJECT) {
                selectedObjects.forEach((feat) => {
                    feat.unset(FEATURE_TYPE_SELECTED_PROPERTY);
                });
            }

            if (clipboardFeature && control.interaction !== InteractionType.COPY_OBJECT) {
                if (registeredPasteHandlerRef.current) {
                    map?.un("singleclick", registeredPasteHandlerRef.current);
                    registeredPasteHandlerRef.current = null;
                }
                clipboardFeature = null;
            }

            if (control.interaction === InteractionType.COPY_OBJECT) {
                if (control?.id === clickedControl?.id) {
                    if (registeredPasteHandlerRef.current) {
                        map?.un("singleclick", registeredPasteHandlerRef.current);
                        registeredPasteHandlerRef.current = null;
                    }
                    clipboardFeature = null;
                    setSelectedObjects([]);
                    setClickedControl(null);
                } else {
                    removeInteractionFromMap(clickedControl?.interaction ?? null, map!);
                    const copyReady = copyInteractionFunc();
                    setClickedControl(copyReady ? control : null);
                }
                return;
            }

            if (control.interaction === InteractionType.SHORTEST_PATH && control?.id !== clickedControl?.id) {
                addAlertMessage(StatusMessage.info, t("shortest_path_select_start", { layers: shortestPathLayerNames.join(", ") }), 5000);
            }

            if (control?.id === clickedControl?.id) {
                setSelectedObjects([]);
                removeInteractionFromMap(control.interaction, map!);
                if (control.interaction === InteractionType.SHORTEST_PATH) {
                    unregisterShortestPathListener();
                }
                clearShortestPathStart();
            } else {
                removeInteractionFromMap(clickedControl?.interaction ?? null, map!);

                if (control.interaction === InteractionType.MODIFY) {
                    modifyFeatures.clear();
                    const featsToModify = selectedObjects.length > 0 ? selectedObjects : clickedMapFeature ? [clickedMapFeature] : [];
                    featsToModify.forEach((feat) => {
                        modifyFeatures.push(feat);
                    });
                    selectInteraction.setActive(false);
                }

                if (control.interaction === InteractionType.TRANSLATE_OBJECT && selectedObjects.length > 0) {
                    translateFeatures.clear();
                    selectedObjects.forEach((feat) => {
                        translateFeatures.push(feat);
                    });
                    selectInteraction.setActive(false);
                }

                const interaction = getInteractionByType(control.interaction, control.target);
                addInteractionToMap(interaction, map!);
            }
        },
        [
            map,
            mapWorkingLayer,
            clickedControl,
            clickedMapFeature,
            selectedObjects,
            selectInteraction,
            modifyFeatures,
            translateFeatures,
            searchModal,
            getInteractionByType,
            copyInteractionFunc,
            setSelectedObjects,
            setClickedControl,
            exportMapModal,
            clearShortestPathStart,
            addAlertMessage,
            shortestPathLayerNames,
            t,
            unregisterShortestPathListener,
        ]
    );

    const deleteSelectedObjects = useCallback(
        (features: Feature[]) => {
            if (!currentMapWorkingSource) return;
            features.forEach((feat) => {
                currentMapWorkingSource.removeFeature(feat);
                saveContribution(feat, ContributionType.DELETE, feat, mapWorkingLayer);
                feat.unset(FEATURE_TYPE_SELECTED_PROPERTY);
            });
            setSelectedObjects([]);
            setClickedMapFeature(null);
        },
        [currentMapWorkingSource, mapWorkingLayer, saveContribution, setSelectedObjects, setClickedMapFeature]
    );

    useEffect(() => {
        return () => {
            if (registeredPasteHandlerRef.current) {
                map?.un("singleclick", registeredPasteHandlerRef.current);
                registeredPasteHandlerRef.current = null;
            }
            unregisterShortestPathListener();
            clipboardFeature = null;
            clearShortestPathStart();
        };
    }, [map, clearShortestPathStart, unregisterShortestPathListener]);

    useEffect(() => {
        if (!map) return;

        const pasteHandler = (event: Event | BaseEvent) => {
            const coordinate = (event as BaseEvent & { coordinate?: Coordinate }).coordinate;
            if (!coordinate) return;
            pasteAtCoordinate(coordinate);
        };

        const copyHandler = (event: Event | BaseEvent) => {
            const feature = (event as BaseEvent & { feature?: Feature }).feature;
            if (!feature) return;

            if (registeredPasteHandlerRef.current) {
                map.un("singleclick", registeredPasteHandlerRef.current);
                registeredPasteHandlerRef.current = null;
            }

            clipboardFeature = feature.clone();

            const stablePasteHandler = (e: MapBrowserEvent) => {
                pasteInteractionFuncRef.current?.(e);
            };
            map.on("singleclick", stablePasteHandler);
            registeredPasteHandlerRef.current = stablePasteHandler;
        };

        // Add listeners to map for custom copy/paste
        // First param is type
        map.addEventListener("custom-paste", pasteHandler);
        map.addEventListener("custom-copy", copyHandler);

        return () => {
            map.removeEventListener("custom-paste", pasteHandler);
            map.removeEventListener("custom-copy", copyHandler);
        };
    }, [map, pasteAtCoordinate]);

    useEffect(() => {
        selectedObjects.forEach((feat) => {
            feat.set(FEATURE_TYPE_SELECTED_PROPERTY, true);
            feat.changed();
        });

        return () => {
            selectedObjects.forEach((feat) => {
                feat.unset(FEATURE_TYPE_SELECTED_PROPERTY);
                feat.changed();
            });
        };
    }, [selectedObjects]);

    useEffect(() => {
        if (clickedControl?.interaction !== InteractionType.SHORTEST_PATH) {
            clearShortestPathStart();
        }
    }, [clickedControl?.interaction, clearShortestPathStart]);

    return {
        selectInteractionFunc,
        dragInteractionFunc,
        removeInteractionFunc,
        modifyInteractionFunc,
        modifyInteractionFuncStart,
        drawInteractionFunc,
        copyInteractionFunc,
        shortestPathInteractionFunc,
        pasteInteractionFunc,
        splitLineInteractionFuncEnd,
        splitLineInteractionFuncPointer,
        getInteractionByType,
        handleClick,
        deleteSelectedObjects,
    };
};

export default useGetInteractionsFuncs;
