export const THEMES = [
  { id: "goth", name: "Goth" },
  { id: "circus", name: "Circus" },
  { id: "forest", name: "Forest" },
  { id: "detective", name: "Detective" },
  { id: "mafia", name: "Mafia" },
  { id: "asylum", name: "Asylum" },
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
    // localStorage unavailable
  }
}
