import { LocalStorageData } from "@/constants/localStorage/types";
import { useCommunityStore, useLocalStorageStore, useMapStore } from "@/store";
import isEqual from "fast-deep-equal/react";
import { EventTypes } from "ol/Observable";
import { transform } from "ol/proj";
import { useCallback, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

let timer: ReturnType<typeof setTimeout> | undefined;

const parseLocationParam = (raw: string): { lat: number; lon: number; z?: number } | null => {
    const parts = raw.replace(/\s/g, "").split(",");
    if (parts.length < 2 || parts.length > 3) return null;
    const [lat, lon, z] = parts.map(Number);
    if (!isFinite(lat) || !isFinite(lon)) return null;
    if (lat < -90 || lat > 90) return null;
    if (lon < -180 || lon > 180) return null;
    if (z !== undefined && (!isFinite(z) || z < 0 || z > 24)) return null;
    return { lat, lon, z };
};

const ViewHandler: React.FC = () => {
    const { community } = useCommunityStore();
    const { localStorageData, setLocalStorage } = useLocalStorageStore();
    const { mapWorkingLayer, map, mapSwitcher } = useMapStore();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const locationParam = searchParams.get("c");

    const isMapDrivenUpdate = useRef(false);

    const handleSave = useCallback(async () => {
        if (!community?.name || !map) return;

        const orderedLayers = map
            .getLayers()
            .getArray()
            .sort((l1, l2) => l1.getZIndex()! - l2.getZIndex()!);

        const view = map.getView();
        const center = view.getCenter();
        const zoom = view.getZoom() ?? 10;
        const projCode = view.getProjection().getCode();

        const newLocalStorageData: LocalStorageData = {
            activeLayer: mapWorkingLayer,
            center: center ? [...center] : [],
            layers: orderedLayers.map((layer, index: number) => ({
                name: layer?.get("title"),
                opacity: layer?.getOpacity(),
                type: layer?.get("type"),
                visibility: layer?.getVisible(),
                order: index,
            })),
            zoom,
            projection: projCode,
            searchExtent: "",
            searchMax: 20,
            searchRoot: null,
            namedPositions: localStorageData?.namedPositions ?? [],
        };

        if (!isEqual(newLocalStorageData, localStorageData)) {
            setLocalStorage(community.name, newLocalStorageData);
        }

        if (center) {
            const [lon, lat] = transform(center, projCode, "EPSG:4326");
            const newLocationParam = `${parseFloat(lat.toFixed(6))},${parseFloat(lon.toFixed(6))},${parseFloat(zoom.toFixed(0))}`;

            if (newLocationParam !== locationParam) {
                isMapDrivenUpdate.current = true;
                const params = new URLSearchParams(searchParams);
                params.set("c", newLocationParam);
                navigate(`?${params.toString().replace(/%2C/g, ",")}`, { replace: true });
            }
        }
    }, [map, community, localStorageData, locationParam, mapWorkingLayer, navigate, searchParams, setLocalStorage]);

    useEffect(() => {
        if (!locationParam || !map) return;

        if (isMapDrivenUpdate.current) {
            isMapDrivenUpdate.current = false;
            return;
        }

        const coords = parseLocationParam(locationParam);
        if (!coords) return;

        const { lat, lon, z } = coords;
        const view = map.getView();
        const center = transform([lon, lat], "EPSG:4326", view.getProjection().getCode());
        view.setCenter(center);
        if (z !== undefined || community?.zoom !== undefined) {
            view.setZoom(z ?? community?.zoom ?? 10);
        }
    }, [locationParam, map, community]);

    const onChange = useCallback(() => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            handleSave();
        }, 400);
    }, [handleSave]);

    useEffect(() => {
        const mapView = map?.getView();
        mapView?.on("change:center", onChange);
        mapView?.on("change:rotation", onChange);
        mapSwitcher?.on("layerswitcher:change:visibility" as EventTypes, onChange);
        mapSwitcher?.on("layerswitcher:change:opacity" as EventTypes, onChange);
        mapSwitcher?.on("layerswitcher:change:position" as EventTypes, onChange);

        return () => {
            mapView?.un("change:center", onChange);
            mapView?.un("change:rotation", onChange);
            mapSwitcher?.un("layerswitcher:change:visibility" as EventTypes, onChange);
            mapSwitcher?.un("layerswitcher:change:opacity" as EventTypes, onChange);
            mapSwitcher?.un("layerswitcher:change:position" as EventTypes, onChange);
        };
    }, [map, mapSwitcher, onChange]);

    return null;
};

export default ViewHandler;
