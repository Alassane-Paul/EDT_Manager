import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMonEmploiTemps } from "@/hooks/useEmploiTemps";
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addWeeks, subWeeks, startOfWeek, addDays } from "date-fns";
import { fr } from "date-fns/locale";

const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const HEURES = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

export default function EmploiTempsEnseignant() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState<"semaine" | "jour">("semaine");
  const { emploiTemps, isLoading } = useMonEmploiTemps();

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });

  // Mock data pour la démo
  const mockSeances = [
    { id: "1", jour: 0, heureDebut: "08:00", heureFin: "10:00", matiere: "Mathématiques", classe: "L3 Info", salle: "Salle A101", couleur: "hsl(var(--primary))" },
    { id: "2", jour: 0, heureDebut: "14:00", heureFin: "16:00", matiere: "Algèbre", classe: "L2 Math", salle: "Salle B203", couleur: "hsl(220 70% 50%)" },
    { id: "3", jour: 1, heureDebut: "10:00", heureFin: "12:00", matiere: "Statistiques", classe: "M1 Data", salle: "Amphi C", couleur: "hsl(150 60% 40%)" },
    { id: "4", jour: 2, heureDebut: "08:00", heureFin: "10:00", matiere: "Mathématiques", classe: "L3 Info", salle: "Salle A101", couleur: "hsl(var(--primary))" },
    { id: "5", jour: 3, heureDebut: "14:00", heureFin: "17:00", matiere: "Analyse", classe: "L1 Math", salle: "Salle D105", couleur: "hsl(280 60% 50%)" },
    { id: "6", jour: 4, heureDebut: "09:00", heureFin: "11:00", matiere: "Probabilités", classe: "L2 Info", salle: "Salle B102", couleur: "hsl(30 80% 50%)" },
  ];

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
              <div className="text-2xl font-bold text-primary">12</div>
              <p className="text-sm text-muted-foreground">Cours cette semaine</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-primary">18h</div>
              <p className="text-sm text-muted-foreground">Heures de cours</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-primary">5</div>
              <p className="text-sm text-muted-foreground">Classes différentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-primary">4</div>
              <p className="text-sm text-muted-foreground">Salles utilisées</p>
            </CardContent>
          </Card>
        </div>

        {/* Grille emploi du temps */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header jours */}
                <div className="grid grid-cols-7 border-b border-border">
                  <div className="p-3 bg-muted/30 border-r border-border" />
                  {JOURS.map((jour, index) => {
                    const date = addDays(weekStart, index);
                    const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
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
                      {mockSeances
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
                            <div className="text-xs text-white/70 flex items-center gap-1 mt-1">
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
            <div className="space-y-3">
              {mockSeances.slice(0, 3).map((seance) => (
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
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
