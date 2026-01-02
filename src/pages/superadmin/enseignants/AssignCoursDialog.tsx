import { useState } from "react";
import { Plus } from "lucide-react";
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

interface AssignCoursDialogProps {
    enseignantId: string;
    enseignantMatieres: string[]; // IDs of matieres assigned to this teacher
    onSuccess: () => void;
}

export function AssignCoursDialog({
    enseignantId,
    enseignantMatieres,
    onSuccess,
}: AssignCoursDialogProps) {
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
        matiere_id: "",
        classe_id: "",
        salle_id: "",
        volume_horaire_hebdo: "",
        duree_seance_standard: "60",
        type_cours: "cours_magistral",
    });

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
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
            await axiosInstance.post("/cours", {
                ...formData,
                enseignant_id: enseignantId,
                volume_horaire_hebdo: parseInt(formData.volume_horaire_hebdo),
                duree_seance_standard: parseInt(formData.duree_seance_standard),
            });

            toast({
                title: "Cours créé",
                description: "Le cours a été créé avec succès.",
            });
            setOpen(false);
            setFormData({
                matiere_id: "",
                classe_id: "",
                salle_id: "",
                volume_horaire_hebdo: "",
                duree_seance_standard: "60",
                type_cours: "cours_magistral",
            });
            onSuccess();
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de créer le cours.",
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
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un cours
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Ajouter un nouveau cours</DialogTitle>
                    <DialogDescription>
                        Créez un cours pour cet enseignant. Assurez-vous d'avoir assigné la matière au préalable.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="matiere">Matière *</Label>
                            <Select
                                value={formData.matiere_id}
                                onValueChange={(val) => handleChange("matiere_id", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choisir une matière" />
                                </SelectTrigger>
                                <SelectContent>
                                    {validMatieres?.length === 0 ? (
                                        <SelectItem value="disabled" disabled>
                                            Aucune matière assignée
                                        </SelectItem>
                                    ) : (
                                        validMatieres?.map((m) => (
                                            <SelectItem key={m.id} value={m.id}>
                                                {m.nom_matiere}
                                            </SelectItem>
                                        ))
                                    )}
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
                                placeholder="ex: 120"
                                value={formData.volume_horaire_hebdo}
                                onChange={(e) => handleChange("volume_horaire_hebdo", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="duree">Durée scéance standard (minutes) *</Label>
                        <Input
                            id="duree"
                            type="number"
                            placeholder="ex: 60"
                            value={formData.duree_seance_standard}
                            onChange={(e) => handleChange("duree_seance_standard", e.target.value)}
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
                            {isSubmitting ? "Création..." : "Créer le cours"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
