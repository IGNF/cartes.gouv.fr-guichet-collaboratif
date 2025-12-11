import { useCommunityStore, useMapStore } from "@/store";
import { Collection } from "ol";
import { click, singleClick } from "ol/events/condition";
import { Draw, Modify, Select, Snap, Translate } from "ol/interaction";
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

    const currentCommunityLayer = communityLayers?.find((layer) => layer.geoservice.layer === mapWorkingLayer);

    const snapto = currentCommunityLayer?.snapto?.split(",").map((l) => Number(l));
    const snapToLayers = communityLayers?.filter((layer) => snapto?.includes(layer.geoservice.id)).map((layer) => layer.geoservice.layer);

    const snapToFeatures = map
        ?.getAllLayers()
        .filter((layer) => snapToLayers?.includes(layer.get("name")) && (layer instanceof VectorLayer || layer instanceof WebGLVectorLayer))
        .map((l) => (l.getSource() as VectorSource).getFeatures())
        .flat();

    const selectInteraction = useMemo(
        () => new Select({ condition: click, features: new Collection(clickableSource?.getFeatures() ?? []), multi: true }),
        [clickableSource]
    );

    const modifyInteraction = useMemo(() => new Modify({ features: selectInteraction.getFeatures() }), [selectInteraction]);
    const drawPointInteraction = useMemo(() => new Draw({ type: "Point" }), []);
    const drawLineInteraction = useMemo(() => new Draw({ type: "LineString" }), []);
    const drawPolygonInteraction = useMemo(() => new Draw({ type: "Polygon" }), []);
    const translateInteraction = useMemo(() => new Translate({ features: new Collection(clickedMapFeature ? [clickedMapFeature] : []) }), [clickedMapFeature]);
    const splitInteraction = useMemo(
        () =>
            new Modify({
                features: new Collection(clickableSource ? clickableSource?.getFeatures() : []),
                condition: singleClick,
                pixelTolerance: 10,
            }),
        [clickableSource]
    );

    const snapInteraction = useMemo(
        () => new Snap({ source: clickableSource, features: new Collection(snapToFeatures), intersection: true }),
        [clickableSource, snapToFeatures]
    );

    return {
        selectInteraction,
        modifyInteraction,
        drawPointInteraction,
        drawLineInteraction,
        drawPolygonInteraction,
        translateInteraction,
        splitInteraction,
        snapInteraction,
    };
};

export default useGetInteractions;
