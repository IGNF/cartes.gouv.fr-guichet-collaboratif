import { TransactionApi } from "@/constants/contributions/types";
import { axiosApi } from ".";
import { DATABASE_API_URL } from "@/constants/urls";

export const postTransactions = async (apis: TransactionApi[]) => {
    const postResAll = await Promise.all(apis.map((api) => axiosApi.post(`${DATABASE_API_URL}/${api.database}/transactions`, api.body)));
    return postResAll;
};
