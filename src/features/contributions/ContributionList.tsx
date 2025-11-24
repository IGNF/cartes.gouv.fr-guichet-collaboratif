import { FEATURE_TYPE_DATA_PROPERTY } from "@/constants";
import { Contribution, ContributionType } from "@/constants/contributions/types";
import { useTranslation } from "@/i18n";
import { useContributionStore, useMapStore, useModalStore } from "@/store";
import Button from "@codegouvfr/react-dsfr/Button";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { ChangeEvent, useCallback, useEffect } from "react";

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

    const getContributionTitle = useCallback(
        (contr: Contribution) => {
            const featId = contr.feature.get(FEATURE_TYPE_DATA_PROPERTY)?.id;
            switch (contr.type) {
                case ContributionType.CREATE:
                    return t("objects_created", { featId });
                case ContributionType.MODIFY:
                    return t("objects_modified", { featId });
                case ContributionType.DELETE:
                    return t("objects_deleted", { featId });
                default:
                    return "";
            }
        },
        [t]
    );

    const cancelContribution = useCallback(
        (e: ChangeEvent<HTMLInputElement>, contr: Contribution) => {
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
                setContrToCancel(contributions);
            } else {
                setContrToCancel([]);
            }
        },
        [contributions, setContrToCancel]
    );

    const showContribution = useCallback(
        (contr: Contribution) => {
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
            iconId="fr-icon-info-line"
            title={t("list_title")}
            size="small"
            concealingBackdrop={false}
            topAnchor={false}
            buttons={[
                {
                    iconId: "ri-refresh-line",
                    onClick: () => confirmResetContributionModal.open(),
                    children: t("cancel"),
                    priority: "secondary",
                    disabled: !contrToCancel.length,
                },
            ]}
        >
            {isReviewContribution && (
                <div className="content">
                    <div className="line">
                        <Checkbox
                            orientation="horizontal"
                            options={[
                                {
                                    label: t("cancel_all"),
                                    nativeInputProps: {
                                        checked: contrToCancel.length === contributions.length,
                                        onChange: (e) => cancelAllContributions(e),
                                    },
                                },
                            ]}
                        />
                    </div>
                    {contributions.map((contr, index) => (
                        <div key={`contributions-item_${index}`} className="line">
                            <Button
                                priority={clickedMapFeature === contr.feature ? "secondary" : "tertiary no outline"}
                                onClick={() => showContribution(contr)}
                            >
                                {getContributionTitle(contr)}
                            </Button>
                            <Checkbox
                                options={[
                                    {
                                        label: "",
                                        nativeInputProps: {
                                            checked: contrToCancel.includes(contr),
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
