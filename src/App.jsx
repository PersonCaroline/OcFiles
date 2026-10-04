import { useEffect, useMemo, useRef, useState } from "react";
import { THEMES, applyTheme, getTheme } from "./themes";

/* =========================================================
   DATA
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
  "Friend",
  "Enemy",
  "Lover",
  "Ex-lover",
  "Colleague",
  "Rival",
  "Acquaintance",
  "Other",
];

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

  fears: "",
  sickness: "",
  addictions: "",
  likes: "",
  dislikes: "",

  personality: Object.fromEntries(
    PERSONALITY_STATS.map(([id]) => [id, 3])
  ),

  skills: Object.fromEntries(
    SKILLS.map((skill) => [skill, 3])
  ),

  socialStats: Object.fromEntries(
    SOCIAL_STATS.map((stat) => [stat, 3])
  ),

  relationships: [],
  moodboard: [],
};

const emptyOrganization = {
  name: "",
  description: "",
  image: "",
  branches: [],
};

const emptyLore = {
  title: "",
  category: "",
  content: "",
};

/* =========================================================
   HELPERS
   ========================================================= */

function makeId(prefix = "item") {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function normalizeCharacter(character = {}) {
  return {
    ...emptyCharacter,
    ...character,

    personality: {
      ...emptyCharacter.personality,
      ...(character.personality || {}),
    },

    skills: {
      ...emptyCharacter.skills,
      ...(character.skills || {}),
    },

    socialStats: {
      ...emptyCharacter.socialStats,
      ...(character.socialStats || {}),
    },

    relationships: Array.isArray(character.relationships)
      ? character.relationships
      : [],

    moodboard: Array.isArray(character.moodboard)
      ? character.moodboard
      : [],
  };
}

function normalizeOrganization(organization = {}) {
  return {
    ...emptyOrganization,
    ...organization,
    branches: Array.isArray(organization.branches)
      ? organization.branches.map((branch) => ({
          id: branch.id || makeId("branch"),
          name: branch.name || "",
          description: branch.description || "",
          members: Array.isArray(branch.members)
            ? branch.members
            : [],
        }))
      : [],
  };
}

function normalizeLore(entry = {}) {
  return {
    ...emptyLore,
    ...entry,
  };
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}

function getStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);

    if (!value) return fallback;

    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn(`Unable to save ${key}`);
  }
}

/* =========================================================
   SMALL UI COMPONENTS
   ========================================================= */

function Section({ title, children, className = "" }) {
  return (
    <section className={`form-section glow-card ${className}`}>
      <div className="section-title">
        <span className="section-icon">✦</span>
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
        value={value ?? ""}
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
  wide = true,
}) {
  return (
    <label className={wide ? "field field-wide" : "field"}>
      <span>{label}</span>

      <textarea
        value={value ?? ""}
        placeholder={placeholder}
        rows={5}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
  wide = false,
}) {
  return (
    <label className={wide ? "field field-wide" : "field"}>
      <span>{label}</span>

      <select
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </label>
  );
}

function StatBar({
  leftLabel,
  rightLabel,
  value = 3,
  onChange,
  readonly = false,
}) {
  return (
    <div className="stat-row">
      <div className="stat-label left">{leftLabel}</div>

      <div className="stat-pips">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            type="button"
            disabled={readonly}
            className={
              level === value
                ? "stat-pip active"
                : "stat-pip"
            }
            onClick={() => !readonly && onChange(level)}
          >
            {level}
          </button>
        ))}
      </div>

      <div className="stat-label right">{rightLabel}</div>
    </div>
  );
}

function SkillBar({
  label,
  value = 3,
  onChange,
  readonly = false,
}) {
  return (
    <div className="skill-row">
      <span className="skill-name">{label}</span>

      <div className="skill-pips">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            type="button"
            disabled={readonly}
            aria-label={`${label}: ${level}/5`}
            className={
              level <= value
                ? "skill-pip active"
                : "skill-pip"
            }
            onClick={() => !readonly && onChange(level)}
          />
        ))}
      </div>

      <span className="skill-value">{value}/5</span>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="info-field">
      <span className="info-label">{label}</span>
      <strong>{value || "—"}</strong>
    </div>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div className="info-block field-wide">
      <span className="info-label">{label}</span>
      <p>{value || "—"}</p>
    </div>
  );
}

function EmptyState({
  icon = "✦",
  title,
  text,
  action,
}) {
  return (
    <div className="empty-state glow-card">
      <div className="empty-icon">{icon}</div>

      <h2>{title}</h2>

      {text && <p>{text}</p>}

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
  label = "Image",
}) {
  const inputRef = useRef(null);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      return;
    }

    try {
      const data = await readFileAsDataURL(file);
      onChange(data);
    } catch {
      alert("Unable to load this image.");
    }

    event.target.value = "";
  };

  return (
    <div className="image-upload field-wide">
      <span className="upload-label">{label}</span>

      <div className="upload-area">
        {value ? (
          <img
            src={value}
            alt=""
            className="upload-preview"
          />
        ) : (
          <div className="upload-placeholder">
            <span>✦</span>
            <small>No image selected</small>
          </div>
        )}

        <div className="upload-actions">
          <button
            type="button"
            className="button secondary"
            onClick={() => inputRef.current?.click()}
          >
            Choose image
          </button>

          {value && (
            <button
              type="button"
              className="button danger"
              onClick={() => onChange("")}
            >
              Remove
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          hidden
        />
      </div>
    </div>
  );
}

/* =========================================================
   CHARACTER EDITOR
   ========================================================= */

function CharacterEditor({
  initialCharacter,
  characters,
  onSave,
  onCancel,
}) {
  const [character, setCharacter] = useState(
    normalizeCharacter(initialCharacter)
  );

  const update = (field, value) => {
    setCharacter((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updatePersonality = (id, value) => {
    setCharacter((current) => ({
      ...current,
      personality: {
        ...current.personality,
        [id]: value,
      },
    }));
  };

  const updateSkill = (skill, value) => {
    setCharacter((current) => ({
      ...current,
      skills: {
        ...current.skills,
        [skill]: value,
      },
    }));
  };

  const updateSocialStat = (stat, value) => {
    setCharacter((current) => ({
      ...current,
      socialStats: {
        ...current.socialStats,
        [stat]: value,
      },
    }));
  };

  const addRelationship = () => {
    setCharacter((current) => ({
      ...current,
      relationships: [
        ...current.relationships,
        {
          id: makeId("relationship"),
          characterId: "",
          type: "Friend",
          status: "",
          notes: "",
        },
      ],
    }));
  };

  const updateRelationship = (
    relationshipId,
    field,
    value
  ) => {
    setCharacter((current) => ({
      ...current,
      relationships: current.relationships.map(
        (relationship) =>
          relationship.id === relationshipId
            ? {
                ...relationship,
                [field]: value,
              }
            : relationship
      ),
    }));
  };

  const removeRelationship = (relationshipId) => {
    setCharacter((current) => ({
      ...current,
      relationships: current.relationships.filter(
        (relationship) =>
          relationship.id !== relationshipId
      ),
    }));
  };

  const addMoodboardImage = async (event) => {
    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) return;

    const images = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;

      try {
        const data = await readFileAsDataURL(file);

        images.push({
          id: makeId("mood"),
          src: data,
        });
      } catch {
        // Skip unreadable files.
      }
    }

    setCharacter((current) => ({
      ...current,
      moodboard: [
        ...current.moodboard,
        ...images,
      ],
    }));

    event.target.value = "";
  };

  const removeMoodboardImage = (id) => {
    setCharacter((current) => ({
      ...current,
      moodboard: current.moodboard.filter(
        (image) => image.id !== id
      ),
    }));
  };

  const submit = (event) => {
    event.preventDefault();

    if (!character.name.trim()) {
      alert("Please give your character a name.");
      return;
    }

    onSave({
      ...character,
      name: character.name.trim(),
      id: character.id || makeId("character"),
    });
  };

  const selectableCharacters = characters.filter(
    (other) => other.id !== character.id
  );

  return (
    <form
      className="creator-page character-editor"
      onSubmit={submit}
    >
      <div className="creator-header">
        <div>
          <p className="eyebrow">
            {character.id
              ? "EDIT CHARACTER"
              : "NEW CHARACTER"}
          </p>

          <h1>
            {character.id
              ? character.name || "Character"
              : "Create an OC"}
          </h1>

          <p className="muted">
            Build the complete character sheet.
            Everything is saved locally when you save.
          </p>
        </div>

        <button
          type="button"
          className="button secondary"
          onClick={onCancel}
        >
          ← Back
        </button>
      </div>

      <Section title="Identity">
        <Field
          label="First name"
          value={character.name}
          onChange={(value) => update("name", value)}
          placeholder="First name"
        />

        <Field
          label="Last name"
          value={character.lastName}
          onChange={(value) =>
            update("lastName", value)
          }
          placeholder="Last name"
        />

        <Field
          label="Nickname(s)"
          value={character.nickname}
          onChange={(value) =>
            update("nickname", value)
          }
          placeholder="Nicknames / aliases"
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
          onChange={(value) =>
            update("gender", value)
          }
          placeholder="Gender"
        />

        <Field
          label="Pronouns"
          value={character.pronouns}
          onChange={(value) =>
            update("pronouns", value)
          }
          placeholder="she/her"
        />

        <Field
          label="Sexuality"
          value={character.sexuality}
          onChange={(value) =>
            update("sexuality", value)
          }
          placeholder="Sexuality"
        />

        <Field
          label="Date of birth"
          value={character.dateOfBirth}
          onChange={(value) =>
            update("dateOfBirth", value)
          }
          type="date"
        />

        <Field
          label="Nationality"
          value={character.nationality}
          onChange={(value) =>
            update("nationality", value)
          }
          placeholder="Nationality"
        />

        <Field
          label="Origins"
          value={character.origins}
          onChange={(value) =>
            update("origins", value)
          }
          placeholder="Origins"
        />

        <Field
          label="Species / Race"
          value={character.species}
          onChange={(value) =>
            update("species", value)
          }
          placeholder="Human, vampire..."
        />
      </Section>

      <Section title="Status">
        <SelectField
          label="Current status"
          value={character.status}
          onChange={(value) =>
            update("status", value)
          }
        >
          <option value="alive">Alive</option>
          <option value="dead">Dead</option>
          <option value="unknown">Unknown</option>
        </SelectField>

        <Field
          label="Later status"
          value={character.laterStatus}
          onChange={(value) =>
            update("laterStatus", value)
          }
          placeholder="Future status / fate"
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
          onChange={(value) =>
            update("sideJob", value)
          }
          placeholder="Optional"
        />

        <Field
          label="Affiliation"
          value={character.affiliation}
          onChange={(value) =>
            update("affiliation", value)
          }
          placeholder="Current organization"
        />

        <Field
          label="Past affiliation"
          value={character.pastAffiliation}
          onChange={(value) =>
            update("pastAffiliation", value)
          }
          placeholder="Previous organization"
        />

        <Field
          label="Rank"
          value={character.rank}
          onChange={(value) =>
            update("rank", value)
          }
          placeholder="Current rank"
        />

        <Field
          label="Past rank"
          value={character.pastRank}
          onChange={(value) =>
            update("pastRank", value)
          }
          placeholder="Previous rank"
        />
      </Section>

      <Section title="Appearance">
        <ImageUpload
          label="Character portrait"
          value={character.image}
          onChange={(value) =>
            update("image", value)
          }
        />

        <Field
          label="Height"
          value={character.height}
          onChange={(value) =>
            update("height", value)
          }
          placeholder="175 cm"
        />

        <Field
          label="Weight"
          value={character.weight}
          onChange={(value) =>
            update("weight", value)
          }
          placeholder="65 kg"
        />

        <Field
          label="Eye color"
          value={character.eyeColor}
          onChange={(value) =>
            update("eyeColor", value)
          }
          placeholder="Eye color"
        />

        <Field
          label="Hair color"
          value={character.hairColor}
          onChange={(value) =>
            update("hairColor", value)
          }
          placeholder="Hair color"
        />

        <Field
          label="Hair style"
          value={character.hairStyle}
          onChange={(value) =>
            update("hairStyle", value)
          }
          placeholder="Hair style"
        />
      </Section>

      <Section title="Ability">
        <Field
          label="Ability"
          value={character.ability}
          onChange={(value) =>
            update("ability", value)
          }
          placeholder="Ability name"
        />

        <Field
          label="Weapon"
          value={character.weapon}
          onChange={(value) =>
            update("weapon", value)
          }
          placeholder="Weapon"
        />

        <Field
          label="MBTI"
          value={character.mbti}
          onChange={(value) =>
            update("mbti", value)
          }
          placeholder="INTJ"
        />

        <TextField
          label="Ability description"
          value={character.abilityDescription}
          onChange={(value) =>
            update("abilityDescription", value)
          }
          placeholder="How does the ability work?"
        />

        <TextField
          label="Side effects & risks"
          value={character.sideEffects}
          onChange={(value) =>
            update("sideEffects", value)
          }
          placeholder="Limitations, consequences, risks..."
        />
      </Section>

      <Section title="Personality">
        <div className="stats-panel field-wide">
          {PERSONALITY_STATS.map(
            ([id, left, right]) => (
              <StatBar
                key={id}
                leftLabel={left}
                rightLabel={right}
                value={
                  character.personality[id]
                }
                onChange={(value) =>
                  updatePersonality(id, value)
                }
              />
            )
          )}
        </div>
      </Section>

      <Section title="Skills">
        <div className="stats-panel field-wide">
          {SKILLS.map((skill) => (
            <SkillBar
              key={skill}
              label={skill}
              value={character.skills[skill]}
              onChange={(value) =>
                updateSkill(skill, value)
              }
            />
          ))}
        </div>
      </Section>

      <Section title="Social Stats">
        <div className="stats-panel field-wide">
          {SOCIAL_STATS.map((stat) => (
            <SkillBar
              key={stat}
              label={stat}
              value={
                character.socialStats[stat]
              }
              onChange={(value) =>
                updateSocialStat(stat, value)
              }
            />
          ))}
        </div>
      </Section>

      <Section title="Personal">
        <TextField
          label="Fears"
          value={character.fears}
          onChange={(value) =>
            update("fears", value)
          }
          placeholder="What are they afraid of?"
        />

        <TextField
          label="Sickness / Health"
          value={character.sickness}
          onChange={(value) =>
            update("sickness", value)
          }
          placeholder="Illnesses, vulnerabilities..."
        />

        <TextField
          label="Addictions"
          value={character.addictions}
          onChange={(value) =>
            update("addictions", value)
          }
          placeholder="Addictions or dependencies..."
        />

        <TextField
          label="Likes"
          value={character.likes}
          onChange={(value) =>
            update("likes", value)
          }
          placeholder="Things they like..."
        />

        <TextField
          label="Dislikes"
          value={character.dislikes}
          onChange={(value) =>
            update("dislikes", value)
          }
          placeholder="Things they dislike..."
        />
      </Section>

      <Section title="Relationships">
        <div className="relationship-editor field-wide">
          {character.relationships.length === 0 && (
            <div className="empty-mini">
              No relationships yet.
            </div>
          )}

          {character.relationships.map(
            (relationship) => (
              <div
                className="relationship-edit-row"
                key={relationship.id}
              >
                <select
                  value={
                    relationship.characterId
                  }
                  onChange={(event) =>
                    updateRelationship(
                      relationship.id,
                      "characterId",
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Select character
                  </option>

                  {selectableCharacters.map(
                    (other) => (
                      <option
                        key={other.id}
                        value={other.id}
                      >
                        {other.name}
                        {other.lastName
                          ? ` ${other.lastName}`
                          : ""}
                      </option>
                    )
                  )}
                </select>

                <select
                  value={relationship.type}
                  onChange={(event) =>
                    updateRelationship(
                      relationship.id,
                      "type",
                      event.target.value
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

                <input
                  value={relationship.status}
                  onChange={(event) =>
                    updateRelationship(
                      relationship.id,
                      "status",
                      event.target.value
                    )
                  }
                  placeholder="Status / dynamic"
                />

                <input
                  value={relationship.notes}
                  onChange={(event) =>
                    updateRelationship(
                      relationship.id,
                      "notes",
                      event.target.value
                    )
                  }
                  placeholder="Notes"
                />

                <button
                  type="button"
                  className="button danger small"
                  onClick={() =>
                    removeRelationship(
                      relationship.id
                    )
                  }
                >
                  ×
                </button>
              </div>
            )
          )}

          <button
            type="button"
            className="button secondary"
            onClick={addRelationship}
          >
            + Add relationship
          </button>
        </div>
      </Section>

      <Section title="Moodboard">
        <div className="moodboard-editor field-wide">
          <label className="button secondary upload-button">
            + Add images
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={addMoodboardImage}
              hidden
            />
          </label>

          {character.moodboard.length > 0 ? (
            <div className="moodboard-grid">
              {character.moodboard.map((image) => (
                <div
                  className="moodboard-item"
                  key={image.id}
                >
                  <img
                    src={image.src}
                    alt=""
                  />

                  <button
                    type="button"
                    className="moodboard-remove"
                    onClick={() =>
                      removeMoodboardImage(
                        image.id
                      )
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-mini">
              Add several images to create a moodboard.
            </div>
          )}
        </div>
      </Section>

      <div className="creator-actions">
        <button
          type="button"
          className="button secondary"
          onClick={onCancel}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="button primary"
        >
          Save character
        </button>
      </div>
    </form>
  );
}

/* =========================================================
   CHARACTER PROFILE
   ========================================================= */

function CharacterProfile({
  character,
  characters,
  onEdit,
  onBack,
}) {
  const getCharacterName = (id) => {
    const other = characters.find(
      (item) => item.id === id
    );

    if (!other) return "Unknown character";

    return `${other.name}${
      other.lastName
        ? ` ${other.lastName}`
        : ""
    }`;
  };

  return (
    <main className="profile-page">
      <div className="profile-topbar">
        <button
          className="button secondary"
          onClick={onBack}
          type="button"
        >
          ← Archive
        </button>

        <button
          className="button primary"
          onClick={onEdit}
          type="button"
        >
          Edit character
        </button>
      </div>

      <section className="profile-hero glow-card">
        <div className="profile-image">
          {character.image ? (
            <img
              src={character.image}
              alt=""
            />
          ) : (
            <div className="profile-image-empty">
              ✦
            </div>
          )}
        </div>

        <div className="profile-identity">
          <p className="eyebrow">
            ORIGINAL CHARACTER
          </p>

          <h1>
            {character.name}
            {character.lastName
              ? ` ${character.lastName}`
              : ""}
          </h1>

          {character.nickname && (
            <p className="profile-nickname">
              “{character.nickname}”
            </p>
          )}

          <div className="profile-badges">
            <span
              className={`status-badge ${character.status}`}
            >
              {character.status}
            </span>

            {character.age && (
              <span className="tag">
                {character.age} years
              </span>
            )}

            {character.mbti && (
              <span className="tag">
                {character.mbti}
              </span>
            )}

            {character.species && (
              <span className="tag">
                {character.species}
              </span>
            )}
          </div>
        </div>
      </section>

      <Section title="Identity">
        <Info
          label="First name"
          value={character.name}
        />
        <Info
          label="Last name"
          value={character.lastName}
        />
        <Info
          label="Nickname(s)"
          value={character.nickname}
        />
        <Info
          label="Age"
          value={character.age}
        />
        <Info
          label="Gender"
          value={character.gender}
        />
        <Info
          label="Pronouns"
          value={character.pronouns}
        />
        <Info
          label="Sexuality"
          value={character.sexuality}
        />
        <Info
          label="Date of birth"
          value={character.dateOfBirth}
        />
        <Info
          label="Nationality"
          value={character.nationality}
        />
        <Info
          label="Origins"
          value={character.origins}
        />
        <Info
          label="Species / Race"
          value={character.species}
        />
      </Section>

      <Section title="Status">
        <Info
          label="Current status"
          value={character.status}
        />
        <Info
          label="Later status"
          value={character.laterStatus}
        />
      </Section>

      <Section title="Occupation & Affiliations">
        <Info label="Job" value={character.job} />
        <Info
          label="Side job"
          value={character.sideJob}
        />
        <Info
          label="Affiliation"
          value={character.affiliation}
        />
        <Info
          label="Past affiliation"
          value={character.pastAffiliation}
        />
        <Info
          label="Rank"
          value={character.rank}
        />
        <Info
          label="Past rank"
          value={character.pastRank}
        />
      </Section>

      <Section title="Appearance">
        <Info
          label="Height"
          value={character.height}
        />
        <Info
          label="Weight"
          value={character.weight}
        />
        <Info
          label="Eye color"
          value={character.eyeColor}
        />
        <Info
          label="Hair color"
          value={character.hairColor}
        />
        <Info
          label="Hair style"
          value={character.hairStyle}
        />
      </Section>

      <Section title="Ability">
        <Info
          label="Ability"
          value={character.ability}
        />
        <Info
          label="Weapon"
          value={character.weapon}
        />
        <Info
          label="MBTI"
          value={character.mbti}
        />

        <InfoBlock
          label="Ability description"
          value={character.abilityDescription}
        />

        <InfoBlock
          label="Side effects & risks"
          value={character.sideEffects}
        />
      </Section>

      <Section title="Personality">
        <div className="profile-stats field-wide">
          {PERSONALITY_STATS.map(
            ([id, left, right]) => (
              <StatBar
                key={id}
                leftLabel={left}
                rightLabel={right}
                value={
                  character.personality[id]
                }
                readonly
              />
            )
          )}
        </div>
      </Section>

      <Section title="Skills">
        <div className="profile-stats field-wide">
          {SKILLS.map((skill) => (
            <SkillBar
              key={skill}
              label={skill}
              value={character.skills[skill]}
              readonly
            />
          ))}
        </div>
      </Section>

      <Section title="Social Stats">
        <div className="profile-stats field-wide">
          {SOCIAL_STATS.map((stat) => (
            <SkillBar
              key={stat}
              label={stat}
              value={
                character.socialStats[stat]
              }
              readonly
            />
          ))}
        </div>
      </Section>

      <Section title="Personal">
        <InfoBlock
          label="Fears"
          value={character.fears}
        />
        <InfoBlock
          label="Sickness / Health"
          value={character.sickness}
        />
        <InfoBlock
          label="Addictions"
          value={character.addictions}
        />
        <InfoBlock
          label="Likes"
          value={character.likes}
        />
        <InfoBlock
          label="Dislikes"
          value={character.dislikes}
        />
      </Section>

      <Section title="Relationships">
        <div className="relationship-list field-wide">
          {character.relationships.length === 0 ? (
            <p className="muted">
              No relationships recorded.
            </p>
          ) : (
            character.relationships.map(
              (relationship) => (
                <div
                  className="relationship-card"
                  key={relationship.id}
                >
                  <strong>
                    {getCharacterName(
                      relationship.characterId
                    )}
                  </strong>

                  <span>
                    {relationship.type}
                  </span>

                  {relationship.status && (
                    <small>
                      {relationship.status}
                    </small>
                  )}

                  {relationship.notes && (
                    <p>
                      {relationship.notes}
                    </p>
                  )}
                </div>
              )
            )
          )}
        </div>
      </Section>

      <Section title="Moodboard">
        <div className="moodboard-display field-wide">
          {character.moodboard.length === 0 ? (
            <p className="muted">
              No moodboard images.
            </p>
          ) : (
            character.moodboard.map((image) => (
              <img
                key={image.id}
                src={image.src}
                alt=""
              />
            ))
          )}
        </div>
      </Section>
    </main>
  );
}

/* =========================================================
   CHARACTER CARD
   ========================================================= */

function CharacterCard({
  character,
  onOpen,
  onEdit,
  onDelete,
}) {
  return (
    <article className="character-card glow-card">
      <button
        className="character-card-main"
        type="button"
        onClick={() => onOpen(character.id)}
      >
        <div className="character-card-image">
          {character.image ? (
            <img
              src={character.image}
              alt=""
            />
          ) : (
            <div className="character-card-placeholder">
              ✦
            </div>
          )}
        </div>

        <div className="character-card-body">
          <div className="character-card-top">
            <span
              className={`status-badge ${character.status}`}
            >
              {character.status}
            </span>

            {character.age && (
              <span className="card-age">
                {character.age}
              </span>
            )}
          </div>

          <h2>
            {character.name}
            {character.lastName
              ? ` ${character.lastName}`
              : ""}
          </h2>

          {character.nickname && (
            <p className="card-nickname">
              {character.nickname}
            </p>
          )}

          <div className="card-tags">
            {character.affiliation && (
              <span>{character.affiliation}</span>
            )}

            {character.job && (
              <span>{character.job}</span>
            )}

            {character.species && (
              <span>{character.species}</span>
            )}
          </div>
        </div>
      </button>

      <div className="character-card-actions">
        <button
          type="button"
          className="button secondary"
          onClick={() => onEdit(character)}
        >
          Edit
        </button>

        <button
          type="button"
          className="button danger"
          onClick={() =>
            onDelete(character.id)
          }
        >
          Delete
        </button>
      </div>
    </article>
  );
}

/* =========================================================
   CHARACTERS PAGE
   ========================================================= */

function CharactersPage({
  characters,
  search,
  setSearch,
  onCreate,
  onOpen,
  onEdit,
  onDelete,
}) {
  const filteredCharacters = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return characters;

    return characters.filter((character) => {
      const searchable = [
        character.name,
        character.lastName,
        character.nickname,
        character.affiliation,
        character.job,
        character.species,
        character.nationality,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [characters, search]);

  return (
    <main className="archive-page">
      <div className="archive-header">
        <div>
          <p className="eyebrow">
            CHARACTER ARCHIVE
          </p>

          <h1>Characters</h1>

          <p className="muted">
            {characters.length} character
            {characters.length !== 1 ? "s" : ""}
            {" "}in the archive.
          </p>
        </div>

        <button
          className="button primary large"
          type="button"
          onClick={onCreate}
        >
          + New character
        </button>
      </div>

      <div className="archive-tools">
        <label className="search-box">
          <span>⌕</span>

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search characters..."
          />
        </label>
      </div>

      {characters.length === 0 ? (
        <EmptyState
          icon="✦"
          title="Your archive is empty"
          text="Create your first original character to start building your database."
          action={
            <button
              className="button primary"
              type="button"
              onClick={onCreate}
            >
              Create first character
            </button>
          }
        />
      ) : filteredCharacters.length === 0 ? (
        <EmptyState
          icon="⌕"
          title="No characters found"
          text="Try another search."
        />
      ) : (
        <div className="character-grid">
          {filteredCharacters.map(
            (character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onOpen={onOpen}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            )
          )}
        </div>
      )}
    </main>
  );
}

/* =========================================================
   ORGANIZATIONS
   ========================================================= */

function OrganizationCard({
  organization,
  characters,
  onEdit,
  onDelete,
}) {
  const getCharacter = (id) =>
    characters.find(
      (character) => character.id === id
    );

  return (
    <article className="organization-card glow-card">
      <div className="organization-image">
        {organization.image ? (
          <img
            src={organization.image}
            alt=""
          />
        ) : (
          <div>✦</div>
        )}
      </div>

      <div className="organization-body">
        <p className="eyebrow">
          ORGANIZATION
        </p>

        <h2>{organization.name}</h2>

        <p>
          {organization.description ||
            "No description yet."}
        </p>

        <div className="branches-list">
          {organization.branches.length === 0 ? (
            <div className="empty-mini">
              No branches yet.
            </div>
          ) : (
            organization.branches.map(
              (branch) => (
                <div
                  className="branch-card"
                  key={branch.id}
                >
                  <strong>
                    {branch.name ||
                      "Unnamed branch"}
                  </strong>

                  {branch.description && (
                    <p>
                      {branch.description}
                    </p>
                  )}

                  <small>
                    {branch.members.length} member
                    {branch.members.length !== 1
                      ? "s"
                      : ""}
                  </small>

                  {branch.members.length > 0 && (
                    <div className="member-tags">
                      {branch.members.map(
                        (id) => {
                          const character =
                            getCharacter(id);

                          return (
                            <span
                              key={id}
                              className="tag"
                            >
                              {character
                                ? character.name
                                : "Unknown"}
                            </span>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>
              )
            )
          )}
        </div>

        <div className="character-card-actions">
          <button
            type="button"
            className="button secondary"
            onClick={() => onEdit(organization)}
          >
            Edit
          </button>

          <button
            type="button"
            className="button danger"
            onClick={() =>
              onDelete(organization.id)
            }
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function OrganizationsPage({
  organizations,
  characters,
  onCreate,
  onEdit,
  onDelete,
}) {
  return (
    <main className="archive-page">
      <div className="archive-header">
        <div>
          <p className="eyebrow">
            WORLD BUILDING
          </p>

          <h1>Organizations</h1>

          <p className="muted">
            Build groups, factions, branches and
            memberships.
          </p>
        </div>

        <button
          className="button primary large"
          type="button"
          onClick={onCreate}
        >
          + New organization
        </button>
      </div>

      {organizations.length === 0 ? (
        <EmptyState
          icon="◇"
          title="No organizations yet"
          text="Create factions, companies, families, institutions or any other groups."
          action={
            <button
              className="button primary"
              type="button"
              onClick={onCreate}
            >
              Create organization
            </button>
          }
        />
      ) : (
        <div className="organization-grid">
          {organizations.map(
            (organization) => (
              <OrganizationCard
                key={organization.id}
                organization={organization}
                characters={characters}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            )
          )}
        </div>
      )}
    </main>
  );
}

/* =========================================================
   ORGANIZATION EDITOR
   ========================================================= */

function OrganizationEditor({
  initialOrganization,
  characters,
  onSave,
  onCancel,
}) {
  const [organization, setOrganization] =
    useState(
      normalizeOrganization(
        initialOrganization
      )
    );

  const update = (field, value) => {
    setOrganization((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const addBranch = () => {
    setOrganization((current) => ({
      ...current,
      branches: [
        ...current.branches,
        {
          id: makeId("branch"),
          name: "",
          description: "",
          members: [],
        },
      ],
    }));
  };

  const updateBranch = (
    branchId,
    field,
    value
  ) => {
    setOrganization((current) => ({
      ...current,
      branches: current.branches.map(
        (branch) =>
          branch.id === branchId
            ? {
                ...branch,
                [field]: value,
              }
            : branch
      ),
    }));
  };

  const removeBranch = (branchId) => {
    setOrganization((current) => ({
      ...current,
      branches: current.branches.filter(
        (branch) =>
          branch.id !== branchId
      ),
    }));
  };

  const toggleMember = (
    branchId,
    characterId
  ) => {
    setOrganization((current) => ({
      ...current,
      branches: current.branches.map(
        (branch) => {
          if (branch.id !== branchId)
            return branch;

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
  };

  const submit = (event) => {
    event.preventDefault();

    if (!organization.name.trim()) {
      alert(
        "Please give the organization a name."
      );
      return;
    }

    onSave({
      ...organization,
      name: organization.name.trim(),
      id:
        organization.id ||
        makeId("organization"),
    });
  };

  return (
    <form
      className="creator-page"
      onSubmit={submit}
    >
      <div className="creator-header">
        <div>
          <p className="eyebrow">
            {organization.id
              ? "EDIT ORGANIZATION"
              : "NEW ORGANIZATION"}
          </p>

          <h1>
            {organization.name ||
              "Organization"}
          </h1>
        </div>

        <button
          type="button"
          className="button secondary"
          onClick={onCancel}
        >
          ← Back
        </button>
      </div>

      <Section title="Organization">
        <Field
          label="Name"
          value={organization.name}
          onChange={(value) =>
            update("name", value)
          }
          placeholder="Organization name"
        />

        <TextField
          label="Description"
          value={organization.description}
          onChange={(value) =>
            update("description", value)
          }
          placeholder="What is this organization?"
        />

        <ImageUpload
          label="Organization image"
          value={organization.image}
          onChange={(value) =>
            update("image", value)
          }
        />
      </Section>

      <Section title="Branches">
        <div className="branch-editor field-wide">
          {organization.branches.length === 0 ? (
            <div className="empty-mini">
              No branches yet.
            </div>
          ) : (
            organization.branches.map(
              (branch) => (
                <div
                  className="branch-editor-card"
                  key={branch.id}
                >
                  <div className="branch-editor-heading">
                    <strong>
                      {branch.name ||
                        "New branch"}
                    </strong>

                    <button
                      type="button"
                      className="button danger small"
                      onClick={() =>
                        removeBranch(
                          branch.id
                        )
                      }
                    >
                      Delete branch
                    </button>
                  </div>

                  <Field
                    label="Branch name"
                    value={branch.name}
                    onChange={(value) =>
                      updateBranch(
                        branch.id,
                        "name",
                        value
                      )
                    }
                    placeholder="Main branch"
                    wide
                  />

                  <TextField
                    label="Description"
                    value={branch.description}
                    onChange={(value) =>
                      updateBranch(
                        branch.id,
                        "description",
                        value
                      )
                    }
                    placeholder="Describe this branch..."
                  />

                  <div className="member-selector">
                    <span className="field-heading">
                      Members
                    </span>

                    {characters.length === 0 ? (
                      <p className="muted">
                        Create characters first.
                      </p>
                    ) : (
                      <div className="member-checkboxes">
                        {characters.map(
                          (character) => (
                            <label
                              className="member-checkbox"
                              key={character.id}
                            >
                              <input
                                type="checkbox"
                                checked={branch.members.includes(
                                  character.id
                                )}
                                onChange={() =>
                                  toggleMember(
                                    branch.id,
                                    character.id
                                  )
                                }
                              />

                              <span>
                                {character.name}
                                {character.lastName
                                  ? ` ${character.lastName}`
                                  : ""}
                              </span>
                            </label>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            )
          )}

          <button
            type="button"
            className="button secondary"
            onClick={addBranch}
          >
            + Add branch
          </button>
        </div>
      </Section>

      <div className="creator-actions">
        <button
          type="button"
          className="button secondary"
          onClick={onCancel}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="button primary"
        >
          Save organization
        </button>
      </div>
    </form>
  );
}

/* =========================================================
   LORE
   ========================================================= */

function LoreCard({
  entry,
  onEdit,
  onDelete,
}) {
  return (
    <article className="lore-card glow-card">
      <div className="lore-card-header">
        <div>
          {entry.category && (
            <span className="eyebrow">
              {entry.category}
            </span>
          )}

          <h2>{entry.title}</h2>
        </div>
      </div>

      <p>
        {entry.content ||
          "No content yet."}
      </p>

      <div className="character-card-actions">
        <button
          type="button"
          className="button secondary"
          onClick={() => onEdit(entry)}
        >
          Edit
        </button>

        <button
          type="button"
          className="button danger"
          onClick={() => onDelete(entry.id)}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

function LorePage({
  lore,
  onCreate,
  onEdit,
  onDelete,
}) {
  return (
    <main className="archive-page">
      <div className="archive-header">
        <div>
          <p className="eyebrow">
            WORLD BUILDING
          </p>

          <h1>Lore</h1>

          <p className="muted">
            Keep track of events, places,
            concepts and everything else in your
            universe.
          </p>
        </div>

        <button
          className="button primary large"
          type="button"
          onClick={onCreate}
        >
          + New lore entry
        </button>
      </div>

      {lore.length === 0 ? (
        <EmptyState
          icon="☽"
          title="No lore yet"
          text="Start writing the history and world behind your characters."
          action={
            <button
              className="button primary"
              type="button"
              onClick={onCreate}
            >
              Create lore entry
            </button>
          }
        />
      ) : (
        <div className="lore-grid">
          {lore.map((entry) => (
            <LoreCard
              key={entry.id}
              entry={entry}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function LoreEditor({
  initialLore,
  onSave,
  onCancel,
}) {
  const [entry, setEntry] =
    useState(
      normalizeLore(initialLore)
    );

  const update = (field, value) => {
    setEntry((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const submit = (event) => {
    event.preventDefault();

    if (!entry.title.trim()) {
      alert(
        "Please give the lore entry a title."
      );
      return;
    }

    onSave({
      ...entry,
      title: entry.title.trim(),
      id: entry.id || makeId("lore"),
    });
  };

  return (
    <form
      className="creator-page"
      onSubmit={submit}
    >
      <div className="creator-header">
        <div>
          <p className="eyebrow">
            {entry.id
              ? "EDIT LORE"
              : "NEW LORE"}
          </p>

          <h1>
            {entry.title || "Lore entry"}
          </h1>
        </div>

        <button
          type="button"
          className="button secondary"
          onClick={onCancel}
        >
          ← Back
        </button>
      </div>

      <Section title="Lore entry">
        <Field
          label="Title"
          value={entry.title}
          onChange={(value) =>
            update("title", value)
          }
          placeholder="Entry title"
        />

        <Field
          label="Category"
          value={entry.category}
          onChange={(value) =>
            update("category", value)
          }
          placeholder="Event, place, concept..."
        />

        <TextField
          label="Content"
          value={entry.content}
          onChange={(value) =>
            update("content", value)
          }
          placeholder="Write your lore here..."
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

        <button
          type="submit"
          className="button primary"
        >
          Save lore
        </button>
      </div>
    </form>
  );
}

/* =========================================================
   IMPORT / EXPORT
   ========================================================= */

function DataTools({
  characters,
  organizations,
  lore,
  onImport,
}) {
  const inputRef = useRef(null);

  const exportData = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      characters,
      organizations,
      lore,
    };

    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      {
        type: "application/json",
      }
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "oc-archive-backup.json";
    anchor.click();

    URL.revokeObjectURL(url);
  };

  const importData = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (
        !data ||
        !Array.isArray(data.characters) ||
        !Array.isArray(data.organizations) ||
        !Array.isArray(data.lore)
      ) {
        throw new Error("Invalid backup");
      }

      onImport({
        characters:
          data.characters.map(
            normalizeCharacter
          ),
        organizations:
          data.organizations.map(
            normalizeOrganization
          ),
        lore:
          data.lore.map(normalizeLore),
      });
    } catch {
      alert(
        "This file does not look like a valid OC Archive backup."
      );
    }

    event.target.value = "";
  };

  return (
    <div className="data-tools">
      <button
        type="button"
        className="button secondary"
        onClick={exportData}
      >
        ↓ Export backup
      </button>

      <button
        type="button"
        className="button secondary"
        onClick={() =>
          inputRef.current?.click()
        }
      >
        ↑ Import backup
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={importData}
      />
    </div>
  );
}

/* =========================================================
   APP
   ========================================================= */

export default function App() {
  const [theme, setTheme] =
    useState(getTheme());

  const [activeTab, setActiveTab] =
    useState("characters");

  const [characters, setCharacters] =
    useState(() =>
      getStorage(
        "oc-characters",
        []
      ).map(normalizeCharacter)
    );

  const [organizations, setOrganizations] =
    useState(() =>
      getStorage(
        "oc-organizations",
        []
      ).map(normalizeOrganization)
    );

  const [lore, setLore] =
    useState(() =>
      getStorage(
        "oc-lore",
        []
      ).map(normalizeLore)
    );

  const [search, setSearch] =
    useState("");

  const [viewCharacterId, setViewCharacterId] =
    useState(null);

  const [editingCharacter, setEditingCharacter] =
    useState(null);

  const [editingOrganization, setEditingOrganization] =
    useState(null);

  const [editingLore, setEditingLore] =
    useState(null);

  const [showCharacterEditor, setShowCharacterEditor] =
    useState(false);

  const [
    showOrganizationEditor,
    setShowOrganizationEditor,
  ] = useState(false);

  const [showLoreEditor, setShowLoreEditor] =
    useState(false);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    setStorage(
      "oc-characters",
      characters
    );
  }, [characters]);

  useEffect(() => {
    setStorage(
      "oc-organizations",
      organizations
    );
  }, [organizations]);

  useEffect(() => {
    setStorage(
      "oc-lore",
      lore
    );
  }, [lore]);

  /* -------------------------------------------------------
     NAVIGATION
     ------------------------------------------------------- */

  const goHome = () => {
    setActiveTab("characters");
    setViewCharacterId(null);
    setShowCharacterEditor(false);
    setShowOrganizationEditor(false);
    setShowLoreEditor(false);
    setEditingCharacter(null);
    setEditingOrganization(null);
    setEditingLore(null);
  };

  const goTab = (tab) => {
    setActiveTab(tab);
    setViewCharacterId(null);
    setShowCharacterEditor(false);
    setShowOrganizationEditor(false);
    setShowLoreEditor(false);
    setEditingCharacter(null);
    setEditingOrganization(null);
    setEditingLore(null);
  };

  /* -------------------------------------------------------
     CHARACTER ACTIONS
     ------------------------------------------------------- */

  const openNewCharacter = () => {
    setEditingCharacter(null);
    setShowCharacterEditor(true);
    setViewCharacterId(null);
  };

  const openEditCharacter = (character) => {
    setEditingCharacter(
      normalizeCharacter(character)
    );
    setShowCharacterEditor(true);
    setViewCharacterId(null);
  };

  const saveCharacter = (character) => {
    setCharacters((current) => {
      const normalized =
        normalizeCharacter(character);

      const exists = current.some(
        (item) =>
          item.id === normalized.id
      );

      if (exists) {
        return current.map((item) =>
          item.id === normalized.id
            ? normalized
            : item
        );
      }

      return [
        ...current,
        normalized,
      ];
    });

    setShowCharacterEditor(false);
    setEditingCharacter(null);
    setViewCharacterId(character.id);
  };

  const deleteCharacter = (id) => {
    const character =
      characters.find(
        (item) => item.id === id
      );

    const confirmed =
      window.confirm(
        `Delete ${
          character?.name ||
          "this character"
        }? This cannot be undone.`
      );

    if (!confirmed) return;

    setCharacters((current) =>
      current.filter(
        (item) => item.id !== id
      )
    );

    setOrganizations((current) =>
      current.map((organization) => ({
        ...organization,
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

    setCharacters((current) =>
      current.map((character) => ({
        ...character,
        relationships:
          character.relationships.filter(
            (relationship) =>
              relationship.characterId !== id
          ),
      }))
    );

    setViewCharacterId(null);
  };

  /* -------------------------------------------------------
     ORGANIZATION ACTIONS
     ------------------------------------------------------- */

  const saveOrganization = (
    organization
  ) => {
    const normalized =
      normalizeOrganization(
        organization
      );

    setOrganizations((current) => {
      const exists = current.some(
        (item) =>
          item.id === normalized.id
      );

      if (exists) {
        return current.map((item) =>
          item.id === normalized.id
            ? normalized
            : item
        );
      }

      return [
        ...current,
        normalized,
      ];
    });

    setShowOrganizationEditor(false);
    setEditingOrganization(null);
  };

  const deleteOrganization = (id) => {
    const organization =
      organizations.find(
        (item) => item.id === id
      );

    if (
      !window.confirm(
        `Delete ${
          organization?.name ||
          "this organization"
        }?`
      )
    ) {
      return;
    }

    setOrganizations((current) =>
      current.filter(
        (item) => item.id !== id
      )
    );
  };

  /* -------------------------------------------------------
     LORE ACTIONS
     ------------------------------------------------------- */

  const saveLore = (entry) => {
    const normalized =
      normalizeLore(entry);

    setLore((current) => {
      const exists = current.some(
        (item) =>
          item.id === normalized.id
      );

      if (exists) {
        return current.map((item) =>
          item.id === normalized.id
            ? normalized
            : item
        );
      }

      return [
        ...current,
        normalized,
      ];
    });

    setShowLoreEditor(false);
    setEditingLore(null);
  };

  const deleteLore = (id) => {
    const entry = lore.find(
      (item) => item.id === id
    );

    if (
      !window.confirm(
        `Delete ${
          entry?.title ||
          "this lore entry"
        }?`
      )
    ) {
      return;
    }

    setLore((current) =>
      current.filter(
        (item) => item.id !== id
      )
    );
  };

  /* -------------------------------------------------------
     IMPORT
     ------------------------------------------------------- */

  const importData = (data) => {
    if (
      !window.confirm(
        "Import this backup? Your current archive will be replaced."
      )
    ) {
      return;
    }

    setCharacters(
      data.characters.map(
        normalizeCharacter
      )
    );

    setOrganizations(
      data.organizations.map(
        normalizeOrganization
      )
    );

    setLore(
      data.lore.map(normalizeLore)
    );

    setViewCharacterId(null);
    setShowCharacterEditor(false);
    setShowOrganizationEditor(false);
    setShowLoreEditor(false);

    alert("Backup imported successfully.");
  };

  const currentCharacter =
    characters.find(
      (character) =>
        character.id === viewCharacterId
    );

  /* -------------------------------------------------------
     CONTENT
     ------------------------------------------------------- */

  let content;

  if (showCharacterEditor) {
    content = (
      <CharacterEditor
        initialCharacter={
          editingCharacter ||
          emptyCharacter
        }
        characters={characters}
        onSave={saveCharacter}
        onCancel={() => {
          setShowCharacterEditor(false);
          setEditingCharacter(null);
        }}
      />
    );
  } else if (
    showOrganizationEditor
  ) {
    content = (
      <OrganizationEditor
        initialOrganization={
          editingOrganization ||
          emptyOrganization
        }
        characters={characters}
        onSave={saveOrganization}
        onCancel={() => {
          setShowOrganizationEditor(false);
          setEditingOrganization(null);
        }}
      />
    );
  } else if (showLoreEditor) {
    content = (
      <LoreEditor
        initialLore={
          editingLore ||
          emptyLore
        }
        onSave={saveLore}
        onCancel={() => {
          setShowLoreEditor(false);
          setEditingLore(null);
        }}
      />
    );
  } else if (currentCharacter) {
    content = (
      <CharacterProfile
        character={currentCharacter}
        characters={characters}
        onEdit={() =>
          openEditCharacter(
            currentCharacter
          )
        }
        onBack={() =>
          setViewCharacterId(null)
        }
      />
    );
  } else if (
    activeTab === "characters"
  ) {
    content = (
      <CharactersPage
        characters={characters}
        search={search}
        setSearch={setSearch}
        onCreate={openNewCharacter}
        onOpen={setViewCharacterId}
        onEdit={openEditCharacter}
        onDelete={deleteCharacter}
      />
    );
  } else if (
    activeTab === "organizations"
  ) {
    content = (
      <OrganizationsPage
        organizations={organizations}
        characters={characters}
        onCreate={() => {
          setEditingOrganization(null);
          setShowOrganizationEditor(true);
        }}
        onEdit={(organization) => {
          setEditingOrganization(
            organization
          );
          setShowOrganizationEditor(true);
        }}
        onDelete={deleteOrganization}
      />
    );
  } else {
    content = (
      <LorePage
        lore={lore}
        onCreate={() => {
          setEditingLore(null);
          setShowLoreEditor(true);
        }}
        onEdit={(entry) => {
          setEditingLore(entry);
          setShowLoreEditor(true);
        }}
        onDelete={deleteLore}
      />
    );
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <button
          className="brand"
          type="button"
          onClick={goHome}
        >
          <div className="brand-symbol">
            ✦
          </div>

          <div>
            <div className="brand-title">
              OC Archive
            </div>

            <div className="brand-subtitle">
              Original Character Database
            </div>
          </div>
        </button>

        <nav className="main-nav">
          <button
            className={
              activeTab === "characters"
                ? "nav-button active"
                : "nav-button"
            }
            onClick={() =>
              goTab("characters")
            }
            type="button"
          >
            Characters
          </button>

          <button
            className={
              activeTab ===
              "organizations"
                ? "nav-button active"
                : "nav-button"
            }
            onClick={() =>
              goTab("organizations")
            }
            type="button"
          >
            Organizations
          </button>

          <button
            className={
              activeTab === "lore"
                ? "nav-button active"
                : "nav-button"
            }
            onClick={() =>
              goTab("lore")
            }
            type="button"
          >
            Lore
          </button>
        </nav>

        <div className="header-tools">
          <div className="theme-switcher">
            <label htmlFor="theme-select">
              Theme
            </label>

            <select
              id="theme-select"
              value={theme}
              onChange={(event) =>
                setTheme(
                  event.target.value
                )
              }
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
          </div>

          <DataTools
            characters={characters}
            organizations={organizations}
            lore={lore}
            onImport={importData}
          />
        </div>
      </header>

      <div className="theme-decoration">
        <span />
        <span />
        <span />
      </div>

      {content}

      <footer className="site-footer">
        <span>
          OC Archive
        </span>

        <span>
          {characters.length} characters ·{" "}
          {organizations.length} organizations ·{" "}
          {lore.length} lore entries
        </span>

        <span>
          Saved locally
        </span>
      </footer>
    </div>
  );
}
