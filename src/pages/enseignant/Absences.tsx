import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAbsences, useAbsencesActions } from "@/hooks/useAbsences";
import { useMesCours } from "@/hooks/useCours";
import { UserX, Calendar, Clock, Users, AlertTriangle, CheckCircle, Plus, Send, FileText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface Etudiant {
  id: string;
  nom: string;
  prenom: string;
  present: boolean;
}

export default function AbsencesEnseignant() {
  const [selectedCours, setSelectedCours] = useState<string>("");
  const [selectedSeance, setSelectedSeance] = useState<string>("");
  const [presences, setPresences] = useState<Record<string, boolean>>({});
  const [motif, setMotif] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { absences, isLoading } = useAbsences();
  const { declarerAbsences, isDeclaring } = useAbsencesActions();

  // Mock data pour la démo
  const mockCours = [
    { id: "1", matiere_nom: "Mathématiques Avancées", classe_nom: "L3 Informatique" },
    { id: "2", matiere_nom: "Algèbre Linéaire", classe_nom: "L2 Mathématiques" },
    { id: "3", matiere_nom: "Statistiques", classe_nom: "M1 Data Science" },
  ];

  const mockSeances = [
    { id: "s1", cours_id: "1", date: "2025-01-10", heure_debut: "08:00", heure_fin: "10:00" },
    { id: "s2", cours_id: "1", date: "2025-01-08", heure_debut: "08:00", heure_fin: "10:00" },
    { id: "s3", cours_id: "2", date: "2025-01-09", heure_debut: "10:00", heure_fin: "12:00" },
  ];

  const mockEtudiants: Etudiant[] = [
    { id: "e1", nom: "DUPONT", prenom: "Marie", present: true },
    { id: "e2", nom: "MARTIN", prenom: "Jean", present: true },
    { id: "e3", nom: "BERNARD", prenom: "Sophie", present: true },
    { id: "e4", nom: "PETIT", prenom: "Lucas", present: true },
    { id: "e5", nom: "DURAND", prenom: "Emma", present: true },
    { id: "e6", nom: "LEROY", prenom: "Thomas", present: true },
    { id: "e7", nom: "MOREAU", prenom: "Julie", present: true },
    { id: "e8", nom: "SIMON", prenom: "Pierre", present: true },
  ];

  const mockAbsences = [
    { id: "a1", etudiant_nom: "DUPONT", etudiant_prenom: "Marie", cours_nom: "Mathématiques", date: "2025-01-08", justifiee: false },
    { id: "a2", etudiant_nom: "MARTIN", etudiant_prenom: "Jean", cours_nom: "Mathématiques", date: "2025-01-08", justifiee: true, motif: "Certificat médical" },
    { id: "a3", etudiant_nom: "PETIT", etudiant_prenom: "Lucas", cours_nom: "Algèbre", date: "2025-01-07", justifiee: false },
    { id: "a4", etudiant_nom: "BERNARD", etudiant_prenom: "Sophie", cours_nom: "Statistiques", date: "2025-01-06", justifiee: true, motif: "Convocation" },
  ];

  const filteredSeances = mockSeances.filter(s => !selectedCours || s.cours_id === selectedCours);

  const handlePresenceChange = (etudiantId: string, present: boolean) => {
    setPresences(prev => ({ ...prev, [etudiantId]: present }));
  };

  const handleSubmitAbsences = () => {
    const absentsIds = Object.entries(presences)
      .filter(([_, present]) => !present)
      .map(([id]) => id);

    if (absentsIds.length === 0) {
      toast.success("Tous les étudiants sont présents");
    } else {
      declarerAbsences({
        seance_id: selectedSeance,
        etudiants_absents: absentsIds,
        motif: motif || undefined,
      });
    }
    
    setIsDialogOpen(false);
    setPresences({});
    setMotif("");
  };

  const getSeanceLabel = (seance: typeof mockSeances[0]) => {
    const cours = mockCours.find(c => c.id === seance.cours_id);
    return `${format(new Date(seance.date), "dd/MM/yyyy", { locale: fr })} - ${seance.heure_debut} à ${seance.heure_fin}`;
  };

  const absentsCount = Object.values(presences).filter(p => !p).length;
  const presentCount = mockEtudiants.length - absentsCount;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestion des Absences</h1>
            <p className="text-muted-foreground">
              Déclarez et suivez les absences de vos étudiants
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Faire l'appel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Appel des présences
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Sélection cours et séance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Cours</label>
                    <Select value={selectedCours} onValueChange={setSelectedCours}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un cours" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockCours.map(cours => (
                          <SelectItem key={cours.id} value={cours.id}>
                            {cours.matiere_nom} - {cours.classe_nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Séance</label>
                    <Select value={selectedSeance} onValueChange={setSelectedSeance} disabled={!selectedCours}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une séance" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredSeances.map(seance => (
                          <SelectItem key={seance.id} value={seance.id}>
                            {getSeanceLabel(seance)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Résumé */}
                {selectedSeance && (
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <div className="text-2xl font-bold text-foreground">{mockEtudiants.length}</div>
                        <p className="text-sm text-muted-foreground">Total étudiants</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{presentCount}</div>
                        <p className="text-sm text-muted-foreground">Présents</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <div className="text-2xl font-bold text-red-600">{absentsCount}</div>
                        <p className="text-sm text-muted-foreground">Absents</p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Liste étudiants */}
                {selectedSeance && (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">Présent</TableHead>
                          <TableHead>Nom</TableHead>
                          <TableHead>Prénom</TableHead>
                          <TableHead className="text-right">Statut</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockEtudiants.map(etudiant => {
                          const isPresent = presences[etudiant.id] !== false;
                          return (
                            <TableRow key={etudiant.id}>
                              <TableCell>
                                <Checkbox
                                  checked={isPresent}
                                  onCheckedChange={(checked) => 
                                    handlePresenceChange(etudiant.id, !!checked)
                                  }
                                />
                              </TableCell>
                              <TableCell className="font-medium">{etudiant.nom}</TableCell>
                              <TableCell>{etudiant.prenom}</TableCell>
                              <TableCell className="text-right">
                                {isPresent ? (
                                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Présent
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">
                                    <UserX className="h-3 w-3 mr-1" />
                                    Absent
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Motif global */}
                {absentsCount > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Motif (optionnel)
                    </label>
                    <Textarea
                      placeholder="Ajouter un motif pour les absences..."
                      value={motif}
                      onChange={(e) => setMotif(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSubmitAbsences} disabled={!selectedSeance || isDeclaring}>
                  <Send className="h-4 w-4 mr-2" />
                  Enregistrer l'appel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <UserX className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{mockAbsences.length}</div>
                  <p className="text-sm text-muted-foreground">Absences totales</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {mockAbsences.filter(a => !a.justifiee).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Non justifiées</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {mockAbsences.filter(a => a.justifiee).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Justifiées</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">15</div>
                  <p className="text-sm text-muted-foreground">Séances ce mois</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs historique */}
        <Tabs defaultValue="recentes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="recentes">Absences récentes</TabsTrigger>
            <TabsTrigger value="non-justifiees">Non justifiées</TabsTrigger>
            <TabsTrigger value="justifiees">Justifiées</TabsTrigger>
          </TabsList>

          <TabsContent value="recentes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Dernières absences déclarées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Étudiant</TableHead>
                      <TableHead>Cours</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAbsences.map(absence => (
                      <TableRow key={absence.id}>
                        <TableCell className="font-medium">
                          {absence.etudiant_nom} {absence.etudiant_prenom}
                        </TableCell>
                        <TableCell>{absence.cours_nom}</TableCell>
                        <TableCell>
                          {format(new Date(absence.date), "dd/MM/yyyy", { locale: fr })}
                        </TableCell>
                        <TableCell>
                          {absence.justifiee ? (
                            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Justifiée
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Non justifiée
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="non-justifiees">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Absences non justifiées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Étudiant</TableHead>
                      <TableHead>Cours</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAbsences.filter(a => !a.justifiee).map(absence => (
                      <TableRow key={absence.id}>
                        <TableCell className="font-medium">
                          {absence.etudiant_nom} {absence.etudiant_prenom}
                        </TableCell>
                        <TableCell>{absence.cours_nom}</TableCell>
                        <TableCell>
                          {format(new Date(absence.date), "dd/MM/yyyy", { locale: fr })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            Justifier
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="justifiees">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Absences justifiées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Étudiant</TableHead>
                      <TableHead>Cours</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Motif</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAbsences.filter(a => a.justifiee).map(absence => (
                      <TableRow key={absence.id}>
                        <TableCell className="font-medium">
                          {absence.etudiant_nom} {absence.etudiant_prenom}
                        </TableCell>
                        <TableCell>{absence.cours_nom}</TableCell>
                        <TableCell>
                          {format(new Date(absence.date), "dd/MM/yyyy", { locale: fr })}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {absence.motif}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
