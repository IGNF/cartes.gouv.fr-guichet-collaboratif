import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { useMapStore } from "@/store";
import { useCallback, useEffect, useMemo } from "react";
import Button from "@codegouvfr/react-dsfr/Button";
import { Feature } from "ol";
import { useTranslation } from "@/i18n";
import { FEATURE_TYPE_DATA_PROPERTY, FEATURE_TYPE_GEOSERVICE_PROPERTY } from "@/constants";

const modal = createModal({
    id: "clickable-features-modal",
    isOpenedByDefault: false,
});

const ClickableFeaturesModal = () => {
    const { clickableFeatures, clickedMapFeature, mapWorkingLayer, setClickedMapFeature, setClickableFeatures } = useMapStore();
    const isOpen = useIsModalOpen(modal, {
        onConceal: () => {
            setClickableFeatures([]);
        },
    });

    const { t } = useTranslation({ ClickableFeaturesModal });

    const geoserviceData = useMemo(() => clickableFeatures[0]?.get(FEATURE_TYPE_GEOSERVICE_PROPERTY), [clickableFeatures]);

    useEffect(() => {
        if (clickableFeatures.length > 1) {
            modal.open();
            const closeButtons = document.querySelectorAll(`button[aria-controls="${modal.id}"`);
            closeButtons.forEach((button) => {
                button.textContent = t("close");
                button.setAttribute("title", t("close"));
            });
        } else if (isOpen) {
            modal.close();
        }
    }, [clickableFeatures, isOpen, t]);

    const handleSelectedFeature = useCallback(
        (f: Feature) => {
            setClickedMapFeature(f);
        },
        [setClickedMapFeature]
    );

    const getButtonPriority = useCallback(
        (f: Feature): "secondary" | "tertiary" => {
            const data = f.get(FEATURE_TYPE_DATA_PROPERTY);
            const clickedMapData = clickedMapFeature?.get(FEATURE_TYPE_DATA_PROPERTY);

            if (!clickedMapFeature || !data) return "tertiary";

            if (data[`${geoserviceData?.idName}`]) {
                return clickedMapData[`${geoserviceData?.idName}`] === data[`${geoserviceData?.idName}`] ? "secondary" : "tertiary";
            }
            return "tertiary";
        },
        [clickedMapFeature, geoserviceData]
    );

    return (
        <modal.Component
            className="clickable-features-modal"
            iconId="fr-icon-info-line"
            title={
                <>
                    {" "}
                    {t("title")}
                    <p className="clickable-features-modal_sub-title">{geoserviceData?.title ?? mapWorkingLayer}</p>
                </>
            }
            size="small"
            concealingBackdrop={false}
            topAnchor={false}
        >
            <div className="clickable-features-modal_content">
                {clickableFeatures.map((f, index) => (
                    <Button key={`clickable-features-modal_${index}`} onClick={() => handleSelectedFeature(f)} priority={getButtonPriority(f)}>
                        {f.get(FEATURE_TYPE_DATA_PROPERTY)[`${geoserviceData?.idName}`]}
                    </Button>
                ))}
            </div>
        </modal.Component>
    );
};

export default ClickableFeaturesModal;
