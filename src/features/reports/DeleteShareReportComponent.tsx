import Button from "@codegouvfr/react-dsfr/Button";
import { Activity, useState } from "react";
import ConfirmDeleteShareReportModal from "./ConfirmDeleteShareReportModal";
import { useModalStore } from "@/store";
import ShareReportModal from "./ShareReportModal";
interface Props {
    handleDelete: () => void;
}
const DeleteShareReportComponent = ({ handleDelete }: Props) => {
    const [showActions, setShowActions] = useState<boolean>(false);
    const { deleteShareReportModal, shareReport } = useModalStore();
    return (
        <div className="report-deleteShare__wrapper">
            <Button
                iconId="ri-more-2-line"
                className="btn-show-actions fr-btn fr-btn--tertiary-no-outline"
                title="Afficher les actions"
                onClick={() => setShowActions(!showActions)}
            />

            <Activity mode={showActions ? "visible" : "hidden"}>
                <div className="report-deleteShare__container">
                    <Button priority="tertiary no outline" nativeButtonProps={deleteShareReportModal.buttonProps}>
                        Supprimer
                    </Button>
                    <Button priority="tertiary no outline" nativeButtonProps={shareReport.buttonProps}>
                        Partager
                    </Button>
                </div>
            </Activity>

            <ConfirmDeleteShareReportModal handleDelete={handleDelete} />
            <ShareReportModal />
        </div>
    );
};

export default DeleteShareReportComponent;
