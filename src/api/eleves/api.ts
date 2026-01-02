// src/api/eleves/api.ts
import { Eleve, EleveFilters, EleveFormData } from "@/types/eleves";
import axiosInstance from "../axios_instance";

export const elevesApi = {
    async getAll(filters?: EleveFilters): Promise<{
        eleves: Eleve[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }> {
        const response = await axiosInstance.get("/eleves", { params: filters });
        return response.data;
    },

    async getById(id: string): Promise<Eleve> {
        const response = await axiosInstance.get(`/eleves/${id}`);
        return response.data.eleve;
    },

    async create(data: EleveFormData): Promise<Eleve> {
        const response = await axiosInstance.post("/eleves", data);
        return response.data.eleve;
    },

    async update(id: string, data: Partial<EleveFormData>): Promise<Eleve> {
        const response = await axiosInstance.put(`/eleves/${id}`, data);
        return response.data.eleve;
    },

    async delete(id: string): Promise<void> {
        await axiosInstance.delete(`/eleves/${id}`);
    },
};
