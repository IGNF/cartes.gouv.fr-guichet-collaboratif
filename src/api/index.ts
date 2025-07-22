import axios from "axios";

export const axiosApi = axios.create({
    headers: {
        "X-Requested-With": "XMLHttpRequest",
    },
});
