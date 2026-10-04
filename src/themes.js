export const THEMES = [
  {
    id: "goth",
    name: "Goth",
    symbol: "☾",
  },
  {
    id: "circus",
    name: "Circus",
    symbol: "✦",
  },
  {
    id: "forest",
    name: "Forest",
    symbol: "♧",
  },
  {
    id: "detective",
    name: "Detective",
    symbol: "⌕",
  },
  {
    id: "mafia",
    name: "Mafia",
    symbol: "♠",
  },
  {
    id: "asylum",
    name: "Asylum",
    symbol: "✚",
  },
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
  const validTheme = THEMES.some(
    (theme) => theme.id === id
  )
    ? id
    : "goth";

  document.documentElement.dataset.theme =
    validTheme;

  try {
    localStorage.setItem(
      "oc-theme",
      validTheme
    );
  } catch {
    // Ignore localStorage errors.
  }
}
