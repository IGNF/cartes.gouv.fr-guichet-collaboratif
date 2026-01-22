import { fr } from "@codegouvfr/react-dsfr";

const LoaderComponent = () => {
    return <i className={`${fr.cx("fr-icon-refresh-line")} loader`} style={{ height: "100vh" }} />;
};

export default LoaderComponent;
