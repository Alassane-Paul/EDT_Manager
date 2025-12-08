import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, QrCode, Copy, Check } from "lucide-react";
import { authApi } from "@/api/auth/api";

interface TwoFactorSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const TwoFactorSetup = ({ open, onOpenChange, onSuccess }: TwoFactorSetupProps) => {
  const { refreshProfile } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState<"setup" | "verify">("setup");
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSetup = async () => {
    setIsLoading(true);
    try {
      const response = await authApi.setup2FA();
      setQrCode(response.qrCode);
      setSecret(response.secret);
      setStep("verify");
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de configurer le 2FA",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un code à 6 chiffres",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await authApi.activate2FA(verificationCode);
      await refreshProfile();
      
      toast({
        title: "2FA activé",
        description: "L'authentification à deux facteurs est maintenant active",
      });
      
      handleClose();
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Code invalide",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySecret = async () => {
    if (secret) {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setStep("setup");
    setQrCode(null);
    setSecret(null);
    setVerificationCode("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center">
            {step === "setup" ? "Configurer le 2FA" : "Scanner le QR Code"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === "setup"
              ? "Renforcez la sécurité de votre compte avec l'authentification à deux facteurs"
              : "Scannez ce QR code avec votre application d'authentification (Google Authenticator, Authy, etc.)"}
          </DialogDescription>
        </DialogHeader>

        {step === "setup" ? (
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="w-32 h-32 bg-muted rounded-xl flex items-center justify-center">
              <QrCode className="w-16 h-16 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Vous aurez besoin d'une application d'authentification comme Google Authenticator ou Authy
            </p>
            <Button onClick={handleSetup} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Configuration...
                </>
              ) : (
                "Commencer la configuration"
              )}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleActivate} className="space-y-6 py-4">
            {/* QR Code Display */}
            <div className="flex flex-col items-center space-y-4">
              {qrCode && (
                <div className="p-4 bg-white rounded-xl shadow-inner border">
                  <img
                    src={qrCode}
                    alt="QR Code 2FA"
                    className="w-48 h-48"
                  />
                </div>
              )}
              
              {/* Secret Key for manual entry */}
              {secret && (
                <div className="w-full space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Ou entrez ce code manuellement :
                  </Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono break-all">
                      {secret}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleCopySecret}
                      className="shrink-0"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Verification Code Input */}
            <div className="space-y-2">
              <Label htmlFor="verify-code">Code de vérification</Label>
              <Input
                id="verify-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                className="text-center text-2xl tracking-widest"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground text-center">
                Entrez le code à 6 chiffres de votre application
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Activation...
                </>
              ) : (
                "Activer le 2FA"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
