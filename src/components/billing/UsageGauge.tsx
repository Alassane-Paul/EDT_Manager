// src/components/billing/UsageGauge.tsx
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";

interface UsageGaugeProps {
    label: string;
    current: number;
    limit: number | null;
    unit?: string;
    icon?: React.ReactNode;
}

export const UsageGauge: React.FC<UsageGaugeProps> = ({
    label,
    current,
    limit,
    unit = "",
    icon
}) => {
    const percentage = limit ? Math.min(Math.round((current / limit) * 100), 100) : null;

    const getStatusColor = () => {
        if (!limit) return "text-primary";
        if (percentage! >= 90) return "text-destructive";
        if (percentage! >= 70) return "text-yellow-600";
        return "text-green-600";
    };

    const getProgressColor = () => {
        if (!limit) return "bg-primary";
        if (percentage! >= 90) return "bg-destructive";
        if (percentage! >= 70) return "bg-yellow-500";
        return "bg-green-500";
    };

    return (
        <div className="space-y-3 p-4 border rounded-lg bg-card shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {icon && <div className="text-muted-foreground">{icon}</div>}
                    <span className="font-medium text-sm">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">
                        {current}
                        {unit && <span className="text-xs font-normal text-muted-foreground ml-1">{unit}</span>}
                    </span>
                    {limit && (
                        <span className="text-xs text-muted-foreground">
                            / {limit}
                        </span>
                    )}
                </div>
            </div>

            {limit ? (
                <div className="space-y-1">
                    <Progress
                        value={percentage}
                        className="h-2"
                        indicatorClassName={getProgressColor()}
                    />
                    <div className="flex justify-between items-center pt-1">
                        <div className="flex items-center gap-1">
                            {percentage! >= 90 ? (
                                <AlertTriangle className="h-3 w-3 text-destructive" />
                            ) : percentage! >= 70 ? (
                                <AlertTriangle className="h-3 w-3 text-yellow-500" />
                            ) : (
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                            )}
                            <span className={`text-[10px] font-medium ${getStatusColor()}`}>
                                {percentage}% utilisé
                            </span>
                        </div>
                        {percentage! > 80 && (
                            <Badge variant="outline" className="text-[9px] h-4 py-0 border-destructive text-destructive">
                                Attention
                            </Badge>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-1 pt-1">
                    <TrendingUp className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-medium text-primary">Utilisation illimitée</span>
                </div>
            )}
        </div>
    );
};
