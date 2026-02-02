import { useState, useEffect, useCallback } from "react";
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
        type: "DEVOIR" as any,
        matiere_id: "",
        classe_id: "",
        periode_id: "",
        coefficient: 1,
        note_sur: 20,
        date_evaluation: new Date().toISOString().split('T')[0]
    });

    // Grades state: Map<eleveId, {valeur, absent, appreciation}>
    const [grades, setGrades] = useState<Record<string, { valeur: string, absent: boolean, appreciation: string }>>({});



    // Fetch Evaluations
    const { data: evalsData, isLoading: evalsLoading } = useQuery({
        queryKey: ["evaluations", user?.id],
        queryFn: () => evaluationsApi.getAll({ enseignant_id: user?.enseignantId })
    });

    // Fetch Periodes
    const { data: periodesData } = useQuery({ queryKey: ["periodes"], queryFn: periodesApi.getAll });

    // Fetch Teacher's Courses
    const { data: mesCoursData } = useQuery({
        queryKey: ["mes-cours"],
        queryFn: () => coursApi.getMesCours()
    });

    // Derive unique Classes and Matieres from MesCours
    const teacherClasses = mesCoursData ? Array.from(new Set(mesCoursData.map((c: any) => JSON.stringify({ id: c.classe_id, nom: c.classe_nom })))).map((s: any) => JSON.parse(s)) : [];

    // Filtered matieres based on selected class in form
    const availableMatieres = mesCoursData?.filter((c: any) => String(c.classe_id) === String(newEvalData.classe_id))
        .map((c: any) => ({
            id: String(c.matiere_id),
            nom: c.matiere_nom,
            code: c.matiere_code,
            coefficient: c.matiere?.coefficient || 1
        }))
        .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i) || [];

    console.log("DEBUG RENDER:", {
        classe_id: newEvalData.classe_id,
        availableMatieres,
        mesCoursSample: mesCoursData?.[0],
        currentMatiereId: newEvalData.matiere_id
    });

    // Fetch Students AND Notes when an evaluation is selected
    const { data: studentsData, isLoading: studentsLoading } = useQuery({
        queryKey: ["eleves", selectedEvaluation?.classe_id],
        queryFn: () => elevesApi.getAll({ classe_id: selectedEvaluation?.classe_id, limit: 1000 }),
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
                    absent: existingNote ? existingNote.absent : false,
                    appreciation: existingNote ? (existingNote.appreciation || "") : ""
                };
            });
            setGrades(initialGrades);
        } else if (studentsData?.eleves) {
            const initialGrades: Record<string, any> = {};
            studentsData.eleves.forEach((eleve: any) => {
                initialGrades[eleve.id] = { valeur: "", absent: false, appreciation: "" };
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
            setSelectedEvaluation(null);
        }
    });

    const handleCreateEvaluation = useCallback(() => {
        if (!newEvalData.titre?.trim()) {
            toast({ title: "Erreur", description: "Veuillez saisir un titre pour l'évaluation", variant: "destructive" });
            return;
        }
        if (!newEvalData.classe_id) {
            toast({ title: "Erreur", description: "Veuillez sélectionner une classe", variant: "destructive" });
            return;
        }
        if (!newEvalData.matiere_id) {
            toast({ title: "Erreur", description: "Veuillez sélectionner une matière", variant: "destructive" });
            return;
        }
        if (!newEvalData.periode_id) {
            toast({ title: "Erreur", description: "Veuillez sélectionner une période", variant: "destructive" });
            return;
        }

        console.log("SENDING EVAL DATA:", newEvalData);
        createEvalMutation.mutate(newEvalData);
    }, [newEvalData, createEvalMutation, toast]);

    // Reset matiere when class changes
    useEffect(() => {
        if (newEvalData.classe_id) {
            setNewEvalData(prev => ({ ...prev, matiere_id: '' }));
        }
    }, [newEvalData.classe_id]);

    const handleSaveGrades = useCallback(() => {
        if (!selectedEvaluation) return;

        if (studentsLoading) {
            toast({ title: "Attente", description: "Chargement de la liste des élèves en cours..." });
            return;
        }

        const notesPayload = Object.entries(grades).map(([eleveId, data]) => ({
            eleve_id: eleveId,
            valeur: data.absent ? 0 : (data.valeur === "" ? 0 : parseFloat(data.valeur)),
            absent: data.absent,
            appreciation: data.appreciation
        }));

        if (notesPayload.length === 0) {
            toast({ title: "Info", description: "Aucune note à enregistrer" });
            return;
        }

        saveGradesMutation.mutate({ evalId: selectedEvaluation.id, notes: notesPayload });
    }, [selectedEvaluation, studentsLoading, grades, saveGradesMutation, toast]);

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
                        <Button
                            className="ml-auto"
                            onClick={handleSaveGrades}
                            disabled={saveGradesMutation.isPending}
                        >
                            {saveGradesMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {!saveGradesMutation.isPending && <Save className="mr-2 h-4 w-4" />}
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
                                        <TableHead>Élève</TableHead>
                                        <TableHead className="w-32">Note</TableHead>
                                        <TableHead className="w-24 text-center">Absent</TableHead>
                                        <TableHead>Appréciation / Observation</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {studentsLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8">
                                                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                                            </TableCell>
                                        </TableRow>
                                    ) : studentsData?.eleves.map((eleve: any) => (
                                        <TableRow key={eleve.id}>
                                            <TableCell>
                                                <div className="font-medium">{eleve.utilisateur.nom} {eleve.utilisateur.prenom}</div>
                                                <div className="text-xs text-muted-foreground">{eleve.matricule}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    step="0.25"
                                                    min="0"
                                                    max={selectedEvaluation.note_sur}
                                                    className={`w-24 ${grades[eleve.id]?.absent ? 'bg-muted' : ''}`}
                                                    value={grades[eleve.id]?.valeur || ""}
                                                    onChange={(e) => setGrades({
                                                        ...grades,
                                                        [eleve.id]: { ...grades[eleve.id], valeur: e.target.value }
                                                    })}
                                                    disabled={grades[eleve.id]?.absent}
                                                />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Switch
                                                    checked={grades[eleve.id]?.absent || false}
                                                    onCheckedChange={(checked) => setGrades({
                                                        ...grades,
                                                        [eleve.id]: { ...grades[eleve.id], absent: checked, valeur: checked ? "0" : grades[eleve.id]?.valeur }
                                                    })}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    placeholder="Observation..."
                                                    value={grades[eleve.id]?.appreciation || ""}
                                                    onChange={(e) => setGrades({
                                                        ...grades,
                                                        [eleve.id]: { ...grades[eleve.id], appreciation: e.target.value }
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
                        <h1 className="text-3xl font-bold font-heading text-primary">Gestion des Notes</h1>
                        <p className="text-muted-foreground mt-1 text-lg">Créez des évaluations et saisissez les notes de vos classes.</p>
                    </div>
                    <Dialog open={newEvalOpen} onOpenChange={setNewEvalOpen}>
                        <DialogTrigger asChild>
                            <Button size="lg" className="shadow-lg">
                                <Plus className="mr-2 h-5 w-5" />
                                Nouvelle Évaluation
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-xl">Créer une évaluation</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-6 py-4">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Titre de l'évaluation</Label>
                                        <Input
                                            placeholder="Ex: Contrôle N°1"
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
                                                <SelectItem value="ORAL">Oral</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Classe</Label>
                                        <Select
                                            value={newEvalData.classe_id || ""}
                                            onValueChange={(v) => {
                                                const matieresForClass = mesCoursData?.filter((c: any) => String(c.classe_id) === String(v))
                                                    .map((c: any) => ({
                                                        id: String(c.matiere_id),
                                                        nom: c.matiere_nom,
                                                        code: c.matiere_code,
                                                        coefficient: c.matiere?.coefficient || 1
                                                    }))
                                                    .filter((val, i, a) => a.findIndex(t => t.id === val.id) === i) || [];

                                                const selectedMatiere = matieresForClass.length === 1 ? matieresForClass[0] : null;

                                                setNewEvalData(prev => ({
                                                    ...prev,
                                                    classe_id: v,
                                                    matiere_id: selectedMatiere ? selectedMatiere.id : "",
                                                    coefficient: selectedMatiere ? selectedMatiere.coefficient : prev.coefficient
                                                }));
                                            }}
                                        >
                                            <SelectTrigger><SelectValue placeholder="Choisir une classe" /></SelectTrigger>
                                            <SelectContent>
                                                {teacherClasses.map((c: any) => (
                                                    <SelectItem key={String(c.id)} value={String(c.id)}>{c.nom}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Matière</Label>
                                        <Select
                                            value={newEvalData.matiere_id || ""}
                                            onValueChange={(v) => {
                                                const m = availableMatieres.find(x => String(x.id) === String(v));
                                                setNewEvalData(prev => ({
                                                    ...prev,
                                                    matiere_id: v,
                                                    coefficient: m ? m.coefficient : prev.coefficient
                                                }));
                                            }}
                                            disabled={!newEvalData.classe_id}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choisir une matière" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableMatieres.map((m: any) => (
                                                    <SelectItem key={String(m.id)} value={String(m.id)} textValue={m.nom}>
                                                        <span className="font-mono text-xs bg-muted px-1 rounded mr-2">{m.code}</span>
                                                        {m.nom}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Période</Label>
                                        <Select
                                            value={newEvalData.periode_id || ""}
                                            onValueChange={(v) => setNewEvalData(prev => ({ ...prev, periode_id: v }))}
                                        >
                                            <SelectTrigger><SelectValue placeholder="Période..." /></SelectTrigger>
                                            <SelectContent>
                                                {periodesData?.periodes.map((p: Periode) => (
                                                    <SelectItem key={String(p.id)} value={String(p.id)}>{p.libelle}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Date</Label>
                                            <Input
                                                type="date"
                                                value={newEvalData.date_evaluation}
                                                onChange={(e) => setNewEvalData({ ...newEvalData, date_evaluation: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Coeff.</Label>
                                            <Input
                                                type="number"
                                                step="0.5"
                                                min="0.5"
                                                value={newEvalData.coefficient}
                                                onChange={(e) => setNewEvalData({ ...newEvalData, coefficient: parseFloat(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-end gap-4">
                                    <div className="flex-1 space-y-2">
                                        <Label>Barème (/)</Label>
                                        <Input
                                            type="number"
                                            value={newEvalData.note_sur}
                                            onChange={(e) => setNewEvalData({ ...newEvalData, note_sur: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <Button
                                        className="flex-1"
                                        onClick={handleCreateEvaluation}
                                        disabled={createEvalMutation.isPending}
                                    >
                                        {createEvalMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Créer l'évaluation
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {evalsLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                ) : evalsData?.evaluations.length === 0 ? (
                    <div className="text-center py-20 bg-muted/30 rounded-lg border-2 border-dashed">
                        <p className="text-muted-foreground">Aucune évaluation créée pour le moment.</p>
                        <Button variant="link" onClick={() => setNewEvalOpen(true)}>Créer votre première évaluation</Button>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {evalsData?.evaluations.map((evaluation) => (
                            <Card key={evaluation.id} className="cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all shadow-md group" onClick={() => setSelectedEvaluation(evaluation)}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="group-hover:text-primary transition-colors">{evaluation.titre}</CardTitle>
                                        <div className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase tracking-wider">
                                            {evaluation.type}
                                        </div>
                                    </div>
                                    <CardDescription className="flex flex-col gap-1 mt-1">
                                        <span className="font-semibold text-foreground">{evaluation.classe?.nom_classe}</span>
                                        <span>{evaluation.matiere?.nom_matiere}</span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-center mt-6">
                                        <div className="text-xs text-muted-foreground">
                                            {evaluation.periode?.libelle} • {new Date(evaluation.date_evaluation).toLocaleDateString()}
                                        </div>
                                        <Button variant="primary" size="sm" className="font-semibold px-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all active:scale-95">
                                            Saisir les notes
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

