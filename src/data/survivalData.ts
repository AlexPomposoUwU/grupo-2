import { ManualSection, ScenarioQuestion, SurvivalItem } from '../types/survival';

export const HERO_IMAGE = '/src/assets/images/forest_survival_hero_1794325916786.jpg';
export const SHELTER_IMAGE = '/src/assets/images/bushcraft_shelter_fire_1794325916851.jpg';
export const WATER_IMAGE = '/src/assets/images/clean_water_stream_1794325917497.jpg';

export const MANUAL_SECTIONS: ManualSection[] = [
  {
    id: 'agua',
    title: 'Água e Hidratação',
    subtitle: 'Como encontrar, coletar e purificar água na mata',
    iconName: 'Droplets',
    heroImage: WATER_IMAGE,
    keyRule: 'Desidratação mata em 3 dias; parasitas matam em semanas. Purifique SEMPRE.',
    steps: [
      {
        title: '1. Onde buscar água segura',
        description: 'Siga o declive do relevo (vales e fundos de garganta). Observe pássaros voando ao amanhecer ou entardecer e trilhas de animais convergentes. Prefira riachos de correnteza sobre pedras a poças paradas.',
        tip: 'Em bambuzais, corte entrenós maduros: muitos acumulam de 200 a 500ml de água límpida e fresca filtrada pela planta.',
      },
      {
        title: '2. Coleta de orvalho matinal',
        description: 'Antes do nascer do sol, amarre panos limpos ou camisetas nos tornozelos e caminhe por capinzais altos. Quando os panos encharcarem de orvalho, torça-os em um recipiente.',
        tip: 'Em uma manhã com bastante orvalho, é possível coletar até 1 litro de água pura sem esforço.',
      },
      {
        title: '3. Fervura (Método Ouro)',
        description: 'Ferver a água em fogo ativo por pelo menos 1 a 3 minutos elimina 99,9% de bactérias, vírus e protozoários como Giárdia e Criptosporídio.',
        tip: 'Se não tiver panela de metal, aqueça pedras limpas (sem ser de rio com risco de rachar) na fogueira e coloque-as dentro de um recipiente de bambu ou casca de árvore com a água.',
        warning: 'Nunca use pedras retiradas do fundo de rios para aquecer: a umidade interna pode fazê-las explodir com calor intenso!',
      },
      {
        title: '4. Filtro de Sobrevivência por Camadas',
        description: 'Corte uma garrafa pet ou cano de bambu. Monte de baixo para cima: pano/algodão, carvão vegetal triturado da fogueira (neutraliza odores e toxinas), areia fina, areia grossa e cascalho no topo.',
        tip: 'A água filtrada fica transparente, mas ainda deve ser fervida ou tratada com pastilhas antes de beber.',
      },
      {
        title: '5. Destilador Solar de Solo',
        description: 'Cave um buraco de 50cm de profundidade no chão sob sol direto. Coloque um recipiente no centro. Preencha o espaço ao redor com folhagem verde e úmida. Cubra com plástico, fixe as bordas com terra e ponha uma pedrinha no meio do plástico alinhada ao copo.',
        tip: 'O sol evapora a umidade da terra e das folhas, a água condensa no plástico e goteja no recipiente.',
      },
    ],
    doList: [
      'Beba pequenos goles regulares em vez de beber tudo de uma vez.',
      'Sempre purifique água de rio, mesmo que pareça cristalina.',
      'Monitore a cor da urina: amarelo-palha claro indica boa hidratação; escuro indica alerta.',
      'Aproveite a água da chuva recolhendo com lonas limpas inclinadas.',
    ],
    dontList: [
      'NUNCA beba água do mar ou salobra (acelera a falência renal).',
      'NUNCA beba urina própria (contém sais tóxicos concentrados e sobrecarrega os rins).',
      'NUNCA consuma seivas leitosas ou brancas de plantas sem certeza absoluta.',
      'NUNCA coma se não tiver água suficiente: a digestão consome a reserva hídrica do corpo.',
    ],
  },
  {
    id: 'abrigo',
    title: 'Abrigo e Proteção Térmica',
    subtitle: 'Isolamento contra frio, chuva, vento e animais rasteiros',
    iconName: 'Tent',
    heroImage: SHELTER_IMAGE,
    keyRule: 'O solo rouba até 80% do seu calor corporal por condução. Isole o chão primeiro!',
    steps: [
      {
        title: '1. Escolha do Local Seguro (Critério das 4 Zonas)',
        description: 'Fique longe de árvores mortas com galhos pendurados ("faz-viúvas"). Fique fora de leitos secos de rio sujeitos a cabeças d’água (enxurradas repentinas). Escolha terreno elevado, plano e com boa drenagem.',
        warning: 'Evite trilhas batidas de animais de grande porte (queixadas, antas, onças) e proximidade imediata de cupinzeiros e formigueiros gigantes.',
      },
      {
        title: '2. Cama Elevada de Isolamento',
        description: 'Construa uma grade de troncos apoiada em forquilhas ou faça um colchão espesso de folhas secas, palha e samambaias de pelo menos 25 a 30 cm de espessura.',
        tip: 'Quando você deitar, a camada deve compactar e ainda sobrar 10 cm de ar isolante entre suas costas e a terra fria.',
      },
      {
        title: '3. Abrigo Unilateral (Lean-to)',
        description: 'Amarre um tronco horizontal entre duas árvores a cerca de 1,20m de altura. Apoie galhos inclinados a 45° no lado de onde sopra o vento predominante. Trance folhagens e palmeiras de baixo para cima como telhas.',
        tip: 'Dispondo as folhas como telhas (de baixo para cima), a água escorre para fora sem penetrar no interior.',
      },
      {
        title: '4. Refletor de Calor da Fogueira',
        description: 'Construa uma parede de troncos ou pedras empilhadas do outro lado da sua fogueira, a 1 metro de distância. O calor radiante bate na parede e reflete diretamente para dentro do seu abrigo.',
      },
    ],
    doList: [
      'Inicie a construção do abrigo com pelo menos 2 a 3 horas de sol restante.',
      'Verifique o solo contra escorpiões, aranhas-armadeiras e formigas antes de assentar.',
      'Mantenha as paredes do abrigo baixas: quanto menor o volume de ar interno, mais fácil seu corpo aquecê-lo.',
      'Sinalize o teto do abrigo com algo de cor viva se tiver resgate aéreo na área.',
    ],
    dontList: [
      'NUNCA durma diretamente no chão nu úmido.',
      'NUNCA monte abrigo debaixo de coqueiros com cocos maduros ou galhos podres.',
      'NUNCA deixe a fogueira dentro de abrigo fechado (risco letal de asfixia por monóxido de carbono).',
      'NUNCA durma com roupas molhadas se puder torcer e secar ao fogo.',
    ],
  },
  {
    id: 'fogo',
    title: 'Fogo e Calor',
    subtitle: 'Fogueiras, técnicas de acendimento e segurança na selva',
    iconName: 'Flame',
    heroImage: SHELTER_IMAGE,
    keyRule: 'Prepare 3 vezes mais iscas e gravetos do que você acha que precisa antes de riscar a faísca.',
    steps: [
      {
        title: '1. Estruturação do Combustível (A Regra dos Três)',
        description: 'Separe 3 categorias: 1) Isca primária (fina como cabelo: palha seca, algodão, fungo seco, ninho); 2) Gravetos finos (espessura de palito de dente a lápis); 3) Lenha de sustentação (espessura do pulso até troncos densos).',
      },
      {
        title: '2. Plataforma Seca',
        description: 'Se o chão da floresta estiver úmido, crie uma "cama" de toras verdes ou pedras para isolar o fogo da umidade da terra antes de tentar acender.',
      },
      {
        title: '3. Acendimento com Faísca ou Pederneira',
        description: 'Aproxime a pederneira a 2cm do ninho de iscas. Raspe o raspador em ângulo firme de 45° empurrando a faísca diretamente para o centro da isca. Quando surgir a primeira brasa, sopre suavemente com ar longo e constante.',
      },
      {
        title: '4. Estrutura Tipi (Pirâmide)',
        description: 'Monte os gravetos finos em formato de cone sobre a isca, deixando uma abertura na direção do vento para circulação de oxigênio. Vá adicionando galhos médios conforme a chama ganha força.',
      },
    ],
    doList: [
      'Limpe um círculo de 2 metros de diâmetro sem folhas secas para evitar incêndio florestal.',
      'Circunde o fogo com pedras secas.',
      'Mantenha uma reserva de lenha seca coberta perto do abrigo para a madrugada.',
      'Apague completamente o fogo com terra e água se for abandonar o local.',
    ],
    dontList: [
      'NUNCA tente acender direto com lenha grossa sem a escada de gravetos.',
      'NUNCA assopre com rajadas fortes e rápidas (isso resfria a brasa em vez de oxigenar).',
      'NUNCA use pedras de rio úmidas dentro da fogueira.',
      'NUNCA durma com o fogo desprotegido perto das paredes de folhas secas do abrigo.',
    ],
  },
  {
    id: 'alimentos',
    title: 'Alimento e Forrageamento',
    subtitle: 'Teste de comestibilidade, insetos seguros e conservação de energia',
    iconName: 'Apple',
    heroImage: HERO_IMAGE,
    keyRule: 'Você sobrevive 3 semanas sem comida. Não arrisque ingerir plantas desconhecidas por ansiedade.',
    steps: [
      {
        title: '1. Protocolo Universal de Comestibilidade (8 Etapas)',
        description: 'Para plantas silvestres desconhecidas quando não há alternativa: 1) Separe apenas uma parte (folha, caule ou raiz); 2) Cheire (odores de amêndoa amarga ou pêssego indicam cianeto mortal); 3) Esfregue na dobra do cotovelo e espere 15 min; 4) Toque no lábio por 3 min; 5) Coloque na ponta da língua por 3 min sem mastigar; 6) Mastigue um pedacinho e mantenha na boca por 15 min sem engolir; 7) Engula uma amostra minúscula e espere 8 HORAS sem comer mais nada; 8) Se não sentir náusea, cólica ou tontura, a planta é tolerável.',
        warning: 'Interrompa o teste IMEDIATAMENTE se sentir dormência, ardor, queimação ou amargor intenso na boca.',
      },
      {
        title: '2. Insetos Comestíveis de Alto Valor',
        description: 'Larvas brancas encontradas em troncos caídos podres (larva do coqueiro / broca) são riquíssimas em proteínas e gorduras limpas. Gafanhotos e grilos: retire as pernas traseiras espinhosas e asas, e SEMPRE cozinhe ou toste na fogueira para matar parasitas intestinais.',
      },
      {
        title: '3. Plantas e Frutos Geralmente Seguros',
        description: 'Palmito de palmeiras comuns (palmito juçara, açaizeiro, pupunheira - o miolo branco macio do topo é 100% comestível cru ou cozido). Brotos jovens de bambu (fervidos). Frutas já consumidas ativamente por macacos ou pássaros costumam ser mais seguras, mas teste sempre.',
      },
      {
        title: '4. Cogumelos: Regra Absoluta',
        description: 'NUNCA coma cogumelos silvestres colhidos na floresta. Mesmo pequenos pedaços de espécies venenosas (como Amanita phalloides) provocam destruição hepática irreversível em 48 horas sem antídoto disponível.',
        warning: 'Nenhum teste empírico (ferver com prata, cor, etc.) comprova a segurança de cogumelos!',
      },
    ],
    doList: [
      'Priorize água antes de comida.',
      'Cozinhe sempre qualquer alimento de origem animal (peixes, insetos, pequenos répteis).',
      'Descanse nos horários mais quentes para economizar glicogênio e água corporal.',
    ],
    dontList: [
      'NUNCA coma cogumelos silvestres sem identificação de especialista.',
      'NUNCA coma insetos coloridos com cores vivas de alerta (vermelho, amarelo vibrante, listras pretas).',
      'NUNCA coma carniça ou animais já mortos com odor suspeito.',
      'NUNCA gaste energia correndo atrás de caça ágil sem armadilhas passivas.',
    ],
  },
  {
    id: 'socorros',
    title: 'Primeiros Socorros e Animais Peçonhentos',
    subtitle: 'Picadas de serpentes, aranhas, hipotermia e lesões em áreas remotas',
    iconName: 'ShieldAlert',
    heroImage: HERO_IMAGE,
    keyRule: 'Em picadas de cobra: NUNCA faça torniquete, NUNCA corte, NUNCA chupe o veneno!',
    steps: [
      {
        title: '1. Acidente com Serpentes (Jararaca, Cascavel, Coral)',
        description: 'Mantenha a vítima ou a si mesmo o mais calmo possível. Deite ou sente para desacelerar os batimentos cardíacos. Lave o local da picada somente com água limpa ou água e sabão. Mantenha o membro acometido estendido e em nível do coração. Beba água para manter a hidratação renal. Retire anéis, sapatos e relógios antes do inchaço.',
        warning: 'MITOS PERIGOSOS: Não corte o local, não fure, não amarre garrote ou torniquete (o torniquete isola o veneno proteolítico e causa necrose/amputação rápida), não passe pó de café ou fumo.',
      },
      {
        title: '2. Picadas de Aranhas (Armadeira / Marrom) e Escorpiões',
        description: 'Lave o local com água. Aplique compressas mornas para aliviar a dor intensa (no caso de escorpião e armadeira). Beba bastante água. Repouse.',
      },
      {
        title: '3. Cortes e Hemorragias na Selva',
        description: 'Pressione o ferimento diretamente com um pano limpo de forma contínua por 10 a 15 minutos sem levantar para checar. Se o sangue vazar, coloque outro pano por cima sem tirar o primeiro. Eleve o membro se não houver fratura.',
      },
      {
        title: '4. Hipotermia (O Inimigo Silencioso)',
        description: 'Sintomas: tremores incontroláveis, fala arrastada, apatia e perda de coordenação motora. Retire roupas molhadas imediatamente. Envolva-se em lona ou coberta de emergência. Aqueça a região central do tórax e axilas com garrafas de água morna ou pedras mornas envolvidas em tecido.',
      },
    ],
    doList: [
      'Guarde uma foto ou descrição da cobra a distância segura para auxiliar os médicos no soro.',
      'Mantenha a vítima hidratada.',
      'Imobilize fraturas com galhos retos acolchoados com folhas e amarrados com tiras de tecido.',
    ],
    dontList: [
      'NUNCA tente capturar a serpente viva para levar ao hospital.',
      'NUNCA beba álcool ou bebidas energéticas após uma picada de animal peçonhento.',
      'NUNCA esfregue a ferida de hipotermia com neve ou água gelada.',
    ],
  },
];

export const SCENARIO_QUESTIONS: ScenarioQuestion[] = [
  {
    id: 1,
    situation: 'Você percebeu que se perdeu da trilha principal e restam cerca de 2 horas de luz solar. O que você faz primeiro?',
    context: 'Você está no interior de uma floresta densa com relevo acidentado e anoitecer iminente.',
    options: [
      {
        text: 'Começar a correr na direção em que você acha que estava o início da trilha para tentar alcançá-la antes do escuro.',
        isCorrect: false,
        points: 0,
        explanation: 'Correr no pânico com pouca luz leva a torções graves de tornozelo, perda de orientação e ferimentos por galhos na escuridão.',
      },
      {
        text: 'Aplicar a técnica STOP (Pare, Pense, Observe, Planeje) e focar imediatamente em preparar um abrigo e isolar o chão.',
        isCorrect: true,
        points: 25,
        explanation: 'Excelente! A noite na floresta sem abrigo causa hipotermia e pânico. Preparar a cama isolante e abrigo enquanto há luz é a decisão que salva vidas.',
      },
      {
        text: 'Subir na árvore mais alta e dormir agarrado a um galho a noite toda.',
        isCorrect: false,
        points: 5,
        explanation: 'Dormir sobre galho alto causa quedas fatais quando o cansaço domina, além de exposição máxima ao vento frio e chuva.',
      },
    ],
  },
  {
    id: 2,
    situation: 'Você encontrou um riacho com água aparentemente limpa e transparente descendo a montanha. Sua boca está seca. Qual a conduta correta?',
    context: 'A água é translúcida, mas você não sabe o que há centenas de metros acima do curso d’água.',
    options: [
      {
        text: 'Beber grandes goles direto do riacho imediatamente, pois água de montanha é sempre pura.',
        isCorrect: false,
        points: 0,
        explanation: 'Animais mortos ou fezes a montante transmitem Giárdia e bactérias que causam diarreia e desidratação fulminante em poucas horas.',
      },
      {
        text: 'Coletar a água e fervê-la por pelo menos 1 a 3 minutos antes de ingerir (ou usar pastilhas de cloro/filtro de carvão).',
        isCorrect: true,
        points: 25,
        explanation: 'Correto! A fervura elimina vírus, bactérias e protozoários resistentes. Em sobrevivência, prevenir diarreia é manter-se vivo.',
      },
      {
        text: 'Beber apenas a água de poças estagnadas no chão porque elas evaporam as impurezas.',
        isCorrect: false,
        points: 0,
        explanation: 'Água parada é criadouro de larvas, mosquitos e bactérias anaeróbicas perigosas.',
      },
    ],
  },
  {
    id: 3,
    situation: 'Você foi picado no tornozelo por uma serpente que parecia uma jararaca. Qual a medida imediata de primeiros socorros?',
    context: 'O local está dolorido com dois pequenos pontos de perfuração.',
    options: [
      {
        text: 'Amarrar um cadarço apertado acima da picada como torniquete e fazer um corte com faca para sugar o sangue.',
        isCorrect: false,
        points: 0,
        explanation: 'Completamente contraindicado! O torniquete concentra a toxina nos tecidos e gera necrose e perda do membro; cortes facilitam hemorragia e infecção.',
      },
      {
        text: 'Manter a calma, lavar o ferimento com água, retirar calçados antes de inchar, manter o membro em repouso e buscar socorro com calma.',
        isCorrect: true,
        points: 25,
        explanation: 'Exato! A calma reduz os batimentos cardíacos, retardando a disseminação do veneno na corrente sanguínea. Lavar com água limpa previne infecções locais.',
      },
      {
        text: 'Colocar pó de café e álcool sobre o corte e correr o mais rápido possível para a cidade.',
        isCorrect: false,
        points: 0,
        explanation: 'Correr bombeia o veneno rapidamente para órgãos vitais e colocar produtos químicos contamina o corte.',
      },
    ],
  },
  {
    id: 4,
    situation: 'Você ouviu o ruído de um helicóptero de resgate sobrevoando a copa da floresta a cerca de 1 km de você. Como sinalizar com eficácia?',
    context: 'A mata é fechada e as equipes aéreas têm dificuldade de avistar pessoas no chão sob as copas das árvores.',
    options: [
      {
        text: 'Gritar com toda a força o mais alto possível até o helicóptero pousar.',
        isCorrect: false,
        points: 0,
        explanation: 'O ruído das hélices e turbina abafa qualquer som humano terrestre. Você apenas perderá a voz e energia.',
      },
      {
        text: 'Deslocar-se para a clareira mais próxima ou banco de areia de rio e usar reflexos de espelho/metal, fumaça contrastante ou tecido de cor viva com código SOS.',
        isCorrect: true,
        points: 25,
        explanation: 'Perfeito! Sinalizadores visuais em áreas abertas (espelho, metal, fumaça branca com folhas úmidas contra fundo verde) são visíveis a dezenas de quilômetros pelo ar.',
      },
      {
        text: 'Permanecer imóvel escondido debaixo da copa densa esperando que o sensor térmico o ache sem você precisar fazer nada.',
        isCorrect: false,
        points: 5,
        explanation: 'A folhagem espessa bloqueia grande parte da visão aérea óptica e térmica; você deve se mostrar ativamente em clareiras.',
      },
    ],
  },
];

export const GEAR_CHECKLIST: SurvivalItem[] = [
  { id: '1', name: 'Canivete ou Faca de Lâmina Fixa Resistente', category: 'essenciais', importance: 'critico', tip: 'Corte de cipós, madeira para fogueira, preparação de abrigo e estacas.' },
  { id: '2', name: 'Iniciador de Fogo (Pederneira ou Isqueiro vedado)', category: 'fogo', importance: 'critico', tip: 'Guarde em saco plástico zip vedado contra umidade.' },
  { id: '3', name: 'Recipiente de Metal (Garrafa de inox ou Caneca)', category: 'agua', importance: 'critico', tip: 'Permite ferver água diretamente sobre as brasas da fogueira.' },
  { id: '4', name: 'Apito de Emergência Alto (sem bolinha)', category: 'sinalizacao', importance: 'critico', tip: 'O som viaja 3x mais longe que a voz humana e não cansa os pulmões.' },
  { id: '5', name: 'Lanterna com baterias extras ou recarga manual', category: 'sinalizacao', importance: 'alto', tip: 'Indispensável para locomoção segura no acampamento e sinalização SOS.' },
  { id: '6', name: 'Cobertor Térmico de Emergência (Alumínio/Mylar)', category: 'abrigo', importance: 'critico', tip: 'Pesa 50g e reflete 90% do calor corporal, prevenindo choque hipotérmico.' },
  { id: '7', name: 'Lona Leve ou Poncho Impermeável 2x2m', category: 'abrigo', importance: 'alto', tip: 'Cobre o teto do abrigo e serve para coletar água pura da chuva.' },
  { id: '8', name: 'Corda Paracord 550 (10 a 15 metros)', category: 'essenciais', importance: 'alto', tip: 'Amarração firme de troncos, varal, nós e suspensão de mantimentos.' },
  { id: '9', name: 'Kit Básico de Primeiros Socorros e Gaze', category: 'saude', importance: 'alto', tip: 'Curativos compressivos, fita micropore e desinfetante.' },
  { id: '10', name: 'Bússola Magnética com Placa Base', category: 'essenciais', importance: 'alto', tip: 'Navegação por azimute e manutenção de linha reta na mata fechada.' },
  { id: '11', name: 'Pastilhas de Cloro / Purificação de Água (Clorin)', category: 'agua', importance: 'alto', tip: 'Purifica cantis de água mesmo quando não for possível acender fogo.' },
  { id: '12', name: 'Barras de Cereal / Ração de Alta Densidade Calórica', category: 'essenciais', importance: 'medio', tip: 'Aporte de energia rápida sem necessidade de preparo ou cozimento.' },
];
