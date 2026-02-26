import { CommunityGeoservice } from "@/constants/communities/types";
import { useQuery } from "@tanstack/react-query";
import WMTSCapabilities from "ol/format/WMTSCapabilities";
import { useCallback, useMemo } from "react";

type CapabilitiesResult = {
    parsed: object;
    rawXml: string;
};

export default function useGetCapabilitiesWMTS(geoservice: CommunityGeoservice) {
    const getCapURL = useMemo(() => {
        return `${geoservice.url}${geoservice.url.includes("?") ? "&" : "?"}` + `SERVICE=WMTS` + `&VERSION=${geoservice.version}` + `&REQUEST=GetCapabilities`;
    }, [geoservice]);

    const queryKey = useMemo(() => [`GP_WMTS_GET_CAPABILITIES_${geoservice.url}_${geoservice.version}`], [geoservice]);

    const queryFunc = useCallback(async (): Promise<CapabilitiesResult> => {
        const response = await fetch(getCapURL);
        if (!response.ok) {
            throw new Error(`Bad response from server : ${response.status}`);
        }
        const rawXml = await response.text();
        const parsed = new WMTSCapabilities().read(rawXml);
        if (!parsed) {
            throw new Error("Reading capabilities failed");
        }
        return { parsed, rawXml };
    }, [getCapURL]);

    const { data, error } = useQuery<CapabilitiesResult>({
        queryKey,
        queryFn: queryFunc,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        gcTime: 1000 * 60 * 60 * 24 * 30,
    });

    return {
        data: data?.parsed ?? null,
        rawXml: data?.rawXml ?? null,
        error,
    };
}
