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

export function useContributionAuthorisation() {
    const { community, communityGridsStatus, addAlertMessage } = useCommunityStore();
    const map = useMapStore((state) => state.map);
    const { t } = useTranslation({ useContributionAuthorisation });

    const parsedGrids = useMemo(() => {
        const parsed: ParsedGrid[] = [];
        let hasInvalidGeometry = false;

        community?.grids.forEach((grid) => {
            try {
                const geometry = wktFormat.readGeometry(grid.geometry);
                parsed.push({
                    data: grid,
                    geometry: geoJSONFormat.writeGeometryObject(geometry) as GeoJSONGeometry,
                });
            } catch {
                hasInvalidGeometry = true;
            }
        });

        return { parsed, hasInvalidGeometry };
    }, [community?.grids]);

    const authoriseContribution = useCallback(
        (feature: Feature, type: ContributionType, initialFeature: Feature | null = null) => {
            if (communityGridsStatus === "loading" || communityGridsStatus === "idle") {
                addAlertMessage(StatusMessage.warning, t("grids_loading"), 3000);
                return false;
            }
            if (communityGridsStatus === "error") {
                addAlertMessage(StatusMessage.error, t("grids_unavailable"), 5000);
                return false;
            }
            if (!community?.grids.length) {
                addAlertMessage(StatusMessage.warning, t("no_authorised_grids"), 5000);
                return false;
            }

            const geometryToCheck = type === ContributionType.DELETE ? (initialFeature?.getGeometry() ?? feature.getGeometry()) : feature.getGeometry();
            const mapProjection = map?.getView().getProjection();
            if (!geometryToCheck || !mapProjection) {
                addAlertMessage(StatusMessage.error, t("grids_unavailable"), 5000);
                return false;
            }

            const geometry = geometryToCheck.clone().transform(mapProjection, "EPSG:4326") as Geometry;
            const geometryExtent = geometry.getExtent();
            const geometryGeoJSON = geoJSONFormat.writeGeometryObject(geometry) as GeoJSONGeometry;
            let intersectsAuthorizedGrid = false;
            let hasIntersectionError = false;
            for (const grid of parsedGrids.parsed) {
                if (!intersects(geometryExtent, grid.data.extent)) continue;
                try {
                    if (booleanIntersects(geometryGeoJSON, grid.geometry)) {
                        intersectsAuthorizedGrid = true;
                        break;
                    }
                } catch {
                    hasIntersectionError = true;
                }
            }

            if (intersectsAuthorizedGrid) return true;
            if (parsedGrids.hasInvalidGeometry || hasIntersectionError) {
                addAlertMessage(StatusMessage.error, t("grids_unavailable"), 5000);
                return false;
            }

            const gridTitles = [...new Set(community.grids.map((grid) => grid.title))].join(", ");
            addAlertMessage(StatusMessage.warning, t("outside_authorised_grids", { grids: gridTitles }), 5000);
            return false;
        },
        [addAlertMessage, community, communityGridsStatus, map, parsedGrids, t]
    );

    return authoriseContribution;
}
