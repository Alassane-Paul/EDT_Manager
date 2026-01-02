import { useState } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useMesCours } from "@/hooks/useCours";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users, Clock, Calendar, Search, Eye, TrendingUp } from "lucide-react";

export default function CoursEnseignant() {
  const { id } = useParams();
  const { cours: realCours, isLoading } = useMesCours(id);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClasse, setFilterClasse] = useState<string>("all");
  const [selectedCours, setSelectedCours] = useState<any>(null);

  // Use real data or empty array if loading/undefined
  const coursData = realCours || [];

  const classes = [...new Set(coursData.map(c => c.classe_nom))];

  const filteredCours = coursData.filter(c => {
    const matchSearch = c.matiere_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.classe_nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchClasse = filterClasse === "all" || c.classe_nom === filterClasse;
    return matchSearch && matchClasse;
  });

  const totalHeures = coursData.reduce((acc, c) => acc + c.heures_total, 0);
  const heuresEffectuees = coursData.reduce((acc, c) => acc + c.heures_effectuees, 0);
  const progressionGlobale = totalHeures > 0 ? Math.round((heuresEffectuees / totalHeures) * 100) : 0;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          Chargement de vos cours...
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
                  <div className="text-2xl font-bold text-foreground">{coursData.length}</div>
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
                    {coursData.reduce((acc, c) => acc + c.nbEtudiants, 0)}
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
            const progression = coursItem.heures_total > 0
              ? Math.round((coursItem.heures_effectuees / coursItem.heures_total) * 100)
              : 0;

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
                    <span className="font-medium text-foreground">{coursItem.prochainCours || 'Aucun prévu'}</span>
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
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: coursItem.couleur }}
                          />
                          {coursItem.matiere_nom}
                        </DialogTitle>
                      </DialogHeader>

                      <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                          <TabsTrigger value="seances">Séances</TabsTrigger>
                          <TabsTrigger value="etudiants">Étudiants ({coursItem.nbEtudiants})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6 pt-4">
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
                              <div className="font-medium text-foreground">{coursItem.salle || 'Non assignée'}</div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Progression du programme</span>
                              <span className="font-medium text-foreground">{progression}%</span>
                            </div>
                            <Progress value={progression} className="h-3" />
                          </div>
                        </TabsContent>

                        <TabsContent value="seances" className="space-y-4 pt-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">Créneaux horaires</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              {coursItem.creneaux && coursItem.creneaux.length > 0 ? (
                                coursItem.creneaux.map((creneau: any) => (
                                  <div key={creneau.id} className="flex items-center justify-between p-3 rounded-lg border">
                                    <div className="flex items-center gap-3">
                                      <Calendar className="h-4 w-4 text-muted-foreground" />
                                      <span className="capitalize font-medium">{creneau.jour_semaine}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>{creneau.heure_debut.slice(0, 5)} - {creneau.heure_fin.slice(0, 5)}</span>
                                      </div>
                                      <Badge variant="outline">{creneau.salle?.nom_salle || 'Salle ?'}</Badge>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-4 text-muted-foreground">Aucun créneau défini</div>
                              )}
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="etudiants" className="space-y-4 pt-4">
                          <div className="rounded-md border">
                            <div className="p-4">
                              {coursItem.eleves && coursItem.eleves.length > 0 ? (
                                <ul className="space-y-3">
                                  {coursItem.eleves.map((eleve: any) => (
                                    <li key={eleve.id} className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                          {eleve.prenom?.[0]}{eleve.nom?.[0]}
                                        </div>
                                        <div>
                                          <div className="font-medium text-sm">{eleve.prenom} {eleve.nom}</div>
                                          <div className="text-xs text-muted-foreground">{eleve.matricule}</div>
                                        </div>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                  Aucun étudiant inscrit dans cette classe.
                                </div>
                              )}
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
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
