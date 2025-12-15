// src/api/statistiques/api.ts
import axiosInstance from "../axios_instance";

export interface StatistiquesGenerales {
  total_etablissements: number;
  total_classes: number;
  total_enseignants: number;
  total_etudiants: number;
  total_cours: number;
  total_salles: number;
  total_emplois_temps: number;
  total_rattrapages: number;
  rattrapages_urgents: number;
}

export const statistiquesApi = {
  async getGenerales(): Promise<StatistiquesGenerales> {
    const response = await axiosInstance.get("/statistiques/general");
    return response.data;
  },

  async getPeriodiques(date_debut?: string, date_fin?: string): Promise<any> {
    const response = await axiosInstance.get("/statistiques/periodic", {
      params: { date_debut, date_fin },
    });
    return response.data;
  },

  async getParClasse(): Promise<any> {
    const response = await axiosInstance.get("/statistiques/classes");
    return response.data;
  },

  async getParEnseignant(): Promise<any> {
    const response = await axiosInstance.get("/statistiques/enseignants");
    return response.data;
  },

  async getDashboard(): Promise<any> {
    const response = await axiosInstance.get("/statistiques/dashboard");
    return response.data;
  },
};

