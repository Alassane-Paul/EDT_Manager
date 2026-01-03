import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { examensApi, ExamenEnLigne, Question } from "@/api/examens/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Clock, Send, Loader2, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ExamRunner() {
    const { examenId } = useParams<{ examenId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [tentativeId, setTentativeId] = useState<string | null>(null);
    const [examen, setExamen] = useState<ExamenEnLigne | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [reponses, setReponses] = useState<Record<string, string>>({});
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const startMutation = useMutation({
        mutationFn: () => examensApi.startTentative(examenId!),
        onSuccess: (data) => {
            setTentativeId(data.tentative.id);
            setExamen(data.examen);
            setTimeRemaining(data.examen.duree_minutes * 60);
            toast({ title: "Examen démarré", description: "Bonne chance !" });
        },
        onError: () => {
            toast({ title: "Erreur", description: "Impossible de démarrer l'examen", variant: "destructive" });
        }
    });

    const submitMutation = useMutation({
        mutationFn: () => {
            const reponsesArray = Object.entries(reponses).map(([question_id, reponse]) => ({
                question_id,
                reponse
            }));
            return examensApi.submitReponses(tentativeId!, reponsesArray);
        },
        onSuccess: (data) => {
            setIsSubmitted(true);
            toast({
                title: "Examen soumis",
                description: `Note obtenue: ${data.note}/${examen?.note_totale}`
            });
        }
    });

    // Timer countdown
    useEffect(() => {
        if (!tentativeId || timeRemaining <= 0 || isSubmitted) return;

        const interval = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    // Auto-submit when time expires
                    submitMutation.mutate();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [tentativeId, timeRemaining, isSubmitted]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerChange = (questionId: string, value: string) => {
        setReponses({ ...reponses, [questionId]: value });
    };

    const handleSubmit = () => {
        if (Object.keys(reponses).length < (examen?.questions?.length || 0)) {
            if (!confirm("Vous n'avez pas répondu à toutes les questions. Voulez-vous vraiment soumettre ?")) {
                return;
            }
        }
        submitMutation.mutate();
    };

    if (!tentativeId) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center min-h-[80vh]">
                    <Card className="max-w-md w-full">
                        <CardHeader>
                            <CardTitle>Prêt à commencer ?</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Alert>
                                <AlertDescription>
                                    Une fois démarré, le chronomètre ne peut pas être mis en pause.
                                    L'examen sera automatiquement soumis à la fin du temps imparti.
                                </AlertDescription>
                            </Alert>
                            <Button
                                onClick={() => startMutation.mutate()}
                                disabled={startMutation.isPending}
                                className="w-full"
                            >
                                {startMutation.isPending ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                Démarrer l'examen
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    if (isSubmitted) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center min-h-[80vh]">
                    <Card className="max-w-md w-full text-center">
                        <CardContent className="pt-6 space-y-4">
                            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                            <h2 className="text-2xl font-bold">Examen soumis !</h2>
                            <p className="text-muted-foreground">
                                Vos réponses ont été enregistrées avec succès.
                            </p>
                            <Button onClick={() => navigate("/etudiant/cours")} className="mt-4">
                                Retour aux cours
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    const currentQuestion = examen?.questions?.[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / (examen?.questions?.length || 1)) * 100;

    return (
        <AppLayout>
            <div className="p-8 space-y-6">
                {/* Header with timer */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">{examen?.titre}</h1>
                        <p className="text-muted-foreground">
                            Question {currentQuestionIndex + 1} sur {examen?.questions?.length}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                            <Clock className="h-5 w-5" />
                            <span className="font-mono text-lg font-bold">{formatTime(timeRemaining)}</span>
                        </div>
                        <Button onClick={handleSubmit} disabled={submitMutation.isPending}>
                            {submitMutation.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="mr-2 h-4 w-4" />
                            )}
                            Soumettre
                        </Button>
                    </div>
                </div>

                <Progress value={progress} className="h-2" />

                {/* Question Card */}
                {currentQuestion && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {currentQuestion.enonce}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">{currentQuestion.points} points</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {currentQuestion.type === 'QCM' && currentQuestion.options && (
                                <RadioGroup
                                    value={reponses[currentQuestion.id] || ""}
                                    onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                                >
                                    {currentQuestion.options.map((option, idx) => (
                                        <div key={idx} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                                            <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                                            <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                                                {String.fromCharCode(65 + idx)}. {option.texte}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}

                            {currentQuestion.type === 'VRAI_FAUX' && (
                                <RadioGroup
                                    value={reponses[currentQuestion.id] || ""}
                                    onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                                >
                                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                                        <RadioGroupItem value="true" id="vrai" />
                                        <Label htmlFor="vrai" className="flex-1 cursor-pointer">Vrai</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer">
                                        <RadioGroupItem value="false" id="faux" />
                                        <Label htmlFor="faux" className="flex-1 cursor-pointer">Faux</Label>
                                    </div>
                                </RadioGroup>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Navigation */}
                <div className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                        disabled={currentQuestionIndex === 0}
                    >
                        Précédent
                    </Button>
                    <Button
                        onClick={() => setCurrentQuestionIndex(Math.min((examen?.questions?.length || 1) - 1, currentQuestionIndex + 1))}
                        disabled={currentQuestionIndex === (examen?.questions?.length || 1) - 1}
                    >
                        Suivant
                    </Button>
                </div>

                {/* Question Navigator */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Navigation rapide</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-10 gap-2">
                            {examen?.questions?.map((q, idx) => (
                                <Button
                                    key={q.id}
                                    variant={currentQuestionIndex === idx ? "default" : reponses[q.id] ? "secondary" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentQuestionIndex(idx)}
                                    className="w-full"
                                >
                                    {idx + 1}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
