export const BASE_URL = import.meta.env.VITE_BASE_URL;
export const FRONT_URL = import.meta.env.VITE_FRONT_URL;
export const SERVER_URL = import.meta.env.VITE_SERVER_URL;
export const API_URL = SERVER_URL + "/gcms/api";

const FRONT_BASE_URL = BASE_URL + FRONT_URL;

export const HOME_URL = FRONT_BASE_URL;
export const PROFILE_URL = FRONT_BASE_URL + "/profile";
export const PAGE_404_URL = FRONT_BASE_URL + "/page-404";

export const LIST_COMMUNITIES_URL = SERVER_URL + "/front-office";
export const DOWNLOAD_DOCUMENT_URL = SERVER_URL + "/document/download";

export const USER_PROFILE_API_URL = API_URL + "/users/me";
export const USERS_API_URL = API_URL + "/users";
export const COMMUNITIES_API_URL = API_URL + "/communities";
export const GEOSERVICES_API_URL = API_URL + "/geoservices";
export const DATABASE_API_URL = API_URL + "/databases";
export const GRIDS_API_URL = API_URL + "/grids";

export const REPORTS_API_URL = API_URL + "/reports";
export const REPORTS_WFS_API_URL = API_URL + "/reports/wfs";

export const CARTESGOUV_DISCOVER = BASE_URL + "/decouvrir";

export const DASHBOARD_URL = FRONT_BASE_URL + "/tableau-de-bord";
export const MY_ACCOUNT_URL = FRONT_BASE_URL + "/mon-compte";
export const ADMIN_COMMUNITY_URL = BASE_URL + "/espace-collaboratif";

// Header links (all external to community)

export const HELP_URL = BASE_URL + "/aide";
export const HELP_PRODUCER_GUIDE_URL = BASE_URL + "/aide/fr/guides-producteur/";
export const CONTACT_US_URL = BASE_URL + "/aide/fr/nous-ecrire";

export const EXPLORE_MAPS_URL = BASE_URL + "/explorer-les-cartes";
export const SEARCH_DATA_URL = BASE_URL + "/rechercher-une-donnee";
export const PUBLISH_DATA_URL = BASE_URL + "/publier-une-donnee";
export const CREATE_DATA_URL = BASE_URL + "/editeur-carto";
export const DISCOVER_URL = BASE_URL + "/decouvrir";
