import axiosInstance from "../axios_instance";

export interface Salle {
  id: string;
  nom: string;
  capacite: number;
  type: "cours" | "tp" | "td" | "amphi" | "labo";
  equipements: string[];
  etablissement_id: string;
  batiment?: string;
  etage?: number;
  disponible: boolean;
}

export interface SalleDisponibilite {
  salle: Salle;
  creneaux_disponibles: CreneauDisponible[];
  creneaux_occupes: CreneauOccupe[];
}

export interface CreneauDisponible {
  date: string;
  heure_debut: string;
  heure_fin: string;
}

export interface CreneauOccupe {
  date: string;
  heure_debut: string;
  heure_fin: string;
  cours_id: string;
  matiere_nom: string;
  enseignant_nom: string;
}

export interface SalleFilters {
  type?: string;
  capacite_min?: number;
  disponible?: boolean;
  date?: string;
  heure_debut?: string;
  heure_fin?: string;
}

export const sallesApi = {
  async getAll(filters?: SalleFilters): Promise<Salle[]> {
    const response = await axiosInstance.get("/salles", { params: filters });
    return response.data;
  },

  async getById(id: string): Promise<Salle> {
    const response = await axiosInstance.get(`/salles/${id}`);
    return response.data;
  },

  async getDisponibilite(id: string, date: string): Promise<SalleDisponibilite> {
    const response = await axiosInstance.get(`/salles/${id}/disponibilite`, {
      params: { date },
    });
    return response.data;
  },

  async getSallesDisponibles(date: string, heure_debut: string, heure_fin: string): Promise<Salle[]> {
    const response = await axiosInstance.get("/salles/disponibles", {
      params: { date, heure_debut, heure_fin },
    });
    return response.data;
  },

  async create(data: Partial<Salle>): Promise<Salle> {
    const response = await axiosInstance.post("/salles", data);
    return response.data;
  },

  async update(id: string, data: Partial<Salle>): Promise<Salle> {
    const response = await axiosInstance.put(`/salles/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/salles/${id}`);
  },
};
