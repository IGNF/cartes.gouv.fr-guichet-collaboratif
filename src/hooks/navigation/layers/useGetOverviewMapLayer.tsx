import TileLayer from "ol/layer/Tile";
import { WMTS } from "ol/source";
import { useMemo } from "react";
import { optionsFromCapabilities } from "ol/source/WMTS";
import { OVERVIEW_MAP_WMTS_LAYER, OVERVIEW_MAP_WMTS_URL, OVERVIEW_MAP_WMTS_VERSION, CommunityGeoservice } from "@/constants/communities/types";
import useGetCapabilitiesWMTS from "@/hooks/navigation/capabilities/useGetCapabilitiesWMTS";

function useGetOverviewMapLayer() {
    const geoservice: CommunityGeoservice = useMemo(
        () => ({
            id: -1,
            description: null,
            title: "Overview Map",
            type: "WMTS",
            version: OVERVIEW_MAP_WMTS_VERSION,
            url: OVERVIEW_MAP_WMTS_URL,
            layer: OVERVIEW_MAP_WMTS_LAYER,
            format: "image/png",
            extent: "",
            minZoom: 0,
            maxZoom: 20,
            tileZoom: 20,
            boxSrid: "",
            columns: [],
        }),
        []
    );

    const { data: capabilities } = useGetCapabilitiesWMTS(geoservice);

    const overviewLayer = useMemo(() => {
        if (!capabilities) return undefined;

        const wmtsLayer: TileLayer = new TileLayer({
            source: undefined,
        });

        const wmtsOptions = optionsFromCapabilities(capabilities, {
            layer: OVERVIEW_MAP_WMTS_LAYER,
        });

        if (wmtsOptions) {
            const wmtsSource = new WMTS({ ...wmtsOptions, crossOrigin: "anonymous" });
            wmtsSource.setUrl(OVERVIEW_MAP_WMTS_URL);
            wmtsLayer.setSource(wmtsSource);
        }

        return wmtsLayer;
    }, [capabilities]);

    return overviewLayer;
}

export default useGetOverviewMapLayer;
