import { memo, useCallback, useEffect } from "react";
import ButtonControl from "./ButtonControl";
import { useMapStore } from "@/store";
import AllReportsControl from "./AllReportsControl";
import { useTranslation } from "@/i18n";
import useCustomControlsList from "@/hooks/navigation/controls/useCustomControlsList";
import CenterReportControl from "./CenterReportControl";
import ConfirmCopyModal from "./ConfirmCopyModal";
import AddOrRemoveSnapInteraction from "./interactions/AddOrRemoveSnapInteraction";
import useGetInteractionsFuncs from "@/hooks/navigation/controls/useGetInteractionsFuncs";
import AddOrRemoveMapControlInteraction from "./interactions/AddOrRemoveMapControlInteraction";
import useGetInteractions from "@/hooks/navigation/controls/useGetInteractions";

const CustomControls = () => {
    const { clickedControl, setClickedControl } = useMapStore();

    const { t } = useTranslation({ CustomControls });

    const constrolsList = useCustomControlsList(t);

    const interactions = useGetInteractions();
    const interactionsFuncs = useGetInteractionsFuncs(interactions);

    const clickToolButton = useCallback(() => {
        if (!clickedControl || clickedControl?.interaction || clickedControl?.disabled) return;
        const controlButton = document.querySelector(`button[id^='${clickedControl?.target}'`) as HTMLButtonElement;
        if (controlButton) {
            controlButton.click();
            if (controlButton.classList.contains("active")) {
                setClickedControl(null);
            }
        }
    }, [clickedControl, setClickedControl]);

    useEffect(() => {
        clickToolButton();
        return () => {
            clickToolButton();
        };
    }, [clickToolButton]);

    return (
        <>
            <div className="custom-controls">
                <div className="control-btns">
                    {constrolsList.map((control) => {
                        return <ButtonControl key={`custom-control-${control.id}`} control={control} handleClick={interactionsFuncs.handleClick} />;
                    })}
                </div>
                <div className="all-reports-btn">
                    <AllReportsControl />
                </div>
                <CenterReportControl />
            </div>
            <AddOrRemoveMapControlInteraction {...interactionsFuncs} {...interactions} />
            <AddOrRemoveSnapInteraction {...interactions} />
            <ConfirmCopyModal />
        </>
    );
};

export default memo(CustomControls);
