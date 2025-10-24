import { useReportStore } from "@/store";
import Button from "@codegouvfr/react-dsfr/Button";
import Fade from "@mui/material/Fade";
import Tooltip from "@mui/material/Tooltip";
import { useCallback } from "react";

const AllReportsControl = () => {
    const { tableDrawerOpened, setTableDrawerOpened } = useReportStore();

    const displayTableReportsDrawer = useCallback(() => {
        setTableDrawerOpened(!tableDrawerOpened);
    }, [setTableDrawerOpened, tableDrawerOpened]);
    return (
        <Tooltip
            placement="left"
            arrow
            title="Afficher le tableau de signalement"
            slots={{ transition: Fade }}
            slotProps={{ tooltip: { onClick: displayTableReportsDrawer } }}
        >
            <Button iconId="fr-icon-discuss-line" className="btn-show-drawer fr-icon--sm" priority="tertiary" title="" onClick={displayTableReportsDrawer} />
        </Tooltip>
    );
};

export default AllReportsControl;
