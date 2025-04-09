import { LOGIN_URL } from "@/constants/urls";
import { Button } from "@codegouvfr/react-dsfr/Button";

const NotConnected: React.FC = () => {
    return (
        <div className="container">
            <h1>Vous n'êtes pas connecter !</h1>
            <Button
                iconId="ri-login-box-line"
                size="large"
                onClick={() => {
                    window.location.href = LOGIN_URL;
                }}
            >
                Se connecter
            </Button>
        </div>
    );
};

export default NotConnected;
