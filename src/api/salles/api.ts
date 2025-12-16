import axiosInstance from "../axios_instance";
import { Salle, SalleFilters, SalleFormData, SalleDisponibilite } from "@/types/salles";

export type { Salle };

export const sallesApi = {
  async getAll(filters?: SalleFilters): Promise<{
    salles: Salle[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const response = await axiosInstance.get("/salles", { params: filters });
    return response.data;
  },

  async getById(id: string): Promise<Salle> {
    const response = await axiosInstance.get(`/salles/${id}`);
    return response.data;
  },

  async getDisponibilite(id: string, date: string): Promise<SalleDisponibilite> {
    const response = await axiosInstance.get(`/salles/${id}/disponibilite`, {
      params: { date },
    });
    return response.data;
  },

  async getSallesDisponibles(date: string, heure_debut: string, heure_fin: string): Promise<Salle[]> {
    const response = await axiosInstance.get("/salles/disponibles", {
      params: { date, heure_debut, heure_fin },
    });
    return response.data;
  },

  async create(data: Partial<Salle>): Promise<Salle> {
    const response = await axiosInstance.post("/salles", data);
    return response.data;
  },

  async update(id: string, data: Partial<Salle>): Promise<Salle> {
    const response = await axiosInstance.put(`/salles/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/salles/${id}`);
  },
};
