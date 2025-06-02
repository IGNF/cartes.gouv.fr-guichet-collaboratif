import { fr } from "@codegouvfr/react-dsfr";
import ControlExtended from "geopf-extensions-openlayers/src/packages/Controls/Control";

const divElement = document.createElement("div");
divElement.className = "custom-button-top-right";

const buttonCenterToFeature = document.createElement("button");
const spanButtonCenterToFeature = document.createElement("span");
buttonCenterToFeature.appendChild(spanButtonCenterToFeature);

buttonCenterToFeature.className = `center-feature GPshowOpen GPshowAdvancedToolPicto GPshowLayersListPicto gpf-btn gpf-btn--tertiary gpf-btn-icon fr-btn fr-btn--tertiary ${fr.cx("ri-focus-mode")}`;
buttonCenterToFeature.onclick = () => {
    const event = new CustomEvent("center-to-feature");
    document.dispatchEvent(event);
};
buttonCenterToFeature.setAttribute("title", "Centrer la carte sur le signalement");
buttonCenterToFeature.setAttribute("aria-label", "Centrer la carte sur le signalement");
buttonCenterToFeature.setAttribute("tabindex", "0");
buttonCenterToFeature.setAttribute("aria-pressed", "false");
buttonCenterToFeature.setAttribute("type", "button");
buttonCenterToFeature.style.display = "none";

const buttonFeatureToCenter = document.createElement("button");
const spanButtonFeatureToCenter = document.createElement("span");
buttonFeatureToCenter.appendChild(spanButtonFeatureToCenter);
buttonFeatureToCenter.className = `center-feature GPshowOpen GPshowAdvancedToolPicto GPshowLayersListPicto gpf-btn gpf-btn--tertiary gpf-btn-icon fr-btn fr-btn--tertiary ${fr.cx("ri-focus-line")}`;
buttonFeatureToCenter.onclick = () => {
    const event = new CustomEvent("feature-to-center");
    document.dispatchEvent(event);
};

buttonFeatureToCenter.setAttribute("title", "Déplacer le signalement au centre de la carte");
buttonFeatureToCenter.setAttribute("aria-label", "Déplacer le signalement au centre de la carte");
buttonFeatureToCenter.setAttribute("tabindex", "0");
buttonFeatureToCenter.setAttribute("aria-pressed", "false");
buttonFeatureToCenter.setAttribute("type", "button");
buttonFeatureToCenter.style.display = "none";

const centerViewToFeatureControl = new ControlExtended({
    id: "center-feature",
    element: divElement,
    listable: true,
    position: "top-right",
    description: "hello",
});

centerViewToFeatureControl.setPosition("top-right");

divElement.appendChild(buttonCenterToFeature);
divElement.appendChild(buttonFeatureToCenter);

export default centerViewToFeatureControl;
