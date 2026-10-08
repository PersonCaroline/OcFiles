export const THEMES = [
  {
    id: "goth",
    name: "Goth",
    icon: "🖤",
    description:
      "Dark gothic architecture, purple neon, circles, moons and occult-inspired details.",

    colors: {
      accent: "#a855f7",
      accent2: "#e879f9",
      background: "#06040a",
      surface: "#0d0913",
      surface2: "#130d1b",
      text: "#f5efff",
      muted: "#a99bb8",
      border: "rgba(168,85,247,.22)",
    },

    effects: {
      pattern: "circles",
      glow: "purple",
      atmosphere: "dark",
      texture: "goth",
    },
  },

  {
    id: "circus",
    name: "Circus",
    icon: "🎪",
    description:
      "A sinister carnival atmosphere with crimson velvet, gold details, diamonds and striped cards.",

    colors: {
      accent: "#dc2626",
      accent2: "#f59e0b",
      background: "#0b0505",
      surface: "#160909",
      surface2: "#21100c",
      text: "#fff5e7",
      muted: "#c9a98b",
      border: "rgba(220,38,38,.28)",
    },

    effects: {
      pattern: "diamonds",
      glow: "red",
      atmosphere: "carnival",
      texture: "stripes",
    },
  },

  {
    id: "forest",
    name: "Forest",
    icon: "🌲",
    description:
      "An enchanted forest aesthetic with deep greens, organic lines, mist and natural textures.",

    colors: {
      accent: "#4ade80",
      accent2: "#22c55e",
      background: "#030806",
      surface: "#07110b",
      surface2: "#0b1810",
      text: "#edf8ef",
      muted: "#91aa98",
      border: "rgba(74,222,128,.20)",
    },

    effects: {
      pattern: "branches",
      glow: "green",
      atmosphere: "mist",
      texture: "nature",
    },
  },

  {
    id: "detective",
    name: "Detective",
    icon: "🕵️",
    description:
      "Old investigation files, brown paper, evidence grids, typewriter tones and noir lighting.",

    colors: {
      accent: "#c08457",
      accent2: "#eab676",
      background: "#100c08",
      surface: "#19120c",
      surface2: "#24190f",
      text: "#f3e5cf",
      muted: "#aa967a",
      border: "rgba(192,132,87,.27)",
    },

    effects: {
      pattern: "grid",
      glow: "amber",
      atmosphere: "noir",
      texture: "paper",
    },
  },

  {
    id: "mafia",
    name: "Mafia",
    icon: "♠️",
    description:
      "Elegant criminal-underworld styling with black suits, burgundy, gold, pinstripes and card suits.",

    colors: {
      accent: "#b91c3c",
      accent2: "#d4af37",
      background: "#050505",
      surface: "#0d0d0e",
      surface2: "#151012",
      text: "#f5f0e8",
      muted: "#a79d91",
      border: "rgba(185,28,60,.25)",
    },

    effects: {
      pattern: "pinstripe",
      glow: "burgundy",
      atmosphere: "luxury",
      texture: "suit",
    },
  },

  {
    id: "asylum",
    name: "Asylum",
    icon: "🏥",
    description:
      "Cold institutional corridors, fluorescent lighting, clinical grids and unsettling green-blue tones.",

    colors: {
      accent: "#55d6be",
      accent2: "#72a7ff",
      background: "#05090a",
      surface: "#091113",
      surface2: "#0e181a",
      text: "#e7f5f2",
      muted: "#8ca6a4",
      border: "rgba(85,214,190,.21)",
    },

    effects: {
      pattern: "institution",
      glow: "cyan",
      atmosphere: "clinical",
      texture: "concrete",
    },
  },
];

export const DEFAULT_THEME = "goth";

export function getTheme(themeId) {
  return (
    THEMES.find((theme) => theme.id === themeId) ||
    THEMES.find((theme) => theme.id === DEFAULT_THEME)
  );
}

export function applyTheme(themeId) {
  const theme = getTheme(themeId);

  const root = document.documentElement;
  const body = document.body;

  const themeClasses = [
    "theme-goth",
    "theme-circus",
    "theme-forest",
    "theme-detective",
    "theme-mafia",
    "theme-asylum",
  ];

  body.classList.remove(...themeClasses);
  body.classList.add(`theme-${theme.id}`);

  root.dataset.theme = theme.id;

  root.style.setProperty("--accent", theme.colors.accent);
  root.style.setProperty("--accent-2", theme.colors.accent2);
  root.style.setProperty("--bg", theme.colors.background);
  root.style.setProperty("--surface", theme.colors.surface);
  root.style.setProperty("--surface-2", theme.colors.surface2);
  root.style.setProperty("--text", theme.colors.text);
  root.style.setProperty("--text-muted", theme.colors.muted);
  root.style.setProperty("--border", theme.colors.border);

  root.style.setProperty(
    "--theme-pattern",
    theme.effects.pattern
  );

  root.style.setProperty(
    "--theme-atmosphere",
    theme.effects.atmosphere
  );

  root.style.setProperty(
    "--theme-texture",
    theme.effects.texture
  );

  return theme;
}

export default THEMES;
