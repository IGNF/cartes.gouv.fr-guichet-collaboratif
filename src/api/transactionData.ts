import { TransactionApi } from "@/constants/contributions/types";
import { getAxiosApi } from ".";
import { DATABASE_API_URL } from "@/constants/urls";

export const postTransactions = async (apis: TransactionApi[]) => {
    const axiosApi = await getAxiosApi();
    return Promise.allSettled(apis.map((api) => axiosApi.post(`${DATABASE_API_URL}/${api.database}/transactions`, api.body)));
};
