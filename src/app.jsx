import { useEffect, useState } from "react";
import { THEMES, applyTheme, getTheme } from "./themes";

const themeDescriptions = {
  goth: "Obsidienne, rouge sombre et or.",
  circus: "Velours bordeaux, or et chapiteau.",
  forest: "Forêt nocturne et lueurs végétales.",
  detective: "Archives anciennes, papier et mystère.",
  mafia: "Élégance noire, or et rouge vin.",
  asylum: "Ambiance clinique froide et quadrillée.",
};

const personality = [
  ["Nice", "Mean", 3],
  ["Brave", "Coward", 4],
  ["Pacifist", "Violent", 2],
  ["Thoughtful", "Impulsive", 3],
];

function PipRow({ label, value }) {
  return (
    <div className="stat-row">
      <span>{label}</span>

      <div className="pips">
        {[1, 2, 3, 4, 5].map((pip) => (
          <button
            key={pip}
            type="button"
            className={pip <= value ? "pip-filled" : "pip-empty"}
            aria-label={`${label} ${pip}/5`}
          />
        ))}
      </div>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState(getTheme);
  const [rangeValue, setRangeValue] = useState(3);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const currentTheme =
    THEMES.find((item) => item.id === theme) || THEMES[0];

  return (
    <div className="site-shell">

      {/* ================= HEADER ================= */}

      <header className="topbar glow-card">
        <div>
          <p className="eyebrow">OC ARCHIVE</p>

          <h1>Character Archive</h1>
        </div>

        <label className="theme-picker">
          <span>Theme</span>

          <select
            value={theme}
            onChange={(event) => setTheme(event.target.value)}
          >
            {THEMES.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.name}
              </option>
            ))}
          </select>
        </label>
      </header>

      {/* ================= MAIN ================= */}

      <main>

        {/* HERO */}

        <section className="hero glow-card">
          <div className="hero-content">

            <p className="eyebrow">
              PERSONAL OC DATABASE
            </p>

            <h2>
              Build your characters.
            </h2>

            <p className="hero-text">
              Une base pour organiser tes personnages,
              leurs histoires, leurs relations,
              leurs organisations et tout leur univers.
            </p>

            <div className="hero-actions">

              <button
                type="button"
                className="button button-primary"
              >
                Create character
              </button>

              <button
                type="button"
                className="button button-secondary"
              >
                Browse archive
              </button>

            </div>

          </div>
        </section>

        {/* ================= DIVIDER ================= */}

        <div className="ornate-divider">
          <span>Current theme</span>
        </div>

        {/* ================= PREVIEWS ================= */}

        <section className="theme-preview">

          {/* THEME CARD */}

          <article className="glow-card preview-card">

            <p className="eyebrow">
              THEME
            </p>

            <h3>
              {currentTheme.name}
            </h3>

            <p>
              {themeDescriptions[theme]}
            </p>

            <div className="preview-line" />

            <div className="badge-row">

              <span className="badge-alive">
                ALIVE
              </span>

              <span className="badge-dead">
                DEAD
              </span>

            </div>

          </article>

          {/* PERSONALITY CARD */}

          <article className="glow-card preview-card">

            <p className="eyebrow">
              PERSONALITY
            </p>

            {personality.map(
              ([left, right, value]) => (
                <PipRow
                  key={`${left}-${right}`}
                  label={`${left} — ${right}`}
                  value={value}
                />
              )
            )}

          </article>

          {/* RANGE CARD */}

          <article className="glow-card preview-card">

            <p className="eyebrow">
              RANGE
            </p>

            <h3>
              Character stat
            </h3>

            <p className="muted">
              Themed glowing slider.
            </p>

            <input
              className="oc-range"
              type="range"
              min="1"
              max="5"
              value={rangeValue}
              onChange={(event) =>
                setRangeValue(
                  Number(event.target.value)
                )
              }
            />

            <div className="range-labels">

              <span>
                Low
              </span>

              <strong>
                {rangeValue}/5
              </strong>

              <span>
                High
              </span>

            </div>

          </article>

        </section>

      </main>

      {/* ================= FOOTER ================= */}

      <footer>
        <span>
          OC Archive
        </span>

        <span>
          Step 1 · Theme foundation
        </span>
      </footer>

    </div>
  );
}

export default App;
