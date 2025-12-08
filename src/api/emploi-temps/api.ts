import axiosInstance from "../axios_instance";

export interface Seance {
  id: string;
  cours_id: string;
  matiere_nom: string;
  enseignant_id: string;
  enseignant_nom: string;
  classe_id: string;
  classe_nom: string;
  salle_id: string;
  salle_nom: string;
  jour: "lundi" | "mardi" | "mercredi" | "jeudi" | "vendredi" | "samedi";
  date: string;
  heure_debut: string;
  heure_fin: string;
  type: "cours" | "td" | "tp" | "examen";
  statut: "planifie" | "en_cours" | "termine" | "annule";
  couleur?: string;
}

export interface EmploiTemps {
  semaine: string;
  date_debut: string;
  date_fin: string;
  seances: {
    lundi: Seance[];
    mardi: Seance[];
    mercredi: Seance[];
    jeudi: Seance[];
    vendredi: Seance[];
    samedi?: Seance[];
  };
  statistiques: {
    heures_total: number;
    nombre_seances: number;
    matieres_count: number;
  };
}

export interface EmploiTempsFilters {
  classe_id?: string;
  enseignant_id?: string;
  semaine?: string;
  date_debut?: string;
  date_fin?: string;
}

export const emploiTempsApi = {
  async getMonEmploiTemps(semaine?: string): Promise<EmploiTemps> {
    const response = await axiosInstance.get("/emplois-temps/me", {
      params: { semaine },
    });
    return response.data;
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

  async getAll(filters?: EmploiTempsFilters): Promise<EmploiTemps[]> {
    const response = await axiosInstance.get("/emplois-temps", { params: filters });
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
    const response = await axiosInstance.put(`/emplois-temps/seances/${id}/annuler`, { motif });
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
