import { getOidc } from "@/oidc";
import axios, { AxiosInstance, AxiosRequestHeaders } from "axios";

async function createAxiosApi() {
    const oidc = await getOidc();

    const instance = axios.create();

    instance.interceptors.request.use(async (config) => {
        if (oidc.isUserLoggedIn) {
            const accessToken = await oidc.getAccessToken();
            if (!config.headers) {
                config.headers = {} as AxiosRequestHeaders;
            }
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    });

    return instance;
}

let _axiosInstance: AxiosInstance | null = null;

export async function getAxiosApi() {
    if (!_axiosInstance) _axiosInstance = await createAxiosApi();
    return _axiosInstance;
}
