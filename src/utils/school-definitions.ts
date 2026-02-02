export const LEVELS_BY_TYPE: Record<string, string[]> = {
    ecole_primaire: ["CP", "CE1", "CE2", "CM1", "CM2"],
    college: ["6ème", "5ème", "4ème", "3ème"],
    lycee: ["Seconde", "Première", "Terminale"],
    universite: ["L1", "L2", "L3", "M1", "M2"],
    institut: ["L1", "L2", "L3", "M1", "M2"],
};

export const FILIERES_BY_TYPE: Record<string, string[]> = {
    ecole_primaire: ["Général"],
    college: ["Général", "SEGPA", "ULIS", "Prépa Métiers"],
    lycee: ["Générale", "Technologique", "Professionnelle", "CAP", "BTS", "CPGE"],
    universite: ["Informatique", "Droit", "Économie", "Gestion", "Mathématiques", "Physique", "Chimie", "Biologie", "Lettres", "Langues", "Psychologie", "Histoire", "Géographie", "STAPS", "Médecine", "Autre"],
    institut: ["Informatique", "Commerce", "Gestion", "Ingénierie", "Design", "Communication", "Autre"],
};

// Helper to get all unique levels across all types
export const ALL_LEVELS = Array.from(
    new Set(Object.values(LEVELS_BY_TYPE).flat())
).sort();

// Helper to get all unique filieres across all types
export const ALL_FILIERES = Array.from(
    new Set(Object.values(FILIERES_BY_TYPE).flat())
).sort();
