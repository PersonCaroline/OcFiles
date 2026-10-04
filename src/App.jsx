import { useEffect, useMemo, useState } from "react";
import { THEMES, applyTheme, getTheme } from "./themes";

const themeDescriptions = {
  goth: "Obsidienne, rouge sombre et or.",
  circus: "Velours bordeaux, or et chapiteau.",
  forest: "Forêt nocturne et lueurs végétales.",
  detective: "Archives anciennes, papier et mystère.",
  mafia: "Élégance noire, or et rouge vin.",
  asylum: "Ambiance clinique froide et quadrillée.",
};

const starterCharacters = [
  {
    id: 1,
    name: "New Character",
    nickname: "Untitled",
    status: "alive",
    affiliation: "Unassigned",
  },
];

function App() {
  const [theme, setTheme] = useState(getTheme);
  const [activeTab, setActiveTab] = useState("characters");
  const [characters, setCharacters] = useState(() => {
    try {
      const saved = localStorage.getItem("oc-characters");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [search, setSearch] = useState("");

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem("oc-characters", JSON.stringify(characters));
    } catch {
      /* ignore */
    }
  }, [characters]);

  const currentTheme =
    THEMES.find((item) => item.id === theme) || THEMES[0];

  const filteredCharacters = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return characters;

    return characters.filter((character) =>
      [
        character.name,
        character.nickname,
        character.affiliation,
        character.status,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [characters, search]);

  function createCharacter() {
    const newCharacter = {
      id: Date.now(),
      name: "Unnamed Character",
      nickname: "",
      status: "alive",
      affiliation: "Unassigned",
    };

    setCharacters((current) => [...current, newCharacter]);
  }

  function deleteCharacter(id) {
    setCharacters((current) =>
      current.filter((character) => character.id !== id)
    );
  }

  return (
    <div className="site-shell">
      <header className="topbar glow-card">
        <div>
          <p className="eyebrow">OC ARCHIVE</p>
          <h1>Character Archive</h1>
          <p className="muted">
            Personal database for your characters, lore and universe.
          </p>
        </div>

        <label className="theme-picker">
          <span>Theme</span>

          <select
            value={theme}
            onChange={(event) => setTheme(event.target.value)}
          >
            {THEMES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      </header>

      <nav className="archive-nav glow-card">
        <button
          type="button"
          className={activeTab === "characters" ? "nav-active" : ""}
          onClick={() => setActiveTab("characters")}
        >
          Characters
        </button>

        <button
          type="button"
          className={activeTab === "organizations" ? "nav-active" : ""}
          onClick={() => setActiveTab("organizations")}
        >
          Organizations
        </button>

        <button
          type="button"
          className={activeTab === "lore" ? "nav-active" : ""}
          onClick={() => setActiveTab("lore")}
        >
          Lore
        </button>
      </nav>

      <main>
        {activeTab === "characters" && (
          <>
            <section className="archive-header">
              <div>
                <p className="eyebrow">CHARACTER DATABASE</p>
                <h2>Your Characters</h2>
                <p className="muted">
                  Create, organize and develop your original characters.
                </p>
              </div>

              <button
                type="button"
                className="button button-primary"
                onClick={createCharacter}
              >
                + Create Character
              </button>
            </section>

            <section className="archive-tools glow-card">
              <div className="search-box">
                <span>⌕</span>

                <input
                  type="search"
                  placeholder="Search characters..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <span className="archive-count">
                {characters.length}{" "}
                {characters.length === 1 ? "character" : "characters"}
              </span>
            </section>

            {filteredCharacters.length === 0 ? (
              <section className="empty-state glow-card">
                <div className="empty-symbol">✦</div>

                <p className="eyebrow">THE ARCHIVE IS EMPTY</p>

                <h3>No characters yet</h3>

                <p>
                  Create your first character and start building their story.
                </p>

                <button
                  type="button"
                  className="button button-primary"
                  onClick={createCharacter}
                >
                  + Create your first character
                </button>
              </section>
            ) : (
              <section className="character-grid">
                {filteredCharacters.map((character) => (
                  <article
                    className="glow-card character-card"
                    key={character.id}
                  >
                    <div className="character-image">
                      <span>✦</span>
                    </div>

                    <div className="character-card-content">
                      <div className="character-card-top">
                        <span
                          className={
                            character.status === "dead"
                              ? "badge-dead"
                              : "badge-alive"
                          }
                        >
                          {character.status.toUpperCase()}
                        </span>
                      </div>

                      <p className="eyebrow">CHARACTER</p>

                      <h3>{character.name}</h3>

                      {character.nickname && (
                        <p className="nickname">
                          “{character.nickname}”
                        </p>
                      )}

                      <p className="muted">
                        {character.affiliation || "Unassigned"}
                      </p>

                      <div className="character-card-actions">
                        <button
                          type="button"
                          className="button button-secondary"
                        >
                          Open
                        </button>

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => deleteCharacter(character.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </section>
            )}
          </>
        )}

        {activeTab === "organizations" && (
          <section className="empty-state glow-card">
            <div className="empty-symbol">♜</div>

            <p className="eyebrow">ORGANIZATIONS</p>

            <h2>Organizations</h2>

            <p>
              Branches, members, ranks and affiliations will live here.
            </p>

            <span className="coming-soon">COMING NEXT</span>
          </section>
        )}

        {activeTab === "lore" && (
          <section className="empty-state glow-card">
            <div className="empty-symbol">✧</div>

            <p className="eyebrow">WORLD & LORE</p>

            <h2>Lore Archive</h2>

            <p>
              Your worldbuilding, events, locations and important notes will
              live here.
            </p>

            <span className="coming-soon">COMING NEXT</span>
          </section>
        )}

        <div className="ornate-divider">
          <span>Current theme</span>
        </div>

        <section className="theme-summary glow-card">
          <div>
            <p className="eyebrow">ACTIVE AESTHETIC</p>
            <h3>{currentTheme.name}</h3>
            <p>{themeDescriptions[theme]}</p>
          </div>

          <div className="theme-mark">✦</div>
        </section>
      </main>

      <footer>
        <span>OC Archive</span>
        <span>Personal Character Database</span>
      </footer>
    </div>
  );
}

export default App;
