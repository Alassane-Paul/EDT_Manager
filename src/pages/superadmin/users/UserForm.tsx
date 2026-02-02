import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser, useCreateUser, useUpdateUser } from "@/hooks/useUsers";
import { RoleUtilisateur, UserFormData } from "@/types/users";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useEtablissements } from "@/hooks/useEtablissements";
import { useClasses } from "@/hooks/useClasses";
import { useCreateEnseignant, useUpdateEnseignant, useEnseignants } from "@/hooks/useEnseignants";
import { useCreateEleve, useUpdateEleve, useEleves } from "@/hooks/useEleves";
import { useCreateDirecteur, useUpdateDirecteur, useDirecteurs } from "@/hooks/useDirecteurs";
import { useCreateResponsable, useUpdateResponsable, useResponsables } from "@/hooks/useResponsables";
import { StatutProfessionnel, PreferenceHoraire } from "@/types/enseignants";
import { useAuth } from "@/contexts/AuthContext";

export default function UserForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = !!id;

    const { data: user, isLoading: isUserLoading } = useUser(id!);
    const { user: currentUser } = useAuth();
    const { etablissements } = useEtablissements();
    const { classes } = useClasses();

    const isAdmin = currentUser?.role === "admin";
    const filteredEtablissements = isAdmin
        ? etablissements || []
        : (etablissements || []).filter(e => e.id === currentUser?.establishmentId);

    // Hooks pour les sous-entités
    const createUser = useCreateUser();
    const updateUser = useUpdateUser();
    const createEnseignant = useCreateEnseignant();
    const updateEnseignant = useUpdateEnseignant();
    const createEleve = useCreateEleve();
    const updateEleve = useUpdateEleve();
    const createDirecteur = useCreateDirecteur();
    const updateDirecteur = useUpdateDirecteur();
    const createRP = useCreateResponsable();
    const updateRP = useUpdateResponsable();

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<any>({
        defaultValues: {
            role: RoleUtilisateur.ETUDIANT,
            actif: true,
            // Valeurs par défaut pour les sous-entités si besoin
            statut: StatutProfessionnel.CONTRACTUEL,
            heures_contractuelles_hebdo: 1200,
            preference_horaire: PreferenceHoraire.INDIFFERENT
        }
    });

    const selectedRole = watch("role");

    useEffect(() => {
        if (user && isEditing) {
            setValue("email", user.email);
            setValue("nom", user.nom);
            setValue("prenom", user.prenom);
            setValue("telephone", user.telephone || "");
            setValue("role", user.role);
            setValue("actif", user.actif);
            setValue("etablissement_id", user.etablissement_id);
            setValue("photo_url", user.photo_url || "");

            // Charger les données de la sous-entité si elle existe
            if (user.enseignant) {
                setValue("matricule", user.enseignant.matricule);
                setValue("statut", user.enseignant.statut);
                setValue("date_embauche", user.enseignant.date_embauche);
                setValue("heures_contractuelles_hebdo", user.enseignant.heures_contractuelles_hebdo);
            } else if (user.eleve) {
                setValue("matricule", user.eleve.matricule);
                setValue("classe_id", user.eleve.classe_id);
                setValue("date_naissance", user.eleve.date_naissance);
            } else if (user.directeur) {
                setValue("matricule", user.directeur.matricule);
                setValue("date_nomination", user.directeur.date_nomination);
            } else if (user.responsablePedagogique) {
                setValue("matricule", user.responsablePedagogique.matricule);
                setValue("date_prise_fonction", user.responsablePedagogique.date_prise_fonction);
            }
        }
    }, [user, isEditing, setValue]);

    const onSubmit = async (data: any) => {
        try {
            let userResult;
            if (isEditing) {
                userResult = await updateUser.mutateAsync({ id: id!, data });
            } else {
                userResult = await createUser.mutateAsync(data);
            }

            const userId = isEditing ? id! : userResult.id;

            // Gérer les sous-entités
            if (selectedRole === RoleUtilisateur.ENSEIGNANT) {
                const enseignantData = {
                    utilisateur_id: userId,
                    matricule: data.matricule,
                    statut: data.statut,
                    date_embauche: data.date_embauche,
                    heures_contractuelles_hebdo: data.heures_contractuelles_hebdo,
                    heures_max_journalieres: 480,
                    cours_consecutifs_max: 4,
                    preference_horaire: data.preference_horaire || PreferenceHoraire.INDIFFERENT,
                    multi_sites: data.multi_sites || false,
                    etablissement_id: data.etablissement_id
                };
                if (user?.enseignant) {
                    await updateEnseignant.mutateAsync({ id: user.enseignant.id, data: enseignantData });
                } else {
                    await createEnseignant.mutateAsync(enseignantData);
                }
            } else if (selectedRole === RoleUtilisateur.ETUDIANT) {
                const eleveData = {
                    utilisateur_id: userId,
                    matricule: data.matricule,
                    classe_id: data.classe_id,
                    date_naissance: data.date_naissance,
                    etablissement_id: data.etablissement_id
                };
                if (user?.eleve) {
                    await updateEleve.mutateAsync({ id: user.eleve.id, data: eleveData });
                } else {
                    await createEleve.mutateAsync(eleveData);
                }
            } else if (selectedRole === RoleUtilisateur.DIRECTEUR) {
                const dirData = {
                    utilisateur_id: userId,
                    matricule: data.matricule,
                    date_nomination: data.date_nomination,
                    etablissement_id: data.etablissement_id
                };
                if (user?.directeur) {
                    await updateDirecteur.mutateAsync({ id: user.directeur.id, data: dirData });
                } else {
                    await createDirecteur.mutateAsync(dirData);
                }
            } else if (selectedRole === RoleUtilisateur.RESPONSABLE_PEDAGOGIQUE) {
                const rpData = {
                    utilisateur_id: userId,
                    matricule: data.matricule,
                    date_prise_fonction: data.date_prise_fonction,
                    etablissement_id: data.etablissement_id
                };
                if (user?.responsablePedagogique) {
                    await updateRP.mutateAsync({ id: user.responsablePedagogique.id, data: rpData });
                } else {
                    await createRP.mutateAsync(rpData);
                }
            }

            navigate("/admin/utilisateurs");
        } catch (error) {
            console.error("Erreur lors de la sauvegarde:", error);
        }
    };

    if (isEditing && isUserLoading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="space-y-8 p-4 md:p-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/admin/utilisateurs")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">
                            {isEditing ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
                        </h1>
                        <p className="text-muted-foreground">
                            {isEditing ? "Modifiez les informations du compte utilisateur" : "Créez un nouveau compte utilisateur dans le système"}
                        </p>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto space-y-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations personnelles</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="prenom">Prénom</Label>
                                        <Input id="prenom" {...register("prenom", { required: "Prénom requis" })} placeholder="" />
                                        {errors.prenom && <p className="text-xs text-destructive">{errors.prenom.message as string}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="nom">Nom</Label>
                                        <Input id="nom" {...register("nom", { required: "Nom requis" })} placeholder="" />
                                        {errors.nom && <p className="text-xs text-destructive">{errors.nom.message as string}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" {...register("email", { required: "Email requis" })} placeholder="" />
                                        {errors.email && <p className="text-xs text-destructive">{errors.email.message as string}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="telephone">Téléphone</Label>
                                        <Input id="telephone" {...register("telephone")} placeholder="" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="photo_url">URL de la photo (optionnel)</Label>
                                    <Input id="photo_url" {...register("photo_url")} placeholder="" />
                                </div>

                                {!isEditing && (
                                    <div className="space-y-2">
                                        <Label htmlFor="mot_de_passe">Mot de passe</Label>
                                        <Input id="mot_de_passe" type="password" {...register("mot_de_passe", { required: !isEditing })} />
                                        {errors.mot_de_passe && <p className="text-xs text-destructive">{errors.mot_de_passe.message as string}</p>}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                    <div className="space-y-2">
                                        <Label>Rôle</Label>
                                        <Select
                                            value={watch("role")}
                                            onValueChange={(v) => setValue("role", v as RoleUtilisateur)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner un rôle" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(RoleUtilisateur).map((role) => (
                                                    <SelectItem key={role} value={role}>{role}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2 flex items-center pt-6 px-2">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="actif"
                                                checked={watch("actif")}
                                                onCheckedChange={(checked) => setValue("actif", checked)}
                                            />
                                            <Label htmlFor="actif" className="cursor-pointer">Utilisateur actif</Label>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Établissement</Label>
                                    <Select
                                        value={watch("etablissement_id")}
                                        onValueChange={(v) => setValue("etablissement_id", v)}
                                        disabled={!isAdmin}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner un établissement" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredEtablissements?.map((etab: any) => (
                                                <SelectItem key={etab.id} value={etab.id}>{etab.nom}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Sections spécifiques selon le rôle */}
                        {selectedRole && selectedRole !== RoleUtilisateur.ADMIN && selectedRole !== RoleUtilisateur.PERSONNEL && (
                            <Card className="border-primary/20">
                                <CardHeader>
                                    <CardTitle className="text-lg">Détails spécifiques au rôle : {selectedRole}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="matricule">Matricule *</Label>
                                        <Input id="matricule" {...register("matricule", { required: selectedRole !== RoleUtilisateur.ADMIN })} placeholder="" />
                                    </div>

                                    {selectedRole === RoleUtilisateur.ENSEIGNANT && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label>Statut</Label>
                                                <Select value={watch("statut")} onValueChange={(v) => setValue("statut", v)}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        {Object.values(StatutProfessionnel).map(s => (
                                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Date d'embauche</Label>
                                                <Input type="date" {...register("date_embauche")} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Heures Hebdo (min)</Label>
                                                <Input type="number" min="0" {...register("heures_contractuelles_hebdo")} />
                                            </div>
                                        </div>
                                    )}

                                    {selectedRole === RoleUtilisateur.ETUDIANT && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label>Classe</Label>
                                                <Select value={watch("classe_id")} onValueChange={(v) => setValue("classe_id", v)}>
                                                    <SelectTrigger><SelectValue placeholder="Choisir une classe" /></SelectTrigger>
                                                    <SelectContent>
                                                        {classes?.map((c: any) => (
                                                            <SelectItem key={c.id} value={c.id}>{c.nom_classe} ({c.niveau})</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Date de naissance</Label>
                                                <Input type="date" {...register("date_naissance")} />
                                            </div>
                                        </div>
                                    )}

                                    {selectedRole === RoleUtilisateur.DIRECTEUR && (
                                        <div className="space-y-2">
                                            <Label>Date de nomination</Label>
                                            <Input type="date" {...register("date_nomination")} />
                                        </div>
                                    )}

                                    {selectedRole === RoleUtilisateur.RESPONSABLE_PEDAGOGIQUE && (
                                        <div className="space-y-2">
                                            <Label>Date de prise de fonction</Label>
                                            <Input type="date" {...register("date_prise_fonction")} />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        <div className="pt-6 flex justify-end gap-4">
                            <Button type="button" variant="outline" size="lg" onClick={() => navigate("/admin/utilisateurs")}>
                                Annuler
                            </Button>
                            <Button type="submit" size="lg" disabled={createUser.isPending || updateUser.isPending}>
                                {(createUser.isPending || updateUser.isPending) ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="mr-2 h-4 w-4" />
                                )}
                                {isEditing ? "Enregistrer les modifications" : "Créer l'utilisateur"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
