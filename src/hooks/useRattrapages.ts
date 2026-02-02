import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/api/axios_instance";
import { toast } from "sonner";

export interface Rattrapage {
  id: string;
  cours_id: string;
  type_rattrapage: string;
  duree: number;
  eleves_concernes: any; // JSON
  motif?: string;
  statut: 'demande' | 'valide' | 'refuse' | 'planifie' | 'realise' | 'annule';
  date_demande: string;
  periode_souhaitee_debut?: string;
  periode_souhaitee_fin?: string;
  cours?: {
    id: string;
    matiere: { nom_matiere: string; code_matiere: string };
    classe: { nom_classe: string };
    enseignant?: {
      utilisateur: { nom: string; prenom: string };
    };
  };
  creneau_planifie?: {
    date_debut: string; // To be checked against backend response
    salle?: { nom_salle: string };
  };
}

export interface CreateRattrapagePayload {
  cours_id: string;
  type_rattrapage: string;
  duree: number; // minutes
  eleves_concernes: string[]; // IDs or "TOUTE_LA_CLASSE"
  process_eleves?: string; // "TOUS" or "PARTIEL" logic handling in UI
  motif?: string;
  periode_souhaitee_debut?: string;
  periode_souhaitee_fin?: string;
}

const api = {
  // Récupérer les rattrapages (filtre automatiquement par enseignant via le backend)
  getAllRattrapages: async () => {
    const response = await axiosInstance.get('/rattrapages');
    return response.data.rattrapages || [];
  },

  // Créer une demande
  createRattrapage: async (payload: CreateRattrapagePayload) => {
    const response = await axiosInstance.post('/rattrapages', payload);
    return response.data;
  },

  // Récupérer un rattrapage par ID
  getRattrapageById: async (id: string) => {
    const response = await axiosInstance.get(`/rattrapages/${id}`);
    return response.data.rattrapage;
  },

  // Planifier
  planifierRattrapage: async ({ id, creneau_id }: { id: string; creneau_id: string }) => {
    const response = await axiosInstance.post(`/rattrapages/${id}/schedule`, { creneau_id });
    return response.data;
  },

  // Marquer réalisé
  marquerRealise: async (id: string) => {
    const response = await axiosInstance.post(`/rattrapages/${id}/complete`);
    return response.data;
  },

  // Annuler (si statut demande)
  cancelRattrapage: async ({ id, raison }: { id: string; raison: string }) => {
    const response = await axiosInstance.post(`/rattrapages/${id}/cancel`, { raison });
    return response.data;
  },

  // Valider
  validateRattrapage: async (id: string) => {
    const response = await axiosInstance.post(`/rattrapages/${id}/validate`);
    return response.data;
  },

  // Rejeter
  rejectRattrapage: async ({ id, motif }: { id: string; motif: string }) => {
    const response = await axiosInstance.post(`/rattrapages/${id}/reject`, { motif });
    return response.data;
  }
};

export function useRattrapages() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['rattrapages'],
    queryFn: api.getAllRattrapages
  });

  return {
    rattrapages: data as Rattrapage[],
    isLoading,
    error
  };
}

export function useRattrapage(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['rattrapage', id],
    queryFn: () => api.getRattrapageById(id),
    enabled: !!id
  });

  return {
    rattrapage: data as Rattrapage,
    isLoading,
    error
  };
}

export function useRattrapageActions() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: api.createRattrapage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rattrapages'] });
      toast.success("Demande de rattrapage créée avec succès");
    },
    onError: (err: any) => {
      console.error("Erreur création rattrapage:", err);
      toast.error("Erreur lors de la création de la demande");
    }
  });

  const planifierMutation = useMutation({
    mutationFn: api.planifierRattrapage,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rattrapages'] });
      queryClient.invalidateQueries({ queryKey: ['rattrapage', variables.id] });
      toast.success("Rattrapage planifié avec succès");
    },
    onError: (err: any) => {
      console.error("Erreur planification:", err);
      toast.error("Erreur lors de la planification");
    }
  });

  const realiserMutation = useMutation({
    mutationFn: api.marquerRealise,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['rattrapages'] });
      queryClient.invalidateQueries({ queryKey: ['rattrapage', id] });
      toast.success("Rattrapage marqué comme réalisé");
    },
    onError: (err: any) => {
      console.error("Erreur marquage réalisé:", err);
      toast.error("Erreur lors de la mise à jour");
    }
  });

  const cancelMutation = useMutation({
    mutationFn: api.cancelRattrapage,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rattrapages'] });
      queryClient.invalidateQueries({ queryKey: ['rattrapage', variables.id] });
      toast.success("Demande annulée avec succès");
    },
    onError: (err: any) => {
      console.error("Erreur annulation rattrapage:", err);
      toast.error("Erreur lors de l'annulation");
    }
  });

  return {
    createRattrapage: createMutation.mutate,
    isCreating: createMutation.isPending,
    planifierRattrapage: planifierMutation.mutate,
    isPlanifying: planifierMutation.isPending,
    marquerRealise: realiserMutation.mutate,
    isMarkingRealised: realiserMutation.isPending,
    cancelRattrapage: cancelMutation.mutate,
    isCancelling: cancelMutation.isPending,
    validateRattrapage: useMutation({
      mutationFn: api.validateRattrapage,
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: ['rattrapages'] });
        queryClient.invalidateQueries({ queryKey: ['rattrapage', id] });
        toast.success("Demande validée");
      },
      onError: () => toast.error("Erreur lors de la validation")
    }).mutate,
    rejectRattrapage: useMutation({
      mutationFn: api.rejectRattrapage,
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['rattrapages'] });
        queryClient.invalidateQueries({ queryKey: ['rattrapage', variables.id] });
        toast.success("Demande rejetée");
      },
      onError: () => toast.error("Erreur lors du rejet")
    }).mutate
  };
}
