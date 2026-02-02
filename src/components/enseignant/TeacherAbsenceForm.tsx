import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTeacherAbsences } from "@/hooks/useTeacherAbsences";
import { useMesCours } from "@/hooks/useCours";
import {
    CalendarIcon,
    Loader2,
    Plus,
    AlertCircle,
    Info,
    Clock,
    BookOpen,
    FileText,
    Stethoscope,
    Users,
    Plane
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const MOTIF_PRESETS = [
    { id: "sante", label: "Santé / Médical", icon: Stethoscope },
    { id: "famille", label: "Urgence familiale", icon: Users },
    { id: "pro", label: "Mission Pro / Stage", icon: Plane },
    { id: "autre", label: "Autre motif", icon: FileText },
];

export function TeacherAbsenceForm() {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        cours_id: "",
        date_debut: "",
        heure_debut: "08:00",
        date_fin: "",
        heure_fin: "18:00",
        motif: "",
        code: "",
    });

    const { declareAbsence, isDeclaring } = useTeacherAbsences();
    const { cours: mesCours, isLoading: isLoadingCours } = useMesCours();

    // Reset error when form changes
    useEffect(() => {
        if (error) setError(null);
    }, [formData]);

    const handlePresetSelect = (presetLabel: string) => {
        setFormData(prev => ({ ...prev, motif: presetLabel }));
    };

    const validateForm = () => {
        if (!formData.cours_id) return "Veuillez sélectionner un cours.";
        if (!formData.date_debut || !formData.date_fin) return "Veuillez renseigner les dates.";

        const start = new Date(`${formData.date_debut}T${formData.heure_debut}`);
        const end = new Date(`${formData.date_fin}T${formData.heure_fin}`);

        if (end <= start) return "La date de fin doit être postérieure à la date de début.";
        if (formData.motif.length < 5) return "Le motif doit faire au moins 5 caractères.";

        return null;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        // Combine date and time
        const startDateTime = `${formData.date_debut} ${formData.heure_debut}:00`;
        const endDateTime = `${formData.date_fin} ${formData.heure_fin}:00`;

        declareAbsence(
            {
                cours_id: formData.cours_id,
                date_debut: startDateTime,
                date_fin: endDateTime,
                motif: formData.motif,
                code: formData.code,
            },
            {
                onSuccess: () => {
                    setOpen(false);
                    setFormData({
                        cours_id: "",
                        date_debut: "",
                        heure_debut: "08:00",
                        date_fin: "",
                        heure_fin: "18:00",
                        motif: "",
                        code: "",
                    });
                    setError(null);
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="font-semibold shadow-sm transition-all hover:shadow-md">
                    <Plus className="mr-2 h-4 w-4" />
                    Déclarer une absence
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] gap-6 p-8">
                <DialogHeader className="gap-2">
                    <DialogTitle className="text-lg font-bold flex items-center gap-2 tracking-tight">
                        <AlertCircle className="h-5 w-5 text-primary" />
                        Déclaration d'Absence
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Veuillez signaler votre absence pour permettre la réorganisation des cours.
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive" className="py-2 px-3 border-destructive/20 bg-destructive/5">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="text-xs font-bold uppercase tracking-wider">Erreur de saisie</AlertTitle>
                        <AlertDescription className="text-xs opacity-90">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Cours section */}
                    <div className="space-y-2">
                        <Label htmlFor="cours" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <BookOpen className="h-3 w-3" />
                            Cours Impacté
                        </Label>
                        <Select
                            value={formData.cours_id}
                            onValueChange={(value) => setFormData({ ...formData, cours_id: value })}
                            disabled={isLoadingCours}
                        >
                            <SelectTrigger id="cours" className="w-full h-10 border-border/60 bg-background focus:ring-1 focus:ring-primary/40">
                                <SelectValue placeholder="Sélectionner le cours concerné" />
                            </SelectTrigger>
                            <SelectContent className="font-sans">
                                {mesCours?.map((c: any) => (
                                    <SelectItem key={c.id} value={c.id} className="cursor-pointer py-2">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm">{c.matiere_nom || c.matiere?.nom_matiere}</span>
                                            <span className="text-[10px] text-muted-foreground uppercase">{c.classe_nom || c.classe?.nom_classe}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Dates/Times group */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <CalendarIcon className="h-3 w-3" />
                                Début
                            </Label>
                            <div className="space-y-2">
                                <Input
                                    type="date"
                                    required
                                    className="h-9 text-xs border-border/60"
                                    value={formData.date_debut}
                                    onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                                />
                                <div className="flex items-center gap-2 bg-muted/30 rounded-md border border-border/40 px-3 h-9">
                                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        type="time"
                                        className="border-0 focus-visible:ring-0 p-0 h-full text-xs bg-transparent"
                                        value={formData.heure_debut}
                                        onChange={(e) => setFormData({ ...formData, heure_debut: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <CalendarIcon className="h-3 w-3" />
                                Fin
                            </Label>
                            <div className="space-y-2">
                                <Input
                                    type="date"
                                    required
                                    className="h-9 text-xs border-border/60"
                                    value={formData.date_fin}
                                    onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                                />
                                <div className="flex items-center gap-2 bg-muted/30 rounded-md border border-border/40 px-3 h-9">
                                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        type="time"
                                        className="border-0 focus-visible:ring-0 p-0 h-full text-xs bg-transparent"
                                        value={formData.heure_fin}
                                        onChange={(e) => setFormData({ ...formData, heure_fin: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Motif section */}
                    <div className="space-y-3">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <FileText className="h-3 w-3" />
                            Motif & Justification
                        </Label>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {MOTIF_PRESETS.map((preset) => (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => handlePresetSelect(preset.label)}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-2 rounded-lg border text-[10px] font-semibold transition-all gap-1.5",
                                        formData.motif === preset.label
                                            ? "bg-primary/10 border-primary text-primary"
                                            : "bg-background border-dashed text-muted-foreground hover:border-muted-foreground/50"
                                    )}
                                >
                                    <preset.icon className="h-3.5 w-3.5" />
                                    <span>{preset.label.split(' ')[0]}</span>
                                </button>
                            ))}
                        </div>

                        <Textarea
                            placeholder="Veuillez détailler la raison de votre absence..."
                            required
                            className="min-h-[100px] resize-none border-border/60 focus:ring-primary/20 text-sm leading-relaxed"
                            value={formData.motif}
                            onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                        />

                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <Input
                                    placeholder="Code justificatif (si applicable)"
                                    className="h-9 text-xs pl-8 border-border/60"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                />
                                <Info className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground/60" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground/60">Optionnel</span>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/40 mt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            className="text-xs"
                            onClick={() => setOpen(false)}
                            disabled={isDeclaring}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8"
                            disabled={isDeclaring}
                        >
                            {isDeclaring ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                "Déclarer"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
