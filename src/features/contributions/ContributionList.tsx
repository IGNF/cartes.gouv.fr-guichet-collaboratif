import { FEATURE_TYPE_DATA_PROPERTY, FEATURE_TYPE_GEOSERVICE_PROPERTY } from "@/constants";
import { CommunityGeoservice } from "@/constants/communities/types";
import { Contribution, ContributionType } from "@/constants/contributions/types";
import { useTranslation } from "@/i18n";
import { useContributionStore, useMapStore, useModalStore } from "@/store";
import Button from "@codegouvfr/react-dsfr/Button";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { ChangeEvent, useCallback, useEffect, useMemo } from "react";

const modal = createModal({
    id: "contribution-list-modal",
    isOpenedByDefault: false,
});

const ContributionList = () => {
    const { contributions, isReviewContribution, contrToCancel, setContrToCancel, setReviewContribution } = useContributionStore();
    const { clickedMapFeature, setClickedMapFeature } = useMapStore();
    const { confirmResetContributionModal } = useModalStore();

    const { t } = useTranslation({ ContributionList });

    const isOpen = useIsModalOpen(modal, {
        onConceal: () => {
            setReviewContribution(false);
        },
    });

    const validContributions = useMemo(() => contributions.filter((contr) => !!contr?.feature), [contributions]);
    const validContrToCancel = useMemo(() => contrToCancel.filter((contr) => !!contr?.feature), [contrToCancel]);

    const getContributionTitle = useCallback(
        (contr: Contribution, index: number) => {
            if (!contr?.feature) {
                return "";
            }
            const featData = contr.feature.get(FEATURE_TYPE_DATA_PROPERTY);
            const featGeoservice: CommunityGeoservice = contr.feature.get(FEATURE_TYPE_GEOSERVICE_PROPERTY);
            const featId = featData ? featData[`${featGeoservice?.idName}`] : null;
            switch (contr.type) {
                case ContributionType.CREATE:
                    return t("objects_created", { featId: featId ?? index + 1 });
                case ContributionType.MODIFY:
                    return t("objects_modified", { featId: featId ?? index + 1 });
                case ContributionType.DELETE:
                    return t("objects_deleted", { featId: featId ?? index + 1 });
                default:
                    return "";
            }
        },
        [t]
    );

    const cancelContribution = useCallback(
        (e: ChangeEvent<HTMLInputElement>, contr: Contribution) => {
            if (!contr?.feature) return;
            let newContrToCancel = [...contrToCancel, contr];
            if (!e.target.checked) {
                newContrToCancel = contrToCancel.filter((c) => c !== contr);
            }
            setContrToCancel(newContrToCancel);
            return;
        },
        [contrToCancel, setContrToCancel]
    );

    const cancelAllContributions = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            if (e.target.checked) {
                setContrToCancel(validContributions);
            } else {
                setContrToCancel([]);
            }
        },
        [validContributions, setContrToCancel]
    );

    const showContribution = useCallback(
        (contr: Contribution) => {
            if (!contr?.feature) return;
            setClickedMapFeature(contr.feature);
        },
        [setClickedMapFeature]
    );

    useEffect(() => {
        if (isReviewContribution && !isOpen) {
            modal?.open();
            const closeButtons = document.querySelectorAll(`.fr-btn--close`);
            closeButtons.forEach((button) => {
                button.textContent = t("close");
                button.setAttribute("title", t("close"));
            });
        }
    }, [contributions, isReviewContribution, isOpen, t]);

    return (
        <modal.Component
            className="contribution-list-modal"
            title={t("list_title")}
            size="small"
            concealingBackdrop={false}
            topAnchor={false}
            buttons={[
                {
                    iconId: "fr-icon-close-circle-line",
                    onClick: () => confirmResetContributionModal.open(),
                    children: t("cancel"),
                    priority: "secondary",
                    disabled: !validContrToCancel.length,
                },
            ]}
        >
            {isReviewContribution && validContributions.length > 0 && (
                <div className="content">
                    <div className="line">
                        <Checkbox
                            orientation="horizontal"
                            options={[
                                {
                                    label: t("cancel_all"),
                                    nativeInputProps: {
                                        checked: validContrToCancel.length === validContributions.length,
                                        onChange: (e) => cancelAllContributions(e),
                                    },
                                },
                            ]}
                        />
                    </div>
                    {validContributions.map((contr, index) => (
                        <div key={`contributions-item_${index}`} className="line">
                            <Button
                                priority={clickedMapFeature === contr.feature ? "secondary" : "tertiary no outline"}
                                onClick={() => showContribution(contr)}
                            >
                                {getContributionTitle(contr, index)}
                            </Button>
                            <Checkbox
                                options={[
                                    {
                                        label: "",
                                        nativeInputProps: {
                                            checked: validContrToCancel.includes(contr),
                                            onChange: (e) => cancelContribution(e, contr),
                                        },
                                    },
                                ]}
                            />
                        </div>
                    ))}
                </div>
            )}
        </modal.Component>
    );
};

export default ContributionList;
