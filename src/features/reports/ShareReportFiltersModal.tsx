import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "@/i18n";
import { useCommunityStore, useModalStore, useReportStore } from "@/store";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import ModaleComponent from "@/components/ModaleComponent";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { StatusMessage } from "@/constants/communities/types";
import ShareReportModal from "./ShareReportModal";

const ShareReportFiltersModal = () => {
    const [showToast, setShowToast] = useState<boolean>(false);

    const { t } = useTranslation({ ShareReportModal });

    const { addAlertMessage } = useCommunityStore();
    const { shareReportFilters } = useModalStore();
    const { currentFilters, searchReport, sortBy, currentPage, limitPerPage, syncUrlFromState } = useReportStore();

    const { pathname } = useLocation();

    const baseUrl = useMemo(() => `${window.location.origin}${pathname}`, [pathname]);
    const url = useMemo(() => baseUrl + syncUrlFromState(), [baseUrl, currentFilters, searchReport, sortBy, currentPage, limitPerPage]);

    const shareUrl = useMemo(() => {
        const baseParams = new URL(url).search;

        return `${baseUrl}${baseParams}&view=reports`;
    }, [baseUrl, url]);

    const handleCopy = async () => {
        if (!shareUrl) return;
        try {
            await navigator.clipboard.writeText(shareUrl);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch {
            addAlertMessage(StatusMessage.error, t("erorr_copiedLink"));
        }
    };

    return (
        <ModaleComponent modal={shareReportFilters} title={t("share_title_reports")}>
            {showToast && <Tag className="shareReport__copiedLink">{t("copied_link")}</Tag>}
            <div className="shareReport__container">
                <div className="shareReport__subTitle">
                    <p>{t("reports_link")}</p>
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
                        value: shareUrl,
                    }}
                    state="info"
                    stateRelatedMessage={t("reports_modalInfo")}
                />
            </div>
        </ModaleComponent>
    );
};

export default ShareReportFiltersModal;
