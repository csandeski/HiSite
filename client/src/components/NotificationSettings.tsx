import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bell, BellOff, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { notificationManager } from "@/lib/notifications";

interface NotificationSettingsResponse {
  pushNotificationsEnabled: boolean;
  registeredDevices: number;
  tokens: Array<{
    platform: string;
    lastUsed: string | null;
    active: boolean;
  }>;
}

export function NotificationSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isRegistering, setIsRegistering] = useState(false);

  // Check if notifications are supported
  useEffect(() => {
    const checkSupport = () => {
      const supported = notificationManager.isNotificationsSupported();
      setIsSupported(supported);
      if (supported && 'Notification' in window) {
        setPermission(Notification.permission);
      }
    };
    checkSupport();
  }, []);

  // Get notification settings
  const { data: settings, isLoading } = useQuery<NotificationSettingsResponse>({
    queryKey: ['/api/notifications/settings'],
    enabled: isSupported
  });

  // Update notification settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      return apiRequest('PATCH', '/api/notifications/settings', { 
        pushNotificationsEnabled: enabled 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/settings'] });
      toast({
        title: "Configurações atualizadas",
        description: "Suas preferências de notificação foram salvas."
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as configurações.",
        variant: "destructive"
      });
    }
  });

  const handleEnableNotifications = async () => {
    setIsRegistering(true);
    
    try {
      // Request permission
      const granted = await notificationManager.requestPermission();
      
      if (granted) {
        // Register for push notifications
        const registered = await notificationManager.register();
        
        if (registered) {
          setPermission('granted');
          await queryClient.invalidateQueries({ queryKey: ['/api/notifications/settings'] });
          
          toast({
            title: "Notificações ativadas!",
            description: "Você receberá notificações sobre pontos, ofertas e novidades.",
            action: <CheckCircle className="h-5 w-5 text-green-500" />
          });
        } else {
          throw new Error("Falha ao registrar dispositivo");
        }
      } else {
        setPermission('denied');
        toast({
          title: "Permissão negada",
          description: "Você pode habilitar notificações nas configurações do navegador.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast({
        title: "Erro ao ativar notificações",
        description: "Tente novamente mais tarde ou verifique as configurações do navegador.",
        variant: "destructive"
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    if (enabled && permission !== 'granted') {
      await handleEnableNotifications();
    } else {
      updateSettingsMutation.mutate(enabled);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </CardContent>
      </Card>
    );
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notificações Push</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Seu navegador não suporta notificações push. 
              Tente usar Chrome, Firefox, Safari ou Edge.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const isEnabled = permission === 'granted' && settings?.pushNotificationsEnabled !== false;

  return (
    <Card data-testid="card-notification-settings">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificações Push
        </CardTitle>
        <CardDescription>
          Receba alertas sobre seus pontos, ofertas especiais e novidades
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="push-notifications" className="text-base">
              {isEnabled ? 'Notificações ativadas' : 'Ativar notificações'}
            </Label>
            <p className="text-sm text-muted-foreground">
              {isEnabled 
                ? 'Você está recebendo notificações neste dispositivo'
                : 'Clique para receber alertas importantes'}
            </p>
          </div>
          <Switch
            id="push-notifications"
            checked={isEnabled}
            onCheckedChange={handleToggleNotifications}
            disabled={isRegistering || updateSettingsMutation.isPending}
            data-testid="switch-push-notifications"
          />
        </div>

        {/* Status indicators */}
        {permission === 'denied' && (
          <Alert variant="destructive">
            <BellOff className="h-4 w-4" />
            <AlertDescription>
              As notificações foram bloqueadas. 
              Para reativar, você precisa permitir notificações nas configurações do navegador.
            </AlertDescription>
          </Alert>
        )}

        {permission === 'granted' && settings && settings.registeredDevices > 0 && (
          <Alert>
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription>
              <span className="font-medium">
                {settings?.registeredDevices} {settings?.registeredDevices === 1 ? 'dispositivo registrado' : 'dispositivos registrados'}
              </span>
              {' '}para receber notificações
            </AlertDescription>
          </Alert>
        )}

        {/* Test notification button (for development) */}
        {isEnabled && import.meta.env.DEV && (
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => notificationManager.showLocal(
                'Teste de Notificação',
                'Esta é uma notificação de teste do RádioPlay!'
              )}
              data-testid="button-test-notification"
            >
              Enviar notificação de teste
            </Button>
          </div>
        )}

        {/* Notification types */}
        {isEnabled && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-sm font-medium">Tipos de notificação que você receberá:</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Pontos ganhos ao ouvir rádio</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Confirmação de resgates e pagamentos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Ofertas especiais e bônus</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Lembretes de streak de login</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}