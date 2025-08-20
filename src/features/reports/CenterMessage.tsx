import { useTranslation } from "@/i18n";

const CenterMessage: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    const { t } = useTranslation({ CenterMessage });
    return <p>{t("center_message", { onClick })}</p>;
};

export default CenterMessage;
