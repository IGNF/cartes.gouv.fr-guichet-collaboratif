import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { Select } from "@codegouvfr/react-dsfr/Select";
import ModaleComponent from "@/components/ModaleComponent";
import { FEATURE_TYPE_DATA_PROPERTY, FEATURE_TYPE_FINGERPRINT_COLUMN, FEATURE_TYPE_GEOSERVICE_PROPERTY } from "@/constants";
import { CommunityGeoservice } from "@/constants/communities/types";
import { MergeKeepIndex } from "@/constants/contributions/types";
import { useTranslation } from "@/i18n";
import { useContributionStore, useModalStore } from "@/store";
import { useCallback, useMemo, useState } from "react";

interface MergeFeatureAttributesModalProps {
    onConfirm: (customData: Record<string, unknown>, keepIndex: MergeKeepIndex) => void;
}

type ChoiceMode = "first" | "second" | "custom";

function getFriendlyName(data: Record<string, unknown> | undefined, fallback: string): string {
    // Same as hover we try to display something better than id
    if (!data) return fallback;
    const name = data["toponyme"] ?? data["nature"] ?? data["nom"] ?? data["type"];
    return name ? String(name) : fallback;
}

export default function MergeFeatureAttributesModal({ onConfirm }: MergeFeatureAttributesModalProps) {
    const { mergeFeatureAttributesModal } = useModalStore();
    const { selectedObjects } = useContributionStore();
    const [choiceMode, setChoiceMode] = useState<ChoiceMode>("first");
    const [perFieldChoice, setPerFieldChoice] = useState<Record<string, "first" | "second">>({});

    const { t } = useTranslation({ MergeFeatureAttributesModal });

    const feat1 = selectedObjects[0];
    const feat2 = selectedObjects[1];
    const geoservice = feat1?.get(FEATURE_TYPE_GEOSERVICE_PROPERTY) as CommunityGeoservice | undefined;
    const idName = geoservice?.idName;
    const feat1Data = feat1?.get(FEATURE_TYPE_DATA_PROPERTY) as Record<string, unknown> | undefined;
    const feat2Data = feat2?.get(FEATURE_TYPE_DATA_PROPERTY) as Record<string, unknown> | undefined;

    const idSuffix1 = idName && feat1Data ? ` (id: ${feat1Data[idName]})` : "";
    const idSuffix2 = idName && feat2Data ? ` (id: ${feat2Data[idName]})` : "";
    const friendly1 = getFriendlyName(feat1Data, "");
    const friendly2 = getFriendlyName(feat2Data, "");
    const feat1Label = `${t("object_1")}${friendly1 ? ` — ${friendly1}` : ""}${idSuffix1}`;
    const feat2Label = `${t("object_2")}${friendly2 ? ` — ${friendly2}` : ""}${idSuffix2}`;

    // The fingerprint is never user-selectable: it follows the kept id. The id is listed first.
    const allKeys = useMemo(() => {
        const keys = new Set([...Object.keys(feat1Data ?? {}), ...Object.keys(feat2Data ?? {})]);
        keys.delete(FEATURE_TYPE_FINGERPRINT_COLUMN);
        if (idName) keys.delete(idName);
        return idName ? [idName, ...keys] : Array.from(keys);
    }, [feat1Data, feat2Data, idName]);

    const keepIndex = useMemo((): MergeKeepIndex => {
        if (choiceMode === "first") return 0;
        if (choiceMode === "second") return 1;
        return idName && perFieldChoice[idName] === "second" ? 1 : 0;
    }, [choiceMode, idName, perFieldChoice]);

    const resolvedAttributes = useMemo((): Record<string, unknown> => {
        if (choiceMode === "first") return feat1Data ?? {};
        if (choiceMode === "second") return feat2Data ?? {};

        //Let user choose per field value
        const keptData = (keepIndex === 0 ? feat1Data : feat2Data) ?? {};
        const result: Record<string, unknown> = { ...keptData };
        for (const key of allKeys) {
            if (key === idName) continue;
            const val1 = (feat1Data ?? {})[key];
            const val2 = (feat2Data ?? {})[key];
            const smartDefault: "first" | "second" = val1 !== undefined && val1 !== "" && val1 !== null ? "first" : "second";
            const choice = perFieldChoice[key] ?? smartDefault;
            result[key] = choice === "second" ? val2 : val1;
        }
        return result;
    }, [choiceMode, feat1Data, feat2Data, allKeys, perFieldChoice, keepIndex, idName]);

    const handleConfirm = useCallback(() => {
        onConfirm(resolvedAttributes, keepIndex);
        setChoiceMode("first");
        setPerFieldChoice({});
    }, [resolvedAttributes, keepIndex, onConfirm]);

    const handleClose = useCallback(() => {
        mergeFeatureAttributesModal.close();
        setChoiceMode("first");
        setPerFieldChoice({});
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
                            value: "first",
                            checked: choiceMode === "first",
                            onChange: () => setChoiceMode("first"),
                        },
                    },
                    {
                        label: feat2Label,
                        nativeInputProps: {
                            value: "second",
                            checked: choiceMode === "second",
                            onChange: () => setChoiceMode("second"),
                        },
                    },
                    {
                        label: t("custom"),
                        nativeInputProps: {
                            value: "custom",
                            checked: choiceMode === "custom",
                            onChange: () => setChoiceMode("custom"),
                        },
                    },
                ]}
            />
            {choiceMode === "custom" && allKeys.length > 0 && (
                <div>
                    <p className="fr-text--sm fr-mb-2w">{t("custom_detail")}</p>
                    {allKeys.map((key) => {
                        const val1 = String(feat1Data?.[key] ?? "");
                        const val2 = String(feat2Data?.[key] ?? "");
                        const bothEmpty = val1 === "" && val2 === "";
                        if (bothEmpty) {
                            return (
                                <div key={key} className="fr-mb-2w">
                                    <span className="fr-text--sm fr-text--disabled">{key}</span>
                                    <span className="fr-badge fr-badge--sm fr-badge--grey fr-ml-1w">{t("both_empty")}</span>
                                </div>
                            );
                        }
                        const smartDefault: "first" | "second" = key === idName || val1 !== "" ? "first" : "second";
                        return (
                            <Select
                                key={key}
                                label={key}
                                nativeSelectProps={{
                                    value: perFieldChoice[key] ?? smartDefault,
                                    onChange: (e) =>
                                        setPerFieldChoice((prev) => ({
                                            ...prev,
                                            [key]: e.target.value as "first" | "second",
                                        })),
                                }}
                            >
                                <option value="first">{val1}</option>
                                <option value="second">{val2}</option>
                            </Select>
                        );
                    })}
                </div>
            )}
        </ModaleComponent>
    );
}
