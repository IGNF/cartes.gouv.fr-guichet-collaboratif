import TileLayer from "ol/layer/Tile";
import { TileWMS } from "ol/source";
import { useEffect, useMemo } from "react";
import { useCommunityStore } from "@/store/useCommunityStore";
import useGetCapabilitiesWMS from "../capabilities/useGetCapabilitiesWMS";
import { transformExtent } from "ol/proj";
import { CommunityGeoservice, StatusMessage } from "@/constants/communities/types";
import { useMapStore } from "@/store";

type CapabilityLayer = {
    Name: string;
};

function useGetWMSLayer(geoservice: CommunityGeoservice) {
    const { data: capabilities, error } = useGetCapabilitiesWMS(geoservice);

    const { addAlertMessage } = useCommunityStore();
    const { map } = useMapStore();

    useEffect(() => {
        if (error) {
            addAlertMessage(StatusMessage.error, `Erreur dans le chargement de la couche ${geoservice.title}`);
        }
    }, [error, geoservice, addAlertMessage]);

    const wmsLayer = useMemo(() => {
        if (!capabilities) return;
        const wmsLayer: TileLayer = new TileLayer({
            source: undefined,
            visible: false,
            properties: {
                loading: true,
            },
        });
        if (capabilities) {
            let wmsLayerOption = capabilities.Capability.Layer;
            if (wmsLayerOption && wmsLayerOption.Name !== geoservice.layer) {
                wmsLayerOption = capabilities.Capability.Layer.Layer.find((l: CapabilityLayer) => l.Name === geoservice.layer);
            }
            if (wmsLayerOption) {
                const wmsSource = new TileWMS({
                    url: geoservice.url,
                    params: {
                        LAYERS: wmsLayerOption.Name,
                        TILED: true,
                        VERSION: geoservice.version,
                    },
                    serverType: "geoserver",
                });
                wmsSource.setUrl(geoservice.url);
                wmsLayer.setSource(wmsSource);
                wmsLayer.set("loading", false);
            }
        }

        wmsLayer.set("title", geoservice.title);
        wmsLayer.set("description", geoservice.description);
        wmsLayer.setMinZoom(geoservice.minZoom);
        wmsLayer.setMaxZoom(geoservice.maxZoom);
        if (map) {
            const mapView = map.getView();
            const minResolution = mapView?.getResolutionForZoom(geoservice.maxZoom);
            const maxResolution = mapView?.getResolutionForZoom(geoservice.minZoom);
            wmsLayer.setMinResolution(minResolution);
            wmsLayer.setMaxResolution(maxResolution);
        }
        const extent = geoservice.extent.split(",")?.map((extent) => parseFloat(extent));
        wmsLayer.setExtent(transformExtent(extent, "EPSG:4326", "EPSG:3857"));
        return wmsLayer;
    }, [capabilities, geoservice, map]);

    return wmsLayer;
}

export default useGetWMSLayer;
