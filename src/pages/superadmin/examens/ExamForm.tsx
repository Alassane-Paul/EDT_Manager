import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Wand2, Sparkles } from "lucide-react";
import { SessionExamen, sessionsExamenApi } from "@/api/sessionsExamen/api";
import { useToast } from "@/hooks/use-toast";

interface ExamFormProps {
    classes: any[];
    matieres: any[];
    onSubmit: (data: any) => void;
    isPending: boolean;
    initialData?: Partial<SessionExamen>;
}

export function ExamForm({ classes, matieres, onSubmit, isPending, initialData }: ExamFormProps) {
    const { toast } = useToast();
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [formData, setFormData] = useState({
        titre: initialData?.titre || "",
        matiere_id: initialData?.matiere_id || "",
        classe_id: initialData?.classe_id || "",
        date_examen: initialData?.date_examen || "",
        heure_debut: initialData?.heure_debut || "",
        heure_fin: initialData?.heure_fin || "",
        duree_minutes: initialData?.duree_minutes || 120,
        type: initialData?.type || "COMPOSITION",
        coefficient: initialData?.coefficient || 2,
        instructions: initialData?.instructions || ""
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Auto-update duration when times change
    useEffect(() => {
        if (!isSuggesting && formData.heure_debut && formData.heure_fin) {
            const [h1, m1] = formData.heure_debut.split(':').map(Number);
            const [h2, m2] = formData.heure_fin.split(':').map(Number);

            let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
            if (diff > 0) {
                setFormData(prev => ({ ...prev, duree_minutes: diff }));
            }
        }
    }, [formData.heure_debut, formData.heure_fin, isSuggesting]);

    // Auto-update coefficient when matiere change
    useEffect(() => {
        if (formData.matiere_id) {
            const matiere = matieres.find(m => m.id === formData.matiere_id);
            if (matiere && matiere.coefficient) {
                setFormData(prev => ({ ...prev, coefficient: matiere.coefficient }));
            }
        }
    }, [formData.matiere_id, matieres]);

    const handleAutoTitle = () => {
        const matiere = matieres.find(m => m.id === formData.matiere_id);
        const classe = classes.find(c => c.id === formData.classe_id);

        if (matiere && formData.type) {
            const types: Record<string, string> = {
                'DEVOIR_SURVEILLE': 'DS',
                'COMPOSITION': 'Composition',
                'EXAMEN_BLANC': 'Examen Blanc',
                'CONTROLE_CONTINU': 'CC',
                'RATTRAPAGE': 'Rattrapage'
            };
            const typeLabel = types[formData.type] || formData.type;
            const newTitle = `${typeLabel} - ${matiere.nom_matiere}${classe ? ` (${classe.nom_classe})` : ''}`;
            setFormData(prev => ({ ...prev, titre: newTitle }));
        }
    };

    const handleSuggestSlot = async () => {
        if (!formData.classe_id || !formData.date_examen || !formData.duree_minutes) {
            toast({
                title: "Attention",
                description: "Veuillez sélectionner une classe, une date et une durée au préalable.",
                variant: "destructive"
            });
            return;
        }

        try {
            setIsSuggesting(true);
            const result = await sessionsExamenApi.suggestSlot({
                classe_id: formData.classe_id,
                date_examen: formData.date_examen,
                duree_minutes: formData.duree_minutes
            });

            setFormData(prev => ({
                ...prev,
                heure_debut: result.heure_debut,
                heure_fin: result.heure_fin
            }));

            toast({
                title: "Créneau trouvé",
                description: `Horaire proposé : ${result.heure_debut} - ${result.heure_fin}`
            });
        } catch (error: any) {
            toast({
                title: "Aucun créneau",
                description: error.response?.data?.error || "Impossible de trouver un créneau libre ce jour.",
                variant: "destructive"
            });
        } finally {
            setIsSuggesting(false);
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.titre) newErrors.titre = "Le titre est requis";
        if (!formData.date_examen) newErrors.date_examen = "La date est requise";

        const today = new Date().toISOString().split('T')[0];
        if (formData.date_examen < today) {
            newErrors.date_examen = "La date ne peut pas être dans le passé";
        }

        if (formData.heure_debut && formData.heure_fin) {
            if (formData.heure_fin <= formData.heure_debut) {
                newErrors.heure_fin = "L'heure de fin doit être après l'heure de début";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="titre">Titre</Label>
                <div className="flex gap-2">
                    <Input
                        id="titre"
                        value={formData.titre}
                        onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                        placeholder="Ex: Composition de Mathématiques"
                        className={errors.titre ? "border-destructive" : ""}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleAutoTitle}
                        title="Générer automatiquement le titre"
                    >
                        <Wand2 className="h-4 w-4" />
                    </Button>
                </div>
                {errors.titre && <p className="text-xs text-destructive">{errors.titre}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Classe</Label>
                    <Select
                        value={formData.classe_id}
                        onValueChange={(val) => setFormData({ ...formData, classe_id: val })}
                    >
                        <SelectTrigger><SelectValue placeholder="Choisir une classe" /></SelectTrigger>
                        <SelectContent>
                            {classes.map((c) => (
                                <SelectItem key={c.id} value={c.id}>{c.nom_classe}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Matière</Label>
                    <Select
                        value={formData.matiere_id}
                        onValueChange={(val) => setFormData({ ...formData, matiere_id: val })}
                    >
                        <SelectTrigger><SelectValue placeholder="Choisir une matière" /></SelectTrigger>
                        <SelectContent>
                            {matieres.map((m) => (
                                <SelectItem key={m.id} value={m.id}>{m.nom_matiere}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-y py-4 my-2">
                <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                        type="date"
                        value={formData.date_examen}
                        onChange={(e) => setFormData({ ...formData, date_examen: e.target.value })}
                        className={errors.date_examen ? "border-destructive" : ""}
                    />
                    {errors.date_examen && <p className="text-xs text-destructive">{errors.date_examen}</p>}
                </div>
                <div className="space-y-2">
                    <Label>Durée (min)</Label>
                    <Input
                        type="number"
                        value={formData.duree_minutes}
                        onChange={(e) => setFormData({ ...formData, duree_minutes: parseInt(e.target.value) })}
                    />
                </div>
                <div className="flex items-end pb-0.5">
                    <Button
                        type="button"
                        variant="secondary"
                        className="w-full bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
                        onClick={handleSuggestSlot}
                        disabled={isSuggesting}
                    >
                        {isSuggesting ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        Auto-planifier
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Heure début</Label>
                    <Input
                        type="time"
                        value={formData.heure_debut}
                        onChange={(e) => setFormData({ ...formData, heure_debut: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Heure fin</Label>
                    <Input
                        type="time"
                        value={formData.heure_fin}
                        onChange={(e) => setFormData({ ...formData, heure_fin: e.target.value })}
                        className={errors.heure_fin ? "border-destructive" : ""}
                    />
                    {errors.heure_fin && <p className="text-xs text-destructive">{errors.heure_fin}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                        value={formData.type}
                        onValueChange={(val) => setFormData({ ...formData, type: val as any })}
                    >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="DEVOIR_SURVEILLE">Devoir Surveillé</SelectItem>
                            <SelectItem value="COMPOSITION">Composition</SelectItem>
                            <SelectItem value="EXAMEN_BLANC">Examen Blanc</SelectItem>
                            <SelectItem value="CONTROLE_CONTINU">Contrôle Continu</SelectItem>
                            <SelectItem value="RATTRAPAGE">Rattrapage</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Coefficient</Label>
                    <Input
                        type="number"
                        step="0.25"
                        value={formData.coefficient}
                        onChange={(e) => setFormData({ ...formData, coefficient: parseFloat(e.target.value) })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Instructions</Label>
                <Textarea
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="Consignes pour les élèves..."
                />
            </div>

            <Button type="submit" disabled={isPending} className="w-full">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData?.id ? "Mettre à jour" : "Planifier l'examen"}
            </Button>
        </form>
    );
}
