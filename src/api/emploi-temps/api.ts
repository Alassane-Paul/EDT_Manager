import { EmploiTemps, EmploiTempsFilters, Seance, GenerationParams, EmploiTempsListItem } from "@/types/emploi-temps";
import axiosInstance from "../axios_instance";


export const emploiTempsApi = {
  async getMonEmploiTemps(semaine?: string): Promise<EmploiTemps> {
    const response = await axiosInstance.get("/emplois-temps/me", {
      params: { semaine },
    });
    return response.data.emploi_temps || response.data;
  },

  async getByClasse(classeId: string, semaine?: string): Promise<EmploiTemps> {
    const response = await axiosInstance.get(`/emplois-temps/classe/${classeId}`, {
      params: { semaine },
    });
    return response.data;
  },

  async getByEnseignant(enseignantId: string, semaine?: string): Promise<EmploiTemps> {
    const response = await axiosInstance.get(`/emplois-temps/enseignant/${enseignantId}`, {
      params: { semaine },
    });
    return response.data;
  },

  async getById(id: string): Promise<EmploiTempsListItem> {
    const response = await axiosInstance.get(`/emplois-temps/${id}`);
    return response.data;
  },

  async getStatus(id: string): Promise<{
    id: string;
    statut: string;
    is_generating: boolean;
    is_complete: boolean;
    score_qualite: number;
    duree_generation: number;
    nombre_creneaux: number;
    commentaires?: string;
  }> {
    const response = await axiosInstance.get(`/emplois-temps/${id}/status`);
    return response.data;
  },

  async getAll(filters?: EmploiTempsFilters): Promise<{ emplois_temps: EmploiTempsListItem[], pagination: any }> {
    const response = await axiosInstance.get("/emplois-temps", { params: filters });
    return response.data;
  },

  async genererEmploiTemps(data: GenerationParams): Promise<any> {
    const response = await axiosInstance.post("/emplois-temps/generer", data);
    return response.data;
  },

  async createSeance(data: Partial<Seance>): Promise<Seance> {
    const response = await axiosInstance.post("/emplois-temps/seances", data);
    return response.data;
  },

  async updateSeance(id: string, data: Partial<Seance>): Promise<Seance> {
    const response = await axiosInstance.put(`/emplois-temps/seances/${id}`, data);
    return response.data;
  },

  async deleteSeance(id: string): Promise<void> {
    await axiosInstance.delete(`/emplois-temps/seances/${id}`);
  },

  async annulerSeance(id: string, motif: string): Promise<Seance> {
    const response = await axiosInstance.put(`/emplois-temps/${id}/annuler`, { motif });
    return response.data;
  },

  async validerEmploiTemps(id: string): Promise<any> {
    const response = await axiosInstance.post(`/emplois-temps/${id}/validate`);
    return response.data;
  },

  async publierEmploiTemps(id: string): Promise<any> {
    const response = await axiosInstance.post(`/emplois-temps/${id}/publish`);
    return response.data;
  },

  async exportPDF(filters?: EmploiTempsFilters): Promise<Blob> {
    const response = await axiosInstance.get("/emplois-temps/export/pdf", {
      params: filters,
      responseType: "blob",
    });
    return response.data;
  },
};
