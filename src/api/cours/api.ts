import { Cours, CoursDetail, CoursFilters } from "@/types/cours";
import axiosInstance from "../axios_instance";


export const coursApi = {
  async getAll(filters?: CoursFilters): Promise<Cours[]> {
    const response = await axiosInstance.get("/cours", { params: filters });
    return response.data;
  },

  async getById(id: string): Promise<CoursDetail> {
    const response = await axiosInstance.get(`/cours/${id}`);
    return response.data;
  },

  async getMesCours(enseignantId?: string): Promise<Cours[]> {
    const response = await axiosInstance.get("/cours/me", {
      params: { enseignantId }
    });
    return response.data.cours;
  },

  async create(data: Partial<Cours>): Promise<Cours> {
    const response = await axiosInstance.post("/cours", data);
    return response.data;
  },

  async update(id: string, data: Partial<Cours>): Promise<Cours> {
    const response = await axiosInstance.put(`/cours/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/cours/${id}`);
  },
};
