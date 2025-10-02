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

// Payment proof images
import pixProof1 from '@/assets/pix-proof-1.png';
import pixProof2 from '@/assets/pix-proof-2.png';
import pixProof3 from '@/assets/pix-proof-3.png';
import pixProof4 from '@/assets/pix-proof-4.png';
import pixProof5 from '@/assets/pix-proof-5.png';
import pixProof6 from '@/assets/pix-proof-6.png';

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
  
  // Success stories (40) - mais naturais e descontraídas
  "genteeee eu to a 8 dias aqui ja consegui 6 saques de quase 350 cada, caiu certinho na minha conta!!!",
  "meu primerio saque de 150 reais caiu em 2 minutos galera!! nao acreditei",
  "ja fiz 3 saques essa semana, todos cairam certinho... to impressionada",
  "consegui pagar minha conta de luz com os pontos que juntei aqui pessoal",
  "450 reais em 10 dias... to impressionado demais com isso",
  "meu primeiro saque de 200 caiu agora mesmo!!! to tremendo aqui kkkk",
  "ja somei mais de 1000 reais esse mês... nem eu to acreditando",
  "caiu 300 reais agora na minha conta do nubank galera",
  "fiz 5 saques até agora, todos aprovados rapidinho",
  "consegui juntar 600 reais em duas semanas ouvindo radio o dia todo",
  "paguei meu cartão com o dinheiro que ganhei aqui... aleluia",
  "ja tirei 800 reais no total desde que comecei mes passado",
  "meu saque de 250 foi aprovado em 1 minuto... nunca vi isso",
  "consegui fazer 2 saques hoje, um de 150 e outro de 200",
  "juntei 400 reais só essa semana deixando tocando direto",
  "minha mae nao acreditou quando mostrei o extrato kkkkkkk",
  "ja paguei 3 boletos com o dinheiro daqui... salvou meu mes",
  "fiz 350 reais em 5 dias... deixo tocando ate quando durmo",
  "consegui comprar o presente do meu filho com os pontos",
  "tirei 500 reais mes passado e esse mes ja to com 300",
  "ja sao 12 saques aprovados desde que comecei... tudo certinho",
  "1200 reais em um mês galera!!! inacreditavel mas é real",
  "paguei minha internet e ainda sobrou dinheiro",
  "fiz meu primeiro saque de 100 e ja caiu em 15 minutos",
  "300 reais em 3 dias de uso... to viciada nisso kkk",
  "ja tirei mais de 2000 no total... mudou minha vida",
  "comprei um celular novo com o dinheiro que juntei aqui",
  "600 reais esse mes ja... e ainda faltam 10 dias",
  "meu marido ficou chocado quando viu o saque na conta",
  "da pra fazer uma renda extra boa aqui gente... serio mesmo",
  "ja indiquei pra toda familia e todos tao ganhando",
  "melhor que muitos apps por ai que so enrolam",
  "350 reais cairam agora mesmo!!! to ate tremendo",
  "consegui pagar o aluguel esse mes gracas ao app",
  "ja fiz 8 saques esse mes... todos cairam certinho",
  "tirei 200 ontem e ja caiu hoje de manha cedo",
  "minha prima tambem ta ganhando... ela que me indicou",
  "450 reais em uma semana pessoall!!! surreal",
  "nunca vi algo tao rapido pra cair na conta",
  "ja somei 1500 reais desde que comecei... 2 meses atras",
  
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
  
  // Mixed conversations (40) - mais humanas e naturais
  "oi pessoal, alguem online agora?",
  "genteee que dia produtivo hoje",
  "boa sorte pra todos nos saques",
  "vamos que vamos galera!!!",
  "forca ai pessoal que da certo",
  "todo mundo ta ganhando mesmo ne",
  "sucesso pra todos aqui do grupo",
  "juntos a gente consegue mais",
  "essa comunidade é top demais",
  "pessoal aqui é show de bola",
  "to adorando participar do grupo",
  "galera ajuda muito com as dicas",
  "obrigado pelas dicas pessoal, valeu mesmo",
  "valeu galera pela ajuda",
  "aprendi muito aqui com vcs",
  "as dicas de vcs sao muito boas",
  "to seguindo o que me ensinaram",
  "fazendo como o pessoal ensinou",
  "aquela dica de ontem funcionou",
  "testei a estrategia e deu certo",
  "meu rendimento aumentou bastante",
  "to melhorando cada dia mais",
  "evoluindo aos poucos mas ta indo",
  "aprendendo com o pessoal aqui",
  "vou compartilhar minha experiencia",
  "comecei ontem e ja to gostando",
  "primeira semana e ja vi resultado",
  "to ha um mes usando e funciona",
  "ja sou veterano aqui kkk",
  "sou novato mas to animado",
  "aprendendo com vcs todo dia",
  "seguindo firme e forte",
  "progredindo bem com as dicas",
  "to evoluindo bastante aqui",
  "melhorando muito com o tempo",
  "resultados tao aumentando sempre",
  "cada dia ta melhor que o outro",
  "rendimento ta otimo essa semana",
  "ganhos constantes toda semana",
  "ta funcionando perfeitamente pra mim",
  
  // Specific amounts and transactions (40) - valores mínimos de 100 reais
  "pessoal meu pix de 100 reais ja ta na conta!!!",
  "acabei de sacar R$ 150 e caiu em menos de 10 min",
  "R$ 200 confirmado na minha conta galera... que alegria",
  "recebi R$ 250 agora mesmo pelo PIX... muito rapido",
  "caiu R$ 300 no PIX em 5 minutos pessoal",
  "R$ 350 transferido pra minha conta... to feliz demais",
  "consegui sacar R$ 400 ontem e ja ta na conta",
  "R$ 450 sacado com sucesso... nem acreditei",
  "saquei R$ 500 e ja ta liberado na conta",
  "meu saque de R$ 125 foi aprovado agora",
  "consegui retirar R$ 175 hoje de manha",
  "ganhei R$ 225 essa semana toda",
  "recebi um extra de R$ 275 que nao esperava",
  "consegui juntar R$ 325 em poucos dias",
  "saquei R$ 375 ontem a noite",
  "recebi R$ 425 dividido em 2 saques",
  "juntei R$ 475 esse mes todo",
  "to com R$ 525 acumulado pra sacar",
  "PIX de 120 reais caiu agora pessoal",
  "transferencia de 180 aprovada rapidinho",
  "deposito de 220 ja entrou na conta",
  "credito de 280 confirmado no app",
  "entrada de 320 reais hoje cedo",
  "recebimento de 380 aprovado sem problemas",
  "valor de 420 ja ta disponivel pra saque",
  "saldo de 480 acumulado ate agora",
  "total de 520 em 2 semanas de uso",
  "primeiro saque: 100 reais certinho",
  "segundo saque: 150 e ja caiu",
  "terceiro saque: 200 aprovado hoje",
  "quarto saque: 250 sem problemas",
  "quinto saque: 300 confirmado",
  "sexto saque: 350 na conta",
  "setimo saque: 400 liberado",
  "oitavo saque: 450 processado",
  "nono saque: 500 disponivel",
  "decimo saque: 550 confirmado",
  "ja fiz 11 saques de 100 reais cada",
  "meu recorde foi 600 em um unico saque",
  "consegui 700 reais em saques esse mes",
  
  // Time-related messages (30) - mais naturais e menos genéricas
  "bom dia pessoal, comecando agora a ouvir",
  "boa tarde galera, como vcs tao indo?",
  "boa noite galera, produzindo aqui em casa",
  "madrugada produtiva aqui ouvindo radio",
  "manha ta rendendo bem de pontos",
  "tarde tranquila ganhando uns trocados",
  "noite ta sendo lucrativa demais",
  "hoje ta otimo pra juntar pontos",
  "dia ta sendo produtivo pra caramba",
  "periodo excelente pra ganhar grana",
  "momento perfeito pra comecar a ouvir",
  "tempo bom pra ganhar uma renda extra",
  "hora certa de aproveitar o app",
  "agora mesmo ta funcionando perfeitamente",
  "periodo de ganhos ta otimo hoje",
  "trabalhando em casa e ouvindo radio",
  "ganhando dinheiro o tempo todo aqui",
  "comecando bem hoje de manha cedo",
  "produtividade maxima com as radios",
  "dia ta excelente pra juntar pontos",
  "hora de ganhar uma graninha",
  "momento perfeito pra comecar",
  "agora é a hora de aproveitar galera",
  "tempo é dinheiro mesmo ne pessoal",
  "aproveitando o tempo livre pra ouvir",
  "cada minuto conta pra somar mais",
  "nao perco tempo, deixo sempre tocando",
  "24h por dia ganhando uns trocados",
  "sempre ativo aqui no radioplay",
  "non-stop tocando as radios aqui",
  
  // Motivational (30) - mais naturais e pessoais
  "gente nao desistam que da certo!!!",
  "continua tentando que vale a pena",
  "pessoal to conseguindo pagar minhas contas",
  "galera foquem que da resultado",
  "vamos conseguir uma renda extra boa",
  "acreditem que funciona mesmo",
  "minha vida mudou com esse app",
  "to conseguindo um futuro melhor pros meus filhos",
  "aproveitem essa oportunidade pessoal",
  "melhor momento pra comecar é agora",
  "quanto mais deixo tocando mais ganho",
  "to tendo sucesso com isso aqui",
  "vitoria é questao de tempo",
  "to no caminho certo finalmente",
  "melhor escolha que fiz esse ano",
  "decisao inteligente foi comecar aqui",
  "to investindo meu tempo e ta valendo",
  "retorno ta sendo otimo galera",
  "to lucrando todo mes com isso",
  "ganho real sem enganacao",
  "deixo tocando ate dormindo kkk",
  "melhor app que conheci esse ano",
  "dinheiro honesto e garantido",
  "mudou minha situacao financeira",
  "consegui quitar dividas com isso",
  "ajudando muito nas despesas de casa",
  
  // Technical and help (20) - mais naturais
  "pessoal atualizem o app pra nova versao",
  "versao nova saiu e ta melhor ainda",
  "aquele bug foi corrigido ja",
  "problema que tava tendo foi resolvido",
  "erro que dava ontem ja arrumaram",
  "ta funcionando normal aqui comigo",
  "sistema ta estavel sem travamentos",
  "plataforma ta ok sem problemas",
  "sem instabilidade nenhuma aqui",
  "tudo operacional e rodando liso",
  "manutencao concluida e voltou ao normal",
  "melhorias implementadas e ta otimo",
  "novidade disponivel no app galera",
  "recurso novo pra facilitar os saques",
  "funcao liberada pra todos agora",
  "opcao adicional pra ganhar mais",
  "tutorial me ajudou muito a entender",
  "video explicativo ta no youtube",
  "segui o passo a passo e deu certo",
  "guia completo ta muito bom"
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

// Payment proof messages data - com novas imagens de notificação real
const paymentProofMessages = [
  { image: pixProof1, text: "Caiu no BradescoO!!!! 🎉🎉", name: "Roberto Carlos" },
  { image: pixProof2, text: "Galera olha só chegou aqui tbm", name: "Marina Santos" },
  { image: pixProof3, text: "Recebiii pessoal, app paga mesmo", name: "João Paulo" },
  { image: pixProof4, text: "640 reais direto na conta!!! Vale muito a pena", name: "Ana Clara" },
  { image: pixProof5, text: "Rendimentos caindo toda semana aqui", name: "Pedro Henrique" },
  { image: pixProof6, text: "980 reais recebido agora pessoal", name: "Carlos Eduardo" }
];


export default function Chat() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { messages, addMessage } = useChat();
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const usedAdminMessagesRef = useRef<string[]>([]);
  const usedPaymentProofsRef = useRef<number[]>([]);
  const hasAddedInitialProofRef = useRef(false);
  const joinTimeRef = useRef(Date.now());
  const messagesSinceLastImageRef = useRef(0);
  // Simple check for radio playing - no need for complex detection
  const isRadioPlaying = false;
  
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
    if (messages.length === 0 && !hasAddedInitialProofRef.current) {
      hasAddedInitialProofRef.current = true;
      // Success/payment focused messages for initial chat - mensagens mais naturais
      const successMessages = [
        "pessoall caiu R$150 aqui agora, confirmadoo!!!",
        "meu saque de R$200 caiu certinho em 15min... que rapidez",
        "recebi via Pix em 1 hora o valor de 175 reais",
        "primeiro saque R$150, chegou na conta do nubank",
        "pagamento em menos de 24h... 300 reais limpos",
        "R$180 entrou sem erro nenhum galera",
        "aprovado, saque de 250 feito via pix ontem",
        "R$200 caiu e ja ta no extrato do banco",
        "caiu R$150 aqui, tirei print pra comprovar",
        "entrou rapido no meu banco... 400 reais",
        "R$150 creditado hoje de manha cedo",
        "confirmei o saque de 225 e chegou rapidinho",
        "R$200 confirmado no extrato bancario agora",
        "testei ontem e funcionou... saquei 100 pra testar",
        "caiu aqui galera, vou mandar print no pv",
        "to juntando pra bater R$300 essa semana",
        "teste real: entrou certinho 125 reais",
        "saque de 175 confirmado em 12h apenas",
        "pra mim caiu no mesmo dia... 200 reais",
        "R$150 garantido aqui no santander",
        "recebi o pagamento de 350 na conta ontem",
        "entrou R$200 comprovado com print",
        "pagamento de 100 sem burocracia nenhuma",
        "caiu R$150 ontem a noite as 23h",
        "sim, pagou no mesmo dia 275 reais",
        "to com 3 saques esse mes totalizando 750",
        "primeiro saque de 150 reais caiu em 2 minutos galera!!",
        "ja fiz 3 saques essa semana, todos cairam certinho... total de 600",
        "meu primeiro saque de 200 caiu agora mesmo!!! to feliz demais",
        "caiu 300 reais agora na minha conta do inter",
        "fiz 5 saques ate agora, todos aprovados... ja ganhei 1000 reais"
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
        
        // Add admin messages at positions 3 and 7
        if (i === 3 || i === 7) {
          addMessage({
            name: "ADMINISTRADOR",
            message: i === 3 ? 
              "Sistema funcionando 100% sem instabilidades. Bons ganhos a todos!" : 
              "Todos os saques foram concluídos com sucesso pessoal! Qualquer dúvida basta chamar no suporte WhatsApp ou abrir um ticket!",
            isVerified: false,
            isOwnMessage: false,
            isAdmin: true,
            timestamp: timestamp
          });
        } 
        // Add payment proof at position 9
        else if (i === 9 && usedPaymentProofsRef.current.length === 0) {
          const proofIndex = Math.floor(Math.random() * paymentProofMessages.length);
          const proof = paymentProofMessages[proofIndex];
          usedPaymentProofsRef.current.push(proofIndex);
          
          addMessage({
            name: proof.name,
            message: proof.text,
            isVerified: true,
            isOwnMessage: false,
            image: proof.image,
            timestamp: timestamp
          });
        }
        else {
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
      // Incrementa contador de mensagens
      messagesSinceLastImageRef.current++;
      
      // Mostra imagem após pelo menos 7 mensagens e se ainda tem imagens disponíveis
      if (messagesSinceLastImageRef.current >= 7 && 
          Math.random() < 0.25 && // 25% de chance quando já passaram 7 mensagens
          usedPaymentProofsRef.current.length < paymentProofMessages.length) {
        
        // Find an unused payment proof
        let proofIndex = Math.floor(Math.random() * paymentProofMessages.length);
        let attempts = 0;
        while (usedPaymentProofsRef.current.includes(proofIndex) && attempts < 10) {
          proofIndex = Math.floor(Math.random() * paymentProofMessages.length);
          attempts++;
        }
        
        // Se encontrou uma imagem não usada
        if (!usedPaymentProofsRef.current.includes(proofIndex)) {
          const proof = paymentProofMessages[proofIndex];
          usedPaymentProofsRef.current.push(proofIndex);
          messagesSinceLastImageRef.current = 0; // Reset counter
          
          addMessage({
            name: proof.name,
            message: proof.text,
            isVerified: true,
            isOwnMessage: false,
            image: proof.image
          });
          return; // Sai da função depois de adicionar imagem
        }
      }
      // Regular message generation
      else if (Math.random() < 0.7) {
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
        name: "ADMINISTRADOR",
        message: getNextAdminMessage(),
        isVerified: false,
        isOwnMessage: false,
        isAdmin: true
      });
    }, 120000); // Exactly 2 minutes
    
    // Send first admin message after 1 minute
    const initialAdminTimeout = setTimeout(() => {
      addMessage({
        name: "ADMINISTRADOR",
        message: "Todos os saques foram concluídos com sucesso pessoal! Qualquer dúvida basta chamar no suporte WhatsApp ou abrir um ticket!",
        isVerified: false,
        isOwnMessage: false,
        isAdmin: true
      });
    }, 60000); // 60 seconds (1 minute) for first admin message
    
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
      
      {/* Messages Area - Adjusted padding for fixed input */}
      <ScrollArea 
        className="flex-1 px-4 py-3 bg-gray-100"
        ref={scrollAreaRef}
        style={{ overflowAnchor: 'none' }}
      >
        <div className={`max-w-2xl mx-auto space-y-3 ${isRadioPlaying ? 'pb-48' : 'pb-36'}`} style={{ overflowAnchor: 'none' }}>
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
                  {msg.image && (
                    <div className="mt-2 rounded-lg overflow-hidden">
                      <img 
                        src={msg.image} 
                        alt="Payment proof" 
                        className="w-full h-auto object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {/* Input Area - Adjusted for Radio Player */}
      <div className={`fixed left-0 right-0 bg-white border-t p-3 z-40 ${isRadioPlaying ? 'bottom-[112px]' : 'bottom-16'}`}>
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