// src/api/classes/api.ts
import { Classe, ClasseFilters, ClasseFormData, ClasseStats } from "@/types/classes";
import axiosInstance from "../axios_instance";

export const classesApi = {
  async getAll(filters?: ClasseFilters): Promise<{
    classes: Classe[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const response = await axiosInstance.get("/classes", { params: filters });
    return response.data;
  },

  async getById(id: string): Promise<Classe> {
    const response = await axiosInstance.get(`/classes/${id}`);
    return response.data.classe;
  },

  async create(data: ClasseFormData): Promise<Classe> {
    const payload: any = { ...data };
    // Filtrer les champs optionnels vides
    if (!payload.filiere) delete payload.filiere;
    if (!payload.salle_principale) delete payload.salle_principale;
    
    const response = await axiosInstance.post("/classes", payload);
    return response.data.classe;
  },

  async update(id: string, data: Partial<ClasseFormData>): Promise<Classe> {
    const payload: any = { ...data };
    // Filtrer les champs optionnels vides
    if (payload.filiere === "" || payload.filiere == null) delete payload.filiere;
    if (payload.salle_principale === "" || payload.salle_principale == null) delete payload.salle_principale;
    // Toujours envoyer le statut s'il est défini
    if (payload.statut === undefined && data.statut) {
      payload.statut = data.statut;
    }
    
    const response = await axiosInstance.put(`/classes/${id}`, payload);
    return response.data.classe;
  },

  async archive(id: string): Promise<void> {
    await axiosInstance.post(`/classes/${id}/archive`);
  },

  async activate(id: string): Promise<void> {
    await axiosInstance.post(`/classes/${id}/activate`);
  },

  async getStats(id: string): Promise<ClasseStats> {
    const response = await axiosInstance.get(`/classes/${id}/stats`);
    return response.data.stats;
  },
};

