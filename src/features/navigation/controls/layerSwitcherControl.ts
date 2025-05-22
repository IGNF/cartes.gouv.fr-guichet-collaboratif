import { MapLayer } from "@/constants/communities/types";
import LayerSwitcher from "geopf-extensions-openlayers/src/packages/Controls/LayerSwitcher/LayerSwitcher";

const layerSwitcherControl: typeof LayerSwitcher = (layers: MapLayer[]) => {
    const switcher = new LayerSwitcher({
        layers: layers.map((layer) => {
            return {
                layer: layer.source,
                config: {
                    id: layer.order,
                    title: layer.title,
                },
            };
        }),
        options: {
            position: "top-right",
            collapsed: true,
            panel: true,
            counter: true,
        },
    });

    /* const originalAddLayer = switcher.addLayer.bind(switcher);

    switcher.addLayer = function (layer, container) {
        // Your custom code
        if (layer.get("title") === "Mon Croquis") {
            console.log("Custom logic for layer:", layer.get("title"), this);
            return;
        }

        // Call the original
        originalAddLayer(layer, container);

        // Or do something after
    }; */

    return switcher;
};

export default layerSwitcherControl;
