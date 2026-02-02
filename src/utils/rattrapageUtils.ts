export const STATUT_LABELS: Record<string, string> = {
    demande: "En attente",
    valide: "Validé",
    refuse: "Refusé",
    planifie: "Planifié",
    realise: "Réalisé",
    annule: "Annulé",
};

export const STATUT_COLORS: Record<string, string> = {
    demande: "bg-yellow-500 hover:bg-yellow-600 text-white",
    valide: "bg-blue-600 hover:bg-blue-700 text-white",
    refuse: "bg-red-600 hover:bg-red-700 text-white",
    planifie: "bg-indigo-500 hover:bg-indigo-600 text-white",
    realise: "bg-emerald-600 hover:bg-emerald-700 text-white",
    annule: "bg-gray-500 hover:bg-gray-600 text-white",
};
