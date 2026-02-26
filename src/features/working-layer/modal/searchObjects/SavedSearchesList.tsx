import { useSavedSearchesStore } from "@/store";
import { SavedSearch } from "@/constants/savedSearches/types";
import Button from "@codegouvfr/react-dsfr/Button";
import { useState } from "react";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { ComponentKey } from "@/i18n/types";
import { useModalStore } from "@/store";
import ModaleComponent from "@/components/ModaleComponent";

interface SavedSearchesListProps {
    t: TranslationFunction<"SearchObjectsModal", ComponentKey>;
    communityName: string;
    workingLayer: string;
    onLoadSearch: (search: SavedSearch) => void;
}

const SavedSearchesList: React.FC<SavedSearchesListProps> = ({ t, communityName, workingLayer, onLoadSearch }) => {
    const { localSavedSearches, deleteLocalSearch } = useSavedSearchesStore();
    const { confirmDeleteSavedSearchModal } = useModalStore();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [searchToDelete, setSearchToDelete] = useState<string | null>(null);

    const handleDeleteClick = (searchId: string) => {
        setSearchToDelete(searchId);
        confirmDeleteSavedSearchModal.open();
    };

    const handleConfirmDelete = () => {
        if (searchToDelete) {
            deleteLocalSearch(communityName, workingLayer, searchToDelete);
            setSearchToDelete(null);
        }
    };

    const toggleExpand = (searchId: string) => {
        setExpandedId(expandedId === searchId ? null : searchId);
    };

    if (localSavedSearches.length === 0) {
        return (
            <div className="saved-searches-empty">
                <p className="fr-text--sm">{t("no_saved_searches")}</p>
            </div>
        );
    }

    return (
        <div className="saved-searches-list">
            <h6>{t("saved_searches_title")}</h6>
            <ul className="fr-accordions-group">
                {localSavedSearches.map((search) => (
                    <li key={search.id} className="saved-search-item">
                        <div className="saved-search-header">
                            <button className="fr-btn fr-btn--tertiary-no-outline" onClick={() => toggleExpand(search.id)}>
                                <span className={`fr-icon-arrow-right-s-line ${expandedId === search.id ? "expanded" : ""}`} aria-hidden="true" />
                                <strong>{search.name}</strong>
                            </button>
                        </div>
                        {expandedId === search.id && (
                            <div className="saved-search-details">
                                <p className="fr-text--sm">
                                    {t("created_at")}: {new Date(search.createdAt).toLocaleString()}
                                </p>
                                <p className="fr-text--sm">
                                    {t("max_results")}: {search.searchMax}
                                </p>
                                <div className="saved-search-actions">
                                    <Button iconId="fr-icon-download-line" priority="secondary" size="small" onClick={() => onLoadSearch(search)}>
                                        {t("load_search")}
                                    </Button>
                                    <Button iconId="fr-icon-delete-line" priority="secondary" size="small" onClick={() => handleDeleteClick(search.id)}>
                                        {t("delete")}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </li>
                ))}
            </ul>

            <ModaleComponent
                modal={confirmDeleteSavedSearchModal}
                title={t("confirm_delete_search_title")}
                onConfirm={handleConfirmDelete}
                confirmText={t("delete")}
                onClose={() => setSearchToDelete(null)}
            >
                <p>{t("confirm_delete_search")}</p>
            </ModaleComponent>
        </div>
    );
};

export default SavedSearchesList;
