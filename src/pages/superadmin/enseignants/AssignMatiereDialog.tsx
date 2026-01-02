import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
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
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useMatieres } from "@/hooks/useMatieres";
import { authApi } from "@/api/auth/api"; // Assuming we might need auth token or similar if not handled in hook
import axiosInstance from "@/api/axios_instance"; // Or use a specific API function

interface AssignMatiereDialogProps {
    enseignantId: string;
    currentMatiereIds: string[];
    onSuccess: () => void;
}

export function AssignMatiereDialog({
    enseignantId,
    currentMatiereIds,
    onSuccess,
}: AssignMatiereDialogProps) {
    const [open, setOpen] = useState(false);
    const [selectedMatieres, setSelectedMatieres] = useState<string[]>([]);
    const { matieres, isLoading } = useMatieres();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const availableMatieres = matieres?.filter(
        (m) => !currentMatiereIds.includes(m.id)
    );

    const toggleMatiere = (matiereId: string) => {
        setSelectedMatieres((current) =>
            current.includes(matiereId)
                ? current.filter((id) => id !== matiereId)
                : [...current, matiereId]
        );
    };

    const handleSubmit = async () => {
        if (selectedMatieres.length === 0) return;

        setIsSubmitting(true);
        try {
            // Use direct axios call or a dedicated API function
            await axiosInstance.post(`/enseignants/${enseignantId}/assign-subjects`, {
                matiere_ids: [...currentMatiereIds, ...selectedMatieres],
            });

            toast({
                title: "Matières assignées",
                description: "Les matières ont été ajoutées avec succès à l'enseignant.",
            });
            setOpen(false);
            setSelectedMatieres([]);
            onSuccess();
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de l'assignation des matières.",
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
                    Assigner une matière
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Assigner des matières</DialogTitle>
                    <DialogDescription>
                        Sélectionnez les matières à ajouter à cet enseignant.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Command className="rounded-lg border shadow-md">
                        <CommandInput placeholder="Rechercher une matière..." />
                        <CommandList>
                            <CommandEmpty>Aucune matière trouvée.</CommandEmpty>
                            <CommandGroup>
                                {isLoading ? (
                                    <CommandItem disabled>Chargement...</CommandItem>
                                ) : (
                                    availableMatieres?.map((matiere) => (
                                        <CommandItem
                                            key={matiere.id}
                                            value={matiere.nom_matiere}
                                            onSelect={() => toggleMatiere(matiere.id)}
                                        >
                                            <div
                                                className={cn(
                                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                    selectedMatieres.includes(matiere.id)
                                                        ? "bg-primary text-primary-foreground"
                                                        : "opacity-50 [&_svg]:invisible"
                                                )}
                                            >
                                                <Check className={cn("h-4 w-4")} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="h-3 w-3 rounded-full"
                                                    style={{ backgroundColor: matiere.couleur_affichage }}
                                                />
                                                <span>{matiere.nom_matiere}</span>
                                                <span className="text-muted-foreground text-xs ml-1">
                                                    ({matiere.code_matiere})
                                                </span>
                                            </div>
                                        </CommandItem>
                                    ))
                                )}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {selectedMatieres.map((id) => {
                            const matiere = matieres?.find((m) => m.id === id);
                            return (
                                <div
                                    key={id}
                                    className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs flex items-center"
                                >
                                    {matiere?.nom_matiere}
                                    <button
                                        onClick={() => toggleMatiere(id)}
                                        className="ml-2 hover:text-destructive"
                                    >
                                        ×
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isSubmitting}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={selectedMatieres.length === 0 || isSubmitting}
                    >
                        {isSubmitting ? "Assignation..." : "Assigner"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
