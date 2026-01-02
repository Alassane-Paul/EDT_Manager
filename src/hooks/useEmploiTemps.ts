import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { emploiTempsApi } from "@/api/emploi-temps/api";
import { EmploiTemps, EmploiTempsFilters, Seance, GenerationParams } from "@/types/emploi-temps";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function useMonEmploiTemps(semaine?: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["mon-emploi-temps", semaine],
    queryFn: () => emploiTempsApi.getMonEmploiTemps(semaine),
  });

  return {
    emploiTemps: data,
    isLoading,
    error,
  };
}

export function useEmploiTempsClasse(classeId: string, semaine?: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["emploi-temps-classe", classeId, semaine],
    queryFn: () => emploiTempsApi.getByClasse(classeId, semaine),
    enabled: !!classeId,
  });

  return {
    emploiTemps: data,
    isLoading,
    error,
  };
}

export function useEmploiTempsEnseignant(enseignantId: string, semaine?: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["emploi-temps-enseignant", enseignantId, semaine],
    queryFn: () => emploiTempsApi.getByEnseignant(enseignantId, semaine),
    enabled: !!enseignantId,
  });

  return {
    emploiTemps: data,
    isLoading,
    error,
  };
}

export function useEmploiTempsById(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["emploi-temps", id],
    queryFn: () => emploiTempsApi.getById(id),
    enabled: !!id,
  });

  return {
    emploiTemps: data,
    isLoading,
    error,
  };
}

export function useEmploiTempsAll(filters?: EmploiTempsFilters) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["emplois-temps", filters],
    queryFn: () => emploiTempsApi.getAll(filters),
  });

  return {
    emploisTemps: data?.emplois_temps || [],
    pagination: data?.pagination,
    isLoading,
    error,
  };
}

export function useGenerateEmploiTemps() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (data: GenerationParams) => emploiTempsApi.genererEmploiTemps(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emplois-temps"] });
      toast.success("Emploi du temps généré avec succès");
      navigate("/gestion/emplois-temps");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Erreur lors de la génération");
    },
  });

  return {
    genererEmploiTemps: mutation.mutate,
    isGenerating: mutation.isPending,
  };
}

export function useSeanceActions() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: Partial<Seance>) => emploiTempsApi.createSeance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emplois-temps"] });
      queryClient.invalidateQueries({ queryKey: ["mon-emploi-temps"] });
      toast.success("Séance créée avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la création de la séance");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Seance> }) =>
      emploiTempsApi.updateSeance(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emplois-temps"] });
      queryClient.invalidateQueries({ queryKey: ["mon-emploi-temps"] });
      toast.success("Séance mise à jour avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: emploiTempsApi.deleteSeance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emplois-temps"] });
      queryClient.invalidateQueries({ queryKey: ["mon-emploi-temps"] });
      toast.success("Séance supprimée");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });

  const annulerMutation = useMutation({
    mutationFn: ({ id, motif }: { id: string; motif: string }) =>
      emploiTempsApi.annulerSeance(id, motif),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emplois-temps"] });
      queryClient.invalidateQueries({ queryKey: ["mon-emploi-temps"] });
      toast.success("Séance annulée");
    },
    onError: () => {
      toast.error("Erreur lors de l'annulation");
    },
  });

  return {
    createSeance: createMutation.mutate,
    updateSeance: updateMutation.mutate,
    deleteSeance: deleteMutation.mutate,
    annulerSeance: annulerMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isAnnulating: annulerMutation.isPending,
  };
}

export function useExportEmploiTemps() {
  const exportMutation = useMutation({
    mutationFn: async (filters?: EmploiTempsFilters) => {
      const blob = await emploiTempsApi.exportPDF(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `emploi-du-temps-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast.success("Export PDF téléchargé");
    },
    onError: () => {
      toast.error("Erreur lors de l'export PDF");
    },
  });

  return {
    exportPDF: exportMutation.mutate,
    isExporting: exportMutation.isPending,
  };
}

export function useEmploiTempsActions() {
  const queryClient = useQueryClient();

  const validateMutation = useMutation({
    mutationFn: (id: string) => emploiTempsApi.validerEmploiTemps(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["emploi-temps", id] });
      queryClient.invalidateQueries({ queryKey: ["emplois-temps"] });
      toast.success("Emploi du temps validé");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Erreur lors de la validation");
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => emploiTempsApi.publierEmploiTemps(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["emploi-temps", id] });
      queryClient.invalidateQueries({ queryKey: ["emplois-temps"] });
      toast.success("Emploi du temps publié");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Erreur lors de la publication");
    },
  });

  return {
    validerEmploiTemps: validateMutation.mutate,
    isValidating: validateMutation.isPending,
    publierEmploiTemps: publishMutation.mutate,
    isPublishing: publishMutation.isPending,
  };
}
