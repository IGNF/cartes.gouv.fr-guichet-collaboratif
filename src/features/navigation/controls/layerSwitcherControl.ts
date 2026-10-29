import { LayerGroupSource } from "@/classes/LayerGroupSource";
import { MapLayer } from "@/constants/communities/types";
import LayerSwitcher from "geopf-extensions-openlayers/src/packages/Controls/LayerSwitcher/LayerSwitcher";
import BaseEvent from "ol/events/Event";
import BaseLayer from "ol/layer/Base";
import Layer from "ol/layer/Layer";
import VectorLayer from "ol/layer/Vector";

class LayerSwitcherEditEvent extends BaseEvent {
    constructor(
        public readonly layer: Layer,
        public readonly options: unknown
    ) {
        super("layerswitcher:edit");
    }
}

const symbologyLayerTypes = [LayerGroupSource, VectorLayer] as unknown as BaseLayer[];

const layerSwitcherControl = (layers: MapLayer[], symbologyLabel: string): LayerSwitcher => {
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
            allowDelete: false,
            advancedTools: [
                { key: LayerSwitcher.switcherButtons.INFO },
                {
                    label: symbologyLabel,
                    icon: "fr-icon-pencil-line",
                    accepted: symbologyLayerTypes,
                    cb: (_event: PointerEvent, layerSwitcher: LayerSwitcher, layer: Layer, options: unknown) => {
                        layerSwitcher.dispatchEvent(new LayerSwitcherEditEvent(layer, options));
                    },
                },
                { key: LayerSwitcher.switcherButtons.GREYSCALE },
                { key: LayerSwitcher.switcherButtons.EXTENT },
            ],
        },
    });

    return switcher;
};

export default layerSwitcherControl;
