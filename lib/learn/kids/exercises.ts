/**
 * Kids exercise catalogue — 40+ touch-friendly mini-tasks for ages 3-6.
 *
 * Design rules:
 *   - Single tap or single drag — no typing, no reading required
 *   - Every answer is a big emoji + optional one-word caption
 *   - The prompt is short enough to read aloud in 3 seconds
 *   - 4 themes that map 1:1 to the parent dashboard's subject allow-list
 *   - Same shape for every exercise so the player only has 5 render
 *     variants to handle
 */

export type KidsTheme = "numbers" | "letters" | "colors" | "shapes" | "animals" | "feelings";

export const THEMES: Array<{
  id: KidsTheme;
  label: string;
  emoji: string;
  color: string;
  bg: string;
}> = [
  { id: "numbers", label: "Numbers", emoji: "🔢", color: "#2e5bff", bg: "#e6ecff" },
  { id: "letters", label: "Letters", emoji: "🅰️", color: "#f59e0b", bg: "#fff1d6" },
  { id: "colors", label: "Colors", emoji: "🎨", color: "#ec4899", bg: "#fce0ec" },
  { id: "shapes", label: "Shapes", emoji: "🔷", color: "#0ea5a4", bg: "#d6f1f0" },
  { id: "animals", label: "Animals", emoji: "🦁", color: "#16a34a", bg: "#d1fae5" },
  { id: "feelings", label: "Feelings", emoji: "🐻", color: "#7c3aed", bg: "#efe7ff" },
];

export type ExerciseKind =
  | "count" //         show N emojis → pick the digit
  | "pick-named" //    show 4 options → pick the one named in the prompt
  | "match-pair" //    show 4 items → pick the one matching the reference
  | "bigger" //        show 2 options → pick the bigger (or smaller) one
  | "what-says"; //    show 4 animals → pick the one that makes the sound

export type Exercise = {
  id: string;
  theme: KidsTheme;
  kind: ExerciseKind;
  /** Spoken / displayed prompt. Keep ≤ 8 words. */
  prompt: string;
  /** Optional emoji shown beside the prompt (e.g. the "🍎🍎🍎" to count). */
  showEmoji?: string;
  /** Optional count rendering of an emoji (for `count` kind). */
  showCount?: number;
  /** Optional helper emoji rendered above the choices (e.g. the reference card in match-pair). */
  reference?: string;
  /** 2-4 answer choices. The correct one is matched by id. */
  choices: Array<{ id: string; emoji: string; label?: string }>;
  /** Id of the correct choice. */
  correctId: string;
  /** Friendly explanation said after a correct or incorrect tap. */
  praise: string;
  /** Optional retry hint shown on the first wrong tap. */
  hint?: string;
};

/* ────────── Numbers ────────── */
const NUMBERS: Exercise[] = [
  {
    id: "n1",
    theme: "numbers",
    kind: "count",
    prompt: "How many apples?",
    showEmoji: "🍎",
    showCount: 1,
    choices: [
      { id: "a", emoji: "1️⃣", label: "1" },
      { id: "b", emoji: "2️⃣", label: "2" },
      { id: "c", emoji: "3️⃣", label: "3" },
    ],
    correctId: "a",
    praise: "One apple! Yum.",
    hint: "Count them: one!",
  },
  {
    id: "n2",
    theme: "numbers",
    kind: "count",
    prompt: "How many cats?",
    showEmoji: "🐱",
    showCount: 2,
    choices: [
      { id: "a", emoji: "1️⃣", label: "1" },
      { id: "b", emoji: "2️⃣", label: "2" },
      { id: "c", emoji: "3️⃣", label: "3" },
    ],
    correctId: "b",
    praise: "Two cats! Meow meow.",
    hint: "Point at each cat as you count.",
  },
  {
    id: "n3",
    theme: "numbers",
    kind: "count",
    prompt: "How many ducks?",
    showEmoji: "🦆",
    showCount: 3,
    choices: [
      { id: "a", emoji: "2️⃣", label: "2" },
      { id: "b", emoji: "3️⃣", label: "3" },
      { id: "c", emoji: "4️⃣", label: "4" },
    ],
    correctId: "b",
    praise: "Three ducks! Quack quack quack.",
  },
  {
    id: "n4",
    theme: "numbers",
    kind: "count",
    prompt: "How many stars?",
    showEmoji: "⭐",
    showCount: 4,
    choices: [
      { id: "a", emoji: "3️⃣", label: "3" },
      { id: "b", emoji: "4️⃣", label: "4" },
      { id: "c", emoji: "5️⃣", label: "5" },
    ],
    correctId: "b",
    praise: "Four stars! Twinkle twinkle.",
  },
  {
    id: "n5",
    theme: "numbers",
    kind: "count",
    prompt: "How many hearts?",
    showEmoji: "❤️",
    showCount: 5,
    choices: [
      { id: "a", emoji: "4️⃣", label: "4" },
      { id: "b", emoji: "5️⃣", label: "5" },
      { id: "c", emoji: "6️⃣", label: "6" },
    ],
    correctId: "b",
    praise: "Five hearts! High five!",
  },
  {
    id: "n6",
    theme: "numbers",
    kind: "count",
    prompt: "How many fish?",
    showEmoji: "🐟",
    showCount: 6,
    choices: [
      { id: "a", emoji: "5️⃣", label: "5" },
      { id: "b", emoji: "6️⃣", label: "6" },
      { id: "c", emoji: "7️⃣", label: "7" },
    ],
    correctId: "b",
    praise: "Six fish! Blub blub.",
  },
  {
    id: "n7",
    theme: "numbers",
    kind: "bigger",
    prompt: "Which is bigger?",
    choices: [
      { id: "a", emoji: "3️⃣", label: "3" },
      { id: "b", emoji: "5️⃣", label: "5" },
    ],
    correctId: "b",
    praise: "Five is bigger than three.",
  },
  {
    id: "n8",
    theme: "numbers",
    kind: "bigger",
    prompt: "Which is smaller?",
    choices: [
      { id: "a", emoji: "2️⃣", label: "2" },
      { id: "b", emoji: "7️⃣", label: "7" },
    ],
    correctId: "a",
    praise: "Two is smaller than seven.",
  },
];

/* ────────── Letters ────────── */
const LETTERS: Exercise[] = [
  {
    id: "l1",
    theme: "letters",
    kind: "pick-named",
    prompt: "Find the letter A",
    choices: [
      { id: "a", emoji: "🅰️", label: "A" },
      { id: "b", emoji: "🅱️", label: "B" },
      { id: "c", emoji: "🆎", label: "AB" },
    ],
    correctId: "a",
    praise: "That's A! Like apple.",
  },
  {
    id: "l2",
    theme: "letters",
    kind: "pick-named",
    prompt: "Find the letter B",
    choices: [
      { id: "a", emoji: "🅰️", label: "A" },
      { id: "b", emoji: "🅱️", label: "B" },
      { id: "c", emoji: "🅾️", label: "O" },
    ],
    correctId: "b",
    praise: "That's B! Like ball.",
  },
  {
    id: "l3",
    theme: "letters",
    kind: "match-pair",
    prompt: "What starts with A?",
    reference: "🅰️",
    choices: [
      { id: "a", emoji: "🍎", label: "Apple" },
      { id: "b", emoji: "🐱", label: "Cat" },
      { id: "c", emoji: "🌳", label: "Tree" },
    ],
    correctId: "a",
    praise: "Apple starts with A!",
  },
  {
    id: "l4",
    theme: "letters",
    kind: "match-pair",
    prompt: "What starts with B?",
    reference: "🅱️",
    choices: [
      { id: "a", emoji: "🍌", label: "Banana" },
      { id: "b", emoji: "🐶", label: "Dog" },
      { id: "c", emoji: "🌞", label: "Sun" },
    ],
    correctId: "a",
    praise: "Banana starts with B!",
  },
  {
    id: "l5",
    theme: "letters",
    kind: "match-pair",
    prompt: "What starts with C?",
    reference: "🇨",
    choices: [
      { id: "a", emoji: "🦁", label: "Lion" },
      { id: "b", emoji: "🐱", label: "Cat" },
      { id: "c", emoji: "🐶", label: "Dog" },
    ],
    correctId: "b",
    praise: "Cat starts with C!",
  },
  {
    id: "l6",
    theme: "letters",
    kind: "match-pair",
    prompt: "What starts with D?",
    reference: "🇩",
    choices: [
      { id: "a", emoji: "🐢", label: "Turtle" },
      { id: "b", emoji: "🐶", label: "Dog" },
      { id: "c", emoji: "🐠", label: "Fish" },
    ],
    correctId: "b",
    praise: "Dog starts with D!",
  },
];

/* ────────── Colors ────────── */
const COLORS: Exercise[] = [
  {
    id: "c1",
    theme: "colors",
    kind: "pick-named",
    prompt: "Find the red one",
    choices: [
      { id: "a", emoji: "🔴", label: "Red" },
      { id: "b", emoji: "🔵", label: "Blue" },
      { id: "c", emoji: "🟢", label: "Green" },
    ],
    correctId: "a",
    praise: "Red! Like a strawberry.",
  },
  {
    id: "c2",
    theme: "colors",
    kind: "pick-named",
    prompt: "Find the blue one",
    choices: [
      { id: "a", emoji: "🟡", label: "Yellow" },
      { id: "b", emoji: "🔵", label: "Blue" },
      { id: "c", emoji: "🟢", label: "Green" },
    ],
    correctId: "b",
    praise: "Blue! Like the sky.",
  },
  {
    id: "c3",
    theme: "colors",
    kind: "pick-named",
    prompt: "Find the yellow one",
    choices: [
      { id: "a", emoji: "🟣", label: "Purple" },
      { id: "b", emoji: "🟡", label: "Yellow" },
      { id: "c", emoji: "🟠", label: "Orange" },
    ],
    correctId: "b",
    praise: "Yellow! Like the sun.",
  },
  {
    id: "c4",
    theme: "colors",
    kind: "pick-named",
    prompt: "Find the green one",
    choices: [
      { id: "a", emoji: "🟢", label: "Green" },
      { id: "b", emoji: "🔴", label: "Red" },
      { id: "c", emoji: "🟣", label: "Purple" },
    ],
    correctId: "a",
    praise: "Green! Like grass.",
  },
  {
    id: "c5",
    theme: "colors",
    kind: "match-pair",
    prompt: "Which one matches?",
    reference: "🍎",
    choices: [
      { id: "a", emoji: "🔴", label: "Red" },
      { id: "b", emoji: "🟢", label: "Green" },
      { id: "c", emoji: "🟡", label: "Yellow" },
    ],
    correctId: "a",
    praise: "Apples are red!",
  },
  {
    id: "c6",
    theme: "colors",
    kind: "match-pair",
    prompt: "Which one matches?",
    reference: "🌞",
    choices: [
      { id: "a", emoji: "🔵", label: "Blue" },
      { id: "b", emoji: "🟡", label: "Yellow" },
      { id: "c", emoji: "🟣", label: "Purple" },
    ],
    correctId: "b",
    praise: "The sun is yellow!",
  },
  {
    id: "c7",
    theme: "colors",
    kind: "match-pair",
    prompt: "Which one matches?",
    reference: "🌳",
    choices: [
      { id: "a", emoji: "🟢", label: "Green" },
      { id: "b", emoji: "🟠", label: "Orange" },
      { id: "c", emoji: "🔵", label: "Blue" },
    ],
    correctId: "a",
    praise: "Trees are green!",
  },
];

/* ────────── Shapes ────────── */
const SHAPES: Exercise[] = [
  {
    id: "s1",
    theme: "shapes",
    kind: "pick-named",
    prompt: "Find the circle",
    choices: [
      { id: "a", emoji: "⚪", label: "Circle" },
      { id: "b", emoji: "🟥", label: "Square" },
      { id: "c", emoji: "🔺", label: "Triangle" },
    ],
    correctId: "a",
    praise: "A circle! Round like a ball.",
  },
  {
    id: "s2",
    theme: "shapes",
    kind: "pick-named",
    prompt: "Find the square",
    choices: [
      { id: "a", emoji: "⚪", label: "Circle" },
      { id: "b", emoji: "🟥", label: "Square" },
      { id: "c", emoji: "🔺", label: "Triangle" },
    ],
    correctId: "b",
    praise: "A square! Four sides the same.",
  },
  {
    id: "s3",
    theme: "shapes",
    kind: "pick-named",
    prompt: "Find the triangle",
    choices: [
      { id: "a", emoji: "🔺", label: "Triangle" },
      { id: "b", emoji: "⚪", label: "Circle" },
      { id: "c", emoji: "⭐", label: "Star" },
    ],
    correctId: "a",
    praise: "A triangle! Three points.",
  },
  {
    id: "s4",
    theme: "shapes",
    kind: "pick-named",
    prompt: "Find the star",
    choices: [
      { id: "a", emoji: "⚪", label: "Circle" },
      { id: "b", emoji: "⭐", label: "Star" },
      { id: "c", emoji: "❤️", label: "Heart" },
    ],
    correctId: "b",
    praise: "A star! Twinkle twinkle.",
  },
  {
    id: "s5",
    theme: "shapes",
    kind: "match-pair",
    prompt: "What shape is the ball?",
    reference: "🏀",
    choices: [
      { id: "a", emoji: "⚪", label: "Circle" },
      { id: "b", emoji: "🟥", label: "Square" },
      { id: "c", emoji: "🔺", label: "Triangle" },
    ],
    correctId: "a",
    praise: "Balls are round — circles!",
  },
  {
    id: "s6",
    theme: "shapes",
    kind: "match-pair",
    prompt: "What shape is the pizza slice?",
    reference: "🍕",
    choices: [
      { id: "a", emoji: "🔺", label: "Triangle" },
      { id: "b", emoji: "⚪", label: "Circle" },
      { id: "c", emoji: "🟥", label: "Square" },
    ],
    correctId: "a",
    praise: "Pizza slice — a triangle!",
  },
];

/* ────────── Animals ────────── */
const ANIMALS: Exercise[] = [
  {
    id: "a1",
    theme: "animals",
    kind: "pick-named",
    prompt: "Find the cat",
    choices: [
      { id: "a", emoji: "🐶", label: "Dog" },
      { id: "b", emoji: "🐱", label: "Cat" },
      { id: "c", emoji: "🐭", label: "Mouse" },
    ],
    correctId: "b",
    praise: "Meow! Cats love yarn.",
  },
  {
    id: "a2",
    theme: "animals",
    kind: "pick-named",
    prompt: "Find the dog",
    choices: [
      { id: "a", emoji: "🐶", label: "Dog" },
      { id: "b", emoji: "🐰", label: "Rabbit" },
      { id: "c", emoji: "🦆", label: "Duck" },
    ],
    correctId: "a",
    praise: "Woof! Dogs love walks.",
  },
  {
    id: "a3",
    theme: "animals",
    kind: "pick-named",
    prompt: "Find the elephant",
    choices: [
      { id: "a", emoji: "🐭", label: "Mouse" },
      { id: "b", emoji: "🐘", label: "Elephant" },
      { id: "c", emoji: "🐢", label: "Turtle" },
    ],
    correctId: "b",
    praise: "Elephants have big trunks!",
  },
  {
    id: "a4",
    theme: "animals",
    kind: "what-says",
    prompt: "Who says moo?",
    choices: [
      { id: "a", emoji: "🐱", label: "Cat" },
      { id: "b", emoji: "🐮", label: "Cow" },
      { id: "c", emoji: "🐶", label: "Dog" },
    ],
    correctId: "b",
    praise: "Cows say moooo!",
  },
  {
    id: "a5",
    theme: "animals",
    kind: "what-says",
    prompt: "Who says meow?",
    choices: [
      { id: "a", emoji: "🦁", label: "Lion" },
      { id: "b", emoji: "🐱", label: "Cat" },
      { id: "c", emoji: "🐸", label: "Frog" },
    ],
    correctId: "b",
    praise: "Cats say meow!",
  },
  {
    id: "a6",
    theme: "animals",
    kind: "what-says",
    prompt: "Who says woof?",
    choices: [
      { id: "a", emoji: "🐶", label: "Dog" },
      { id: "b", emoji: "🐠", label: "Fish" },
      { id: "c", emoji: "🐰", label: "Rabbit" },
    ],
    correctId: "a",
    praise: "Dogs say woof!",
  },
  {
    id: "a7",
    theme: "animals",
    kind: "what-says",
    prompt: "Who says quack?",
    choices: [
      { id: "a", emoji: "🐮", label: "Cow" },
      { id: "b", emoji: "🦆", label: "Duck" },
      { id: "c", emoji: "🐔", label: "Chicken" },
    ],
    correctId: "b",
    praise: "Ducks say quack!",
  },
  {
    id: "a8",
    theme: "animals",
    kind: "bigger",
    prompt: "Which is bigger?",
    choices: [
      { id: "a", emoji: "🐭", label: "Mouse" },
      { id: "b", emoji: "🐘", label: "Elephant" },
    ],
    correctId: "b",
    praise: "Elephants are huge!",
  },
];

/* ────────── Feelings ────────── */
const FEELINGS: Exercise[] = [
  {
    id: "f1",
    theme: "feelings",
    kind: "pick-named",
    prompt: "Find the happy face",
    choices: [
      { id: "a", emoji: "😢", label: "Sad" },
      { id: "b", emoji: "😊", label: "Happy" },
      { id: "c", emoji: "😠", label: "Angry" },
    ],
    correctId: "b",
    praise: "Happy! Smiles are good.",
  },
  {
    id: "f2",
    theme: "feelings",
    kind: "pick-named",
    prompt: "Find the sad face",
    choices: [
      { id: "a", emoji: "😊", label: "Happy" },
      { id: "b", emoji: "😢", label: "Sad" },
      { id: "c", emoji: "😮", label: "Surprised" },
    ],
    correctId: "b",
    praise: "Sad. A hug can help.",
  },
  {
    id: "f3",
    theme: "feelings",
    kind: "pick-named",
    prompt: "Find the surprised face",
    choices: [
      { id: "a", emoji: "😴", label: "Sleepy" },
      { id: "b", emoji: "😮", label: "Surprised" },
      { id: "c", emoji: "😊", label: "Happy" },
    ],
    correctId: "b",
    praise: "Surprised! Like a present!",
  },
  {
    id: "f4",
    theme: "feelings",
    kind: "pick-named",
    prompt: "Find the sleepy face",
    choices: [
      { id: "a", emoji: "😊", label: "Happy" },
      { id: "b", emoji: "😠", label: "Angry" },
      { id: "c", emoji: "😴", label: "Sleepy" },
    ],
    correctId: "c",
    praise: "Sleepy. Time to rest.",
  },
  {
    id: "f5",
    theme: "feelings",
    kind: "match-pair",
    prompt: "How does cake make you feel?",
    reference: "🎂",
    choices: [
      { id: "a", emoji: "😊", label: "Happy" },
      { id: "b", emoji: "😢", label: "Sad" },
      { id: "c", emoji: "😠", label: "Angry" },
    ],
    correctId: "a",
    praise: "Cake makes us happy!",
  },
  {
    id: "f6",
    theme: "feelings",
    kind: "match-pair",
    prompt: "How does a broken toy feel?",
    reference: "💔",
    choices: [
      { id: "a", emoji: "😊", label: "Happy" },
      { id: "b", emoji: "😢", label: "Sad" },
      { id: "c", emoji: "😮", label: "Surprised" },
    ],
    correctId: "b",
    praise: "A broken toy is sad. We can fix it.",
  },
];

export const ALL_EXERCISES: Exercise[] = [
  ...NUMBERS,
  ...LETTERS,
  ...COLORS,
  ...SHAPES,
  ...ANIMALS,
  ...FEELINGS,
];

export function exercisesByTheme(theme: KidsTheme): Exercise[] {
  return ALL_EXERCISES.filter((e) => e.theme === theme);
}

export function exerciseCount(theme: KidsTheme): number {
  return exercisesByTheme(theme).length;
}
