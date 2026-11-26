import { useCommunityStore, useMapStore } from "@/store";
import { editingGeometryStyle, getEditingOverlayStyle, isDefaultLayerStyle } from "@/constants/styles";
import { EDITING_ORIGINAL_FEATURE_PROPERTY, FEATURE_TYPE_EDITING_PROPERTY, POINTER_HIT_DETECTION_TOLERENCE } from "@/constants";
import { getEditedFeature } from "@/constants/contributions/utils";
import { InteractionType } from "@/constants/communities/types";
import { getNearestFeatureAtPixel } from "@/constants/navigation/hitDetection";
import { Collection, Feature } from "ol";
import { platformModifierKeyOnly, click, shiftKeyOnly } from "ol/events/condition";
import { Draw, Modify, Select, Snap, Translate, DragBox } from "ol/interaction";
import { ModifyEvent } from "ol/interaction/Modify";
import VectorLayer from "ol/layer/Vector";
import WebGLVectorLayer from "ol/layer/WebGLVector";
import VectorSource from "ol/source/Vector";
import { useEffect, useMemo } from "react";

const useGetInteractions = () => {
    const { map, mapWorkingLayer, clickedMapFeature, clickedControl, featureTypeSelectedStyle } = useMapStore();
    const { communityLayers } = useCommunityStore();

    const clickableLayer = map
        ?.getAllLayers()
        .find((layer) => layer.get("name") === mapWorkingLayer && (layer instanceof VectorLayer || layer instanceof WebGLVectorLayer));
    const clickableSource = clickableLayer?.getSource() as VectorSource;

    const currentCommunityLayer = communityLayers?.find((layer) => layer?.geoservice?.layer === mapWorkingLayer);

    const snapto = useMemo(
        () =>
            currentCommunityLayer?.snapto
                ?.split(",")
                .map((value) => Number(value.trim()))
                .filter((value) => !Number.isNaN(value)),
        [currentCommunityLayer?.snapto]
    );

    const snapCandidates = useMemo(() => communityLayers?.filter((layer) => snapto?.includes(layer.geoservice.id)) ?? [], [communityLayers, snapto]);
    const snapTargets = useMemo(() => snapCandidates.filter((layer) => layer.type !== "geoservice"), [snapCandidates]);

    const snapToLayers = useMemo(() => snapTargets.map((layer) => layer.geoservice.layer), [snapTargets]);

    const snapToFeatures = useMemo(
        () =>
            map
                ?.getAllLayers()
                .filter((layer) => snapToLayers?.includes(layer.get("name")) && (layer instanceof VectorLayer || layer instanceof WebGLVectorLayer))
                .map((l) => (l.getSource() as VectorSource).getFeatures())
                .flat() ?? [],

        [map, snapToLayers]
    );

    const selectInteraction = useMemo(
        () =>
            new Select({
                condition: (evt) => {
                    if (!click(evt)) return false;
                    const hit = getNearestFeatureAtPixel(evt.map, evt.pixel, (layer) => layer.getSource() === clickableSource);
                    if (hit) evt.pixel = hit.pixel;
                    return true;
                },
                toggleCondition: platformModifierKeyOnly,
                addCondition: platformModifierKeyOnly,
                removeCondition: platformModifierKeyOnly,
                multi: true,
                filter: (feat) => clickableSource?.hasFeature(feat) ?? false,
            }),
        [clickableSource]
    );

    const dragInteraction = useMemo(() => {
        const drag = new DragBox({ condition: shiftKeyOnly });
        drag.set("disablesTooltip", true);
        return drag;
    }, []);

    const modifyFeatures = useMemo(() => selectInteraction.getFeatures(), [selectInteraction]);

    const editingFeatures = useMemo(() => new Collection<Feature>(), []);

    const editingLayer = useMemo(() => {
        const layer = new VectorLayer({
            source: new VectorSource({ features: editingFeatures, wrapX: false }),
            updateWhileAnimating: true,
            updateWhileInteracting: true,
        });
        layer.setZIndex(1000);
        layer.set("name", "editing-geometry-overlay");
        return layer;
    }, [editingFeatures]);

    const isDefaultStyle = isDefaultLayerStyle(currentCommunityLayer?.geoservice, featureTypeSelectedStyle);

    useEffect(() => {
        editingLayer.setStyle(getEditingOverlayStyle(isDefaultStyle));
    }, [editingLayer, isDefaultStyle]);

    useEffect(() => {
        if (!map || clickedControl?.interaction !== InteractionType.MODIFY) return;

        const proxies = new Map<Feature, Feature>();

        // Keep the original features in case of refused modifications (outside bbox for exemple)
        const onOriginalChange = (e: { target: unknown }) => {
            const original = e.target as Feature;
            proxies.get(original)?.setGeometry(original.getGeometry()?.clone());
            original.set(FEATURE_TYPE_EDITING_PROPERTY, 1);
        };

        const releaseOriginals = () => {
            proxies.forEach((_, original) => {
                original.un("change", onOriginalChange);
                original.unset(FEATURE_TYPE_EDITING_PROPERTY);
            });
            proxies.clear();
        };

        const syncProxies = () => {
            releaseOriginals();
            const newProxies = modifyFeatures.getArray().map((original) => {
                const proxy = new Feature(original.getGeometry()?.clone());
                proxy.set(EDITING_ORIGINAL_FEATURE_PROPERTY, original);
                proxies.set(original, proxy);
                original.set(FEATURE_TYPE_EDITING_PROPERTY, 1);
                original.on("change", onOriginalChange);
                return proxy;
            });
            editingFeatures.clear();
            editingFeatures.extend(newProxies);
        };

        syncProxies();
        modifyFeatures.on(["add", "remove"], syncProxies);
        // Unmanaged layer: not listed in the layer switcher
        editingLayer.setMap(map);

        return () => {
            modifyFeatures.un(["add", "remove"], syncProxies);
            releaseOriginals();
            editingFeatures.clear();
            editingLayer.setMap(null);
        };
    }, [clickedControl?.interaction, editingFeatures, editingLayer, map, modifyFeatures]);

    const modifyInteraction = useMemo(() => {
        const modify = new Modify({ features: editingFeatures });
        modify.set("disablesTooltip", true);
        modify.on("modifyend", (e: ModifyEvent) => {
            e.features.forEach((proxy) => {
                const original = getEditedFeature(proxy as Feature);
                if (original !== proxy) original.setGeometry((proxy as Feature).getGeometry()?.clone());
            });
        });
        return modify;
    }, [editingFeatures]);

    const isEventInsideMapViewport = useMemo(
        () => (evt: { originalEvent?: Event }) => {
            const viewport = map?.getViewport();
            if (!viewport || !evt?.originalEvent) return false;
            const target = evt.originalEvent.target;
            return target instanceof Node ? viewport.contains(target) : false;
        },
        [map]
    );

    const drawPointInteraction = useMemo(() => {
        const draw = new Draw({ type: "Point", condition: isEventInsideMapViewport, freehandCondition: () => false });
        draw.set("disablesTooltip", true);
        draw.set("disableSelect", true);
        return draw;
    }, [isEventInsideMapViewport]);

    const drawLineInteraction = useMemo(() => {
        const draw = new Draw({
            type: "LineString",
            condition: isEventInsideMapViewport,
            freehandCondition: () => false,
            style: editingGeometryStyle,
        });
        draw.set("disablesTooltip", true);
        return draw;
    }, [isEventInsideMapViewport]);

    const drawPolygonInteraction = useMemo(() => {
        const draw = new Draw({
            type: "Polygon",
            condition: isEventInsideMapViewport,
            freehandCondition: () => false,
            style: editingGeometryStyle,
        });
        draw.set("disablesTooltip", true);
        return draw;
    }, [isEventInsideMapViewport]);

    const translateFeatures = useMemo(() => new Collection<Feature>(clickedMapFeature ? [clickedMapFeature] : []), [clickedMapFeature]);

    const translateInteraction = useMemo(() => {
        const translate = new Translate({ features: translateFeatures });
        translate.set("disablesTooltip", true);
        return translate;
    }, [translateFeatures]);

    const splitInteraction = useMemo(() => {
        const split = new Modify({
            ...(clickableSource ? { source: clickableSource } : { features: new Collection<Feature>() }),
            condition: click,
            pixelTolerance: POINTER_HIT_DETECTION_TOLERENCE,
        });
        split.set("disablesTooltip", true);
        return split;
    }, [clickableSource]);

    const snapInteraction = useMemo(
        () => new Snap({ source: clickableSource, features: new Collection(snapToFeatures), intersection: true }),
        [clickableSource, snapToFeatures]
    );

    return {
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
        snapInteraction,
    };
};

export default useGetInteractions;
