import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useMesCours } from "@/hooks/useCours";
import { BookOpen, Users, Clock, Calendar, Search, Eye, TrendingUp } from "lucide-react";

export default function CoursEnseignant() {
  const { cours, isLoading } = useMesCours();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClasse, setFilterClasse] = useState<string>("all");
  const [selectedCours, setSelectedCours] = useState<any>(null);

  // Mock data pour la démo
  const mockCours = [
    { 
      id: "1", 
      matiere_nom: "Mathématiques Avancées", 
      classe_nom: "L3 Informatique", 
      heures_total: 48, 
      heures_effectuees: 32,
      nbEtudiants: 35,
      couleur: "hsl(var(--primary))",
      prochainCours: "Lundi 08:00",
      salle: "Salle A101"
    },
    { 
      id: "2", 
      matiere_nom: "Algèbre Linéaire", 
      classe_nom: "L2 Mathématiques", 
      heures_total: 36, 
      heures_effectuees: 24,
      nbEtudiants: 28,
      couleur: "hsl(220 70% 50%)",
      prochainCours: "Mardi 10:00",
      salle: "Salle B203"
    },
    { 
      id: "3", 
      matiere_nom: "Statistiques", 
      classe_nom: "M1 Data Science", 
      heures_total: 30, 
      heures_effectuees: 20,
      nbEtudiants: 22,
      couleur: "hsl(150 60% 40%)",
      prochainCours: "Mercredi 14:00",
      salle: "Amphi C"
    },
    { 
      id: "4", 
      matiere_nom: "Analyse", 
      classe_nom: "L1 Mathématiques", 
      heures_total: 60, 
      heures_effectuees: 45,
      nbEtudiants: 45,
      couleur: "hsl(280 60% 50%)",
      prochainCours: "Jeudi 08:00",
      salle: "Salle D105"
    },
    { 
      id: "5", 
      matiere_nom: "Probabilités", 
      classe_nom: "L2 Informatique", 
      heures_total: 42, 
      heures_effectuees: 14,
      nbEtudiants: 32,
      couleur: "hsl(30 80% 50%)",
      prochainCours: "Vendredi 09:00",
      salle: "Salle B102"
    },
  ];

  const classes = [...new Set(mockCours.map(c => c.classe_nom))];

  const filteredCours = mockCours.filter(c => {
    const matchSearch = c.matiere_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       c.classe_nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchClasse = filterClasse === "all" || c.classe_nom === filterClasse;
    return matchSearch && matchClasse;
  });

  const totalHeures = mockCours.reduce((acc, c) => acc + c.heures_total, 0);
  const heuresEffectuees = mockCours.reduce((acc, c) => acc + c.heures_effectuees, 0);
  const progressionGlobale = Math.round((heuresEffectuees / totalHeures) * 100);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mes Cours</h1>
            <p className="text-muted-foreground">
              Gérez vos cours et suivez la progression
            </p>
          </div>
        </div>

        {/* Statistiques globales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{mockCours.length}</div>
                  <p className="text-sm text-muted-foreground">Cours assignés</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {mockCours.reduce((acc, c) => acc + c.nbEtudiants, 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Étudiants total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{heuresEffectuees}h</div>
                  <p className="text-sm text-muted-foreground">sur {totalHeures}h</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{progressionGlobale}%</div>
                  <p className="text-sm text-muted-foreground">Progression</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un cours..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterClasse} onValueChange={setFilterClasse}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Toutes les classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les classes</SelectItem>
                  {classes.map(classe => (
                    <SelectItem key={classe} value={classe}>{classe}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Liste des cours */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCours.map((coursItem) => {
            const progression = Math.round((coursItem.heures_effectuees / coursItem.heures_total) * 100);
            
            return (
              <Card key={coursItem.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: coursItem.couleur }}
                      />
                      <div>
                        <CardTitle className="text-base">{coursItem.matiere_nom}</CardTitle>
                        <Badge variant="secondary" className="mt-1">{coursItem.classe_nom}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{coursItem.nbEtudiants} étudiants</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{coursItem.heures_effectuees}/{coursItem.heures_total}h</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progression</span>
                      <span className="font-medium text-foreground">{progression}%</span>
                    </div>
                    <Progress value={progression} className="h-2" />
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 text-sm">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Prochain:</span>
                    <span className="font-medium text-foreground">{coursItem.prochainCours}</span>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setSelectedCours(coursItem)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir détails
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: coursItem.couleur }}
                          />
                          {coursItem.matiere_nom}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg bg-muted/30">
                            <div className="text-sm text-muted-foreground">Classe</div>
                            <div className="font-medium text-foreground">{coursItem.classe_nom}</div>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/30">
                            <div className="text-sm text-muted-foreground">Étudiants</div>
                            <div className="font-medium text-foreground">{coursItem.nbEtudiants}</div>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/30">
                            <div className="text-sm text-muted-foreground">Heures effectuées</div>
                            <div className="font-medium text-foreground">{coursItem.heures_effectuees}h / {coursItem.heures_total}h</div>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/30">
                            <div className="text-sm text-muted-foreground">Salle habituelle</div>
                            <div className="font-medium text-foreground">{coursItem.salle}</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progression du programme</span>
                            <span className="font-medium text-foreground">{progression}%</span>
                          </div>
                          <Progress value={progression} className="h-3" />
                        </div>

                        <div className="flex gap-2">
                          <Button className="flex-1">
                            <Calendar className="h-4 w-4 mr-2" />
                            Voir séances
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <Users className="h-4 w-4 mr-2" />
                            Liste étudiants
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredCours.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Aucun cours trouvé</h3>
              <p className="text-muted-foreground">Modifiez vos critères de recherche</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
