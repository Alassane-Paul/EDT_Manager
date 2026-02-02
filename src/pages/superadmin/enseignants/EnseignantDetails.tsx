// src/pages/superadmin/enseignants/EnseignantDetails.tsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  ArrowLeft,
  Edit,
  Calendar,
  BarChart3,
  Mail,
  Phone,
  Clock,
  BookOpen,
  Users,
  MapPin,
  Trash2,
  X,
} from "lucide-react";
import { useEnseignant, useEnseignantStats } from "@/hooks/useEnseignants";
import { AssignMatiereDialog } from "./AssignMatiereDialog";
import { AssignCoursDialog } from "./AssignCoursDialog";
import { EditCoursDialog } from "./EditCoursDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useToast, toast } from "@/hooks/use-toast";
import axiosInstance from "@/api/axios_instance";
// Note: Assuming react-query invalidation or similar is handled by the hook or passing a refetch callback. 
// For now, passing a callback to refetch which might be needed if hooks don't auto-update.
// Let's assume useEnseignant uses SWR or React Query and refetches on window focus or we can force it.
// To keep it simple, we'll just force a reload or rely on auto-refetch. 
// OR better, we pass a callback that calls `refetch` from useEnseignant if it returns it.
// Checking useEnseignant hook... it likely returns { refetch }.
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const STATUT_LABELS = {
  titulaire: "Titulaire",
  contractuel: "Contractuel",
  vacataire: "Vacataire",
  stagiaire: "Stagiaire",
};

const STATUT_COLORS = {
  titulaire: "bg-green-500",
  contractuel: "bg-blue-500",
  vacataire: "bg-yellow-500",
  stagiaire: "bg-purple-500",
};

export default function EnseignantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("informations");

  const { data: enseignant, isLoading, refetch } = useEnseignant(id!);
  const { data: stats, refetch: refetchStats } = useEnseignantStats(id!);
  // toast is now imported directly

  const handleRefetch = () => {
    refetch();
    refetchStats();
  };

  const [confirmConfig, setConfirmConfig] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: "default" | "destructive";
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => { },
  });

  const formatHeures = (minutes: number) => {
    const heures = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${heures}h${mins}` : `${heures}h`;
  };

  const handleDeleteCours = (coursId: string) => {
    setConfirmConfig({
      open: true,
      title: "Retirer le cours",
      description: "Êtes-vous sûr de vouloir retirer ce cours ? Cette action supprimera également tous les créneaux planifiés associés.",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await axiosInstance.delete(`/cours/${coursId}`);
          toast({
            title: "Cours retiré",
            description: "Le cours a été retiré avec succès.",
          });
          handleRefetch();
        } catch (error: any) {
          const errorMsg = error.response?.data?.error || "Impossible de retirer le cours.";
          toast({
            title: "Erreur",
            description: errorMsg,
            variant: "destructive",
          });
          console.error(error);
        }
      },
    });
  };

  const handleRemoveMatiere = (matiereId: string) => {
    setConfirmConfig({
      open: true,
      title: "Retirer la matière",
      description: "Êtes-vous sûr de vouloir retirer cette matière ?",
      variant: "destructive",
      onConfirm: async () => {
        try {
          const currentMatiereIds = enseignant.matieres?.map(m => m.id) || [];
          const updatedMatiereIds = currentMatiereIds.filter(id => id !== matiereId);

          await axiosInstance.post(`/enseignants/${id}/assign-subjects`, {
            matiere_ids: updatedMatiereIds,
          });

          toast({
            title: "Matière retirée",
            description: "La matière a été retirée avec succès.",
          });
          handleRefetch();
        } catch (error: any) {
          const errorMsg = error.response?.data?.error || "Impossible de retirer la matière.";
          toast({
            title: "Erreur",
            description: errorMsg,
            variant: "destructive",
          });
          console.error(error);
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!enseignant) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Enseignant non trouvé</h2>
          <p className="text-muted-foreground">
            L'enseignant que vous recherchez n'existe pas
          </p>
          <Button className="mt-4" onClick={() => navigate("/gestion/teachers")}>
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/gestion/teachers")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={enseignant.utilisateur.photo_url} />
                <AvatarFallback className="text-lg">
                  {enseignant.utilisateur.prenom[0]}
                  {enseignant.utilisateur.nom[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">
                  {enseignant.utilisateur.prenom} {enseignant.utilisateur.nom}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>Matricule: {enseignant.matricule}</span>
                  <span>•</span>
                  <Badge className={STATUT_COLORS[enseignant.statut]}>
                    {STATUT_LABELS[enseignant.statut]}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/gestion/teachers/${id}/schedule`)}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Emploi du temps
            </Button>
            <Button onClick={() => navigate(`/gestion/teachers/${id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Cours</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_cours || 0}</div>
              <p className="text-xs text-muted-foreground">cours assignés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Matières</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_matieres || 0}</div>
              <p className="text-xs text-muted-foreground">matières enseignées</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Classes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_classes || 0}</div>
              <p className="text-xs text-muted-foreground">classes différentes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Heures/semaine</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatHeures(stats?.total_heures_hebdo || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                sur {formatHeures(enseignant.heures_contractuelles_hebdo)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="informations">Informations</TabsTrigger>
            <TabsTrigger value="matieres">Matières</TabsTrigger>
            <TabsTrigger value="cours">Cours</TabsTrigger>
            <TabsTrigger value="disponibilites">Disponibilités</TabsTrigger>
          </TabsList>

          <TabsContent value="informations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informations de contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{enseignant.utilisateur.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <p className="font-medium">
                      {enseignant.utilisateur.telephone || "Non renseigné"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informations professionnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Date d'embauche</p>
                    <p className="font-medium">
                      {enseignant.date_embauche
                        ? new Date(enseignant.date_embauche).toLocaleDateString("fr-FR")
                        : "Non renseignée"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Statut</p>
                    <Badge className={`mt-1 ${STATUT_COLORS[enseignant.statut]}`}>
                      {STATUT_LABELS[enseignant.statut]}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Heures contractuelles/semaine
                    </p>
                    <p className="font-medium">
                      {formatHeures(enseignant.heures_contractuelles_hebdo)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Heures max/jour
                    </p>
                    <p className="font-medium">
                      {formatHeures(enseignant.heures_max_journalieres)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Cours consécutifs max
                    </p>
                    <p className="font-medium">{enseignant.cours_consecutifs_max}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Préférence horaire</p>
                    <p className="font-medium capitalize">
                      {enseignant.preference_horaire.replace("_", " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Multi-sites</p>
                    <Badge variant={enseignant.multi_sites ? "default" : "secondary"}>
                      {enseignant.multi_sites ? "Oui" : "Non"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="matieres">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Matières enseignées ({enseignant.matieres?.length || 0})</CardTitle>
                <AssignMatiereDialog
                  enseignantId={id!}
                  currentMatiereIds={enseignant.matieres?.map(m => m.id) || []}
                  onSuccess={handleRefetch}
                />
              </CardHeader>
              <CardContent>
                {enseignant.matieres && enseignant.matieres.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {enseignant.matieres.map((matiere) => {
                      const subjectColor = matiere.couleur_affichage || "#3b82f6";
                      return (
                        <div
                          key={matiere.id}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all hover:shadow-sm"
                          style={{
                            backgroundColor: `${subjectColor}15`,
                            borderColor: `${subjectColor}40`,
                            color: subjectColor
                          }}
                        >
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: subjectColor }}
                          />
                          <span className="font-medium text-sm">{matiere.nom_matiere}</span>
                          <span className="text-[10px] opacity-70 uppercase font-bold tracking-wider">
                            {matiere.code_matiere}
                          </span>
                          <button
                            onClick={() => handleRemoveMatiere(matiere.id)}
                            className="ml-1 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                            title="Retirer la matière"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Aucune matière assignée
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cours">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Cours ({enseignant.cours?.length || 0})</CardTitle>
                <AssignCoursDialog
                  enseignantId={id!}
                  enseignantMatieres={enseignant.matieres?.map(m => m.id) || []}
                  onSuccess={handleRefetch}
                />
              </CardHeader>
              <CardContent>
                {enseignant.cours && enseignant.cours.length > 0 ? (
                  <div className="space-y-3">
                    {enseignant.cours.map((cours) => (
                      <div
                        key={cours.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-semibold"
                            style={{
                              backgroundColor:
                                cours.matiere.couleur_affichage || "#3b82f6",
                            }}
                          >
                            {cours.matiere.code_matiere}
                          </div>
                          <div>
                            <p className="font-medium">{cours.matiere.nom_matiere}</p>
                            <p className="text-sm text-muted-foreground">
                              {cours.classe.nom_classe} • {cours.classe.niveau}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right mr-4">
                            <p className="font-medium">
                              {formatHeures(cours.volume_horaire_hebdo)}
                            </p>
                            <p className="text-sm text-muted-foreground">par semaine</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <EditCoursDialog
                              cours={cours}
                              enseignantMatieres={enseignant.matieres?.map(m => m.id) || []}
                              onSuccess={handleRefetch}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteCours(cours.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Aucun cours assigné
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="disponibilites">
            <Card>
              <CardHeader>
                <CardTitle>
                  Disponibilités ({enseignant.disponibilites?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {enseignant.disponibilites && enseignant.disponibilites.length > 0 ? (
                  <div className="space-y-3">
                    {enseignant.disponibilites.map((dispo) => (
                      <div
                        key={dispo.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <p className="font-medium">{dispo.jour_semaine}</p>
                          <p className="text-sm text-muted-foreground">
                            {dispo.heure_debut} - {dispo.heure_fin}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              dispo.type === "disponible" ? "default" : "secondary"
                            }
                          >
                            {dispo.type === "disponible"
                              ? "Disponible"
                              : "Indisponible"}
                          </Badge>
                          {dispo.recurrent && (
                            <Badge variant="outline">Récurrent</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Aucune disponibilité définie
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        open={confirmConfig.open}
        onOpenChange={(open) => setConfirmConfig((prev) => ({ ...prev, open }))}
        title={confirmConfig.title}
        description={confirmConfig.description}
        onConfirm={confirmConfig.onConfirm}
        variant={confirmConfig.variant}
      />
    </AppLayout>);
}