import { useCommunityStore } from "@/store";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import { useCallback } from "react";

export function useAddProtectedAreaLayer() {
    const geoservices = useCommunityStore((state) => state.geoservices);
    const addMapLayer = useCommunityStore((state) => state.addMapLayer);

    return useCallback(() => {
        const protectedLayerName = "PROTECTEDAREAS.PRSF";

        // Recherche du geoservice WMS contenant la couche souhaitée
        const service = geoservices.find((gs) => gs.type === "WMS" && gs.layers?.includes(protectedLayerName) && typeof gs.url === "string");

        if (!service) {
            console.warn(`Aucun service WMS trouvé pour la couche ${protectedLayerName}`);
            return;
        }

        // Création dynamique de la couche WMS
        const layer = new TileLayer({
            source: new TileWMS({
                url: service.url,
                params: {
                    LAYERS: protectedLayerName,
                    TILED: true,
                },
                serverType: "geoserver",
            }),
            visible: true,
        });

        layer.set("title", `Zones protégées - ${service.name}`);
        layer.set("name", protectedLayerName);
        layer.set("infoFormat", "text/html");

        // Ajout dans le store via addMapLayer
        addMapLayer({
            title: `Zones protégées - ${service.name}`,
            order: 999,
            source: layer,
        });
    }, [addMapLayer, geoservices]);
}
