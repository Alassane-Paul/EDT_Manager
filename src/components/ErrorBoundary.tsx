
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4 bg-background">
          <Alert variant="destructive" className="max-w-md shadow-lg">
            <AlertTitle className="text-lg font-bold">Une erreur est survenue</AlertTitle>
            <AlertDescription className="mt-2 text-sm break-words">
              {this.state.error?.message || "Erreur inconnue"}
              <div className="mt-2 text-xs opacity-70">
                Verifiez la console pour plus de détails.
              </div>
            </AlertDescription>
          </Alert>
          <Button
            variant="default"
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Rafraîchir la page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
