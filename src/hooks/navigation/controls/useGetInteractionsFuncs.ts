import VectorSource from "ol/source/Vector";
import { SelectEvent } from "ol/interaction/Select";
import { Feature, MapBrowserEvent } from "ol";
import VectorLayer from "ol/layer/Vector";
import WebGLVectorLayer from "ol/layer/WebGLVector";
import { ContributionType, CustomInteraction } from "@/constants/contributions/types";
import { ModifyEvent } from "ol/interaction/Modify";
import { DrawEvent } from "ol/interaction/Draw";
import { FEATURE_TYPE_DATA_PROPERTY, FEATURE_TYPE_NEW_PROPERTY, FEATURE_TYPE_SELECTED_PROPERTY } from "@/constants";
import { addFeatureProperties, addInteractionToMap, removeInteractionFromMap, setFeatNewCoords } from "@/constants/contributions/utils";
import { GeometryFeatueParams } from "@/constants/reports/types";
import { Coordinate } from "ol/coordinate";
import { useCommunityStore, useContributionStore, useMapStore, useModalStore } from "@/store";
import { useCallback, useMemo, useState } from "react";
import { CustomControlItem, InteractionType } from "@/constants/communities/types";
import useGetInteractions from "./useGetInteractions";

let initialFeat: Feature | null = null;
let lastPointedFeat: Feature | null = null;

const useGetInteractionsFuncs = () => {
    const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([]);
    const { map, mapWorkingLayer, clickedControl, setClickedControl, setClickedMapFeature } = useMapStore();
    const { contributions, saveContribution, setIsModifying } = useContributionStore();
    const { confirmCopyModal } = useModalStore();
    const { communityLayers } = useCommunityStore();

    const currentCommunityLayer = useMemo(() => communityLayers?.find((l) => l.geoservice.layer === mapWorkingLayer), [communityLayers, mapWorkingLayer]);

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

    const { selectInteraction, modifyInteraction, drawPointInteraction, drawLineInteraction, drawPolygonInteraction, translateInteraction, splitInteraction } =
        useGetInteractions();

    const selectInteractionFunc = useCallback(
        (e: SelectEvent) => {
            const features = e.selected;
            features.forEach((feat) => {
                feat.set(FEATURE_TYPE_SELECTED_PROPERTY, true);
            });
            selectedFeatures.forEach((feat) => {
                feat.unset(FEATURE_TYPE_SELECTED_PROPERTY);
            });
            setSelectedFeatures(features);
        },
        [selectedFeatures]
    );

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
        },
        [mapWorkingLayer, saveContribution, setIsModifying]
    );

    const modifyInteractionFuncStart = useCallback(
        (e: ModifyEvent) => {
            setIsModifying(true);
            const features = e.features.getArray();
            const feat = features[0];
            initialFeat = feat.clone();
            saveContribution(feat, ContributionType.MODIFY, initialFeat, mapWorkingLayer);
        },
        [mapWorkingLayer, saveContribution, setIsModifying]
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

    const splitLineInteractionFuncEnd = useCallback(
        (e: MapBrowserEvent) => {
            const features = map?.getFeaturesAtPixel(e.pixel, {
                layerFilter: (layer) => {
                    return layer.get("name") === mapWorkingLayer;
                },
                hitTolerance: 2,
            });

            if (features?.length) {
                const originalFeat = features[0] as Feature;
                const initialFeat = originalFeat.clone();
                const originalFeatGeometry = originalFeat.getGeometry() as GeometryFeatueParams;
                const createdFeat = originalFeat.clone();
                const createdFeatGeometry = createdFeat.getGeometry() as GeometryFeatueParams;

                const originalFeatGeometryCoords = originalFeatGeometry?.getCoordinates();
                const originalStartCoords = originalFeatGeometryCoords![0] as Coordinate;
                const originalEndCoords = originalFeatGeometryCoords![1] as Coordinate;

                const newCoords = originalFeatGeometry?.getClosestPoint(e.coordinate) as Coordinate;

                console.log(newCoords, originalFeatGeometryCoords);
                const newCoordsOriginal = [originalStartCoords, newCoords];
                const newCoordsCreated = [newCoords, originalEndCoords];

                clickableSource.removeFeature(originalFeat);

                originalFeatGeometry?.setCoordinates(newCoordsOriginal);
                createdFeatGeometry?.setCoordinates(newCoordsCreated);

                createdFeat.set(FEATURE_TYPE_DATA_PROPERTY, {
                    ...createdFeat.get(FEATURE_TYPE_DATA_PROPERTY),
                    [`${currentCommunityLayer?.geoservice.idName}`]: contributions.filter((contr) => contr.type === ContributionType.CREATE).length + 1,
                });

                createdFeat.unset(FEATURE_TYPE_SELECTED_PROPERTY);

                clickableSource.addFeatures([originalFeat, createdFeat]);

                saveContribution(originalFeat, ContributionType.MODIFY, initialFeat, mapWorkingLayer);
                saveContribution(createdFeat, ContributionType.CREATE, null, mapWorkingLayer);

                setClickedMapFeature(originalFeat);
                setClickedControl(null);
            }
        },
        [map, mapWorkingLayer, clickableSource, contributions, currentCommunityLayer?.geoservice, saveContribution, setClickedMapFeature, setClickedControl]
    );

    const splitLineInteractionFuncPointer = useCallback(
        (e: MapBrowserEvent) => {
            const features = map?.getFeaturesAtPixel(e.pixel, {
                layerFilter: (layer) => {
                    return layer.get("name") === mapWorkingLayer;
                },
                hitTolerance: 5,
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
            if (control.interaction === InteractionType.REMOVE) {
                selectInteraction.getFeatures().clear();
            }
            if (control.interaction !== InteractionType.MODIFY) {
                selectedFeatures.forEach((feat) => {
                    feat.unset(FEATURE_TYPE_SELECTED_PROPERTY);
                });
            }
            if (control.interaction === InteractionType.COPY_OBJECT) {
                copyInteractionFunc();
            }
            if (control?.id === clickedControl?.id) {
                setSelectedFeatures([]);
                removeInteractionFromMap(control.interaction, map!);
            } else {
                removeInteractionFromMap(clickedControl?.interaction ?? null, map!);
                const interaction = getInteractionByType(control.interaction, control.target);
                addInteractionToMap(interaction, map!);
            }
        },
        [map, clickedControl, selectedFeatures, selectInteraction, getInteractionByType, copyInteractionFunc]
    );

    return {
        selectInteractionFunc,
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
