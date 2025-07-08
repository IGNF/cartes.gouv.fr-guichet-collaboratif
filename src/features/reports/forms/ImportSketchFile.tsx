import { StatusMessage } from "@/constants/communities/types";
import { readImportedFile } from "@/constants/reports/utils";
import { useCommunityStore, useMapStore } from "@/store";
import Layer from "ol/layer/Layer";
import VectorSource from "ol/source/Vector";
import { ChangeEvent, RefObject } from "react";

const inputAccept = ".gpx,.kml,.geojson";

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
            const fileType = file.type || file.name.split(".")[1];
            if (!inputAccept.includes(fileType)) {
                addAlertMessage(StatusMessage.error, `Le fichier "${file.name}" n'est pas supporté`);
                return;
            }

            try {
                readImportedFile(file, drawingSource);
            } catch (error) {
                addAlertMessage(StatusMessage.error, `Le fichier "${file.name}" n'est pas supporté`);
                console.error(error);
            }
        });
    };
    return <input ref={inputRef} type="file" accept={inputAccept} multiple style={{ display: "none" }} onChange={handleFileUpload} />;
};

export default ImportSketchFile;
