export const THEMES = {
  goth: {
    id: "goth",
    name: "Goth",
    icon: "🖤",
    description: "Dark velvet, purple glow and occult circles",
  },

  circus: {
    id: "circus",
    name: "Circus",
    icon: "🎪",
    description: "Dark carnival, gold, red and diagonal stripes",
  },

  forest: {
    id: "forest",
    name: "Forest",
    icon: "🌲",
    description: "Deep woodland, moss and natural patterns",
  },

  detective: {
    id: "detective",
    name: "Detective",
    icon: "🕵️",
    description: "Ancient paper, investigation boards and grids",
  },

  mafia: {
    id: "mafia",
    name: "Mafia",
    icon: "♠️",
    description: "Noir, pinstripes and luxurious crime-family colors",
  },

  asylum: {
    id: "asylum",
    name: "Asylum",
    icon: "🏥",
    description: "Institutional grids, cold greens and unsettling atmosphere",
  },
};

export const defaultTheme = "goth";

export const personalitySliders = [
  ["Nice", "Mean"],
  ["Brave", "Coward"],
  ["Pacifist", "Violent"],
  ["Thoughtful", "Impulsive"],
  ["Agreeable", "Contrary"],
  ["Idealistic", "Pragmatic"],
  ["Frugal", "Big spender"],
  ["Collected", "Wild"],
  ["Honest", "Deceptive"],
  ["Polite", "Rude"],
  ["Smart", "Idiot"],
  ["Confident", "Insecure"],
  ["Calm", "Anxious"],
  ["Patient", "Impatient"],
  ["Gullible", "Skeptical"],
  ["Reserved", "Flirty"],
];

export const skillGroups = {
  Skills: [
    "Perception",
    "Communication",
    "Persuasion",
    "Mediation",
    "Literacy",
    "Creativity",
    "Cooking",
    "Tech savvy",
    "Combat",
    "Survival",
    "Stealth",
    "Street smarts",
    "Seduction",
    "Luck",
    "Handling animals",
    "Pacifying children",
    "Reflexes",
    "Strength",
    "Speed",
    "Battle IQ",
    "Resistance",
    "Flexibility",
  ],

  Socials: [
    "Charisma",
    "Empathy",
    "Generosity",
    "Wealth",
    "Aggression",
    "Libido",
  ],
};

export const emptyCharacter = {
  id: "",
  firstName: "",
  lastName: "",
  nickname: "",
  pronouns: "",
  gender: "",
  sexuality: "",
  age: "",
  dateOfBirth: "",
  nationality: "",
  origins: "",
  species: "",
  height: "",
  weight: "",
  eyeColor: "",
  hairColor: "",
  hairStyle: "",

  status: "Alive",
  laterStatus: "",
  job: "",
  sideJob: "",

  affiliation: "",
  pastAffiliation: "",
  rank: "",
  pastRank: "",

  abilities: "",
  weapon: "",
  abilityEffects: "",
  weaknesses: "",

  mbti: "",

  fears: "",
  sickness: "",
  addictions: "",

  likes: "",
  dislikes: "",

  anecdotes: "",
  lore: "",

  lyrics: "",
  songs: "",
  quotes: "",

  picture: "",
  moodboard: [],

  personality: {},
  skills: {},
  socials: {},

  family: [],
  friends: [],
  pets: [],

  organizationIds: [],
  branchIds: [],
  postIds: [],

  notes: "",
  createdAt: "",
  updatedAt: "",
};

export const emptyOrganization = {
  id: "",
  name: "",
  description: "",
  type: "",
  status: "Active",
  leader: "",
  headquarters: "",
  ideology: "",
  members: [],
  branchIds: [],
  postIds: [],
  notes: "",
};

export const emptyBranch = {
  id: "",
  organizationId: "",
  name: "",
  description: "",
  location: "",
  leader: "",
  members: [],
};

export const emptyInvestigation = {
  id: "",
  title: "",
  status: "Open",
  date: "",
  location: "",
  summary: "",
  what: "",
  who: "",
  how: "",
  why: "",
  when: "",
  where: "",
  suspects: [],
  victims: [],
  witnesses: [],
  involvedCharacters: [],
  organizations: [],
  evidence: "",
  clues: "",
  timeline: "",
  theories: "",
  conclusion: "",
  notes: "",
};

export const emptyPost = {
  id: "",
  title: "",
  content: "",
  authorId: "",
  organizationId: "",
  branchId: "",
  date: "",
  tags: [],
};
