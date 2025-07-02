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

    return switcher;
};

export default layerSwitcherControl;
