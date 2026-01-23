import { MapLayer } from "@/constants/communities/types";
import LayerSwitcher from "geopf-extensions-openlayers/src/packages/Controls/LayerSwitcher/LayerSwitcher";
import Layer from "ol/layer/Layer";

const layerSwitcherControl = (layers: MapLayer[]): LayerSwitcher => {
    const switcher = new LayerSwitcher({
        layers: layers.map((layer) => {
            return {
                layer: layer.source as Layer,
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
            allowTooltips: true,
        },
    });

    return switcher;
};

export default layerSwitcherControl;
