import Button from "@codegouvfr/react-dsfr/Button";

import ConfirmDeleteShareReportModal from "./ConfirmDeleteShareReportModal";
import { useModalStore } from "@/store";
import ShareReportModal from "./ShareReportModal";
import { useTranslation } from "@/i18n";

interface Props {
    canDelete: boolean;
    handleDelete: () => void;
}

const DeleteShareReportComponent = ({ canDelete, handleDelete }: Props) => {
    const { t } = useTranslation({ DeleteShareReportComponent });
    const { deleteShareReportModal, shareReport } = useModalStore();

    return (
        <div className="report-deleteShare__wrapper">
            {canDelete && (
                <Button
                    iconId="ri-delete-bin-line"
                    priority="secondary"
                    title={t("delete")}
                    nativeButtonProps={{
                        ...deleteShareReportModal.buttonProps,
                        "aria-label": t("delete"),
                    }}
                />
            )}
            <Button
                iconId="ri-share-forward-fill"
                priority="secondary"
                title={t("share")}
                nativeButtonProps={{
                    ...shareReport.buttonProps,
                    "aria-label": t("share"),
                }}
            />

            <ConfirmDeleteShareReportModal handleDelete={handleDelete} />
            <ShareReportModal />
        </div>
    );
};

export default DeleteShareReportComponent;
