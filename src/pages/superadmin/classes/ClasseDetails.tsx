import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ArrowLeft, Edit, Users, BookOpen, Calendar } from "lucide-react";
import { useClasse, useClasseStats } from "@/hooks/useClasses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatutClasse } from "@/types/classes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleUtilisateur } from "@/types/users";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const STATUT_LABELS: Record<StatutClasse, string> = {
  [StatutClasse.ACTIVE]: "Active",
  [StatutClasse.ARCHIVEE]: "Archivée",
};

const STATUT_COLORS: Record<StatutClasse, string> = {
  [StatutClasse.ACTIVE]: "bg-green-500",
  [StatutClasse.ARCHIVEE]: "bg-gray-500",
};

export default function ClasseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: classe, isLoading } = useClasse(id!);
  const { data: stats } = useClasseStats(id!);

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

  if (!classe) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Classe non trouvée</h2>
          <Button className="mt-4" onClick={() => navigate("/gestion/classes")}>
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/gestion/classes")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{classe.nom_classe}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>{classe.niveau}</span>
                {classe.filiere && (
                  <>
                    <span>•</span>
                    <span>{classe.filiere}</span>
                  </>
                )}
                <span>•</span>
                <Badge className={STATUT_COLORS[classe.statut]}>
                  {STATUT_LABELS[classe.statut]}
                </Badge>
              </div>
            </div>
          </div>
          <Button onClick={() => navigate(`/gestion/classes/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Effectif</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classe.effectif}</div>
              <p className="text-xs text-muted-foreground">étudiants</p>
            </CardContent>
          </Card>

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
              <CardTitle className="text-sm font-medium">Enseignants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.enseignants_count || 0}</div>
              <p className="text-xs text-muted-foreground">enseignants</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Année scolaire</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classe.annee_scolaire}</div>
              <p className="text-xs text-muted-foreground">année en cours</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="informations">
          <TabsList>
            <TabsTrigger value="informations">Informations</TabsTrigger>
            <TabsTrigger value="etudiants">Étudiants ({classe.effectif})</TabsTrigger>
            <TabsTrigger value="cours">Cours</TabsTrigger>
          </TabsList>

          <TabsContent value="informations" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Salle principale</p>
                    <p className="font-medium">{classe.salle_principale || "Non assignée"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="etudiants" className="space-y-4 pt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Liste des étudiants</CardTitle>
                <AssignStudentDialog classeId={classe.id} />
              </CardHeader>
              <CardContent>
                <StudentList students={classe.eleves || []} classeId={classe.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cours" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Cours de la classe</CardTitle>
              </CardHeader>
              <CardContent>
                <CourseList cours={classe.cours || []} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

import { Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useClassesActions } from "@/hooks/useClasses";
import { useToast } from "@/hooks/use-toast";
import { useUsers } from "@/hooks/useUsers";
// Note: Assuming useUsers can fetch users to assign, but API requires creating Eleve or assigning existing user.
// The controller `assignStudent` takes `utilisateur_id`, `matricule`, etc.
// We need a user search/select or creation form. For simplicity, let's assume we search for a user or enter an ID.
// However, the prompt implies "formulaire d'assignation d'élèves". I will create a simple form asking for User ID or selecting from a list if possible.
// Given constraints, I'll assume we paste a User ID or select from a dropdown of students without class.

function StudentList({ students, classeId }: { students: any[], classeId: string }) {
  const { removeStudent } = useClassesActions();

  if (students.length === 0) {
    return <p className="text-center py-8 text-muted-foreground">Aucun étudiant assigné à cette classe.</p>;
  }

  return (
    <div className="space-y-2">
      {students.map(student => {
        const u = student.utilisateur;
        if (!u) return null;

        return (
          <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={u.photo_url} />
                <AvatarFallback>{u.prenom?.[0]}{u.nom?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{u.prenom} {u.nom}</p>
                <p className="text-xs text-muted-foreground">{u.email} • Mat: {student.matricule}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">Détails</Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => {
                  if (confirm("Êtes-vous sûr de vouloir retirer cet étudiant de la classe ?")) {
                    removeStudent.mutate({ classeId, studentId: u.id });
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AssignStudentDialog({ classeId }: { classeId: string }) {
  const [open, setOpen] = useState(false);
  const [matricule, setMatricule] = useState("");
  const [userId, setUserId] = useState("");
  const { assignStudent } = useClassesActions();
  const { toast } = useToast();

  // In a real app, this would be a Combobox searching for users with role ELEVE
  // For now, I'll use a simple input for User ID and Matricule

  const handleSubmit = () => {
    if (!userId) {
      toast({ title: "Erreur", description: "L'ID utilisateur est requis", variant: "destructive" });
      return;
    }

    assignStudent.mutate({
      classeId,
      data: {
        utilisateur_id: userId,
        matricule
      }
    }, {
      onSuccess: () => {
        setOpen(false);
        setUserId("");
        setMatricule("");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Assigner
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assigner un étudiant</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>ID Utilisateur (Élève)</Label>
            <Input value={userId} onChange={e => setUserId(e.target.value)} placeholder="UUID de l'utilisateur" />
            <p className="text-xs text-muted-foreground">Entrez l'ID de l'utilisateur à assigner.</p>
          </div>
          <div className="space-y-2">
            <Label>Matricule</Label>
            <Input value={matricule} onChange={e => setMatricule(e.target.value)} placeholder="MAT-202X-..." />
          </div>
          <Button onClick={handleSubmit} className="w-full">Assigner</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CourseList({ cours }: { cours: any[] }) {
  if (!cours || cours.length === 0) {
    return <p className="text-center py-8 text-muted-foreground">Aucun cours assigné à cette classe.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {cours.map(c => (
        <Card key={c.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-base">{c.matiere?.nom_matiere || "Matière inconnue"}</CardTitle>
              <Badge variant="outline">{c.matiere?.code_matiere}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Enseignant:</span>
                <span className="font-medium">
                  {c.enseignant?.utilisateur?.prenom} {c.enseignant?.utilisateur?.nom}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Volume hebdo:</span>
                <span>{c.volume_horaire_hebdo}h</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

