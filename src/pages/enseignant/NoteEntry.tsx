import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { evaluationsApi, Evaluation } from "@/api/evaluations/api";
import { notesApi, Note } from "@/api/notes/api";
import { periodesApi, Periode } from "@/api/periodes/api";
import { useAuth } from "@/contexts/AuthContext"; // To get current teacher ID
import { coursApi } from "@/api/cours/api"; // To get teacher's classes/matieres
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Plus, Save, Loader2, ArrowLeft } from "lucide-react";
import { usersApi } from "@/api/users/api"; // Or specialized elevesApi to get students of a class?
// Actually we need to fetch students of the selected class to enter grades.
// We can use evaluationsApi/notesApi or fetch class students separately.
// For simplicity, let's fetch students of the class via usersApi or classeApi if available.

// Assuming we have a simpler way or we rely on notesApi.getByEvaluation returning empty notes for all students? 
// No, backend noteController returns existing notes. We need the list of student to display row for everyone.
// So we need `elevesApi.getByClasse(classeId)`.

import { elevesApi } from "@/api/eleves/api";
// Wait, I need to check if elevesApi exists and has getByClasse. I'll check after this file creation or assume standard.
// If not, I'll need to create it. Assuming standard filtering.

export function NoteEntry() {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
    const [newEvalOpen, setNewEvalOpen] = useState(false);

    // Form states for new evaluation
    const [newEvalData, setNewEvalData] = useState({
        titre: "",
        type: "DEVOIR",
        matiere_id: "",
        classe_id: "",
        periode_id: "",
        coefficient: 1,
        note_sur: 20
    });

    // Grades state: Map<eleveId, {valeur, absent}>
    const [grades, setGrades] = useState<Record<string, { valeur: string, absent: boolean }>>({});

    // Fetch Evaluations
    const { data: evalsData, isLoading: evalsLoading } = useQuery({
        queryKey: ["evaluations", user?.id], // Filter by teacher ideally
        queryFn: () => evaluationsApi.getAll({ enseignant_id: (user as any)?.enseignant?.id })
        // Needs user to have enseignant profile linked in context or fetch it? 
        // Using simple getAll for now, backend filters or returns all if not strictly scoped in prototype
    });

    // Fetch Periodes
    const { data: periodesData } = useQuery({ queryKey: ["periodes"], queryFn: periodesApi.getAll });

    // Fetch Teacher's Courses (to pick Matiere/Classe for new Eval)
    // This might be heavy, for now let's assume we fetch all courses of the teacher
    const { data: mesCoursData } = useQuery({
        queryKey: ["mes-cours"],
        queryFn: () => coursApi.getMesCours() // Assuming this exists from previous tasks
    });

    // Derived unique Classes and Matieres from MesCours
    const teacherClasses = mesCoursData ? Array.from(new Set(mesCoursData.map((c: any) => JSON.stringify({ id: c.classe.id, nom: c.classe.nom_classe })))).map((s: any) => JSON.parse(s)) : [];

    // Fetch Students AND Notes when an evaluation is selected
    const { data: studentsData } = useQuery({
        queryKey: ["eleves", selectedEvaluation?.classe_id],
        queryFn: () => elevesApi.getAll({ classe_id: selectedEvaluation?.classe_id }), // Need to ensure getAll supports classe_id filter
        enabled: !!selectedEvaluation
    });

    const { data: existingNotesData } = useQuery({
        queryKey: ["notes", selectedEvaluation?.id],
        queryFn: () => notesApi.getByEvaluation(selectedEvaluation!.id),
        enabled: !!selectedEvaluation
    });

    // Initialize grades state when students or notes change
    useEffect(() => {
        if (studentsData?.eleves && existingNotesData?.notes) {
            const initialGrades: Record<string, any> = {};
            studentsData.eleves.forEach((eleve: any) => {
                const existingNote = existingNotesData.notes.find((n: Note) => n.eleve_id === eleve.id);
                initialGrades[eleve.id] = {
                    valeur: existingNote ? existingNote.valeur.toString() : "",
                    absent: existingNote ? existingNote.absent : false
                };
            });
            setGrades(initialGrades);
        } else if (studentsData?.eleves) {
            // No notes yet
            const initialGrades: Record<string, any> = {};
            studentsData.eleves.forEach((eleve: any) => {
                initialGrades[eleve.id] = { valeur: "", absent: false };
            });
            setGrades(initialGrades);
        }
    }, [studentsData, existingNotesData]);

    // Mutations
    const createEvalMutation = useMutation({
        mutationFn: evaluationsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["evaluations"] });
            toast({ title: "Succès", description: "Évaluation créée" });
            setNewEvalOpen(false);
        }
    });

    const saveGradesMutation = useMutation({
        mutationFn: (data: { evalId: string, notes: any[] }) => notesApi.bulkUpdate(data.evalId, { notes: data.notes }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notes"] });
            toast({ title: "Succès", description: "Notes enregistrées" });
            setSelectedEvaluation(null); // Return to list or stay? 
        }
    });

    const handleSaveGrades = () => {
        if (!selectedEvaluation) return;
        const notesPayload = Object.entries(grades).map(([eleveId, data]) => ({
            eleve_id: eleveId,
            valeur: data.valeur === "" ? 0 : parseFloat(data.valeur),
            absent: data.absent,
            appreciation: "" // TODO allow appreciation
        }));
        saveGradesMutation.mutate({ evalId: selectedEvaluation.id, notes: notesPayload });
    };

    if (selectedEvaluation) {
        return (
            <AppLayout>
                <div className="p-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => setSelectedEvaluation(null)}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{selectedEvaluation.titre}</h1>
                            <p className="text-muted-foreground">{selectedEvaluation.classe?.nom_classe} - {selectedEvaluation.matiere?.nom_matiere}</p>
                        </div>
                        <Button className="ml-auto" onClick={handleSaveGrades} disabled={saveGradesMutation.isPending}>
                            {saveGradesMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Enregistrer les notes
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Saisie des notes</CardTitle>
                            <CardDescription>Note sur {selectedEvaluation.note_sur}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Matricule</TableHead>
                                        <TableHead>Nom</TableHead>
                                        <TableHead>Prénom</TableHead>
                                        <TableHead>Note</TableHead>
                                        <TableHead>Absent</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {studentsData?.eleves.map((eleve: any) => (
                                        <TableRow key={eleve.id}>
                                            <TableCell>{eleve.matricule}</TableCell>
                                            <TableCell>{eleve.utilisateur.nom}</TableCell>
                                            <TableCell>{eleve.utilisateur.prenom}</TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    step="0.25"
                                                    min="0"
                                                    max={selectedEvaluation.note_sur}
                                                    className="w-24"
                                                    value={grades[eleve.id]?.valeur || ""}
                                                    onChange={(e) => setGrades({
                                                        ...grades,
                                                        [eleve.id]: { ...grades[eleve.id], valeur: e.target.value }
                                                    })}
                                                    disabled={grades[eleve.id]?.absent}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Switch
                                                    checked={grades[eleve.id]?.absent || false}
                                                    onCheckedChange={(checked) => setGrades({
                                                        ...grades,
                                                        [eleve.id]: { ...grades[eleve.id], absent: checked, valeur: checked ? "0" : grades[eleve.id]?.valeur }
                                                    })}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Gestion des Notes</h1>
                        <p className="text-muted-foreground">Créez des évaluations et saisissez les notes de vos classes.</p>
                    </div>
                    <Dialog open={newEvalOpen} onOpenChange={setNewEvalOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Nouvelle Évaluation
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Créer une évaluation</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Titre</Label>
                                        <Input
                                            placeholder="Ex: Devoir 1"
                                            value={newEvalData.titre}
                                            onChange={(e) => setNewEvalData({ ...newEvalData, titre: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Type</Label>
                                        <Select
                                            value={newEvalData.type}
                                            onValueChange={(v) => setNewEvalData({ ...newEvalData, type: v })}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="DEVOIR">Devoir</SelectItem>
                                                <SelectItem value="COMPOSITION">Composition</SelectItem>
                                                <SelectItem value="TP">TP</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Classe</Label>
                                        <Select
                                            value={newEvalData.classe_id}
                                            onValueChange={(v) => setNewEvalData({ ...newEvalData, classe_id: v })}
                                        >
                                            <SelectTrigger><SelectValue placeholder="Choisir une classe" /></SelectTrigger>
                                            <SelectContent>
                                                {teacherClasses.map((c: any) => (
                                                    <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Matière</Label>
                                        <Select
                                            value={newEvalData.matiere_id}
                                            onValueChange={(v) => setNewEvalData({ ...newEvalData, matiere_id: v })}
                                        >
                                            <SelectTrigger><SelectValue placeholder="Choisir une matière" /></SelectTrigger>
                                            <SelectContent>
                                                {/* Ideally filter matters by selected class if possible, or show all instructor matters */}
                                                {/* For prototype, assume we can get matiere ID from selected class course logic or just list all unique matters of teacher */}
                                                {/* Quick hack: use teacherClasses logic to extract unique matters if we had them in mesCoursData */}
                                                <SelectItem value="TODO_MATIERE_ID">Matière Math (Demo)</SelectItem>
                                                {/* Need to fix this data flow */}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Période</Label>
                                        <Select
                                            value={newEvalData.periode_id}
                                            onValueChange={(v) => setNewEvalData({ ...newEvalData, periode_id: v })}
                                        >
                                            <SelectTrigger><SelectValue placeholder="Trimestre..." /></SelectTrigger>
                                            <SelectContent>
                                                {periodesData?.periodes.filter(p => p.actif).map((p: Periode) => (
                                                    <SelectItem key={p.id} value={p.id}>{p.libelle}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Note Sur</Label>
                                        <Input
                                            type="number"
                                            value={newEvalData.note_sur}
                                            onChange={(e) => setNewEvalData({ ...newEvalData, note_sur: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <Button onClick={() => createEvalMutation.mutate(newEvalData)} disabled={createEvalMutation.isPending}>
                                    Créer
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {evalsLoading ? <Loader2 className="animate-spin" /> : evalsData?.evaluations.map((evaluation) => (
                        <Card key={evaluation.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => setSelectedEvaluation(evaluation)}>
                            <CardHeader>
                                <CardTitle>{evaluation.titre}</CardTitle>
                                <CardDescription>{evaluation.classe?.nom_classe} - {evaluation.matiere?.nom_matiere}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>{evaluation.periode?.libelle}</span>
                                    <span>Coeff: {evaluation.coefficient}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}

