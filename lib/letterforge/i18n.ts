/**
 * Little Learner localization.
 *
 * Two things vary by language:
 *   1. Subject content   — today's letter / number / color / shape /
 *      animal / feeling / story, plus the example word + sound.
 *   2. UI strings        — header labels, "Today's …", CTA labels,
 *      reward text. Kept tiny so a 12-language matrix fits on one
 *      page.
 *
 * Languages with no override fall back to English, so the page still
 * renders correctly while a curriculum team works on translations.
 */

import type { SubjectSlug } from "@/lib/letterforge/subjects";

/** Per-subject daily item override. Any field missing falls back to
 *  the English value from the subjects catalog. */
export type SubjectItemOverride = {
  /** Display value — letter, digit, or short word. */
  item?: string;
  /** Phonetic hint the speech engine says. */
  say?: string;
  /** Example word starting with / illustrating the item. */
  word?: string;
  /** Emoji to render as the reward. */
  wordEmoji?: string;
  /** One-line description, e.g. "A is for Apple". */
  description?: string;
};

export type SubjectLabels = {
  /** Short subject name in the local language. */
  short: string;
  /** Full Milo X name, e.g. "Milo Letters" / "Milo Letras". */
  name: string;
  /** Per-subject daily content override. */
  today?: SubjectItemOverride;
};

/** World-specific Start CTA copy. Stories says "Story Time" instead
 *  of "Lesson"; Numbers says "Counting"; etc. Fallback is a generic
 *  "Start {world}" if a subject isn't listed. */
export const START_LABEL_KEY: Record<string, string> = {
  letters: "Start Letter Practice",
  numbers: "Start Counting",
  colors: "Start Color Practice",
  shapes: "Start Shape Practice",
  animals: "Start Animal Game",
  feelings: "Start Feelings Game",
  stories: "Start Story Time",
};

export type UiStrings = {
  appName: string;
  helloReady: string;
  helloSubtitle: string;
  todaysLesson: string;
  todaysItem: (subject: string) => string; // "TODAY'S LETTER" / "HOY:" etc.
  todayWillPlay: string;
  miniGames: string;
  pickWorld: string;
  orPickAnotherArea: string;
  startToday: string;
  startWorld: (world: string) => string; // "Start Letters Lesson"
  startPractice: string;
  start: string;
  tapToHear: string;
  hearItem: (item: string) => string; // "Hear A"
  parentHold: string;
  parentArea: string;
  language: string;
  greatJob: string;
  nextGame: string;
  nextLabel: string;
  seeReward: string;
  youLearned: (item: string) => string;
  playAgain: string;
  backHome: string;
  done: string;
  gameNofM: (n: number, m: number) => string;
  // ── Teach-flow strings (3-step warm-up before practice) ────────
  learnWithMilo: string;
  hearAgain: string;
  imReady: string;
  thisIs: (item: string) => string; // "This is A."
  greatLetsPlay: string;
  tapTheItem: (item: string) => string; // "Tap A."
  miloTeaches: string; // header label on the teach screen
  stepNofM: (n: number, m: number) => string; // "Step 1 of 3"
  /** "Continue: Learn Blue" / "Continuar: Aprende Azul". */
  continueLearn: (next: string) => string;
  /** Shown on the reward CTA when the world's sequence is finished. */
  worldComplete: string;
};

export type LanguagePack = {
  ui: UiStrings;
  /** Per-subject overrides for THIS language. */
  subjects: Partial<Record<SubjectSlug, SubjectLabels>>;
};

/** English baseline — every other language merges over this. */
const EN: LanguagePack = {
  ui: {
    appName: "Little Learner",
    helloReady: "Hi! 👋 Ready to play with Milo?",
    todaysLesson: "TODAY'S LESSON",
    todaysItem: (s) => `TODAY'S ${s.toUpperCase()}`,
    miniGames: "TODAY'S MINI-GAMES",
    orPickAnotherArea: "OR PICK ANOTHER AREA",
    startToday: "▶ Start today's lesson",
    start: "▶ Start",
    tapToHear: "Tap to hear",
    parentHold: "Hold the 🔒 to open the parent area",
    parentArea: "Parent area",
    language: "Language",
    greatJob: "Great job!",
    nextGame: "Next game →",
    seeReward: "See my reward!",
    youLearned: (item) => `You learned ${item} today!`,
    playAgain: "↺ Play again",
    done: "✓ Done",
    gameNofM: (n, m) => `Game ${n} of ${m}`,
    helloSubtitle: "Choose a world, then start today's lesson.",
    todayWillPlay: "Today you will play:",
    pickWorld: "PICK A LEARNING WORLD",
    startWorld: (world) => `▶ Start ${world} Lesson`,
    startPractice: "▶ Start Practice",
    hearItem: (item) => `🔊 Hear ${item}`,
    nextLabel: "Continue",
    backHome: "🏠 Back Home",
    learnWithMilo: "📖 Learn with Milo",
    hearAgain: "🔊 Hear again",
    imReady: "I'm ready",
    thisIs: (item) => `This is ${item}.`,
    greatLetsPlay: "Great job! Let's play.",
    tapTheItem: (item) => `Tap ${item}.`,
    miloTeaches: "Milo teaches",
    stepNofM: (n, m) => `Step ${n} of ${m}`,
    continueLearn: (next) => `Continue: Learn ${next}`,
    worldComplete: "You finished this world! Try another",
  },
  subjects: {
    letters: { short: "Letters", name: "Milo Letters" },
    numbers: { short: "Numbers", name: "Milo Numbers" },
    colors: { short: "Colors", name: "Milo Colors" },
    shapes: { short: "Shapes", name: "Milo Shapes" },
    animals: { short: "Animals", name: "Milo Animals" },
    feelings: { short: "Feelings", name: "Milo Feelings" },
    stories: { short: "Stories", name: "Milo Stories" },
  },
};

const ES: LanguagePack = {
  ui: {
    appName: "Pequeño aprendiz",
    helloReady: "¡Hola! 👋 ¿Listo para jugar con Milo?",
    todaysLesson: "LECCIÓN DE HOY",
    todaysItem: (s) => `HOY · ${s.toUpperCase()}`,
    miniGames: "MINIJUEGOS DE HOY",
    orPickAnotherArea: "O ELIGE OTRA ÁREA",
    startToday: "▶ Empezar la lección",
    start: "▶ Empezar",
    tapToHear: "Toca para escuchar",
    parentHold: "Mantén pulsado 🔒 para el área de padres",
    parentArea: "Área de padres",
    language: "Idioma",
    greatJob: "¡Muy bien!",
    nextGame: "Siguiente juego →",
    seeReward: "¡Ver mi premio!",
    youLearned: (item) => `¡Hoy aprendiste ${item}!`,
    playAgain: "↺ Jugar otra vez",
    done: "✓ Listo",
    gameNofM: (n, m) => `Juego ${n} de ${m}`,
    helloSubtitle: "Elige un mundo y empieza la lección de hoy.",
    todayWillPlay: "Hoy vas a jugar:",
    pickWorld: "ELIGE UN MUNDO",
    startWorld: (world) => `▶ Empezar ${world}`,
    startPractice: "▶ Empezar a practicar",
    hearItem: (item) => `🔊 Escuchar ${item}`,
    nextLabel: "Continuar",
    backHome: "🏠 Volver al inicio",
    learnWithMilo: "📖 Aprende con Milo",
    hearAgain: "🔊 Escuchar otra vez",
    imReady: "Estoy listo",
    thisIs: (item) => `Esta es ${item}.`,
    greatLetsPlay: "¡Muy bien! Ahora juguemos.",
    tapTheItem: (item) => `Toca ${item}.`,
    miloTeaches: "Milo enseña",
    stepNofM: (n, m) => `Paso ${n} de ${m}`,
    continueLearn: (next) => `Continuar: Aprende ${next}`,
    worldComplete: "¡Terminaste este mundo! Prueba otro",
  },
  subjects: {
    letters: {
      short: "Letras",
      name: "Milo Letras",
      today: { word: "Árbol", wordEmoji: "🌳", description: "A es para Árbol" },
    },
    numbers: {
      short: "Números",
      name: "Milo Números",
      today: { word: "2 árboles", description: "Hoy contamos hasta 2" },
    },
    colors: {
      short: "Colores",
      name: "Milo Colores",
      today: {
        item: "Rojo",
        say: "Rojo",
        word: "Coche rojo",
        wordEmoji: "🚗",
        description: "El color de hoy es Rojo",
      },
    },
    shapes: {
      short: "Formas",
      name: "Milo Formas",
      today: {
        item: "Círculo",
        say: "Círculo",
        word: "Círculo",
        description: "La forma de hoy es el Círculo",
      },
    },
    animals: {
      short: "Animales",
      name: "Milo Animales",
      today: { item: "León", say: "León", word: "León", description: "Hoy conocemos al León" },
    },
    feelings: {
      short: "Emociones",
      name: "Milo Emociones",
      today: {
        item: "Feliz",
        say: "Feliz",
        word: "Feliz",
        description: "La emoción de hoy es Feliz",
      },
    },
    stories: {
      short: "Cuentos",
      name: "Milo Cuentos",
      today: {
        item: "Conejo valiente",
        word: "Conejo valiente",
        description: "Cuento de esta noche: El conejo valiente",
      },
    },
  },
};

const FR: LanguagePack = {
  ui: {
    appName: "Petit apprenti",
    helloReady: "Salut ! 👋 Prêt à jouer avec Milo ?",
    todaysLesson: "LEÇON DU JOUR",
    todaysItem: (s) => `AUJOURD'HUI · ${s.toUpperCase()}`,
    miniGames: "MINI-JEUX DU JOUR",
    orPickAnotherArea: "OU CHOISIS UNE AUTRE ZONE",
    startToday: "▶ Commencer la leçon",
    start: "▶ Démarrer",
    tapToHear: "Appuie pour écouter",
    parentHold: "Maintenir 🔒 pour l'espace parent",
    parentArea: "Espace parent",
    language: "Langue",
    greatJob: "Bravo !",
    nextGame: "Jeu suivant →",
    seeReward: "Voir ma récompense !",
    youLearned: (item) => `Tu as appris ${item} aujourd'hui !`,
    playAgain: "↺ Rejouer",
    done: "✓ Terminé",
    gameNofM: (n, m) => `Jeu ${n} sur ${m}`,
    helloSubtitle: "Choisis un monde, puis démarre la leçon du jour.",
    todayWillPlay: "Aujourd'hui tu vas jouer :",
    pickWorld: "CHOISIS UN MONDE",
    startWorld: (world) => `▶ Démarrer ${world}`,
    startPractice: "▶ Commencer à jouer",
    hearItem: (item) => `🔊 Écoute ${item}`,
    nextLabel: "Continuer",
    backHome: "🏠 Accueil",
    learnWithMilo: "📖 Apprends avec Milo",
    hearAgain: "🔊 Écouter encore",
    imReady: "Je suis prêt",
    thisIs: (item) => `Voici ${item}.`,
    greatLetsPlay: "Bravo ! Maintenant on joue.",
    tapTheItem: (item) => `Touche ${item}.`,
    miloTeaches: "Milo enseigne",
    stepNofM: (n, m) => `Étape ${n} sur ${m}`,
    continueLearn: (next) => `Continuer : Apprends ${next}`,
    worldComplete: "Tu as fini ce monde ! Essaie un autre",
  },
  subjects: {
    letters: {
      short: "Lettres",
      name: "Milo Lettres",
      today: { word: "Avion", wordEmoji: "✈️", description: "A comme Avion" },
    },
    numbers: {
      short: "Chiffres",
      name: "Milo Chiffres",
      today: { word: "2 avions", description: "Aujourd'hui on compte jusqu'à 2" },
    },
    colors: {
      short: "Couleurs",
      name: "Milo Couleurs",
      today: {
        item: "Rouge",
        say: "Rouge",
        word: "Voiture rouge",
        wordEmoji: "🚗",
        description: "La couleur du jour : Rouge",
      },
    },
    shapes: {
      short: "Formes",
      name: "Milo Formes",
      today: {
        item: "Cercle",
        say: "Cercle",
        word: "Cercle",
        description: "La forme du jour : le Cercle",
      },
    },
    animals: {
      short: "Animaux",
      name: "Milo Animaux",
      today: {
        item: "Lion",
        say: "Lion",
        word: "Lion",
        description: "Aujourd'hui on rencontre le Lion",
      },
    },
    feelings: {
      short: "Émotions",
      name: "Milo Émotions",
      today: {
        item: "Content",
        say: "Content",
        word: "Content",
        description: "L'émotion du jour : Content",
      },
    },
    stories: {
      short: "Histoires",
      name: "Milo Histoires",
      today: {
        item: "Lapin courageux",
        word: "Lapin courageux",
        description: "Histoire du soir : Le Lapin courageux",
      },
    },
  },
};

const IT: LanguagePack = {
  ui: {
    appName: "Piccolo allievo",
    helloReady: "Ciao! 👋 Pronto a giocare con Milo?",
    todaysLesson: "LEZIONE DI OGGI",
    todaysItem: (s) => `OGGI · ${s.toUpperCase()}`,
    miniGames: "MINI-GIOCHI DI OGGI",
    orPickAnotherArea: "OPPURE SCEGLI UN'ALTRA AREA",
    startToday: "▶ Inizia la lezione",
    start: "▶ Avvia",
    tapToHear: "Tocca per ascoltare",
    parentHold: "Tieni premuto 🔒 per l'area genitori",
    parentArea: "Area genitori",
    language: "Lingua",
    greatJob: "Bravo!",
    nextGame: "Prossimo gioco →",
    seeReward: "Vedi il mio premio!",
    youLearned: (item) => `Oggi hai imparato ${item}!`,
    playAgain: "↺ Gioca ancora",
    done: "✓ Fatto",
    gameNofM: (n, m) => `Gioco ${n} di ${m}`,
    helloSubtitle: "Scegli un mondo e inizia la lezione di oggi.",
    todayWillPlay: "Oggi giocherai a:",
    pickWorld: "SCEGLI UN MONDO",
    startWorld: (world) => `▶ Inizia ${world}`,
    startPractice: "▶ Inizia a praticare",
    hearItem: (item) => `🔊 Ascolta ${item}`,
    nextLabel: "Continua",
    backHome: "🏠 Home",
    learnWithMilo: "📖 Impara con Milo",
    hearAgain: "🔊 Ascolta di nuovo",
    imReady: "Sono pronto",
    thisIs: (item) => `Questa è ${item}.`,
    greatLetsPlay: "Bravo! Ora giochiamo.",
    tapTheItem: (item) => `Tocca ${item}.`,
    miloTeaches: "Milo insegna",
    stepNofM: (n, m) => `Passo ${n} di ${m}`,
    continueLearn: (next) => `Continua: Impara ${next}`,
    worldComplete: "Hai finito questo mondo! Prova un altro",
  },
  subjects: {
    letters: {
      short: "Lettere",
      name: "Milo Lettere",
      today: { word: "Albero", wordEmoji: "🌳", description: "A come Albero" },
    },
    numbers: {
      short: "Numeri",
      name: "Milo Numeri",
      today: { word: "2 alberi", description: "Oggi contiamo fino a 2" },
    },
    colors: {
      short: "Colori",
      name: "Milo Colori",
      today: {
        item: "Rosso",
        say: "Rosso",
        word: "Auto rossa",
        wordEmoji: "🚗",
        description: "Il colore di oggi è il Rosso",
      },
    },
    shapes: {
      short: "Forme",
      name: "Milo Forme",
      today: {
        item: "Cerchio",
        say: "Cerchio",
        word: "Cerchio",
        description: "La forma di oggi è il Cerchio",
      },
    },
    animals: {
      short: "Animali",
      name: "Milo Animali",
      today: {
        item: "Leone",
        say: "Leone",
        word: "Leone",
        description: "Oggi conosciamo il Leone",
      },
    },
    feelings: {
      short: "Emozioni",
      name: "Milo Emozioni",
      today: {
        item: "Felice",
        say: "Felice",
        word: "Felice",
        description: "L'emozione di oggi è Felice",
      },
    },
    stories: {
      short: "Storie",
      name: "Milo Storie",
      today: {
        item: "Coniglio coraggioso",
        word: "Coniglio coraggioso",
        description: "Storia della sera: Il coniglio coraggioso",
      },
    },
  },
};

const DE: LanguagePack = {
  ui: {
    appName: "Kleiner Lerner",
    helloReady: "Hallo! 👋 Bereit, mit Milo zu spielen?",
    todaysLesson: "HEUTIGE LEKTION",
    todaysItem: (s) => `HEUTE · ${s.toUpperCase()}`,
    miniGames: "HEUTIGE MINISPIELE",
    orPickAnotherArea: "ODER WÄHLE EINEN ANDEREN BEREICH",
    startToday: "▶ Lektion starten",
    start: "▶ Start",
    tapToHear: "Tippe zum Hören",
    parentHold: "🔒 halten, um zum Elternbereich zu öffnen",
    parentArea: "Elternbereich",
    language: "Sprache",
    greatJob: "Super gemacht!",
    nextGame: "Nächstes Spiel →",
    seeReward: "Belohnung ansehen!",
    youLearned: (item) => `Heute hast du ${item} gelernt!`,
    playAgain: "↺ Nochmal spielen",
    done: "✓ Fertig",
    gameNofM: (n, m) => `Spiel ${n} von ${m}`,
    helloSubtitle: "Wähle eine Welt und starte die heutige Lektion.",
    todayWillPlay: "Heute spielst du:",
    pickWorld: "WÄHLE EINE WELT",
    startWorld: (world) => `▶ ${world} starten`,
    startPractice: "▶ Üben starten",
    hearItem: (item) => `🔊 ${item} hören`,
    nextLabel: "Weiter",
    backHome: "🏠 Zum Start",
    learnWithMilo: "📖 Lerne mit Milo",
    hearAgain: "🔊 Nochmal hören",
    imReady: "Ich bin bereit",
    thisIs: (item) => `Das ist ${item}.`,
    greatLetsPlay: "Super! Jetzt spielen wir.",
    tapTheItem: (item) => `Tippe auf ${item}.`,
    miloTeaches: "Milo erklärt",
    stepNofM: (n, m) => `Schritt ${n} von ${m}`,
    continueLearn: (next) => `Weiter: Lerne ${next}`,
    worldComplete: "Diese Welt ist fertig! Probiere eine andere",
  },
  subjects: {
    letters: {
      short: "Buchstaben",
      name: "Milo Buchstaben",
      today: { word: "Apfel", wordEmoji: "🍎", description: "A wie Apfel" },
    },
    numbers: {
      short: "Zahlen",
      name: "Milo Zahlen",
      today: { word: "2 Äpfel", description: "Heute zählen wir bis 2" },
    },
    colors: {
      short: "Farben",
      name: "Milo Farben",
      today: {
        item: "Rot",
        say: "Rot",
        word: "Rotes Auto",
        wordEmoji: "🚗",
        description: "Die heutige Farbe ist Rot",
      },
    },
    shapes: {
      short: "Formen",
      name: "Milo Formen",
      today: {
        item: "Kreis",
        say: "Kreis",
        word: "Kreis",
        description: "Die heutige Form ist der Kreis",
      },
    },
    animals: {
      short: "Tiere",
      name: "Milo Tiere",
      today: {
        item: "Löwe",
        say: "Löwe",
        word: "Löwe",
        description: "Heute lernen wir den Löwen kennen",
      },
    },
    feelings: {
      short: "Gefühle",
      name: "Milo Gefühle",
      today: {
        item: "Glücklich",
        say: "Glücklich",
        word: "Glücklich",
        description: "Das heutige Gefühl ist Glücklich",
      },
    },
    stories: {
      short: "Geschichten",
      name: "Milo Geschichten",
      today: {
        item: "Mutiger Hase",
        word: "Mutiger Hase",
        description: "Heutige Geschichte: Der mutige Hase",
      },
    },
  },
};

const PT: LanguagePack = {
  ui: {
    appName: "Pequeno aprendiz",
    helloReady: "Olá! 👋 Pronto para brincar com o Milo?",
    todaysLesson: "LIÇÃO DE HOJE",
    todaysItem: (s) => `HOJE · ${s.toUpperCase()}`,
    miniGames: "MINIJOGOS DE HOJE",
    orPickAnotherArea: "OU ESCOLHE OUTRA ÁREA",
    startToday: "▶ Começar a lição",
    start: "▶ Começar",
    tapToHear: "Toca para ouvir",
    parentHold: "Mantém 🔒 para a área dos pais",
    parentArea: "Área dos pais",
    language: "Idioma",
    greatJob: "Boa!",
    nextGame: "Próximo jogo →",
    seeReward: "Ver o meu prémio!",
    youLearned: (item) => `Hoje aprendeste ${item}!`,
    playAgain: "↺ Jogar outra vez",
    done: "✓ Pronto",
    gameNofM: (n, m) => `Jogo ${n} de ${m}`,
    helloSubtitle: "Escolhe um mundo e começa a lição de hoje.",
    todayWillPlay: "Hoje vais jogar:",
    pickWorld: "ESCOLHE UM MUNDO",
    startWorld: (world) => `▶ Começar ${world}`,
    startPractice: "▶ Começar a praticar",
    hearItem: (item) => `🔊 Ouvir ${item}`,
    nextLabel: "Continuar",
    backHome: "🏠 Voltar",
    learnWithMilo: "📖 Aprende com o Milo",
    hearAgain: "🔊 Ouvir outra vez",
    imReady: "Estou pronto",
    thisIs: (item) => `Isto é ${item}.`,
    greatLetsPlay: "Boa! Agora vamos jogar.",
    tapTheItem: (item) => `Toca ${item}.`,
    miloTeaches: "O Milo ensina",
    stepNofM: (n, m) => `Passo ${n} de ${m}`,
    continueLearn: (next) => `Continuar: Aprender ${next}`,
    worldComplete: "Terminaste este mundo! Tenta outro",
  },
  subjects: {
    letters: {
      short: "Letras",
      name: "Milo Letras",
      today: { word: "Avião", wordEmoji: "✈️", description: "A de Avião" },
    },
    numbers: {
      short: "Números",
      name: "Milo Números",
      today: { word: "2 aviões", description: "Hoje contamos até 2" },
    },
    colors: {
      short: "Cores",
      name: "Milo Cores",
      today: {
        item: "Vermelho",
        say: "Vermelho",
        word: "Carro vermelho",
        wordEmoji: "🚗",
        description: "A cor de hoje é Vermelho",
      },
    },
    shapes: {
      short: "Formas",
      name: "Milo Formas",
      today: {
        item: "Círculo",
        say: "Círculo",
        word: "Círculo",
        description: "A forma de hoje é o Círculo",
      },
    },
    animals: {
      short: "Animais",
      name: "Milo Animais",
      today: { item: "Leão", say: "Leão", word: "Leão", description: "Hoje conhecemos o Leão" },
    },
    feelings: {
      short: "Emoções",
      name: "Milo Emoções",
      today: {
        item: "Feliz",
        say: "Feliz",
        word: "Feliz",
        description: "A emoção de hoje é Feliz",
      },
    },
    stories: {
      short: "Histórias",
      name: "Milo Histórias",
      today: {
        item: "Coelho corajoso",
        word: "Coelho corajoso",
        description: "História da noite: O coelho corajoso",
      },
    },
  },
};

const AR: LanguagePack = {
  ui: {
    appName: "المتعلم الصغير",
    helloReady: "مرحبًا! 👋 هل أنت مستعد للعب مع ميلو؟",
    todaysLesson: "درس اليوم",
    todaysItem: (s) => `اليوم · ${s}`,
    miniGames: "ألعاب اليوم",
    orPickAnotherArea: "أو اختر مجالاً آخر",
    startToday: "▶ ابدأ الدرس",
    start: "▶ ابدأ",
    tapToHear: "اضغط للاستماع",
    parentHold: "اضغط مطولاً على 🔒 لمنطقة الوالدين",
    parentArea: "منطقة الوالدين",
    language: "اللغة",
    greatJob: "أحسنت!",
    nextGame: "اللعبة التالية ←",
    seeReward: "شاهد جائزتي!",
    youLearned: (item) => `تعلمت ${item} اليوم!`,
    playAgain: "↺ العب مرة أخرى",
    done: "✓ تم",
    gameNofM: (n, m) => `لعبة ${n} من ${m}`,
    helloSubtitle: "اختر مجالاً ثم ابدأ درس اليوم.",
    todayWillPlay: "اليوم ستلعب:",
    pickWorld: "اختر مجالاً",
    startWorld: (world) => `▶ ابدأ ${world}`,
    startPractice: "▶ ابدأ التدريب",
    hearItem: (item) => `🔊 استمع إلى ${item}`,
    nextLabel: "تابع",
    backHome: "🏠 الرئيسية",
    learnWithMilo: "📖 تعلم مع ميلو",
    hearAgain: "🔊 اسمع مرة أخرى",
    imReady: "أنا جاهز",
    thisIs: (item) => `هذا ${item}.`,
    greatLetsPlay: "أحسنت! الآن نلعب.",
    tapTheItem: (item) => `اضغط على ${item}.`,
    miloTeaches: "ميلو يعلمك",
    stepNofM: (n, m) => `الخطوة ${n} من ${m}`,
    continueLearn: (next) => `تابع: تعلم ${next}`,
    worldComplete: "أنهيت هذا العالم! جرب آخر",
  },
  subjects: {
    letters: {
      short: "حروف",
      name: "ميلو حروف",
      today: { word: "أسد", wordEmoji: "🦁", description: "أ مثل أسد" },
    },
    numbers: {
      short: "أرقام",
      name: "ميلو أرقام",
      today: { word: "٢ تفاحات", description: "اليوم نعد حتى ٢" },
    },
    colors: {
      short: "ألوان",
      name: "ميلو ألوان",
      today: {
        item: "أحمر",
        say: "أحمر",
        word: "سيارة حمراء",
        wordEmoji: "🚗",
        description: "لون اليوم: أحمر",
      },
    },
    shapes: {
      short: "أشكال",
      name: "ميلو أشكال",
      today: { item: "دائرة", say: "دائرة", word: "دائرة", description: "شكل اليوم: دائرة" },
    },
    animals: {
      short: "حيوانات",
      name: "ميلو حيوانات",
      today: { item: "أسد", say: "أسد", word: "أسد", description: "اليوم نتعرف على الأسد" },
    },
    feelings: {
      short: "مشاعر",
      name: "ميلو مشاعر",
      today: { item: "سعيد", say: "سعيد", word: "سعيد", description: "شعور اليوم: سعيد" },
    },
    stories: {
      short: "قصص",
      name: "ميلو قصص",
      today: {
        item: "الأرنب الشجاع",
        word: "الأرنب الشجاع",
        description: "قصة الليلة: الأرنب الشجاع",
      },
    },
  },
};

const RU: LanguagePack = {
  ui: {
    appName: "Маленький ученик",
    helloReady: "Привет! 👋 Готов играть с Мило?",
    todaysLesson: "СЕГОДНЯШНИЙ УРОК",
    todaysItem: (s) => `СЕГОДНЯ · ${s.toUpperCase()}`,
    miniGames: "МИНИ-ИГРЫ НА СЕГОДНЯ",
    orPickAnotherArea: "ИЛИ ВЫБЕРИ ДРУГОЕ",
    startToday: "▶ Начать урок",
    start: "▶ Начать",
    tapToHear: "Нажми, чтобы услышать",
    parentHold: "Удерживай 🔒 для родителей",
    parentArea: "Родительская зона",
    language: "Язык",
    greatJob: "Молодец!",
    nextGame: "Следующая игра →",
    seeReward: "Показать награду!",
    youLearned: (item) => `Сегодня ты выучил ${item}!`,
    playAgain: "↺ Сыграть ещё",
    done: "✓ Готово",
    gameNofM: (n, m) => `Игра ${n} из ${m}`,
    helloSubtitle: "Выбери мир и начни сегодняшний урок.",
    todayWillPlay: "Сегодня ты будешь играть в:",
    pickWorld: "ВЫБЕРИ МИР",
    startWorld: (world) => `▶ Начать ${world}`,
    startPractice: "▶ Начать практику",
    hearItem: (item) => `🔊 Услышать ${item}`,
    nextLabel: "Дальше",
    backHome: "🏠 На главную",
    learnWithMilo: "📖 Учись с Мило",
    hearAgain: "🔊 Услышать ещё раз",
    imReady: "Я готов",
    thisIs: (item) => `Это ${item}.`,
    greatLetsPlay: "Молодец! Теперь играем.",
    tapTheItem: (item) => `Нажми ${item}.`,
    miloTeaches: "Мило учит",
    stepNofM: (n, m) => `Шаг ${n} из ${m}`,
    continueLearn: (next) => `Дальше: Узнай ${next}`,
    worldComplete: "Ты прошёл этот мир! Попробуй другой",
  },
  subjects: {
    letters: {
      short: "Буквы",
      name: "Мило Буквы",
      today: { word: "Арбуз", wordEmoji: "🍉", description: "А — это Арбуз" },
    },
    numbers: {
      short: "Числа",
      name: "Мило Числа",
      today: { word: "2 арбуза", description: "Сегодня считаем до 2" },
    },
    colors: {
      short: "Цвета",
      name: "Мило Цвета",
      today: {
        item: "Красный",
        say: "Красный",
        word: "Красная машина",
        wordEmoji: "🚗",
        description: "Цвет дня — Красный",
      },
    },
    shapes: {
      short: "Фигуры",
      name: "Мило Фигуры",
      today: { item: "Круг", say: "Круг", word: "Круг", description: "Фигура дня — Круг" },
    },
    animals: {
      short: "Животные",
      name: "Мило Животные",
      today: { item: "Лев", say: "Лев", word: "Лев", description: "Сегодня знакомимся со Львом" },
    },
    feelings: {
      short: "Чувства",
      name: "Мило Чувства",
      today: {
        item: "Радостный",
        say: "Радостный",
        word: "Радостный",
        description: "Чувство дня — Радостный",
      },
    },
    stories: {
      short: "Истории",
      name: "Мило Истории",
      today: {
        item: "Храбрый зайчик",
        word: "Храбрый зайчик",
        description: "История на вечер: Храбрый зайчик",
      },
    },
  },
};

const HI: LanguagePack = {
  ui: {
    appName: "नन्हा शिक्षार्थी",
    helloReady: "नमस्ते! 👋 मिलो के साथ खेलने को तैयार?",
    todaysLesson: "आज का पाठ",
    todaysItem: (s) => `आज · ${s}`,
    miniGames: "आज के मिनी-गेम",
    orPickAnotherArea: "या कोई और क्षेत्र चुनें",
    startToday: "▶ पाठ शुरू करें",
    start: "▶ शुरू",
    tapToHear: "सुनने के लिए टैप करें",
    parentHold: "अभिभावक के लिए 🔒 दबाकर रखें",
    parentArea: "अभिभावक क्षेत्र",
    language: "भाषा",
    greatJob: "शाबाश!",
    nextGame: "अगला खेल →",
    seeReward: "मेरा इनाम देखें!",
    youLearned: (item) => `आज आपने ${item} सीखा!`,
    playAgain: "↺ फिर से खेलें",
    done: "✓ हो गया",
    gameNofM: (n, m) => `खेल ${n} में से ${m}`,
    helloSubtitle: "एक दुनिया चुनो और आज का पाठ शुरू करो।",
    todayWillPlay: "आज तुम खेलोगे:",
    pickWorld: "एक दुनिया चुनो",
    startWorld: (world) => `▶ ${world} शुरू करें`,
    startPractice: "▶ अभ्यास शुरू करें",
    hearItem: (item) => `🔊 ${item} सुनो`,
    nextLabel: "आगे",
    backHome: "🏠 घर वापस",
    learnWithMilo: "📖 मिलो के साथ सीखो",
    hearAgain: "🔊 फिर से सुनो",
    imReady: "मैं तैयार हूँ",
    thisIs: (item) => `यह ${item} है।`,
    greatLetsPlay: "शाबाश! अब खेलते हैं।",
    tapTheItem: (item) => `${item} पर टैप करो।`,
    miloTeaches: "मिलो सिखाता है",
    stepNofM: (n, m) => `चरण ${n} में से ${m}`,
    continueLearn: (next) => `आगे: ${next} सीखो`,
    worldComplete: "यह दुनिया पूरी! दूसरी आजमाओ",
  },
  subjects: {
    letters: {
      short: "अक्षर",
      name: "मिलो अक्षर",
      today: { word: "अनार", wordEmoji: "🥭", description: "अ से अनार" },
    },
    numbers: {
      short: "संख्याएँ",
      name: "मिलो संख्याएँ",
      today: { word: "2 अनार", description: "आज हम 2 तक गिनते हैं" },
    },
    colors: {
      short: "रंग",
      name: "मिलो रंग",
      today: {
        item: "लाल",
        say: "लाल",
        word: "लाल कार",
        wordEmoji: "🚗",
        description: "आज का रंग लाल है",
      },
    },
    shapes: {
      short: "आकार",
      name: "मिलो आकार",
      today: { item: "वृत्त", say: "वृत्त", word: "वृत्त", description: "आज का आकार वृत्त है" },
    },
    animals: {
      short: "जानवर",
      name: "मिलो जानवर",
      today: { item: "शेर", say: "शेर", word: "शेर", description: "आज हम शेर से मिलते हैं" },
    },
    feelings: {
      short: "भावनाएँ",
      name: "मिलो भावनाएँ",
      today: { item: "खुश", say: "खुश", word: "खुश", description: "आज की भावना खुश है" },
    },
    stories: {
      short: "कहानियाँ",
      name: "मिलो कहानियाँ",
      today: {
        item: "बहादुर खरगोश",
        word: "बहादुर खरगोश",
        description: "आज की कहानी: बहादुर खरगोश",
      },
    },
  },
};

const JA: LanguagePack = {
  ui: {
    appName: "ちいさな がくしゅう",
    helloReady: "やあ! 👋 ミロといっしょに あそぼう!",
    todaysLesson: "きょうの レッスン",
    todaysItem: (s) => `きょうの ${s}`,
    miniGames: "きょうの ミニゲーム",
    orPickAnotherArea: "ほかの エリアを えらぶ",
    startToday: "▶ レッスンを はじめる",
    start: "▶ スタート",
    tapToHear: "タップで きく",
    parentHold: "🔒を ながおしして ほごしゃ ページへ",
    parentArea: "ほごしゃ ページ",
    language: "げんご",
    greatJob: "すごい!",
    nextGame: "つぎの ゲーム →",
    seeReward: "ごほうびを みる!",
    youLearned: (item) => `きょうは ${item}を おぼえたね!`,
    playAgain: "↺ もう いちど",
    done: "✓ おわり",
    gameNofM: (n, m) => `ゲーム ${n}/${m}`,
    helloSubtitle: "ワールドを えらんで きょうの レッスンを はじめよう。",
    todayWillPlay: "きょうは こんなことを するよ:",
    pickWorld: "ワールドを えらぼう",
    startWorld: (world) => `▶ ${world}を はじめる`,
    startPractice: "▶ れんしゅう スタート",
    hearItem: (item) => `🔊 ${item}を きく`,
    nextLabel: "つづける",
    backHome: "🏠 ホームへ",
    learnWithMilo: "📖 ミロと まなぼう",
    hearAgain: "🔊 もういちど きく",
    imReady: "じゅんびできた",
    thisIs: (item) => `これは ${item} だよ。`,
    greatLetsPlay: "よくできた! あそぼう。",
    tapTheItem: (item) => `${item}を タップしてね。`,
    miloTeaches: "ミロの レッスン",
    stepNofM: (n, m) => `ステップ ${n}/${m}`,
    continueLearn: (next) => `つづき: ${next}を まなぼう`,
    worldComplete: "このワールドかんりょう! つぎへ",
  },
  subjects: {
    letters: {
      short: "もじ",
      name: "ミロ もじ",
      today: { word: "あめ", wordEmoji: "🍬", description: "あ は あめ" },
    },
    numbers: {
      short: "すうじ",
      name: "ミロ すうじ",
      today: { word: "りんご2こ", description: "きょうは 2まで かぞえる" },
    },
    colors: {
      short: "いろ",
      name: "ミロ いろ",
      today: {
        item: "あか",
        say: "あか",
        word: "あかい くるま",
        wordEmoji: "🚗",
        description: "きょうの いろは あか",
      },
    },
    shapes: {
      short: "かたち",
      name: "ミロ かたち",
      today: { item: "まる", say: "まる", word: "まる", description: "きょうの かたちは まる" },
    },
    animals: {
      short: "どうぶつ",
      name: "ミロ どうぶつ",
      today: {
        item: "ライオン",
        say: "ライオン",
        word: "ライオン",
        description: "きょうは ライオンに あう",
      },
    },
    feelings: {
      short: "きもち",
      name: "ミロ きもち",
      today: {
        item: "うれしい",
        say: "うれしい",
        word: "うれしい",
        description: "きょうの きもちは うれしい",
      },
    },
    stories: {
      short: "おはなし",
      name: "ミロ おはなし",
      today: {
        item: "ゆうかんな うさぎ",
        word: "ゆうかんな うさぎ",
        description: "こんやの おはなし: ゆうかんな うさぎ",
      },
    },
  },
};

const KO: LanguagePack = {
  ui: {
    appName: "어린이 학습",
    helloReady: "안녕! 👋 밀로와 놀 준비됐어?",
    todaysLesson: "오늘의 수업",
    todaysItem: (s) => `오늘 · ${s}`,
    miniGames: "오늘의 미니 게임",
    orPickAnotherArea: "다른 영역 고르기",
    startToday: "▶ 오늘 수업 시작",
    start: "▶ 시작",
    tapToHear: "들으려면 탭",
    parentHold: "🔒를 길게 눌러 부모 영역",
    parentArea: "부모 영역",
    language: "언어",
    greatJob: "잘했어요!",
    nextGame: "다음 게임 →",
    seeReward: "보상 보기!",
    youLearned: (item) => `오늘 ${item}를 배웠어요!`,
    playAgain: "↺ 다시 놀기",
    done: "✓ 완료",
    gameNofM: (n, m) => `${m}개 중 ${n}번째 게임`,
    helloSubtitle: "세계를 골라서 오늘의 수업을 시작해.",
    todayWillPlay: "오늘 너는 이걸 놀 거야:",
    pickWorld: "세계를 골라봐",
    startWorld: (world) => `▶ ${world} 시작`,
    startPractice: "▶ 연습 시작",
    hearItem: (item) => `🔊 ${item} 듣기`,
    nextLabel: "계속",
    backHome: "🏠 홈으로",
    learnWithMilo: "📖 밀로와 배워요",
    hearAgain: "🔊 다시 듣기",
    imReady: "준비됐어요",
    thisIs: (item) => `이것은 ${item} 이에요.`,
    greatLetsPlay: "잘했어요! 놀아봐요.",
    tapTheItem: (item) => `${item}를 탭하세요.`,
    miloTeaches: "밀로의 수업",
    stepNofM: (n, m) => `단계 ${n} / ${m}`,
    continueLearn: (next) => `다음: ${next} 배우기`,
    worldComplete: "이 세계 완료! 다른 세계로",
  },
  subjects: {
    letters: {
      short: "글자",
      name: "밀로 글자",
      today: { word: "곰", wordEmoji: "🐻", description: "ㄱ은 곰" },
    },
    numbers: {
      short: "숫자",
      name: "밀로 숫자",
      today: { word: "곰 2마리", description: "오늘은 2까지 세요" },
    },
    colors: {
      short: "색깔",
      name: "밀로 색깔",
      today: {
        item: "빨강",
        say: "빨강",
        word: "빨간 차",
        wordEmoji: "🚗",
        description: "오늘의 색은 빨강",
      },
    },
    shapes: {
      short: "모양",
      name: "밀로 모양",
      today: { item: "원", say: "원", word: "원", description: "오늘의 모양은 원" },
    },
    animals: {
      short: "동물",
      name: "밀로 동물",
      today: { item: "사자", say: "사자", word: "사자", description: "오늘은 사자와 만나요" },
    },
    feelings: {
      short: "감정",
      name: "밀로 감정",
      today: { item: "행복", say: "행복", word: "행복", description: "오늘의 감정은 행복" },
    },
    stories: {
      short: "이야기",
      name: "밀로 이야기",
      today: {
        item: "용감한 토끼",
        word: "용감한 토끼",
        description: "오늘 밤 이야기: 용감한 토끼",
      },
    },
  },
};

const ZH: LanguagePack = {
  ui: {
    appName: "AI智能学习助手",
    helloReady: "你好！👋 准备好和米洛一起玩了吗？",
    todaysLesson: "今天的课",
    todaysItem: (s) => `今天 · ${s}`,
    miniGames: "今天的小游戏",
    orPickAnotherArea: "或者选择其他主题",
    startToday: "▶ 开始今天的课",
    start: "▶ 开始",
    tapToHear: "点击聆听",
    parentHold: "长按 🔒 进入家长区",
    parentArea: "家长区",
    language: "语言",
    greatJob: "真棒！",
    nextGame: "下一个游戏 →",
    seeReward: "看奖励！",
    youLearned: (item) => `今天你学了${item}！`,
    playAgain: "↺ 再玩一次",
    done: "✓ 完成",
    gameNofM: (n, m) => `第 ${n} / ${m} 局`,
    helloSubtitle: "选一个世界，然后开始今天的课。",
    todayWillPlay: "今天你要玩:",
    pickWorld: "选一个世界",
    startWorld: (world) => `▶ 开始${world}`,
    startPractice: "▶ 开始练习",
    hearItem: (item) => `🔊 听 ${item}`,
    nextLabel: "继续",
    backHome: "🏠 回到首页",
    learnWithMilo: "📖 和米洛一起学",
    hearAgain: "🔊 再听一次",
    imReady: "我准备好了",
    thisIs: (item) => `这是 ${item}。`,
    greatLetsPlay: "真棒！我们一起玩。",
    tapTheItem: (item) => `点击 ${item}。`,
    miloTeaches: "米洛教你",
    stepNofM: (n, m) => `第 ${n} 步 / ${m}`,
    continueLearn: (next) => `继续：学 ${next}`,
    worldComplete: "这个世界完成了！试试别的",
  },
  subjects: {
    letters: {
      short: "字",
      name: "米洛字",
      today: { item: "人", word: "人", wordEmoji: "🧑", description: "「人」是 person" },
    },
    numbers: {
      short: "数字",
      name: "米洛数字",
      today: { word: "2 个苹果", description: "今天数到 2" },
    },
    colors: {
      short: "颜色",
      name: "米洛颜色",
      today: {
        item: "红色",
        say: "红色",
        word: "红色的车",
        wordEmoji: "🚗",
        description: "今天的颜色是红色",
      },
    },
    shapes: {
      short: "形状",
      name: "米洛形状",
      today: { item: "圆形", say: "圆形", word: "圆形", description: "今天的形状是圆形" },
    },
    animals: {
      short: "动物",
      name: "米洛动物",
      today: { item: "狮子", say: "狮子", word: "狮子", description: "今天我们认识狮子" },
    },
    feelings: {
      short: "感受",
      name: "米洛感受",
      today: { item: "开心", say: "开心", word: "开心", description: "今天的感受是开心" },
    },
    stories: {
      short: "故事",
      name: "米洛故事",
      today: { item: "勇敢的小兔", word: "勇敢的小兔", description: "今晚的故事：勇敢的小兔" },
    },
  },
};

const PACKS: Record<string, LanguagePack> = {
  en: EN,
  es: ES,
  fr: FR,
  it: IT,
  de: DE,
  pt: PT,
  ar: AR,
  ru: RU,
  hi: HI,
  ja: JA,
  ko: KO,
  zh: ZH,
};

/** Look up a language pack, with English as the safe fallback. */
export function getPack(langCode: string | undefined | null): LanguagePack {
  if (!langCode) return EN;
  return PACKS[langCode.toLowerCase()] ?? EN;
}

/** Subject labels in a given language — merges in English defaults
 *  for any missing fields. */
export function subjectLabels(langCode: string, slug: SubjectSlug): SubjectLabels {
  const pack = getPack(langCode);
  const fallback = EN.subjects[slug]!;
  const override = pack.subjects[slug];
  return {
    short: override?.short ?? fallback.short,
    name: override?.name ?? fallback.name,
    today: { ...(fallback.today ?? {}), ...(override?.today ?? {}) },
  };
}

/** World-specific Start label, with the localized world name baked in.
 *  Spanish "Numbers" → "Empezar a contar"; English "Numbers" →
 *  "Start Counting". Falls back to the generic "▶ Start {world}". */
export function startLabelFor(langCode: string, slug: SubjectSlug): string {
  const labels = subjectLabels(langCode, slug);
  // Spanish-style intent labels for the major Latin-script locales.
  const lower = (langCode || "en").toLowerCase();
  const map: Partial<Record<string, Partial<Record<SubjectSlug, string>>>> = {
    en: {
      letters: "▶ Start Letter Practice",
      numbers: "▶ Start Counting",
      colors: "▶ Start Color Practice",
      shapes: "▶ Start Shape Practice",
      animals: "▶ Start Animal Game",
      feelings: "▶ Start Feelings Game",
      stories: "▶ Start Story Time",
    },
    es: {
      letters: "▶ Empezar las Letras",
      numbers: "▶ Empezar a Contar",
      colors: "▶ Empezar los Colores",
      shapes: "▶ Empezar las Formas",
      animals: "▶ Empezar el Juego de Animales",
      feelings: "▶ Empezar las Emociones",
      stories: "▶ Empezar la Hora del Cuento",
    },
    fr: {
      letters: "▶ Démarrer les Lettres",
      numbers: "▶ Démarrer le Calcul",
      colors: "▶ Démarrer les Couleurs",
      shapes: "▶ Démarrer les Formes",
      animals: "▶ Démarrer le Jeu d'Animaux",
      feelings: "▶ Démarrer les Émotions",
      stories: "▶ Démarrer l'Histoire",
    },
    pt: {
      letters: "▶ Começar as Letras",
      numbers: "▶ Começar a Contar",
      colors: "▶ Começar as Cores",
      shapes: "▶ Começar as Formas",
      animals: "▶ Começar o Jogo dos Animais",
      feelings: "▶ Começar as Emoções",
      stories: "▶ Começar a História",
    },
    zh: {
      letters: "▶ 开始汉字/字母练习",
      numbers: "▶ 开始数字与数感练习",
      colors: "▶ 开始颜色认知",
      shapes: "▶ 开始形状认知",
      animals: "▶ 开始动物认识",
      feelings: "▶ 开始情绪表达",
      stories: "▶ 开始故事时间",
    },
  };
  const langMap = map[lower];
  const exact = langMap?.[slug];
  if (exact) return exact;
  // Generic fallback uses the localized world name from the UI pack.
  return getPack(langCode).ui.startWorld(labels.short);
}
