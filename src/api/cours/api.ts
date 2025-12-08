import axiosInstance from "../axios_instance";

export interface Cours {
  id: string;
  matiere_id: string;
  matiere_nom: string;
  enseignant_id: string;
  enseignant_nom: string;
  classe_id: string;
  classe_nom: string;
  heures_total: number;
  heures_effectuees: number;
  couleur?: string;
}

export interface CoursDetail extends Cours {
  prochains_cours: SeanceCours[];
  statistiques: {
    progression: number;
    heures_restantes: number;
  };
}

export interface SeanceCours {
  id: string;
  date: string;
  heure_debut: string;
  heure_fin: string;
  salle_id: string;
  salle_nom: string;
  statut: "planifie" | "en_cours" | "termine" | "annule";
}

export interface CoursFilters {
  classe_id?: string;
  enseignant_id?: string;
  matiere_id?: string;
}

export const coursApi = {
  async getAll(filters?: CoursFilters): Promise<Cours[]> {
    const response = await axiosInstance.get("/cours", { params: filters });
    return response.data;
  },

  async getById(id: string): Promise<CoursDetail> {
    const response = await axiosInstance.get(`/cours/${id}`);
    return response.data;
  },

  async getMesCours(): Promise<Cours[]> {
    const response = await axiosInstance.get("/cours/mes-cours");
    return response.data;
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
