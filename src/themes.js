export const THEMES = [
  {
    id: "goth",
    name: "Goth",
    icon: "🖤",
    description: "Dark purple gothic aesthetic",
    colors: {
      accent: "#a855f7",
      accent2: "#d946ef",
      background: "#08060d"
    }
  },
  {
    id: "circus",
    name: "Circus",
    icon: "🎪",
    description: "Dark circus with red and gold",
    colors: {
      accent: "#ef4444",
      accent2: "#f59e0b",
      background: "#100707"
    }
  },
  {
    id: "forest",
    name: "Forest",
    icon: "🌲",
    description: "Mystical green forest",
    colors: {
      accent: "#22c55e",
      accent2: "#84cc16",
      background: "#06100a"
    }
  },
  {
    id: "detective",
    name: "Detective",
    icon: "🕵️",
    description: "Old paper, archives and mysteries",
    colors: {
      accent: "#c08457",
      accent2: "#eab676",
      background: "#100c08"
    }
  },
  {
    id: "mafia",
    name: "Mafia",
    icon: "♠️",
    description: "Elegant criminal underworld",
    colors: {
      accent: "#dc2626",
      accent2: "#737373",
      background: "#080808"
    }
  },
  {
    id: "asylum",
    name: "Asylum",
    icon: "🏥",
    description: "Cold institutional atmosphere",
    colors: {
      accent: "#38bdf8",
      accent2: "#4ade80",
      background: "#071014"
    }
  }
];

export const DEFAULT_THEME = "goth";

export function getTheme(id) {
  return THEMES.find((theme) => theme.id === id) || THEMES[0];
}

export function applyTheme(id) {
  const theme = getTheme(id);

  document.documentElement.dataset.theme = theme.id;

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

  return theme;
}
