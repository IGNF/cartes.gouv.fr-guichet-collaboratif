import TileLayer from "ol/layer/Tile";
import { WMTS } from "ol/source";
import { useEffect, useMemo } from "react";
import { optionsFromCapabilities } from "ol/source/WMTS";
import useGetCapabilitiesWMTS from "@/hooks/navigation/capabilities/useGetCapabilitiesWMTS";
import { useCommunityStore } from "@/store/useCommunityStore";
import { transformExtent } from "ol/proj";
import { CommunityGeoservice, StatusMessage } from "@/constants/communities/types";
import { useMapStore } from "@/store";
import { useTranslation } from "@/i18n";

function isLayerQueryable(rawXml: string, layerIdentifier: string): boolean {
    const doc = new DOMParser().parseFromString(rawXml, "text/xml");
    const layers = doc.querySelectorAll("Contents > Layer");
    for (const layer of layers) {
        const identifier = layer.querySelector("Identifier");
        if (identifier?.textContent?.trim() === layerIdentifier) {
            const infoFormats = layer.querySelectorAll("InfoFormat");
            return infoFormats.length > 0;
        }
    }
    return false;
}

function useGetWMTSLayer(geoservice: CommunityGeoservice) {
    const { data: capabilities, rawXml, error } = useGetCapabilitiesWMTS(geoservice);

    const { addAlertMessage } = useCommunityStore();
    const { map } = useMapStore();
    const { t } = useTranslation({ useGetWMTSLayer });

    useEffect(() => {
        if (error) {
            addAlertMessage(StatusMessage.error, t("loading_layer_error", { layerTitle: geoservice.title }), 3000);
        }
    }, [error, geoservice, addAlertMessage, t]);

    const wmtsLayer = useMemo(() => {
        if (!capabilities || !rawXml) return;

        const wmtsLayer: TileLayer = new TileLayer({
            source: undefined,
            visible: false,
            properties: { loading: true },
        });

        const wmtsOptions = optionsFromCapabilities(capabilities, {
            layer: geoservice.layer,
        });

        if (wmtsOptions) {
            const wmtsSource = new WMTS({ ...wmtsOptions, crossOrigin: "anonymous" });
            wmtsSource.setUrl(geoservice.url);
            wmtsLayer.setSource(wmtsSource);
            wmtsLayer.set("loading", false);
        }

        wmtsLayer.set("queryable", isLayerQueryable(rawXml, geoservice.layer));

        wmtsLayer.set("title", geoservice.title);
        wmtsLayer.set("name", geoservice.layer);
        wmtsLayer.set("description", geoservice.description);
        wmtsLayer.setMinZoom(geoservice.minZoom);
        wmtsLayer.setMaxZoom(geoservice.maxZoom);

        if (map) {
            const mapView = map.getView();
            wmtsLayer.setMinResolution(mapView?.getResolutionForZoom(geoservice.maxZoom));
            wmtsLayer.setMaxResolution(mapView?.getResolutionForZoom(geoservice.minZoom));
        }

        const extent = geoservice.extent.split(",")?.map((extent) => parseFloat(extent));
        wmtsLayer.setExtent(transformExtent(extent, "EPSG:4326", "EPSG:3857"));

        return wmtsLayer;
    }, [capabilities, rawXml, geoservice, map]);

    return wmtsLayer;
}

export default useGetWMTSLayer;
