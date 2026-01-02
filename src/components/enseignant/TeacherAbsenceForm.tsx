import { useState } from "react";
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
import { CalendarIcon, Loader2, Plus } from "lucide-react";

export function TeacherAbsenceForm() {
    const [open, setOpen] = useState(false);
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

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
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Déclarer une absence
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Déclarer une absence</DialogTitle>
                    <DialogDescription>
                        Remplissez ce formulaire pour signaler une absence. Elle sera soumise pour validation.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">

                    <div className="grid gap-2">
                        <Label htmlFor="cours">Cours impacté</Label>
                        <Select
                            value={formData.cours_id}
                            onValueChange={(value) => setFormData({ ...formData, cours_id: value })}
                            disabled={isLoadingCours}
                        >
                            <SelectTrigger id="cours">
                                <SelectValue placeholder="Sélectionner un cours" />
                            </SelectTrigger>
                            <SelectContent>
                                {mesCours?.map((c: any) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.matiere_nom || c.matiere?.nom_matiere} ({c.classe_nom || c.classe?.nom_classe})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="date_debut">Date début</Label>
                            <Input
                                id="date_debut"
                                type="date"
                                required
                                value={formData.date_debut}
                                onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="heure_debut">Heure début</Label>
                            <Input
                                id="heure_debut"
                                type="time"
                                required
                                value={formData.heure_debut}
                                onChange={(e) => setFormData({ ...formData, heure_debut: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="date_fin">Date fin</Label>
                            <Input
                                id="date_fin"
                                type="date"
                                required
                                value={formData.date_fin}
                                onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="heure_fin">Heure fin</Label>
                            <Input
                                id="heure_fin"
                                type="time"
                                required
                                value={formData.heure_fin}
                                onChange={(e) => setFormData({ ...formData, heure_fin: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="motif">Motif de l'absence</Label>
                        <Textarea
                            id="motif"
                            required
                            placeholder="Raison de votre absence..."
                            value={formData.motif}
                            onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="code">Code (Optionnel)</Label>
                        <Input
                            id="code"
                            placeholder="Code justificatif si applicable"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isDeclaring}>
                            {isDeclaring && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Déclarer
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
