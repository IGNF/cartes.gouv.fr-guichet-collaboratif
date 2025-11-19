import { useContributionStore, useMapStore } from "@/store";
import Button from "@codegouvfr/react-dsfr/Button";
import type { FrIconClassName, RiIconClassName } from "@codegouvfr/react-dsfr";
import { useCallback, useEffect, useMemo, useState } from "react";
import { handleCenterToFeature } from "@/constants/utils";
import { ContributionType } from "@/constants/contributions/types";

interface ContributionButtonProps {
    icon: FrIconClassName | RiIconClassName;
    title: string;
    disabled: boolean;
    onClick: () => void;
}

const ContributionButton: React.FC<ContributionButtonProps> = ({ icon, title, disabled, onClick }) => (
    <Button iconId={icon} size="small" priority="tertiary no outline" title={title} disabled={disabled} onClick={onClick} />
);

const ReviewContributions = () => {
    const { map, clickedMapFeature, setClickedMapFeature } = useMapStore();
    const { contributions } = useContributionStore();

    const contrToReview = useMemo(() => contributions.filter((contr) => contr.type !== ContributionType.DELETE), [contributions]);

    const [currentPosition, setCurrentPosition] = useState(contrToReview.length - 1);

    const setCurrentContribution = useCallback(
        (position: number) => {
            const previousContribution = contributions[position];
            setCurrentPosition(position);
            setClickedMapFeature(previousContribution.feature);
        },
        [contributions, setClickedMapFeature]
    );

    useEffect(() => {
        const clickedMapContribution = contrToReview.find((c) => c.feature === clickedMapFeature);
        const currentIndex = contrToReview.indexOf(clickedMapContribution!);
        const currentContribution = contrToReview[currentIndex ?? currentPosition];
        const feature = currentContribution?.feature;
        if (feature) {
            handleCenterToFeature(map, feature);
            if (currentIndex !== -1) setCurrentContribution(currentIndex);
        }
    }, [currentPosition, contrToReview, map, clickedMapFeature, setClickedMapFeature, setCurrentContribution]);

    const total = contrToReview.length;

    return (
        <div className="review-contributions">
            <ContributionButton
                icon="ri-arrow-left-line"
                title="Contribution précédente"
                disabled={currentPosition === 0}
                onClick={() => setCurrentContribution(currentPosition - 1)}
            />

            <span>
                Contribution {currentPosition + 1} / {total}
            </span>

            <ContributionButton
                icon="ri-arrow-right-line"
                title="Contribution suivante"
                disabled={currentPosition === total - 1}
                onClick={() => setCurrentContribution(currentPosition + 1)}
            />
        </div>
    );
};

export default ReviewContributions;
