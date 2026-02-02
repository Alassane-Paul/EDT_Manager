import React, { useState } from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
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
import { Textarea } from "@/components/ui/textarea";
import {
    ShieldCheck,
    Plus,
    Trash2,
    Calendar as CalendarIcon,
    UserPlus,
    Clock,
    User,
    Shield
} from "lucide-react";
import { useAccreditations, useCreateAccreditation, useDeleteAccreditation } from "@/hooks/useAccreditations";
import { useUsers } from "@/hooks/useUsers";
import { RoleUtilisateur } from "@/types/users";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

const MODULES = [
    { value: 'NOTES', label: 'Gestion des Notes', icon: '📝' },
    { value: 'ABSENCES', label: 'Gestion des Absences', icon: '📅' },
    { value: 'EMPLOI_TEMPS', label: 'Emploi du Temps', icon: '⏰' },
    { value: 'FACTURATION', label: 'Facturation & Paiements', icon: '💳' },
    { value: 'ELEVES', label: 'Gestion des Élèves', icon: '🎓' }
];

const AccreditationPage = () => {
    const { accreditations, isLoading: isAccLoading } = useAccreditations();
    const { users, isLoading: isUsersLoading } = useUsers({ role: RoleUtilisateur.RESPONSABLE_PEDAGOGIQUE }); // On cible les RP par défaut pour la délégation
    const createAccreditation = useCreateAccreditation();
    const deleteAccreditation = useDeleteAccreditation();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        utilisateur_id: '',
        module: '',
        date_debut: '',
        date_fin: '',
        description: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createAccreditation.mutateAsync(formData);
        setIsDialogOpen(false);
        setFormData({
            utilisateur_id: '',
            module: '',
            date_debut: '',
            date_fin: '',
            description: ''
        });
    };

    const getModuleLabel = (moduleValue: string) => {
        return MODULES.find(m => m.value === moduleValue)?.label || moduleValue;
    };

    const getStatusBadge = (accreditation: any) => {
        const now = new Date();
        const start = new Date(accreditation.date_debut);
        const end = new Date(accreditation.date_fin);

        if (now < start) return <Badge variant="outline" className="text-blue-500 border-blue-200 bg-blue-50">À venir</Badge>;
        if (now > end) return <Badge variant="secondary">Expiré</Badge>;
        return <Badge className="bg-green-500">Actif</Badge>;
    };

    return (
        <AppLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Accréditations & Délégations</h1>
                        <p className="text-muted-foreground">
                            Gérez les accès temporaires de votre personnel pour faire face aux surcharges de travail
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90">
                                <Plus className="mr-2 h-4 w-4" />
                                Nouvelle Accréditation
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <form onSubmit={handleSubmit}>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <ShieldCheck className="h-5 w-5 text-primary" />
                                        Accréditer un collaborateur
                                    </DialogTitle>
                                    <DialogDescription>
                                        Accordez un accès temporaire à un module spécifique.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="staff">Collaborateur</Label>
                                        <Select
                                            value={formData.utilisateur_id}
                                            onValueChange={(v) => setFormData(prev => ({ ...prev, utilisateur_id: v }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner un membre du staff" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {users.map((user: any) => (
                                                    <SelectItem key={user.id} value={user.id}>
                                                        {user.prenom} {user.nom} ({user.role})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="module">Module à déléguer</Label>
                                        <Select
                                            value={formData.module}
                                            onValueChange={(v) => setFormData(prev => ({ ...prev, module: v }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner un module" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {MODULES.map((m) => (
                                                    <SelectItem key={m.value} value={m.value}>
                                                        {m.icon} {m.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="start">Date de début</Label>
                                            <Input
                                                id="start"
                                                type="date"
                                                value={formData.date_debut}
                                                onChange={(e) => setFormData(prev => ({ ...prev, date_debut: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="end">Date de fin</Label>
                                            <Input
                                                id="end"
                                                type="date"
                                                value={formData.date_fin}
                                                onChange={(e) => setFormData(prev => ({ ...prev, date_fin: e.target.value }))}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="desc">Raison / Description (Optionnel)</Label>
                                        <Textarea
                                            id="desc"
                                            placeholder=""
                                            value={formData.description}
                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                                    <Button type="submit" disabled={createAccreditation.isPending}>
                                        {createAccreditation.isPending ? "Traitement..." : "Confirmer l'accréditation"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Main Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Accréditations actives et passées</CardTitle>
                        <CardDescription>
                            Liste des délégations accordées au sein de votre établissement.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isAccLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                            </div>
                        ) : accreditations.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Bénéficiaire</TableHead>
                                        <TableHead>Module</TableHead>
                                        <TableHead>Période</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {accreditations.map((acc: any) => (
                                        <TableRow key={acc.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-muted rounded-full">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-sm">
                                                            {acc.utilisateur?.prenom} {acc.utilisateur?.nom}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
                                                            {acc.utilisateur?.role}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-4 w-4 text-primary/60" />
                                                    <span className="text-sm font-semibold">{getModuleLabel(acc.module)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {format(new Date(acc.date_debut), 'dd MMM yyyy', { locale: fr })} - {format(new Date(acc.date_fin), 'dd MMM yyyy', { locale: fr })}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(acc)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => deleteAccreditation.mutate(acc.id)}
                                                    disabled={deleteAccreditation.isPending}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-12">
                                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                                <h3 className="text-lg font-medium">Aucune accréditation</h3>
                                <p className="text-muted-foreground">Vous n'avez pas encore délégué de modules.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default AccreditationPage;

