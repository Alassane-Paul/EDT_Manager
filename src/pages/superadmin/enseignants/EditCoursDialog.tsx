import { useState, useEffect } from "react";
import { Edit } from "lucide-react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMatieres } from "@/hooks/useMatieres";
import { useClasses } from "@/hooks/useClasses";
import { useSalles } from "@/hooks/useSalles";
import axiosInstance from "@/api/axios_instance";

interface EditCoursDialogProps {
    cours: any;
    enseignantMatieres: string[]; // IDs of matieres assigned to this teacher
    onSuccess: () => void;
}

export function EditCoursDialog({
    cours,
    enseignantMatieres,
    onSuccess,
}: EditCoursDialogProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const { matieres: allMatieres } = useMatieres();
    const { classes } = useClasses();
    const { salles } = useSalles();

    // Filter matieres to only show those assigned to the teacher
    const validMatieres = allMatieres?.filter((m) =>
        enseignantMatieres.includes(m.id)
    );

    const [formData, setFormData] = useState({
        matiere_id: cours.matiere_id,
        classe_id: cours.classe_id,
        salle_id: cours.salle_id || "none",
        volume_horaire_hebdo: cours.volume_horaire_hebdo.toString(),
        duree_seance_standard: cours.duree_seance_standard.toString(),
        type_cours: cours.type_cours,
    });

    useEffect(() => {
        if (open) {
            setFormData({
                matiere_id: cours.matiere_id,
                classe_id: cours.classe_id,
                salle_id: cours.salle_id || "none",
                volume_horaire_hebdo: cours.volume_horaire_hebdo.toString(),
                duree_seance_standard: cours.duree_seance_standard.toString(),
                type_cours: cours.type_cours,
            });
        }
    }, [open, cours]);

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleMatiereChange = (matiereId: string) => {
        const selectedMatiere = validMatieres?.find(m => m.id === matiereId);
        if (selectedMatiere) {
            setFormData(prev => ({
                ...prev,
                matiere_id: matiereId,
                type_cours: selectedMatiere.type_cours,
                volume_horaire_hebdo: selectedMatiere.volume_horaire_hebdo.toString(),
                duree_seance_standard: selectedMatiere.duree_standard.toString()
            }));
        } else {
            handleChange("matiere_id", matiereId);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.matiere_id || !formData.classe_id || !formData.volume_horaire_hebdo) {
            toast({
                title: "Erreur",
                description: "Veuillez remplir les champs obligatoires",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await axiosInstance.put(`/cours/${cours.id}`, {
                ...formData,
                salle_id: formData.salle_id === "none" ? null : formData.salle_id,
                volume_horaire_hebdo: parseInt(formData.volume_horaire_hebdo),
                duree_seance_standard: parseInt(formData.duree_seance_standard),
            });

            toast({
                title: "Cours mis à jour",
                description: "Le cours a été mis à jour avec succès.",
            });
            setOpen(false);
            onSuccess();
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || "Impossible de mettre à jour le cours.";
            toast({
                title: "Erreur",
                description: errorMsg,
                variant: "destructive",
            });
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-blue-100 dark:hover:bg-blue-900">
                    <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Modifier le cours</DialogTitle>
                    <DialogDescription>
                        Modifiez les détails de ce cours assigné.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="matiere">Matière *</Label>
                            <Select
                                value={formData.matiere_id}
                                onValueChange={handleMatiereChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choisir une matière" />
                                </SelectTrigger>
                                <SelectContent>
                                    {validMatieres?.map((m) => (
                                        <SelectItem key={m.id} value={m.id}>
                                            {m.nom_matiere}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="classe">Classe *</Label>
                            <Select
                                value={formData.classe_id}
                                onValueChange={(val) => handleChange("classe_id", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choisir une classe" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes?.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.nom_classe}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Type de cours</Label>
                            <Select
                                value={formData.type_cours}
                                onValueChange={(val) => handleChange("type_cours", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cours_magistral">Cours Magistral (CM)</SelectItem>
                                    <SelectItem value="td">Travaux Dirigés (TD)</SelectItem>
                                    <SelectItem value="tp">Travaux Pratiques (TP)</SelectItem>
                                    <SelectItem value="atelier">Atelier</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="volume">Volume horaire (min/semaine) *</Label>
                            <Input
                                id="volume"
                                type="number"
                                placeholder=""
                                value={formData.volume_horaire_hebdo}
                                onChange={(e) => handleChange("volume_horaire_hebdo", e.target.value)}
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="duree">Durée scéance standard (minutes) *</Label>
                        <Input
                            id="duree"
                            type="number"
                            placeholder=""
                            value={formData.duree_seance_standard}
                            onChange={(e) => handleChange("duree_seance_standard", e.target.value)}
                            min="0"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="salle">Salle (Optionnel)</Label>
                        <Select
                            value={formData.salle_id}
                            onValueChange={(val) => handleChange("salle_id", val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Choisir une salle" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Aucune salle</SelectItem>
                                {salles?.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                        {s.nom_salle} ({s.batiment})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isSubmitting}
                        >
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Mise à jour..." : "Mettre à jour"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
