import { useCallback } from "react";
import { useCommunityStore } from "@/store";
import { useMapStore } from "@/store/useMapStore";
import { useFormatWMSPopup } from "@/hooks/useFormatWMSPopup";
import { useWMTSInfo } from "@/hooks/useComputeWMTS";
import Map from "ol/Map";
import { MapBrowserEvent } from "ol";

export function useFeatureInfo(map: Map | null) {
    const { communityLayers } = useCommunityStore();
    const { selectedLayer } = useMapStore();
    const { formatWMSPopup } = useFormatWMSPopup();
    const { computeWMTSFromCoordinate } = useWMTSInfo(map);

    const getFeatureInfoContent = useCallback(
        async (e: MapBrowserEvent<UIEvent>) => {
            if (!map || !selectedLayer || !communityLayers) return { html: "<em>Aucune donnée disponible</em>", coordinate: e.coordinate };

            const view = map.getView();
            const projectionCode = view.getProjection().getCode();
            const mapSize = map.getSize();
            if (!mapSize) return { html: "<em>Aucune donnée disponible</em>", coordinate: e.coordinate };

            const [width, height] = mapSize;
            const bbox = view.calculateExtent(mapSize);
            const pixel = map.getPixelFromCoordinate(e.coordinate);
            const i = Math.round(pixel?.[0] ?? width / 2);
            const j = Math.round(pixel?.[1] ?? height / 2);

            const normalized = (s: string) =>
                s
                    ?.normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .toLowerCase()
                    .trim();

            const theLayer = communityLayers.find((layer) => normalized(layer.geoservice.title || "") === normalized(selectedLayer));
            if (!theLayer) return { html: "<em>Aucune donnée disponible</em>", coordinate: e.coordinate };

            const infoFormat = "text/html";
            let url: string | null = null;
            let isWMS = false;

            if (theLayer.geoservice.type === "WMS") {
                url =
                    `https://data.geopf.fr/wms-v/ows?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo` +
                    `&FORMAT=image/png&TRANSPARENT=true` +
                    `&QUERY_LAYERS=${theLayer.geoservice.layer}&LAYERS=${theLayer.geoservice.layer}` +
                    `&INFO_FORMAT=${infoFormat}` +
                    `&I=${i}&J=${j}` +
                    `&CRS=${projectionCode}` +
                    `&STYLES=&WIDTH=${width}&HEIGHT=${height}` +
                    `&BBOX=${bbox.join(",")}`;
                isWMS = true;
            }

            if (theLayer.geoservice.type === "WMTS") {
                const wmtsInfo = computeWMTSFromCoordinate(e.coordinate as [number, number]);
                if (!wmtsInfo) return { html: "<em>Aucune donnée disponible</em>", coordinate: e.coordinate };

                const { tileMatrix, tileCol, tileRow, i: tileI, j: tileJ } = wmtsInfo;

                url =
                    `https://data.geopf.fr/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetFeatureInfo` +
                    `&LAYER=ORTHOIMAGERY.ORTHOPHOTOS` +
                    `&TILECOL=${tileCol}` +
                    `&TILEROW=${tileRow}` +
                    `&TILEMATRIX=${tileMatrix}` +
                    `&TILEMATRIXSET=PM` +
                    `&FORMAT=image/jpeg&STYLE=normal` +
                    `&INFOFORMAT=${infoFormat}` +
                    `&I=${tileI}` +
                    `&J=${tileJ}`;
                isWMS = false;
            }

            if (url) {
                const response = await fetch(url);
                const data = await response.text();
                const html = isWMS ? formatWMSPopup(data) : data;
                return { html, coordinate: e.coordinate };
            }

            return { html: "<em>Aucune donnée disponible</em>", coordinate: e.coordinate };
        },
        [map, selectedLayer, communityLayers, computeWMTSFromCoordinate, formatWMSPopup]
    );

    return { getFeatureInfoContent };
}
