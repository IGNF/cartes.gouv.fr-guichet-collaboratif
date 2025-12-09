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

    const selectInteraction = useMemo(() => new Select({ condition: click, layers: [clickableLayer!], multi: true }), [clickableLayer]);

    const modifyInteraction = new Modify({ features: new Collection(clickedMapFeature ? [clickedMapFeature] : []) });
    const drawPointInteraction = new Draw({ type: "Point" });
    const drawLineInteraction = new Draw({ type: "LineString" });
    const drawPolygonInteraction = new Draw({ type: "Polygon" });
    const translateInteraction = new Translate({ features: new Collection(clickedMapFeature ? [clickedMapFeature] : []) });
    const splitInteraction = new Modify({
        features: new Collection(clickableSource ? clickableSource?.getFeatures() : []),
        condition: singleClick,
        pixelTolerance: 2,
    });

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
