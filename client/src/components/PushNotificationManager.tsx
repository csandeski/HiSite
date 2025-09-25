import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useNotifications } from '@/hooks/useNotifications';
import { 
  Bell, 
  BellOff, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Smartphone,
  Download,
  Settings,
  Send,
  Loader2,
  ChevronRight,
  Globe,
  Shield,
  Zap
} from 'lucide-react';

export function PushNotificationManager() {
  const { status, isEnabled, requestPermission, disableNotifications, sendTestNotification } = useNotifications();
  const [isToggling, setIsToggling] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Determinar status visual
  const getStatusBadge = () => {
    if (status.isLoading) {
      return (
        <Badge variant="outline" className="gap-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          Verificando...
        </Badge>
      );
    }

    if (isEnabled) {
      return (
        <Badge className="gap-1 bg-green-500 hover:bg-green-600">
          <CheckCircle className="w-3 h-3" />
          Ativo
        </Badge>
      );
    }

    if (status.permission === 'denied') {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="w-3 h-3" />
          Bloqueado
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="gap-1">
        <AlertCircle className="w-3 h-3" />
        Desativado
      </Badge>
    );
  };

  // Lidar com toggle de notificações
  const handleToggle = async (checked: boolean) => {
    setIsToggling(true);
    
    try {
      if (checked) {
        await requestPermission();
      } else {
        await disableNotifications();
      }
    } finally {
      setIsToggling(false);
    }
  };

  // Mostrar instruções específicas para iOS
  const shouldShowIOSInstructions = status.isIOS && !status.isStandalone;
  const shouldShowIOSVersionWarning = status.isIOS && status.iOSVersion < 16.4;

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
      {/* Card Principal */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Bell className="w-6 h-6" />
                Notificações Push
              </CardTitle>
              <CardDescription>
                Receba alertas importantes sobre seus pontos e prêmios
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Toggle Principal */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              {isEnabled ? (
                <Bell className="w-5 h-5 text-green-500" />
              ) : (
                <BellOff className="w-5 h-5 text-gray-400" />
              )}
              <Label htmlFor="notifications-toggle" className="text-base font-medium cursor-pointer">
                Ativar notificações
              </Label>
            </div>
            <Switch
              id="notifications-toggle"
              checked={isEnabled}
              onCheckedChange={handleToggle}
              disabled={isToggling || status.isLoading || status.permission === 'denied'}
              data-testid="switch-notifications"
            />
          </div>

          {/* Avisos e Status */}
          {shouldShowIOSVersionWarning && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Versão do iOS não compatível</AlertTitle>
              <AlertDescription>
                Seu dispositivo está rodando iOS {status.iOSVersion.toFixed(1)}. 
                É necessário iOS 16.4 ou superior para receber notificações push.
                Por favor, atualize seu sistema operacional.
              </AlertDescription>
            </Alert>
          )}

          {shouldShowIOSInstructions && !shouldShowIOSVersionWarning && (
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
              <Smartphone className="h-4 w-4 text-blue-500" />
              <AlertTitle className="text-blue-900 dark:text-blue-100">
                Instalação necessária no iPhone
              </AlertTitle>
              <AlertDescription className="space-y-2">
                <p className="text-blue-800 dark:text-blue-200">
                  Para receber notificações no iPhone/iPad, você precisa instalar o app:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700 dark:text-blue-300">
                  <li>Toque no botão de compartilhar do Safari</li>
                  <li>Selecione "Adicionar à Tela de Início"</li>
                  <li>Confirme a instalação</li>
                  <li>Abra o app instalado e ative as notificações</li>
                </ol>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setShowInstructions(!showInstructions)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Ver instruções detalhadas
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {status.permission === 'denied' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Notificações bloqueadas</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>As notificações foram bloqueadas no seu navegador.</p>
                <p className="text-sm">Para reativar:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Clique no ícone de cadeado na barra de endereços</li>
                  <li>Encontre a opção "Notificações"</li>
                  <li>Altere para "Permitir"</li>
                  <li>Recarregue a página</li>
                </ol>
              </AlertDescription>
            </Alert>
          )}

          {status.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{status.error}</AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* Informações e Ações */}
          <div className="space-y-4">
            {/* Status Detalhado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">Status do Sistema</h3>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Suporte do navegador:</span>
                    <span className="font-medium">
                      {status.isSupported ? (
                        <span className="text-green-600">✓ Suportado</span>
                      ) : (
                        <span className="text-red-600">✗ Não suportado</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Permissão:</span>
                    <span className="font-medium capitalize">
                      {status.permission === 'granted' ? 'Concedida' : 
                       status.permission === 'denied' ? 'Negada' : 'Pendente'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Token FCM:</span>
                    <span className="font-medium">
                      {status.token ? '✓ Registrado' : '✗ Não registrado'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500">Informações do Dispositivo</h3>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Sistema:</span>
                    <span className="font-medium">
                      {status.isIOS ? `iOS ${status.iOSVersion.toFixed(1)}` : 'Outro'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">PWA instalado:</span>
                    <span className="font-medium">
                      {status.isStandalone ? '✓ Sim' : '✗ Não'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">HTTPS:</span>
                    <span className="font-medium">
                      {window.location.protocol === 'https:' ? '✓ Seguro' : '✗ Não seguro'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => sendTestNotification()}
                disabled={!isEnabled || status.isLoading}
                variant="outline"
                className="flex-1"
                data-testid="button-test-notification"
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar Notificação de Teste
              </Button>
              
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="flex-1"
              >
                <Settings className="w-4 h-4 mr-2" />
                Recarregar Configurações
              </Button>
            </div>
          </div>

          {/* Benefícios das Notificações */}
          <Separator />
          
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Por que ativar notificações?</h3>
            <div className="grid gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Alertas de pontos ganhos</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Saiba quando atingir metas importantes
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Novidades e promoções</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Fique por dentro das oportunidades especiais
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Avisos de segurança</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receba alertas sobre atividades na sua conta
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card de Instruções Detalhadas (quando expandido) */}
      {showInstructions && shouldShowIOSInstructions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Instruções Detalhadas para iOS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Passo 1: Abra no Safari</h4>
                <p className="text-sm text-gray-600">
                  Certifique-se de estar usando o navegador Safari. 
                  As notificações não funcionam em outros navegadores no iOS.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Passo 2: Toque no botão de compartilhar</h4>
                <p className="text-sm text-gray-600">
                  Procure o ícone de compartilhar (quadrado com seta para cima) 
                  na barra inferior do Safari.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Passo 3: Adicione à tela inicial</h4>
                <p className="text-sm text-gray-600">
                  Role as opções e encontre "Adicionar à Tela de Início". 
                  Dê um nome ao app e confirme.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Passo 4: Abra o app instalado</h4>
                <p className="text-sm text-gray-600">
                  Encontre o ícone do RádioPlay na sua tela inicial e abra. 
                  Agora você poderá ativar as notificações!
                </p>
              </div>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Importante:</strong> As notificações só funcionam quando o app 
                está instalado na tela inicial. Este é um requisito do iOS para segurança.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}