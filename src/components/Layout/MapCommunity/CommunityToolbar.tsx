import Button from "@codegouvfr/react-dsfr/Button";
import { useMemo } from "react";

import { useCommunityStore, useContributionStore, useModalStore, useUserStore } from "@/store";
import { useTranslation } from "@/i18n";
import { ADMIN_ROLE } from "@/constants";
import { ADMIN_COMMUNITY_URL } from "@/constants/urls";
import { StatusMessage } from "@/constants/communities/types";
import LoaderComponent from "@/components/LoaderComponent";
import ContributionsConfirmReset from "@/features/contributions/ContributionsConfirmReset";
import ConfirmSaveContributions from "@/features/contributions/ConfirmSaveContributions";
import ContributionList from "@/features/contributions/ContributionList";
import { useContributionsSave } from "@/hooks/working-layer/useContributionsSave";

export default function CommunityToolbar() {
    const { community, hasOneEditableLayer, addAlertMessage } = useCommunityStore();
    const { user } = useUserStore();
    const { contributions, isReviewContribution, setReviewContribution } = useContributionStore();
    const { confirmSaveContributionModal } = useModalStore();

    const { t } = useTranslation({ CommunityToolbar });

    const { onSave, onClickReset, isLoading } = useContributionsSave({
        pendingMessage: t("save_pending"),
        successMessage: t("save_success"),
        errorMessage: t("save_error"),
    });

    const isAdmin = useMemo(() => user?.communitiesMember.find((cm) => cm.communityId === String(community?.id))?.role === ADMIN_ROLE, [user, community]);

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            addAlertMessage(StatusMessage.success, t("share_success"), 2000);
        } catch {
            addAlertMessage(StatusMessage.error, t("share_error"), 2000);
        }
    };

    if (!community) return null;

    return (
        <>
            <div className="community-toolbar-wrapper">
                <div className="community-toolbar-card">
                    {hasOneEditableLayer && (
                        <>
                            <div className="community-toolbar-btn-wrap">
                                <Button
                                    iconId="fr-icon-save-fill"
                                    priority="tertiary no outline"
                                    title={t("save")}
                                    className="community-toolbar-save-btn"
                                    disabled={!contributions.length || isLoading}
                                    nativeButtonProps={{ ...confirmSaveContributionModal.buttonProps, "aria-label": t("save") }}
                                />
                                {contributions.length > 0 && <span className="community-toolbar-badge">{contributions.length}</span>}
                                {isLoading && (
                                    <div className="community-toolbar-loader">
                                        <LoaderComponent />
                                    </div>
                                )}
                            </div>
                            <span className="community-toolbar-separator" />
                            <Button
                                iconId="fr-icon-time-line"
                                priority={isReviewContribution ? "secondary" : "tertiary no outline"}
                                title={t("history")}
                                disabled={!contributions.length}
                                onClick={() => setReviewContribution(!isReviewContribution)}
                                nativeButtonProps={{ "aria-label": t("history") }}
                            />
                            <span className="community-toolbar-separator" />
                        </>
                    )}
                    <Button
                        iconId="fr-icon-upload-2-line"
                        priority="tertiary no outline"
                        title={t("share")}
                        onClick={handleShare}
                        nativeButtonProps={{ "aria-label": t("share") }}
                    />
                    {isAdmin && (
                        <>
                            <span className="community-toolbar-separator" />
                            <Button
                                iconId="fr-icon-settings-5-line"
                                priority="tertiary no outline"
                                title={t("settings")}
                                linkProps={{ href: `${ADMIN_COMMUNITY_URL}/${community.id}/gerer-le-guichet` }}
                            />
                        </>
                    )}
                </div>
            </div>
            {hasOneEditableLayer && (
                <>
                    <ContributionsConfirmReset onConfirm={onClickReset} />
                    <ConfirmSaveContributions onConfirm={onSave} />
                    <ContributionList />
                </>
            )}
        </>
    );
}
