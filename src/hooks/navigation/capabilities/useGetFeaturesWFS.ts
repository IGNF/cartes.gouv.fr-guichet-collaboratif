import { CommunityGeoservice } from "@/constants/communities/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import GeoJSON from "ol/format/GeoJSON";
import { transformExtent } from "ol/proj";
import { useCallback, useMemo } from "react";

export default function useGetFeaturesWFS(geoservice: CommunityGeoservice) {
    const getFeatURL = useMemo(() => {
        let extent = geoservice.extent.split(",")?.map((extent) => parseFloat(extent));
        extent = transformExtent(extent, "EPSG:4326", "EPSG:3857");
        return (
            `${geoservice.url}${geoservice.url.includes("?") ? "" : "?"}service=WFS` +
            `&version=${geoservice.version}` +
            `&request=GetFeature` +
            `&typename=${geoservice.layer}` +
            `&outputFormat=application/json` +
            `&srsname=${geoservice.boxSrid}` +
            "&bbox=" +
            extent +
            `,${geoservice.boxSrid}`
        );
    }, [geoservice]);

    const queryKey = useMemo(
        () => [`GP_WFS_GET_FEATURES_${geoservice.url}_${geoservice.version}_${geoservice.layer}_${geoservice.boxSrid}_${geoservice.extent}`],
        [geoservice]
    );

    const queryFunc = useCallback(async () => {
        const response = await fetch(getFeatURL);

        if (!response.ok) {
            throw new Error(`Bad response from server : ${response.status}`);
        }
        const geojson = await response.json();
        const format = new GeoJSON();
        const features = format.readFeatures(geojson, {
            dataProjection: "EPSG:4326",
            featureProjection: "EPSG:3857",
        });
        if (!features) {
            throw new Error("Reading features failed");
        }

        return { data: features };
    }, [getFeatURL]);

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
