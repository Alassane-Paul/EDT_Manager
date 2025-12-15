// src/api/matieres/api.ts
import { Matiere, MatiereFilters, MatiereFormData, MatiereStats } from "@/types/matieres";
import axiosInstance from "../axios_instance";

export const matieresApi = {
  async getAll(filters?: MatiereFilters): Promise<{
    matieres: Matiere[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const response = await axiosInstance.get("/matieres", { params: filters });
    return response.data;
  },

  async getById(id: string): Promise<Matiere> {
    const response = await axiosInstance.get(`/matieres/${id}`);
    return response.data.matiere;
  },

  async create(data: MatiereFormData): Promise<Matiere> {
    const response = await axiosInstance.post("/matieres", data);
    return response.data.matiere;
  },

  async update(id: string, data: Partial<MatiereFormData>): Promise<Matiere> {
    const response = await axiosInstance.put(`/matieres/${id}`, data);
    return response.data.matiere;
  },

  async assignEnseignants(id: string, enseignant_ids: string[]): Promise<void> {
    await axiosInstance.post(`/matieres/${id}/assign-teachers`, { enseignant_ids });
  },

  async getStats(id: string): Promise<MatiereStats> {
    const response = await axiosInstance.get(`/matieres/${id}/stats`);
    return response.data.stats;
  },
};

