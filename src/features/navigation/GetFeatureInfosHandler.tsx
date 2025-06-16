/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect } from "react";
import { MapBrowserEvent } from "ol";
import Overlay from "ol/Overlay";
import Map from "ol/Map";
import { useCommunityStore } from "@/store";
import { useMapStore } from "@/store/useMapStore"; // 👉 pour accéder à selectedLayer

type Props = {
    map: Map | null;
};

//const queryableWMTSLayers = ["ORTHOIMAGERY.ORTHOPHOTOS"];

function computeWMTS(coordinate: [number, number], zoom: number) {
    const tileSize = 256;
    const originX = -20037508.342789244;
    const originY = 20037508.342789244;
    const resolution = (2 * 20037508.342789244) / (tileSize * Math.pow(2, zoom));
    const tileCol = Math.floor((coordinate[0] - originX) / (tileSize * resolution));
    const tileRow = Math.floor((originY - coordinate[1]) / (tileSize * resolution));
    const tileOriginX = originX + tileCol * tileSize * resolution;
    const tileOriginY = originY - tileRow * tileSize * resolution;
    const pixelI = Math.floor((coordinate[0] - tileOriginX) / resolution);
    const pixelJ = Math.floor((tileOriginY - coordinate[1]) / resolution);

    return {
        tileMatrix: zoom.toString(),
        tileCol,
        tileRow,
        i: pixelI,
        j: pixelJ,
    };
}

function extractValueByLabel(container: HTMLElement, label: string): string {
    const tds = container.querySelectorAll("td");
    for (let i = 0; i < tds.length; i++) {
        if (tds[i].textContent?.trim() === label && tds[i + 1]) {
            return tds[i + 1].textContent?.trim() ?? "";
        }
    }
    return "";
}

function formatWMSPopup(rawHtml: string): string {
    const div = document.createElement("div");
    div.innerHTML = rawHtml;

    const description = extractValueByLabel(div, "Description");
    const commune = extractValueByLabel(div, "Situé sur la commune");
    const panneau = extractValueByLabel(div, "Présence de panneau");
    const longitude = extractValueByLabel(div, "Longitude");
    const latitude = extractValueByLabel(div, "Latitude");
    const dfci = extractValueByLabel(div, "Coordonnées DFCI");

    return `
        <div>
            <strong>Description:</strong> ${description}<br/>
            <strong>Situé sur la commune de :</strong> ${commune}<br/>
            <strong>Présence de panneau:</strong> ${panneau}<br/>
            <strong>Longitude:</strong> ${longitude}<br/>
            <strong>Latitude:</strong> ${latitude}<br/>
            <strong>Coordonnées DFCI :</strong> ${dfci}
        </div>`;
}

export const GetFeatureInfosHandler = ({ map }: Props) => {
    const { communityLayers } = useCommunityStore();
    const { selectedLayer } = useMapStore(); // ✅ ici on récupère la couche sélectionnée

    useEffect(() => {
        if (!map) return;

        const popupContainer = document.createElement("div");
        popupContainer.id = "popup";
        popupContainer.style.position = "absolute";
        popupContainer.style.backgroundColor = "white";
        popupContainer.style.border = "1px solid #ccc";
        popupContainer.style.borderRadius = "6px";
        popupContainer.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
        popupContainer.style.zIndex = "1000";
        popupContainer.style.minWidth = "320px";
        popupContainer.style.maxWidth = "400px";
        popupContainer.style.overflow = "hidden";

        popupContainer.innerHTML = `
            <div id="popup-header" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-bottom: 1px solid #eee;">
                <div style="font-weight: bold; font-size: 16px; color: #007BFF;">Information</div>
                <button id="popup-close" style="background: none; border: none; font-size: 20px; cursor: pointer;">✕</button>
            </div>
            <div id="popup-content" style="padding: 12px;">Chargement...</div>
        `;

        document.body.appendChild(popupContainer);

        const overlay = new Overlay({
            element: popupContainer,
            autoPan: true,
        });
        map.addOverlay(overlay);

        popupContainer.querySelector("#popup-close")?.addEventListener("click", () => {
            overlay.setPosition(undefined);
        });

        const handleMapClick = async (e: MapBrowserEvent<UIEvent>) => {
            const view = map.getView();
            const projectionCode = view.getProjection().getCode();
            const mapSize = map.getSize();
            if (!mapSize || !selectedLayer) return;

            const zoom = Math.floor(view.getZoom() ?? 0);
            const [width, height] = mapSize;
            const bbox = view.calculateExtent(mapSize);
            const pixel = map.getPixelFromCoordinate(e.coordinate);
            const i = Math.round(pixel?.[0] ?? width / 2);
            const j = Math.round(pixel?.[1] ?? height / 2);

            const contentDiv = popupContainer.querySelector("#popup-content");

            let popupContent = "";

            console.log("👉 selectedLayer:", selectedLayer);
            console.log(
                "🧩 communityLayers:",
                communityLayers?.map((l) => ({ title: l.geoservice.title, geo: l.geoservice }))
            );
            const normalized = (s: string) =>
                s
                    ?.normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .toLowerCase()
                    .trim();

            const theLayer = communityLayers.filter((layer) => normalized(layer.geoservice.title || "") === normalized(selectedLayer || ""))?.at(0);
            let urlCalled = null;
            const infoFormat = "text/html";
            let is_WMS_Layer = null;

            console.log("👉 theLayer:", theLayer);
            if (typeof theLayer !== "undefined" && theLayer !== null) {
                switch (theLayer?.geoservice?.type) {
                    case "WMS":
                        urlCalled =
                            `https://data.geopf.fr/wms-v/ows?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo` +
                            `&FORMAT=image/png&TRANSPARENT=true` +
                            `&QUERY_LAYERS=${theLayer.geoservice.layer}&LAYERS=${theLayer.geoservice.layer}` +
                            `&INFO_FORMAT=${infoFormat}` +
                            `&I=${i}&J=${j}` +
                            `&CRS=${projectionCode}` +
                            `&STYLES=&WIDTH=${width}&HEIGHT=${height}` +
                            `&BBOX=${bbox.join(",")}`;
                        is_WMS_Layer = true;
                        console.log("Le type du layer est WMS");
                        console.log("Nom de la couche WMS appelée:", theLayer.geoservice.layer);
                        break;
                    case "WMTS":
                        // eslint-disable-next-line no-case-declarations
                        const { tileMatrix, tileCol, tileRow, i: tileI, j: tileJ } = computeWMTS(e.coordinate as [number, number], zoom);
                        urlCalled =
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
                        is_WMS_Layer = false;
                        console.log("Un layer du type WMTS match");
                        break;
                    default:
                        console.log("type inconnu");
                }

                if (urlCalled != null) {
                    const response = await fetch(urlCalled);
                    const data = await response.text();

                    if (is_WMS_Layer) {
                        popupContent = formatWMSPopup(data);
                    } else if (!is_WMS_Layer) {
                        popupContent = data;
                    }
                    console.log("data", data);
                }
            }

            if (contentDiv) {
                contentDiv.innerHTML = popupContent.trim() || "<em>Aucune donnée disponible</em>";
            }

            overlay.setPosition(e.coordinate);
        };

        map.on("singleclick", handleMapClick);

        return () => {
            map.un("singleclick", handleMapClick);
            map.removeOverlay(overlay);
            popupContainer.remove();
        };
    }, [map, communityLayers, selectedLayer]);

    return null;
};
