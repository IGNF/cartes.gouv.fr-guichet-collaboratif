import { Control, ScaleLine } from "ol/control";
import { Collection } from "ol";
import { useTranslation } from "@/i18n";
import { translateLayerSwitcherControl } from "@/constants/communities/utils";
import DrawingControl from "./DrawingControl";
import useGetToolsControls from "./ToolsControl";

const useGetMapControls = (): Collection<Control> | Control[] | undefined => {
    const drawingControl = DrawingControl();
    const toolsControls = useGetToolsControls();
    const { t } = useTranslation({ useGetMapControls });
    setTimeout(() => {
        translateLayerSwitcherControl(t);
    }, 100);

    return [new ScaleLine(), ...toolsControls, drawingControl];
};

export default useGetMapControls;
