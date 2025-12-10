import { Absence, AbsenceDeclaration, AbsenceFilters, EtudiantPresence } from "@/types/absences";
import axiosInstance from "../axios_instance";

export const absencesApi = {
  async getAll(filters?: AbsenceFilters): Promise<Absence[]> {
    const response = await axiosInstance.get("/absences", { params: filters });
    return response.data;
  },

  async getBySeance(seanceId: string): Promise<Absence[]> {
    const response = await axiosInstance.get(`/absences/seance/${seanceId}`);
    return response.data;
  },

  async getEtudiantsSeance(seanceId: string): Promise<EtudiantPresence[]> {
    const response = await axiosInstance.get(`/seances/${seanceId}/etudiants`);
    return response.data;
  },

  async declarer(data: AbsenceDeclaration): Promise<Absence[]> {
    const response = await axiosInstance.post("/absences/declarer", data);
    return response.data;
  },

  async justifier(id: string, motif: string): Promise<Absence> {
    const response = await axiosInstance.put(`/absences/${id}/justifier`, { motif });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/absences/${id}`);
  },
};
