import { useTranslation } from "@/i18n";
import Catalog from "geopf-extensions-openlayers/src/packages/Controls/Catalog/Catalog";

const CatalogControl: React.FC = () => {
    const { t } = useTranslation({ CatalogControl });
    return new Catalog({
        collapsed: true,
        draggable: true,
        titlePrimary: "",
        titleSecondary: t("title_secondary"),
        layerLabel: t("layer_label"),
        layerFilter: [],
        search: {
            display: true,
            criteria: ["name", "title", "description"],
        },
        addToMap: true,
        categories: [
            {
                title: t("categories_title"),
                id: "data",
                default: true,
                filter: null,
            },
        ],
        configuration: {
            type: "json",
            urls: [],
        },
        position: "top-left",
    });
};

export default CatalogControl;
