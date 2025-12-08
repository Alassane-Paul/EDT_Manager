import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, User, Search, Filter } from "lucide-react";
import { useState } from "react";

// Données de démonstration
const mockCours = [
  {
    id: 1,
    matiere: "Mathématiques",
    enseignant: "M. Dupont",
    heuresTotal: 48,
    heuresEffectuees: 24,
    prochainCours: "Lundi 08:00",
    salle: "A101",
    couleur: "blue",
  },
  {
    id: 2,
    matiere: "Physique",
    enseignant: "Mme Martin",
    heuresTotal: 36,
    heuresEffectuees: 18,
    prochainCours: "Lundi 10:15",
    salle: "B203",
    couleur: "purple",
  },
  {
    id: 3,
    matiere: "Informatique",
    enseignant: "M. Bernard",
    heuresTotal: 60,
    heuresEffectuees: 30,
    prochainCours: "Lundi 14:00",
    salle: "C301",
    couleur: "green",
  },
  {
    id: 4,
    matiere: "Anglais",
    enseignant: "Mme Wilson",
    heuresTotal: 30,
    heuresEffectuees: 15,
    prochainCours: "Mardi 08:00",
    salle: "A102",
    couleur: "yellow",
  },
  {
    id: 5,
    matiere: "Économie",
    enseignant: "M. Laurent",
    heuresTotal: 24,
    heuresEffectuees: 12,
    prochainCours: "Mardi 10:15",
    salle: "B201",
    couleur: "orange",
  },
  {
    id: 6,
    matiere: "Base de données",
    enseignant: "M. Garcia",
    heuresTotal: 40,
    heuresEffectuees: 20,
    prochainCours: "Jeudi 08:00",
    salle: "C302",
    couleur: "cyan",
  },
  {
    id: 7,
    matiere: "Réseaux",
    enseignant: "Mme Petit",
    heuresTotal: 32,
    heuresEffectuees: 16,
    prochainCours: "Jeudi 10:15",
    salle: "C303",
    couleur: "red",
  },
  {
    id: 8,
    matiere: "Communication",
    enseignant: "Mme Dubois",
    heuresTotal: 20,
    heuresEffectuees: 10,
    prochainCours: "Vendredi 10:15",
    salle: "B102",
    couleur: "indigo",
  },
];

const getColorClasses = (color: string) => {
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
  return colors[color] || colors.blue;
};

const CoursEtudiant = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCours = mockCours.filter(
    (cours) =>
      cours.matiere.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cours.enseignant.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageLayout title="Mes Cours">
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

        {/* Grille des cours */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCours.map((cours) => {
            const colorClasses = getColorClasses(cours.couleur);
            const progression = Math.round((cours.heuresEffectuees / cours.heuresTotal) * 100);
            
            return (
              <Card 
                key={cours.id} 
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
                  <CardTitle className="text-lg mt-2">{cours.matiere}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {cours.enseignant}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Barre de progression */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progression</span>
                      <span>{cours.heuresEffectuees}h / {cours.heuresTotal}h</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${colorClasses.bg} ${colorClasses.text.replace('text', 'bg').replace('700', '500').replace('300', '500')}`}
                        style={{ width: `${progression}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Prochain cours */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Prochain: {cours.prochainCours}</span>
                    </div>
                    <Badge variant="secondary">{cours.salle}</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Statistiques globales */}
        <Card>
          <CardHeader>
            <CardTitle>Récapitulatif du semestre</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-foreground">8</p>
                <p className="text-sm text-muted-foreground">Matières</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-foreground">290h</p>
                <p className="text-sm text-muted-foreground">Heures totales</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-foreground">145h</p>
                <p className="text-sm text-muted-foreground">Heures effectuées</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary">50%</p>
                <p className="text-sm text-muted-foreground">Progression</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default CoursEtudiant;
