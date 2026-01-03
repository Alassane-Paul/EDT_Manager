import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionsExamenApi, repartitionsApi, SessionExamen } from "@/api/sessionsExamen/api";
import { classesApi } from "@/api/classes/api";
import { matieresApi } from "@/api/matieres/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar as CalendarIcon, Users, Loader2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ExamScheduler() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [newSessionOpen, setNewSessionOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState<SessionExamen | null>(null);

    const { data: classesData } = useQuery({ queryKey: ["classes"], queryFn: () => classesApi.getAll() });
    const { data: matieresData } = useQuery({ queryKey: ["matieres"], queryFn: () => matieresApi.getAll() });

    const { data: sessionsData, isLoading } = useQuery({
        queryKey: ["sessions-examen"],
        queryFn: () => sessionsExamenApi.getCalendrier()
    });

    const createMutation = useMutation({
        mutationFn: sessionsExamenApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sessions-examen"] });
            toast({ title: "Succès", description: "Session d'examen créée" });
            setNewSessionOpen(false);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: sessionsExamenApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sessions-examen"] });
            toast({ title: "Annulé", description: "Session annulée" });
        }
    });

    const autoAssignMutation = useMutation({
        mutationFn: repartitionsApi.autoAssign,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["sessions-examen"] });
            toast({
                title: "Répartition effectuée",
                description: `${data.total_eleves} élèves répartis dans ${data.salles_utilisees} salles`
            });
        }
    });

    const handleCreateSession = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        createMutation.mutate({
            titre: formData.get('titre') as string,
            matiere_id: formData.get('matiere_id') as string,
            classe_id: formData.get('classe_id') as string,
            date_examen: formData.get('date_examen') as string,
            heure_debut: formData.get('heure_debut') as string,
            heure_fin: formData.get('heure_fin') as string,
            duree_minutes: parseInt(formData.get('duree_minutes') as string),
            type: formData.get('type') as any,
            coefficient: parseFloat(formData.get('coefficient') as string),
            instructions: formData.get('instructions') as string
        });
    };

    return (
        <AppLayout>
            <div className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Calendrier des Examens</h1>
                        <p className="text-muted-foreground">Planifiez et gérez les examens présentiels.</p>
                    </div>
                    <Dialog open={newSessionOpen} onOpenChange={setNewSessionOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Nouvelle Session
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Planifier un examen</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateSession} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Titre</Label>
                                    <Input name="titre" placeholder="Ex: Composition Mathématiques" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Classe</Label>
                                        <Select name="classe_id" required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choisir une classe" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {classesData?.classes?.map((c: any) => (
                                                    <SelectItem key={c.id} value={c.id}>{c.nom_classe}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Matière</Label>
                                        <Select name="matiere_id" required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choisir une matière" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {matieresData?.matieres?.map((m: any) => (
                                                    <SelectItem key={m.id} value={m.id}>{m.nom_matiere}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Date</Label>
                                        <Input name="date_examen" type="date" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Heure début</Label>
                                        <Input name="heure_debut" type="time" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Heure fin</Label>
                                        <Input name="heure_fin" type="time" required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Durée (min)</Label>
                                        <Input name="duree_minutes" type="number" defaultValue="120" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Type</Label>
                                        <Select name="type" defaultValue="COMPOSITION">
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="DEVOIR_SURVEILLE">Devoir Surveillé</SelectItem>
                                                <SelectItem value="COMPOSITION">Composition</SelectItem>
                                                <SelectItem value="EXAMEN_BLANC">Examen Blanc</SelectItem>
                                                <SelectItem value="CONTROLE_CONTINU">Contrôle Continu</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Coefficient</Label>
                                        <Input name="coefficient" type="number" step="0.5" defaultValue="2" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Instructions</Label>
                                    <Textarea name="instructions" placeholder="Consignes pour les élèves..." />
                                </div>
                                <Button type="submit" disabled={createMutation.isPending} className="w-full">
                                    {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Créer
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Sessions Programmées</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin h-6 w-6" /></div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Titre</TableHead>
                                        <TableHead>Classe</TableHead>
                                        <TableHead>Matière</TableHead>
                                        <TableHead>Horaire</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sessionsData?.sessions.map((session: SessionExamen) => (
                                        <TableRow key={session.id}>
                                            <TableCell>{new Date(session.date_examen).toLocaleDateString()}</TableCell>
                                            <TableCell className="font-medium">{session.titre}</TableCell>
                                            <TableCell>{session.classe?.nom_classe}</TableCell>
                                            <TableCell>{session.matiere?.nom_matiere}</TableCell>
                                            <TableCell>{session.heure_debut} - {session.heure_fin}</TableCell>
                                            <TableCell>
                                                <Badge variant={session.statut === 'PLANIFIE' ? 'default' : 'secondary'}>
                                                    {session.statut}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => autoAssignMutation.mutate(session.id)}
                                                        disabled={autoAssignMutation.isPending}
                                                    >
                                                        <Users className="h-4 w-4 mr-1" />
                                                        Répartir
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => deleteMutation.mutate(session.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {sessionsData?.sessions.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                Aucune session programmée.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
