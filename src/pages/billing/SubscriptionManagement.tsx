// src/pages/billing/SubscriptionManagement.tsx
import React, { useEffect, useState } from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    CreditCard,
    ShieldCheck,
    Clock,
    AlertCircle,
    Users,
    Layers,
    CheckCircle2,
    Calendar,
    TrendingUp,
    Loader2
} from "lucide-react";
import { paymentsApi } from "@/api/payments/api";
import { subscriptionsApi } from "@/api/subscriptions/api";
import { pricingApi } from "@/api/pricing/api";
import { UsageGauge } from "@/components/billing/UsageGauge";
import { PaymentDialog } from "@/components/billing/PaymentDialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const SubscriptionManagement = () => {
    const [subscription, setSubscription] = useState<any>(null);
    const [plans, setPlans] = useState<any[]>([]);
    const [usage, setUsage] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpgrading, setIsUpgrading] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subRes, plansRes, usageRes] = await Promise.all([
                    subscriptionsApi.getSubscription(),
                    pricingApi.getPlans(),
                    subscriptionsApi.getUsageStats('current_month')
                ]);

                setSubscription(subRes.subscription);
                setPlans(plansRes.plans);
                setUsage(usageRes);
            } catch (error) {
                console.error("Error fetching subscription data:", error);
                toast({
                    title: "Erreur",
                    description: "Impossible de charger les informations d'abonnement",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [toast]);

    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

    const handleUpgrade = (plan: any) => {
        setSelectedPlan(plan);
        setIsPaymentDialogOpen(true);
    };

    if (isLoading) {
        return (
            <AppLayout>
                <div className="space-y-6">
                    <Skeleton className="h-10 w-64" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Skeleton className="h-48 col-span-2" />
                        <Skeleton className="h-48" />
                    </div>
                    <Skeleton className="h-10 w-48" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Skeleton className="h-96" />
                        <Skeleton className="h-96" />
                        <Skeleton className="h-96" />
                        <Skeleton className="h-96" />
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Abonnement</h1>
                        <p className="text-muted-foreground">
                            Gérez votre plan et suivez votre consommation en temps réel
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={subscription?.statut === 'active' ? "default" : "destructive"} className="px-3 py-1">
                            {subscription?.statut === 'active' ? 'Actif' : 'Suspendu'}
                        </Badge>
                        <Button variant="outline" onClick={() => window.location.href = '/billing/invoices'}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Historique des factures
                        </Button>
                    </div>
                </div>

                {/* Current Plan & Usage Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2 overflow-hidden border-primary/20 bg-primary/5">
                        <CardHeader className="bg-primary/10 border-b pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <ShieldCheck className="h-5 w-5 text-primary" />
                                        Plan actuel : <span className="uppercase text-primary">{subscription?.plan_type || 'Aucun'}</span>
                                    </CardTitle>
                                    <CardDescription>
                                        Votre établissement bénéficie des fonctionnalités {subscription?.plan_type}
                                    </CardDescription>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold">{subscription?.prix_base_mensuel} XOF</div>
                                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Prix de base / mois</div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        Prochaine facturation
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-background p-2 rounded-md border shadow-sm">
                                            <Calendar className="h-8 w-8 text-primary" />
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold">
                                                {subscription?.date_prochaine_facturation ? new Date(subscription.date_prochaine_facturation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                                            </div>
                                            <p className="text-xs text-muted-foreground">Renouvellement automatique actif</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                        Statut du compte
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        <span className="text-sm">Toutes les limites respectées</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Consommation actuelle
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            <UsageGauge
                                label="Utilisateurs"
                                current={usage?.usage?.utilisateurs || 0}
                                limit={subscription?.etablissement?.limite_utilisateurs}
                                icon={<Users className="h-4 w-4" />}
                            />
                            <UsageGauge
                                label="Classes"
                                current={usage?.usage?.classes || 0}
                                limit={subscription?.etablissement?.limite_classes}
                                icon={<Layers className="h-4 w-4" />}
                            />
                        </div>
                        <p className="text-[10px] text-muted-foreground text-center">
                            Dernière mise à jour : {new Date().toLocaleString('fr-FR')}
                        </p>
                    </div>
                </div>

                {/* Available Plans */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Choisir un plan supérieur</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {plans.map((plan: any) => (
                            <Card key={plan.type} className={`flex flex-col ${subscription?.plan_type === plan.type ? 'border-primary shadow-md' : ''}`}>
                                <CardHeader>
                                    {subscription?.plan_type === plan.type && (
                                        <Badge className="w-fit mb-2" variant="default">Plan actuel</Badge>
                                    )}
                                    <CardTitle className="capitalize">{plan.nom}</CardTitle>
                                    <CardDescription>
                                        <span className="text-2xl font-bold text-foreground">
                                            {typeof plan.prix_base === 'number' ? `${plan.prix_base} XOF` : plan.prix_base}
                                        </span>
                                        {typeof plan.prix_base === 'number' && <span className="text-sm">/mois</span>}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <ul className="space-y-2 text-sm">
                                        {plan.features.map((feature: string, idx: number) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        variant={subscription?.plan_type === plan.type ? "outline" : "default"}
                                        className="w-full"
                                        disabled={subscription?.plan_type === plan.type}
                                        onClick={() => handleUpgrade(plan)}
                                    >
                                        {subscription?.plan_type === plan.type ? "Plan actuel" : "Choisir ce plan"}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>

                <PaymentDialog
                    open={isPaymentDialogOpen}
                    onOpenChange={setIsPaymentDialogOpen}
                    subscriptionPlan={selectedPlan}
                    onSuccess={() => {
                        // Recharger les données après un paiement réussi
                        window.location.reload();
                    }}
                />
            </div>
        </AppLayout>
    );
};

export default SubscriptionManagement;
