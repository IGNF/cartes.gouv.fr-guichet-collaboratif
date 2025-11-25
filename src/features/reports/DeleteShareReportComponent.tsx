import Button from "@codegouvfr/react-dsfr/Button";
import { useState } from "react";
import ConfirmDeleteShareReportModal from "./ConfirmDeleteShareReportModal";
import { useModalStore } from "@/store";
// import "../../css/report-deleteShare.css";
interface Props {
    handleDelete: () => void;
}
const DeleteShareReportComponent = ({ handleDelete }: Props) => {
    const [showActions, setShowActions] = useState<boolean>(false);
    const { deleteShareReportModal } = useModalStore();
    return (
        <div className="report-deleteShare__wrapper">
            <Button
                iconId="ri-more-2-line"
                className="btn-show-actions fr-btn fr-btn--tertiary-no-outline"
                title="Afficher les actions"
                onClick={() => setShowActions(!showActions)}
            />

            {showActions && (
                <div className="report-deleteShare__container">
                    <Button priority="tertiary no outline" nativeButtonProps={deleteShareReportModal.buttonProps}>
                        Supprimer
                    </Button>
                    <Button priority="tertiary no outline">Partager</Button>
                </div>
            )}
            <ConfirmDeleteShareReportModal handleDelete={handleDelete} />
        </div>
    );
};

export default DeleteShareReportComponent;
