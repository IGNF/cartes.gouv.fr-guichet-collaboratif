import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { useMapStore } from "@/store";
import { useEffect } from "react";
import "./clickableFeaturesModal.css";
import Button from "@codegouvfr/react-dsfr/Button";
import { Feature } from "ol";
import { useTranslation } from "@/i18n";

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

    const handleSelectedFeature = (f: Feature) => {
        setClickedMapFeature(f);
    };

    const getButtonPriority = (f: Feature): "secondary" | "tertiary" => {
        const data = f.get("featureTypeData");
        if (!clickedMapFeature || !data) return "tertiary";

        if (data.id) {
            return clickedMapFeature?.get("featureTypeData")?.id === data?.id ? "secondary" : "tertiary";
        }
        return "tertiary";
    };

    return (
        <modal.Component
            className="clickable-features-modal"
            iconId="fr-icon-info-line"
            title={
                <>
                    {" "}
                    {t("title")}
                    <p className="clickable-features-modal_sub-title">{clickableFeatures[0]?.get("geoservice")?.title ?? mapWorkingLayer}</p>
                </>
            }
            size="small"
            concealingBackdrop={false}
            topAnchor={false}
        >
            <div className="clickable-features-modal_content">
                {clickableFeatures.map((f, index) => (
                    <Button key={`clickable-features-modal_${index}`} onClick={() => handleSelectedFeature(f)} priority={getButtonPriority(f)}>
                        {f.get("featureTypeData")?.id || f.get("featureTypeData")?.cleabs}
                    </Button>
                ))}
            </div>
        </modal.Component>
    );
};

export default ClickableFeaturesModal;
