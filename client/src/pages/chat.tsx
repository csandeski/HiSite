import { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Send, ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";
import logoUrl from '@/assets/logo.png';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';

// Array of Brazilian names for generating messages
const brazilianNames = [
  "Marcelo Rocha", "Ana Silva", "Pedro Santos", "Julia Costa", "Lucas Oliveira",
  "Mariana Lima", "Gabriel Souza", "Beatriz Almeida", "Rafael Pereira", "Larissa Ferreira",
  "Bruno Rodrigues", "Camila Martins", "Thiago Gomes", "Amanda Ribeiro", "João Paulo",
  "Isabella Cardoso", "Daniel Nascimento", "Sophia Vieira", "Matheus Barbosa", "Leticia Dias",
  "Carlos Alberto", "Patricia Mendes", "Fernando Cruz", "Vanessa Lopes", "Ricardo Araújo",
  "Juliana Castro", "André Silva", "Monica Santos", "Roberto Carlos", "Tatiana Ramos",
  "Marcos Paulo", "Aline Souza", "Eduardo Lima", "Fernanda Costa", "Gustavo Henrique",
  "Carolina Machado", "Leonardo Silva", "Priscila Oliveira", "Diego Fernandes", "Natalia Alves",
  "Paulo Roberto", "Sandra Regina", "José Carlos", "Maria Clara", "Antonio Silva",
  "Bruna Rodrigues", "Felipe Costa", "Renata Souza", "Vinicius Lima", "Jessica Santos",
  "Rodrigo Almeida", "Cristina Ferreira", "Alexandre Martins", "Laura Beatriz", "Caio César",
  "Michele Oliveira", "Fabio Santos", "Sabrina Costa", "Wellington Silva", "Bianca Lima",
  "Sergio Mendes", "Adriana Paula", "Marcio Roberto", "Elaine Cristina", "Luciano Santos",
  "Raquel Silva", "Alan Costa", "Carla Souza", "Renan Lima", "Viviane Oliveira",
  "Claudio Santos", "Rosana Costa", "Henrique Silva", "Debora Lima", "Wagner Souza",
  "Luciana Ferreira", "Igor Santos", "Simone Costa", "Danilo Silva", "Kelly Oliveira",
  "Francisco José", "Regina Maria", "Renato Carlos", "Elisa Santos", "Bruno César"
];

// Generate 300+ message variations
const messageTemplates = [
  // Greetings (20)
  "Oi", "opa", "opa pessoal!", "Olá galera", "Bom dia", "Boa tarde", "Boa noite",
  "E aí pessoal", "Fala galera", "Oi gente", "Salve salve", "Olá a todos",
  "Opa, tudo bem?", "E aí, como tá?", "Bom dia família", "Boa tarde galera",
  "Fala aí", "Beleza?", "Tudo certo?", "Oi pessoal!",
  
  // Questions about functionality (30)
  "realmente funciona?", "é gente real aqui?", "alguém já sacou mesmo?",
  "isso é verdade?", "quanto tempo demora pra sacar?", "é confiável?",
  "alguém pode confirmar?", "funciona mesmo?", "é seguro?",
  "qual o valor mínimo?", "como faço pra sacar?", "precisa de documento?",
  "tem alguma pegadinha?", "é rápido o saque?", "cai na hora?",
  "qual banco aceita?", "funciona com Nubank?", "aceita PIX?",
  "tem taxa?", "cobra alguma coisa?", "é de graça mesmo?",
  "quantos pontos precisa?", "como ganho mais rápido?", "tem limite diário?",
  "posso sacar todo dia?", "tem horário específico?", "funciona fim de semana?",
  "alguém me ajuda?", "como começar?", "é difícil?",
  
  // Success stories (40)
  "eu estou a 8 dias aqui consegui 6 saques de quase 350 caiu certinho aqui",
  "primeiro saque de 150 reais caiu em 2 minutos!",
  "já fiz 3 saques essa semana, todos caíram certinho",
  "consegui pagar minha conta de luz com os pontos",
  "450 reais em 10 dias, tô impressionado",
  "meu primeiro saque de 200 caiu agora mesmo!",
  "já somei mais de 1000 reais esse mês",
  "caiu 300 reais agora na minha conta",
  "fiz 5 saques até agora, todos aprovados",
  "consegui juntar 600 reais em duas semanas",
  "paguei meu cartão com o dinheiro daqui",
  "já tirei 800 reais no total",
  "meu saque de 250 foi aprovado em 1 minuto",
  "consegui fazer 2 saques hoje",
  "juntei 400 reais só essa semana",
  "minha mãe não acreditou quando mostrei o extrato",
  "já paguei 3 boletos com o dinheiro daqui",
  "fiz 350 reais em 5 dias",
  "consegui comprar o presente do meu filho",
  "tirei 500 reais mês passado",
  "já são 12 saques aprovados",
  "1200 reais em um mês, inacreditável!",
  "paguei minha internet com os pontos",
  "fiz meu primeiro saque de 100 e já caiu",
  "300 reais em 3 dias de uso",
  "já tirei mais de 2000 no total",
  "comprei um celular novo com o dinheiro",
  "600 reais esse mês já",
  "meu marido ficou surpreso com o saque",
  "dá pra fazer uma renda extra boa aqui",
  "já indiquei pra toda família",
  "melhor que muitos apps por aí",
  "350 reais caíram agora mesmo!",
  "consegui pagar o aluguel",
  "já fiz 8 saques esse mês",
  "tirei 200 ontem e já caiu hoje",
  "minha prima também está ganhando",
  "450 reais em uma semana!",
  "nunca vi algo tão rápido",
  "já somei 1500 reais",
  
  // Confirmations (30)
  "aqui tbm caiu certinho", "ACABOU DE CAIR AQUI TBM",
  "confirmo, caiu agora", "sim, funciona mesmo",
  "verdade, já recebi", "pode confiar",
  "é real sim", "caiu em 2 minutos",
  "confirmado!", "deu certo aqui",
  "aprovado na hora", "recebi agora mesmo",
  "tudo certo por aqui", "funcionou perfeitamente",
  "sem problemas aqui", "100% confiável",
  "pode fazer sem medo", "é seguro sim",
  "já testei e aprovo", "recomendo!",
  "vale muito a pena", "melhor app",
  "estou adorando", "muito bom mesmo",
  "excelente!", "perfeito!",
  "sem pegadinhas", "transparente",
  "rápido e fácil", "super indico",
  
  // Progress updates (30)
  "estou quase batendo meu primeiro saque de 300",
  "faltam 500 pontos pro próximo saque",
  "já tenho 8000 pontos acumulados",
  "mais 2 dias e faço outro saque",
  "70% da meta diária completa",
  "consegui 2000 pontos hoje",
  "batendo 10000 pontos essa semana",
  "falta pouco pra próxima retirada",
  "já passei dos 5000 pontos",
  "meta de hoje concluída!",
  "15000 pontos e subindo",
  "quase lá, faltam 300 pontos",
  "80% do objetivo alcançado",
  "mais uma hora e completo a meta",
  "12000 pontos acumulados",
  "próximo saque amanhã!",
  "consegui metade da meta",
  "3000 pontos em um dia",
  "recorde pessoal: 4000 pontos",
  "batendo todas as metas",
  "20000 pontos no total",
  "mais 1000 e faço o saque",
  "90% completo",
  "quase batendo 25000",
  "melhor dia até agora",
  "superando expectativas",
  "6000 pontos hoje!",
  "faltam só 100 pontos",
  "objetivo quase completo",
  "30000 pontos acumulados!",
  
  // Reactions and enthusiasm (40)
  "kkkkkk muito bom", "kkkkk não acredito",
  "😍😍😍", "🎉🎉🎉", "💰💰💰",
  "que maravilha!", "incrível!",
  "tô muito feliz", "emocionado aqui",
  "não esperava isso", "surreal!",
  "melhor coisa que fiz", "valeu a pena",
  "tô sem palavras", "sensacional",
  "showwww", "toppppp",
  "massa demais", "que legal!",
  "amando isso", "viciado já kkk",
  "não consigo parar", "muito bom mesmo",
  "recomendo demais", "nota 10",
  "perfeito galera", "sem defeitos",
  "5 estrelas", "aprovadíssimo",
  "mega recomendo", "façam também",
  "não percam tempo", "comecem logo",
  "melhor decisão", "mudou minha vida",
  "ajudando muito aqui", "salvou meu mês",
  "dinheiro extra sempre", "abençoado 🙏",
  "gratidão 🙏", "Deus abençoe",
  
  // Mixed conversations (40)
  "alguém online?", "como tá o dia de vcs?",
  "boa sorte pra todos", "vamos que vamos",
  "força galera", "todo mundo ganhando",
  "sucesso pra todos", "juntos somos mais fortes",
  "comunidade top", "pessoal aqui é show",
  "adorando o grupo", "galera ajuda muito",
  "obrigado pelas dicas", "valeu pessoal",
  "aprendi muito aqui", "dicas valiosas",
  "seguindo as orientações", "fazendo como ensinaram",
  "dica de ouro funciona", "testei a estratégia",
  "rendimento aumentou", "melhorando cada dia",
  "evolução constante", "aprendendo sempre",
  "compartilhando experiência", "minha história aqui",
  "começei ontem", "primeira semana",
  "um mês usando", "veterano aqui",
  "novato mas animado", "aprendendo ainda",
  "alguém me explica?", "preciso de ajuda",
  "como melhorar?", "alguma dica?",
  "estratégia boa?", "o que recomendam?",
  "horário bom?", "quando é melhor?",
  "final de semana rende?", "feriado funciona?",
  "madrugada vale a pena?", "manhã é melhor?",
  
  // Specific amounts and transactions (40)
  "R$ 50 na conta", "R$ 100 aprovado",
  "R$ 150 caiu agora", "R$ 200 confirmado",
  "R$ 250 recebido", "R$ 300 no PIX",
  "R$ 350 transferido", "R$ 400 na carteira",
  "R$ 450 sacado", "R$ 500 liberado",
  "saque de R$ 75", "retirada de R$ 125",
  "ganho de R$ 175", "lucro de R$ 225",
  "extra de R$ 275", "bônus de R$ 325",
  "prêmio de R$ 375", "valor de R$ 425",
  "quantia de R$ 475", "montante de R$ 525",
  "PIX de 80 reais", "transferência de 120",
  "depósito de 180", "crédito de 220",
  "entrada de 280", "recebimento de 320",
  "pagamento de 380", "valor de 420",
  "saldo de 480", "total de 520",
  "primeiro saque: 60", "segundo saque: 110",
  "terceiro saque: 160", "quarto saque: 210",
  "quinto saque: 260", "sexto saque: 310",
  "sétimo saque: 360", "oitavo saque: 410",
  "nono saque: 460", "décimo saque: 510",
  
  // Doubts and concerns (30)
  "será que é verdade?", "tenho medo de golpe",
  "alguém teve problema?", "é seguro mesmo?",
  "posso confiar?", "não é scam?",
  "tem comprovante?", "mostra o extrato?",
  "prova que funciona?", "cadê a prova?",
  "desconfiado ainda", "tô com dúvida",
  "explicam melhor?", "como ter certeza?",
  "garantia existe?", "e se der erro?",
  "suporte responde?", "ajuda disponível?",
  "documentação necessária?", "CPF obrigatório?",
  "dados protegidos?", "privacidade garantida?",
  "empresa confiável?", "há quanto tempo existe?",
  "reclamações resolvidas?", "atendimento bom?",
  "demora quanto?", "prazo real?",
  "taxas escondidas?", "custos extras?",
  
  // Time-related messages (30)
  "bom dia pessoal, começando agora",
  "boa tarde, como estão?",
  "boa noite galera, ainda dá tempo?",
  "madrugada produtiva aqui",
  "manhã rendendo bem",
  "tarde tranquila ganhando",
  "noite lucrativa",
  "fim de semana top",
  "segunda começando bem",
  "terça produtiva",
  "quarta no lucro",
  "quinta pagando",
  "sexta abençoada",
  "sábado de ganhos",
  "domingo também rende",
  "feriado trabalhando aqui",
  "férias ganhando dinheiro",
  "mês começando bem",
  "semana produtiva",
  "dia excelente",
  "hora de ganhar",
  "momento perfeito",
  "agora é a hora",
  "tempo é dinheiro",
  "aproveitando o tempo",
  "cada minuto conta",
  "não perco tempo",
  "24h ganhando",
  "sempre ativo",
  "non-stop aqui",
  
  // Motivational (30)
  "não desistam!", "continuem tentando",
  "persistência é tudo", "foco no objetivo",
  "vamos conseguir", "acreditem",
  "tudo é possível", "sonhos realizam",
  "mudança de vida", "futuro melhor",
  "oportunidade única", "aproveitem",
  "momento é agora", "ação gera resultado",
  "sucesso garantido", "vitória certa",
  "caminho certo", "direção correta",
  "escolha acertada", "decisão inteligente",
  "investimento próprio", "retorno garantido",
  "lucro certo", "ganho real",
  "benefício imediato", "vantagem clara",
  "melhoria visível", "progresso notável",
  "avanço significativo", "crescimento constante",
  
  // Technical and help (20)
  "atualizem o app", "versão nova saiu",
  "bug corrigido", "problema resolvido",
  "erro solucionado", "funcionando normal",
  "sistema estável", "plataforma ok",
  "sem instabilidade", "tudo operacional",
  "manutenção concluída", "melhorias implementadas",
  "novidade disponível", "recurso novo",
  "função liberada", "opção adicional",
  "tutorial ajudou", "vídeo explicativo",
  "passo a passo", "guia completo"
];

export default function Chat() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { messages, addMessage } = useChat();
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  
  // Auto-generate messages
  useEffect(() => {
    // Generate initial messages if chat is empty
    if (messages.length === 0) {
      // Add 5-8 initial messages
      const initialCount = 5 + Math.floor(Math.random() * 4);
      for (let i = 0; i < initialCount; i++) {
        setTimeout(() => {
          const randomName = brazilianNames[Math.floor(Math.random() * brazilianNames.length)];
          const randomMessage = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
          
          addMessage({
            name: randomName,
            message: randomMessage,
            isVerified: true,
            isOwnMessage: false
          });
        }, i * 500); // Stagger initial messages
      }
    }
    
    // Set up interval for new messages
    const generateRandomMessage = () => {
      // 70% chance to generate a message
      if (Math.random() < 0.7) {
        const randomName = brazilianNames[Math.floor(Math.random() * brazilianNames.length)];
        const randomMessage = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
        
        addMessage({
          name: randomName,
          message: randomMessage,
          isVerified: true,
          isOwnMessage: false
        });
        
        // Sometimes add a follow-up message from same person
        if (Math.random() < 0.2) {
          setTimeout(() => {
            const followUpMessages = [
              "esqueci de falar", "ah, e também", "mais uma coisa",
              "detalhe importante", "pra complementar", "aliás"
            ];
            const followUp = followUpMessages[Math.floor(Math.random() * followUpMessages.length)];
            const followUpMessage = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
            
            addMessage({
              name: randomName,
              message: `${followUp}, ${followUpMessage}`,
              isVerified: true,
              isOwnMessage: false
            });
          }, 1000 + Math.random() * 2000);
        }
      }
    };
    
    // Random interval between 2-5 seconds
    const intervalId = setInterval(() => {
      generateRandomMessage();
    }, 2000 + Math.random() * 3000);
    
    return () => clearInterval(intervalId);
  }, [addMessage, messages.length]);
  
  // Auto scroll to bottom
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Handle send message
  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      addMessage({
        name: user?.fullName || user?.username || 'Você',
        message: inputMessage.trim(),
        isVerified: false,
        isOwnMessage: true
      });
      setInputMessage('');
      
      // Simulate someone typing and responding sometimes
      if (Math.random() < 0.3) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const responses = [
            "concordo com você", "boa pergunta", "também penso assim",
            "exatamente!", "isso mesmo", "verdade", "com certeza",
            "bem observado", "faz sentido", "boa!", "👍", "💯"
          ];
          const randomName = brazilianNames[Math.floor(Math.random() * brazilianNames.length)];
          const randomResponse = responses[Math.floor(Math.random() * responses.length)];
          
          addMessage({
            name: randomName,
            message: randomResponse,
            isVerified: true,
            isOwnMessage: false
          });
        }, 1500 + Math.random() * 2000);
      }
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Count online users (simulate)
  const [onlineCount, setOnlineCount] = useState(287);
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount(prev => {
        const change = Math.floor(Math.random() * 21) - 10; // -10 to +10
        const newCount = prev + change;
        return Math.max(250, Math.min(350, newCount)); // Keep between 250-350
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8"
                onClick={() => setLocation('/dashboard')}
                data-testid="button-back"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-semibold text-lg">Chat da Comunidade</h1>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Users className="w-3 h-3" />
                  <span>{onlineCount} online</span>
                  {isTyping && (
                    <>
                      <span className="mx-1">•</span>
                      <span className="text-primary">alguém digitando...</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <img src={logoUrl} alt="RádioPlay" className="h-7 object-contain" />
          </div>
        </div>
      </header>
      
      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4 py-3 bg-gray-100" ref={scrollAreaRef}>
        <div className="max-w-2xl mx-auto space-y-3">
          {messages.map((msg, index) => (
            <div
              key={msg.id}
              ref={index === messages.length - 1 ? lastMessageRef : undefined}
              className={`flex ${msg.isOwnMessage ? 'justify-end' : 'justify-start'}`}
              data-testid={`message-${msg.id}`}
            >
              <div
                className={`max-w-[80%] md:max-w-[60%] rounded-2xl px-4 py-2 shadow-sm ${
                  msg.isOwnMessage 
                    ? 'bg-primary text-white rounded-br-sm' 
                    : 'bg-white text-gray-800 rounded-bl-sm'
                }`}
              >
                <div className="text-xs opacity-75 mb-1">
                  [{msg.timestamp}] {msg.name} {msg.isVerified ? '✅' : ''}
                </div>
                <div className="text-sm break-words">{msg.message}</div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {/* Input Area */}
      <div className="bg-white border-t p-3 pb-20 md:pb-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="flex-1"
              data-testid="input-message"
            />
            <Button
              onClick={handleSendMessage}
              size="icon"
              className="w-10 h-10"
              disabled={!inputMessage.trim()}
              data-testid="button-send"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}