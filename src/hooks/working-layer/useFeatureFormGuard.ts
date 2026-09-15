import { useCallback } from "react";
import { useContributionStore, useCommunityStore } from "@/store";
import { StatusMessage } from "@/constants/communities/types";
import { useTranslation } from "@/i18n";

/**
 * Prevents leaving/replacing the current edited object when a pending feature form is invalid.
 *
 * This hook runs that validator before "leaving" actions and blocks with an alert if invalid.
 *
 */
export const useFeatureFormGuard = () => {
    const { addAlertMessage } = useCommunityStore();
    const { t } = useTranslation({ useFeatureFormGuard });

    const guard = useCallback(
        (
            onValid: () => void,
            onBlocked?: () => void,
            messageKey: "finish_before_new" | "finish_before_close" | "finish_before_view" = "finish_before_new"
        ): boolean => {
            const validator = useContributionStore.getState().pendingFeatureFormValidator;
            if (validator && !validator()) {
                addAlertMessage(StatusMessage.error, t(messageKey), 5000);
                onBlocked?.();
                return false;
            }
            onValid();
            return true;
        },
        [addAlertMessage, t]
    );

    return { guard, hasPendingForm: () => !!useContributionStore.getState().pendingFeatureFormValidator };
};

export default useFeatureFormGuard;
