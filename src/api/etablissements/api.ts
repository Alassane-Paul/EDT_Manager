// src/api/etablissements/api.ts
import {
  Etablissement,
  EtablissementFilters,
  EtablissementFormData,
  EtablissementStats,
} from "@/types/etablissements";
import axiosInstance from "../axios_instance";

export const etablissementsApi = {
  async getAll(filters?: EtablissementFilters): Promise<{
    etablissements: Etablissement[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const response = await axiosInstance.get("/etablissements", { params: filters });
    return response.data;
  },

  async getById(id: string): Promise<Etablissement> {
    const response = await axiosInstance.get(`/etablissements/${id}`);
    return response.data.etablissement;
  },

  async create(data: EtablissementFormData): Promise<Etablissement> {
    const payload: any = { ...data };
    // Filtrer les champs optionnels vides
    const optionalFields = ['code_acces', 'logo_url', 'adresse', 'ville', 'code_postal', 'telephone', 'email', 'site_web'];
    optionalFields.forEach(field => {
      if (!payload[field]) delete payload[field];
    });

    const response = await axiosInstance.post("/etablissements", payload);
    return response.data.etablissement;
  },

  async update(id: string, data: Partial<EtablissementFormData>): Promise<Etablissement> {
    const payload: any = { ...data };
    // Filtrer les champs optionnels vides
    const optionalFields = ['code_acces', 'logo_url', 'adresse', 'ville', 'code_postal', 'telephone', 'email', 'site_web'];
    optionalFields.forEach(field => {
      if (payload[field] === "" || payload[field] == null) delete payload[field];
    });

    const response = await axiosInstance.put(`/etablissements/${id}`, payload);
    return response.data.etablissement;
  },

  async getStats(id: string): Promise<EtablissementStats> {
    const response = await axiosInstance.get(`/etablissements/${id}/stats`);
    return response.data.stats;
  },

  async generateAccessCode(id: string): Promise<{ code_acces: string }> {
    const response = await axiosInstance.post(`/etablissements/${id}/generate-access-code`);
    return response.data;
  },
};

