// src/api/enseignants/api.ts
import { Enseignant, EnseignantFilters, EnseignantFormData, EnseignantStats } from "@/types/enseignants";
import axiosInstance from "../axios_instance";

export const enseignantsApi = {
  async getAll(filters?: EnseignantFilters): Promise<{
    enseignants: Enseignant[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const response = await axiosInstance.get("/enseignants", { params: filters });
    return response.data;
  },

  async getById(id: string): Promise<Enseignant> {
    const response = await axiosInstance.get(`/enseignants/${id}`);
    return response.data.enseignant;
  },

  async create(data: EnseignantFormData): Promise<Enseignant> {
    const response = await axiosInstance.post("/enseignants", data);
    return response.data.enseignant;
  },

  async update(id: string, data: Partial<EnseignantFormData>): Promise<Enseignant> {
    const response = await axiosInstance.put(`/enseignants/${id}`, data);
    return response.data.enseignant;
  },

  async assignMatieres(id: string, matiere_ids: string[]): Promise<void> {
    await axiosInstance.post(`/enseignants/${id}/assign-subjects`, { matiere_ids });
  },

  async getSchedule(id: string, date_debut?: string, date_fin?: string): Promise<any> {
    const response = await axiosInstance.get(`/enseignants/${id}/schedule`, {
      params: { date_debut, date_fin }
    });
    return response.data;
  },

  async getStats(id: string): Promise<EnseignantStats> {
    const response = await axiosInstance.get(`/enseignants/${id}/stats`);
    return response.data.stats;
  },

  async getDisponibilites(id: string): Promise<any[]> {
    const response = await axiosInstance.get(`/enseignants/${id}/disponibilites`);
    return response.data.disponibilites;
  },

  async createDisponibilite(id: string, data: any): Promise<any> {
    const response = await axiosInstance.post(`/enseignants/${id}/disponibilites`, data);
    return response.data.disponibilite;
  },

  async deleteDisponibilite(enseignantId: string, disponibiliteId: string): Promise<void> {
    await axiosInstance.delete(`/enseignants/${enseignantId}/disponibilites/${disponibiliteId}`);
  }
};