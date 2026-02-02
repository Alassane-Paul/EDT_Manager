import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Lock, FileText, UserCheck } from "lucide-react";

const Terms = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="gap-2 hover:bg-primary/10 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour
                </Button>

                <Card className="shadow-xl border-primary/10 overflow-hidden">
                    <CardHeader className="bg-primary/5 border-b border-primary/10 py-8">
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck className="h-8 w-8 text-primary" />
                            <CardTitle className="text-3xl font-bold">Termes et Conditions d'Utilisation</CardTitle>
                        </div>
                        <p className="text-muted-foreground italic">Dernière mise à jour : 27 Janvier 2026</p>
                    </CardHeader>

                    <CardContent className="p-8 space-y-8 prose prose-slate max-w-none">
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-xl font-semibold text-primary">
                                <FileText className="h-5 w-5" />
                                <h2>1. Objet</h2>
                            </div>
                            <p>
                                Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités de mise à disposition des services de la plateforme <strong>Edt Manager</strong> et les conditions d'utilisation des services par l'Utilisateur.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-xl font-semibold text-primary">
                                <UserCheck className="h-5 w-5" />
                                <h2>2. Acceptation des conditions</h2>
                            </div>
                            <p>
                                L'inscription aux services ainsi que l'utilisation de la plateforme impliquent l'acceptation sans réserve par l'Utilisateur des présentes CGU. L'acceptation est manifestée par le fait de cocher la case "J'accepte les Termes et Conditions" lors de la création du compte.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-xl font-semibold text-primary">
                                <Lock className="h-5 w-5" />
                                <h2>3. Protection des données (RGPD)</h2>
                            </div>
                            <p>
                                Edt Manager s’engage à ce que la collecte et le traitement de vos données soient conformes au Règlement Général sur la Protection des Données (RGPD).
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Données collectées :</strong> Nom, prénom, email, rôle (enseignant, étudiant, personnel), établissement et classe.</li>
                                <li><strong>Finalité :</strong> Gestion administrative des emplois du temps, des notes, des absences et de la facturation scolaire.</li>
                                <li><strong>Droits :</strong> Vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition au traitement de vos données personnelles.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-xl font-semibold text-primary">
                                <ShieldCheck className="h-5 w-5" />
                                <h2>4. Engagements de l'Utilisateur</h2>
                            </div>
                            <p>
                                L'Utilisateur s'engage à fournir des informations exactes lors de son inscription et à ne pas usurper l'identité d'un tiers. L'usage du compte est personnel et confidentiel. Tout comportement inapproprié sur la plateforme peut entraîner la suspension du compte.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-xl font-semibold text-primary">
                                <FileText className="h-5 w-5" />
                                <h2>5. Responsabilité</h2>
                            </div>
                            <p>
                                L'éditeur de la plateforme met tout en œuvre pour assurer un accès de qualité au service. Cependant, il ne peut être tenu responsable des interruptions de service ou des pertes de données liées à des cas de force majeure ou à des opérations de maintenance.
                            </p>
                        </section>

                        <div className="pt-8 border-t border-primary/10 text-center">
                            <Button onClick={() => navigate(-1)} className="px-8">
                                J'ai compris
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Terms;
