import Button from "@codegouvfr/react-dsfr/Button";
import { CustomControlItem } from "@/constants/communities/types";
import Tooltip from "@mui/material/Tooltip";
import Fade from "@mui/material/Fade";
import { useMapStore } from "@/store";

interface Props {
    control: CustomControlItem;
    onClick: (control: CustomControlItem) => void;
}

const ButtonControl: React.FC<Props> = ({ control, onClick }) => {
    const { clickedControl, showMapWorkingLayerSelect } = useMapStore();

    return (
        <Tooltip
            placement="left"
            arrow
            title={showMapWorkingLayerSelect ? control.title : undefined}
            slots={{ transition: Fade }}
            enterDelay={0}
            leaveDelay={0}
            slotProps={{ tooltip: { onClick: () => onClick(control) } }}
            disableInteractive={control.disabled}
        >
            <Button
                iconId={control.icon}
                title=""
                priority={clickedControl?.id === control.id ? "primary" : "tertiary no outline"}
                onClick={() => onClick(control)}
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
