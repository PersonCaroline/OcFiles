import { useEffect, useState } from "react";
import { THEMES, applyTheme, getTheme } from "./themes";

const emptyCharacter = {
  name: "",
  lastName: "",
  nickname: "",
  age: "",
  status: "alive",
  laterStatus: "",
  nationality: "",
  origins: "",
  affiliation: "",
  pastAffiliation: "",
  rank: "",
  pastRank: "",
  pronouns: "",
  dateOfBirth: "",
  sexuality: "",
  gender: "",
  job: "",
  sideJob: "",
  height: "",
  weight: "",
  species: "",
  eyeColor: "",
  hairColor: "",
  hairStyle: "",
  ability: "",
  abilityDescription: "",
  sideEffects: "",
  weapon: "",
  mbti: "",
};

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
  const [showCreator, setShowCreator] = useState(false);
  const [character, setCharacter] = useState(emptyCharacter);

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

  function updateCharacter(field, value) {
    setCharacter((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function createCharacter() {
    if (!character.name.trim()) {
      return;
    }

    const newCharacter = {
      ...character,
      id: Date.now(),
    };

    setCharacters((current) => [...current, newCharacter]);
    setCharacter(emptyCharacter);
    setShowCreator(false);
  }

  function deleteCharacter(id) {
    setCharacters((current) =>
      current.filter((item) => item.id !== id)
    );
  }

  const filteredCharacters = characters.filter((item) => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return true;
    }

    return [
      item.name,
      item.lastName,
      item.nickname,
      item.affiliation,
      item.status,
    ]
      .filter(Boolean)
      .some((value) =>
        value.toLowerCase().includes(query)
      );
  });

  return (
    <div className="site-shell">
      <header className="topbar glow-card">
        <div>
          <p className="eyebrow">OC ARCHIVE</p>
          <h1>Character Archive</h1>
          <p className="muted">
            Your personal original character database.
          </p>
        </div>

        <label className="theme-picker">
          <span>Theme</span>

          <select
            value={theme}
            onChange={(event) =>
              setTheme(event.target.value)
            }
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
          className={
            activeTab === "characters"
              ? "nav-active"
              : ""
          }
          onClick={() => setActiveTab("characters")}
        >
          Characters
        </button>

        <button
          type="button"
          className={
            activeTab === "organizations"
              ? "nav-active"
              : ""
          }
          onClick={() =>
            setActiveTab("organizations")
          }
        >
          Organizations
        </button>

        <button
          type="button"
          className={
            activeTab === "lore"
              ? "nav-active"
              : ""
          }
          onClick={() => setActiveTab("lore")}
        >
          Lore
        </button>
      </nav>

      {activeTab === "characters" && (
        <main>
          {!showCreator ? (
            <>
              <section className="archive-header">
                <div>
                  <p className="eyebrow">
                    CHARACTER DATABASE
                  </p>
                  <h2>Your Characters</h2>
                  <p className="muted">
                    Create and organize your original
                    characters.
                  </p>
                </div>

                <button
                  type="button"
                  className="button button-primary"
                  onClick={() =>
                    setShowCreator(true)
                  }
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
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                  />
                </div>

                <span className="archive-count">
                  {characters.length}{" "}
                  {characters.length === 1
                    ? "character"
                    : "characters"}
                </span>
              </section>

              {filteredCharacters.length === 0 ? (
                <section className="empty-state glow-card">
                  <div className="empty-symbol">
                    ✦
                  </div>

                  <p className="eyebrow">
                    THE ARCHIVE IS EMPTY
                  </p>

                  <h3>No characters yet</h3>

                  <p>
                    Create your first character and
                    start building their story.
                  </p>

                  <button
                    type="button"
                    className="button button-primary"
                    onClick={() =>
                      setShowCreator(true)
                    }
                  >
                    + Create your first character
                  </button>
                </section>
              ) : (
                <section className="character-grid">
                  {filteredCharacters.map((item) => (
                    <article
                      className="glow-card character-card"
                      key={item.id}
                    >
                      <div className="character-image">
                        <span>✦</span>
                      </div>

                      <div className="character-card-content">
                        <div className="character-card-top">
                          <span
                            className={
                              item.status === "dead"
                                ? "badge-dead"
                                : "badge-alive"
                            }
                          >
                            {item.status.toUpperCase()}
                          </span>
                        </div>

                        <p className="eyebrow">
                          CHARACTER
                        </p>

                        <h3>
                          {item.name}{" "}
                          {item.lastName}
                        </h3>

                        {item.nickname && (
                          <p className="nickname">
                            “{item.nickname}”
                          </p>
                        )}

                        <p className="muted">
                          {item.affiliation ||
                            "Unassigned"}
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
                            onClick={() =>
                              deleteCharacter(item.id)
                            }
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
          ) : (
            <section>
              <div className="archive-header">
                <div>
                  <p className="eyebrow">
                    CHARACTER CREATOR
                  </p>
                  <h2>New Character</h2>
                  <p className="muted">
                    Start with the character's basic
                    information.
                  </p>
                </div>

                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() =>
                    setShowCreator(false)
                  }
                >
                  Cancel
                </button>
              </div>

              <form
                className="character-form glow-card"
                onSubmit={(event) => {
                  event.preventDefault();
                  createCharacter();
                }}
              >
                <div className="form-section">
                  <div className="form-section-title">
                    <p className="eyebrow">
                      IDENTITY
                    </p>
                    <h3>Basic Information</h3>
                  </div>

                  <div className="form-grid">
                    <label>
                      First name *
                      <input
                        value={character.name}
                        onChange={(event) =>
                          updateCharacter(
                            "name",
                            event.target.value
                          )
                        }
                        placeholder="Character name"
                        required
                      />
                    </label>

                    <label>
                      Last name
                      <input
                        value={character.lastName}
                        onChange={(event) =>
                          updateCharacter(
                            "lastName",
                            event.target.value
                          )
                        }
                        placeholder="Last name"
                      />
                    </label>

                    <label>
                      Nickname(s)
                      <input
                        value={character.nickname}
                        onChange={(event) =>
                          updateCharacter(
                            "nickname",
                            event.target.value
                          )
                        }
                        placeholder="Nickname"
                      />
                    </label>

                    <label>
                      Age
                      <input
                        type="number"
                        min="0"
                        value={character.age}
                        onChange={(event) =>
                          updateCharacter(
                            "age",
                            event.target.value
                          )
                        }
                        placeholder="Age"
                      />
                    </label>

                    <label>
                      Status
                      <select
                        value={character.status}
                        onChange={(event) =>
                          updateCharacter(
                            "status",
                            event.target.value
                          )
                        }
                      >
                        <option value="alive">
                          Alive
                        </option>
                        <option value="dead">
                          Dead
                        </option>
                      </select>
                    </label>

                    <label>
                      Later status
                      <input
                        value={character.laterStatus}
                        onChange={(event) =>
                          updateCharacter(
                            "laterStatus",
                            event.target.value
                          )
                        }
                        placeholder="Future status"
                      />
                    </label>

                    <label>
                      Pronouns
                      <input
                        value={character.pronouns}
                        onChange={(event) =>
                          updateCharacter(
                            "pronouns",
                            event.target.value
                          )
                        }
                        placeholder="e.g. she/her"
                      />
                    </label>

                    <label>
                      Gender
                      <input
                        value={character.gender}
                        onChange={(event) =>
                          updateCharacter(
                            "gender",
                            event.target.value
                          )
                        }
                        placeholder="Gender"
                      />
                    </label>

                    <label>
                      Sexuality
                      <input
                        value={character.sexuality}
                        onChange={(event) =>
                          updateCharacter(
                            "sexuality",
                            event.target.value
                          )
                        }
                        placeholder="Sexuality"
                      />
                    </label>

                    <label>
                      Date of birth
                      <input
                        value={character.dateOfBirth}
                        onChange={(event) =>
                          updateCharacter(
                            "dateOfBirth",
                            event.target.value
                          )
                        }
                        placeholder="DD / MM / YYYY"
                      />
                    </label>

                    <label>
                      Nationality
                      <input
                        value={character.nationality}
                        onChange={(event) =>
                          updateCharacter(
                            "nationality",
                            event.target.value
                          )
                        }
                        placeholder="Nationality"
                      />
                    </label>

                    <label>
                      Origins
                      <input
                        value={character.origins}
                        onChange={(event) =>
                          updateCharacter(
                            "origins",
                            event.target.value
                          )
                        }
                        placeholder="Origins"
                      />
                    </label>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">
                    <p className="eyebrow">
                      AFFILIATIONS
                    </p>
                    <h3>Occupation & Rank</h3>
                  </div>

                  <div className="form-grid">
                    <label>
                      Affiliation
                      <input
                        value={character.affiliation}
                        onChange={(event) =>
                          updateCharacter(
                            "affiliation",
                            event.target.value
                          )
                        }
                        placeholder="Current organization"
                      />
                    </label>

                    <label>
                      Past affiliation
                      <input
                        value={character.pastAffiliation}
                        onChange={(event) =>
                          updateCharacter(
                            "pastAffiliation",
                            event.target.value
                          )
                        }
                        placeholder="Previous organization"
                      />
                    </label>

                    <label>
                      Rank
                      <input
                        value={character.rank}
                        onChange={(event) =>
                          updateCharacter(
                            "rank",
                            event.target.value
                          )
                        }
                        placeholder="Current rank"
                      />
                    </label>

                    <label>
                      Past rank
                      <input
                        value={character.pastRank}
                        onChange={(event) =>
                          updateCharacter(
                            "pastRank",
                            event.target.value
                          )
                        }
                        placeholder="Previous rank"
                      />
                    </label>

                    <label>
                      Job
                      <input
                        value={character.job}
                        onChange={(event) =>
                          updateCharacter(
                            "job",
                            event.target.value
                          )
                        }
                        placeholder="Main occupation"
                      />
                    </label>

                    <label>
                      Side job
                      <input
                        value={character.sideJob}
                        onChange={(event) =>
                          updateCharacter(
                            "sideJob",
                            event.target.value
                          )
                        }
                        placeholder="Secondary occupation"
                      />
                    </label>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">
                    <p className="eyebrow">
                      APPEARANCE
                    </p>
                    <h3>Physical Information</h3>
                  </div>

                  <div className="form-grid">
                    <label>
                      Height
                      <input
                        value={character.height}
                        onChange={(event) =>
                          updateCharacter(
                            "height",
                            event.target.value
                          )
                        }
                        placeholder="e.g. 175 cm"
                      />
                    </label>

                    <label>
                      Weight
                      <input
                        value={character.weight}
                        onChange={(event) =>
                          updateCharacter(
                            "weight",
                            event.target.value
                          )
                        }
                        placeholder="e.g. 65 kg"
                      />
                    </label>

                    <label>
                      Species / Race
                      <input
                        value={character.species}
                        onChange={(event) =>
                          updateCharacter(
                            "species",
                            event.target.value
                          )
                        }
                        placeholder="Species"
                      />
                    </label>

                    <label>
                      Eye color
                      <input
                        value={character.eyeColor}
                        onChange={(event) =>
                          updateCharacter(
                            "eyeColor",
                            event.target.value
                          )
                        }
                        placeholder="Eye color"
                      />
                    </label>

                    <label>
                      Hair color
                      <input
                        value={character.hairColor}
                        onChange={(event) =>
                          updateCharacter(
                            "hairColor",
                            event.target.value
                          )
                        }
                        placeholder="Hair color"
                      />
                    </label>

                    <label>
                      Hair style
                      <input
                        value={character.hairStyle}
                        onChange={(event) =>
                          updateCharacter(
                            "hairStyle",
                            event.target.value
                          )
                        }
                        placeholder="Hair style"
                      />
                    </label>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">
                    <p className="eyebrow">
                      ABILITY
                    </p>
                    <h3>Power & Equipment</h3>
                  </div>

                  <div className="form-grid">
                    <label>
                      Ability
                      <input
                        value={character.ability}
                        onChange={(event) =>
                          updateCharacter(
                            "ability",
                            event.target.value
                          )
                        }
                        placeholder="Ability name"
                      />
                    </label>

                    <label>
                      Weapon
                      <input
                        value={character.weapon}
                        onChange={(event) =>
                          updateCharacter(
                            "weapon",
                            event.target.value
                          )
                        }
                        placeholder="Weapon"
                      />
                    </label>

                    <label>
                      MBTI
                      <input
                        value={character.mbti}
                        onChange={(event) =>
                          updateCharacter(
                            "mbti",
                            event.target.value
                          )
                        }
                        placeholder="e.g. INFP"
                      />
                    </label>
                  </div>

                  <div className="form-grid form-grid-wide">
                    <label>
                      Ability description
                      <textarea
                        value={
                          character.abilityDescription
                        }
                        onChange={(event) =>
                          updateCharacter(
                            "abilityDescription",
                            event.target.value
                          )
                        }
                        placeholder="Describe the ability..."
                      />
                    </label>

                    <label>
                      Side effects & risks
                      <textarea
                        value={character.sideEffects}
                        onChange={(event) =>
                          updateCharacter(
                            "sideEffects",
                            event.target.value
                          )
                        }
                        placeholder="Side effects, limitations and risks..."
                      />
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() =>
                      setShowCreator(false)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="button button-primary"
                  >
                    Create Character
                  </button>
                </div>
              </form>
            </section>
          )}
        </main>
      )}

      {activeTab === "organizations" && (
        <main>
          <section className="empty-state glow-card">
            <div className="empty-symbol">♜</div>
            <p className="eyebrow">ORGANIZATIONS</p>
            <h2>Organizations</h2>
            <p>
              Branches, members, ranks and affiliations
              will be built here.
            </p>
            <span className="coming-soon">
              COMING NEXT
            </span>
          </section>
        </main>
      )}

      {activeTab === "lore" && (
        <main>
          <section className="empty-state glow-card">
            <div className="empty-symbol">✧</div>
            <p className="eyebrow">WORLD & LORE</p>
            <h2>Lore Archive</h2>
            <p>
              Worldbuilding, events, locations and
              important notes will be built here.
            </p>
            <span className="coming-soon">
              COMING NEXT
            </span>
          </section>
        </main>
      )}

      <footer>
        <span>OC Archive</span>
        <span>Personal Character Database</span>
      </footer>
    </div>
  );
}

export default App;
