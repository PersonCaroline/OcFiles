export const themes = {
  goth: {
    name: "Goth",
    icon: "🖤",
    description: "Black, purple, circles and supernatural atmosphere.",
    variables: {
      "--bg": "#08070c",
      "--bg2": "#110d18",
      "--panel": "#15101d",
      "--panel2": "#1d1427",
      "--text": "#f3edf7",
      "--muted": "#aaa0b4",
      "--accent": "#9b4dff",
      "--accent2": "#d78cff",
      "--danger": "#d34f76",
      "--success": "#73d6a2",
      "--grid": "rgba(166, 79, 255, .08)",
      "--pattern": "radial-gradient(circle at 20% 20%, rgba(150,70,255,.12) 0 2px, transparent 3px), radial-gradient(circle at 80% 70%, rgba(220,130,255,.08) 0 3px, transparent 4px)"
    }
  },

  circus: {
    name: "Circus",
    icon: "🎪",
    description: "Dark red, gold, diagonal stripes and diamonds.",
    variables: {
      "--bg": "#100708",
      "--bg2": "#1b0b0b",
      "--panel": "#241010",
      "--panel2": "#321414",
      "--text": "#fff3dd",
      "--muted": "#c9aa91",
      "--accent": "#d69b35",
      "--accent2": "#f1c75b",
      "--danger": "#c94a55",
      "--success": "#80c98e",
      "--grid": "rgba(220,160,50,.08)",
      "--pattern": "repeating-linear-gradient(45deg, rgba(150,25,35,.10) 0 10px, transparent 10px 20px), repeating-linear-gradient(-45deg, transparent 0 16px, rgba(220,170,60,.06) 16px 18px)"
    }
  },

  forest: {
    name: "Forest",
    icon: "🌲",
    description: "Deep green, branches, lines and nature.",
    variables: {
      "--bg": "#07100b",
      "--bg2": "#0b1810",
      "--panel": "#102219",
      "--panel2": "#163020",
      "--text": "#eaf7ed",
      "--muted": "#9bb6a2",
      "--accent": "#54c878",
      "--accent2": "#9be48b",
      "--danger": "#d26c6c",
      "--success": "#72d99c",
      "--grid": "rgba(70,210,110,.08)",
      "--pattern": "linear-gradient(120deg, transparent 0 48%, rgba(80,190,100,.06) 49% 50%, transparent 51%), linear-gradient(30deg, transparent 0 48%, rgba(80,190,100,.05) 49% 50%, transparent 51%)"
    }
  },

  detective: {
    name: "Detective",
    icon: "🕵️",
    description: "Ancient paper, brown tones and investigation-board atmosphere.",
    variables: {
      "--bg": "#17130d",
      "--bg2": "#211b12",
      "--panel": "#2b2418",
      "--panel2": "#382d1d",
      "--text": "#f3e5c8",
      "--muted": "#bda982",
      "--accent": "#c8954a",
      "--accent2": "#e0bd78",
      "--danger": "#bd6257",
      "--success": "#86a96e",
      "--grid": "rgba(220,180,100,.08)",
      "--pattern": "linear-gradient(rgba(200,170,110,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(200,170,110,.07) 1px, transparent 1px)"
    }
  },

  mafia: {
    name: "Mafia",
    icon: "♠️",
    description: "Black, burgundy, gold and dangerous stripes.",
    variables: {
      "--bg": "#090708",
      "--bg2": "#140a0d",
      "--panel": "#1b1013",
      "--panel2": "#281419",
      "--text": "#f6ecec",
      "--muted": "#bba4a7",
      "--accent": "#b73b4d",
      "--accent2": "#d8a94e",
      "--danger": "#e15262",
      "--success": "#77bd91",
      "--grid": "rgba(190,60,75,.08)",
      "--pattern": "repeating-linear-gradient(45deg, rgba(160,40,55,.10) 0 8px, transparent 8px 18px)"
    }
  },

  asylum: {
    name: "Asylum",
    icon: "🏥",
    description: "Institutional grid, faded green-blue and unsettling atmosphere.",
    variables: {
      "--bg": "#091112",
      "--bg2": "#0d1819",
      "--panel": "#132123",
      "--panel2": "#1a2d2f",
      "--text": "#e6f1ef",
      "--muted": "#9bb5b5",
      "--accent": "#64b6aa",
      "--accent2": "#8bd4cb",
      "--danger": "#c46b75",
      "--success": "#72c89c",
      "--grid": "rgba(100,190,180,.08)",
      "--pattern": "linear-gradient(rgba(100,190,180,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(100,190,180,.07) 1px, transparent 1px)"
    }
  }
};

export function applyTheme(themeId) {
  const theme = themes[themeId] || themes.goth;

  Object.entries(theme.variables).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });

  document.documentElement.dataset.theme = themeId;
}
