import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, User, Search, Loader2 } from "lucide-react";
import { useState } from "react";
import { useMesCours } from "@/hooks/useCours";
import { Cours } from "@/api/cours/api";

const getColorClasses = (color?: string) => {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300", border: "border-blue-300 dark:border-blue-700" },
    purple: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300", border: "border-purple-300 dark:border-purple-700" },
    green: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300", border: "border-green-300 dark:border-green-700" },
    yellow: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-300", border: "border-yellow-300 dark:border-yellow-700" },
    orange: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300", border: "border-orange-300 dark:border-orange-700" },
    cyan: { bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-700 dark:text-cyan-300", border: "border-cyan-300 dark:border-cyan-700" },
    red: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300", border: "border-red-300 dark:border-red-700" },
    indigo: { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-700 dark:text-indigo-300", border: "border-indigo-300 dark:border-indigo-700" },
  };
  return colors[color || "blue"] || colors.blue;
};

// Mock data fallback
const mockCours: Cours[] = [
  { id: "1", matiere_id: "1", matiere_nom: "Mathématiques", enseignant_id: "1", enseignant_nom: "M. Dupont", classe_id: "1", classe_nom: "L3 Info", heures_total: 48, heures_effectuees: 24, couleur: "blue" },
  { id: "2", matiere_id: "2", matiere_nom: "Physique", enseignant_id: "2", enseignant_nom: "Mme Martin", classe_id: "1", classe_nom: "L3 Info", heures_total: 36, heures_effectuees: 18, couleur: "purple" },
  { id: "3", matiere_id: "3", matiere_nom: "Informatique", enseignant_id: "3", enseignant_nom: "M. Bernard", classe_id: "1", classe_nom: "L3 Info", heures_total: 60, heures_effectuees: 30, couleur: "green" },
  { id: "4", matiere_id: "4", matiere_nom: "Anglais", enseignant_id: "4", enseignant_nom: "Mme Wilson", classe_id: "1", classe_nom: "L3 Info", heures_total: 30, heures_effectuees: 15, couleur: "yellow" },
  { id: "5", matiere_id: "5", matiere_nom: "Économie", enseignant_id: "5", enseignant_nom: "M. Laurent", classe_id: "1", classe_nom: "L3 Info", heures_total: 24, heures_effectuees: 12, couleur: "orange" },
  { id: "6", matiere_id: "6", matiere_nom: "Base de données", enseignant_id: "6", enseignant_nom: "M. Garcia", classe_id: "1", classe_nom: "L3 Info", heures_total: 40, heures_effectuees: 20, couleur: "cyan" },
  { id: "7", matiere_id: "7", matiere_nom: "Réseaux", enseignant_id: "7", enseignant_nom: "Mme Petit", classe_id: "1", classe_nom: "L3 Info", heures_total: 32, heures_effectuees: 16, couleur: "red" },
  { id: "8", matiere_id: "8", matiere_nom: "Communication", enseignant_id: "8", enseignant_nom: "Mme Dubois", classe_id: "1", classe_nom: "L3 Info", heures_total: 20, heures_effectuees: 10, couleur: "indigo" },
];

const CoursEtudiant = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { cours: apiCours, isLoading, error } = useMesCours();

  // Use API data or fallback to mock
  const cours = apiCours.length > 0 ? apiCours : mockCours;

  const filteredCours = cours.filter(
    (c) =>
      c.matiere_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.enseignant_nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalHeures = cours.reduce((acc, c) => acc + c.heures_total, 0);
  const heuresEffectuees = cours.reduce((acc, c) => acc + c.heures_effectuees, 0);
  const progressionGlobale = totalHeures > 0 ? Math.round((heuresEffectuees / totalHeures) * 100) : 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Mes Cours</h2>
            <p className="text-muted-foreground">
              Semestre en cours: <span className="font-medium">S5 - 2024/2025</span>
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une matière..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-[250px]"
              />
            </div>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Grille des cours */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCours.map((c) => {
              const colorClasses = getColorClasses(c.couleur);
              const progression = Math.round((c.heures_effectuees / c.heures_total) * 100);
              
              return (
                <Card 
                  key={c.id} 
                  className={`overflow-hidden hover:shadow-lg transition-all cursor-pointer border-l-4 ${colorClasses.border}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className={`w-10 h-10 ${colorClasses.bg} rounded-lg flex items-center justify-center`}>
                        <BookOpen className={`h-5 w-5 ${colorClasses.text}`} />
                      </div>
                      <Badge variant="outline" className={colorClasses.text}>
                        {progression}%
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-2">{c.matiere_nom}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {c.enseignant_nom}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Barre de progression */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progression</span>
                        <span>{c.heures_effectuees}h / {c.heures_total}h</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${colorClasses.bg}`}
                          style={{ width: `${progression}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Info classe */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{c.heures_total - c.heures_effectuees}h restantes</span>
                      </div>
                      <Badge variant="secondary">{c.classe_nom}</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Statistiques globales */}
        <Card>
          <CardHeader>
            <CardTitle>Récapitulatif du semestre</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-foreground">{cours.length}</p>
                <p className="text-sm text-muted-foreground">Matières</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-foreground">{totalHeures}h</p>
                <p className="text-sm text-muted-foreground">Heures totales</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-foreground">{heuresEffectuees}h</p>
                <p className="text-sm text-muted-foreground">Heures effectuées</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary">{progressionGlobale}%</p>
                <p className="text-sm text-muted-foreground">Progression</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CoursEtudiant;
