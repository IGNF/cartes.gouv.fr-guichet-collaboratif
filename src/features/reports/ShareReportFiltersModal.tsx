import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/i18n";
import { useCommunityStore, useModalStore, useReportStore } from "@/store";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import ModaleComponent from "@/components/ModaleComponent";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { layerData, StatusMessage } from "@/constants/communities/types";
import ShareReportModal from "./ShareReportModal";
import { LAYER_FEATURE_TYPE } from "@/constants";
import { getFeatureTypeById } from "@/api/featureTypesData";

const ShareReportFiltersModal = () => {
    const [showToast, setShowToast] = useState<boolean>(false);
    const [shareUrl, setShareUrl] = useState("");

    const { t } = useTranslation({ ShareReportModal });

    const { addAlertMessage, communityLayers } = useCommunityStore();
    const { shareReportFilters } = useModalStore();
    const { activeTable, setActiveTable, syncUrlFromState } = useReportStore();

    const baseUrl = useMemo(() => `${window.location.origin}${window.location.pathname}`, []);
    const url = useMemo(() => baseUrl + syncUrlFromState(), [baseUrl, syncUrlFromState]);

    const currentGeoservice = useMemo(() => communityLayers?.find((layer: layerData) => layer.type === LAYER_FEATURE_TYPE), [communityLayers]);

    useEffect(() => {
        if (!currentGeoservice?.database || !currentGeoservice?.table) return;

        async function directTable() {
            const featureTypeId = {
                database: currentGeoservice?.database || null,
                table: currentGeoservice?.table || null,
            };

            const res = await getFeatureTypeById(featureTypeId);
            const fullName = res.data.full_name;
            setActiveTable(fullName);
        }
        directTable();
    }, [currentGeoservice, setActiveTable]);

    useEffect(() => {
        const baseParams = new URL(url).search;
        const tableParam = currentGeoservice?.database ? `&table=${activeTable}` : "&table=reports";

        const newUrl = `${baseUrl}${baseParams}${tableParam}`;
        setShareUrl(newUrl);
    }, [activeTable, baseUrl, currentGeoservice, url]);

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
