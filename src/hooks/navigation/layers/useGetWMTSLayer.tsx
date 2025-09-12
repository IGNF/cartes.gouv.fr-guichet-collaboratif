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

function useGetWMTSLayer(geoservice: CommunityGeoservice) {
    const { data: capabilities, error } = useGetCapabilitiesWMTS(geoservice);

    const { addAlertMessage } = useCommunityStore();
    const { map } = useMapStore();

    const { t } = useTranslation({ useGetWMTSLayer });

    useEffect(() => {
        if (error) {
            addAlertMessage(StatusMessage.error, t("loading_layer_error", { layerTitle: geoservice.title }));
        }
    }, [error, geoservice, addAlertMessage, t]);

    const wmtsLayer = useMemo(() => {
        if (!capabilities) return;
        const wmtsLayer: TileLayer = new TileLayer({
            source: undefined,
            visible: false,
            properties: {
                loading: true,
            },
        });
        if (capabilities) {
            const wmtsOptions = optionsFromCapabilities(capabilities, {
                layer: geoservice.layer,
            });

            if (wmtsOptions) {
                const wmtsSource = new WMTS({ ...wmtsOptions, crossOrigin: "anonymous" });
                wmtsSource.setUrl(geoservice.url);

                wmtsLayer.setSource(wmtsSource);
                wmtsLayer.set("loading", false);
            }
        }

        wmtsLayer.set("title", geoservice.title);
        wmtsLayer.set("description", geoservice.description);
        wmtsLayer.setMinZoom(geoservice.minZoom);
        wmtsLayer.setMaxZoom(geoservice.maxZoom);

        if (map) {
            const mapView = map.getView();
            const minResolution = mapView?.getResolutionForZoom(geoservice.maxZoom);
            const maxResolution = mapView?.getResolutionForZoom(geoservice.minZoom);
            wmtsLayer.setMinResolution(minResolution);
            wmtsLayer.setMaxResolution(maxResolution);
        }

        const extent = geoservice.extent.split(",")?.map((extent) => parseFloat(extent));
        wmtsLayer.setExtent(transformExtent(extent, "EPSG:4326", "EPSG:3857"));
        return wmtsLayer;
    }, [capabilities, geoservice, map]);

    return wmtsLayer;
}

export default useGetWMTSLayer;
