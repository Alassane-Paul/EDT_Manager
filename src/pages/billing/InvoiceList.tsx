// src/pages/billing/InvoiceList.tsx
import React, { useEffect, useState } from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    FileText,
    Download,
    Search,
    Filter,
    CheckCircle2,
    Clock,
    AlertCircle,
    ExternalLink,
    CreditCard
} from "lucide-react";
import { invoicesApi } from "@/api/invoices/api";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { PaymentDialog } from "@/components/billing/PaymentDialog";
import { useSearchParams } from "react-router-dom";

const InvoiceList = () => {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Vérifier si un paiement vient d'être effectué
                const status = searchParams.get('status');
                const invoiceId = searchParams.get('invoiceId');

                if (status === 'success' && invoiceId) {
                    toast({
                        title: "Paiement réussi",
                        description: "Votre facture a été réglée avec succès !",
                        className: "bg-green-50 text-green-800 border-green-200"
                    });
                    // Nettoyer l'URL
                    setSearchParams({});
                } else if (status === 'cancel') {
                    toast({
                        title: "Paiement annulé",
                        description: "La transaction a été annulée.",
                        variant: "default"
                    });
                    setSearchParams({});
                }

                const [invRes, sumRes] = await Promise.all([
                    invoicesApi.getAll(),
                    invoicesApi.getSummary()
                ]);

                setInvoices(invRes.invoices);
                setSummary(sumRes.summary);
            } catch (error) {
                console.error("Error fetching invoice data:", error);
                toast({
                    title: "Erreur",
                    description: "Impossible de charger vos factures",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [toast, searchParams, setSearchParams]);

    const getStatusBadge = (statut: string) => {
        switch (statut) {
            case 'paid':
                return <Badge className="bg-green-500 hover:bg-green-600">Payée</Badge>;
            case 'pending':
                return <Badge variant="outline" className="text-blue-500 border-blue-500">En attente</Badge>;
            case 'overdue':
                return <Badge variant="destructive">En retard</Badge>;
            case 'cancelled':
                return <Badge variant="secondary">Annulée</Badge>;
            default:
                return <Badge variant="outline">{statut}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <AppLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Facturation</h1>
                        <p className="text-muted-foreground">
                            Consultez et téléchargez vos factures
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => window.open('/billing')}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Gérer l'abonnement
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total payé</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary?.total_paid_amount.toFixed(2)} XOF</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">À payer</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{summary?.total_unpaid_amount.toFixed(2)} XOF</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Factures payées</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold flex items-center gap-2">
                                {summary?.paid_invoices}
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className={summary?.overdue_invoices > 0 ? "border-destructive/50 bg-destructive/5" : ""}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Factures en retard</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold flex items-center gap-2">
                                {summary?.overdue_invoices}
                                {summary?.overdue_invoices > 0 && <AlertCircle className="h-5 w-5 text-destructive" />}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main List */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <CardTitle>Historique des factures</CardTitle>
                            <div className="flex items-center gap-2">
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Chercher une facture..."
                                        className="pl-9"
                                    />
                                </div>
                                <Button variant="outline" size="icon">
                                    <Filter className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                            </div>
                        ) : invoices.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Numéro</TableHead>
                                        <TableHead>Date d'émission</TableHead>
                                        <TableHead>Période</TableHead>
                                        <TableHead>Montant TTC</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoices.map((invoice) => (
                                        <TableRow key={invoice.id}>
                                            <TableCell className="font-medium flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                {invoice.numero_facture}
                                            </TableCell>
                                            <TableCell>{formatDate(invoice.date_emission)}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {formatDate(invoice.periode_debut)} - {formatDate(invoice.periode_fin)}
                                            </TableCell>
                                            <TableCell className="font-bold">{invoice.montant_ttc} XOF</TableCell>
                                            <TableCell>{getStatusBadge(invoice.statut)}</TableCell>
                                            <TableCell className="text-right flex items-center justify-end gap-2">
                                                {(invoice.statut === 'pending' || invoice.statut === 'overdue') && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                                        onClick={() => {
                                                            setSelectedInvoice(invoice);
                                                            setIsPaymentDialogOpen(true);
                                                        }}
                                                    >
                                                        <CreditCard className="h-4 w-4 mr-2" />
                                                        Payer
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="sm">
                                                    <Download className="h-4 w-4 mr-2" />
                                                    PDF
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-12">
                                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium">Aucune facture trouvée</h3>
                                <p className="text-muted-foreground">Vos factures mensuelles apparaîtront ici.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <PaymentDialog
                    invoice={selectedInvoice}
                    open={isPaymentDialogOpen}
                    onOpenChange={setIsPaymentDialogOpen}
                    onSuccess={() => {
                        window.location.reload();
                    }}
                />
            </div>
        </AppLayout>
    );
};

export default InvoiceList;
