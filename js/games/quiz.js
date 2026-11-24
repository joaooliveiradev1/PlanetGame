import { $, $$, esc, shuffle, setArea, message } from "../core/dom.js";
import { timer } from "../core/lifecycle.js";
import { finish } from "../core/router.js";

// Cada pergunta contém:
// [ícone, enunciado, quatro alternativas, resposta correta, explicação]

const QUIZ = {
  facil: [
    [
      "",
      "Como o mandacaru consegue sobreviver na Caatinga durante a seca?",
      [
        "Guardando água no caule",
        "Vivendo dentro dos rios",
        "Recebendo chuva todos os dias",
        "Buscando água com suas folhas",
      ],
      0,
      "O mandacaru armazena água no caule. Isso ajuda a planta a enfrentar os períodos secos.",
    ],
    [
      "",
      "Theo encontrou uma torneira pingando na escola. O que deve fazer?",
      [
        "Deixar a água cair",
        "Abrir mais a torneira",
        "Avisar um adulto",
        "Colocar papel na pia",
      ],
      2,
      "Avisar um adulto para consertar a torneira ajuda a evitar desperdício de água.",
    ],
    [
      "",
      "Por que algumas árvores da Caatinga perdem as folhas na seca?",
      [
        "Porque deixam de ter raízes",
        "Para diminuir a perda de água",
        "Porque não gostam do Sol",
        "Para nunca mais crescer",
      ],
      1,
      "Perder folhas ajuda algumas plantas a conservar água quando chove pouco.",
    ],
    [
      "",
      "O que o tatu-bola faz quando se sente ameaçado?",
      [
        "Começa a voar",
        "Muda de cor",
        "Entra na água",
        "Enrola o corpo formando uma bola",
      ],
      3,
      "O tatu-bola consegue enrolar o corpo para se proteger de ameaças.",
    ],
    [
      "",
      "Qual atitude ajuda a proteger os animais de uma praia?",
      [
        "Recolher o próprio lixo",
        "Deixar embalagens na areia",
        "Jogar plástico no mar",
        "Enterrar latinhas na praia",
      ],
      0,
      "Recolher e descartar corretamente os resíduos ajuda a proteger os animais.",
    ],
    [
      "",
      "Por que as abelhas visitam as flores?",
      [
        "Para apagar a luz",
        "Para limpar os rios",
        "Para buscar alimento, podendo transportar pólen",
        "Para cortar as folhas",
      ],
      2,
      "Ao visitar flores, as abelhas podem transportar pólen e ajudar na reprodução das plantas.",
    ],
    [
      "",
      "Qual destas plantas é encontrada naturalmente na Caatinga?",
      [
        "Pinheiro de regiões geladas",
        "Mandacaru",
        "Vitória-régia",
        "Alga marinha",
      ],
      1,
      "O mandacaru é uma planta nativa da Caatinga e está adaptado às condições desse ambiente.",
    ],
    [
      "",
      "A luz ficou acesa em uma sala vazia. O que Theo deve fazer?",
      [
        "Acender outras lâmpadas",
        "Deixar a luz ligada",
        "Abrir a torneira",
        "Apagar a luz, se for seguro",
      ],
      3,
      "Apagar luzes desnecessárias ajuda a economizar energia.",
    ],
    [
      "",
      "Qual destes animais pode ser encontrado na Caatinga?",
      ["Asa-branca", "Pinguim-imperador", "Urso-polar", "Foca-do-Ártico"],
      0,
      "A asa-branca é uma ave encontrada na Caatinga e em outras regiões do Brasil.",
    ],
    [
      "",
      "O que acontece quando jogamos lixo em um rio?",
      [
        "A água fica mais limpa",
        "Os peixes ganham alimento adequado",
        "A água pode ficar poluída",
        "O rio deixa de precisar de cuidados",
      ],
      2,
      "O lixo pode poluir a água e prejudicar os seres vivos.",
    ],
    [
      "",
      "Qual atitude ajuda a economizar água ao escovar os dentes?",
      [
        "Usar a mangueira",
        "Fechar a torneira enquanto escova",
        "Deixar a torneira aberta",
        "Encher a pia sem necessidade",
      ],
      1,
      "Fechar a torneira durante a escovação evita desperdício de água.",
    ],
    [
      "",
      "Uma árvore oferece benefícios para os animais. Qual deles?",
      [
        "Produzir lixo",
        "Impedir todas as chuvas",
        "Aquecer o solo com fogo",
        "Oferecer abrigo e alimento para algumas espécies",
      ],
      3,
      "Árvores podem oferecer sombra, abrigo e alimento para diferentes animais.",
    ],
    [
      "",
      "Theo encontrou uma garrafa plástica vazia no parque. O que deve fazer?",
      [
        "Colocá-la no descarte adequado",
        "Jogar no lago",
        "Deixar no chão",
        "Escondê-la entre as plantas",
      ],
      0,
      "O descarte adequado evita que resíduos sejam espalhados pela natureza.",
    ],
    [
      "",
      "O que uma semente geralmente precisa para começar a germinar?",
      ["Fumaça", "Plástico", "Água e condições adequadas", "Vidro quebrado"],
      2,
      "As sementes precisam de água e de condições adequadas para germinar.",
    ],
    [
      "",
      "Qual atitude ajuda a cuidar de uma planta?",
      [
        "Arrancar suas raízes",
        "Oferecer água conforme sua necessidade",
        "Cobrir suas folhas com lixo",
        "Quebrar seus galhos",
      ],
      1,
      "Cada planta precisa de cuidados adequados, incluindo a quantidade certa de água.",
    ],
    [
      "",
      "O que significa reutilizar um objeto?",
      [
        "Quebrá-lo imediatamente",
        "Jogá-lo fora depois de usar",
        "Enterrá-lo na natureza",
        "Usá-lo novamente quando for possível",
      ],
      3,
      "Reutilizar objetos ajuda a diminuir o desperdício de materiais.",
    ],
    [
      "",
      "Qual é uma boa maneira de proteger os animais silvestres?",
      [
        "Observá-los sem capturá-los",
        "Levá-los para casa",
        "Destruir seus ninhos",
        "Retirar seus alimentos",
      ],
      0,
      "Os animais silvestres devem permanecer em seus ambientes naturais.",
    ],
    [
      "",
      "Theo quer diminuir o uso de copos descartáveis. O que pode fazer?",
      [
        "Usar vários copos por dia",
        "Jogar copos no chão",
        "Usar um copo reutilizável",
        "Comprar mais embalagens",
      ],
      2,
      "Um copo reutilizável, quando bem cuidado, pode reduzir o consumo de descartáveis.",
    ],
    [
      "",
      "Por que devemos cuidar das árvores da Caatinga?",
      [
        "Porque não existem animais nesse ambiente",
        "Porque fazem parte da natureza e abrigam seres vivos",
        "Porque todas precisam ser cortadas",
        "Porque impedem qualquer chuva",
      ],
      1,
      "As árvores da Caatinga fazem parte do equilíbrio ambiental e ajudam muitas espécies.",
    ],
    [
      "",
      "Qual atitude ajuda a manter a escola mais sustentável?",
      [
        "Desperdiçar papel",
        "Deixar todas as luzes acesas",
        "Jogar lixo no pátio",
        "Economizar água, energia e materiais",
      ],
      3,
      "Pequenas atitudes ajudam a reduzir o desperdício e cuidar do ambiente.",
    ],
  ],

  medio: [
    [
      "",
      "O que é a Caatinga?",
      [
        "Um deserto sem vida",
        "Um oceano brasileiro",
        "Um bioma brasileiro com plantas e animais adaptados ao clima",
        "Uma região coberta de neve",
      ],
      2,
      "A Caatinga é um bioma exclusivamente brasileiro, com grande diversidade de seres vivos.",
    ],
    [
      "",
      "O El Niño pode influenciar as chuvas no Nordeste. O que pode acontecer?",
      [
        "Algumas regiões podem receber menos chuva",
        "Todas as cidades ficam cobertas de neve",
        "O Sol desaparece",
        "Todos os rios ficam cheios",
      ],
      0,
      "O El Niño pode favorecer a redução das chuvas em partes do Nordeste, mas seus efeitos variam.",
    ],
    [
      "",
      "Por que o solo com vegetação costuma ficar mais protegido durante a chuva?",
      [
        "Porque a chuva deixa de cair",
        "Porque o solo vira pedra",
        "Porque as plantas eliminam a água",
        "Porque raízes e cobertura vegetal ajudam a reduzir a erosão",
      ],
      3,
      "A vegetação ajuda a proteger o solo contra a ação da chuva e do vento.",
    ],
    [
      "",
      "Qual destas ações ajuda a recuperar uma área degradada da Caatinga?",
      [
        "Retirar todas as plantas",
        "Preservar a vegetação e plantar espécies nativas adequadas",
        "Cobrir o solo com cimento",
        "Descartar resíduos no terreno",
      ],
      1,
      "Preservar a vegetação e utilizar espécies nativas pode ajudar na recuperação ambiental.",
    ],
    [
      "",
      "O que é uma cisterna?",
      [
        "Um tipo de animal",
        "Uma árvore da Caatinga",
        "Uma estrutura usada para armazenar água",
        "Uma máquina que produz chuva",
      ],
      2,
      "Cisternas podem armazenar água da chuva para diferentes usos, conforme sua construção e tratamento.",
    ],
    [
      "",
      "Por que o umbuzeiro consegue resistir a períodos secos?",
      [
        "Porque possui estruturas subterrâneas que armazenam água",
        "Porque não possui raízes",
        "Porque vive dentro de rios",
        "Porque recebe chuva diariamente",
      ],
      0,
      "O umbuzeiro possui estruturas subterrâneas que armazenam água e nutrientes.",
    ],
    [
      "",
      "O que pode acontecer quando retiramos muitas árvores de uma região?",
      [
        "O solo fica sempre mais protegido",
        "Todos os animais ganham abrigo",
        "A temperatura sempre diminui",
        "O solo pode ficar mais exposto à erosão",
      ],
      3,
      "A retirada da vegetação pode deixar o solo desprotegido e prejudicar os seres vivos.",
    ],
    [
      "",
      "Por que não devemos capturar animais silvestres da Caatinga?",
      [
        "Porque não precisam de alimento",
        "Porque fazem parte do equilíbrio do ambiente",
        "Porque todos são perigosos",
        "Porque não existem animais na Caatinga",
      ],
      1,
      "Animais silvestres participam das relações ecológicas e devem ser protegidos.",
    ],
    [
      "",
      "O que pode acontecer quando uma cidade cobre grande parte do solo com cimento?",
      [
        "A água da chuva pode ter mais dificuldade para infiltrar",
        "A chuva desaparece",
        "O solo absorve mais água em todos os lugares",
        "Os rios deixam de existir",
      ],
      0,
      "Superfícies impermeáveis dificultam a infiltração e podem aumentar o escoamento da água.",
    ],
    [
      "",
      "O que é uma mata ciliar?",
      [
        "Uma floresta no fundo do mar",
        "Uma planta que só cresce na neve",
        "Vegetação que cresce perto de rios e córregos",
        "Uma floresta feita de plástico",
      ],
      2,
      "A vegetação das margens ajuda a proteger o solo e os cursos de água.",
    ],
    [
      "",
      "Por que a energia solar é considerada renovável?",
      [
        "Porque utiliza carvão",
        "Porque só funciona com petróleo",
        "Porque transforma plástico em eletricidade",
        "Porque aproveita a energia do Sol",
      ],
      3,
      "Painéis solares podem transformar a luz do Sol em eletricidade.",
    ],
    [
      "",
      "Qual material pode ser colocado em uma composteira doméstica adequada?",
      [
        "Pilhas usadas",
        "Cascas de frutas",
        "Vidro quebrado",
        "Tinta industrial",
      ],
      1,
      "Restos vegetais adequados podem se decompor e formar composto orgânico.",
    ],
    [
      "",
      "Qual é uma consequência possível de jogar óleo de cozinha no ralo?",
      [
        "Causar entupimentos e problemas no tratamento da água",
        "Limpar os canos",
        "Transformar a água em potável",
        "Ajudar os peixes",
      ],
      0,
      "O óleo descartado incorretamente pode entupir tubulações e prejudicar sistemas de esgoto.",
    ],
    [
      "",
      "Por que é importante preservar as abelhas?",
      [
        "Porque produzem eletricidade",
        "Porque impedem todas as secas",
        "Porque muitas espécies ajudam na polinização",
        "Porque limpam os oceanos",
      ],
      2,
      "As abelhas participam da polinização de muitas plantas, contribuindo para frutos e sementes.",
    ],
    [
      "",
      "Qual atitude ajuda a reduzir o desperdício de alimentos?",
      [
        "Descartar alimentos apenas pela aparência",
        "Comprar muito mais do que precisamos",
        "Jogar fora frutas boas",
        "Planejar as refeições e aproveitar alimentos conservados",
      ],
      3,
      "Planejar o consumo e aproveitar alimentos próprios para comer ajuda a reduzir desperdícios.",
    ],
    [
      "",
      "Por que algumas plantas da Caatinga possuem espinhos?",
      [
        "Porque vivem no oceano",
        "Porque os espinhos podem ajudar na proteção, e em algumas espécies reduzem a perda de água",
        "Porque precisam de neve",
        "Porque não possuem células",
      ],
      1,
      "Em algumas plantas, os espinhos ajudam na defesa e substituem folhas, reduzindo a perda de água.",
    ],
    [
      "",
      "Qual é uma vantagem de usar bicicleta em trajetos curtos e seguros?",
      [
        "Não emitir gases de escapamento durante o percurso",
        "Consumir gasolina",
        "Produzir mais fumaça",
        "Precisar de óleo diesel",
      ],
      0,
      "A bicicleta não produz emissões de escapamento durante o deslocamento.",
    ],
    [
      "",
      "Por que devemos separar materiais recicláveis corretamente?",
      [
        "Para aumentar a quantidade de lixo nos rios",
        "Para misturar resíduos perigosos aos alimentos",
        "Para facilitar o aproveitamento de materiais",
        "Para impedir a reciclagem",
      ],
      2,
      "A separação adequada ajuda a coleta seletiva e o aproveitamento dos materiais.",
    ],
    [
      "",
      "O que pode acontecer com os animais quando seu ambiente natural é destruído?",
      [
        "Todos passam a viver na água",
        "Todos deixam de precisar de alimento",
        "Todos se tornam domésticos",
        "Podem perder abrigo e fontes de alimento",
      ],
      3,
      "A destruição dos ambientes naturais ameaça os animais e suas condições de sobrevivência.",
    ],
    [
      "",
      "Por que economizar água é importante mesmo quando está chovendo?",
      [
        "Porque a água tratada é ilimitada",
        "Porque a água disponível para uso precisa ser cuidada",
        "Porque a chuva elimina o desperdício",
        "Porque todos os rios estão sempre cheios",
      ],
      1,
      "A água própria para uso depende de disponibilidade, captação e tratamento. Evitar desperdícios é sempre importante.",
    ],
  ],

  dificil: [
    [
      "",
      "O que acontece durante o fenômeno El Niño?",
      [
        "O Oceano Atlântico congela",
        "Todos os rios desaparecem",
        "Uma parte do Oceano Pacífico fica mais quente que o normal",
        "O planeta para de receber luz solar",
      ],
      2,
      "O El Niño envolve o aquecimento anormal das águas superficiais de parte do Pacífico tropical.",
    ],
    [
      "",
      "Por que o El Niño pode modificar as chuvas em diferentes regiões?",
      [
        "Porque influencia a circulação do ar e a distribuição das chuvas",
        "Porque produz nuvens artificiais",
        "Porque transforma o mar em gelo",
        "Porque impede o movimento dos ventos",
      ],
      0,
      "O aquecimento do Pacífico pode alterar a circulação atmosférica e influenciar as chuvas.",
    ],
    [
      "",
      "Uma seca no Nordeste significa que o El Niño foi o único responsável?",
      [
        "Sim, toda seca é causada somente por ele",
        "Sim, porque não existem outros fenômenos",
        "Sim, porque ele impede qualquer chuva",
        "Não, outros fatores climáticos também influenciam as secas",
      ],
      3,
      "O El Niño pode contribuir para períodos secos, mas não é a única influência sobre as chuvas.",
    ],
    [
      "",
      "Por que é importante preservar espécies nativas da Caatinga?",
      [
        "Porque todas crescem em um dia",
        "Porque participam das relações ecológicas do ambiente",
        "Porque nunca precisam de água",
        "Porque substituem todos os animais",
      ],
      1,
      "Espécies nativas fazem parte das relações entre plantas, animais e ambiente.",
    ],
    [
      "",
      "O que significa biodiversidade?",
      [
        "Apenas a quantidade de árvores",
        "A quantidade de lixeiras",
        "A variedade de seres vivos, genes e ecossistemas",
        "Somente os animais de uma cidade",
      ],
      2,
      "Biodiversidade envolve a variedade de seres vivos, suas diferenças genéticas e os ecossistemas.",
    ],
    [
      "",
      "Por que a perda de polinizadores pode prejudicar algumas plantas?",
      [
        "Porque pode diminuir a formação de frutos e sementes",
        "Porque aumenta automaticamente a chuva",
        "Porque elimina a necessidade de água",
        "Porque transforma flores em pedras",
      ],
      0,
      "Muitas plantas dependem de polinizadores para sua reprodução.",
    ],
    [
      "",
      "O que pode acontecer quando o solo perde sua cobertura vegetal?",
      [
        "Ele fica protegido de toda erosão",
        "Toda a água passa a ser potável",
        "A chuva deixa de cair",
        "Pode aumentar a perda de solo pela chuva e pelo vento",
      ],
      3,
      "Sem proteção vegetal, o solo pode ficar mais vulnerável à erosão.",
    ],
    [
      "",
      "Por que a recuperação da Caatinga deve considerar as espécies locais?",
      [
        "Porque qualquer espécie estrangeira é sempre melhor",
        "Porque espécies locais podem apoiar as relações ecológicas da região",
        "Porque plantas não interagem com animais",
        "Porque a Caatinga não possui biodiversidade",
      ],
      1,
      "O uso de espécies nativas adequadas ajuda a recuperar as relações ecológicas.",
    ],
    [
      "",
      "Como baterias podem ajudar um sistema de energia solar?",
      [
        "Criando luz solar durante a noite",
        "Impedindo todo consumo de energia",
        "Armazenando energia para utilização posterior",
        "Transformando chuva em petróleo",
      ],
      2,
      "Baterias armazenam energia para que ela possa ser utilizada em outros momentos.",
    ],
    [
      "",
      "O que ajuda a diminuir o risco de alagamentos nas cidades?",
      [
        "Preservar áreas permeáveis e manter a drenagem adequada",
        "Cobrir todo o solo com cimento",
        "Jogar resíduos nos bueiros",
        "Retirar toda a vegetação",
      ],
      0,
      "Áreas permeáveis, vegetação e drenagem adequada podem ajudar a reduzir alagamentos.",
    ],
    [
      "",
      "Por que a água da chuva armazenada precisa de cuidados antes de ser bebida?",
      [
        "Porque toda água da chuva é salgada",
        "Porque não pode ser armazenada",
        "Porque não existe tratamento de água",
        "Porque pode conter contaminantes e precisar de tratamento",
      ],
      3,
      "A água coletada da chuva pode conter contaminantes e precisa ser tratada adequadamente para consumo.",
    ],
    [
      "",
      "O que significa reduzir gases de efeito estufa?",
      [
        "Eliminar todas as nuvens",
        "Diminuir emissões que contribuem para o aquecimento global",
        "Aumentar a fumaça",
        "Impedir a existência do vento",
      ],
      1,
      "Reduzir emissões de gases de efeito estufa ajuda a limitar o aquecimento do planeta.",
    ],
    [
      "",
      "O que é economia circular?",
      [
        "Comprar e descartar cada vez mais",
        "Produzir resíduos sem controle",
        "Prolongar o uso dos produtos por meio de reparo e reutilização",
        "Impedir o conserto de objetos",
      ],
      2,
      "A economia circular busca manter materiais e produtos em uso por mais tempo.",
    ],
    [
      "",
      "Por que a retirada excessiva de vegetação pode prejudicar os rios?",
      [
        "Porque pode aumentar a erosão e o transporte de sedimentos",
        "Porque transforma os rios em oceanos",
        "Porque elimina todas as chuvas",
        "Porque faz os rios produzirem energia sozinhos",
      ],
      0,
      "A perda da vegetação pode aumentar a erosão e levar mais sedimentos para os cursos de água.",
    ],
    [
      "",
      "Qual é uma possível consequência de períodos de seca muito prolongados?",
      [
        "Aumento garantido da água disponível",
        "Crescimento imediato de todas as plantas",
        "Desaparecimento de toda necessidade de irrigação",
        "Dificuldades no abastecimento de água e na agricultura",
      ],
      3,
      "Secas prolongadas podem afetar reservatórios, plantações e comunidades.",
    ],
    [
      "",
      "Por que a Caatinga não deve ser considerada um ambiente sem vida?",
      [
        "Porque não existem períodos secos",
        "Porque possui espécies adaptadas e grande biodiversidade",
        "Porque é completamente coberta por água",
        "Porque só existem plantas artificiais",
      ],
      1,
      "A Caatinga abriga muitas espécies adaptadas às suas condições ambientais.",
    ],
    [
      "",
      "O que pode acontecer quando uma espécie desaparece de um ecossistema?",
      [
        "Nada, porque as espécies não interagem",
        "Todos os animais passam a viver no mar",
        "As relações alimentares e ecológicas podem ser afetadas",
        "Todas as plantas deixam de precisar de luz",
      ],
      2,
      "Os seres vivos estão conectados. A perda de uma espécie pode afetar outras.",
    ],
    [
      "",
      "Por que a preservação de áreas naturais pode ajudar no equilíbrio do clima local?",
      [
        "Porque a vegetação influencia a temperatura, a umidade e o ciclo da água",
        "Porque impede qualquer mudança de temperatura",
        "Porque elimina todos os ventos",
        "Porque transforma todas as chuvas em neve",
      ],
      0,
      "A vegetação participa das trocas de água e energia e pode influenciar as condições locais.",
    ],
    [
      "",
      "Por que não é correto dizer que toda planta da Caatinga precisa de muita irrigação?",
      [
        "Porque todas vivem dentro de rios",
        "Porque nenhuma planta utiliza água",
        "Porque todas crescem sem raízes",
        "Porque muitas espécies possuem adaptações para enfrentar a seca",
      ],
      3,
      "Muitas plantas da Caatinga têm adaptações que ajudam a sobreviver com pouca chuva.",
    ],
    [
      "",
      "Uma comunidade quer proteger sua água durante períodos de seca. Qual conjunto de ações é mais adequado?",
      [
        "Desperdiçar água e retirar a vegetação",
        "Evitar desperdícios, proteger mananciais e armazenar água adequadamente",
        "Jogar resíduos nos reservatórios",
        "Utilizar toda a água disponível sem planejamento",
      ],
      1,
      "Economia, proteção dos mananciais e armazenamento adequado ajudam na segurança hídrica.",
    ],
  ],
};

// ---------------------------------------------------
// SORTEIO SEM REPETIÇÃO ENTRE PARTIDAS
// ---------------------------------------------------

const QUESTIONS_PER_GAME = 5;
const STORAGE_PREFIX = "planeta-em-jogo-quiz-v2-";

function shuffledIndices(total) {
  return shuffle(Array.from({ length: total }, (_, i) => i));
}

function nextQuestions(level) {
  const bank = QUIZ[level];
  const storageKey = STORAGE_PREFIX + level;
  let remaining = [];

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));

    if (
      Array.isArray(saved) &&
      saved.every(
        (index) => Number.isInteger(index) && index >= 0 && index < bank.length,
      ) &&
      new Set(saved).size === saved.length
    ) {
      remaining = saved;
    }
  } catch {
    remaining = [];
  }

  if (remaining.length < QUESTIONS_PER_GAME) {
    const newCycle = shuffledIndices(bank.length);

    // Evita que as últimas perguntas do ciclo anterior
    // apareçam novamente no início do próximo.
    if (remaining.length > 0) {
      const used = new Set(remaining);
      const fresh = newCycle.filter((index) => !used.has(index));
      remaining = [...remaining, ...fresh];
    } else {
      remaining = newCycle;
    }
  }

  const selected = remaining.slice(0, QUESTIONS_PER_GAME);
  const rest = remaining.slice(QUESTIONS_PER_GAME);

  try {
    localStorage.setItem(storageKey, JSON.stringify(rest));
  } catch {
    // O quiz continua funcionando mesmo sem armazenamento.
  }

  return selected.map((index) => bank[index]);
}

/* =====================================================
   NARRAÇÃO DO ECOQUIZ
===================================================== */

function stopSpeech() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

let audioContext = null;

function playEffect(type) {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    if (!audioContext) {
      audioContext = new AudioContextClass();
    }

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const now = audioContext.currentTime;

    function note(frequency, start, duration) {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = frequency;

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.12, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.start(start);
      oscillator.stop(start + duration);
    }

    if (type === "correct") {
      note(523, now, 0.16);
      note(659, now + 0.15, 0.16);
      note(784, now + 0.3, 0.25);
    } else {
      note(330, now, 0.18);
      note(247, now + 0.16, 0.25);
    }
  } catch (error) {
    console.warn("Erro no efeito sonoro:", error);
  }
}

/* =====================================================
   JOGO
===================================================== */

export function initQuiz() {
  let level = "facil";
  let questions = [];
  let pos = 0;
  let answered = false;
  let advancing = false;
  let errors = 0;
  let correctCount = 0;

  let speaking = false;
  let currentSpeech = null;
  let speechToken = 0;

  const AUDIO_STYLES = `
    <style>
      .quiz-audio-button {
        width: 46px;
        height: 46px;
        min-width: 46px;
        border-radius: 50%;
        border: 2px solid #cce8d9;
        background: #ffffff;
        color: #247b57;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 3px 0 #dcece3;
        transition:
          transform 0.15s ease,
          background 0.15s ease;
      }

      .quiz-audio-button:hover {
        background: #e7f8ee;
        transform: scale(1.05);
      }

      .quiz-audio-button:focus-visible {
        outline: 3px solid #247b57;
        outline-offset: 3px;
      }

      .quiz-audio-button.playing {
        background: #d9f5e5;
        border-color: #2eac69;
        color: #177644;
      }

      .quiz-audio-button svg {
        width: 23px;
        height: 23px;
        stroke: currentColor;
        stroke-width: 2.5;
        stroke-linecap: round;
        stroke-linejoin: round;
        fill: none;
      }

      .quiz-audio-area {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .quiz-audio-hint {
        font-size: 13px;
        font-weight: 700;
        color: #4a7564;
      }

      .quiz-status {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      @media (max-width: 520px) {
        .quiz-audio-button {
          width: 42px;
          height: 42px;
          min-width: 42px;
        }

        .quiz-audio-hint {
          font-size: 12px;
        }
      }
    </style>
  `;

  const ICON_VOLUME = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11 5 6 9H3v6h3l5 4V5Z"/>
      <path d="M15 9a5 5 0 0 1 0 6"/>
      <path d="M18 6a9 9 0 0 1 0 12"/>
    </svg>
  `;

  const ICON_STOP = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="6"
        y="6"
        width="12"
        height="12"
        rx="2"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  `;

  function updateAudioButton() {
    const button = $("#quiz-audio");
    const hint = $("#quiz-audio-hint");

    if (!button) return;

    button.innerHTML = speaking ? ICON_STOP : ICON_VOLUME;

    button.classList.toggle("playing", speaking);

    button.setAttribute("aria-label", speaking ? "Parar áudio" : "Ouvir áudio");

    button.setAttribute("title", speaking ? "Parar áudio" : "Ouvir áudio");

    button.setAttribute("aria-pressed", String(speaking));

    if (hint) {
      hint.textContent = speaking ? "Parar" : "Ouvir";
    }
  }

  function pararAudio() {
    speechToken++;
    speaking = false;
    currentSpeech = null;
    stopSpeech();
    updateAudioButton();
  }

  function falar(texto) {
    if (
      !("speechSynthesis" in window) ||
      !("SpeechSynthesisUtterance" in window)
    ) {
      message("O áudio não está disponível neste navegador.", false);
      return;
    }

    pararAudio();

    const token = ++speechToken;

    const utterance = new SpeechSynthesisUtterance(texto);

    utterance.lang = "pt-BR";
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const portugueseVoice = voices.find(
      (voice) => voice.lang.toLowerCase() === "pt-br",
    );

    if (portugueseVoice) {
      utterance.voice = portugueseVoice;
    }

    currentSpeech = utterance;
    speaking = true;

    updateAudioButton();

    function finalizar() {
      if (token !== speechToken) return;

      speaking = false;
      currentSpeech = null;
      updateAudioButton();
    }

    utterance.onend = finalizar;
    utterance.onerror = finalizar;

    window.speechSynthesis.speak(utterance);
  }

  function textoDaPergunta(question) {
    const alternativas = question[2]
      .map((option, index) => {
        const letra = String.fromCharCode(65 + index);
        return `Alternativa ${letra}: ${option}`;
      })
      .join(". ");

    return `${question[1]}. ${alternativas}`;
  }

  function draw() {
    pararAudio();

    const question = questions[pos];

    setArea(`
      <div class="game-wrap">

        ${AUDIO_STYLES}

        <h2 class="panel-title">
          Desafio do Conhecimento
        </h2>

        <p class="panel-subtitle">
          Escolha o nível e descubra como cuidar do planeta.
        </p>

        <div class="level-select">
          ${[
            ["facil", "Fácil"],
            ["medio", "Médio"],
            ["dificil", "Difícil"],
          ]
            .map(
              ([value, label]) => `
                <button
                  type="button"
                  class="level-btn ${level === value ? "active" : ""}"
                  data-level="${value}"
                  aria-pressed="${level === value}"
                >
                  ${label}
                </button>
              `,
            )
            .join("")}
        </div>

        <div class="status-line quiz-status">

          <span class="status-pill">
            Pergunta ${pos + 1} de ${questions.length}
          </span>

          <div class="quiz-audio-area">

            <span
              class="quiz-audio-hint"
              id="quiz-audio-hint"
            >
              Ouvir
            </span>

            <button
              type="button"
              class="quiz-audio-button"
              id="quiz-audio"
              aria-label="Ouvir áudio"
              title="Ouvir áudio"
              aria-pressed="false"
            >
              ${ICON_VOLUME}
            </button>

          </div>
        </div>

        <div class="question-box">
          <div class="question-text">
            ${esc(question[1])}
          </div>
        </div>

        <div class="opt-grid">
          ${question[2]
            .map(
              (option, index) => `
                <button
                  type="button"
                  class="option-btn"
                  data-answer="${index}"
                >
                  ${String.fromCharCode(65 + index)}.
                  ${esc(option)}
                </button>
              `,
            )
            .join("")}
        </div>

        <div id="message"></div>

        <div class="btn-row" id="next-holder"></div>

      </div>
    `);

    // Um único botão para iniciar e parar o áudio.
    $("#quiz-audio").onclick = () => {
      if (speaking) {
        pararAudio();
        return;
      }

      // Antes de acertar, lê a pergunta e alternativas.
      // Depois de acertar, lê a explicação.
      const texto = answered ? question[4] : textoDaPergunta(question);

      falar(texto);
    };

    // Mudança de dificuldade.
    $$(".level-btn").forEach((button) => {
      button.onclick = () => {
        if (level === button.dataset.level) return;

        pararAudio();

        level = button.dataset.level;
        start();
      };
    });

    // Respostas.
    $$("[data-answer]").forEach((button) => {
      button.onclick = () => {
        if (answered) return;

        const chosen = Number(button.dataset.answer);

        if (chosen !== question[3]) {
          errors++;

          playEffect("wrong");

          button.classList.add("wrong");

          message(
            "Ainda não! Pense com calma e tente outra alternativa.",
            false,
          );

          timer(() => {
            if (button.isConnected) {
              button.classList.remove("wrong");
            }
          }, 700);

          return;
        }

        answered = true;
        correctCount++;

        pararAudio();
        playEffect("correct");

        button.classList.add("correct");

        $$("[data-answer]").forEach((option) => {
          option.disabled = true;
        });

        message("Isso mesmo! " + question[4]);

        // O botão de áudio continua no mesmo lugar.
        // Agora ele lê a explicação.
        const hint = $("#quiz-audio-hint");

        if (hint) {
          hint.textContent = "Ouvir explicação";
        }

        const next = document.createElement("button");

        next.type = "button";
        next.id = "next";
        next.className = "btn";

        next.textContent =
          pos === questions.length - 1
            ? "Concluir aventura"
            : "Próxima pergunta";

        $("#next-holder").appendChild(next);

        next.onclick = () => {
          if (advancing) return;

          advancing = true;
          next.disabled = true;

          pararAudio();

          pos++;

          if (pos >= questions.length) {
            finish(
              "Missão concluída!",
              `Você respondeu ${correctCount} perguntas corretamente e fez ${errors} tentativa(s) incorreta(s). Continue explorando a Caatinga e cuidando da natureza!`,
            );

            return;
          }

          answered = false;
          advancing = false;

          draw();
        };
      };
    });
  }

  function start() {
    pararAudio();

    questions = nextQuestions(level);
    pos = 0;
    answered = false;
    advancing = false;
    errors = 0;
    correctCount = 0;

    draw();
  }

  start();
}
