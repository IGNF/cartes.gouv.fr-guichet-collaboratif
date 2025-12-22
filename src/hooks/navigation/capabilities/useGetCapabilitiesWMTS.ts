import { CommunityGeoservice } from "@/constants/communities/types";
import { useMapStore } from "@/store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import WMTSCapabilities from "ol/format/WMTSCapabilities";
import { useCallback, useMemo } from "react";

export default function useGetCapabilitiesWMTS(geoservice: CommunityGeoservice) {
    const { map } = useMapStore();
    const getCapURL = useMemo(() => {
        if (!map) return "";
        return `${geoservice.url}${geoservice.url.includes("?") ? "&" : "?"}` + `SERVICE=WMTS` + `&VERSION=${geoservice.version}` + `&REQUEST=GetCapabilities`;
    }, [geoservice, map]);

    const queryKey = useMemo(() => [`GP_WMTS_GET_CAPABILITIES_${geoservice.url}_${geoservice.version}`], [geoservice]);

    const queryFunc = useCallback(async () => {
        const response = await fetch(getCapURL);
        if (!response.ok) {
            throw new Error(`Bad response from server : ${response.status}`);
        }
        const text = await response.text();

        const format = new WMTSCapabilities();
        const capabilities = format.read(text);
        if (!capabilities) {
            throw new Error("Reading capabilities failed");
        }

        return capabilities;
    }, [getCapURL]);

    const queryClient = useQueryClient();
    const cached = queryClient.getQueryData(queryKey);

    return useQuery({
        queryKey: queryKey,
        queryFn: () => queryFunc(),
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        gcTime: 1000 * 60 * 60 * 24 * 30,
        enabled: !cached,
    });
}
