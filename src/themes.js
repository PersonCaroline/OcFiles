export const THEMES = {
  goth: {
    id: "goth",
    name: "Goth",
    icon: "🖤",
    description: "Black, purple, circles, velvet and supernatural glow.",
    colors: {
      bg: "#09070d",
      bg2: "#120d19",
      card: "#15101d",
      card2: "#1d1428",
      text: "#eee8f5",
      muted: "#a99bb7",
      accent: "#9b5cff",
      accent2: "#d39cff",
      border: "#4b2b68",
      danger: "#d95072",
      success: "#62d99a",
      warning: "#d9ad62"
    }
  },

  circus: {
    id: "circus",
    name: "Circus",
    icon: "🎪",
    description: "Dark red, gold, diamonds and theatrical stripes.",
    colors: {
      bg: "#100707",
      bg2: "#1b0b0b",
      card: "#211010",
      card2: "#2b1414",
      text: "#fff1d4",
      muted: "#c4a98c",
      accent: "#d19a37",
      accent2: "#efc86e",
      border: "#704522",
      danger: "#c63f4e",
      success: "#70b77b",
      warning: "#e1a93e"
    }
  },

  forest: {
    id: "forest",
    name: "Forest",
    icon: "🌲",
    description: "Dark woodland atmosphere with organic green lines.",
    colors: {
      bg: "#07100a",
      bg2: "#0b1810",
      card: "#101e14",
      card2: "#16271b",
      text: "#e7f2e7",
      muted: "#9fb49f",
      accent: "#55b56a",
      accent2: "#91d99b",
      border: "#285a35",
      danger: "#c85b63",
      success: "#68d58a",
      warning: "#cfa94f"
    }
  },

  detective: {
    id: "detective",
    name: "Detective",
    icon: "🕵️",
    description: "Brown paper, grids, case files and investigation boards.",
    colors: {
      bg: "#17120d",
      bg2: "#211910",
      card: "#2a2117",
      card2: "#33281c",
      text: "#f1e5cf",
      muted: "#b9a78d",
      accent: "#c08a43",
      accent2: "#e1b86d",
      border: "#695038",
      danger: "#b9534e",
      success: "#709b62",
      warning: "#d4a94f"
    }
  },

  mafia: {
    id: "mafia",
    name: "Mafia",
    icon: "♠️",
    description: "Black, wine red, gold and elegant pinstripes.",
    colors: {
      bg: "#080708",
      bg2: "#130c0e",
      card: "#171012",
      card2: "#211418",
      text: "#f1e7e4",
      muted: "#b9a8a5",
      accent: "#b52c48",
      accent2: "#d4a44c",
      border: "#602433",
      danger: "#e14e5c",
      success: "#6ab47a",
      warning: "#d5a348"
    }
  },

  asylum: {
    id: "asylum",
    name: "Asylum",
    icon: "🏥",
    description: "Institutional grids, faded teal and unsettling clinical colors.",
    colors: {
      bg: "#081012",
      bg2: "#0e181b",
      card: "#132124",
      card2: "#192a2d",
      text: "#e2f1ef",
      muted: "#9ab5b3",
      accent: "#54aeb0",
      accent2: "#83d0c8",
      border: "#315f62",
      danger: "#c95b63",
      success: "#68b99a",
      warning: "#c5ae61"
    }
  }
};

export const DEFAULT_THEME = "goth";

export function applyTheme(themeId) {
  const theme = THEMES[themeId] || THEMES[DEFAULT_THEME];

  Object.entries(theme.colors).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--${key}`, value);
  });

  document.documentElement.dataset.theme = theme.id;

  return theme;
}
