export const BASE_URL = import.meta.env.VITE_BASE_URL;
export const API_URL = import.meta.env.VITE_API_URL;

const FRONT_BASE_URL = import.meta.env.VITE_FRONT_BASE_URL;

export const HOME_URL = FRONT_BASE_URL;
export const PROFILE_URL = FRONT_BASE_URL + "/profile";
export const PAGE_404_URL = FRONT_BASE_URL + "/page-404";
export const LIST_COMMUNITIES_URL = "https://espacecollaboratif.ign.fr/front-office";

export const LOGIN_URL = BASE_URL + "/login";
export const LOGOUT_URL = BASE_URL + "/logout?app=guichet-collaboratif";

export const USER_PROFILE_API_URL = API_URL + "/users/me";
export const USERS_API_URL = API_URL + "/users";
export const COMMUNITIES_API_URL = API_URL + "/espaceco/community";
