import { useEffect } from "react";
import Map from "ol/Map";
import Overlay from "ol/Overlay";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import GeoJSON from "ol/format/GeoJSON";
import { MapBrowserEvent } from "ol";

type Props = {
    map: Map | null;
};

export const GetFeatureInfosHandler = ({ map }: Props) => {
    useEffect(() => {
        if (!map) return;

        const popupContainer = document.createElement("div");
        popupContainer.id = "popup";
        popupContainer.style.position = "absolute";
        popupContainer.style.backgroundColor = "white";
        popupContainer.style.border = "1px solid #ccc";
        popupContainer.style.borderRadius = "6px";
        popupContainer.style.padding = "10px";
        popupContainer.style.zIndex = "1000";
        popupContainer.style.minWidth = "300px";
        document.body.appendChild(popupContainer);

        const overlay = new Overlay({
            element: popupContainer,
            autoPan: true,
        });
        map.addOverlay(overlay);

        const handleClick = async (evt: MapBrowserEvent<UIEvent>) => {
            const view = map.getView();
            const resolution = view.getResolution();
            const projection = view.getProjection();

            if (!resolution) return;

            const layers = map.getLayers().getArray();
            const wmsLayer = layers.find((l) => l instanceof TileLayer && l.getSource() instanceof TileWMS) as TileLayer<TileWMS> | undefined;

            if (!wmsLayer) {
                popupContainer.innerHTML = "<em>Aucune couche WMS trouvée</em>";
                return;
            }

            const url = wmsLayer.getSource()?.getFeatureInfoUrl(evt.coordinate, resolution, projection, {
                INFO_FORMAT: "application/json",
                FEATURE_COUNT: 5,
            });

            if (!url) {
                popupContainer.innerHTML = "<em>URL invalide</em>";
                return;
            }

            try {
                const res = await fetch(url);
                const text = await res.text();

                let content = "";

                try {
                    const json = JSON.parse(text);
                    const features = new GeoJSON().readFeatures(json);

                    if (features.length > 0) {
                        content = features
                            .map(
                                (f) => `
                                <div>
                                    <strong>Description:</strong> ${f.get("Description") || "N/A"}<br/>
                                    <strong>Commune:</strong> ${f.get("Commune") || "N/A"}<br/>
                                </div>
                                `
                            )
                            .join("<hr/>");
                    } else {
                        content = "<em>Aucune entité trouvée</em>";
                    }
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                } catch (err) {
                    console.warn("Réponse non JSON, fallback HTML");
                    content = text;
                }

                popupContainer.innerHTML = content;
                overlay.setPosition(evt.coordinate);
            } catch (error) {
                console.error("Erreur lors du fetch :", error);
                popupContainer.innerHTML = "<em>Erreur de récupération</em>";
            }
        };

        map.on("singleclick", handleClick);

        return () => {
            map.un("singleclick", handleClick);
            map.removeOverlay(overlay);
            popupContainer.remove();
        };
    }, [map]);

    return null;
};
