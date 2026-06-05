import VectorSource from "ol/source/Vector";
import { SelectEvent } from "ol/interaction/Select";
import { Feature, MapBrowserEvent } from "ol";
import VectorLayer from "ol/layer/Vector";
import WebGLVectorLayer from "ol/layer/WebGLVector";
import { ContributionType, CustomInteraction, InteractionsProps } from "@/constants/contributions/types";
import { ModifyEvent } from "ol/interaction/Modify";
import { DrawEvent } from "ol/interaction/Draw";
import { DragPan } from "ol/interaction";
import {
    FEATURE_TYPE_DATA_PROPERTY,
    FEATURE_TYPE_GEOSERVICE_PROPERTY,
    FEATURE_TYPE_NEW_PROPERTY,
    FEATURE_TYPE_SELECTED_PROPERTY,
    POINTER_HIT_DETECTION_TOLERENCE,
} from "@/constants";
import { addFeatureProperties, addInteractionToMap, isPointOnSegment, removeInteractionFromMap, setFeatNewCoords } from "@/constants/contributions/utils";
import { GeometryFeatueParams } from "@/constants/reports/types";
import { Coordinate } from "ol/coordinate";
import { useCommunityStore, useContributionStore, useMapStore, useModalStore } from "@/store";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { CustomControlItem, GeoserviceFeatureTypeProp, InteractionType, StatusMessage } from "@/constants/communities/types";
import { REPORTS_LAYER_TYPE } from "@/constants/reports/utils";
import { Geometry, LineString, SimpleGeometry } from "ol/geom";
import { FeatureTypeMode } from "@/constants/contributions/types";
import { useTranslation } from "@/i18n";

let initialFeat: Feature | null = null;
let lastPointedFeat: Feature | null = null;
let clipboardFeature: Feature | null = null;

const coordKey = (coord: Coordinate) => `${coord[0].toFixed(6)}|${coord[1].toFixed(6)}`;

const addEdge = (adjacency: Map<string, Map<string, number>>, fromKey: string, toKey: string, weight: number) => {
    if (!adjacency.has(fromKey)) {
        adjacency.set(fromKey, new Map());
    }
    const neighbors = adjacency.get(fromKey)!;
    const existing = neighbors.get(toKey);
    if (existing === undefined || weight < existing) {
        neighbors.set(toKey, weight);
    }
};

const collectLineCoordinates = (geometry: Geometry): Coordinate[][] => {
    const type = geometry.getType();
    if (type === "LineString") {
        return [(geometry as LineString).getCoordinates()];
    }
    return [];
};

const buildGraphFromFeatures = (features: Feature[]) => {
    const adjacency = new Map<string, Map<string, number>>();
    const nodeCoords = new Map<string, Coordinate>();
    const featureNodes = new Map<Feature, string[]>();

    features.forEach((feature) => {
        const geometry = feature.getGeometry() as Geometry | undefined;
        if (!geometry) return;

        const lineGroups = collectLineCoordinates(geometry);
        if (!lineGroups.length) return;

        const nodeKeys: string[] = [];

        lineGroups.forEach((coords) => {
            for (let i = 0; i < coords.length; i++) {
                const coord = coords[i];
                const key = coordKey(coord);
                if (!nodeCoords.has(key)) {
                    nodeCoords.set(key, coord);
                }
                nodeKeys.push(key);

                if (i === coords.length - 1) continue;
                const nextCoord = coords[i + 1];
                const nextKey = coordKey(nextCoord);
                if (!nodeCoords.has(nextKey)) {
                    nodeCoords.set(nextKey, nextCoord);
                }
                const weight = Math.hypot(nextCoord[0] - coord[0], nextCoord[1] - coord[1]);
                addEdge(adjacency, key, nextKey, weight);
                addEdge(adjacency, nextKey, key, weight);
            }
        });

        featureNodes.set(feature, nodeKeys);
    });

    return { adjacency, nodeCoords, featureNodes };
};

const getClosestNodeKey = (nodeKeys: string[] | undefined, nodeCoords: Map<string, Coordinate>, reference: Coordinate) => {
    if (!nodeKeys || nodeKeys.length === 0) return null;
    let closestKey: string | null = null;
    let minDistance = Number.POSITIVE_INFINITY;

    nodeKeys.forEach((key) => {
        const coord = nodeCoords.get(key);
        if (!coord) return;
        const distance = Math.hypot(reference[0] - coord[0], reference[1] - coord[1]);
        if (distance < minDistance) {
            minDistance = distance;
            closestKey = key;
        }
    });

    return closestKey;
};

const computeShortestPath = (adjacency: Map<string, Map<string, number>>, nodeCoords: Map<string, Coordinate>, startKey: string, endKey: string) => {
    const distances = new Map<string, number>();
    const previous = new Map<string, string | null>();
    const unvisited = new Set<string>();

    adjacency.forEach((_value, key) => {
        distances.set(key, Number.POSITIVE_INFINITY);
        previous.set(key, null);
        unvisited.add(key);
    });

    if (!distances.has(startKey) || !distances.has(endKey)) return null;

    distances.set(startKey, 0);

    while (unvisited.size > 0) {
        let currentKey: string | null = null;
        let currentDistance = Number.POSITIVE_INFINITY;

        unvisited.forEach((key) => {
            const dist = distances.get(key) ?? Number.POSITIVE_INFINITY;
            if (dist < currentDistance) {
                currentDistance = dist;
                currentKey = key;
            }
        });

        if (!currentKey || currentDistance === Number.POSITIVE_INFINITY) break;
        if (currentKey === endKey) break;

        unvisited.delete(currentKey);

        const neighbors = adjacency.get(currentKey);
        if (!neighbors) continue;

        neighbors.forEach((weight, neighborKey) => {
            if (!unvisited.has(neighborKey)) return;
            const nextDistance = currentDistance + weight;
            if (nextDistance < (distances.get(neighborKey) ?? Number.POSITIVE_INFINITY)) {
                distances.set(neighborKey, nextDistance);
                previous.set(neighborKey, currentKey);
            }
        });
    }

    if ((distances.get(endKey) ?? Number.POSITIVE_INFINITY) === Number.POSITIVE_INFINITY) return null;

    const pathKeys: string[] = [];
    let current: string | null = endKey;
    while (current) {
        pathKeys.unshift(current);
        current = previous.get(current) ?? null;
    }

    if (pathKeys.length === 0) return null;
    return pathKeys.map((key) => nodeCoords.get(key)).filter(Boolean) as Coordinate[];
};

const useGetInteractionsFuncs = (props: InteractionsProps) => {
    const { map, mapWorkingLayer, clickedControl, clickedMapFeature, setClickedControl, setClickedMapFeature } = useMapStore();
    const { contributions, selectedObjects, saveContribution, setIsModifying, setSelectedObjects, setFeatureTypeMode } = useContributionStore();
    const { searchModal, exportMapModal } = useModalStore();
    const { communityLayers, addAlertMessage } = useCommunityStore();

    const { t } = useTranslation({ useGetInteractionsFuncs });

    const currentCommunityLayer = useMemo(() => communityLayers?.find((l) => l?.geoservice?.layer === mapWorkingLayer), [communityLayers, mapWorkingLayer]);

    const snaptoIds = useMemo(
        () =>
            currentCommunityLayer?.snapto
                ?.split(",")
                .map((value) => Number(value.trim()))
                .filter((value) => !Number.isNaN(value)) ?? [],
        [currentCommunityLayer?.snapto]
    );

    const isShortestPathLayer = currentCommunityLayer?.geoservice.featureType === GeoserviceFeatureTypeProp.LINE;

    const isShortestPathReady = Boolean(isShortestPathLayer && snaptoIds.includes(currentCommunityLayer?.geoservice.id ?? -1));

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

    const registeredPasteHandlerRef = useRef<((e: MapBrowserEvent) => void) | null>(null);
    const shortestPathStartRef = useRef<{ feature: Feature; coordinate: Coordinate } | null>(null);

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
            const features = e.features.getArray();
            const feat = features[0];
            if (!feat || !initialFeat) {
                initialFeat = null;
                selectInteraction.setActive(true);
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
            selectInteraction.setActive(true);
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

    const copyInteractionFunc = useCallback((): boolean => {
        const features = selectInteraction.getFeatures().getArray();
        const sourceFeature = features[0] ?? clickedMapFeature;

        if (!sourceFeature) return false;

        if (registeredPasteHandlerRef.current) {
            map?.un("singleclick", registeredPasteHandlerRef.current);
            registeredPasteHandlerRef.current = null;
        }
        clipboardFeature = sourceFeature.clone();
        map?.on("singleclick", pasteInteractionFunc);
        registeredPasteHandlerRef.current = pasteInteractionFunc;
        return true;
    }, [selectInteraction, clickedMapFeature, map, pasteInteractionFunc]);

    const clearShortestPathStart = useCallback(() => {
        if (shortestPathStartRef.current?.feature) {
            shortestPathStartRef.current.feature.unset(FEATURE_TYPE_SELECTED_PROPERTY);
            shortestPathStartRef.current.feature.changed();
        }
        shortestPathStartRef.current = null;
    }, []);

    const shortestPathInteractionFunc = useCallback(
        (e: MapBrowserEvent) => {
            if (!map || !clickableSource || mapWorkingLayer === REPORTS_LAYER_TYPE) return;

            if (!isShortestPathLayer) {
                clearShortestPathStart();
                return;
            }

            if (!isShortestPathReady) {
                addAlertMessage(StatusMessage.warning, t("shortest_path_not_ready"), 2000);
                clearShortestPathStart();
                return;
            }

            const featuresAtPixel = map.getFeaturesAtPixel(e.pixel, {
                layerFilter: (layer) => layer.get("name") === mapWorkingLayer,
                hitTolerance: POINTER_HIT_DETECTION_TOLERENCE,
            });

            const targetFeature = (featuresAtPixel?.[0] as Feature | undefined) ?? null;
            if (!targetFeature) return;

            const featureLayer = targetFeature.get(FEATURE_TYPE_GEOSERVICE_PROPERTY)?.layer;
            if (featureLayer && featureLayer !== mapWorkingLayer) return;

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

            const allFeatures = clickableSource.getFeatures();
            const { adjacency, nodeCoords, featureNodes } = buildGraphFromFeatures(allFeatures);

            const startKey = getClosestNodeKey(featureNodes.get(startFeature), nodeCoords, shortestPathStartRef.current.coordinate);
            const endKey = getClosestNodeKey(featureNodes.get(targetFeature), nodeCoords, e.coordinate);

            if (!startKey || !endKey) {
                addAlertMessage(StatusMessage.error, t("shortest_path_no_path"), 2000);
                clearShortestPathStart();
                return;
            }

            const pathCoords = computeShortestPath(adjacency, nodeCoords, startKey, endKey);
            if (!pathCoords || pathCoords.length < 2) {
                addAlertMessage(StatusMessage.error, t("shortest_path_no_path"), 2000);
                clearShortestPathStart();
                return;
            }

            if (!currentMapWorkingSource) {
                clearShortestPathStart();
                return;
            }

            const geoservice = currentCommunityLayer?.geoservice;
            if (!geoservice) {
                clearShortestPathStart();
                return;
            }

            if (geoservice.featureType !== GeoserviceFeatureTypeProp.LINE) {
                addAlertMessage(StatusMessage.warning, t("shortest_path_not_supported"), 2000);
                clearShortestPathStart();
                return;
            }

            const geometryNameColumn = geoservice.columns.find((col) => col.name === geoservice.geometryName);
            const newFeature = new Feature({ geometry: new LineString(pathCoords) });

            addFeatureProperties(
                newFeature,
                geoservice,
                contributions.filter((contr) => contr.type === ContributionType.CREATE)
            );
            newFeature.set(FEATURE_TYPE_NEW_PROPERTY, true);
            if (geometryNameColumn?.is3d) setFeatNewCoords(newFeature);

            currentMapWorkingSource.addFeature(newFeature);
            saveContribution(newFeature, ContributionType.CREATE, null, mapWorkingLayer);
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
            isShortestPathLayer,
            isShortestPathReady,
            addAlertMessage,
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
                    map?.on("singleclick", shortestPathInteractionFunc);
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
            shortestPathInteractionFunc,
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
                addAlertMessage(StatusMessage.info, t("shortest_path_select_start"), 5000);
            }

            if (control?.id === clickedControl?.id) {
                setSelectedObjects([]);
                removeInteractionFromMap(control.interaction, map!);
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
            t,
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
            clipboardFeature = null;
            clearShortestPathStart();
        };
    }, [map, clearShortestPathStart]);

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
