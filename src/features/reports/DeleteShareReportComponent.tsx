import Button from "@codegouvfr/react-dsfr/Button";
import { useMemo, useState } from "react";
import ConfirmDeleteShareReportModal from "./ConfirmDeleteShareReportModal";
import { useCommunityStore, useModalStore } from "@/store";
import ShareReportModal from "./ShareReportModal";
import { useGetUserProfileAPI } from "@/api/userData";
interface Props {
    handleDelete: () => void;
}
const DeleteShareReportComponent = ({ handleDelete }: Props) => {
    const [showActions, setShowActions] = useState<boolean>(false);
    const { deleteShareReportModal, shareReport } = useModalStore();

    const { community } = useCommunityStore();

    const { data: userData } = useGetUserProfileAPI();
    const isAdmin = useMemo(() => {
        const currentUser = userData?.communitiesMember?.filter((cm) => cm.communityId === String(community?.id));
        return Array.isArray(currentUser) ? currentUser.some((role) => role.role === "admin") : false;
    }, [userData, community?.id]);

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
                    {isAdmin && (
                        <Button priority="tertiary no outline" nativeButtonProps={deleteShareReportModal.buttonProps}>
                            Supprimer
                        </Button>
                    )}
                    <Button priority="tertiary no outline" nativeButtonProps={shareReport.buttonProps}>
                        Partager
                    </Button>
                </div>
            )}

            <ConfirmDeleteShareReportModal handleDelete={handleDelete} />
            <ShareReportModal />
        </div>
    );
};

export default DeleteShareReportComponent;
