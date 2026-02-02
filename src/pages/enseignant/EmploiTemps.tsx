import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMonEmploiTemps } from "@/hooks/useEmploiTemps";
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addWeeks, subWeeks, startOfWeek, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { TeacherAbsenceForm } from "@/components/enseignant/TeacherAbsenceForm";

const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const HEURES = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

export default function EmploiTempsEnseignant() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState<"semaine" | "jour">("semaine");

  // Format semaine pour l'API (YYYY-Www)
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const semaineISO = format(weekStart, "RRRR-'W'II");

  const { emploiTemps, isLoading } = useMonEmploiTemps(semaineISO);

  // Debug: Voir ce que le frontend reçoit
  console.log('🎯 Frontend - emploiTemps reçu:', {
    existe: !!emploiTemps,
    nombreCreneaux: emploiTemps?.creneaux?.length || 0,
    premierCreneau: emploiTemps?.creneaux?.[0]
  });

  // Mapper les créneaux de l'API vers le format attendu par l'UI
  const seances = emploiTemps?.creneaux?.map((creneau: any) => {
    const jourIndex = JOURS.findIndex(j => j.toLowerCase() === creneau.jour_semaine?.toLowerCase());
    console.log('Mapping créneau:', {
      jour_semaine: creneau.jour_semaine,
      jourIndex,
      matiere: creneau.cours?.matiere?.nom_matiere
    });
    return {
      id: creneau.id,
      jour: jourIndex >= 0 ? jourIndex : 0,
      heureDebut: creneau.heure_debut,
      heureFin: creneau.heure_fin,
      matiere: creneau.cours?.matiere?.nom_matiere || "Matière",
      classe: creneau.cours?.classe?.nom_classe || "Classe",
      salle: creneau.salle?.nom_salle || "Salle non définie",
      couleur: creneau.cours?.matiere?.couleur_affichage || "hsl(var(--primary))"
    };
  }) || [];

  console.log('📊 Séances mappées:', seances.length);

  // Calculer les statistiques
  const stats = {
    nombreCours: seances.length,
    heuresCours: seances.length > 0 ? seances.reduce((total, s) => {
      const debut = parseInt(s.heureDebut.split(":")[0]);
      const fin = parseInt(s.heureFin.split(":")[0]);
      return total + (fin - debut);
    }, 0) : 0,
    classesDifferentes: new Set(seances.map(s => s.classe)).size,
    sallesUtilisees: new Set(seances.map(s => s.salle)).size
  };

  // Filtrer et trier les prochains cours (ceux à venir)
  const now = new Date();
  const currentDayIndex = (now.getDay() + 6) % 7; // Convertir dimanche=0 en lundi=0
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;

  const prochainsCoursFiltered = seances
    .filter(seance => {
      // Convertir l'heure de début en minutes
      const [heureDebut, minuteDebut] = seance.heureDebut.split(':').map(Number);
      const seanceTime = heureDebut * 60 + minuteDebut;

      // Garder les cours du jour actuel qui n'ont pas encore commencé
      if (seance.jour === currentDayIndex) {
        return seanceTime > currentTime;
      }
      // Garder tous les cours des jours suivants
      return seance.jour > currentDayIndex;
    })
    .sort((a, b) => {
      // Trier par jour puis par heure
      if (a.jour !== b.jour) return a.jour - b.jour;
      return a.heureDebut.localeCompare(b.heureDebut);
    })
    .slice(0, 3); // Prendre les 3 premiers

  const getSeanceStyle = (heureDebut: string, heureFin: string) => {
    const startHour = parseInt(heureDebut.split(":")[0]) - 8;
    const endHour = parseInt(heureFin.split(":")[0]) - 8;
    const duration = endHour - startHour;
    return {
      top: `${startHour * 60}px`,
      height: `${duration * 60 - 4}px`,
    };
  };

  const handlePrevWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const handleNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
  const handleToday = () => setCurrentWeek(new Date());

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Chargement de l'emploi du temps...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mon emploi du temps</h1>
            <p className="text-muted-foreground">
              Semaine du {format(weekStart, "d MMMM yyyy", { locale: fr })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Select value={viewMode} onValueChange={(v) => setViewMode(v as "semaine" | "jour")}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semaine">Semaine</SelectItem>
                <SelectItem value="jour">Jour</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1">
              <TeacherAbsenceForm />
              <Button variant="outline" size="icon" onClick={handlePrevWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleToday}>
                Aujourd'hui
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-primary">{stats.nombreCours}</div>
              <p className="text-sm text-muted-foreground">Cours cette semaine</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-primary">{stats.heuresCours}h</div>
              <p className="text-sm text-muted-foreground">Heures de cours</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-primary">{stats.classesDifferentes}</div>
              <p className="text-sm text-muted-foreground">Classes différentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-primary">{stats.sallesUtilisees}</div>
              <p className="text-sm text-muted-foreground">Salles utilisées</p>
            </CardContent>
          </Card>
        </div>

        {/* Grille emploi du temps */}
        <Card className="overflow-hidden min-h-[800px]">
          <CardContent className="p-0">
            {seances.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Aucun cours programmé
                </h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  Vous n'avez pas encore de cours assignés pour cette semaine, ou l'emploi du temps n'a pas encore été généré et publié par l'administration.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Header jours */}
                  <div className="grid grid-cols-7 border-b border-border">
                    <div className="p-3 bg-muted/30 border-r border-border" />
                    {JOURS.map((jour, index) => {
                      const date = addDays(weekStart, index);
                      const isToday = format(date, "dd-MM-yyyy") === format(new Date(), "dd-MM-yyyy");
                      return (
                        <div
                          key={jour}
                          className={`p-3 text-center border-r border-border last:border-r-0 ${isToday ? "bg-primary/10" : "bg-muted/30"}`}
                        >
                          <div className="font-medium text-foreground">{jour}</div>
                          <div className={`text-sm ${isToday ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                            {format(date, "d MMM", { locale: fr })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Grille des heures */}
                  <div className="grid grid-cols-7">
                    {/* Colonne heures */}
                    <div className="border-r border-border">
                      {HEURES.map((heure) => (
                        <div key={heure} className="h-[60px] px-2 py-1 text-xs text-muted-foreground border-b border-border flex items-start">
                          {heure}
                        </div>
                      ))}
                    </div>

                    {/* Colonnes jours */}
                    {JOURS.map((_, jourIndex) => (
                      <div key={jourIndex} className="relative border-r border-border last:border-r-0">
                        {HEURES.map((heure) => (
                          <div key={heure} className="h-[60px] border-b border-border/50" />
                        ))}

                        {/* Séances du jour */}
                        {seances
                          .filter((s) => s.jour === jourIndex)
                          .map((seance) => (
                            <div
                              key={seance.id}
                              className="absolute left-1 right-1 rounded-lg p-2 cursor-pointer hover:opacity-90 transition-opacity overflow-hidden"
                              style={{
                                ...getSeanceStyle(seance.heureDebut, seance.heureFin),
                                backgroundColor: seance.couleur,
                              }}
                            >
                              <div className="text-xs font-semibold text-white truncate">
                                {seance.matiere}
                              </div>
                              <div className="text-xs text-white/80 truncate">
                                {seance.classe}
                              </div>
                              <div className="text-xs text-white/70 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {seance.salle}
                              </div>
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Prochains cours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Prochains cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            {prochainsCoursFiltered.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                {seances.length === 0
                  ? "Aucun cours prévu pour cette semaine"
                  : "Tous vos cours de la semaine sont terminés"}
              </div>
            ) : (
              <div className="space-y-3">
                {prochainsCoursFiltered.map((seance) => (
                  <div key={seance.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-1 h-12 rounded-full"
                        style={{ backgroundColor: seance.couleur }}
                      />
                      <div>
                        <div className="font-medium text-foreground">{seance.matiere}</div>
                        <div className="text-sm text-muted-foreground">
                          {JOURS[seance.jour]} • {seance.heureDebut} - {seance.heureFin}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">{seance.classe}</Badge>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-end">
                        <MapPin className="h-3 w-3" />
                        {seance.salle}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
