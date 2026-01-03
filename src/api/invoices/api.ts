// src/api/invoices/api.ts
import axiosInstance from "../axios_instance";

export const invoicesApi = {
    async getAll(params?: {
        page?: number;
        limit?: number;
        statut?: string;
    }): Promise<any> {
        const response = await axiosInstance.get("/invoices", { params });
        return response.data;
    },

    async getById(id: string): Promise<any> {
        const response = await axiosInstance.get(`/invoices/${id}`);
        return response.data;
    },

    async getSummary(): Promise<any> {
        const response = await axiosInstance.get("/invoices/summary");
        return response.data;
    },

    async generate(data: {
        etablissement_id: string;
        periode_debut: string;
        periode_fin: string;
    }): Promise<any> {
        const response = await axiosInstance.post("/invoices/generate", data);
        return response.data;
    },

    async markAsPaid(id: string, data?: {
        mode_paiement?: string;
        reference?: string;
    }): Promise<any> {
        const response = await axiosInstance.put(`/invoices/${id}/pay`, data);
        return response.data;
    },
};
