import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClasses } from "@/hooks/useClasses";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Loader2, Calendar, CheckCircle2, AlertTriangle, Layers } from "lucide-react";
import { sessionsExamenApi } from "@/api/sessionsExamen/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function ExamGeneration() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { classes, isLoading: classesLoading } = useClasses();

    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<any>(null);

    const [formData, setFormData] = useState({
        classe_ids: [] as string[],
        date_debut: "",
        date_fin: "",
        type_examen: "COMPOSITION",
        max_examens_par_jour: 2
    });

    const toggleClasse = (id: string) => {
        setFormData(prev => ({
            ...prev,
            classe_ids: prev.classe_ids.includes(id)
                ? prev.classe_ids.filter(c => c !== id)
                : [...prev.classe_ids, id]
        }));
    };

    const selectAllClasses = () => {
        if (classes) {
            setFormData(prev => ({
                ...prev,
                classe_ids: classes.map((c: any) => c.id)
            }));
        }
    };

    const deselectAllClasses = () => {
        setFormData(prev => ({ ...prev, classe_ids: [] }));
    };

    const handleGenerate = async () => {
        if (formData.classe_ids.length === 0 || !formData.date_debut || !formData.date_fin) {
            toast.error("Veuillez remplir tous les champs obligatoires.");
            return;
        }

        try {
            setIsGenerating(true);
            const response = await sessionsExamenApi.bulkGenerate({
                etablissement_id: (user as any)?.establishmentId || "",
                ...formData
            });

            setResult(response);
            toast.success("Génération terminée avec succès !");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Erreur lors de la génération");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 p-4 md:p-8">
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-white dark:hover:bg-slate-800 shadow-sm">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                                    Assistant de Planification
                                </h1>
                                <p className="text-muted-foreground flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-amber-500" />
                                    Générez automatiquement un calendrier d'examens complet
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Configuration Form */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md overflow-hidden">
                                <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                                <CardHeader>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-blue-500" />
                                        Paramètres de l'examen
                                    </CardTitle>
                                    <CardDescription>Définissez la période et le type d'examen.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Date de début</Label>
                                            <Input
                                                type="date"
                                                className="focus-visible:ring-blue-500"
                                                value={formData.date_debut}
                                                onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Date de fin</Label>
                                            <Input
                                                type="date"
                                                className="focus-visible:ring-blue-500"
                                                value={formData.date_fin}
                                                onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Type d'examen</Label>
                                            <Select
                                                value={formData.type_examen}
                                                onValueChange={(val) => setFormData({ ...formData, type_examen: val })}
                                            >
                                                <SelectTrigger className="focus:ring-blue-500">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="DEVOIR_SURVEILLE">Devoir Surveillé (DS)</SelectItem>
                                                    <SelectItem value="COMPOSITION">Composition Trimestrielle</SelectItem>
                                                    <SelectItem value="EXAMEN_BLANC">Examen Blanc</SelectItem>
                                                    <SelectItem value="CONTROLE_CONTINU">Contrôle Continu (CC)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Examens max par jour</Label>
                                            <Select
                                                value={formData.max_examens_par_jour.toString()}
                                                onValueChange={(val) => setFormData({ ...formData, max_examens_par_jour: parseInt(val) })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1">1 examen / jour</SelectItem>
                                                    <SelectItem value="2">2 examens / jour</SelectItem>
                                                    <SelectItem value="3">3 examens / jour</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-base font-semibold">Classes concernées</Label>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={selectAllClasses} className="text-xs">Tout cocher</Button>
                                                <Button variant="outline" size="sm" onClick={deselectAllClasses} className="text-xs">Tout décocher</Button>
                                            </div>
                                        </div>

                                        {classesLoading ? (
                                            <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                                        ) : (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {classes?.map((c: any) => (
                                                    <div
                                                        key={c.id}
                                                        onClick={() => toggleClasse(c.id)}
                                                        className={`
                                                            p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-2
                                                            ${formData.classe_ids.includes(c.id)
                                                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                                                : "border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"}
                                                        `}
                                                    >
                                                        <div className={`
                                                            w-4 h-4 rounded-full border-2 flex items-center justify-center
                                                            ${formData.classe_ids.includes(c.id) ? "bg-blue-500 border-blue-500" : "border-slate-300"}
                                                        `}>
                                                            {formData.classe_ids.includes(c.id) && <CheckCircle2 className="h-3 w-3 text-white" />}
                                                        </div>
                                                        <span className="text-sm font-medium">{c.nom_classe}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Button
                                className="w-full py-8 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20 rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99]"
                                onClick={handleGenerate}
                                disabled={isGenerating}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                                        Génération en cours...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="mr-3 h-6 w-6" />
                                        Lancer la génération assistée
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Status & Results */}
                        <div className="space-y-6">
                            <Card className="border-none shadow-lg bg-slate-900 text-white overflow-hidden">
                                <CardHeader className="pb-2">
                                    <div className="bg-blue-500/10 w-fit p-2 rounded-lg mb-2">
                                        <Layers className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <CardTitle>Règles de génération</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-slate-400 space-y-4">
                                    <div className="flex gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                                        <p>Analyse de toutes les matières actives par classe.</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                                        <p>Chronologie intelligente : les matières sont réparties uniformément.</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                                        <p>Respect des horaires d'ouverture de l'établissement.</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                                        <p>Insertion automatique de pauses de 30 min entre les sessions.</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {result && (
                                <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-900/50 shadow-md">
                                    <CardHeader>
                                        <CardTitle className="text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                                            <CheckCircle2 className="h-5 w-5" />
                                            Terminé !
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 text-emerald-900 dark:text-emerald-300">
                                        <div className="text-3xl font-bold">
                                            {result.total_created}
                                            <span className="text-sm font-normal ml-2">Sessions créées</span>
                                        </div>

                                        {result.warnings?.length > 0 && (
                                            <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-lg text-xs text-amber-800 dark:text-amber-300 flex gap-2">
                                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                                <div className="space-y-1">
                                                    <p className="font-semibold text-amber-900 dark:text-amber-200">Attention :</p>
                                                    {result.warnings.map((w: string, i: number) => (
                                                        <p key={i}>• {w}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <Button
                                            variant="secondary"
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                                            onClick={() => navigate("/gestion/examens-presentiel")}
                                        >
                                            Voir le calendrier
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

const Wand2 = (props: any) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.21 1.21 0 0 0 1.72 0L21.64 5.36a1.21 1.21 0 0 0 0-1.72Z" />
        <path d="m14 7 3 3" />
        <path d="M5 6v4" />
        <path d="M19 14v4" />
        <path d="M10 2v2" />
        <path d="M7 8H3" />
        <path d="M21 16h-4" />
        <path d="M11 3H9" />
    </svg>
)
