import { ReportTool, toolNames } from "./types";
import CreateLabelImg from "geopf-extensions-openlayers/src/packages/CSS/Controls/Drawing/img/dsfr/create-label.svg";
import CreateLineImg from "geopf-extensions-openlayers/src/packages/CSS/Controls/Drawing/img/dsfr/create-line.svg";
import CreatePointImg from "geopf-extensions-openlayers/src/packages/CSS/Controls/Drawing/img/dsfr/create-point.svg";
import CreatePolygonImg from "geopf-extensions-openlayers/src/packages/CSS/Controls/Drawing/img/dsfr/create-polygon.svg";
import DeleteImg from "geopf-extensions-openlayers/src/packages/CSS/Controls/Drawing/img/dsfr/delete.svg";
import EditGeomImg from "geopf-extensions-openlayers/src/packages/CSS/Controls/Drawing/img/dsfr/edit-geom.svg";
import EditStyleImg from "geopf-extensions-openlayers/src/packages/CSS/Controls/Drawing/img/dsfr/edit-style.svg";
import EditTextImg from "geopf-extensions-openlayers/src/packages/CSS/Controls/Drawing/img/dsfr/edit-text.svg";

export const reportTools: ReportTool[] = [
    { type: "create", name: toolNames.point, imgSrc: CreatePointImg, order: 0, title: "Créer un signalement", featureType: "Point" },
    { type: "create", name: toolNames.line, imgSrc: CreateLineImg, order: 1, title: "Dessiner des lignes", featureType: "LineString" },
    { type: "create", name: toolNames.polygon, imgSrc: CreatePolygonImg, order: 2, title: "Dessiner des polygones", featureType: "Polygon" },
    { type: "create", name: toolNames.text, imgSrc: CreateLabelImg, order: 3, title: "Ecrire sur la carte", featureType: "Write" },
    { type: "edit", name: toolNames.edit, imgSrc: EditGeomImg, order: 0, title: "Editer les georèmes" },
    { type: "edit", name: toolNames.display, imgSrc: EditStyleImg, order: 1, title: "Editer le style" },
    { type: "edit", name: toolNames.tooltip, imgSrc: EditTextImg, order: 2, title: "Editer le texte" },
    { type: "edit", name: toolNames.remove, imgSrc: DeleteImg, order: 3, title: "Supprimer des objets" },
];
