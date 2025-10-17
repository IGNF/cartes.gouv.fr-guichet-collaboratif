import Button from "@codegouvfr/react-dsfr/Button";
import { CustomControlItem } from "@/constants/communities/types";
import Tooltip from "@mui/material/Tooltip";
import Fade from "@mui/material/Fade";
import { useMapStore } from "@/store";
import { useCallback } from "react";

interface Props {
    control: CustomControlItem;
    handleClick: (control: CustomControlItem) => void;
}

const ButtonControl: React.FC<Props> = ({ control, handleClick }) => {
    const { clickedControl, setClickedControl } = useMapStore();

    const onClick = useCallback(() => {
        handleClick(control);
        setClickedControl(control === clickedControl ? null : control);

        if (control.interaction) return;
        const controlButton = document.querySelector(`button[id^='${control?.target}'`) as HTMLButtonElement;
        if (controlButton) {
            controlButton.click();
            if (controlButton.getAttribute("aria-pressed") === "false") {
                setClickedControl(null);
            }
        }
    }, [clickedControl, control, setClickedControl, handleClick]);
    return (
        <Tooltip
            placement="left"
            arrow
            title={control.title}
            slots={{ transition: Fade }}
            enterDelay={0}
            leaveDelay={0}
            slotProps={{ tooltip: { onClick: () => handleClick(control) } }}
        >
            <Button
                iconId={control.icon}
                title=""
                priority={clickedControl?.id === control.id ? "primary" : "tertiary no outline"}
                onClick={onClick}
                nativeButtonProps={{
                    "aria-label": control.title,
                    "data-fr-js-button-actionee": "true",
                    "aria-pressed": clickedControl?.id === control.id,
                }}
                disabled={control.disabled}
            />
        </Tooltip>
    );
};

export default ButtonControl;
