import { createRoot } from "react-dom/client";
import FeatureTypeLayerLegends from "./features/navigation/layers/legends/FeatureTypeLayerLegends";

const targetElementId = "feature-type-style";

export const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
        for (const node of mutation.addedNodes) {
            if (node.nodeType === 1) {
                const found = (node as HTMLElement).id === targetElementId ? node : (node as HTMLElement).querySelector(`#${targetElementId}`);

                if (found && found instanceof HTMLElement) {
                    createRoot(found as HTMLElement).render(<FeatureTypeLayerLegends />);
                    //observer.disconnect();
                }
            }
        }
    }
});
