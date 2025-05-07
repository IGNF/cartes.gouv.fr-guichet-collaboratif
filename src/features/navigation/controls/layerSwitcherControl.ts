import { MapLayer } from "@/constants/communities/types";
import LayerSwitcher from "geopf-extensions-openlayers/src/packages/Controls/LayerSwitcher/LayerSwitcher";

const layerSwitcherControl = (layers: MapLayer[]) => {
    return new LayerSwitcher({
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
};

export default layerSwitcherControl;
