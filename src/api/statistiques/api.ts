// src/api/statistiques/api.ts
import axiosInstance from "../axios_instance";

export interface GeneralStats {
  general: {
    total_classes: number;
    total_enseignants: number;
    total_salles: number;
    total_matieres: number;
    total_cours: number;
    total_utilisateurs: number;
  };
  etat: {
    classes_actives: number;
    emplois_temps_actifs: number;
    rattrapages_en_attente: number;
    absences_en_cours: number;
  };
  utilisation: {
    salles_utilisees: number;
    taux_utilisation_salles: string | number;
  };
}

export interface DashboardStats {
  alertes: {
    rattrapages_urgents: number;
    salles_en_maintenance: number;
    absences_a_valider: number;
  };
  activite_recente: Array<{
    id: string;
    classname: string; // Note: Ensure this matches backend response structure, earlier checked code showed inclusion of 'classe' association
    created_at: string;
    classe?: {
      nom_classe: string;
    };
  }>;
  date_actualisation: string;
}

export const statistiquesApi = {
  async getGenerales(): Promise<{ statistques: GeneralStats }> { // Backend returns nested "statistiques" key
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

  async getDashboard(): Promise<{ tableau_de_bord: DashboardStats }> {
    const response = await axiosInstance.get("/statistiques/dashboard");
    return response.data;
  },
};

