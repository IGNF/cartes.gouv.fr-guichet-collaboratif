import { REPORTS_WFS_API_URL } from "@/constants/urls";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

export default function useGetCapabilitiesReports() {
    const getFeatURL = useMemo(
        () =>
            `${REPORTS_WFS_API_URL}?service=wfs` +
            `&request=GetCapabilities` +
            `&typename=signalement` +
            `&outputFormat=application/json` +
            `&srsname=EPSG:3857`,
        []
    );

    const queryKey = useMemo(() => [`GET_REPORTS_GET_CAPABILITIES_SIGNALEMENT`], []);

    const queryFunc = useCallback(async () => {
        const response = await fetch(getFeatURL);

        if (!response.ok) {
            throw new Error(`Bad response from server : ${response.status}`);
        }

        const geojson = await response.text();
        console.log(geojson);
        const parser = new DOMParser();
        const xml = parser.parseFromString(geojson, "application/xml");

        // Get the feature types
        const featureTypes = xml.querySelectorAll("FeatureType");

        featureTypes.forEach((ft) => {
            const name = ft.querySelector("Name")?.textContent;
            const title = ft.querySelector("Title")?.textContent;
            const srs = ft.querySelector("DefaultSRS")?.textContent || "EPSG:4326";

            const lowerCorner = ft.querySelector("ows\\:LowerCorner, LowerCorner")?.textContent;
            const upperCorner = ft.querySelector("ows\\:UpperCorner, UpperCorner")?.textContent;

            console.log("Layer name:", name);
            console.log("Title:", title);
            console.log("SRS:", srs);
            console.log("BBOX:", lowerCorner, upperCorner);
        });
        console.log(featureTypes);
        if (!featureTypes) {
            throw new Error("Reading features failed");
        }

        return { data: featureTypes };
    }, [getFeatURL]);

    const queryClient = useQueryClient();
    const cached = queryClient.getQueryData(queryKey);

    return useQuery({
        queryKey: queryKey,
        queryFn: () => queryFunc(),
        retry: (failureCount, error) => {
            console.log(failureCount);
            return error instanceof TypeError;
        },
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        gcTime: 1000 * 60 * 60 * 24 * 30,
        enabled: !cached,
    });
}
