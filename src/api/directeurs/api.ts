// src/api/directeurs/api.ts
import { Directeur, DirecteurFormData } from "@/types/staff";
import axiosInstance from "../axios_instance";

export const directeursApi = {
    async getAll(params?: { page?: number; limit?: number; search?: string }): Promise<{
        directeurs: Directeur[];
        pagination: any;
    }> {
        const response = await axiosInstance.get("/directeurs", { params });
        return response.data;
    },

    async create(data: DirecteurFormData): Promise<Directeur> {
        const response = await axiosInstance.post("/directeurs", data);
        return response.data.directeur;
    },

    async update(id: string, data: Partial<DirecteurFormData>): Promise<Directeur> {
        const response = await axiosInstance.put(`/directeurs/${id}`, data);
        return response.data.directeur;
    },

    async delete(id: string): Promise<void> {
        await axiosInstance.delete(`/directeurs/${id}`);
    },
};
