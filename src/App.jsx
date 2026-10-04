import { useEffect, useMemo, useState } from "react";
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
  species: "",
  gender: "",
  pronouns: "",
  sexuality: "",
  dateOfBirth: "",

  affiliation: "",
  pastAffiliation: "",
  rank: "",
  pastRank: "",
  job: "",
  sideJob: "",

  height: "",
  weight: "",
  eyeColor: "",
  hairColor: "",
  hairStyle: "",

  ability: "",
  abilityDescription: "",
  sideEffects: "",
  weapon: "",
  mbti: "",

  image: "",
};

function Section({ title, children }) {
  return (
    <section className="form-section glow-card">
      <div className="section-title">
        <span>{title}</span>
      </div>

      <div className="form-grid">
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
  wide = false,
}) {
  return (
    <label className={wide ? "field field-wide" : "field"}>
      <span>{label}</span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder = "",
}) {
  return (
    <label className="field field-wide">
      <span>{label}</span>

      <textarea
        value={value}
        placeholder={placeholder}
        rows="4"
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function CharacterCreator({ onCreate, onCancel }) {
  const [character, setCharacter] = useState(emptyCharacter);

  const update = (field, value) => {
    setCharacter((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const submit = (event) => {
    event.preventDefault();

    if (!character.name.trim()) {
      alert("Please give your character a name.");
      return;
    }

    onCreate(character);
  };

  return (
    <form className="creator-page" onSubmit={submit}>
      <div className="creator-header">
        <div>
          <p className="eyebrow">NEW CHARACTER</p>
          <h1>Create an OC</h1>
          <p className="muted">
            Build your character sheet. You can complete it gradually.
          </p>
        </div>

        <button
          type="button"
          className="button secondary"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>

      <Section title="Identity">
        <Field
          label="First name"
          value={character.name}
          onChange={(value) => update("name", value)}
          placeholder="Character's first name"
        />

        <Field
          label="Last name"
          value={character.lastName}
          onChange={(value) => update("lastName", value)}
          placeholder="Character's last name"
        />

        <Field
          label="Nickname(s)"
          value={character.nickname}
          onChange={(value) => update("nickname", value)}
          placeholder="Nicknames, aliases..."
        />

        <Field
          label="Age"
          value={character.age}
          onChange={(value) => update("age", value)}
          placeholder="e.g. 27"
          type="number"
        />

        <Field
          label="Gender"
          value={character.gender}
          onChange={(value) => update("gender", value)}
          placeholder="Gender"
        />

        <Field
          label="Pronouns"
          value={character.pronouns}
          onChange={(value) => update("pronouns", value)}
          placeholder="e.g. she/her"
        />

        <Field
          label="Sexuality"
          value={character.sexuality}
          onChange={(value) => update("sexuality", value)}
          placeholder="Sexuality"
        />

        <Field
          label="Date of birth"
          value={character.dateOfBirth}
          onChange={(value) => update("dateOfBirth", value)}
          type="date"
        />

        <Field
          label="Nationality"
          value={character.nationality}
          onChange={(value) => update("nationality", value)}
          placeholder="Nationality"
        />

        <Field
          label="Origins"
          value={character.origins}
          onChange={(value) => update("origins", value)}
          placeholder="Where are they from?"
        />

        <Field
          label="Species / Race"
          value={character.species}
          onChange={(value) => update("species", value)}
          placeholder="Human, vampire, etc."
        />
      </Section>

      <Section title="Status">
        <label className="field">
          <span>Current status</span>

          <select
            value={character.status}
            onChange={(event) =>
              update("status", event.target.value)
            }
          >
            <option value="alive">Alive</option>
            <option value="dead">Dead</option>
            <option value="unknown">Unknown</option>
          </select>
        </label>

        <Field
          label="Later status"
          value={character.laterStatus}
          onChange={(value) => update("laterStatus", value)}
          placeholder="What happens later?"
        />
      </Section>

      <Section title="Occupation & Affiliations">
        <Field
          label="Job"
          value={character.job}
          onChange={(value) => update("job", value)}
          placeholder="Main occupation"
        />

        <Field
          label="Side job"
          value={character.sideJob}
          onChange={(value) => update("sideJob", value)}
          placeholder="Optional"
        />

        <Field
          label="Affiliation"
          value={character.affiliation}
          onChange={(value) => update("affiliation", value)}
          placeholder="Current organization"
        />

        <Field
          label="Past affiliation"
          value={character.pastAffiliation}
          onChange={(value) => update("pastAffiliation", value)}
          placeholder="Previous organization"
        />

        <Field
          label="Rank"
          value={character.rank}
          onChange={(value) => update("rank", value)}
          placeholder="Current rank"
        />

        <Field
          label="Past rank"
          value={character.pastRank}
          onChange={(value) => update("pastRank", value)}
          placeholder="Previous rank"
        />
      </Section>

      <Section title="Appearance">
        <Field
          label="Height"
          value={character.height}
          onChange={(value) => update("height", value)}
          placeholder="e.g. 175 cm"
        />

        <Field
          label="Weight"
          value={character.weight}
          onChange={(value) => update("weight", value)}
          placeholder="e.g. 65 kg"
        />

        <Field
          label="Eye color"
          value={character.eyeColor}
          onChange={(value) => update("eyeColor", value)}
          placeholder="Eye color"
        />

        <Field
          label="Hair color"
          value={character.hairColor}
          onChange={(value) => update("hairColor", value)}
          placeholder="Hair color"
        />

        <Field
          label="Hair style"
          value={character.hairStyle}
          onChange={(value) => update("hairStyle", value)}
          placeholder="Hair style"
        />

        <Field
          label="Character image URL"
          value={character.image}
          onChange={(value) => update("image", value)}
          placeholder="Image URL for now"
          wide
        />
      </Section>

      <Section title="Ability">
        <Field
          label="Ability"
          value={character.ability}
          onChange={(value) => update("ability", value)}
          placeholder="Ability name"
        />

        <Field
          label="Weapon"
          value={character.weapon}
          onChange={(value) => update("weapon", value)}
          placeholder="Main weapon"
        />

        <Field
          label="MBTI"
          value={character.mbti}
          onChange={(value) => update("mbti", value)}
          placeholder="e.g. INTJ"
        />

        <TextField
          label="Ability description"
          value={character.abilityDescription}
          onChange={(value) =>
            update("abilityDescription", value)
          }
          placeholder="Explain how the ability works..."
        />

        <TextField
          label="Side effects & risks"
          value={character.sideEffects}
          onChange={(value) => update("sideEffects", value)}
          placeholder="Limitations, consequences, risks..."
        />
      </Section>

      <div className="creator-actions">
        <button
          type="button"
          className="button secondary"
          onClick={onCancel}
        >
          Cancel
        </button>

        <button type="submit" className="button primary">
          Create character
        </button>
      </div>
    </form>
  );
}

function CharacterCard({ character, onDelete }) {
  return (
    <article className="character-card glow-card">
      <div className="character-image">
        {character.image ? (
          <img src={character.image} alt={character.name} />
        ) : (
          <div className="image-placeholder">
            ✦
          </div>
        )}
      </div>

      <div className="character-card-content">
        <div className="character-status">
          <span
            className={`status-dot ${
              character.status === "dead"
                ? "dead"
                : character.status === "unknown"
                  ? "unknown"
                  : "alive"
            }`}
          />

          {character.status}
        </div>

        <h2>
          {character.name}{" "}
          {character.lastName && (
            <span>{character.lastName}</span>
          )}
        </h2>

        {character.nickname && (
          <p className="nickname">
            “{character.nickname}”
          </p>
        )}

        <div className="character-meta">
          {character.age && (
            <span>{character.age} years</span>
          )}

          {character.job && (
            <span>{character.job}</span>
          )}

          {character.affiliation && (
            <span>{character.affiliation}</span>
          )}
        </div>

        <div className="character-card-actions">
          <button
            className="button danger"
            type="button"
            onClick={() => onDelete(character.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function CharactersPage({
  characters,
  search,
  setSearch,
  onCreate,
  onDelete,
}) {
  const filteredCharacters = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return characters;
    }

    return characters.filter((character) => {
      return [
        character.name,
        character.lastName,
        character.nickname,
        character.job,
        character.affiliation,
      ]
        .filter(Boolean)
        .some((value) =>
          value.toLowerCase().includes(query)
        );
    });
  }, [characters, search]);

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">CHARACTER ARCHIVE</p>
          <h1>Your Characters</h1>
          <p className="muted">
            {characters.length} character
            {characters.length !== 1 ? "s" : ""}
          </p>
        </div>

        <button
          className="button primary"
          type="button"
          onClick={onCreate}
        >
          + New character
        </button>
      </div>

      {characters.length > 0 && (
        <div className="search-bar glow-card">
          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search characters..."
          />
        </div>
      )}

      {filteredCharacters.length === 0 ? (
        <div className="empty-state glow-card">
          <div className="empty-icon">✦</div>

          <h2>
            {characters.length === 0
              ? "Your archive is empty"
              : "No characters found"}
          </h2>

          <p className="muted">
            {characters.length === 0
              ? "Create your first original character to begin."
              : "Try another search."}
          </p>

          {characters.length === 0 && (
            <button
              className="button primary"
              type="button"
              onClick={onCreate}
            >
              Create your first OC
            </button>
          )}
        </div>
      ) : (
        <div className="character-grid">
          {filteredCharacters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function PlaceholderPage({ title, description }) {
  return (
    <main className="page">
      <div className="empty-state glow-card">
        <div className="empty-icon">✦</div>

        <p className="eyebrow">COMING SOON</p>

        <h1>{title}</h1>

        <p className="muted">{description}</p>
      </div>
    </main>
  );
}

export default function App() {
  const [theme, setTheme] = useState(getTheme());
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

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "oc-characters",
        JSON.stringify(characters)
      );
    } catch {
      /* ignore */
    }
  }, [characters]);

  const createCharacter = (character) => {
    const newCharacter = {
      ...character,
      id: Date.now(),
    };

    setCharacters((current) => [
      ...current,
      newCharacter,
    ]);

    setShowCreator(false);
    setActiveTab("characters");
  };

  const deleteCharacter = (id) => {
    const confirmed = window.confirm(
      "Delete this character? This cannot be undone."
    );

    if (!confirmed) return;

    setCharacters((current) =>
      current.filter((character) => character.id !== id)
    );
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand">
          <div className="brand-symbol">✦</div>

          <div>
            <div className="brand-title">
              OC Archive
            </div>

            <div className="brand-subtitle">
              Original Character Database
            </div>
          </div>
        </div>

        <nav className="main-nav">
          <button
            className={
              activeTab === "characters"
                ? "nav-button active"
                : "nav-button"
            }
            onClick={() => {
              setActiveTab("characters");
              setShowCreator(false);
            }}
          >
            Characters
          </button>

          <button
            className={
              activeTab === "organizations"
                ? "nav-button active"
                : "nav-button"
            }
            onClick={() => {
              setActiveTab("organizations");
              setShowCreator(false);
            }}
          >
            Organizations
          </button>

          <button
            className={
              activeTab === "lore"
                ? "nav-button active"
                : "nav-button"
            }
            onClick={() => {
              setActiveTab("lore");
              setShowCreator(false);
            }}
          >
            Lore
          </button>
        </nav>

        <div className="theme-switcher">
          <label htmlFor="theme-select">
            Theme
          </label>

          <select
            id="theme-select"
            value={theme}
            onChange={(event) => {
              setTheme(event.target.value);
              applyTheme(event.target.value);
            }}
          >
            {THEMES.map((themeOption) => (
              <option
                key={themeOption.id}
                value={themeOption.id}
              >
                {themeOption.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {showCreator ? (
        <CharacterCreator
          onCreate={createCharacter}
          onCancel={() => setShowCreator(false)}
        />
      ) : activeTab === "characters" ? (
        <CharactersPage
          characters={characters}
          search={search}
          setSearch={setSearch}
          onCreate={() => setShowCreator(true)}
          onDelete={deleteCharacter}
        />
      ) : activeTab === "organizations" ? (
        <PlaceholderPage
          title="Organizations"
          description="Organizations, branches and members will live here."
        />
      ) : (
        <PlaceholderPage
          title="Lore"
          description="Your worldbuilding, events and lore will live here."
        />
      )}

      <footer className="site-footer">
        <span>OC Archive</span>
        <span>✦</span>
        <span>Personal OC Database</span>
      </footer>
    </div>
  );
}
