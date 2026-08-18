import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import ModaleComponent from "@/components/ModaleComponent";
import { FEATURE_TYPE_DATA_PROPERTY, FEATURE_TYPE_GEOSERVICE_PROPERTY } from "@/constants";
import { CommunityGeoservice } from "@/constants/communities/types";
import { useTranslation } from "@/i18n";
import { useContributionStore, useModalStore } from "@/store";
import { useCallback, useState } from "react";

interface MergeFeatureAttributesModalProps {
    onConfirm: (keepFirst: boolean) => void;
}

export default function MergeFeatureAttributesModal({ onConfirm }: MergeFeatureAttributesModalProps) {
    const { mergeFeatureAttributesModal } = useModalStore();
    const { selectedObjects } = useContributionStore();
    const [keepFirst, setKeepFirst] = useState(true);

    const { t } = useTranslation({ MergeFeatureAttributesModal });

    const feat1 = selectedObjects[0];
    const feat2 = selectedObjects[1];
    const geoservice = feat1?.get(FEATURE_TYPE_GEOSERVICE_PROPERTY) as CommunityGeoservice | undefined;
    const idName = geoservice?.idName;
    const feat1Data = feat1?.get(FEATURE_TYPE_DATA_PROPERTY) as Record<string, unknown> | undefined;
    const feat2Data = feat2?.get(FEATURE_TYPE_DATA_PROPERTY) as Record<string, unknown> | undefined;
    const feat1Label = idName && feat1Data ? `${t("object_1")} (id: ${feat1Data[idName]})` : t("object_1");
    const feat2Label = idName && feat2Data ? `${t("object_2")} (id: ${feat2Data[idName]})` : t("object_2");

    const handleConfirm = useCallback(() => {
        onConfirm(keepFirst);
        setKeepFirst(true);
    }, [keepFirst, onConfirm]);

    const handleClose = useCallback(() => {
        mergeFeatureAttributesModal.close();
        setKeepFirst(true);
    }, [mergeFeatureAttributesModal]);

    return (
        <ModaleComponent
            modal={mergeFeatureAttributesModal}
            title={t("title")}
            onConfirm={handleConfirm}
            onClose={handleClose}
            cancelText={t("cancel")}
            confirmText={t("confirm")}
        >
            <p>{t("description")}</p>
            <RadioButtons
                legend={t("choose_attributes")}
                name="merge-attributes"
                options={[
                    {
                        label: feat1Label,
                        nativeInputProps: {
                            value: "1",
                            checked: keepFirst,
                            onChange: () => setKeepFirst(true),
                        },
                    },
                    {
                        label: feat2Label,
                        nativeInputProps: {
                            value: "2",
                            checked: !keepFirst,
                            onChange: () => setKeepFirst(false),
                        },
                    },
                ]}
            />
        </ModaleComponent>
    );
}
