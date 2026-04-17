import { useContributionStore, useMapStore } from "@/store";
import Button from "@codegouvfr/react-dsfr/Button";
import type { FrIconClassName, RiIconClassName } from "@codegouvfr/react-dsfr";
import { useCallback, useEffect, useMemo, useState } from "react";
import { handleCenterToFeature } from "@/constants/utils";
import { ContributionType } from "@/constants/contributions/types";
import Tooltip from "@codegouvfr/react-dsfr/Tooltip";
import { useTranslation } from "@/i18n";

interface ContributionButtonProps {
    icon: FrIconClassName | RiIconClassName;
    title: string;
    onClick: () => void;
}

const ContributionButton: React.FC<ContributionButtonProps> = ({ icon, title, onClick }) => (
    <Button iconId={icon} size="small" priority="tertiary no outline" title={title} onClick={onClick} />
);

const ReviewContributions = () => {
    const { map, clickedMapFeature, setClickedMapFeature } = useMapStore();
    const { contributions } = useContributionStore();

    const { t } = useTranslation({ ReviewContributions });

    const contrToReview = useMemo(() => contributions.filter((contr) => contr.type !== ContributionType.DELETE), [contributions]);

    const [currentPosition, setCurrentPosition] = useState(contrToReview.length - 1);

    const setCurrentContribution = useCallback(
        (position: number) => {
            const clamped = position > contrToReview.length - 1 ? 0 : position < 0 ? contrToReview.length - 1 : position;

            setCurrentPosition(clamped);
            setClickedMapFeature(contrToReview[clamped].feature);
        },
        [contrToReview, setClickedMapFeature]
    );

    const currentIndex = useMemo(() => {
        if (clickedMapFeature) {
            const i = contrToReview.findIndex((c) => c.feature === clickedMapFeature);
            if (i !== -1) return i;
        }
        return currentPosition;
    }, [clickedMapFeature, contrToReview, currentPosition]);

    useEffect(() => {
        const feature = contrToReview[currentIndex]?.feature;
        if (feature) handleCenterToFeature(map, feature);
    }, [currentIndex, contrToReview, map]);

    const total = contrToReview.length;

    return (
        <div className="review-contributions">
            <Tooltip title={t("previous")}>
                <ContributionButton icon="ri-arrow-left-line" title="" onClick={() => setCurrentContribution(currentPosition - 1)} />
            </Tooltip>

            <span>
                Contribution {currentPosition + 1} / {total}
            </span>
            <Tooltip title={t("next")}>
                <ContributionButton icon="ri-arrow-right-line" title="" onClick={() => setCurrentContribution(currentPosition + 1)} />
            </Tooltip>
        </div>
    );
};

export default ReviewContributions;
