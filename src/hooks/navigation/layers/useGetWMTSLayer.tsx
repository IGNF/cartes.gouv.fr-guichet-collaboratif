import TileLayer from "ol/layer/Tile";
import { WMTS } from "ol/source";
import { useEffect, useMemo } from "react";
import { optionsFromCapabilities } from "ol/source/WMTS";
import useGetCapabilitiesWMTS from "@/hooks/navigation/capabilities/useGetCapabilitiesWMTS";
import { useCommunityStore } from "@/store/useCommunityStore";
import { transformExtent } from "ol/proj";
import { CommunityGeoservice, StatusMessage } from "@/constants/communities/types";

function useGetWMTSLayer(geoservice: CommunityGeoservice) {
    const { data: capabilities, error } = useGetCapabilitiesWMTS(geoservice);

    const { addAlertMessage } = useCommunityStore();
    useEffect(() => {
        if (error) {
            addAlertMessage(StatusMessage.error, `Erreur dans le chargement de la couche ${geoservice.title}`);
        }
    }, [error, geoservice, addAlertMessage]);

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
                const wmtsSource = new WMTS(wmtsOptions);
                wmtsSource.setUrl(geoservice.url);
                wmtsLayer.setSource(wmtsSource);
                wmtsLayer.set("loading", false);
            }
        }

        wmtsLayer.set("title", geoservice.title);
        wmtsLayer.set("description", geoservice.description);
        wmtsLayer.set("name", geoservice.layer);
        wmtsLayer.setMinZoom(geoservice.minZoom);
        wmtsLayer.setMaxZoom(geoservice.maxZoom);
        const extent = geoservice.extent.split(",")?.map((extent) => parseFloat(extent));
        wmtsLayer.setExtent(transformExtent(extent, "EPSG:4326", "EPSG:3857"));
        return wmtsLayer;
    }, [capabilities, geoservice]);

    return wmtsLayer;
}

export default useGetWMTSLayer;
