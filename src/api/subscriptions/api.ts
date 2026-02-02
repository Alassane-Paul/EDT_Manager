// src/api/subscriptions/api.ts
import axiosInstance from "../axios_instance";

export const subscriptionsApi = {
    async getSubscription(): Promise<any> {
        const response = await axiosInstance.get("/subscriptions/");
        return response.data;
    },

    async create(data: {
        etablissement_id: string;
        plan_type: string;
        date_debut?: string;
    }): Promise<any> {
        const response = await axiosInstance.post("/subscriptions", data);
        return response.data;
    },

    async update(id: string, plan_type: string): Promise<any> {
        const response = await axiosInstance.put(`/subscriptions/${id}`, { plan_type });
        return response.data;
    },

    async cancel(id: string): Promise<any> {
        const response = await axiosInstance.delete(`/subscriptions/${id}`);
        return response.data;
    },

    async getUsageStats(period?: string): Promise<any> {
        const response = await axiosInstance.get("/subscriptions/usage/stats", {
            params: { period }
        });
        return response.data;
    },
};
