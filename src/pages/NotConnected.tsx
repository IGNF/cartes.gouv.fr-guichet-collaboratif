import { LOGIN_URL } from "@/constants/urls";
import { useTranslation } from "@/i18n";
import { Button } from "@codegouvfr/react-dsfr/Button";

const NotConnected: React.FC = () => {
    const { t } = useTranslation({ NotConnected });
    return (
        <div className="container">
            <h1>{t("not_connected_message")}</h1>
            <Button
                iconId="ri-login-box-line"
                size="large"
                onClick={() => {
                    window.location.href = LOGIN_URL;
                }}
            >
                {t("login")}
            </Button>
        </div>
    );
};

export default NotConnected;
