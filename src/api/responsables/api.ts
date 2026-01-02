// src/api/responsables/api.ts
import { ResponsablePedagogique, ResponsablePedagogiqueFormData } from "@/types/staff";
import axiosInstance from "../axios_instance";

export const responsablesApi = {
    async getAll(params?: { page?: number; limit?: number; search?: string }): Promise<{
        rps: ResponsablePedagogique[];
        pagination: any;
    }> {
        const response = await axiosInstance.get("/responsables-pedagogiques", { params });
        return response.data;
    },

    async create(data: ResponsablePedagogiqueFormData): Promise<ResponsablePedagogique> {
        const response = await axiosInstance.post("/responsables-pedagogiques", data);
        return response.data.rp;
    },

    async update(id: string, data: Partial<ResponsablePedagogiqueFormData>): Promise<ResponsablePedagogique> {
        const response = await axiosInstance.put(`/responsables-pedagogiques/${id}`, data);
        return response.data.rp;
    },

    async delete(id: string): Promise<void> {
        await axiosInstance.delete(`/responsables-pedagogiques/${id}`);
    },
};
