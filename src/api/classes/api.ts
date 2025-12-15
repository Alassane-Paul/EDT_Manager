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
    const response = await axiosInstance.post("/classes", data);
    return response.data.classe;
  },

  async update(id: string, data: Partial<ClasseFormData>): Promise<Classe> {
    const response = await axiosInstance.put(`/classes/${id}`, data);
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

