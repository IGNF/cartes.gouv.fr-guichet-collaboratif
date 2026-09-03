import { AlertMessageType } from "@/constants/communities/types";
import { DEFAULT_ALERT_TIMEOUT } from "@/constants";
import { useCommunityStore } from "@/store";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { memo, useCallback, useEffect, useState } from "react";

interface AlertMessageProps {
    message: AlertMessageType;
    index: number;
}
const AlertMessage: React.FC<AlertMessageProps> = memo(({ message, index }) => {
    const { removeAlertMessage } = useCommunityStore();
    const [fadeOut, setFadeOut] = useState(false);
    const [isClosed, setIsClosed] = useState(false);

    const onClose = useCallback(
        (messageId: number) => {
            const removeDuration = 200;
            setFadeOut(true);
            setTimeout(() => {
                setIsClosed(true);
                removeAlertMessage(messageId);
            }, removeDuration);
        },
        [removeAlertMessage]
    );

    useEffect(() => {
        if (message.duration !== null) {
            const removeDuration = message.duration ?? DEFAULT_ALERT_TIMEOUT;
            const removeTimer = setTimeout(() => {
                onClose(message.id);
            }, removeDuration);
            return () => {
                clearTimeout(removeTimer);
            };
        }
    }, [message, onClose]);

    return (
        <Alert
            className={`alert-message ${fadeOut ? "fadeout" : ""}`}
            severity={message?.status || "info"}
            description={message?.text}
            small={true}
            closable
            onClose={() => onClose(message.id)}
            style={{ marginBottom: index * 50 }}
            isClosed={isClosed}
        />
    );
});

const AlertComponent = () => {
    const { alertMessages } = useCommunityStore();

    if (!alertMessages.length) return null;

    return alertMessages.map((message: AlertMessageType, index: number) => (
        <AlertMessage key={`alert-message-${message.id}`} message={message} index={index} />
    ));
};

export default AlertComponent;
