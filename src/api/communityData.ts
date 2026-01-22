import { useCommunityStore } from "@/store/useCommunityStore";
import { COMMUNITIES_API_URL, GRIDS_API_URL, LIST_COMMUNITIES_URL } from "@/constants/urls";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/store/useUserStore";
import { getGeoserviceAll } from "./geoservicesData";
import { Community, CommunityGeoservice, CommunityGrids, CommunityLayer, layerData } from "@/constants/communities/types";
import { axiosApi } from ".";
import { getFeatureTypesAll } from "./featureTypesData";
import { LAYER_FEATURE_TYPE, DEFAULT_COMMUNITY_MIN_ZOOM, DEFAULT_COMMUNITY_MAX_ZOOM } from "@/constants";
import { User } from "@/constants/user/types";

let queryClient: QueryClient;

export const isDigital = (value: string): boolean => {
    const regex = /^[1-9]\d*$/;
    return regex.test(value);
};

async function getCommunityGrids(grids: string[]): Promise<CommunityGrids[]> {
    const resAll = await Promise.all(
        grids.map((gridName) => axiosApi.get(`${GRIDS_API_URL}/${gridName}?fields[]=name` + `&fields[]=title` + `&fields[]=type` + `&fields[]=extent`))
    );
    return resAll.map((res) => {
        return {
            name: res.data.name,
            title: res.data.title,
            type: res.data.type,
            extent: res.data.extent,
        };
    });
}

async function getCommunityLayers(communityId: string): Promise<CommunityLayer[]> {
    const res = await axiosApi.get(`${COMMUNITIES_API_URL}/${communityId}/layer/get_all`);

    if (!res.data || res.status !== 200) return [];
    const layers = res.data;
    const layersGeoservice = layers.filter((layer: layerData) => layer.type === "geoservice");
    const layersFeatureType = layers.filter((layer: layerData) => layer.type === LAYER_FEATURE_TYPE);
    const geoservicesIds = layersGeoservice.map((layer: layerData) => layer?.geoservice?.id);
    const featureTypesIds = layersFeatureType.map((layer: layerData) => {
        return { database: layer?.database, table: layer?.table };
    });
    const communityGeoservicesKey = [`COMMUNITY_GEOSERVICES_DATA_${communityId}`];
    const communityFeatureTypesKey = [`COMMUNITY_FEATURE_TYPES_DATA_${communityId}`];
    let geoRes: CommunityGeoservice[];
    let featureTypeRes: CommunityGeoservice[];
    const cachedGeoservices = queryClient.getQueryData(communityGeoservicesKey);
    const cachedFeatureTypes = queryClient.getQueryData(communityFeatureTypesKey);
    if (cachedGeoservices) {
        geoRes = cachedGeoservices as CommunityGeoservice[];
    } else {
        geoRes = await queryClient.fetchQuery({
            queryKey: communityGeoservicesKey,
            queryFn: () => getGeoserviceAll(geoservicesIds),
        });
    }
    if (cachedFeatureTypes) {
        featureTypeRes = cachedFeatureTypes as CommunityGeoservice[];
    } else {
        featureTypeRes = await queryClient.fetchQuery({
            queryKey: communityFeatureTypesKey,
            queryFn: () => getFeatureTypesAll(featureTypesIds),
        });
    }

    const allLayers = [...layersGeoservice, ...layersFeatureType];

    return allLayers.map((layer: layerData) => {
        const geoservice =
            layer.type === "geoservice"
                ? (geoRes?.find((geo) => geo.id === layer.geoservice.id) as CommunityGeoservice)
                : (featureTypeRes.find((featType) => featType.id === layer.table) as CommunityGeoservice);
        return {
            id: layer.id,
            type: layer.type,
            geoservice,
            order: layer.order,
            opacity: layer.opacity,
            visibility: layer.visibility,
            role: layer.role,
            database: layer.database,
            table: layer.table,
            snapto: layer.snapto,
        };
    });
}

const defineZoomlvl = (layers: CommunityLayer[], providedMinZoom?: number | null, providedMaxZoom?: number | null): { minZoom: number; maxZoom: number } => {
    if (providedMinZoom != null && providedMaxZoom != null) {
        return {
            minZoom: providedMinZoom,
            maxZoom: providedMaxZoom,
        };
    }

    const rasterLayers = layers.filter(
        (layer) => layer.type === "geoservice" && layer.geoservice?.type && (layer.geoservice.type === "WMS" || layer.geoservice.type === "WMTS")
    );

    if (rasterLayers.length > 0) {
        let minZoom = Infinity;
        let maxZoom = -Infinity;

        rasterLayers.forEach((layer) => {
            const geoservice = layer.geoservice;
            if (geoservice?.minZoom != null) {
                minZoom = Math.min(minZoom, geoservice.minZoom);
            }
            if (geoservice?.maxZoom != null) {
                maxZoom = Math.max(maxZoom, geoservice.maxZoom);
            }
        });

        if (minZoom !== Infinity && maxZoom !== -Infinity) {
            return {
                minZoom: providedMinZoom ?? minZoom,
                maxZoom: providedMaxZoom ?? maxZoom,
            };
        }
    }

    return {
        minZoom: providedMinZoom ?? DEFAULT_COMMUNITY_MIN_ZOOM,
        maxZoom: providedMaxZoom ?? DEFAULT_COMMUNITY_MAX_ZOOM,
    };
};

async function getCommunityById(communityId: string, user: User): Promise<[Community, CommunityLayer[]] | null> {
    const res = await axiosApi.get(`${COMMUNITIES_API_URL}/${communityId}`);

    if (res.status === 403) {
        window.location.href = LIST_COMMUNITIES_URL;
        return null;
    }
    if (!res.data || res.status !== 200) return null;

    const communityLayersKey = [`COMMUNITY_LAYERS_DATA_${communityId}`];
    let layers: CommunityLayer[];
    const cached = queryClient.getQueryData(communityLayersKey);
    if (cached) {
        layers = cached as CommunityLayer[];
    } else {
        layers = await queryClient?.fetchQuery({
            queryKey: communityLayersKey,
            queryFn: () => getCommunityLayers(communityId),
        });
    }

    const { minZoom, maxZoom } = defineZoomlvl(
        layers,
        res.data.min_zoom != null ? Number(res.data.min_zoom) : null,
        res.data.max_zoom != null ? Number(res.data.max_zoom) : null
    );

    const community: Community = {
        id: res.data.id,
        listed: res.data.listed,
        description: res.data.description,
        name: res.data.name,
        about: res.data.about,
        functionalities: res.data.functionalities,
        logoUrl: res.data.logo_url,
        themes: res.data.attributes,
        position: res.data.position,
        zoom: res.data.zoom,
        minZoom,
        maxZoom,
        grids: [],
    };
    if (user) {
        const grids = user.communitiesMember.find((cm) => cm.communityId === communityId)?.grids;
        const communityGrids = await queryClient?.fetchQuery({
            queryKey: [`COMMUNITY_GRIDS_DATA_${communityId}`],
            queryFn: () => getCommunityGrids(grids!),
        });
        community.grids = communityGrids;
    }
    return [community, layers];
}
export const useGetCommunityByIdAPI = (communityId: string) => {
    const { community } = useCommunityStore();
    const { user } = useUserStore();
    queryClient = useQueryClient();
    return useQuery({
        queryKey: ["COMMUNITY_DATA_" + communityId],
        queryFn: () => getCommunityById(communityId, user),
        retry: 2,
        enabled: !community && isDigital(communityId) && !!user,
    });
};
