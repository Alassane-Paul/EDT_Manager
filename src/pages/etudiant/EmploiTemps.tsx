import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, Clock, MapPin, User, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useState } from "react";

// Données de démonstration pour l'emploi du temps
const mockSchedule = {
  lundi: [
    { id: 1, matiere: "Mathématiques", heure_debut: "08:00", heure_fin: "10:00", salle: "A101", enseignant: "M. Dupont" },
    { id: 2, matiere: "Physique", heure_debut: "10:15", heure_fin: "12:15", salle: "B203", enseignant: "Mme Martin" },
    { id: 3, matiere: "Informatique", heure_debut: "14:00", heure_fin: "16:00", salle: "C301", enseignant: "M. Bernard" },
  ],
  mardi: [
    { id: 4, matiere: "Anglais", heure_debut: "08:00", heure_fin: "10:00", salle: "A102", enseignant: "Mme Wilson" },
    { id: 5, matiere: "Économie", heure_debut: "10:15", heure_fin: "12:15", salle: "B201", enseignant: "M. Laurent" },
  ],
  mercredi: [
    { id: 6, matiere: "Projet Tuteuré", heure_debut: "08:00", heure_fin: "12:00", salle: "Labo Info", enseignant: "M. Bernard" },
  ],
  jeudi: [
    { id: 7, matiere: "Base de données", heure_debut: "08:00", heure_fin: "10:00", salle: "C302", enseignant: "M. Garcia" },
    { id: 8, matiere: "Réseaux", heure_debut: "10:15", heure_fin: "12:15", salle: "C303", enseignant: "Mme Petit" },
    { id: 9, matiere: "Mathématiques", heure_debut: "14:00", heure_fin: "16:00", salle: "A101", enseignant: "M. Dupont" },
  ],
  vendredi: [
    { id: 10, matiere: "Anglais", heure_debut: "08:00", heure_fin: "10:00", salle: "A102", enseignant: "Mme Wilson" },
    { id: 11, matiere: "Communication", heure_debut: "10:15", heure_fin: "12:15", salle: "B102", enseignant: "Mme Dubois" },
  ],
};

const joursSemaine = ["lundi", "mardi", "mercredi", "jeudi", "vendredi"];
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
  return colors[matiere] || "bg-gray-100 border-gray-300 dark:bg-gray-800/50 dark:border-gray-700";
};

const EmploiTempsEtudiant = () => {
  const { user } = useAuth();
  const [selectedWeek, setSelectedWeek] = useState(0);
  
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

  return (
    <PageLayout title="Mon Emploi du Temps">
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
            <Button variant="outline" className="ml-2">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Grille de l'emploi du temps */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {joursSemaine.map((jour, index) => (
            <Card key={jour} className="overflow-hidden">
              <CardHeader className="bg-muted/50 py-3">
                <CardTitle className="text-sm font-semibold text-center">
                  {joursAffichage[index]}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2 min-h-[300px]">
                {mockSchedule[jour as keyof typeof mockSchedule]?.length > 0 ? (
                  mockSchedule[jour as keyof typeof mockSchedule].map((cours) => (
                    <div
                      key={cours.id}
                      className={`p-3 rounded-lg border-l-4 ${getSubjectColor(cours.matiere)} transition-all hover:shadow-md cursor-pointer`}
                    >
                      <p className="font-medium text-sm text-foreground">{cours.matiere}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        {cours.heure_debut} - {cours.heure_fin}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {cours.salle}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        {cours.enseignant}
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
          ))}
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Heures cette semaine</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">24h</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Nombre de cours</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">11</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Matières différentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">9</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default EmploiTempsEtudiant;
