// src/api/pricing/api.ts
import axiosInstance from "../axios_instance";

export const pricingApi = {
    async getRules(params?: { actif?: boolean }): Promise<any> {
        const response = await axiosInstance.get("/pricing/rules", { params });
        return response.data;
    },

    async createRule(data: any): Promise<any> {
        const response = await axiosInstance.post("/pricing/rules", data);
        return response.data;
    },

    async updateRule(id: string, data: any): Promise<any> {
        const response = await axiosInstance.put(`/pricing/rules/${id}`, data);
        return response.data;
    },

    async deleteRule(id: string): Promise<any> {
        const response = await axiosInstance.delete(`/pricing/rules/${id}`);
        return response.data;
    },

    async getEstimate(): Promise<any> {
        const response = await axiosInstance.get("/pricing/estimate");
        return response.data;
    },

    async getPlans(): Promise<any> {
        const response = await axiosInstance.get("/pricing/plans");
        return response.data;
    },
};
