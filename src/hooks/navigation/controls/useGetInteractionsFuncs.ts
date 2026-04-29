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
import { useCommunityStore, useContributionStore, useMapStore, useModalStore } from "@/store";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { CustomControlItem, InteractionType } from "@/constants/communities/types";
import { REPORTS_LAYER_TYPE } from "@/constants/reports/utils";
import { SimpleGeometry } from "ol/geom";

let initialFeat: Feature | null = null;
let lastPointedFeat: Feature | null = null;
let clipboardFeature: Feature | null = null;

const useGetInteractionsFuncs = (props: InteractionsProps) => {
    const { map, mapWorkingLayer, clickedControl, clickedMapFeature, setClickedControl, setClickedMapFeature } = useMapStore();
    const { contributions, selectedObjects, saveContribution, setIsModifying, setSelectedObjects } = useContributionStore();
    const { searchModal, exportMapModal } = useModalStore();
    const { communityLayers } = useCommunityStore();

    const currentCommunityLayer = useMemo(() => communityLayers?.find((l) => l?.geoservice?.layer === mapWorkingLayer), [communityLayers, mapWorkingLayer]);

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
                default:
                    interaction = null;
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
        ]
    );

    const handleClick = useCallback(
        (control: CustomControlItem) => {
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

            if (control?.id === clickedControl?.id) {
                setSelectedObjects([]);
                removeInteractionFromMap(control.interaction, map!);
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
            pasteInteractionFunc,
            setSelectedObjects,
            setClickedControl,
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
        };
    }, [map]);

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

    return {
        selectInteractionFunc,
        dragInteractionFunc,
        removeInteractionFunc,
        modifyInteractionFunc,
        modifyInteractionFuncStart,
        drawInteractionFunc,
        copyInteractionFunc,
        pasteInteractionFunc,
        splitLineInteractionFuncEnd,
        splitLineInteractionFuncPointer,
        getInteractionByType,
        handleClick,
        deleteSelectedObjects,
    };
};

export default useGetInteractionsFuncs;
