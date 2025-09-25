import { useState, useEffect, useCallback } from 'react';
import { notificationManager } from '@/lib/notifications';
import { useToast } from '@/hooks/use-toast';

export interface NotificationStatus {
  isSupported: boolean;
  permission: NotificationPermission;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isIOS: boolean;
  iOSVersion: number;
  isStandalone: boolean;
  requiresInstall: boolean;
}

export function useNotifications() {
  const { toast } = useToast();
  const [status, setStatus] = useState<NotificationStatus>({
    isSupported: false,
    permission: 'default',
    token: null,
    isLoading: false,
    error: null,
    isIOS: false,
    iOSVersion: 0,
    isStandalone: false,
    requiresInstall: false,
  });

  // O notificationManager já é importado como singleton, não precisa criar nova instância

  // Verificar status inicial
  useEffect(() => {
    const checkStatus = async () => {
      const currentStatus = await notificationManager.getStatus();
      
      setStatus({
        isSupported: notificationManager.isSupportedDevice(),
        permission: currentStatus.permission,
        token: currentStatus.token,
        isLoading: false,
        error: null,
        isIOS: notificationManager.getDeviceInfo().isIOS,
        iOSVersion: notificationManager.getDeviceInfo().iOSVersion,
        isStandalone: notificationManager.getDeviceInfo().isStandalone,
        requiresInstall: notificationManager.getDeviceInfo().isIOS && 
                        !notificationManager.getDeviceInfo().isStandalone,
      });
    };

    checkStatus();

    // Escutar mudanças de permissão
    if ('permissions' in navigator && 'query' in navigator.permissions) {
      navigator.permissions.query({ name: 'notifications' as PermissionName })
        .then(permissionStatus => {
          permissionStatus.onchange = () => {
            checkStatus();
          };
        })
        .catch(() => {});
    }

    // Escutar notificações recebidas
    const handleNotification = (event: CustomEvent) => {
      const payload = event.detail;
      
      // Mostrar toast quando receber notificação em foreground
      if (payload.notification) {
        toast({
          title: payload.notification.title || 'Nova notificação',
          description: payload.notification.body || '',
          duration: 5000,
        });
      }
    };

    window.addEventListener('push-notification', handleNotification as EventListener);

    return () => {
      window.removeEventListener('push-notification', handleNotification as EventListener);
    };
  }, [notificationManager, toast]);

  // Solicitar permissão
  const requestPermission = useCallback(async (): Promise<boolean> => {
    setStatus(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Verificar requisitos para iOS
      if (status.isIOS && !status.isStandalone) {
        setStatus(prev => ({ 
          ...prev, 
          isLoading: false,
          error: 'Por favor, instale o app na tela inicial do seu iPhone para receber notificações.' 
        }));
        
        toast({
          title: 'Instalação Necessária',
          description: 'Para receber notificações no iOS, adicione este app à tela inicial.',
          variant: 'destructive',
          duration: 8000,
        });
        
        return false;
      }

      // Verificar versão do iOS
      if (status.isIOS && status.iOSVersion < 16.4) {
        setStatus(prev => ({ 
          ...prev, 
          isLoading: false,
          error: 'iOS 16.4 ou superior é necessário para notificações push.' 
        }));
        
        toast({
          title: 'Versão não suportada',
          description: 'Atualize seu iOS para 16.4 ou superior para usar notificações.',
          variant: 'destructive',
          duration: 8000,
        });
        
        return false;
      }

      const result = await notificationManager.requestPermission();
      
      if (result) {
        const currentStatus = await notificationManager.getStatus();
        
        setStatus(prev => ({
          ...prev,
          permission: currentStatus.permission,
          token: currentStatus.token,
          isLoading: false,
          error: null,
        }));

        toast({
          title: 'Notificações ativadas!',
          description: 'Você receberá notificações importantes.',
          duration: 3000,
        });
        
        return true;
      } else {
        setStatus(prev => ({
          ...prev,
          permission: 'denied',
          isLoading: false,
          error: 'Permissão negada pelo usuário ou navegador.',
        }));

        toast({
          title: 'Notificações bloqueadas',
          description: 'Você pode ativar nas configurações do navegador.',
          variant: 'destructive',
          duration: 5000,
        });
        
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      setStatus(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast({
        title: 'Erro ao ativar notificações',
        description: errorMessage,
        variant: 'destructive',
        duration: 5000,
      });
      
      return false;
    }
  }, [notificationManager, status.isIOS, status.isStandalone, status.iOSVersion, toast]);

  // Desativar notificações
  const disableNotifications = useCallback(async (): Promise<boolean> => {
    setStatus(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await notificationManager.unsubscribe();
      
      if (result) {
        setStatus(prev => ({
          ...prev,
          token: null,
          isLoading: false,
          error: null,
        }));

        toast({
          title: 'Notificações desativadas',
          description: 'Você não receberá mais notificações.',
          duration: 3000,
        });
        
        return true;
      } else {
        setStatus(prev => ({
          ...prev,
          isLoading: false,
          error: 'Erro ao desativar notificações.',
        }));
        
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      setStatus(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      
      return false;
    }
  }, [notificationManager, toast]);

  // Enviar notificação de teste
  const sendTestNotification = useCallback(async (): Promise<void> => {
    try {
      await notificationManager.sendTestNotification();
      
      toast({
        title: 'Notificação enviada!',
        description: 'Você deve receber uma notificação de teste em breve.',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Erro ao enviar notificação',
        description: 'Não foi possível enviar a notificação de teste.',
        variant: 'destructive',
        duration: 5000,
      });
    }
  }, [notificationManager, toast]);

  // Verificar se notificações estão ativas
  const isEnabled = status.permission === 'granted' && !!status.token;

  return {
    status,
    isEnabled,
    requestPermission,
    disableNotifications,
    sendTestNotification,
  };
}