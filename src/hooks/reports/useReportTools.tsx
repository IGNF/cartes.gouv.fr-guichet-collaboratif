import { ReportTool, toolNames } from "@/constants/reports/types";
import CreateLabelImg from "geopf-extensions-openlayers/src/packages/CSS/Controls/Drawing/img/dsfr/create-label.svg";
import CreateLineImg from "geopf-extensions-openlayers/src/packages/CSS/Controls/Drawing/img/dsfr/create-line.svg";
import CreatePointImg from "geopf-extensions-openlayers/src/packages/CSS/Controls/Drawing/img/dsfr/create-point.svg";
import CreatePolygonImg from "geopf-extensions-openlayers/src/packages/CSS/Controls/Drawing/img/dsfr/create-polygon.svg";
import ImportFileImg from "../../img/reports/import_file.svg";
import DeleteImg from "geopf-extensions-openlayers/src/packages/CSS/Controls/Drawing/img/dsfr/delete.svg";
import EditGeomImg from "geopf-extensions-openlayers/src/packages/CSS/Controls/Drawing/img/dsfr/edit-geom.svg";
import EditStyleImg from "geopf-extensions-openlayers/src/packages/CSS/Controls/Drawing/img/dsfr/edit-style.svg";
import EditTextImg from "geopf-extensions-openlayers/src/packages/CSS/Controls/Drawing/img/dsfr/edit-text.svg";
import { useMemo } from "react";
import { useTranslation } from "@/i18n";

const useReportTools = (): ReportTool[] => {
    const { t } = useTranslation({ useReportTools });
    const reportTools = useMemo(
        () => [
            { type: "create", name: toolNames.point, imgSrc: CreatePointImg, order: 0, title: t("point_title"), featureType: ["Point"] },
            { type: "create", name: toolNames.line, imgSrc: CreateLineImg, order: 1, title: t("line_title"), featureType: ["LineString"] },
            { type: "create", name: toolNames.polygon, imgSrc: CreatePolygonImg, order: 2, title: t("polygon_title"), featureType: ["Polygon"] },
            { type: "create", name: toolNames.text, imgSrc: CreateLabelImg, order: 3, title: t("text_title") },
            { type: "create", name: toolNames.import, imgSrc: ImportFileImg, order: 4, title: t("import_title") },
            { type: "edit", name: toolNames.edit, imgSrc: EditStyleImg, order: 0, title: t("edit_title") },
            { type: "edit", name: toolNames.display, imgSrc: EditGeomImg, order: 1, title: t("edit_style") },
            { type: "edit", name: toolNames.tooltip, imgSrc: EditTextImg, order: 2, title: t("tooltip_title") },
            { type: "edit", name: toolNames.remove, imgSrc: DeleteImg, order: 3, title: t("remove_title") },
        ],
        [t]
    );

    return reportTools;
};

export default useReportTools;
