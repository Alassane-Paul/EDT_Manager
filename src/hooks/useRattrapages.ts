import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rattrapagesApi } from "@/api/rattrapages/api";
import {
  RattrapageFilters,
  RattrapageFormData,
  PlanifierRattrapageData,
} from "@/types/rattrapages";
import { toast } from "sonner";

export function useRattrapages(filters?: RattrapageFilters) {
  const query = useQuery({
    queryKey: ["rattrapages", filters],
    queryFn: () => rattrapagesApi.getAll(filters),
  });

  return {
    rattrapages: query.data?.rattrapages ?? [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useRattrapage(id: string) {
  return useQuery({
    queryKey: ["rattrapage", id],
    queryFn: () => rattrapagesApi.getById(id),
    enabled: !!id,
  });
}

export function useRattrapagesUrgents() {
  return useQuery({
    queryKey: ["rattrapages", "urgents"],
    queryFn: () => rattrapagesApi.getUrgents(),
  });
}

export function useRattrapageStats() {
  return useQuery({
    queryKey: ["rattrapages", "stats"],
    queryFn: () => rattrapagesApi.getStats(),
  });
}

export function useCreateRattrapage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RattrapageFormData) => rattrapagesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rattrapages"] });
      toast.success("Rattrapage créé avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la création du rattrapage");
    },
  });
}

export function usePlanifierRattrapage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PlanifierRattrapageData }) =>
      rattrapagesApi.planifier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rattrapages"] });
      toast.success("Rattrapage planifié avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la planification");
    },
  });
}

export function useMarquerRattrapageRealise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rattrapagesApi.marquerRealise(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rattrapages"] });
      toast.success("Rattrapage marqué comme réalisé");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });
}

export function useAnnulerRattrapage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rattrapagesApi.annuler(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rattrapages"] });
      toast.success("Rattrapage annulé");
    },
    onError: () => {
      toast.error("Erreur lors de l'annulation");
    },
  });
}

