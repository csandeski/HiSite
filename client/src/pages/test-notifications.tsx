import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PushNotificationManager } from '@/components/PushNotificationManager';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Bell, 
  Send, 
  Trophy,
  Gift,
  AlertTriangle,
  Info,
  Settings,
  Smartphone,
  Monitor,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Music,
  DollarSign
} from 'lucide-react';
import { useLocation } from 'wouter';

interface NotificationLog {
  id: number;
  timestamp: Date;
  type: 'sent' | 'received' | 'error' | 'info';
  title: string;
  body?: string;
  status: 'success' | 'error' | 'pending';
}

export default function TestNotificationsPage() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { status, isEnabled, sendTestNotification } = useNotifications();
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Se não estiver logado, redirecionar
  useEffect(() => {
    if (!user) {
      setLocation('/login');
    }
  }, [user, setLocation]);

  // Adicionar log
  const addLog = (log: Omit<NotificationLog, 'id' | 'timestamp'>) => {
    setLogs(prev => [{
      ...log,
      id: Date.now(),
      timestamp: new Date()
    }, ...prev].slice(0, 50)); // Manter apenas últimos 50 logs
  };

  // Escutar notificações recebidas
  useEffect(() => {
    const handleNotification = (event: CustomEvent) => {
      const payload = event.detail;
      addLog({
        type: 'received',
        title: payload.notification?.title || 'Notificação Recebida',
        body: payload.notification?.body,
        status: 'success'
      });
    };

    window.addEventListener('push-notification', handleNotification as EventListener);
    
    return () => {
      window.removeEventListener('push-notification', handleNotification as EventListener);
    };
  }, []);

  // Tipos de notificação para teste
  const notificationTypes = [
    {
      id: 'points',
      icon: Trophy,
      title: 'Pontos Ganhos',
      description: 'Notificação sobre pontos acumulados',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      message: {
        title: '🏆 Você ganhou 100 pontos!',
        body: 'Continue ouvindo para ganhar ainda mais pontos e trocar por prêmios incríveis!'
      }
    },
    {
      id: 'reward',
      icon: Gift,
      title: 'Prêmio Disponível',
      description: 'Aviso sobre recompensas liberadas',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      message: {
        title: '🎁 Novo prêmio desbloqueado!',
        body: 'Você tem um prêmio esperando para ser resgatado. Confira agora!'
      }
    },
    {
      id: 'radio',
      icon: Music,
      title: 'Rádio Favorita',
      description: 'Alerta sobre sua rádio preferida',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      message: {
        title: '📻 Sua rádio favorita está ao vivo!',
        body: 'A programação especial da tarde está começando agora. Não perca!'
      }
    },
    {
      id: 'money',
      icon: DollarSign,
      title: 'Saldo Atualizado',
      description: 'Notificação sobre seu saldo',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      message: {
        title: '💰 Seu saldo foi atualizado!',
        body: 'R$ 10,00 foram adicionados à sua conta. Confira seu extrato!'
      }
    },
    {
      id: 'alert',
      icon: AlertTriangle,
      title: 'Alerta Importante',
      description: 'Avisos críticos do sistema',
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      message: {
        title: '⚠️ Ação necessária!',
        body: 'Sua sessão expirará em 5 minutos. Faça login novamente para continuar.'
      }
    },
    {
      id: 'info',
      icon: Info,
      title: 'Informação',
      description: 'Atualizações e novidades',
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
      message: {
        title: 'ℹ️ Novidade no RádioPlay!',
        body: 'Agora você pode ouvir suas rádios favoritas offline. Atualize o app!'
      }
    }
  ];

  // Enviar notificação de teste personalizada
  const sendCustomNotification = async (type: typeof notificationTypes[0]) => {
    setSelectedType(type.id);
    setIsSending(true);
    
    try {
      // Adicionar log de envio
      addLog({
        type: 'sent',
        title: `Enviando: ${type.title}`,
        body: type.message.body,
        status: 'pending'
      });

      // Simular envio (usar API real quando disponível)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Enviar notificação local
      if ('serviceWorker' in navigator && 'Notification' in window && Notification.permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(type.message.title, {
          body: type.message.body,
          icon: '/icon-192x192.png',
          badge: '/icon-96x96.png',
          tag: `test-${type.id}`,
          data: { type: type.id, timestamp: Date.now() }
        });
        
        addLog({
          type: 'info',
          title: 'Notificação enviada com sucesso',
          body: type.title,
          status: 'success'
        });
      } else {
        throw new Error('Notificações não estão habilitadas');
      }
    } catch (error) {
      addLog({
        type: 'error',
        title: 'Erro ao enviar notificação',
        body: error instanceof Error ? error.message : 'Erro desconhecido',
        status: 'error'
      });
    } finally {
      setIsSending(false);
      setSelectedType(null);
    }
  };

  // Limpar logs
  const clearLogs = () => {
    setLogs([]);
    addLog({
      type: 'info',
      title: 'Logs limpos',
      status: 'success'
    });
  };

  // Obter cor do badge baseado no tipo
  const getLogBadgeVariant = (type: NotificationLog['type']): "default" | "destructive" | "outline" | "secondary" => {
    switch (type) {
      case 'sent': return 'default';
      case 'received': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Bell className="w-6 h-6" />
                Teste de Notificações
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Teste e configure notificações push para diferentes cenários
              </p>
            </div>
            <Button
              onClick={() => setLocation('/perfil')}
              variant="outline"
              size="sm"
            >
              Voltar ao Perfil
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <Tabs defaultValue="manager" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="manager" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configurar
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Testar
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Logs
            </TabsTrigger>
          </TabsList>

          {/* Tab: Configuração */}
          <TabsContent value="manager" className="space-y-4">
            <PushNotificationManager />
          </TabsContent>

          {/* Tab: Testes */}
          <TabsContent value="test" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tipos de Notificação</CardTitle>
                <CardDescription>
                  Clique em qualquer tipo para enviar uma notificação de teste
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isEnabled && (
                  <Alert className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      As notificações não estão ativadas. Configure primeiro na aba "Configurar".
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {notificationTypes.map((type) => {
                    const Icon = type.icon;
                    const isLoading = isSending && selectedType === type.id;
                    
                    return (
                      <Card 
                        key={type.id}
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          isLoading ? 'ring-2 ring-primary' : ''
                        }`}
                      >
                        <CardContent className="p-4">
                          <Button
                            onClick={() => sendCustomNotification(type)}
                            disabled={!isEnabled || isSending}
                            variant="ghost"
                            className="w-full h-full p-0 hover:bg-transparent"
                          >
                            <div className="w-full text-left">
                              <div className={`w-12 h-12 rounded-lg ${type.bgColor} flex items-center justify-center mb-3`}>
                                <Icon className={`w-6 h-6 ${type.color}`} />
                              </div>
                              <h3 className="font-semibold text-base mb-1">{type.title}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {type.description}
                              </p>
                              {isLoading && (
                                <div className="mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    Enviando...
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <Separator className="my-6" />

                {/* Botão de Teste Rápido */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <Button
                    onClick={() => sendTestNotification()}
                    disabled={!isEnabled || isSending}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Enviar Notificação de Teste Padrão
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Logs */}
          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Histórico de Notificações</CardTitle>
                    <CardDescription>
                      Últimas {logs.length} notificações processadas
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setLogs([])}
                      variant="outline"
                      size="sm"
                      disabled={logs.length === 0}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Limpar
                    </Button>
                    <Button
                      onClick={() => window.location.reload()}
                      variant="outline"
                      size="sm"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Atualizar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {logs.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhuma notificação registrada ainda</p>
                    <p className="text-sm mt-1">Envie uma notificação de teste para começar</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px] w-full">
                    <div className="space-y-2">
                      {logs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex-shrink-0 mt-1">
                            {log.status === 'success' ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : log.status === 'error' ? (
                              <XCircle className="w-4 h-4 text-red-500" />
                            ) : (
                              <Clock className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={getLogBadgeVariant(log.type)} className="text-xs">
                                {log.type === 'sent' ? 'Enviado' :
                                 log.type === 'received' ? 'Recebido' :
                                 log.type === 'error' ? 'Erro' : 'Info'}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {log.timestamp.toLocaleTimeString('pt-BR')}
                              </span>
                            </div>
                            <p className="font-medium text-sm">{log.title}</p>
                            {log.body && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {log.body}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Status do Sistema */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                      isEnabled ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Bell className={`w-6 h-6 ${isEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <p className="text-sm font-medium">Notificações</p>
                    <p className="text-xs text-gray-500">{isEnabled ? 'Ativas' : 'Inativas'}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                      status.permission === 'granted' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <Shield className={`w-6 h-6 ${
                        status.permission === 'granted' ? 'text-green-600' : 'text-red-600'
                      }`} />
                    </div>
                    <p className="text-sm font-medium">Permissão</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {status.permission === 'granted' ? 'Concedida' :
                       status.permission === 'denied' ? 'Negada' : 'Pendente'}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                      status.isStandalone ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {status.isIOS ? (
                        <Smartphone className={`w-6 h-6 ${status.isStandalone ? 'text-blue-600' : 'text-gray-400'}`} />
                      ) : (
                        <Monitor className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <p className="text-sm font-medium">Dispositivo</p>
                    <p className="text-xs text-gray-500">
                      {status.isIOS ? `iOS ${status.iOSVersion.toFixed(1)}` : 'Desktop/Android'}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                      window.location.protocol === 'https:' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <Shield className={`w-6 h-6 ${
                        window.location.protocol === 'https:' ? 'text-green-600' : 'text-red-600'
                      }`} />
                    </div>
                    <p className="text-sm font-medium">Conexão</p>
                    <p className="text-xs text-gray-500">
                      {window.location.protocol === 'https:' ? 'HTTPS Seguro' : 'HTTP Inseguro'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}