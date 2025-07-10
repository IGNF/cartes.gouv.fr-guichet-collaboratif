import axios from "axios";

export const axiosApi = axios.create({
    headers: {
        "X-Requested-With": "XMLHttpRequest",
    },
});

axiosApi.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log(error);
        if (error.response) {
            console.error("API Error:", error.response.status, error.response.data);
            // You can even show a toast or redirect based on status
            if (error.response.status === 401) {
                if (error.data.details?.session_expired) {
                    console.log("hello error");
                }
            }
        } else if (error.request) {
            console.error("No response from server:", error.request);
        } else {
            console.error("Axios error:", error.message);
        }

        // Optionally: return a rejected Promise so the calling code can still handle it
        return Promise.reject(error);
    }
);
