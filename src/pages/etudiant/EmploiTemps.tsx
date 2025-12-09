import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, Clock, MapPin, User, ChevronLeft, ChevronRight, Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { useMonEmploiTemps, useExportEmploiTemps } from "@/hooks/useEmploiTemps";
import { Seance } from "@/types/emploi-temps";

const joursSemaine = ["lundi", "mardi", "mercredi", "jeudi", "vendredi"] as const;
const joursAffichage = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

const getSubjectColor = (matiere: string) => {
  const colors: Record<string, string> = {
    "Mathématiques": "bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700",
    "Physique": "bg-purple-100 border-purple-300 dark:bg-purple-900/30 dark:border-purple-700",
    "Informatique": "bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700",
    "Anglais": "bg-yellow-100 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700",
    "Économie": "bg-orange-100 border-orange-300 dark:bg-orange-900/30 dark:border-orange-700",
    "Projet Tuteuré": "bg-pink-100 border-pink-300 dark:bg-pink-900/30 dark:border-pink-700",
    "Base de données": "bg-cyan-100 border-cyan-300 dark:bg-cyan-900/30 dark:border-cyan-700",
    "Réseaux": "bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-700",
    "Communication": "bg-indigo-100 border-indigo-300 dark:bg-indigo-900/30 dark:border-indigo-700",
  };
  return colors[matiere] || "bg-muted border-border";
};

// Mock data fallback
const mockSchedule: Record<string, Seance[]> = {
  lundi: [
    { id: "1", cours_id: "1", matiere_nom: "Mathématiques", enseignant_id: "1", enseignant_nom: "M. Dupont", classe_id: "1", classe_nom: "L3 Info", salle_id: "1", salle_nom: "A101", jour: "lundi", date: "", heure_debut: "08:00", heure_fin: "10:00", type: "cours", statut: "planifie" },
    { id: "2", cours_id: "2", matiere_nom: "Physique", enseignant_id: "2", enseignant_nom: "Mme Martin", classe_id: "1", classe_nom: "L3 Info", salle_id: "2", salle_nom: "B203", jour: "lundi", date: "", heure_debut: "10:15", heure_fin: "12:15", type: "cours", statut: "planifie" },
    { id: "3", cours_id: "3", matiere_nom: "Informatique", enseignant_id: "3", enseignant_nom: "M. Bernard", classe_id: "1", classe_nom: "L3 Info", salle_id: "3", salle_nom: "C301", jour: "lundi", date: "", heure_debut: "14:00", heure_fin: "16:00", type: "tp", statut: "planifie" },
  ],
  mardi: [
    { id: "4", cours_id: "4", matiere_nom: "Anglais", enseignant_id: "4", enseignant_nom: "Mme Wilson", classe_id: "1", classe_nom: "L3 Info", salle_id: "4", salle_nom: "A102", jour: "mardi", date: "", heure_debut: "08:00", heure_fin: "10:00", type: "cours", statut: "planifie" },
    { id: "5", cours_id: "5", matiere_nom: "Économie", enseignant_id: "5", enseignant_nom: "M. Laurent", classe_id: "1", classe_nom: "L3 Info", salle_id: "5", salle_nom: "B201", jour: "mardi", date: "", heure_debut: "10:15", heure_fin: "12:15", type: "cours", statut: "planifie" },
  ],
  mercredi: [
    { id: "6", cours_id: "6", matiere_nom: "Projet Tuteuré", enseignant_id: "3", enseignant_nom: "M. Bernard", classe_id: "1", classe_nom: "L3 Info", salle_id: "6", salle_nom: "Labo Info", jour: "mercredi", date: "", heure_debut: "08:00", heure_fin: "12:00", type: "tp", statut: "planifie" },
  ],
  jeudi: [
    { id: "7", cours_id: "7", matiere_nom: "Base de données", enseignant_id: "6", enseignant_nom: "M. Garcia", classe_id: "1", classe_nom: "L3 Info", salle_id: "7", salle_nom: "C302", jour: "jeudi", date: "", heure_debut: "08:00", heure_fin: "10:00", type: "cours", statut: "planifie" },
    { id: "8", cours_id: "8", matiere_nom: "Réseaux", enseignant_id: "7", enseignant_nom: "Mme Petit", classe_id: "1", classe_nom: "L3 Info", salle_id: "8", salle_nom: "C303", jour: "jeudi", date: "", heure_debut: "10:15", heure_fin: "12:15", type: "cours", statut: "planifie" },
    { id: "9", cours_id: "1", matiere_nom: "Mathématiques", enseignant_id: "1", enseignant_nom: "M. Dupont", classe_id: "1", classe_nom: "L3 Info", salle_id: "1", salle_nom: "A101", jour: "jeudi", date: "", heure_debut: "14:00", heure_fin: "16:00", type: "td", statut: "planifie" },
  ],
  vendredi: [
    { id: "10", cours_id: "4", matiere_nom: "Anglais", enseignant_id: "4", enseignant_nom: "Mme Wilson", classe_id: "1", classe_nom: "L3 Info", salle_id: "4", salle_nom: "A102", jour: "vendredi", date: "", heure_debut: "08:00", heure_fin: "10:00", type: "cours", statut: "planifie" },
    { id: "11", cours_id: "9", matiere_nom: "Communication", enseignant_id: "8", enseignant_nom: "Mme Dubois", classe_id: "1", classe_nom: "L3 Info", salle_id: "9", salle_nom: "B102", jour: "vendredi", date: "", heure_debut: "10:15", heure_fin: "12:15", type: "cours", statut: "planifie" },
  ],
};

const EmploiTempsEtudiant = () => {
  const { user } = useAuth();
  const [selectedWeek, setSelectedWeek] = useState(0);
  
  const getWeekString = (offset: number) => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1 + (offset * 7));
    return monday.toISOString().split('T')[0];
  };

  const { emploiTemps, isLoading, error } = useMonEmploiTemps(getWeekString(selectedWeek));
  const { exportPDF, isExporting } = useExportEmploiTemps();
  
  const getWeekDates = (offset: number) => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1 + (offset * 7));
    
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    
    return {
      start: monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      end: friday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
  };

  const weekDates = getWeekDates(selectedWeek);
  
  // Use API data or fallback to mock
  const schedule = emploiTemps?.seances || mockSchedule;
  const stats = emploiTemps?.statistiques || { heures_total: 24, nombre_seances: 11, matieres_count: 9 };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Mon Emploi du Temps</h2>
            <p className="text-muted-foreground">
              Classe: <span className="font-medium">L3 Informatique - Groupe A</span>
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setSelectedWeek(prev => prev - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center min-w-[200px]">
              <p className="text-sm font-medium">{weekDates.start} - {weekDates.end}</p>
              {selectedWeek === 0 && <span className="text-xs text-primary">Cette semaine</span>}
            </div>
            <Button variant="outline" size="icon" onClick={() => setSelectedWeek(prev => prev + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              className="ml-2"
              onClick={() => exportPDF({ semaine: getWeekString(selectedWeek) })}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Exporter
            </Button>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Grille de l'emploi du temps */}
        {!isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {joursSemaine.map((jour, index) => {
              const seances = schedule[jour] || [];
              return (
                <Card key={jour} className="overflow-hidden">
                  <CardHeader className="bg-muted/50 py-3">
                    <CardTitle className="text-sm font-semibold text-center">
                      {joursAffichage[index]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 space-y-2 min-h-[300px]">
                    {seances.length > 0 ? (
                      seances.map((seance) => (
                        <div
                          key={seance.id}
                          className={`p-3 rounded-lg border-l-4 ${getSubjectColor(seance.matiere_nom)} transition-all hover:shadow-md cursor-pointer`}
                        >
                          <p className="font-medium text-sm text-foreground">{seance.matiere_nom}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            {seance.heure_debut} - {seance.heure_fin}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {seance.salle_nom}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            {seance.enseignant_nom}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                        Pas de cours
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Heures cette semaine</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.heures_total}h</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Nombre de cours</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.nombre_seances}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Matières différentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.matieres_count}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default EmploiTempsEtudiant;
