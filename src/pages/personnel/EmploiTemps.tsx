import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Users, Search, Filter, ChevronLeft, ChevronRight, Download, Printer } from "lucide-react";
import { useState } from "react";

// Données de démonstration pour les classes
const mockClasses = [
  { id: "1", nom: "L3 Informatique - Groupe A" },
  { id: "2", nom: "L3 Informatique - Groupe B" },
  { id: "3", nom: "M1 Data Science" },
  { id: "4", nom: "M2 Intelligence Artificielle" },
  { id: "5", nom: "L2 Mathématiques" },
];

// Données de démonstration pour les enseignants
const mockEnseignants = [
  { id: "1", nom: "M. Dupont" },
  { id: "2", nom: "Mme Martin" },
  { id: "3", nom: "M. Bernard" },
  { id: "4", nom: "Mme Wilson" },
  { id: "5", nom: "M. Laurent" },
];

// Données de démonstration pour les emplois du temps
const mockSchedule = {
  lundi: [
    { id: 1, matiere: "Mathématiques", heure_debut: "08:00", heure_fin: "10:00", salle: "A101", enseignant: "M. Dupont", classe: "L3 Info A" },
    { id: 2, matiere: "Physique", heure_debut: "10:15", heure_fin: "12:15", salle: "B203", enseignant: "Mme Martin", classe: "L3 Info A" },
    { id: 3, matiere: "Informatique", heure_debut: "14:00", heure_fin: "16:00", salle: "C301", enseignant: "M. Bernard", classe: "L3 Info B" },
  ],
  mardi: [
    { id: 4, matiere: "Anglais", heure_debut: "08:00", heure_fin: "10:00", salle: "A102", enseignant: "Mme Wilson", classe: "L3 Info A" },
    { id: 5, matiere: "Data Science", heure_debut: "10:15", heure_fin: "12:15", salle: "C302", enseignant: "M. Bernard", classe: "M1 DS" },
    { id: 6, matiere: "Économie", heure_debut: "14:00", heure_fin: "16:00", salle: "B201", enseignant: "M. Laurent", classe: "L3 Info B" },
  ],
  mercredi: [
    { id: 7, matiere: "Machine Learning", heure_debut: "08:00", heure_fin: "12:00", salle: "Labo IA", enseignant: "M. Bernard", classe: "M2 IA" },
    { id: 8, matiere: "Analyse", heure_debut: "14:00", heure_fin: "16:00", salle: "A201", enseignant: "M. Dupont", classe: "L2 Maths" },
  ],
  jeudi: [
    { id: 9, matiere: "Base de données", heure_debut: "08:00", heure_fin: "10:00", salle: "C302", enseignant: "M. Bernard", classe: "L3 Info A" },
    { id: 10, matiere: "Réseaux", heure_debut: "10:15", heure_fin: "12:15", salle: "C303", enseignant: "Mme Martin", classe: "L3 Info B" },
    { id: 11, matiere: "Deep Learning", heure_debut: "14:00", heure_fin: "17:00", salle: "Labo IA", enseignant: "M. Bernard", classe: "M2 IA" },
  ],
  vendredi: [
    { id: 12, matiere: "Anglais", heure_debut: "08:00", heure_fin: "10:00", salle: "A102", enseignant: "Mme Wilson", classe: "L3 Info B" },
    { id: 13, matiere: "Probabilités", heure_debut: "10:15", heure_fin: "12:15", salle: "A201", enseignant: "M. Dupont", classe: "L2 Maths" },
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
    "Data Science": "bg-cyan-100 border-cyan-300 dark:bg-cyan-900/30 dark:border-cyan-700",
    "Machine Learning": "bg-pink-100 border-pink-300 dark:bg-pink-900/30 dark:border-pink-700",
    "Deep Learning": "bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-700",
    "Base de données": "bg-teal-100 border-teal-300 dark:bg-teal-900/30 dark:border-teal-700",
    "Réseaux": "bg-indigo-100 border-indigo-300 dark:bg-indigo-900/30 dark:border-indigo-700",
    "Analyse": "bg-lime-100 border-lime-300 dark:bg-lime-900/30 dark:border-lime-700",
    "Probabilités": "bg-amber-100 border-amber-300 dark:bg-amber-900/30 dark:border-amber-700",
  };
  return colors[matiere] || "bg-gray-100 border-gray-300 dark:bg-gray-800/50 dark:border-gray-700";
};

const EmploiTempsPersonnel = () => {
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [viewType, setViewType] = useState<"classe" | "enseignant">("classe");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  
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

  // Filtrer les cours
  const filterSchedule = (schedule: typeof mockSchedule) => {
    const filtered: typeof mockSchedule = {
      lundi: [],
      mardi: [],
      mercredi: [],
      jeudi: [],
      vendredi: [],
    };

    Object.keys(schedule).forEach((jour) => {
      filtered[jour as keyof typeof mockSchedule] = schedule[jour as keyof typeof mockSchedule].filter((cours) => {
        if (selectedFilter === "all") return true;
        if (viewType === "classe") return cours.classe.includes(selectedFilter);
        return cours.enseignant.includes(selectedFilter);
      });
    });

    return filtered;
  };

  const filteredSchedule = filterSchedule(mockSchedule);

  return (
    <PageLayout title="Emplois du Temps">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Consultation des Emplois du Temps</h2>
            <p className="text-muted-foreground">
              Visualisez les plannings par classe ou par enseignant
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Filtres */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Tabs value={viewType} onValueChange={(v) => { setViewType(v as "classe" | "enseignant"); setSelectedFilter("all"); }}>
                <TabsList>
                  <TabsTrigger value="classe">
                    <Users className="h-4 w-4 mr-2" />
                    Par classe
                  </TabsTrigger>
                  <TabsTrigger value="enseignant">
                    <Calendar className="h-4 w-4 mr-2" />
                    Par enseignant
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder={viewType === "classe" ? "Sélectionner une classe" : "Sélectionner un enseignant"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {viewType === "classe" 
                    ? mockClasses.map((c) => (
                        <SelectItem key={c.id} value={c.nom}>{c.nom}</SelectItem>
                      ))
                    : mockEnseignants.map((e) => (
                        <SelectItem key={e.id} value={e.nom}>{e.nom}</SelectItem>
                      ))
                  }
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Navigation semaine */}
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setSelectedWeek(prev => prev - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center min-w-[250px]">
            <p className="text-lg font-medium">{weekDates.start} - {weekDates.end}</p>
            {selectedWeek === 0 && <span className="text-sm text-primary">Cette semaine</span>}
          </div>
          <Button variant="outline" size="icon" onClick={() => setSelectedWeek(prev => prev + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          {selectedWeek !== 0 && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedWeek(0)}>
              Aujourd'hui
            </Button>
          )}
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
              <CardContent className="p-3 space-y-2 min-h-[350px]">
                {filteredSchedule[jour as keyof typeof filteredSchedule]?.length > 0 ? (
                  filteredSchedule[jour as keyof typeof filteredSchedule].map((cours) => (
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
                        <Users className="h-3 w-3" />
                        {cours.classe}
                      </div>
                      {viewType === "classe" && (
                        <p className="text-xs text-primary mt-1">{cours.enseignant}</p>
                      )}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Classes actives</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{mockClasses.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Enseignants</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{mockEnseignants.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Cours cette semaine</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {Object.values(mockSchedule).reduce((acc, jour) => acc + jour.length, 0)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Heures de cours</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">42h</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default EmploiTempsPersonnel;
