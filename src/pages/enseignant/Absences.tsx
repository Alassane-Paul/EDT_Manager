import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { useAbsences } from "@/hooks/useAbsences";
import { useMesCours } from "@/hooks/useCours";
import { useEtudiantsClasse, useAppelAction } from "@/hooks/useStudentAttendance";
import { UserX, Calendar, Clock, Users, AlertTriangle, CheckCircle, Plus, Send, FileText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { Cours } from "@/types/cours";

interface Etudiant {
  id: string;
  nom: string;
  prenom: string;
  present: boolean;
}

export default function AbsencesEnseignant() {
  const navigate = useNavigate();
  const [selectedCoursId, setSelectedCoursId] = useState<string>("");
  const [selectedSeanceKey, setSelectedSeanceKey] = useState<string>(""); // Format: "YYYY-MM-DD"
  const [presences, setPresences] = useState<Record<string, boolean>>({});
  const [motif, setMotif] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Hooks
  const { cours: mesCours, isLoading: isLoadingCours } = useMesCours();

  const selectedCours = mesCours?.find(c => c.id === selectedCoursId);
  const classeId = selectedCours?.classe_id;

  const { etudiants, isLoading: isLoadingEtudiants } = useEtudiantsClasse(classeId || "");
  const { saveAppel, isSaving } = useAppelAction();

  // Génération des séances (2 dernières semaines + 1 semaine à venir) pour la démo
  // Dans un vrai cas, on pourrait avoir une API dédiée "getSeances" qui retourne les dates réelles
  const getSeancesOptions = () => {
    const creneaux = (selectedCours as any)?.creneaux;
    if (!selectedCours || !creneaux) return [];

    const options: { date: string; label: string; dateObj: Date }[] = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 14); // 2 weeks back
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 7); // 1 week forward

    creneaux.forEach((creneau: any) => {
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        // Check if day matches (0=Sunday, 1=Monday...)
        // creneau.jour_semaine is string "lundi" etc.
        const jours = { dimanche: 0, lundi: 1, mardi: 2, mercredi: 3, jeudi: 4, vendredi: 5, samedi: 6 };
        // @ts-ignore
        const jourCreneauIndex = jours[creneau.jour_semaine.toLowerCase()];

        if (currentDate.getDay() === jourCreneauIndex) {
          const dateStr = format(currentDate, "yyyy-MM-dd");
          options.push({
            date: dateStr,
            label: `${format(currentDate, "EEEE d MMMM", { locale: fr })} - ${creneau.heure_debut}`,
            dateObj: new Date(currentDate)
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    return options.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  };

  const seanceOptions = getSeancesOptions();

  // Reset presences when selection changes
  const handleCoursChange = (val: string) => {
    setSelectedCoursId(val);
    setSelectedSeanceKey("");
    setPresences({});
  };

  const handleSeanceChange = (val: string) => {
    setSelectedSeanceKey(val);
    setPresences({});
    // Initialiser tous les étudiants comme présents par défaut
    if (etudiants) {
      const initialPresences: Record<string, boolean> = {};
      etudiants.forEach((e: any) => initialPresences[e.id] = true);
      setPresences(initialPresences);
    }
  };

  const handlePresenceChange = (etudiantId: string, present: boolean) => {
    setPresences(prev => ({ ...prev, [etudiantId]: present }));
  };

  const handleSubmitAbsences = () => {
    if (!selectedCoursId || !selectedSeanceKey) return;

    const absents = etudiants?.filter((e: any) => {
      // Si explicitement false, alors absent. Si undefined (pas touché), défaut true donc présent.
      return presences[e.id] === false;
    }).map((e: any) => ({
      eleve_id: e.id,
      motif: motif,
      statut: 'declaree'
    })) || [];

    if (absents.length === 0) {
      toast.info("Aucun absent à déclarer (tous présents)");
      // On pourrait quand même envoyer l'appel pour dire "tout le monde présent" si le backend le gère
    } else {
      saveAppel({
        cours_id: selectedCoursId,
        date: selectedSeanceKey,
        absences: absents
      }, {
        onSuccess: () => {
          setIsDialogOpen(false);
          setPresences({});
          setMotif("");
        }
      });
    }
  };

  const getSeanceLabel = (dateKey: string) => {
    const opt = seanceOptions.find(o => o.date === dateKey);
    return opt ? opt.label : dateKey;
  };

  const absentsCount = Object.values(presences).filter(p => !p).length;
  // Note: presentCount calculation depends on whether we initialized presences or not.
  // Better use derived state from etudiants
  const currentAbsentsCount = etudiants ? etudiants.filter((e: any) => presences[e.id] === false).length : 0;
  const currentPresentsCount = etudiants ? etudiants.length - currentAbsentsCount : 0;

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
                    <Select value={selectedCoursId} onValueChange={handleCoursChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un cours" />
                      </SelectTrigger>
                      <SelectContent>
                        {mesCours?.map((cours: any) => (
                          <SelectItem key={cours.id} value={cours.id}>
                            {cours.matiere_nom} - {cours.classe_nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Séance</label>
                    <Select value={selectedSeanceKey} onValueChange={handleSeanceChange} disabled={!selectedCoursId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une séance" />
                      </SelectTrigger>
                      <SelectContent>
                        {seanceOptions.map(opt => (
                          <SelectItem key={opt.date} value={opt.date}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Résumé */}
                {selectedSeanceKey && etudiants && (
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <div className="text-2xl font-bold text-foreground">{etudiants.length}</div>
                        <p className="text-sm text-muted-foreground">Total étudiants</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{currentPresentsCount}</div>
                        <p className="text-sm text-muted-foreground">Présents</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <div className="text-2xl font-bold text-red-600">{currentAbsentsCount}</div>
                        <p className="text-sm text-muted-foreground">Absents</p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Liste étudiants */}
                {selectedSeanceKey && etudiants ? (
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
                        {etudiants.map((etudiant: any) => {
                          const isPresent = presences[etudiant.id] !== false; // Default true
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
                              <TableCell className="font-medium">{etudiant.utilisateur?.nom || etudiant.nom}</TableCell>
                              <TableCell>{etudiant.utilisateur?.prenom || etudiant.prenom}</TableCell>
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
                ) : (
                  selectedCoursId && !etudiants && !isLoadingEtudiants ? (
                    <div className="text-center py-4 text-muted-foreground">Aucun étudiant trouvé dans cette classe.</div>
                  ) : null
                )}

                {/* Motif global */}
                {currentAbsentsCount > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Motif (pour les absents)
                    </label>
                    <Textarea
                      placeholder="Ajouter un motif..."
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
                <Button onClick={handleSubmitAbsences} disabled={!selectedSeanceKey || isSaving}>
                  {isSaving ? "Enregistrement..." : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enregistrer l'appel
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Historique et Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Derniers appels effectués
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                <p>L'historique détaillé des appels sera bientôt disponible.</p>
                <p className="text-xs mt-1">Les données sont enregistrées mais l'affichage historique est en cours de finalisation.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Alertes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-400">Rattrapages à prévoir</p>
                  <p className="text-xs text-orange-700 dark:text-orange-500 mt-1">Vous avez des séances manquées nécessitant une demande de rattrapage.</p>
                </div>
                <Button variant="outline" className="w-full" onClick={() => navigate('/enseignant/emploi-temps')}>
                  Gérer mes séances
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
