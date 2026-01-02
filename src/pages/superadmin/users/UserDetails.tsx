import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/useUsers";
import { ArrowLeft, Edit, User, Mail, Phone, Calendar, Shield, Building } from "lucide-react";

export default function UserDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: user, isLoading, error } = useUser(id!);

    if (error) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                    <h1 className="text-2xl font-bold text-destructive">Erreur</h1>
                    <p className="text-muted-foreground">Impossible de charger les détails de l'utilisateur.</p>
                    <Button onClick={() => navigate("/admin/utilisateurs")}>Retour à la liste</Button>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/utilisateurs")}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Détails de l'utilisateur</h1>
                            <p className="text-muted-foreground">Consulter les informations complètes du compte</p>
                        </div>
                    </div>
                    <Button onClick={() => navigate(`/admin/utilisateurs/${id}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card Profil Principal */}
                    <Card className="md:col-span-1">
                        <CardHeader className="text-center">
                            <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <User className="w-12 h-12 text-primary" />
                            </div>
                            <CardTitle className="text-xl">
                                {isLoading ? <Skeleton className="h-6 w-32 mx-auto" /> : `${user?.prenom} ${user?.nom}`}
                            </CardTitle>
                            <CardDescription>
                                {isLoading ? <Skeleton className="h-4 w-24 mx-auto mt-2" /> : <Badge variant="secondary">{user?.role}</Badge>}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{isLoading ? <Skeleton className="h-4 w-48" /> : user?.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{isLoading ? <Skeleton className="h-4 w-32" /> : user?.telephone || "Non renseigné"}</span>
                            </div>
                            <div className="pt-4 border-t">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Statut du compte</span>
                                    {isLoading ? (
                                        <Skeleton className="h-6 w-16" />
                                    ) : (
                                        <Badge variant={user?.actif ? "default" : "secondary"}>
                                            {user?.actif ? "Actif" : "Inactif"}
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Auto. 2FA</span>
                                    {isLoading ? (
                                        <Skeleton className="h-6 w-16" />
                                    ) : (
                                        <Badge variant={user?.deux_fa_active ? "default" : "outline"}>
                                            {user?.deux_fa_active ? "Activée" : "Désactivée"}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card Informations Spécifiques */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="h-5 w-5" />
                                    Établissement & Rôle
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground uppercase">Établissement</p>
                                        <p className="font-medium">
                                            {isLoading ? (
                                                <Skeleton className="h-4 w-40" />
                                            ) : (
                                                user?.etablissement?.nom || "Non assigné"
                                            )}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground uppercase">Type</p>
                                        <p className="font-medium">
                                            {isLoading ? (
                                                <Skeleton className="h-4 w-24" />
                                            ) : (
                                                user?.etablissement?.type || "N/A"
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {isLoading ? (
                                    <div className="space-y-2 pt-4 border-t">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                ) : (
                                    <>
                                        {user?.enseignant && (
                                            <div className="pt-4 border-t space-y-4">
                                                <h4 className="font-semibold text-primary">Détails Enseignant</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-muted-foreground">Matricule</p>
                                                        <p className="font-medium">{user.enseignant.matricule}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Statut</p>
                                                        <Badge variant="outline">{user.enseignant.statut}</Badge>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Volume horaire hebdo</p>
                                                        <p className="font-medium">{Math.floor(user.enseignant.heures_contractuelles_hebdo / 60)}h</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Multi-sites</p>
                                                        <p className="font-medium">{user.enseignant.multi_sites ? "Oui" : "Non"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {user?.eleve && (
                                            <div className="pt-4 border-t space-y-4">
                                                <h4 className="font-semibold text-primary">Détails Étudiant</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-muted-foreground">Matricule</p>
                                                        <p className="font-medium">{user.eleve.matricule}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Classe</p>
                                                        <p className="font-medium">{user.eleve.classe?.nom_classe || "Non assignée"}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Date de naissance</p>
                                                        <p className="font-medium">{user.eleve.date_naissance || "Non renseignée"}</p>
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <p className="text-muted-foreground">Adresse</p>
                                                        <p className="font-medium">{user.eleve.adresse || "Non renseignée"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {user?.directeur && (
                                            <div className="pt-4 border-t space-y-4">
                                                <h4 className="font-semibold text-primary">Détails Directeur</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-muted-foreground">Matricule</p>
                                                        <p className="font-medium">{user.directeur.matricule}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Date de nomination</p>
                                                        <p className="font-medium">{user.directeur.date_nomination}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {user?.responsablePedagogique && (
                                            <div className="pt-4 border-t space-y-4">
                                                <h4 className="font-semibold text-primary">Détails Responsable Pédagogique</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-muted-foreground">Matricule</p>
                                                        <p className="font-medium">{user.responsablePedagogique.matricule}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Date de prise de fonction</p>
                                                        <p className="font-medium">{user.responsablePedagogique.date_prise_fonction || "Non renseignée"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Sécurité & Accès
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-sm space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Dernière connexion</span>
                                        <span className="font-medium">{isLoading ? "..." : (user?.date_derniere_connexion ? new Date(user.date_derniere_connexion).toLocaleString() : "Jamais")}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Compte créé le</span>
                                        <span className="font-medium">{isLoading ? "..." : (user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Inconnu")}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
