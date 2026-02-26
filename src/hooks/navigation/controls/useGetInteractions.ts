import { useCommunityStore, useMapStore } from "@/store";
import { Collection, Feature } from "ol";
import { platformModifierKeyOnly, click, shiftKeyOnly } from "ol/events/condition";
import { Draw, Modify, Select, Snap, Translate, DragBox } from "ol/interaction";
import VectorLayer from "ol/layer/Vector";
import WebGLVectorLayer from "ol/layer/WebGLVector";
import VectorSource from "ol/source/Vector";
import { useMemo } from "react";

const useGetInteractions = () => {
    const { map, mapWorkingLayer, clickedMapFeature } = useMapStore();
    const { communityLayers } = useCommunityStore();

    const clickableLayer = map
        ?.getAllLayers()
        .find((layer) => layer.get("name") === mapWorkingLayer && (layer instanceof VectorLayer || layer instanceof WebGLVectorLayer));
    const clickableSource = clickableLayer?.getSource() as VectorSource;

    const currentCommunityLayer = communityLayers?.find((layer) => layer?.geoservice?.layer === mapWorkingLayer);

    const snapto = currentCommunityLayer?.snapto?.split(",").map((l) => Number(l));
    const snapToLayers = communityLayers?.filter((layer) => snapto?.includes(layer.geoservice.id)).map((layer) => layer.geoservice.layer);

    const snapToFeatures = map
        ?.getAllLayers()
        .filter((layer) => snapToLayers?.includes(layer.get("name")) && (layer instanceof VectorLayer || layer instanceof WebGLVectorLayer))
        .map((l) => (l.getSource() as VectorSource).getFeatures())
        .flat();

    const selectInteraction = useMemo(
        () =>
            new Select({
                condition: click,
                toggleCondition: platformModifierKeyOnly,
                addCondition: platformModifierKeyOnly,
                removeCondition: platformModifierKeyOnly,
                features: new Collection(clickableSource?.getFeatures() ?? []),
                multi: true,
                filter: (feat) => clickableSource.hasFeature(feat),
            }),
        [clickableSource]
    );

    const dragInteraction = useMemo(() => {
        const drag = new DragBox({ condition: shiftKeyOnly });
        drag.set("disablesTooltip", true);
        return drag;
    }, []);

    const modifyFeatures = useMemo(() => selectInteraction.getFeatures(), [selectInteraction]);

    const modifyInteraction = useMemo(() => {
        const modify = new Modify({ features: modifyFeatures });
        modify.set("disablesTooltip", true);
        return modify;
    }, [modifyFeatures]);

    const drawPointInteraction = useMemo(() => {
        const draw = new Draw({ type: "Point" });
        draw.set("disablesTooltip", true);
        draw.set("disableSelect", true);
        return draw;
    }, []);

    const drawLineInteraction = useMemo(() => {
        const draw = new Draw({ type: "LineString" });
        draw.set("disablesTooltip", true);
        return draw;
    }, []);

    const drawPolygonInteraction = useMemo(() => {
        const draw = new Draw({ type: "Polygon" });
        draw.set("disablesTooltip", true);
        return draw;
    }, []);

    const translateFeatures = useMemo(() => new Collection<Feature>(clickedMapFeature ? [clickedMapFeature] : []), [clickedMapFeature]);

    const translateInteraction = useMemo(() => {
        const translate = new Translate({ features: translateFeatures });
        translate.set("disablesTooltip", true);
        return translate;
    }, [translateFeatures]);

    const splitInteraction = useMemo(() => {
        const split = new Modify({
            features: new Collection(clickableSource?.getFeatures() ?? []),
            condition: click,
            pixelTolerance: 10,
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
