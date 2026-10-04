export const THEMES = [
  {
    id: "goth",
    name: "Goth",
    symbol: "◉",
    description: "Dark romantic gothic archive",
  },
  {
    id: "circus",
    name: "Circus",
    symbol: "◇",
    description: "Dark carnival with diamonds and stripes",
  },
  {
    id: "forest",
    name: "Forest",
    symbol: "✣",
    description: "Mysterious woodland atmosphere",
  },
  {
    id: "detective",
    name: "Detective",
    symbol: "⌕",
    description: "Dark vintage investigation office",
  },
  {
    id: "mafia",
    name: "Mafia",
    symbol: "♠",
    description: "Burgundy, black and gold",
  },
  {
    id: "asylum",
    name: "Asylum",
    symbol: "✚",
    description: "Dark institutional atmosphere",
  },
];

export function getTheme() {
  try {
    return localStorage.getItem("oc-theme") || "goth";
  } catch {
    return "goth";
  }
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;

  try {
    localStorage.setItem("oc-theme", theme);
  } catch {
    // Ignore storage errors.
  }
}
