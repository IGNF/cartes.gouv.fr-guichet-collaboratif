import Catalog from "geopf-extensions-openlayers/src/packages/Controls/Catalog/Catalog";

export const catalogControl = new Catalog({
    collapsed: true,
    draggable: true,
    titlePrimary: "",
    titleSecondary: "Gérer vos couches de données",
    layerLabel: "title",
    layerFilter: [],
    search: {
        display: true,
        criteria: ["name", "title", "description"],
    },
    addToMap: true,
    categories: [
        {
            title: "Données",
            id: "data",
            default: true,
            filter: null,
            // sous categories
            // items : [
            //     {
            //         title : "",
            //         default : true,
            //         filter : {
            //             field : "",
            //             value : ""
            //         }
            //     }
            // ]
        },
    ],
    configuration: {
        type: "json", // type:"service"
        urls: [
            // data:{}
            "https://raw.githubusercontent.com/IGNF/cartes.gouv.fr-entree-carto/main/public/data/layers.json",
            "https://raw.githubusercontent.com/IGNF/cartes.gouv.fr-entree-carto/main/public/data/edito.json",
        ],
    },
    position: "top-left",
});
