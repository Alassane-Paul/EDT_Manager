import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursApi } from "@/api/cours/api";
import { examensApi, ExamenEnLigne, Question } from "@/api/examens/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Send, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function QuizCreator() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedCours, setSelectedCours] = useState<string>("");
    const [selectedExamen, setSelectedExamen] = useState<ExamenEnLigne | null>(null);
    const [newExamDialogOpen, setNewExamDialogOpen] = useState(false);
    const [questionDialogOpen, setQuestionDialogOpen] = useState(false);

    const { data: coursData } = useQuery({ queryKey: ["mes-cours"], queryFn: () => coursApi.getMesCours() });

    const { data: examensData } = useQuery({
        queryKey: ["examens", selectedCours],
        queryFn: () => examensApi.getByCours(selectedCours),
        enabled: !!selectedCours
    });

    const createExamMutation = useMutation({
        mutationFn: examensApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["examens"] });
            toast({ title: "Succès", description: "Examen créé" });
            setNewExamDialogOpen(false);
        }
    });

    const addQuestionMutation = useMutation({
        mutationFn: ({ examenId, question }: { examenId: string; question: Partial<Question> }) =>
            examensApi.addQuestion(examenId, question),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["examens"] });
            toast({ title: "Ajoutée", description: "Question ajoutée" });
            setQuestionDialogOpen(false);
        }
    });

    const publishMutation = useMutation({
        mutationFn: examensApi.publish,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["examens"] });
            toast({ title: "Publié", description: "Examen publié et accessible aux étudiants" });
        }
    });

    const handleCreateExam = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        createExamMutation.mutate({
            cours_id: selectedCours,
            titre: formData.get('titre') as string,
            description: formData.get('description') as string,
            duree_minutes: parseInt(formData.get('duree_minutes') as string),
            date_ouverture: formData.get('date_ouverture') as string,
            date_fermeture: formData.get('date_fermeture') as string,
            note_totale: 20
        });
    };

    const handleAddQuestion = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedExamen) return;

        const formData = new FormData(e.currentTarget);
        const type = formData.get('type') as 'QCM' | 'VRAI_FAUX';

        let options = undefined;
        let reponse_correcte = undefined;

        if (type === 'QCM') {
            options = [
                { texte: formData.get('option1') as string, correct: formData.get('correct') === '0' },
                { texte: formData.get('option2') as string, correct: formData.get('correct') === '1' },
                { texte: formData.get('option3') as string, correct: formData.get('correct') === '2' },
                { texte: formData.get('option4') as string, correct: formData.get('correct') === '3' }
            ];
        } else {
            reponse_correcte = formData.get('reponse_vf') as string;
        }

        addQuestionMutation.mutate({
            examenId: selectedExamen.id,
            question: {
                type,
                enonce: formData.get('enonce') as string,
                points: parseFloat(formData.get('points') as string),
                options,
                reponse_correcte,
                ordre: selectedExamen.questions?.length || 0
            }
        });
    };

    return (
        <AppLayout>
            <div className="p-8 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Créateur de Quiz</h1>
                    <p className="text-muted-foreground">Créez des examens en ligne pour vos cours.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Sélectionner un cours</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Select value={selectedCours} onValueChange={setSelectedCours}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choisir un cours" />
                            </SelectTrigger>
                            <SelectContent>
                                {coursData?.map((cours: any) => (
                                    <SelectItem key={cours.id} value={cours.id}>
                                        {cours.matiere.nom_matiere} - {cours.classe.nom_classe}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                {selectedCours && (
                    <>
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Mes Examens</h2>
                            <Dialog open={newExamDialogOpen} onOpenChange={setNewExamDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Nouvel Examen
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>Créer un examen</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleCreateExam} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Titre</Label>
                                            <Input name="titre" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Description</Label>
                                            <Textarea name="description" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Durée (minutes)</Label>
                                                <Input name="duree_minutes" type="number" min="0" defaultValue="60" required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Date ouverture</Label>
                                                <Input name="date_ouverture" type="datetime-local" required />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Date fermeture</Label>
                                            <Input name="date_fermeture" type="datetime-local" required />
                                        </div>
                                        <Button type="submit" disabled={createExamMutation.isPending} className="w-full">
                                            {createExamMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Créer
                                        </Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {examensData?.examens.map((examen: ExamenEnLigne) => (
                                <Card key={examen.id} className="cursor-pointer" onClick={() => setSelectedExamen(examen)}>
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle>{examen.titre}</CardTitle>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {examen.questions?.length || 0} questions • {examen.duree_minutes} min
                                                </p>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded ${examen.statut === 'PUBLIE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {examen.statut}
                                            </span>
                                        </div>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </>
                )}

                {selectedExamen && (
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>{selectedExamen.titre}</CardTitle>
                                <div className="flex gap-2">
                                    <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Ajouter Question
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl">
                                            <DialogHeader>
                                                <DialogTitle>Nouvelle Question</DialogTitle>
                                            </DialogHeader>
                                            <QuestionForm onSubmit={handleAddQuestion} isPending={addQuestionMutation.isPending} />
                                        </DialogContent>
                                    </Dialog>
                                    {selectedExamen.statut === 'BROUILLON' && (
                                        <Button onClick={() => publishMutation.mutate(selectedExamen.id)}>
                                            <Send className="mr-2 h-4 w-4" />
                                            Publier
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {selectedExamen.questions?.map((q, idx) => (
                                    <div key={q.id} className="p-4 border rounded-lg">
                                        <div className="flex justify-between">
                                            <div className="flex-1">
                                                <p className="font-medium">Q{idx + 1}. {q.enonce}</p>
                                                <p className="text-sm text-muted-foreground mt-1">{q.points} points • {q.type}</p>
                                                {q.options && (
                                                    <ul className="mt-2 space-y-1">
                                                        {q.options.map((opt, i) => (
                                                            <li key={i} className={`text-sm ${opt.correct ? 'text-green-600 font-medium' : ''}`}>
                                                                {String.fromCharCode(65 + i)}. {opt.texte}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!selectedExamen.questions || selectedExamen.questions.length === 0) && (
                                    <p className="text-center py-8 text-muted-foreground">Aucune question ajoutée.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

function QuestionForm({ onSubmit, isPending }: { onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; isPending: boolean }) {
    const [type, setType] = useState<'QCM' | 'VRAI_FAUX'>('QCM');

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as any)} name="type">
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="QCM">QCM</SelectItem>
                        <SelectItem value="VRAI_FAUX">Vrai/Faux</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>Énoncé</Label>
                <Textarea name="enonce" required />
            </div>
            <div className="space-y-2">
                <Label>Points</Label>
                <Input name="points" type="number" step="0.5" min="0" defaultValue="1" required />
            </div>

            {type === 'QCM' && (
                <>
                    <div className="space-y-2">
                        <Label>Options</Label>
                        {[1, 2, 3, 4].map((i) => (
                            <Input key={i} name={`option${i}`} placeholder={`Option ${i}`} required />
                        ))}
                    </div>
                    <div className="space-y-2">
                        <Label>Réponse correcte</Label>
                        <Select name="correct" defaultValue="0">
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Option 1</SelectItem>
                                <SelectItem value="1">Option 2</SelectItem>
                                <SelectItem value="2">Option 3</SelectItem>
                                <SelectItem value="3">Option 4</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </>
            )}

            {type === 'VRAI_FAUX' && (
                <div className="space-y-2">
                    <Label>Réponse correcte</Label>
                    <Select name="reponse_vf" defaultValue="true">
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="true">Vrai</SelectItem>
                            <SelectItem value="false">Faux</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            <Button type="submit" disabled={isPending} className="w-full">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ajouter
            </Button>
        </form>
    );
}
