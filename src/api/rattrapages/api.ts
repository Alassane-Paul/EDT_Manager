// src/api/rattrapages/api.ts
import {
  Rattrapage,
  RattrapageFilters,
  RattrapageFormData,
  RattrapageStats,
  PlanifierRattrapageData,
} from "@/types/rattrapages";
import axiosInstance from "../axios_instance";

export const rattrapagesApi = {
  async getAll(filters?: RattrapageFilters): Promise<{
    rattrapages: Rattrapage[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const response = await axiosInstance.get("/rattrapages", { params: filters });
    return response.data;
  },

  async getById(id: string): Promise<Rattrapage> {
    const response = await axiosInstance.get(`/rattrapages/${id}`);
    return response.data.rattrapage;
  },

  async create(data: RattrapageFormData): Promise<Rattrapage> {
    const response = await axiosInstance.post("/rattrapages", data);
    return response.data.rattrapage;
  },

  async planifier(id: string, data: PlanifierRattrapageData): Promise<Rattrapage> {
    const response = await axiosInstance.post(`/rattrapages/${id}/schedule`, data);
    return response.data.rattrapage;
  },

  async marquerRealise(id: string): Promise<Rattrapage> {
    const response = await axiosInstance.post(`/rattrapages/${id}/complete`);
    return response.data.rattrapage;
  },

  async annuler(id: string): Promise<Rattrapage> {
    const response = await axiosInstance.post(`/rattrapages/${id}/cancel`);
    return response.data.rattrapage;
  },

  async getUrgents(): Promise<Rattrapage[]> {
    const response = await axiosInstance.get("/rattrapages/stats/urgent");
    return response.data.rattrapages;
  },

  async getStats(): Promise<RattrapageStats> {
    const response = await axiosInstance.get("/rattrapages/stats/overview");
    return response.data.stats;
  },
};

export const retakeExamsApi = {
  getEligibleStudents: async (sessionId: string) => {
    const response = await axiosInstance.get(`/sessions-examen/${sessionId}/eligible-students`);
    return response.data;
  },

  createRetake: async (sessionId: string, data: { date_examen: string; heure_debut: string; heure_fin: string; eleves_eligibles: any[] }) => {
    const response = await axiosInstance.post(`/sessions-examen/${sessionId}/create-retake`, data);
    return response.data;
  }
};
