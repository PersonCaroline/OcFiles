export const THEMES = [
  {
    id: "goth",
    name: "Goth",
    symbol: "◉",
    description:
      "Obsidian, velvet, circles and gothic ornament."
  },

  {
    id: "circus",
    name: "Circus",
    symbol: "◇",
    description:
      "Dark crimson circus, diagonal stripes and diamonds."
  },

  {
    id: "forest",
    name: "Forest",
    symbol: "✣",
    description:
      "Deep forest, moss, branches and organic lines."
  },

  {
    id: "detective",
    name: "Detective",
    symbol: "⌕",
    description:
      "Dark brown investigation files and evidence grids."
  },

  {
    id: "mafia",
    name: "Mafia",
    symbol: "♠",
    description:
      "Burgundy, black, gold and old crime dossiers."
  },

  {
    id: "asylum",
    name: "Asylum",
    symbol: "✚",
    description:
      "Cold institutional darkness, tiles and metal grids."
  }
];

export function getTheme() {
  try {
    return (
      localStorage.getItem("oc-theme") ||
      "goth"
    );
  } catch {
    return "goth";
  }
}

export function applyTheme(id) {
  const valid = THEMES.some(
    (theme) => theme.id === id
  );

  const theme = valid ? id : "goth";

  document.documentElement.dataset.theme =
    theme;

  try {
    localStorage.setItem(
      "oc-theme",
      theme
    );
  } catch {
    // Storage can be disabled by the browser.
  }
}
