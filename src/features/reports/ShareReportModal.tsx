import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n";
import { useCommunityStore, useModalStore, useReportStore } from "@/store";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import ModaleComponent from "@/components/ModaleComponent";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { StatusMessage } from "@/constants/communities/types";

const ShareReportModal = () => {
    const [shareInput, setShareInput] = useState<string>("");
    const [showToast, setShowToast] = useState<boolean>(false);

    const { t } = useTranslation({ ShareReportModal });

    const { addAlertMessage } = useCommunityStore();
    const { selectedReport } = useReportStore();

    useEffect(() => {
        if (!selectedReport) {
            setShareInput("");
            return;
        }

        const url = new URL(window.location.href);
        url.searchParams.set("report_id", String(selectedReport.id));
        setShareInput(url.toString());
    }, [selectedReport, shareInput]);

    const { shareReport } = useModalStore();

    const handleCopy = async () => {
        if (!shareInput) return;
        try {
            await navigator.clipboard.writeText(shareInput);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch {
            addAlertMessage(StatusMessage.error, t("erorr_copiedLink"));
        }
    };

    return (
        <ModaleComponent modal={shareReport} title={t("share_title")}>
            {showToast && <Tag className="shareReport__copiedLink">{t("copied_link")}</Tag>}
            <div className="shareReport__container">
                <div className="shareReport__subTitle">
                    <p>{t("report_link")}</p>
                    <Button
                        iconId="ri-file-copy-line"
                        priority="tertiary"
                        iconPosition="right"
                        size="small"
                        title="share report"
                        onClick={() => {
                            handleCopy();
                        }}
                    >
                        {t("report_copyLink")}
                    </Button>
                </div>
                <Input
                    className="share-report__select fr-mt-4v"
                    label=""
                    nativeInputProps={{
                        readOnly: true,
                        placeholder: "https://",
                        value: shareInput,
                        onChange: (e) => {
                            setShareInput(e.target.value);
                        },
                    }}
                    state="info"
                    stateRelatedMessage={t("report_modalInfo")}
                />
            </div>
        </ModaleComponent>
    );
};

export default ShareReportModal;
