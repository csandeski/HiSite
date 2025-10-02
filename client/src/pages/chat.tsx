import { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Send, ChevronLeft, Shield } from "lucide-react";
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
  "pessoal online funcionando", "dia produtivo pra todos",
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
  "novato mas animado", "aprendendo sempre",
  "seguindo firme", "progredindo bem",
  "evoluindo sempre", "melhorando muito",
  "resultados crescentes", "cada dia melhor",
  "rendimento ótimo", "ganhos constantes",
  "sucesso garantido", "funcionando perfeitamente",
  
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
  
  // Time-related messages (30)
  "bom dia pessoal, começando agora",
  "boa tarde, como estão?",
  "boa noite galera, produzindo aqui",
  "madrugada produtiva aqui",
  "manhã rendendo bem",
  "tarde tranquila ganhando",
  "noite lucrativa",
  "hoje está ótimo",
  "dia produtivo",
  "período excelente",
  "momento perfeito",
  "tempo bom pra ganhar",
  "hora certa",
  "agora mesmo funcionando",
  "período de ganhos",
  "trabalhando aqui agora",
  "ganhando dinheiro sempre",
  "começando bem hoje",
  "produtividade total",
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

// Additional message templates from user feedback - more realistic variations
const additionalMessageTemplates = [
  "Caiu R$150 aqui, confirmo!",
  "Tô desde ontem e já vi pagamento",
  "Saque de R$200 caiu certinho",
  "Funcionando direitinho, sem erro",
  "Recebi via Pix em 1 hora",
  "Indiquei e foi aprovado pra galera",
  "Tá pagando mesmo, testei hoje",
  "Primeiro saque R$150, chegou",
  "Simples de usar e saque rápido",
  "Caiu aqui, print no privado",
  "To desde ontem e já saquei duas vezes",
  "Pagamento em menos de 24h",
  "Gosto da interface, fácil de sacar",
  "Funcionou no 4G, sem problema",
  "Troquei por crédito e entrou",
  "Testei no fim de semana e caiu",
  "Recomendo testar por 3 dias",
  "Saque de R$300 quase batendo",
  "Sim, pagamentos regulares",
  "Funcionou no meu celular antigo",
  "Enviei dados e liberou saque",
  "É simples: deixa tocando e soma",
  "Caiu R$180, confere no extrato",
  "Consolidei pontos e saquei",
  "To usando toda noite, acumulou",
  "Recebi aviso e transferência",
  "Surpreso com a rapidez do saque",
  "Ganhando enquanto escuto rádio",
  "Primeiro teste deu certo",
  "Caiu R$150 no mesmo dia",
  "Indiquei 3 amigos, também caiu",
  "Fácil de operar, nota 10",
  "Tô quase no saque de R$300",
  "Confere no extrato que bate",
  "Usei transfer e entrou",
  "Selo de confiança pra mim",
  "ACABOU DE CAIR AQUI TBM 🙂",
  "Realmente funcionou, testei",
  "Caiu R$220, show",
  "Valeu a pena testar a noite",
  "Saque rápido, sem burocracia",
  "Recomendo deixar tocar no carro",
  "Fiz o cadastro e saque aprovado",
  "To em 8 dias e tá rendendo",
  "Recebi dois saques essa semana",
  "Confirmado: R$150 creditado",
  "Perguntei no suporte e resolveram",
  "Testei no Wi-Fi e no 4G, ok",
  "Tô quase no meu primeiro grande saque",
  "Peguei R$170 ontem",
  "Aprovado, recomendo pra família",
  "Confere extrato, pagou certinho",
  "Pop, caiu no mesmo dia",
  "Rende enquanto ouço podcast",
  "R$350? Tá próximo, tô juntando",
  "Curti, bem transparente",
  "Entrada de pontos constante",
  "Indicando no grupo do zap",
  "Teste rápido e saque ok",
  "Caiu dois saques pequenos aqui",
  "Funciona direto no background",
  "R$150 já saiu da minha conta",
  "Não demorou pra processar",
  "Confirmei e recebi por pix",
  "Meus amigos também sacaram",
  "Plataforma está estável",
  "To acumulando pra saque maior",
  "Entrou no extrato no mesmo dia",
  "Rápido e sem pegadinhas",
  "To desde ontem e já vi retorno",
  "Recebi notificação do saque",
  "Funcionou no meu aparelho velho",
  "Testei com fone bluetooth, ok",
  "Ajuda do suporte foi top",
  "Indiquei e viram resultado",
  "R$200 caiu hoje cedo",
  "Simples de entender o fluxo",
  "To quase no saque de R$300",
  "Pessoal, confere extrato sempre",
  "Processamento ágil no pix",
  "Usei carteira digital sem problema",
  "Caiu R$160, sem erro",
  "To fazendo com 2 aparelhos",
  "Bonito ver o saldo subir",
  "Confirmado que paga rápido",
  "Transfiro e cai na hora",
  "Indiquei 4 e todos receberam",
  "Vale a pena testar por uma semana",
  "Saiu R$150, tô feliz",
  "Tô testando por 3 dias, funciona",
  "Saque pequeno caiu hoje",
  "Resultado real no extrato",
  "Teste positivo aqui também",
  "Pagamentos consistentes",
  "To ganhando enquanto estudo",
  "Caiu aqui, vou tirar print",
  "R$180 entrou sem erro",
  "Pessoal acredita, tá pagando",
  "Fiz saque e veio no dia",
  "Recomendo deixar tocar algumas horas",
  "Aprovado, saque feito via pix",
  "Funcionou no meu tablet",
  "Indiquei no trampo e sacaram",
  "Pagamento autêntico, testei",
  "To acumulando pro saque maior",
  "R$200 caiu e entrou no extrato",
  "To desde ontem e já saquei",
  "Simples e direto, gostei",
  "Caiu R$150, comprovei",
  "Vale a pena ficar ativo",
  "Confere o histórico, tá lá",
  "Pagamento transparente",
  "Indiquei e recebi retorno",
  "Testei e confirmei pagamento",
  "To quase nos R$300",
  "Entrou rápido no meu banco",
  "Gosto do suporte que responde",
  "R$150 creditado hoje",
  "Postei print internamente",
  "Funciona com dados e wi-fi",
  "Tô deixando no background sempre",
  "Saque pequeno entrou sem erro",
  "Fácil de acompanhar o extrato",
  "Confirmei saque e chegou",
  "Recompensa chegando certinha",
  "To testando 24h e soma",
  "Recebi 2 saques na semana",
  "Caiu no banco rapidinho",
  "Tô quase batendo a meta",
  "Gosto do layout do app",
  "R$200 confirmado no extrato",
  "Minha mãe também confirmou saque",
  "Entrou no dia seguinte",
  "Confirmado e recomendo",
  "Testei hoje e funcionou",
  "Deixei rodando e juntou pontos",
  "Funcionou no meu Android antigo",
  "Caiu, print aqui",
  "Interessante e prático",
  "Paguei por carteira digital",
  "To juntando pra R$300",
  "Atendimento rápido, saque ok",
  "Teste real: entrou certinho",
  "Indiquei e resultou",
  "Saque confirmado em 12h",
  "Pra mim caiu no mesmo dia",
  "Tudo certo até agora",
  "Recomendo rotina de ouvir",
  "R$150 garantido aqui",
  "Recebi o pagamento na conta",
  "To testando com 3 contas",
  "Rendeu rápido, gostei",
  "Não tive problemas de saque",
  "Entrou R$200, confere",
  "Vou fazer novo saque semana que vem",
  "Simples e objetivo",
  "Indiquei e amigos confirmaram",
  "To acumulando e já saquei",
  "Caiu R$170, sem mistério",
  "Confirmei via print",
  "To deixando rodar a noite",
  "Pagamento registrado no extrato",
  "Rápido e prático, recomendo",
  "To quase no saque de R$400",
  "Funciona em background no Android",
  "Entrou por transferência",
  "To desde domingo e saquei",
  "Pessoal, confere o extrato mesmo",
  "Caiu R$150 no meu banco",
  "To indicando no grupo da família",
  "Pagamento ágil pra mim",
  "To feliz com os saques",
  "Confirmei e veio certinho",
  "Testei e funcionou rápido",
  "Entrou R$200, comprovado",
  "Recomendo pra quem escuta muito",
  "Saque baixinho mas constante",
  "Pagamento sem burocracia",
  "To acumulando pontos todo dia",
  "Caiu R$150 ontem à noite",
  "Teste positivo no meu caso",
  "Sim, pagou no mesmo dia",
  "Fiquei surpresa com rapidez",
  "To com 3 saques esse mês",
  "Testei e foi aprovado",
  "To quase no saque de R$250",
  "To usando no trabalho, soma bem",
  "Recebi via Pix, 1 hora",
  "Testado e aprovado por mim",
  "Confere no extrato que entra",
  "Indiquei e deu certo pro pessoal",
  "Funcionou sem travar",
  "Tô acumulando enquanto viajo",
  "Recebi 2 saques na semana passada",
  "R$180 confirmado aqui",
  "To no app desde sábado e já saquei",
  "Tudo certo, nota 10",
  "Teste aqui também ok",
  "Saque caiu e notificou",
  "Recomendo testar 48h",
  "Resultado rápido nas primeiras horas",
  "Caiu certinho, print no privado",
  "To quase no saque grande",
  "Funcionou com chip pré-pago",
  "Confere o valor no extrato",
  "Indicando pra galera do trabalho",
  "Recebi por transferência rápida",
  "Tô com 2 saques este mês",
  "Simples de sacar e receber",
  "To testando no celular da minha mãe",
  "Entrou R$150 aqui também",
  "Confere no extrato e atualiza",
  "To acumulando e feliz",
  "R$200 já confirmado no meu banco",
  "Sistema estável, saque OK",
  "Recomendo deixar no modo automático",
  "To desde ontem, pagamento ok",
  "Saque processado rápido",
  "Já recebi duas vezes",
  "To juntando pra meta de R$300",
  "Caiu R$150, sem enrolação",
  "Sim, funciona em segundo plano",
  "Confere na aba extrato",
  "To indicando e recebendo feedback",
  "Pagamento chegou hoje cedo",
  "Saque confirmado por Pix",
  "To testando desde ontem, ok",
  "Entrou no aplicativo e no banco",
  "Rapidez no pagamento me surpreendeu",
  "To quase bate os R$300",
  "Recomendo rodar à noite",
  "To testando em 2 aparelhos",
  "Caiu R$200, comprovado",
  "Vale o teste por alguns dias",
  "To registrando cada saque",
  "Funcionou aqui, recomendo",
  "Entrada no extrato em poucas horas",
  "To juntando pra saque maior",
  "Caiu R$150, sem problema",
  "Indiquei pro meu grupo da família",
  "Teste de 48h deu positivo",
  "Recebi transferência hoje",
  "To com 3 saques este mês",
  "To curtindo a facilidade do app",
  "Saque confirmado e show",
  "Recomendo deixar tocando umas horas",
  "Caiu rápido, processo simples"
];

// Combine all message templates
const allMessageTemplates = [...messageTemplates, ...additionalMessageTemplates];

export default function Chat() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { messages, addMessage } = useChat();
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const usedAdminMessagesRef = useRef<string[]>([]);
  
  // Admin messages array - expanded for more variety
  const adminMessages = [
    "Todos os saques foram concluídos com sucesso pessoal! Qualquer dúvida basta chamar no suporte WhatsApp ou abrir um ticket!",
    "Lembrete: Mantenha seu app sempre atualizado para melhor experiência!",
    "Sistema funcionando 100% sem instabilidades. Bons ganhos a todos!",
    "Nova atualização disponível com melhorias de desempenho!",
    "Suporte online 24/7 para ajudar vocês. Não hesitem em perguntar!",
    "Atenção: Processamento de saques hoje está mais rápido que o normal! 🚀",
    "Parabéns aos novos usuários que começaram hoje! Bem-vindos à comunidade!",
    "Informamos que todos os pagamentos PIX estão sendo processados normalmente.",
    "Dica do Admin: Ouçam as rádios premium para ganhar mais pontos!",
    "Aviso: Manutenção programada para domingo às 3h da manhã. Durará apenas 15 minutos.",
    "Estatística do dia: Mais de R$ 50.000 em saques processados nas últimas 24h!",
    "Lembrete: Verificação de conta é obrigatória para saques acima de R$ 100.",
    "Novidade: Em breve teremos novas rádios parceiras com pontos extras!",
    "Importante: Sempre use a versão oficial do app para evitar problemas.",
    "Comunicado: Taxa de autorização continua em R$ 29,90 sem alterações!",
    "Pessoal, estamos monitorando todos os saques. Tudo funcionando perfeitamente!",
    "Boa notícia: Tempo médio de aprovação de saques reduzido para 5 minutos!",
    "Segurança: Nunca compartilhem suas senhas com ninguém!",
    "Atualização: Novo sistema de pontos implementado com sucesso!",
    "Feedback positivo: 98% de aprovação dos usuários este mês! Obrigado!",
    "Alerta: Cuidado com apps falsos. Use apenas o RádioPlay oficial!",
    "Informativo: Nosso suporte responde em até 2 horas via WhatsApp.",
    "Conquista: Batemos recorde de usuários ativos simultaneamente!",
    "Melhoria: Sistema de chat atualizado para melhor performance.",
    "Esclarecimento: Não há limite diário para saques após autorização!"
  ];
  
  // Get next unique admin message
  const getNextAdminMessage = () => {
    // Reset if all messages have been used
    if (usedAdminMessagesRef.current.length >= adminMessages.length) {
      usedAdminMessagesRef.current = [];
    }
    
    // Find unused messages
    const unusedMessages = adminMessages.filter(
      msg => !usedAdminMessagesRef.current.includes(msg)
    );
    
    // Pick a random unused message
    const selectedMessage = unusedMessages[Math.floor(Math.random() * unusedMessages.length)];
    usedAdminMessagesRef.current.push(selectedMessage);
    
    return selectedMessage;
  };
  
  // Auto-generate messages
  useEffect(() => {
    // Generate initial messages if chat is empty
    if (messages.length === 0) {
      // Success/payment focused messages for initial chat
      const successMessages = [
        "Caiu R$150 aqui, confirmo!",
        "Saque de R$200 caiu certinho",
        "Recebi via Pix em 1 hora",
        "Primeiro saque R$150, chegou",
        "Pagamento em menos de 24h",
        "R$180 entrou sem erro",
        "Aprovado, saque feito via pix",
        "R$200 caiu e entrou no extrato",
        "Caiu R$150, comprovei",
        "Entrou rápido no meu banco",
        "R$150 creditado hoje",
        "Confirmei saque e chegou",
        "R$200 confirmado no extrato",
        "Testei hoje e funcionou",
        "Caiu, print aqui",
        "To juntando pra R$300",
        "Teste real: entrou certinho",
        "Saque confirmado em 12h",
        "Pra mim caiu no mesmo dia",
        "R$150 garantido aqui",
        "Recebi o pagamento na conta",
        "Entrou R$200, comprovado",
        "Pagamento sem burocracia",
        "Caiu R$150 ontem à noite",
        "Sim, pagou no mesmo dia",
        "To com 3 saques esse mês",
        "primeiro saque de 150 reais caiu em 2 minutos!",
        "já fiz 3 saques essa semana, todos caíram certinho",
        "meu primeiro saque de 200 caiu agora mesmo!",
        "caiu 300 reais agora na minha conta",
        "fiz 5 saques até agora, todos aprovados"
      ];
      
      // Add 8-12 initial messages that appear to be from 2 minutes ago
      const initialCount = 8 + Math.floor(Math.random() * 5);
      
      // Generate messages with timestamps from 2-5 minutes ago
      const now = new Date();
      
      for (let i = 0; i < initialCount; i++) {
        // Calculate timestamp for this message (2-5 minutes ago, staggered)
        const minutesAgo = 5 - (i * 0.3); // Messages get progressively more recent
        const messageTime = new Date(now.getTime() - (minutesAgo * 60 * 1000));
        const timestamp = `${messageTime.getHours().toString().padStart(2, '0')}:${messageTime.getMinutes().toString().padStart(2, '0')}`;
        
        // Add regular user messages focusing on success
        if (i === 3 || i === 7) {
          // Add admin message at position 3 and 7
          addMessage({
            name: "Administrador RádioPlay",
            message: i === 3 ? 
              "Sistema funcionando 100% sem instabilidades. Bons ganhos a todos!" : 
              "Todos os saques foram concluídos com sucesso pessoal! Qualquer dúvida basta chamar no suporte WhatsApp!",
            isVerified: false,
            isOwnMessage: false,
            isAdmin: true,
            timestamp: timestamp
          });
        } else {
          const randomName = brazilianNames[Math.floor(Math.random() * brazilianNames.length)];
          const randomMessage = successMessages[Math.floor(Math.random() * successMessages.length)];
          
          addMessage({
            name: randomName,
            message: randomMessage,
            isVerified: true,
            isOwnMessage: false,
            timestamp: timestamp
          });
        }
      }
    }
    
    // Set up interval for regular messages
    const generateRandomMessage = () => {
      // 70% chance to generate a regular message
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
            const followUpMessage = allMessageTemplates[Math.floor(Math.random() * allMessageTemplates.length)];
            
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
    
    // Random interval between 2-5 seconds for regular messages
    const regularIntervalId = setInterval(() => {
      generateRandomMessage();
    }, 2000 + Math.random() * 3000);
    
    // Set up separate interval for admin messages every 2 minutes
    const adminIntervalId = setInterval(() => {
      addMessage({
        name: "Administrador RádioPlay",
        message: getNextAdminMessage(),
        isVerified: false,
        isOwnMessage: false,
        isAdmin: true
      });
    }, 120000); // Exactly 2 minutes
    
    // Send first admin message after 30 seconds
    const initialAdminTimeout = setTimeout(() => {
      addMessage({
        name: "Administrador RádioPlay",
        message: getNextAdminMessage(),
        isVerified: false,
        isOwnMessage: false,
        isAdmin: true
      });
    }, 30000); // 30 seconds for first admin message
    
    return () => {
      clearInterval(regularIntervalId);
      clearInterval(adminIntervalId);
      clearTimeout(initialAdminTimeout);
    };
  }, [addMessage, messages.length]);
  
  // Auto scroll disabled per user request
  // User wants to manually control scroll position
  // useEffect(() => {
  //   if (lastMessageRef.current) {
  //     lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
  //   }
  // }, [messages]);
  
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
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-50">
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
      
      {/* Spacer for fixed header */}
      <div className="h-[68px]"></div>
      
      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4 py-3 bg-gray-100" ref={scrollAreaRef}>
        <div className="max-w-2xl mx-auto space-y-3">
          {messages.map((msg, index) => (
            <div
              key={msg.id}
              className={`flex ${msg.isOwnMessage ? 'justify-end' : msg.isAdmin ? 'justify-center' : 'justify-start'}`}
              data-testid={`message-${msg.id}`}
            >
              {msg.isAdmin ? (
                // Admin message with special styling
                <div className="w-full max-w-[90%] md:max-w-[70%] bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-orange-300 rounded-xl px-4 py-3 shadow-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-bold text-orange-800">
                      [{msg.timestamp}] {msg.name} 🛡️
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-800">{msg.message}</div>
                </div>
              ) : (
                // Regular message
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
              )}
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