import { AlertMessageType } from "@/constants/communities/types";
import { useCommunityStore } from "@/store";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { memo, useEffect, useState } from "react";

interface AlertMessageProps {
    message: AlertMessageType;
    index: number;
}
const AlertMessage: React.FC<AlertMessageProps> = memo(({ message, index }) => {
    const { removeAlertMessage } = useCommunityStore();
    const [fadeOut, setFadeOut] = useState(false);
    useEffect(() => {
        const removeDuration = 3000;
        const fadeDuration = 200;
        const fadeTimer = setTimeout(() => {
            setFadeOut(true);
        }, removeDuration - fadeDuration);
        const removeTimer = setTimeout(() => {
            removeAlertMessage(message.id);
        }, removeDuration);
        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(removeTimer);
        };
    }, [message, removeAlertMessage]);

    return (
        <Alert
            className={`alert-message ${fadeOut ? "fadeout" : ""}`}
            severity={message?.status || "info"}
            description={`${message?.text}`}
            small={true}
            closable
            onClose={() => removeAlertMessage(message.id)}
            style={{ marginBottom: index * 50 }}
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
