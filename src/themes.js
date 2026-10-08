// =========================================================
// OcFiles — themes.jsx
// Six complete visual themes
// =========================================================

export const THEMES = [
  {
    id: "goth",
    name: "Goth",
    icon: "🖤",
    description:
      "Black, purple, circles, shadows and supernatural glow.",
    colors: {
      accent: "#a855f7",
      accent2: "#d946ef",
      background: "#07050a",
    },
  },

  {
    id: "circus",
    name: "Circus",
    icon: "🎪",
    description:
      "Dark carnival atmosphere with red, gold, stripes and diamonds.",
    colors: {
      accent: "#dc2626",
      accent2: "#eab308",
      background: "#100708",
    },
  },

  {
    id: "forest",
    name: "Forest",
    icon: "🌲",
    description:
      "Deep green atmosphere with organic lines and natural motifs.",
    colors: {
      accent: "#4ade80",
      accent2: "#84cc16",
      background: "#06100a",
    },
  },

  {
    id: "detective",
    name: "Detective",
    icon: "🕵️",
    description:
      "Old investigation files, brown paper, grids and evidence-board aesthetics.",
    colors: {
      accent: "#c59b61",
      accent2: "#8b5e34",
      background: "#17120d",
    },
  },

  {
    id: "mafia",
    name: "Mafia",
    icon: "♠️",
    description:
      "Dark pinstripes, crimson, gold and criminal-underworld atmosphere.",
    colors: {
      accent: "#b91c1c",
      accent2: "#f59e0b",
      background: "#090909",
    },
  },

  {
    id: "asylum",
    name: "Asylum",
    icon: "🏥",
    description:
      "Institutional grids, cold green-blue lighting and unsettling atmosphere.",
    colors: {
      accent: "#4ade80",
      accent2: "#38bdf8",
      background: "#071011",
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

  document.body.classList.remove(
    "theme-goth",
    "theme-circus",
    "theme-forest",
    "theme-detective",
    "theme-mafia",
    "theme-asylum"
  );

  document.body.classList.add(
    `theme-${theme.id}`
  );

  document.documentElement.style.setProperty(
    "--accent",
    theme.colors.accent
  );

  document.documentElement.style.setProperty(
    "--accent-2",
    theme.colors.accent2
  );

  document.documentElement.style.setProperty(
    "--bg",
    theme.colors.background
  );

  document.documentElement.dataset.theme =
    theme.id;

  return theme;
}

export default THEMES;
