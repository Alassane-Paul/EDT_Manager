import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, Clock, MapPin, User, ChevronLeft, ChevronRight, Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { useMonEmploiTemps, useExportEmploiTemps } from "@/hooks/useEmploiTemps";
import { Seance } from "@/types/emploi-temps";

const joursSemaine = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"] as const;
const joursAffichage = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

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

const EmploiTempsEtudiant = () => {
  const { user } = useAuth();
  const [selectedWeek, setSelectedWeek] = useState(0);

  // Helper to get ISO week number
  const getISOWeek = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const getWeekString = (offset: number) => {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + (offset * 7));

    const year = targetDate.getFullYear();
    const week = getISOWeek(targetDate);

    // Format: YYYY-Www (e.g., 2024-W51)
    return `${year}-W${week.toString().padStart(2, '0')}`;
  };

  const { emploiTemps, isLoading, error } = useMonEmploiTemps(getWeekString(selectedWeek));
  const { exportPDF, isExporting } = useExportEmploiTemps();

  const getWeekDates = (offset: number) => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1 + (offset * 7));

    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 5);

    return {
      start: monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      end: friday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
  };

  const weekDates = getWeekDates(selectedWeek);

  const seances: Seance[] = Array.isArray(emploiTemps?.seances) ? emploiTemps.seances : [];
  const { statistiques } = emploiTemps || {};

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Mon Emploi du Temps</h2>
            <p className="text-muted-foreground">
              Classe: <span className="font-medium">{emploiTemps?.classe?.nom_classe || "Non assignée"}</span>
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {joursSemaine.map((jour, index) => {
              const seancesJour = seances.filter((s: Seance) => s.jour === jour) || [];
              return (
                <Card key={jour} className="overflow-hidden">
                  <CardHeader className="bg-muted/50 py-3">
                    <CardTitle className="text-sm font-semibold text-center">
                      {joursAffichage[index]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 space-y-2 min-h-[300px]">
                    {seancesJour.length > 0 ? (
                      seancesJour.map((seance) => (
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
              <p className="text-2xl font-bold">{statistiques?.heures_total || 0}h</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Nombre de cours</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{statistiques?.nombre_seances || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Matières différentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{statistiques?.matieres_count || 0}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default EmploiTempsEtudiant;
