import { StatusMessage } from "@/constants/communities/types";
import { readImportedFile } from "@/constants/reports/utils";
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

    const drawingLayer = map?.getAllLayers().find((layer: Layer & { gpResultLayerId?: string }) => layer.gpResultLayerId === "drawing");
    const drawingSource = drawingLayer?.getSource() as VectorSource;

    const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files || [];
        Array.from(files).forEach((file) => {
            const splitedFileName = file.name.split(".");
            const fileType = file.type || splitedFileName[splitedFileName.length - 1];
            if (!isFileAccepted(fileType)) {
                addAlertMessage(
                    StatusMessage.error,
                    `Le fichier "${file.name}" ne peut pas être importé. Seuls les formats kml, gpx et geojson sont supportés`
                );
                return;
            }

            try {
                readImportedFile(file, drawingSource);
            } catch (error) {
                addAlertMessage(
                    StatusMessage.error,
                    `Le fichier "${file.name}" ne peut pas être importé. Seuls les formats kml, gpx et geojson sont supportés`
                );
                console.error(error);
            }
        });
    };
    return <input ref={inputRef} type="file" accept={inputAccept} multiple style={{ display: "none" }} onChange={handleFileUpload} />;
};

export default ImportSketchFile;
