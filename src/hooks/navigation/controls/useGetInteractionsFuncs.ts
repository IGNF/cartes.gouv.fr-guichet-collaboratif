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
import { useCallback, useEffect, useMemo } from "react";
import { CustomControlItem, InteractionType } from "@/constants/communities/types";
import { REPORTS_LAYER_TYPE } from "@/constants/reports/utils";

let initialFeat: Feature | null = null;
let lastPointedFeat: Feature | null = null;

const useGetInteractionsFuncs = (props: InteractionsProps) => {
    const { map, mapWorkingLayer, clickedControl, setClickedControl, setClickedMapFeature } = useMapStore();
    const { contributions, selectedObjects, saveContribution, setIsModifying, setSelectedObjects } = useContributionStore();
    const { confirmCopyModal, searchModal, exportMapModal } = useModalStore();
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
        const selectInteractionFeatures = selectInteraction.getFeatures();
        const featuresAtExtent = clickableSource?.getFeaturesInExtent(extent);

        featuresAtExtent.forEach((feat) => {
            if (selectInteractionFeatures.getArray().includes(feat)) return;
            selectInteractionFeatures.push(feat);
        });
        const newSelectedObjects = selectInteractionFeatures.getArray();
        setSelectedObjects(newSelectedObjects);
        if (newSelectedObjects.length > 0) {
            setClickedMapFeature(newSelectedObjects[0]);
        }
    }, [clickableSource, dragInteraction, selectInteraction, setClickedMapFeature, setSelectedObjects]);

    const removeInteractionFunc = useCallback(
        (e: SelectEvent) => {
            selectInteraction.getFeatures().clear();
            const features = e.selected;
            const feat = features[0];
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
            saveContribution(feat, ContributionType.MODIFY, initialFeat, mapWorkingLayer);
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
            initialFeat = feat.clone();
            saveContribution(feat, ContributionType.MODIFY, initialFeat, mapWorkingLayer);

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
        [mapWorkingLayer, saveContribution, setIsModifying, clickedControl, map]
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
            }
        },
        [currentMapWorkingSource, currentCommunityLayer?.geoservice, contributions, mapWorkingLayer, saveContribution]
    );

    const copyInteractionFunc = useCallback(() => {
        confirmCopyModal.open();
    }, [confirmCopyModal]);

    const splitLineInteractionFuncPointer = useCallback(
        (e: MapBrowserEvent) => {
            const features = map?.getFeaturesAtPixel(e.pixel, {
                layerFilter: (layer) => {
                    return layer.get("name") === mapWorkingLayer;
                },
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
                layerFilter: (layer) => {
                    return layer.get("name") === mapWorkingLayer;
                },
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
                selectInteraction.getFeatures().clear();
            }
            if (control.interaction !== InteractionType.MODIFY && control.interaction !== InteractionType.TRANSLATE_OBJECT) {
                selectedObjects.forEach((feat) => {
                    feat.unset(FEATURE_TYPE_SELECTED_PROPERTY);
                });
            }
            if (control.interaction === InteractionType.COPY_OBJECT) {
                copyInteractionFunc();
            }
            if (control.interaction === InteractionType.EXPORT_IMAGE) {
                exportMapModal.open();
                return;
            }
            if (control?.id === clickedControl?.id) {
                setSelectedObjects([]);
                removeInteractionFromMap(control.interaction, map!);
            } else {
                removeInteractionFromMap(clickedControl?.interaction ?? null, map!);

                if (control.interaction === InteractionType.MODIFY && selectedObjects.length > 0) {
                    modifyFeatures.clear();
                    selectedObjects.forEach((feat) => {
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
            selectedObjects,
            selectInteraction,
            modifyFeatures,
            translateFeatures,
            searchModal,
            getInteractionByType,
            copyInteractionFunc,
            setSelectedObjects,
            exportMapModal,
        ]
    );

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
        splitLineInteractionFuncEnd,
        splitLineInteractionFuncPointer,
        getInteractionByType,
        handleClick,
    };
};

export default useGetInteractionsFuncs;
