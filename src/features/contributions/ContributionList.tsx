import { FEATURE_TYPE_DATA_PROPERTY } from "@/constants";
import { Contribution, ContributionType } from "@/constants/contributions/types";
import { resetContributionToMap } from "@/constants/contributions/utils";
import { useContributionStore, useMapStore } from "@/store";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import Tooltip from "@codegouvfr/react-dsfr/Tooltip";
import { useCallback, useEffect } from "react";

const modal = createModal({
    id: "contribution-list-modal",
    isOpenedByDefault: false,
});

const ContributionList = () => {
    const { contributions, isReviewContribution, setReviewContribution, setContributions } = useContributionStore();
    const { map, clickedMapFeature, setClickedMapFeature } = useMapStore();

    const isOpen = useIsModalOpen(modal, {
        onConceal: () => {
            setReviewContribution(false);
        },
    });

    const getContributionTitle = useCallback((contr: Contribution) => {
        switch (contr.type) {
            case ContributionType.CREATE:
                return "Création d'objet : " + contr.feature.get(FEATURE_TYPE_DATA_PROPERTY)?.id;
            case ContributionType.MODIFY:
                return "Modification d'objet : " + contr.feature.get(FEATURE_TYPE_DATA_PROPERTY)?.id;
            case ContributionType.DELETE:
                return "Supression d'objet : " + contr.feature.get(FEATURE_TYPE_DATA_PROPERTY)?.id;
            default:
                return "none";
        }
    }, []);

    const cancelContribution = useCallback(
        (contr: Contribution) => {
            resetContributionToMap(map!, contr);
            const newContributions = contributions.filter((c) => c !== contr);
            setContributions(newContributions);
            if (!newContributions.length) {
                modal.close();
                setReviewContribution(false);
            }
        },
        [map, contributions, setContributions, setReviewContribution]
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
        }
    }, [contributions, isReviewContribution, isOpen]);

    return (
        <modal.Component
            className="contribution-list-modal"
            iconId="fr-icon-info-line"
            title={"Liste des contributions"}
            size="small"
            concealingBackdrop={false}
            topAnchor={false}
        >
            {isReviewContribution && (
                <div className="content">
                    {contributions.map((contr, index) => (
                        <div key={`contributions-item_${index}`} className="line">
                            <Button
                                priority={clickedMapFeature === contr.feature ? "secondary" : "tertiary no outline"}
                                onClick={() => showContribution(contr)}
                            >
                                {getContributionTitle(contr)}
                            </Button>
                            <Tooltip title="Annuler" kind="hover">
                                <Button iconId="ri-refresh-line" title="" priority="tertiary no outline" onClick={() => cancelContribution(contr)} />
                            </Tooltip>
                        </div>
                    ))}
                </div>
            )}
        </modal.Component>
    );
};

export default ContributionList;
