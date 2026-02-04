import { useSavedSearchesStore, useCommunityStore } from "@/store";
import { Group } from "@/constants/savedSearches/types";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { useState } from "react";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { ComponentKey } from "@/i18n/types";
import { StatusMessage } from "@/constants/communities/types";

interface SaveSearchFormProps {
    t: TranslationFunction<"SearchObjectsModal", ComponentKey>;
    communityName: string;
    workingLayer: string;
    root: Group;
    maxNumber: number;
    selectedExtent: string;
    onSaveComplete?: () => void;
}

const SaveSearchForm: React.FC<SaveSearchFormProps> = ({ t, communityName, workingLayer, root, maxNumber, selectedExtent, onSaveComplete }) => {
    const { saveSearchLocally } = useSavedSearchesStore();
    const { addAlertMessage } = useCommunityStore();
    const [searchName, setSearchName] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        if (!searchName.trim()) {
            addAlertMessage(StatusMessage.warning, t("search_name_required"), 3000);
            return;
        }

        if (!root.rules.length) {
            addAlertMessage(StatusMessage.warning, t("no_filters_to_save"), 3000);
            return;
        }

        setIsSaving(true);

        try {
            saveSearchLocally(communityName, workingLayer, searchName.trim(), {
                workingLayer,
                searchRoot: root,
                searchMax: maxNumber,
                searchExtent: selectedExtent,
            });

            setSearchName("");
            addAlertMessage(StatusMessage.success, t("search_saved_successfully"), 3000);

            if (onSaveComplete) {
                onSaveComplete();
            }
        } catch {
            addAlertMessage(StatusMessage.error, t("error_saving_search"), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="save-search-form">
            <h6>{t("save_current_search")}</h6>
            <div className="save-search-form-inputs">
                <Input
                    label={t("search_name_label")}
                    nativeInputProps={{
                        value: searchName,
                        onChange: (e) => setSearchName(e.target.value),
                        placeholder: t("search_name_placeholder"),
                        maxLength: 50,
                    }}
                />
                <Button iconId="fr-icon-save-line" onClick={handleSave} disabled={isSaving || !searchName.trim() || !root.rules.length}>
                    {t("save")}
                </Button>
            </div>
        </div>
    );
};

export default SaveSearchForm;
