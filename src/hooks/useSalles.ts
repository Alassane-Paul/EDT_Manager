import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sallesApi, Salle, SalleFilters } from "@/api/salles/api";
import { toast } from "sonner";

export function useSalles(filters?: SalleFilters) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["salles", filters],
    queryFn: () => sallesApi.getAll(filters),
  });

  return {
    salles: data || [],
    isLoading,
    error,
  };
}

export function useSalleDisponibilite(id: string, date: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["salle-disponibilite", id, date],
    queryFn: () => sallesApi.getDisponibilite(id, date),
    enabled: !!id && !!date,
  });

  return {
    disponibilite: data,
    isLoading,
    error,
  };
}

export function useSallesDisponibles(date: string, heureDebut: string, heureFin: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["salles-disponibles", date, heureDebut, heureFin],
    queryFn: () => sallesApi.getSallesDisponibles(date, heureDebut, heureFin),
    enabled: !!date && !!heureDebut && !!heureFin,
  });

  return {
    sallesDisponibles: data || [],
    isLoading,
    error,
  };
}

export function useSallesActions() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: Partial<Salle>) => sallesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salles"] });
      toast.success("Salle créée avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la création de la salle");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Salle> }) =>
      sallesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salles"] });
      toast.success("Salle mise à jour avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: sallesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salles"] });
      toast.success("Salle supprimée");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });

  return {
    createSalle: createMutation.mutate,
    updateSalle: updateMutation.mutate,
    deleteSalle: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
