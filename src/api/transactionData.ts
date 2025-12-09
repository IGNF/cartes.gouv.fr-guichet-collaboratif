import { TransactionApi, TransactionStatus } from "@/constants/contributions/types";
import { axiosApi } from ".";
import { DATABASE_API_URL } from "@/constants/urls";

export const postTransactions = async (apis: TransactionApi[]) => {
    const postResAll = await Promise.all(apis.map((api) => axiosApi.post(`${DATABASE_API_URL}/${api.database}/transactions`, api.body)));
    return postResAll;
};

export const getTransactionStatus = async (database: number, transactionId: number): Promise<TransactionStatus> => {
    const response = await axiosApi.get(`${DATABASE_API_URL}/${database}/transactions/${transactionId}`);
    return response.data;
};

export const pollTransactionStatus = async (
    database: number,
    transactionId: number,
    maxAttempts: number = 30,
    intervalMs: number = 1000
): Promise<TransactionStatus> => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const status = await getTransactionStatus(database, transactionId);

        if (status.status === "committed" || status.status != "pending") {
            return status;
        }

        await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error("Echec de la transaction: TimeOut");
};
