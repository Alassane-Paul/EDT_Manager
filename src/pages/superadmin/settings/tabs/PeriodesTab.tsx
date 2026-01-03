import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { periodesApi, Periode, CreatePeriodeDto } from "@/api/periodes/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Trash2, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

export function PeriodesTab() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newPeriode, setNewPeriode] = useState<CreatePeriodeDto>({
        libelle: "",
        date_debut: "",
        date_fin: "",
        annee_scolaire: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1)
    });

    const { data, isLoading } = useQuery({
        queryKey: ["periodes"],
        queryFn: periodesApi.getAll
    });

    const createMutation = useMutation({
        mutationFn: periodesApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["periodes"] });
            toast({ title: "Succès", description: "Période créée avec succès" });
            setIsDialogOpen(false);
            setNewPeriode({
                ...newPeriode,
                libelle: "",
                date_debut: "",
                date_fin: ""
            });
        },
        onError: () => {
            toast({ title: "Erreur", description: "Impossible de créer la période", variant: "destructive" });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: periodesApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["periodes"] });
            toast({ title: "Succès", description: "Période supprimée" });
        },
        onError: () => {
            toast({ title: "Erreur", description: "Erreur lors de la suppression", variant: "destructive" });
        }
    });

    const toggleActiveMutation = useMutation({
        mutationFn: ({ id, actif }: { id: string, actif: boolean }) => periodesApi.update(id, { actif }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["periodes"] });
            toast({ title: "Mise à jour", description: "Statut de la période mis à jour" });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(newPeriode);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            Découpage de l'année scolaire
                        </CardTitle>
                        <CardDescription>
                            Gérez les trimestres ou semestres (Ex: Trimestre 1, Semestre 2).
                        </CardDescription>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Nouvelle Période
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Ajouter une période</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="libelle">Nom (Ex: Trimestre 1)</Label>
                                    <Input
                                        id="libelle"
                                        value={newPeriode.libelle}
                                        onChange={(e) => setNewPeriode({ ...newPeriode, libelle: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="date_debut">Date de début</Label>
                                        <Input
                                            id="date_debut"
                                            type="date"
                                            value={newPeriode.date_debut}
                                            onChange={(e) => setNewPeriode({ ...newPeriode, date_debut: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="date_fin">Date de fin</Label>
                                        <Input
                                            id="date_fin"
                                            type="date"
                                            value={newPeriode.date_fin}
                                            onChange={(e) => setNewPeriode({ ...newPeriode, date_fin: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="annee">Année Scolaire</Label>
                                    <Input
                                        id="annee"
                                        value={newPeriode.annee_scolaire}
                                        onChange={(e) => setNewPeriode({ ...newPeriode, annee_scolaire: e.target.value })}
                                        required
                                    />
                                </div>
                                <Button type="submit" disabled={createMutation.isPending} className="w-full">
                                    {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Créer
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center p-4"><Loader2 className="animate-spin h-6 w-6" /></div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Libellé</TableHead>
                                <TableHead>Dates</TableHead>
                                <TableHead>Année</TableHead>
                                <TableHead>Actif</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.periodes.map((periode: Periode) => (
                                <TableRow key={periode.id}>
                                    <TableCell className="font-medium">{periode.libelle}</TableCell>
                                    <TableCell>{periode.date_debut} au {periode.date_fin}</TableCell>
                                    <TableCell>{periode.annee_scolaire}</TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={periode.actif}
                                            onCheckedChange={(checked) => toggleActiveMutation.mutate({ id: periode.id, actif: checked })}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteMutation.mutate(periode.id)}
                                            className="text-destructive hover:text-destructive/90"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {data?.periodes.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        Aucune période configurée.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
