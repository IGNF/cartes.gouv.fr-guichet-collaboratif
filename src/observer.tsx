import { createRoot } from "react-dom/client";
import FeatureTypeLayerLegends from "./features/navigation/layers/legends/FeatureTypeLayerLegends";
import { LAYER_SWITCHER_INFO_ID } from "./constants";

export const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
        for (const node of mutation.addedNodes) {
            if (node.nodeType === 1) {
                const found = (node as HTMLElement).id === LAYER_SWITCHER_INFO_ID ? node : (node as HTMLElement).querySelector(`#${LAYER_SWITCHER_INFO_ID}`);

                if (found && found instanceof HTMLElement) {
                    createRoot(found as HTMLElement).render(<FeatureTypeLayerLegends />);
                    //observer.disconnect();
                }
            }
        }
    }
});
