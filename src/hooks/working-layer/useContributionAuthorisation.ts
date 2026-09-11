import booleanIntersects from "@turf/boolean-intersects";
import { useCallback, useMemo } from "react";
import { Feature } from "ol";
import GeoJSON, { GeoJSONGeometry } from "ol/format/GeoJSON";
import WKT from "ol/format/WKT";
import Geometry from "ol/geom/Geometry";
import { intersects } from "ol/extent";

import { ContributionType } from "@/constants/contributions/types";
import { GridData, StatusMessage } from "@/constants/communities/types";
import { useTranslation } from "@/i18n";
import { useCommunityStore, useMapStore } from "@/store";

interface ParsedGrid {
    data: GridData;
    geometry: GeoJSONGeometry;
}

const wktFormat = new WKT();
const geoJSONFormat = new GeoJSON();

export function useFeatureAuthorisation() {
    const { community, communityGridsStatus } = useCommunityStore();
    const map = useMapStore((state) => state.map);
    const communityGrids = community?.grids;

    const parsedGrids = useMemo<ParsedGrid[]>(
        () =>
            communityGrids?.map((grid) => {
                const geometry = wktFormat.readGeometry(grid.geometry);
                return {
                    data: grid,
                    geometry: geoJSONFormat.writeGeometryObject(geometry) as GeoJSONGeometry,
                };
            }) ?? [],
        [communityGrids]
    );

    const isFeatureAuthorised = useCallback(
        (feature: Feature): boolean => {
            if (communityGridsStatus !== "ready" || !communityGrids?.length) return false;

            const geometryToCheck = feature.getGeometry();
            const mapProjection = map?.getView().getProjection();
            if (!geometryToCheck || !mapProjection) return false;

            const geometry = geometryToCheck.clone().transform(mapProjection, "EPSG:4326") as Geometry;
            const geometryExtent = geometry.getExtent();
            const geometryGeoJSON = geoJSONFormat.writeGeometryObject(geometry) as GeoJSONGeometry;
            for (const grid of parsedGrids) {
                if (!intersects(geometryExtent, grid.data.extent)) continue;
                if (booleanIntersects(geometryGeoJSON, grid.geometry)) return true;
            }
            return false;
        },
        [communityGrids, communityGridsStatus, map, parsedGrids]
    );

    const authorisedGridTitles = useMemo(() => [...new Set(communityGrids?.map((grid) => grid.title) ?? [])], [communityGrids]);

    return { isFeatureAuthorised, authorisedGridTitles };
}

export function useContributionAuthorisation() {
    const { addAlertMessage } = useCommunityStore();
    const { isFeatureAuthorised, authorisedGridTitles } = useFeatureAuthorisation();
    const { t } = useTranslation({ useContributionAuthorisation });

    const authoriseContribution = useCallback(
        (feature: Feature, type: ContributionType, initialFeature: Feature | null = null) => {
            const featureToCheck = type === ContributionType.DELETE && initialFeature ? new Feature(initialFeature.getGeometry()?.clone()) : feature;
            if (isFeatureAuthorised(featureToCheck)) return true;

            addAlertMessage(StatusMessage.warning, t("not_authorised", { grids: authorisedGridTitles.join(", ") }), 5000);
            return false;
        },
        [addAlertMessage, authorisedGridTitles, isFeatureAuthorised, t]
    );

    return authoriseContribution;
}
