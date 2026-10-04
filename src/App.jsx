import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  THEMES,
  applyTheme,
  getTheme,
} from "./themes";

/* =========================================================
   CONSTANTS
========================================================= */

const PERSONALITY_STATS = [
  ["nice", "Nice", "Mean"],
  ["brave", "Brave", "Coward"],
  ["pacifist", "Pacifist", "Violent"],
  ["thoughtful", "Thoughtful", "Impulsive"],
  ["agreeable", "Agreeable", "Contrary"],
  ["idealistic", "Idealistic", "Pragmatic"],
  ["frugal", "Frugal", "Big spender"],
  ["collected", "Collected", "Wild"],
  ["honest", "Honest", "Deceptive"],
  ["polite", "Polite", "Rude"],
  ["smart", "Smart", "Idiot"],
  ["confident", "Confident", "Insecure"],
  ["calm", "Calm", "Anxious"],
  ["patient", "Patient", "Impatient"],
  ["gullible", "Gullible", "Skeptical"],
  ["reserved", "Reserved", "Flirty"],
];

const SKILLS = [
  "Perception",
  "Communication",
  "Persuasion",
  "Mediation",
  "Literacy",
  "Creativity",
  "Cooking",
  "Tech savvy",
  "Combat",
  "Survival",
  "Stealth",
  "Street smarts",
  "Seduction",
  "Luck",
  "Handling animals",
  "Pacifying children",
  "Reflexes",
  "Strength",
  "Speed",
  "Battle IQ",
  "Resistance",
  "Endurance",
  "Flexibility",
];

const SOCIAL_STATS = [
  "Charisma",
  "Empathy",
  "Generosity",
  "Wealth",
  "Aggression",
  "Libido",
];

const RELATIONSHIP_TYPES = [
  "Family",
  "Friends",
  "Enemies",
  "Lovers",
  "Ex",
  "Rivals",
  "Allies",
  "Colleagues",
  "Acquaintances",
  "Mentors",
  "Students",
  "Custom",
];

const NAV_ITEMS = [
  ["home", "Home"],
  ["characters", "Characters"],
  ["organizations", "Organizations"],
  ["lore", "Lore"],
  ["data", "Import / Export"],
];

/* =========================================================
   HELPERS
========================================================= */

function uid(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function emptyCharacter() {
  return {
    id: uid("character"),

    name: "",
    lastName: "",
    nicknames: "",

    age: "",
    gender: "",
    pronouns: "",
    sexuality: "",
    dateOfBirth: "",

    nationality: "",
    origins: "",

    species: "",
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

    status: "alive",
    laterStatus: "",

    affiliation: "",
    pastAffiliation: "",
    rank: "",
    pastRank: "",

    job: "",
    sideJob: "",

    addictions: "",
    fears: "",
    sickness: "",

    personality: Object.fromEntries(
      PERSONALITY_STATS.map(([id]) => [id, 3])
    ),

    skills: Object.fromEntries(
      SKILLS.map((skill) => [skill, 3])
    ),

    social: Object.fromEntries(
      SOCIAL_STATS.map((stat) => [stat, 3])
    ),

    image: "",
    moodboard: [],

    likes: "",
    dislikes: "",

    relationships: [],

    organizations: [],
  };
}

function emptyOrganization() {
  return {
    id: uid("organization"),
    name: "",
    description: "",
    branches: [],
    members: [],
  };
}

function emptyLore() {
  return {
    id: uid("lore"),
    title: "",
    category: "General",
    content: "",
  };
}

function loadJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);

    if (!value) {
      return fallback;
    }

    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function downloadJSON(filename, data) {
  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    {
      type: "application/json",
    }
  );

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function Button({
  children,
  onClick,
  variant = "secondary",
  type = "button",
}) {
  return (
    <button
      type={type}
      className={`button ${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function SectionTitle({
  symbol = "✦",
  eyebrow,
  title,
}) {
  return (
    <div className="section-title">
      <div className="section-symbol">{symbol}</div>

      <div>
        {eyebrow && (
          <div className="section-eyebrow">
            {eyebrow}
          </div>
        )}

        <h2>{title}</h2>
      </div>
    </div>
  );
}

function EmptyState({
  symbol = "✦",
  title,
  text,
  action,
}) {
  return (
    <div className="empty-state">
      <div className="empty-symbol">{symbol}</div>

      <h2>{title}</h2>

      <p>{text}</p>

      {action}
    </div>
  );
}

/* =========================================================
   IMAGE UPLOAD
========================================================= */

function ImageUpload({
  value,
  onChange,
  multiple = false,
  label = "Image",
}) {
  const inputRef = useRef(null);

  function handleFiles(event) {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      return;
    }

    const readers = files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();

          reader.onload = () =>
            resolve(reader.result);

          reader.readAsDataURL(file);
        })
    );

    Promise.all(readers).then((images) => {
      if (multiple) {
        onChange([
          ...(value || []),
          ...images,
        ]);
      } else {
        onChange(images[0]);
      }
    });

    event.target.value = "";
  }

  return (
    <div className="image-upload">
      <div className="image-upload-heading">
        <span>{label}</span>
        <small>JPG / PNG / WEBP</small>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        hidden
        onChange={handleFiles}
      />

      <button
        type="button"
        className="upload-area"
        onClick={() => inputRef.current?.click()}
      >
        {!multiple && value ? (
          <img
            src={value}
            className="upload-preview"
            alt=""
          />
        ) : multiple && value?.length ? (
          <div className="upload-preview-grid">
            {value.map((image, index) => (
              <img
                key={index}
                src={image}
                alt=""
              />
            ))}
          </div>
        ) : (
          <div className="upload-placeholder">
            <span>＋</span>
            <strong>Upload image</strong>
            <small>
              Click to choose a file
            </small>
          </div>
        )}
      </button>

      {(value?.length || value) && (
        <div className="upload-actions">
          <Button
            onClick={() =>
              onChange(multiple ? [] : "")
            }
          >
            Remove
          </Button>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   STAT PIPS
========================================================= */

function PipStat({
  value = 3,
  onChange,
  left,
  right,
}) {
  return (
    <div className="pip-stat">
      <span>{left}</span>

      <div className="stat-pips">
        {[1, 2, 3, 4, 5].map(
          (number) => (
            <button
              key={number}
              type="button"
              className={
                number <= value
                  ? "stat-pip active"
                  : "stat-pip"
              }
              onClick={() =>
                onChange(number)
              }
              aria-label={`${number} / 5`}
            >
              {number}
            </button>
          )
        )}
      </div>

      <span>{right}</span>
    </div>
  );
}

/* =========================================================
   HOME
========================================================= */

function HomePage({
  characters,
  organizations,
  lore,
  theme,
  onTheme,
  go,
}) {
  return (
    <div className="page">
      <section className="hero">
        <div className="hero-symbol">
          {theme?.symbol || "✦"}
        </div>

        <div className="hero-copy">
          <div className="eyebrow">
            PERSONAL ORIGINAL CHARACTER DATABASE
          </div>

          <h1>OC Archive</h1>

          <p>
            A complete archive for your characters,
            relationships, organizations and lore.
          </p>
        </div>

        <div className="hero-actions">
          <Button
            variant="primary"
            onClick={() => go("character-new")}
          >
            + Create Character
          </Button>

          <Button
            onClick={() => go("characters")}
          >
            Browse Archive
          </Button>
        </div>
      </section>

      <section className="stats-overview">
        <button
          className="overview-card"
          onClick={() => go("characters")}
        >
          <strong>{characters.length}</strong>
          <span>Characters</span>
        </button>

        <button
          className="overview-card"
          onClick={() =>
            go("organizations")
          }
        >
          <strong>{organizations.length}</strong>
          <span>Organizations</span>
        </button>

        <button
          className="overview-card"
          onClick={() => go("lore")}
        >
          <strong>{lore.length}</strong>
          <span>Lore entries</span>
        </button>
      </section>

      <section className="theme-summary">
        <SectionTitle
          symbol="◈"
          eyebrow="ATMOSPHERE"
          title="Archive Themes"
        />

        <div className="theme-grid">
          {THEMES.map((item) => (
            <button
              key={item.id}
              className={`theme-card theme-${item.id} ${
                theme?.id === item.id
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                onTheme(item.id)
              }
            >
              <span>{item.symbol}</span>
              <strong>{item.name}</strong>
              <small>
                {item.description}
              </small>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   CHARACTER LIST
========================================================= */

function CharactersPage({
  characters,
  search,
  setSearch,
  go,
  deleteCharacter,
}) {
  const filtered = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return characters;
    }

    return characters.filter(
      (character) =>
        `${character.name} ${character.lastName} ${character.nicknames}`
          .toLowerCase()
          .includes(query)
    );
  }, [characters, search]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">
            ARCHIVE
          </div>

          <h1>Characters</h1>

          <p>
            {characters.length} character
            {characters.length === 1
              ? ""
              : "s"} in your archive.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() =>
            go("character-new")
          }
        >
          + New Character
        </Button>
      </div>

      <div className="archive-tools">
        <input
          className="search-box"
          placeholder="Search characters..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <span className="archive-count">
          {filtered.length} shown
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          symbol="♙"
          title={
            characters.length
              ? "No character found"
              : "Your archive is empty"
          }
          text={
            characters.length
              ? "Try another search."
              : "Create your first original character."
          }
          action={
            <Button
              variant="primary"
              onClick={() =>
                go("character-new")
              }
            >
              + Create Character
            </Button>
          }
        />
      ) : (
        <div className="character-grid">
          {filtered.map((character) => (
            <article
              className="character-card"
              key={character.id}
              onClick={() =>
                go(`character-${character.id}`)
              }
            >
              <div className="character-image">
                {character.image ? (
                  <img
                    src={character.image}
                    alt=""
                  />
                ) : (
                  <div className="character-image-empty">
                    ✦
                  </div>
                )}
              </div>

              <div className="character-card-content">
                <div className="character-card-top">
                  <div>
                    <h2>
                      {character.name ||
                        "Unnamed Character"}
                    </h2>

                    {character.lastName && (
                      <span>
                        {character.lastName}
                      </span>
                    )}
                  </div>

                  <span
                    className={
                      character.status ===
                      "dead"
                        ? "badge badge-dead"
                        : "badge badge-alive"
                    }
                  >
                    {character.status}
                  </span>
                </div>

                {character.nicknames && (
                  <p className="nickname">
                    "{character.nicknames}"
                  </p>
                )}

                <p className="character-summary">
                  {character.job ||
                    character.affiliation ||
                    character.species ||
                    "Original Character"}
                </p>

                <div className="character-card-actions">
                  <Button
                    onClick={(event) => {
                      event.stopPropagation();
                      go(
                        `character-${character.id}`
                      );
                    }}
                  >
                    Open
                  </Button>

                  <Button
                    variant="danger"
                    onClick={(event) => {
                      event.stopPropagation();

                      if (
                        window.confirm(
                          "Delete this character?"
                        )
                      ) {
                        deleteCharacter(
                          character.id
                        );
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   CHARACTER EDITOR
========================================================= */

function CharacterEditor({
  initialCharacter,
  characters,
  organizations,
  onSave,
  onCancel,
}) {
  const [character, setCharacter] =
    useState(initialCharacter);

  function update(field, value) {
    setCharacter((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateNested(
    group,
    field,
    value
  ) {
    setCharacter((current) => ({
      ...current,
      [group]: {
        ...current[group],
        [field]: value,
      },
    }));
  }

  function addRelationship() {
    update("relationships", [
      ...character.relationships,
      {
        id: uid("relationship"),
        type: "Friends",
        customType: "",
        targetId: "",
        targetName: "",
        status: "",
        notes: "",
      },
    ]);
  }

  function updateRelationship(
    id,
    field,
    value
  ) {
    update(
      "relationships",
      character.relationships.map(
        (relationship) =>
          relationship.id === id
            ? {
                ...relationship,
                [field]: value,
              }
            : relationship
      )
    );
  }

  function removeRelationship(id) {
    update(
      "relationships",
      character.relationships.filter(
        (relationship) =>
          relationship.id !== id
      )
    );
  }

  function addMoodboardImage(image) {
    update("moodboard", [
      ...character.moodboard,
      image,
    ]);
  }

  function addOrganization(id) {
    if (
      character.organizations.includes(id)
    ) {
      return;
    }

    update("organizations", [
      ...character.organizations,
      id,
    ]);
  }

  function removeOrganization(id) {
    update(
      "organizations",
      character.organizations.filter(
        (item) => item !== id
      )
    );
  }

  return (
    <div className="page editor-page">
      <div className="editor-header">
        <div>
          <div className="eyebrow">
            CHARACTER EDITOR
          </div>

          <h1>
            {character.name ||
              "New Character"}
          </h1>
        </div>

        <div className="editor-actions">
          <Button onClick={onCancel}>
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={() =>
              onSave(character)
            }
          >
            Save Character
          </Button>
        </div>
      </div>

      <section className="form-section glow-card">
        <SectionTitle
          symbol="♙"
          eyebrow="IDENTITY"
          title="Basic Information"
        />

        <div className="form-grid">
          <label className="field">
            <span>Name</span>
            <input
              value={character.name}
              onChange={(e) =>
                update(
                  "name",
                  e.target.value
                )
              }
            />
          </label>

          <label className="field">
            <span>Last name</span>
            <input
              value={character.lastName}
              onChange={(e) =>
                update(
                  "lastName",
                  e.target.value
                )
              }
            />
          </label>

          <label className="field field-wide">
            <span>Nickname(s)</span>
            <input
              value={character.nicknames}
              onChange={(e) =>
                update(
                  "nicknames",
                  e.target.value
                )
              }
            />
          </label>

          <label className="field">
            <span>Age</span>
            <input
              value={character.age}
              onChange={(e) =>
                update(
                  "age",
                  e.target.value
                )
              }
            />
          </label>

          <label className="field">
            <span>Date of birth</span>
            <input
              type="date"
              value={character.dateOfBirth}
              onChange={(e) =>
                update(
                  "dateOfBirth",
                  e.target.value
                )
              }
            />
          </label>

          <label className="field">
            <span>Gender</span>
            <input
              value={character.gender}
              onChange={(e) =>
                update(
                  "gender",
                  e.target.value
                )
              }
            />
          </label>

          <label className="field">
            <span>Pronouns</span>
            <input
              value={character.pronouns}
              onChange={(e) =>
                update(
                  "pronouns",
                  e.target.value
                )
              }
            />
          </label>

          <label className="field">
            <span>Sexuality</span>
            <input
              value={character.sexuality}
              onChange={(e) =>
                update(
                  "sexuality",
                  e.target.value
                )
              }
            />
          </label>

          <label className="field">
            <span>Nationality</span>
            <input
              value={character.nationality}
              onChange={(e) =>
                update(
                  "nationality",
                  e.target.value
                )
              }
            />
          </label>

          <label className="field field-wide">
            <span>Origins</span>
            <textarea
              value={character.origins}
              onChange={(e) =>
                update(
                  "origins",
                  e.target.value
                )
              }
            />
          </label>
        </div>
      </section>

      <section className="form-section glow-card">
        <SectionTitle
          symbol="◈"
          eyebrow="APPEARANCE"
          title="Physical Information"
        />

        <div className="form-grid">
          <label className="field">
            <span>Species / Race</span>
            <input
              value={character.species}
              onChange={(e) =>
                update(
                  "species",
                  e.target.value
                )
              }
            />
          </label>

          <label className="field">
            <span>Height</span>
            <input
              value={character.height}
              onChange={(e) =>
                update(
                  "height",
                  e.target.value
                )
              }
            />
          </label>

          <label className="field">
            <span>Weight</span>
            <input
              value={character.weight}
              onChange={(e) =>
                update(
                  "weight",
                  e.target.value
                )
              }
            />
          </label>

          <label className="field">
            <span>Eye color</span>
            <input
              value={character.eyeColor}
              onChange={(e) =>
                update(
                  "eyeColor",
                  e.target.value
                )
              }
            />
          </label>

          <label className="field">
            <span>Hair color</span>
            <input
              value={character.hairColor}
              onChange={(e) =>
                update(
                  "hairColor",
                  e.target.value
                )
              }
            />
          </label>

          <label className="field field-wide">
            <span>Hair style</span>
            <input
              value={character.hairStyle}
              onChange={(e) =>
                update(
                  "hairStyle",
                  e.target.value
                )
              }
            />
          </label>
        </div>

        <ImageUpload
          value={character.image}
          onChange={(value) =>
            update("image", value)
          }
          label="Character picture"
        />

        <ImageUpload
          value={character.moodboard}
          onChange={(value) =>
            update("moodboard", value)
          }
          multiple
          label="Moodboard / Appearance pictures"
        />
      </section>

      <section className="form-section glow-card">
        <SectionTitle
          symbol="✦"
          eyebrow="ABILITY"
          title="Power & Combat"
        />

        <div className="form-grid">
          <label className="field">
            <span>Ability</span>
            <input
              value={character.ability}
              onChange={(e) =>
                update(
                  "ability",
                  e.target.value
                )
              }
            />
          </label>

          <label className="field">
            <span>Weapon</span>
            <input
              value={character.weapon}
              onChange={(e) =>
                update(
                  "weapon",
                  e.target.value
                )
              }
            />
          </label>

          <label className="field">
            <span>MBTI</span>
            <input
              value={character.mbti}
              onChange={(e) =>
                update(
                  "mbti",
                  e.target.value
                )
              }
            />
          </label>

          <label className="field">
            <span>Status</span>

            <select
              value={character.status}
              onChange={(e) =>
                update(
                  "status",
                  e.target.value
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

          <label className="field field-wide">
            <span>Ability description</span>
            <textarea
              value={
                character.abilityDescription
              }
              onChange={(e) =>
                update(
                  "abilityDescription",
                  e.target.value
                )
              }
            />
          </label>

          <label className="field field-wide">
            <span>Side effects & risks</span>
            <textarea
              value={
                character.sideEffects
              }
              onChange={(e) =>
                update(
                  "sideEffects",
                  e.target.value
                )
              }
            />
          </label>
        </div>
      </section>

      <section className="form-section glow-card">
        <SectionTitle
          symbol="♜"
          eyebrow="CAREER"
          title="Affiliations & Work"
        />

        <div className="form-grid">
          <label className="field">
            <span>Affiliation</span>
            <input
              value={
                character.affiliation
              }
              onChange={(e) =>
                update(
                  "affiliation",
                  e.target.value
                )
              }
            />
          </label>

          <label className="field">
            <span>Past affiliation</span>
            <input
              value={
                character.pastAffiliation
              }
              onChange={(e) =>
                update(
                  "pastAffiliation",
                  e.target.value
                )
              }
            />
          </label>

          <label className="field">
            <span>Rank</span>
            <input
              value={character.rank}
              onChange={(e) =>
                update(
                  "rank",
                  e.target.value
                )
              }
            />
          </label>

          <label className="field">
            <span>Past rank</span>
            <input
              value={character.pastRank}
              onChange={(e) =>
                update(
                  "pastRank",
                  e.target.value
                )
              }
            />
          </label>

          <label className="field">
            <span>Job</span>
            <input
              value={character.job}
              onChange={(e) =>
                update(
                  "job",
                  e.target.value
                )
              }
            />
          </label>

          <label className="field">
            <span>Side job</span>
            <input
              value={character.sideJob}
              onChange={(e) =>
                update(
                  "sideJob",
                  e.target.value
                )
              }
            />
          </label>

          <label className="field field-wide">
            <span>Later status</span>
            <input
              value={
                character.laterStatus
              }
              onChange={(e) =>
                update(
                  "laterStatus",
                  e.target.value
                )
              }
            />
          </label>
        </div>
      </section>

      <section className="form-section glow-card">
        <SectionTitle
          symbol="☽"
          eyebrow="PERSONALITY"
          title="Personality"
        />

        <div className="stats-list">
          {PERSONALITY_STATS.map(
            ([id, left, right]) => (
              <PipStat
                key={id}
                value={
                  character.personality[id]
                }
                onChange={(value) =>
                  updateNested(
                    "personality",
                    id,
                    value
                  )
                }
                left={left}
                right={right}
              />
            )
          )}
        </div>
      </section>

      <section className="form-section glow-card">
        <SectionTitle
          symbol="⚔"
          eyebrow="SKILLS"
          title="Skills"
        />

        <div className="skills-list">
          {SKILLS.map((skill) => (
            <div
              className="skill-row"
              key={skill}
            >
              <span>{skill}</span>

              <div className="skill-pips">
                {[1, 2, 3, 4, 5].map(
                  (number) => (
                    <button
                      key={number}
                      type="button"
                      className={
                        number <=
                        character.skills[
                          skill
                        ]
                          ? "skill-pip active"
                          : "skill-pip"
                      }
                      onClick={() =>
                        updateNested(
                          "skills",
                          skill,
                          number
                        )
                      }
                    >
                      {number}
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="form-section glow-card">
        <SectionTitle
          symbol="♡"
          eyebrow="SOCIAL"
          title="Social Statistics"
        />

        <div className="stats-list">
          {SOCIAL_STATS.map((stat) => (
            <div
              className="social-stat"
              key={stat}
            >
              <span>{stat}</span>

              <div className="skill-pips">
                {[1, 2, 3, 4, 5].map(
                  (number) => (
                    <button
                      key={number}
                      type="button"
                      className={
                        number <=
                        character.social[
                          stat
                        ]
                          ? "skill-pip active"
                          : "skill-pip"
                      }
                      onClick={() =>
                        updateNested(
                          "social",
                          stat,
                          number
                        )
                      }
                    >
                      {number}
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="form-section glow-card">
        <SectionTitle
          symbol="☠"
          eyebrow="PERSONAL"
          title="Personal Details"
        />

        <div className="form-grid">
          <label className="field field-wide">
            <span>Fears</span>
            <textarea
              value={character.fears}
              onChange={(e) =>
                update(
                  "fears",
                  e.target.value
                )
              }
            />
          </label>

          <label className="field field-wide">
            <span>Sickness</span>
            <textarea
              value={character.sickness}
              onChange={(e) =>
                update(
                  "sickness",
                  e.target.value
                )
              }
            />
          </label>

          <label className="field field-wide">
            <span>Addictions</span>
            <textarea
              value={character.addictions}
              onChange={(e) =>
                update(
                  "addictions",
                  e.target.value
                )
              }
            />
          </label>

          <label className="field">
            <span>Likes</span>
            <textarea
              value={character.likes}
              onChange={(e) =>
                update(
                  "likes",
                  e.target.value
                )
              }
            />
          </label>

          <label className="field">
            <span>Dislikes</span>
            <textarea
              value={character.dislikes}
              onChange={(e) =>
                update(
                  "dislikes",
                  e.target.value
                )
              }
            />
          </label>
        </div>
      </section>

      <section className="form-section glow-card">
        <SectionTitle
          symbol="♡"
          eyebrow="RELATIONSHIPS"
          title="Relationships"
        />

        <p className="relationship-intro">
          Add as many people as you want.
          Choose existing characters or type
          a person manually.
        </p>

        <div className="relationship-list">
          {character.relationships.map(
            (relationship) => (
              <div
                className="relationship-card"
                key={relationship.id}
              >
                <div className="relationship-card-heading">
                  <strong>
                    Relationship
                  </strong>

                  <Button
                    variant="danger"
                    onClick={() =>
                      removeRelationship(
                        relationship.id
                      )
                    }
                  >
                    Remove
                  </Button>
                </div>

                <div className="form-grid">
                  <label className="field">
                    <span>Category</span>

                    <select
                      value={
                        relationship.type
                      }
                      onChange={(e) =>
                        updateRelationship(
                          relationship.id,
                          "type",
                          e.target.value
                        )
                      }
                    >
                      {RELATIONSHIP_TYPES.map(
                        (type) => (
                          <option
                            key={type}
                            value={type}
                          >
                            {type}
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  {relationship.type ===
                    "Custom" && (
                    <label className="field">
                      <span>
                        Custom category
                      </span>

                      <input
                        value={
                          relationship.customType
                        }
                        onChange={(e) =>
                          updateRelationship(
                            relationship.id,
                            "customType",
                            e.target.value
                          )
                        }
                      />
                    </label>
                  )}

                  <label className="field">
                    <span>
                      Existing character
                    </span>

                    <select
                      value={
                        relationship.targetId
                      }
                      onChange={(e) => {
                        const target =
                          characters.find(
                            (item) =>
                              item.id ===
                              e.target.value
                          );

                        updateRelationship(
                          relationship.id,
                          "targetId",
                          e.target.value
                        );

                        if (target) {
                          updateRelationship(
                            relationship.id,
                            "targetName",
                            `${target.name} ${target.lastName}`.trim()
                          );
                        }
                      }}
                    >
                      <option value="">
                        — Manual person —
                      </option>

                      {characters
                        .filter(
                          (item) =>
                            item.id !==
                            character.id
                        )
                        .map((item) => (
                          <option
                            key={item.id}
                            value={item.id}
                          >
                            {item.name}{" "}
                            {item.lastName}
                          </option>
                        ))}
                    </select>
                  </label>

                  <label className="field">
                    <span>Person name</span>

                    <input
                      value={
                        relationship.targetName
                      }
                      onChange={(e) =>
                        updateRelationship(
                          relationship.id,
                          "targetName",
                          e.target.value
                        )
                      }
                    />
                  </label>

                  <label className="field">
                    <span>Status</span>

                    <input
                      value={
                        relationship.status
                      }
                      onChange={(e) =>
                        updateRelationship(
                          relationship.id,
                          "status",
                          e.target.value
                        )
                      }
                      placeholder="Complicated, close, broken..."
                    />
                  </label>

                  <label className="field field-wide">
                    <span>Notes</span>

                    <textarea
                      value={
                        relationship.notes
                      }
                      onChange={(e) =>
                        updateRelationship(
                          relationship.id,
                          "notes",
                          e.target.value
                        )
                      }
                    />
                  </label>
                </div>
              </div>
            )
          )}
        </div>

        <Button
          variant="primary"
          onClick={addRelationship}
        >
          + Add Relationship
        </Button>
      </section>

      <section className="form-section glow-card">
        <SectionTitle
          symbol="♜"
          eyebrow="ORGANIZATIONS"
          title="Organizations"
        />

        <div className="organization-memberships">
          {organizations.length === 0 ? (
            <p>
              Create organizations first.
            </p>
          ) : (
            organizations.map(
              (organization) => {
                const selected =
                  character.organizations.includes(
                    organization.id
                  );

                return (
                  <button
                    type="button"
                    className={
                      selected
                        ? "member-option selected"
                        : "member-option"
                    }
                    key={organization.id}
                    onClick={() =>
                      selected
                        ? removeOrganization(
                            organization.id
                          )
                        : addOrganization(
                            organization.id
                          )
                    }
                  >
                    <strong>
                      {organization.name ||
                        "Unnamed organization"}
                    </strong>

                    <span>
                      {selected
                        ? "Member"
                        : "Add"}
                    </span>
                  </button>
                );
              }
            )
          )}
        </div>
      </section>

      <div className="bottom-save">
        <Button onClick={onCancel}>
          Cancel
        </Button>

        <Button
          variant="primary"
          onClick={() =>
            onSave(character)
          }
        >
          Save Character
        </Button>
      </div>
    </div>
  );
}

/* =========================================================
   CHARACTER PROFILE
========================================================= */

function CharacterProfile({
  character,
  characters,
  organizations,
  go,
  onEdit,
}) {
  const relationName = (relationship) => {
    if (
      relationship.targetName
    ) {
      return relationship.targetName;
    }

    const found =
      characters.find(
        (item) =>
          item.id ===
          relationship.targetId
      );

    return found
      ? `${found.name} ${found.lastName}`.trim()
      : "Unknown person";
  };

  return (
    <div className="page profile-page">
      <div className="page-header">
        <Button onClick={() => go("characters")}>
          ← Back
        </Button>

        <div className="profile-actions">
          <Button
            variant="primary"
            onClick={onEdit}
          >
            Edit Character
          </Button>
        </div>
      </div>

      <section className="profile-hero glow-card">
        <div className="profile-image">
          {character.image ? (
            <img
              src={character.image}
              alt=""
            />
          ) : (
            <div>✦</div>
          )}
        </div>

        <div>
          <div className="eyebrow">
            CHARACTER PROFILE
          </div>

          <h1>
            {character.name ||
              "Unnamed Character"}
          </h1>

          {character.lastName && (
            <h2>
              {character.lastName}
            </h2>
          )}

          {character.nicknames && (
            <p className="nickname">
              "{character.nicknames}"
            </p>
          )}

          <div className="profile-badges">
            <span className="badge">
              {character.status}
            </span>

            {character.mbti && (
              <span className="badge">
                {character.mbti}
              </span>
            )}

            {character.gender && (
              <span className="badge">
                {character.gender}
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="profile-grid">
        <section className="profile-section glow-card">
          <SectionTitle
            symbol="◈"
            title="Identity"
          />

          <Info
            label="Age"
            value={character.age}
          />

          <Info
            label="Birthday"
            value={
              character.dateOfBirth
            }
          />

          <Info
            label="Pronouns"
            value={
              character.pronouns
            }
          />

          <Info
            label="Sexuality"
            value={
              character.sexuality
            }
          />

          <Info
            label="Nationality"
            value={
              character.nationality
            }
          />

          <Info
            label="Origins"
            value={character.origins}
          />

          <Info
            label="Species"
            value={
              character.species
            }
          />
        </section>

        <section className="profile-section glow-card">
          <SectionTitle
            symbol="♜"
            title="Career"
          />

          <Info
            label="Job"
            value={character.job}
          />

          <Info
            label="Side job"
            value={
              character.sideJob
            }
          />

          <Info
            label="Affiliation"
            value={
              character.affiliation
            }
          />

          <Info
            label="Past affiliation"
            value={
              character.pastAffiliation
            }
          />

          <Info
            label="Rank"
            value={character.rank}
          />

          <Info
            label="Past rank"
            value={
              character.pastRank
            }
          />
        </section>

        <section className="profile-section profile-wide glow-card">
          <SectionTitle
            symbol="✦"
            title="Ability"
          />

          <Info
            label="Ability"
            value={
              character.ability
            }
          />

          <Info
            label="Description"
            value={
              character.abilityDescription
            }
          />

          <Info
            label="Weapon"
            value={character.weapon}
          />

          <Info
            label="Side effects & risks"
            value={
              character.sideEffects
            }
          />
        </section>

        <section className="profile-section glow-card">
          <SectionTitle
            symbol="☽"
            title="Personality"
          />

          <div className="profile-stat-list">
            {PERSONALITY_STATS.map(
              ([id, left, right]) => (
                <div
                  className="profile-stat"
                  key={id}
                >
                  <span>
                    {left} — {right}
                  </span>

                  <strong>
                    {character.personality[
                      id
                    ] || 3}
                    /5
                  </strong>
                </div>
              )
            )}
          </div>
        </section>

        <section className="profile-section glow-card">
          <SectionTitle
            symbol="⚔"
            title="Skills"
          />

          <div className="profile-stat-list">
            {SKILLS.map((skill) => (
              <div
                className="profile-stat"
                key={skill}
              >
                <span>{skill}</span>
                <strong>
                  {character.skills[
                    skill
                  ] || 3}
                  /5
                </strong>
              </div>
            ))}
          </div>
        </section>

        <section className="profile-section glow-card">
          <SectionTitle
            symbol="♡"
            title="Social"
          />

          <div className="profile-stat-list">
            {SOCIAL_STATS.map((stat) => (
              <div
                className="profile-stat"
                key={stat}
              >
                <span>{stat}</span>
                <strong>
                  {character.social[
                    stat
                  ] || 3}
                  /5
                </strong>
              </div>
            ))}
          </div>
        </section>

        <section className="profile-section profile-wide glow-card">
          <SectionTitle
            symbol="♡"
            title="Relationships"
          />

          {character.relationships
            .length === 0 ? (
            <p>
              No relationships added.
            </p>
          ) : (
            <div className="relationship-profile-list">
              {character.relationships.map(
                (relationship) => (
                  <div
                    className="relationship-profile"
                    key={relationship.id}
                  >
                    <strong>
                      {relationship.type ===
                      "Custom"
                        ? relationship.customType
                        : relationship.type}
                    </strong>

                    <h3>
                      {relationName(
                        relationship
                      )}
                    </h3>

                    {relationship.status && (
                      <span>
                        {
                          relationship.status
                        }
                      </span>
                    )}

                    {relationship.notes && (
                      <p>
                        {
                          relationship.notes
                        }
                      </p>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </section>

        <section className="profile-section profile-wide glow-card">
          <SectionTitle
            symbol="♜"
            title="Organizations"
          />

          <div className="organization-memberships">
            {organizations
              .filter((organization) =>
                character.organizations.includes(
                  organization.id
                )
              )
              .map((organization) => (
                <div
                  className="membership-card"
                  key={organization.id}
                >
                  <strong>
                    {organization.name}
                  </strong>

                  <span>
                    {organization.description}
                  </span>
                </div>
              ))}

            {!character.organizations
              .length && (
              <p>
                No organizations assigned.
              </p>
            )}
          </div>
        </section>

        <section className="profile-section profile-wide glow-card">
          <SectionTitle
            symbol="▧"
            title="Moodboard"
          />

          {character.moodboard.length ? (
            <div className="moodboard-grid">
              {character.moodboard.map(
                (image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt=""
                  />
                )
              )}
            </div>
          ) : (
            <p>No moodboard images.</p>
          )}
        </section>

        <section className="profile-section glow-card">
          <SectionTitle
            symbol="♡"
            title="Likes"
          />

          <p className="long-text">
            {character.likes ||
              "No likes recorded."}
          </p>
        </section>

        <section className="profile-section glow-card">
          <SectionTitle
            symbol="☠"
            title="Dislikes"
          />

          <p className="long-text">
            {character.dislikes ||
              "No dislikes recorded."}
          </p>
        </section>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <strong>
        {value || "—"}
      </strong>
    </div>
  );
}

/* =========================================================
   ORGANIZATIONS
========================================================= */

function OrganizationsPage({
  organizations,
  characters,
  onSave,
  onDelete,
}) {
  const [editing, setEditing] =
    useState(null);

  const [draft, setDraft] =
    useState(null);

  function startNew() {
    const item = emptyOrganization();
    setDraft(item);
    setEditing(item.id);
  }

  function startEdit(item) {
    setDraft(
      JSON.parse(JSON.stringify(item))
    );
    setEditing(item.id);
  }

  function save() {
    onSave(draft);
    setEditing(null);
    setDraft(null);
  }

  function addBranch() {
    setDraft((current) => ({
      ...current,
      branches: [
        ...current.branches,
        {
          id: uid("branch"),
          name: "New Branch",
          description: "",
          members: [],
        },
      ],
    }));
  }

  function updateBranch(
    id,
    field,
    value
  ) {
    setDraft((current) => ({
      ...current,
      branches: current.branches.map(
        (branch) =>
          branch.id === id
            ? {
                ...branch,
                [field]: value,
              }
            : branch
      ),
    }));
  }

  function toggleMember(
    branchId,
    characterId
  ) {
    setDraft((current) => ({
      ...current,
      branches: current.branches.map(
        (branch) => {
          if (branch.id !== branchId) {
            return branch;
          }

          const exists =
            branch.members.includes(
              characterId
            );

          return {
            ...branch,
            members: exists
              ? branch.members.filter(
                  (id) =>
                    id !== characterId
                )
              : [
                  ...branch.members,
                  characterId,
                ],
          };
        }
      ),
    }));
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">
            WORLD BUILDING
          </div>

          <h1>Organizations</h1>

          <p>
            Build organizations, branches
            and their members.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={startNew}
        >
          + New Organization
        </Button>
      </div>

      {editing && draft ? (
        <section className="form-section glow-card">
          <SectionTitle
            symbol="♜"
            title={
              draft.name ||
              "New Organization"
            }
          />

          <div className="form-grid">
            <label className="field field-wide">
              <span>Name</span>

              <input
                value={draft.name}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    name: e.target.value,
                  })
                }
              />
            </label>

            <label className="field field-wide">
              <span>Description</span>

              <textarea
                value={
                  draft.description
                }
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    description:
                      e.target.value,
                  })
                }
              />
            </label>
          </div>

          <div className="branch-list">
            <div className="section-inline-header">
              <h3>Branches</h3>

              <Button
                onClick={addBranch}
              >
                + Add Branch
              </Button>
            </div>

            {draft.branches.map(
              (branch) => (
                <div
                  className="branch glow-card"
                  key={branch.id}
                >
                  <div className="form-grid">
                    <label className="field">
                      <span>
                        Branch name
                      </span>

                      <input
                        value={branch.name}
                        onChange={(e) =>
                          updateBranch(
                            branch.id,
                            "name",
                            e.target.value
                          )
                        }
                      />
                    </label>

                    <label className="field">
                      <span>
                        Description
                      </span>

                      <input
                        value={
                          branch.description
                        }
                        onChange={(e) =>
                          updateBranch(
                            branch.id,
                            "description",
                            e.target.value
                          )
                        }
                      />
                    </label>
                  </div>

                  <h4>
                    Members
                  </h4>

                  <div className="member-selector">
                    {characters.map(
                      (character) => {
                        const selected =
                          branch.members.includes(
                            character.id
                          );

                        return (
                          <button
                            type="button"
                            key={character.id}
                            className={
                              selected
                                ? "member-option selected"
                                : "member-option"
                            }
                            onClick={() =>
                              toggleMember(
                                branch.id,
                                character.id
                              )
                            }
                          >
                            <strong>
                              {
                                character.name
                              }{" "}
                              {
                                character.lastName
                              }
                            </strong>

                            <span>
                              {selected
                                ? "Assigned"
                                : "Add"}
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              )
            )}
          </div>

          <div className="bottom-save">
            <Button
              onClick={() => {
                setEditing(null);
                setDraft(null);
              }}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              onClick={save}
            >
              Save Organization
            </Button>
          </div>
        </section>
      ) : organizations.length ===
        0 ? (
        <EmptyState
          symbol="♜"
          title="No organizations yet"
          text="Create an organization and start building its branches."
          action={
            <Button
              variant="primary"
              onClick={startNew}
            >
              + Create Organization
            </Button>
          }
        />
      ) : (
        <div className="organization-grid">
          {organizations.map(
            (organization) => (
              <article
                className="organization-card glow-card"
                key={organization.id}
              >
                <div className="organization-card-content">
                  <span className="card-symbol">
                    ♜
                  </span>

                  <h2>
                    {organization.name ||
                      "Unnamed organization"}
                  </h2>

                  <p>
                    {
                      organization.description
                    }
                  </p>

                  <div className="organization-meta">
                    <span>
                      {
                        organization.branches
                          .length
                      }{" "}
                      branches
                    </span>

                    <span>
                      {
                        organization.members
                          .length
                      }{" "}
                      members
                    </span>
                  </div>

                  <div className="character-card-actions">
                    <Button
                      onClick={() =>
                        startEdit(
                          organization
                        )
                      }
                    >
                      Edit
                    </Button>

                    <Button
                      variant="danger"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Delete this organization?"
                          )
                        ) {
                          onDelete(
                            organization.id
                          );
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </article>
            )
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   LORE
========================================================= */

function LorePage({
  lore,
  onSave,
  onDelete,
}) {
  const [draft, setDraft] =
    useState(null);

  function create() {
    setDraft(emptyLore());
  }

  function save() {
    onSave(draft);
    setDraft(null);
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">
            WORLD BUILDING
          </div>

          <h1>Lore</h1>

          <p>
            Keep your world information
            organized.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={create}
        >
          + New Lore Entry
        </Button>
      </div>

      {draft ? (
        <section className="form-section glow-card">
          <SectionTitle
            symbol="✒"
            title="Lore Entry"
          />

          <div className="form-grid">
            <label className="field">
              <span>Title</span>

              <input
                value={draft.title}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    title: e.target.value,
                  })
                }
              />
            </label>

            <label className="field">
              <span>Category</span>

              <input
                value={draft.category}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    category:
                      e.target.value,
                  })
                }
              />
            </label>

            <label className="field field-wide">
              <span>Content</span>

              <textarea
                className="large-textarea"
                value={draft.content}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    content:
                      e.target.value,
                  })
                }
              />
            </label>
          </div>

          <div className="bottom-save">
            <Button
              onClick={() =>
                setDraft(null)
              }
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              onClick={save}
            >
              Save Entry
            </Button>
          </div>
        </section>
      ) : lore.length === 0 ? (
        <EmptyState
          symbol="✒"
          title="No lore yet"
          text="Create your first lore entry."
          action={
            <Button
              variant="primary"
              onClick={create}
            >
              + Create Lore
            </Button>
          }
        />
      ) : (
        <div className="lore-grid">
          {lore.map((entry) => (
            <article
              className="lore-card glow-card"
              key={entry.id}
            >
              <span className="lore-category">
                {entry.category}
              </span>

              <h2>
                {entry.title ||
                  "Untitled"}
              </h2>

              <p>
                {entry.content ||
                  "Empty lore entry."}
              </p>

              <div className="character-card-actions">
                <Button
                  onClick={() =>
                    setDraft(
                      JSON.parse(
                        JSON.stringify(entry)
                      )
                    )
                  }
                >
                  Edit
                </Button>

                <Button
                  variant="danger"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Delete this lore entry?"
                      )
                    ) {
                      onDelete(
                        entry.id
                      );
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   IMPORT / EXPORT
========================================================= */

function DataPage({
  characters,
  organizations,
  lore,
  onImport,
}) {
  const inputRef = useRef(null);

  function exportData() {
    downloadJSON(
      "oc-archive-backup.json",
      {
        version: 1,
        exportedAt:
          new Date().toISOString(),
        characters,
        organizations,
        lore,
      }
    );
  }

  function importData(event) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      try {
        const data = JSON.parse(
          reader.result
        );

        onImport(data);

        alert(
          "Archive imported successfully."
        );
      } catch {
        alert(
          "This file is not a valid OC Archive backup."
        );
      }
    };

    reader.readAsText(file);

    event.target.value = "";
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">
            DATA
          </div>

          <h1>Import / Export</h1>

          <p>
            Back up your entire archive or
            restore it later.
          </p>
        </div>
      </div>

      <div className="import-export-grid">
        <section className="data-card glow-card">
          <div className="data-icon">
            ↓
          </div>

          <h2>Export Archive</h2>

          <p>
            Download all characters,
            organizations and lore as a
            JSON backup.
          </p>

          <Button
            variant="primary"
            onClick={exportData}
          >
            Export JSON
          </Button>
        </section>

        <section className="data-card glow-card">
          <div className="data-icon">
            ↑
          </div>

          <h2>Import Archive</h2>

          <p>
            Restore an archive from a JSON
            backup.
          </p>

          <input
            ref={inputRef}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={importData}
          />

          <Button
            variant="primary"
            onClick={() =>
              inputRef.current?.click()
            }
          >
            Import JSON
          </Button>
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   APP
========================================================= */

export default function App() {
  const [characters, setCharacters] =
    useState(() =>
      loadJSON(
        "oc-characters",
        []
      )
    );

  const [organizations, setOrganizations] =
    useState(() =>
      loadJSON(
        "oc-organizations",
        []
      )
    );

  const [lore, setLore] =
    useState(() =>
      loadJSON("oc-lore", [])
    );

  const [themeId, setThemeId] =
    useState(getTheme());

  const [route, setRoute] =
    useState("home");

  const [search, setSearch] =
    useState("");

  /* -----------------------------------------
     AUTO SAVE
  ----------------------------------------- */

  useEffect(() => {
    localStorage.setItem(
      "oc-characters",
      JSON.stringify(characters)
    );
  }, [characters]);

  useEffect(() => {
    localStorage.setItem(
      "oc-organizations",
      JSON.stringify(
        organizations
      )
    );
  }, [organizations]);

  useEffect(() => {
    localStorage.setItem(
      "oc-lore",
      JSON.stringify(lore)
    );
  }, [lore]);

  /* -----------------------------------------
     THEME
  ----------------------------------------- */

  function changeTheme(id) {
    setThemeId(id);
    applyTheme(id);
  }

  const currentTheme =
    THEMES.find(
      (theme) => theme.id === themeId
    ) || THEMES[0];

  /* -----------------------------------------
     NAVIGATION
  ----------------------------------------- */

  function go(destination) {
    setRoute(destination);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* -----------------------------------------
     CHARACTERS
  ----------------------------------------- */

  function saveCharacter(character) {
    setCharacters((current) => {
      const exists = current.some(
        (item) =>
          item.id === character.id
      );

      if (exists) {
        return current.map((item) =>
          item.id === character.id
            ? character
            : item
        );
      }

      return [
        ...current,
        character,
      ];
    });

    go("characters");
  }

  function deleteCharacter(id) {
    setCharacters((current) =>
      current.filter(
        (character) =>
          character.id !== id
      )
    );

    setOrganizations((current) =>
      current.map((organization) => ({
        ...organization,
        members:
          organization.members.filter(
            (memberId) =>
              memberId !== id
          ),
        branches:
          organization.branches.map(
            (branch) => ({
              ...branch,
              members:
                branch.members.filter(
                  (memberId) =>
                    memberId !== id
                ),
            })
          ),
      }))
    );

    go("characters");
  }

  /* -----------------------------------------
     ORGANIZATIONS
  ----------------------------------------- */

  function saveOrganization(
    organization
  ) {
    setOrganizations((current) => {
      const exists = current.some(
        (item) =>
          item.id ===
          organization.id
      );

      if (exists) {
        return current.map((item) =>
          item.id ===
          organization.id
            ? organization
            : item
        );
      }

      return [
        ...current,
        organization,
      ];
    });
  }

  function deleteOrganization(id) {
    setOrganizations((current) =>
      current.filter(
        (organization) =>
          organization.id !== id
      )
    );

    setCharacters((current) =>
      current.map((character) => ({
        ...character,
        organizations:
          character.organizations.filter(
            (organizationId) =>
              organizationId !== id
          ),
      }))
    );
  }

  /* -----------------------------------------
     LORE
  ----------------------------------------- */

  function saveLore(entry) {
    setLore((current) => {
      const exists = current.some(
        (item) =>
          item.id === entry.id
      );

      if (exists) {
        return current.map((item) =>
          item.id === entry.id
            ? entry
            : item
        );
      }

      return [
        ...current,
        entry,
      ];
    });
  }

  function deleteLore(id) {
    setLore((current) =>
      current.filter(
        (entry) =>
          entry.id !== id
      )
    );
  }

  /* -----------------------------------------
     IMPORT
  ----------------------------------------- */

  function importArchive(data) {
    if (
      Array.isArray(
        data.characters
      )
    ) {
      setCharacters(
        data.characters
      );
    }

    if (
      Array.isArray(
        data.organizations
      )
    ) {
      setOrganizations(
        data.organizations
      );
    }

    if (Array.isArray(data.lore)) {
      setLore(data.lore);
    }

    go("home");
  }

  /* -----------------------------------------
     ROUTING
  ----------------------------------------- */

  let content;

  if (route === "home") {
    content = (
      <HomePage
        characters={characters}
        organizations={
          organizations
        }
        lore={lore}
        theme={currentTheme}
        onTheme={changeTheme}
        go={go}
      />
    );
  } else if (route === "characters") {
    content = (
      <CharactersPage
        characters={characters}
        search={search}
        setSearch={setSearch}
        go={go}
        deleteCharacter={
          deleteCharacter
        }
      />
    );
  } else if (
    route === "character-new"
  ) {
    content = (
      <CharacterEditor
        initialCharacter={
          emptyCharacter()
        }
        characters={characters}
        organizations={
          organizations
        }
        onSave={saveCharacter}
        onCancel={() =>
          go("characters")
        }
      />
    );
  } else if (
    route.startsWith("character-")
  ) {
    const id =
      route.replace(
        "character-",
        ""
      );

    const character =
      characters.find(
        (item) => item.id === id
      );

    if (!character) {
      content = (
        <EmptyState
          title="Character not found"
          text="This character no longer exists."
          action={
            <Button
              onClick={() =>
                go("characters")
              }
            >
              Back to Characters
            </Button>
          }
        />
      );
    } else {
      content = (
        <CharacterProfile
          character={character}
          characters={characters}
          organizations={
            organizations
          }
          go={go}
          onEdit={() =>
            go(
              `character-edit-${character.id}`
            )
          }
        />
      );
    }
  } else if (
    route.startsWith("character-edit-")
  ) {
    const id =
      route.replace(
        "character-edit-",
        ""
      );

    const character =
      characters.find(
        (item) => item.id === id
      );

    if (!character) {
      content = (
        <EmptyState
          title="Character not found"
          text="This character no longer exists."
          action={
            <Button
              onClick={() =>
                go("characters")
              }
            >
              Back
            </Button>
          }
        />
      );
    } else {
      content = (
        <CharacterEditor
          initialCharacter={character}
          characters={characters}
          organizations={
            organizations
          }
          onSave={saveCharacter}
          onCancel={() =>
            go(
              `character-${character.id}`
            )
          }
        />
      );
    }
  } else if (
    route === "organizations"
  ) {
    content = (
      <OrganizationsPage
        organizations={
          organizations
        }
        characters={characters}
        onSave={saveOrganization}
        onDelete={
          deleteOrganization
        }
      />
    );
  } else if (route === "lore") {
    content = (
      <LorePage
        lore={lore}
        onSave={saveLore}
        onDelete={deleteLore}
      />
    );
  } else if (route === "data") {
    content = (
      <DataPage
        characters={characters}
        organizations={
          organizations
        }
        lore={lore}
        onImport={importArchive}
      />
    );
  } else {
    content = (
      <HomePage
        characters={characters}
        organizations={
          organizations
        }
        lore={lore}
        theme={currentTheme}
        onTheme={changeTheme}
        go={go}
      />
    );
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <button
          className="brand"
          onClick={() =>
            go("home")
          }
        >
          <span className="brand-symbol">
            {currentTheme.symbol}
          </span>

          <span>
            <strong>
              OC ARCHIVE
            </strong>

            <small>
              Original Character Database
            </small>
          </span>
        </button>

        <nav className="archive-nav">
          {NAV_ITEMS.map(
            ([id, label]) => (
              <button
                key={id}
                className={
                  route === id
                    ? "nav-active"
                    : ""
                }
                onClick={() =>
                  go(id)
                }
              >
                {label}
              </button>
            )
          )}
        </nav>

        <div className="theme-picker">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              className={
                themeId === theme.id
                  ? "theme-dot active"
                  : "theme-dot"
              }
              title={theme.name}
              onClick={() =>
                changeTheme(theme.id)
              }
            >
              {theme.symbol}
            </button>
          ))}
        </div>
      </header>

      <main className="main-content">
        {content}
      </main>

      <footer className="footer">
        <span>OC ARCHIVE</span>
        <span>
          Saved automatically in this browser
        </span>
      </footer>
    </div>
  );
}
