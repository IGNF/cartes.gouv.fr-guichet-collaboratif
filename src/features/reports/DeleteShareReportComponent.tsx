import Button from "@codegouvfr/react-dsfr/Button";
import { useMemo } from "react";
import ConfirmDeleteShareReportModal from "./ConfirmDeleteShareReportModal";
import { useCommunityStore, useModalStore } from "@/store";
import ShareReportModal from "./ShareReportModal";
import { useTranslation } from "@/i18n";
import { useGetUserProfileAPI } from "@/api/userData";

interface Props {
    handleDelete: () => void;
}
const DeleteShareReportComponent = ({ handleDelete }: Props) => {
    const { t } = useTranslation({ DeleteShareReportComponent });
    const { deleteShareReportModal, shareReport } = useModalStore();

    const { community } = useCommunityStore();

    const { data: userData } = useGetUserProfileAPI();
    const isAdmin = useMemo(() => {
        const currentUser = userData?.communitiesMember?.filter((cm) => cm.communityId === String(community?.id));
        return Array.isArray(currentUser) ? currentUser.some((role) => role.role === "admin") : false;
    }, [userData, community?.id]);

    return (
        <div className="report-deleteShare__wrapper">
            {isAdmin && <Button iconId="ri-delete-bin-line" priority="secondary" title={t("delete")} nativeButtonProps={deleteShareReportModal.buttonProps} />}
            <Button iconId="ri-share-forward-fill" priority="secondary" title={t("share")} nativeButtonProps={shareReport.buttonProps} />

            <ConfirmDeleteShareReportModal handleDelete={handleDelete} />
            <ShareReportModal />
        </div>
    );
};

export default DeleteShareReportComponent;
