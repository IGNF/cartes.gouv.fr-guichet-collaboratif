import { StatusMessage } from "@/constants/communities/types";
import { readImportedFile } from "@/constants/reports/utils";
import { useTranslation } from "@/i18n";
import { useCommunityStore, useMapStore } from "@/store";
import Layer from "ol/layer/Layer";
import VectorSource from "ol/source/Vector";
import { ChangeEvent, RefObject } from "react";

const inputAccept = ".gpx,.kml,.geojson";

const isFileAccepted = (type: string) => {
    const fileType = type.toLocaleLowerCase();
    return fileType.includes("kml") || fileType.includes("gpx") || fileType.includes("geojson");
};

interface Props {
    inputRef: RefObject<HTMLInputElement | null>;
}
const ImportSketchFile: React.FC<Props> = ({ inputRef }) => {
    const { addAlertMessage } = useCommunityStore();
    const { map } = useMapStore();

    const { t } = useTranslation({ ImportSketchFile });

    const drawingLayer = map?.getAllLayers().find((layer: Layer & { gpResultLayerId?: string }) => layer.gpResultLayerId === "drawing");
    const drawingSource = drawingLayer?.getSource() as VectorSource;

    const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files || [];
        Array.from(files).forEach((file) => {
            const splitedFileName = file.name.split(".");
            const fileType = file.type || splitedFileName[splitedFileName.length - 1];
            if (!isFileAccepted(fileType)) {
                addAlertMessage(StatusMessage.error, t("import_file_error", { fileName: file.name }));
                return;
            }

            try {
                readImportedFile(file, drawingSource);
            } catch {
                addAlertMessage(StatusMessage.error, t("import_file_error", { fileName: file.name }));
            }
        });
    };
    return <input ref={inputRef} type="file" accept={inputAccept} multiple style={{ display: "none" }} onChange={handleFileUpload} />;
};

export default ImportSketchFile;
