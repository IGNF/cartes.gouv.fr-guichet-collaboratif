import { fr } from "@codegouvfr/react-dsfr";
import ControlExtended from "geopf-extensions-openlayers/src/packages/Controls/Control";

const divElement = document.createElement("div");
divElement.className = "custom-button-top-right";

const buttonCenterToReport = document.createElement("button");
const spanButtonCenterToReport = document.createElement("span");
buttonCenterToReport.appendChild(spanButtonCenterToReport);

buttonCenterToReport.className = `center-feature GPshowOpen GPshowAdvancedToolPicto GPshowLayersListPicto gpf-btn gpf-btn--tertiary gpf-btn-icon fr-btn fr-btn--tertiary ${fr.cx("ri-focus-mode")}`;
buttonCenterToReport.onclick = () => {
    const event = new CustomEvent("center-to-feature");
    document.dispatchEvent(event);
};
buttonCenterToReport.setAttribute("title", "Centrer la carte sur le signalement");
buttonCenterToReport.setAttribute("aria-label", "Centrer la carte sur le signalement");
buttonCenterToReport.setAttribute("tabindex", "0");
buttonCenterToReport.setAttribute("aria-pressed", "false");
buttonCenterToReport.setAttribute("type", "button");
buttonCenterToReport.style.display = "none";

const buttonReportToCenter = document.createElement("button");
const spanButtonReportToCenter = document.createElement("span");
buttonReportToCenter.appendChild(spanButtonReportToCenter);
buttonReportToCenter.className = `center-feature GPshowOpen GPshowAdvancedToolPicto GPshowLayersListPicto gpf-btn gpf-btn--tertiary gpf-btn-icon fr-btn fr-btn--tertiary ${fr.cx("ri-focus-line")}`;
buttonReportToCenter.onclick = () => {
    const event = new CustomEvent("feature-to-center");
    document.dispatchEvent(event);
};

buttonReportToCenter.setAttribute("title", "Déplacer le signalement au centre de la carte");
buttonReportToCenter.setAttribute("aria-label", "Déplacer le signalement au centre de la carte");
buttonReportToCenter.setAttribute("tabindex", "0");
buttonReportToCenter.setAttribute("aria-pressed", "false");
buttonReportToCenter.setAttribute("type", "button");
buttonReportToCenter.style.display = "none";

const centerViewToReportControl = new ControlExtended({
    id: "center-feature",
    element: divElement,
    listable: true,
    position: "top-right",
    description: "hello",
});

centerViewToReportControl.setPosition("top-right");

divElement.appendChild(buttonCenterToReport);
divElement.appendChild(buttonReportToCenter);

export default centerViewToReportControl;
