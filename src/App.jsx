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
  ["Nice", "Mean"],
  ["Brave", "Coward"],
  ["Pacifist", "Violent"],
  ["Thoughtful", "Impulsive"],
  ["Agreeable", "Contrary"],
  ["Idealistic", "Pragmatic"],
  ["Frugal", "Big spender"],
  ["Collected", "Wild"],
  ["Honest", "Deceptive"],
  ["Polite", "Rude"],
  ["Smart", "Idiot"],
  ["Confident", "Insecure"],
  ["Calm", "Anxious"],
  ["Patient", "Impatient"],
  ["Gullible", "Skeptical"],
  ["Reserved", "Flirty"],
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
  "Parent",
  "Child",
  "Sibling",
  "Friend",
  "Best friend",
  "Enemy",
  "Lover",
  "Ex-lover",
  "Crush",
  "Colleague",
  "Boss",
  "Employee",
  "Rival",
  "Mentor",
  "Student",
  "Acquaintance",
  "Ally",
  "Other",
];

/* =========================================================
   HELPERS
========================================================= */

function uid(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}

async function filesToDataURLs(files) {
  return Promise.all(
    Array.from(files || []).map(readFileAsDataURL)
  );
}

/* =========================================================
   EMPTY DATA
========================================================= */

function makeEmptyCharacter() {
  return {
    id: "",

    name: "",
    lastName: "",
    nicknames: "",
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

    species: "Human",

    eyeColor: "",
    hairColor: "",
    hairStyle: "",

    ability: "",
    abilityDescription: "",
    sideEffects: "",
    weapon: "",
    mbti: "",

    fears: "",
    sickness: "",
    addictions: "",
    likes: "",
    dislikes: "",

    image: "",

    personality: Object.fromEntries(
      PERSONALITY_STATS.map(([left]) => [left, 3])
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
}

function makeEmptyOrganization() {
  return {
    id: "",
    name: "",
    description: "",
    image: "",
    members: [],
    branches: [],
  };
}

function makeEmptyBranch() {
  return {
    id: uid("branch"),
    name: "",
    description: "",
    members: [],
  };
}

function makeEmptyLore() {
  return {
    id: "",
    title: "",
    category: "",
    content: "",
  };
}

function normalizeCharacter(character = {}) {
  const base = makeEmptyCharacter();

  return {
    ...base,
    ...character,

    personality: {
      ...base.personality,
      ...(character.personality || {}),
    },

    skills: {
      ...base.skills,
      ...(character.skills || {}),
    },

    socialStats: {
      ...base.socialStats,
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

function displayName(character) {
  if (!character) return "Unknown";

  return (
    [character.name, character.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || "Unnamed character"
  );
}

/* =========================================================
   SMALL UI
========================================================= */

function Button({
  children,
  onClick,
  type = "button",
  variant = "secondary",
  className = "",
}) {
  return (
    <button
      type={type}
      className={`button ${variant} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  wide = false,
}) {
  return (
    <label className={`field ${wide ? "field-wide" : ""}`}>
      <span>{label}</span>

      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  rows = 5,
}) {
  return (
    <label className="field field-wide">
      <span>{label}</span>

      <textarea
        rows={rows}
        value={value ?? ""}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <label className="field">
      <span>{label}</span>

      <select
        value={value ?? ""}
        onChange={(event) =>
          onChange(event.target.value)
        }
      >
        {options.map((option) => (
          <option
            key={option.value ?? option}
            value={option.value ?? option}
          >
            {option.label ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Section({ title, eyebrow, children }) {
  return (
    <section className="form-section glow-card">
      <div className="section-title">
        <div>
          {eyebrow && (
            <div className="section-eyebrow">
              {eyebrow}
            </div>
          )}

          <h2>{title}</h2>
        </div>

        <span className="section-symbol">✦</span>
      </div>

      {children}
    </section>
  );
}

/* =========================================================
   IMAGE UPLOAD
========================================================= */

function ImageUpload({
  label,
  value,
  onChange,
  multiple = false,
}) {
  const inputRef = useRef(null);

  async function chooseFiles(event) {
    const files = event.target.files;

    if (!files?.length) return;

    try {
      const images = await filesToDataURLs(files);

      if (multiple) {
        onChange([
          ...(value || []),
          ...images,
        ]);
      } else {
        onChange(images[0]);
      }
    } catch {
      alert("Could not load this image.");
    }

    event.target.value = "";
  }

  return (
    <div className="image-upload field-wide">
      <div className="image-upload-heading">
        <span>{label}</span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        hidden
        onChange={chooseFiles}
      />

      <button
        type="button"
        className="upload-area"
        onClick={() =>
          inputRef.current?.click()
        }
      >
        {multiple ? (
          value?.length ? (
            <div className="upload-preview-grid">
              {value.map((image, index) => (
                <img
                  key={`${image}-${index}`}
                  src={image}
                  alt=""
                />
              ))}
            </div>
          ) : (
            <div className="upload-placeholder">
              <strong>＋</strong>
              <span>Add pictures</span>
            </div>
          )
        ) : value ? (
          <img
            className="upload-preview"
            src={value}
            alt=""
          />
        ) : (
          <div className="upload-placeholder">
            <strong>＋</strong>
            <span>Upload picture</span>
          </div>
        )}
      </button>

      {multiple && value?.length > 0 && (
        <div className="upload-actions">
          <Button
            variant="danger"
            onClick={() => onChange([])}
          >
            Clear moodboard
          </Button>
        </div>
      )}

      {!multiple && value && (
        <div className="upload-actions">
          <Button
            variant="danger"
            onClick={() => onChange("")}
          >
            Remove picture
          </Button>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   STAT CONTROLS
========================================================= */

function StatBar({
  left,
  right,
  value,
  onChange,
}) {
  return (
    <div className="stat-row">
      <span className="stat-label left">
        {left}
      </span>

      <div className="stat-pips">
        {[1, 2, 3, 4, 5].map((number) => (
          <button
            key={number}
            type="button"
            className={
              number <= value
                ? "stat-pip active"
                : "stat-pip"
            }
            onClick={() => onChange(number)}
            aria-label={`${number}/5`}
          />
        ))}
      </div>

      <span className="stat-label right">
        {right}
      </span>
    </div>
  );
}

function SkillBar({
  name,
  value,
  onChange,
}) {
  return (
    <div className="skill-row">
      <span className="skill-name">
        {name}
      </span>

      <div className="skill-pips">
        {[1, 2, 3, 4, 5].map((number) => (
          <button
            key={number}
            type="button"
            className={
              number <= value
                ? "skill-pip active"
                : "skill-pip"
            }
            onClick={() => onChange(number)}
          />
        ))}
      </div>

      <span className="skill-value">
        {value}/5
      </span>
    </div>
  );
}

/* =========================================================
   RELATIONSHIPS
========================================================= */

function RelationshipEditor({
  relationships,
  characters,
  currentCharacterId,
  onChange,
}) {
  function addRelationship() {
    onChange([
      ...relationships,
      {
        id: uid("relationship"),
        type: "Friend",
        customType: "",
        targetId: "",
        personName: "",
        status: "",
        description: "",
      },
    ]);
  }

  function updateRelationship(
    id,
    field,
    value
  ) {
    onChange(
      relationships.map((relationship) =>
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
    onChange(
      relationships.filter(
        (relationship) =>
          relationship.id !== id
      )
    );
  }

  return (
    <div className="relationship-editor">
      <div className="relationship-intro">
        <div>
          <strong>
            Add as many relationships as you want.
          </strong>

          <p>
            A character can have multiple friends,
            enemies, lovers, family members, rivals,
            and custom relationship categories.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={addRelationship}
        >
          + Add relationship
        </Button>
      </div>

      {relationships.length === 0 ? (
        <div className="empty-mini">
          No relationships yet.
        </div>
      ) : (
        <div className="relationship-list">
          {relationships.map((relationship) => (
            <div
              className="relationship-card"
              key={relationship.id}
            >
              <div className="relationship-card-heading">
                <span>
                  {relationship.type === "Other"
                    ? relationship.customType ||
                      "Custom relationship"
                    : relationship.type}
                </span>

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
                <SelectField
                  label="Category"
                  value={relationship.type}
                  onChange={(value) =>
                    updateRelationship(
                      relationship.id,
                      "type",
                      value
                    )
                  }
                  options={RELATIONSHIP_TYPES}
                />

                <label className="field">
                  <span>Person</span>

                  <select
                    value={
                      relationship.targetId
                    }
                    onChange={(event) => {
                      const id =
                        event.target.value;

                      const person =
                        characters.find(
                          (character) =>
                            character.id === id
                        );

                      updateRelationship(
                        relationship.id,
                        "targetId",
                        id
                      );

                      if (person) {
                        updateRelationship(
                          relationship.id,
                          "personName",
                          displayName(person)
                        );
                      }
                    }}
                  >
                    <option value="">
                      Choose a character
                    </option>

                    {characters
                      .filter(
                        (character) =>
                          character.id !==
                          currentCharacterId
                      )
                      .map((character) => (
                        <option
                          key={character.id}
                          value={character.id}
                        >
                          {displayName(character)}
                        </option>
                      ))}
                  </select>
                </label>

                <Field
                  label="Person's name"
                  value={
                    relationship.personName
                  }
                  onChange={(value) =>
                    updateRelationship(
                      relationship.id,
                      "personName",
                      value
                    )
                  }
                />

                <Field
                  label="Relationship status"
                  value={relationship.status}
                  placeholder="Complicated, close, deceased..."
                  onChange={(value) =>
                    updateRelationship(
                      relationship.id,
                      "status",
                      value
                    )
                  }
                />

                {relationship.type ===
                  "Other" && (
                  <Field
                    label="Custom category"
                    value={
                      relationship.customType
                    }
                    placeholder="Guardian, handler, soulmate..."
                    onChange={(value) =>
                      updateRelationship(
                        relationship.id,
                        "customType",
                        value
                      )
                    }
                  />
                )}

                <TextField
                  label="Notes"
                  value={
                    relationship.description
                  }
                  onChange={(value) =>
                    updateRelationship(
                      relationship.id,
                      "description",
                      value
                    )
                  }
                  rows={3}
                />
              </div>
            </div>
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
  character,
  characters,
  onSave,
  onCancel,
}) {
  const [form, setForm] = useState(
    normalizeCharacter(character)
  );

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateNested(
    group,
    field,
    value
  ) {
    setForm((current) => ({
      ...current,
      [group]: {
        ...current[group],
        [field]: value,
      },
    }));
  }

  function saveCharacter() {
    onSave({
      ...form,
      id: form.id || uid("character"),
      name:
        form.name.trim() ||
        "Unnamed character",
    });
  }

  return (
    <div className="editor-page">
      <div className="editor-header">
        <div>
          <div className="eyebrow">
            Character archive
          </div>

          <h1>
            {form.name ||
              "New character"}
          </h1>

          <p>
            Build every detail of this
            character.
          </p>
        </div>

        <div className="editor-actions">
          <Button onClick={onCancel}>
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={saveCharacter}
          >
            Save character
          </Button>
        </div>
      </div>

      <Section
        title="Identity & appearance"
        eyebrow="01"
      >
        <div className="form-grid">
          <Field
            label="First name"
            value={form.name}
            onChange={(value) =>
              update("name", value)
            }
          />

          <Field
            label="Last name"
            value={form.lastName}
            onChange={(value) =>
              update("lastName", value)
            }
          />

          <Field
            label="Nickname(s)"
            value={form.nicknames}
            onChange={(value) =>
              update("nicknames", value)
            }
          />

          <Field
            label="Age"
            value={form.age}
            onChange={(value) =>
              update("age", value)
            }
          />

          <Field
            label="Pronouns"
            value={form.pronouns}
            onChange={(value) =>
              update("pronouns", value)
            }
          />

          <Field
            label="Date of birth"
            type="date"
            value={form.dateOfBirth}
            onChange={(value) =>
              update("dateOfBirth", value)
            }
          />

          <Field
            label="Gender"
            value={form.gender}
            onChange={(value) =>
              update("gender", value)
            }
          />

          <Field
            label="Sexuality"
            value={form.sexuality}
            onChange={(value) =>
              update("sexuality", value)
            }
          />

          <Field
            label="Nationality"
            value={form.nationality}
            onChange={(value) =>
              update(
                "nationality",
                value
              )
            }
          />

          <Field
            label="Origins"
            value={form.origins}
            onChange={(value) =>
              update("origins", value)
            }
          />

          <Field
            label="Species / race"
            value={form.species}
            onChange={(value) =>
              update("species", value)
            }
          />

          <Field
            label="Height"
            value={form.height}
            onChange={(value) =>
              update("height", value)
            }
          />

          <Field
            label="Weight"
            value={form.weight}
            onChange={(value) =>
              update("weight", value)
            }
          />

          <Field
            label="Eye color"
            value={form.eyeColor}
            onChange={(value) =>
              update("eyeColor", value)
            }
          />

          <Field
            label="Hair color"
            value={form.hairColor}
            onChange={(value) =>
              update("hairColor", value)
            }
          />

          <Field
            label="Hair style"
            value={form.hairStyle}
            onChange={(value) =>
              update("hairStyle", value)
            }
          />
        </div>

        <ImageUpload
          label="Character picture"
          value={form.image}
          onChange={(value) =>
            update("image", value)
          }
        />
      </Section>

      <Section
        title="Status, work & affiliation"
        eyebrow="02"
      >
        <div className="form-grid">
          <SelectField
            label="Status"
            value={form.status}
            onChange={(value) =>
              update("status", value)
            }
            options={[
              {
                value: "alive",
                label: "Alive",
              },
              {
                value: "dead",
                label: "Dead",
              },
              {
                value: "unknown",
                label: "Unknown",
              },
            ]}
          />

          <Field
            label="Later status"
            value={form.laterStatus}
            onChange={(value) =>
              update(
                "laterStatus",
                value
              )
            }
          />

          <Field
            label="Job"
            value={form.job}
            onChange={(value) =>
              update("job", value)
            }
          />

          <Field
            label="Side job"
            value={form.sideJob}
            onChange={(value) =>
              update("sideJob", value)
            }
          />

          <Field
            label="Affiliation"
            value={form.affiliation}
            onChange={(value) =>
              update(
                "affiliation",
                value
              )
            }
          />

          <Field
            label="Past affiliation"
            value={
              form.pastAffiliation
            }
            onChange={(value) =>
              update(
                "pastAffiliation",
                value
              )
            }
          />

          <Field
            label="Rank"
            value={form.rank}
            onChange={(value) =>
              update("rank", value)
            }
          />

          <Field
            label="Past rank"
            value={form.pastRank}
            onChange={(value) =>
              update(
                "pastRank",
                value
              )
            }
          />
        </div>
      </Section>

      <Section
        title="Ability & combat"
        eyebrow="03"
      >
        <div className="form-grid">
          <Field
            label="Ability"
            value={form.ability}
            onChange={(value) =>
              update("ability", value)
            }
          />

          <Field
            label="Weapon"
            value={form.weapon}
            onChange={(value) =>
              update("weapon", value)
            }
          />

          <Field
            label="MBTI"
            value={form.mbti}
            onChange={(value) =>
              update("mbti", value)
            }
          />
        </div>

        <TextField
          label="Ability description"
          value={
            form.abilityDescription
          }
          onChange={(value) =>
            update(
              "abilityDescription",
              value
            )
          }
        />

        <TextField
          label="Side effects & risks"
          value={form.sideEffects}
          onChange={(value) =>
            update(
              "sideEffects",
              value
            )
          }
        />
      </Section>

      <Section
        title="Personality"
        eyebrow="04"
      >
        <div className="stats-list">
          {PERSONALITY_STATS.map(
            ([left, right]) => (
              <StatBar
                key={left}
                left={left}
                right={right}
                value={
                  form.personality[
                    left
                  ] || 3
                }
                onChange={(value) =>
                  updateNested(
                    "personality",
                    left,
                    value
                  )
                }
              />
            )
          )}
        </div>
      </Section>

      <Section
        title="Skills"
        eyebrow="05"
      >
        <div className="skills-list">
          {SKILLS.map((skill) => (
            <SkillBar
              key={skill}
              name={skill}
              value={
                form.skills[skill] || 3
              }
              onChange={(value) =>
                updateNested(
                  "skills",
                  skill,
                  value
                )
              }
            />
          ))}
        </div>
      </Section>

      <Section
        title="Social statistics"
        eyebrow="06"
      >
        <div className="skills-list">
          {SOCIAL_STATS.map((stat) => (
            <SkillBar
              key={stat}
              name={stat}
              value={
                form.socialStats[stat] || 3
              }
              onChange={(value) =>
                updateNested(
                  "socialStats",
                  stat,
                  value
                )
              }
            />
          ))}
        </div>
      </Section>

      <Section
        title="Personal information"
        eyebrow="07"
      >
        <TextField
          label="Fears"
          value={form.fears}
          onChange={(value) =>
            update("fears", value)
          }
        />

        <TextField
          label="Sickness"
          value={form.sickness}
          onChange={(value) =>
            update("sickness", value)
          }
        />

        <TextField
          label="Addictions"
          value={form.addictions}
          onChange={(value) =>
            update(
              "addictions",
              value
            )
          }
        />

        <TextField
          label="Likes"
          value={form.likes}
          onChange={(value) =>
            update("likes", value)
          }
        />

        <TextField
          label="Dislikes"
          value={form.dislikes}
          onChange={(value) =>
            update(
              "dislikes",
              value
            )
          }
        />
      </Section>

      <Section
        title="Relationships"
        eyebrow="08"
      >
        <RelationshipEditor
          relationships={
            form.relationships
          }
          characters={characters}
          currentCharacterId={form.id}
          onChange={(value) =>
            update(
              "relationships",
              value
            )
          }
        />
      </Section>

      <Section
        title="Moodboard"
        eyebrow="09"
      >
        <ImageUpload
          label="Moodboard pictures"
          multiple
          value={form.moodboard}
          onChange={(value) =>
            update(
              "moodboard",
              value
            )
          }
        />
      </Section>

      <div className="bottom-actions">
        <Button onClick={onCancel}>
          Cancel
        </Button>

        <Button
          variant="primary"
          onClick={saveCharacter}
        >
          Save character
        </Button>
      </div>
    </div>
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
    <article
      className="character-card glow-card"
      onClick={onOpen}
    >
      <div className="character-card-image">
        {character.image ? (
          <img
            src={character.image}
            alt=""
          />
        ) : (
          <div className="no-image">
            ✦
          </div>
        )}

        <span
          className={`status-badge ${character.status}`}
        >
          {character.status}
        </span>
      </div>

      <div className="character-card-content">
        <div className="card-kicker">
          Character
        </div>

        <h3>
          {displayName(character)}
        </h3>

        {character.nicknames && (
          <p className="nickname">
            “{character.nicknames}”
          </p>
        )}

        <div className="character-summary">
          {character.job ||
            character.affiliation ||
            character.species}
        </div>

        <div
          className="card-actions"
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          <Button onClick={onEdit}>
            Edit
          </Button>

          <Button
            variant="danger"
            onClick={onDelete}
          >
            Delete
          </Button>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   CHARACTER PROFILE
========================================================= */

function ProfileField({
  label,
  value,
}) {
  if (!value) return null;

  return (
    <div className="profile-field">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function CharacterProfile({
  character,
  characters,
  organizations,
  onBack,
  onEdit,
}) {
  const relationships =
    character.relationships || [];

  return (
    <div className="profile-page">
      <div className="profile-actions">
        <Button onClick={onBack}>
          ← Back
        </Button>

        <Button
          variant="primary"
          onClick={onEdit}
        >
          Edit character
        </Button>
      </div>

      <section className="profile-hero glow-card">
        <div className="profile-hero-image">
          {character.image ? (
            <img
              src={character.image}
              alt=""
            />
          ) : (
            <div className="profile-no-image">
              ✦
            </div>
          )}
        </div>

        <div className="profile-heading">
          <div className="eyebrow">
            Character profile
          </div>

          <h1>
            {displayName(character)}
          </h1>

          {character.nicknames && (
            <p className="profile-nickname">
              “{character.nicknames}”
            </p>
          )}

          <div className="profile-badges">
            <span>
              {character.status}
            </span>

            {character.age && (
              <span>
                {character.age} years
              </span>
            )}

            {character.mbti && (
              <span>
                {character.mbti}
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="profile-grid">
        <section className="profile-section glow-card">
          <h2>Identity</h2>

          <div className="profile-fields">
            <ProfileField
              label="Pronouns"
              value={character.pronouns}
            />

            <ProfileField
              label="Gender"
              value={character.gender}
            />

            <ProfileField
              label="Sexuality"
              value={
                character.sexuality
              }
            />

            <ProfileField
              label="Nationality"
              value={
                character.nationality
              }
            />

            <ProfileField
              label="Origins"
              value={character.origins}
            />

            <ProfileField
              label="Species"
              value={character.species}
            />

            <ProfileField
              label="Date of birth"
              value={
                character.dateOfBirth
              }
            />

            <ProfileField
              label="Height"
              value={character.height}
            />

            <ProfileField
              label="Weight"
              value={character.weight}
            />
          </div>
        </section>

        <section className="profile-section glow-card">
          <h2>Appearance</h2>

          <div className="profile-fields">
            <ProfileField
              label="Eyes"
              value={
                character.eyeColor
              }
            />

            <ProfileField
              label="Hair"
              value={
                character.hairColor
              }
            />

            <ProfileField
              label="Hair style"
              value={
                character.hairStyle
              }
            />
          </div>
        </section>

        <section className="profile-section glow-card">
          <h2>Occupation & status</h2>

          <div className="profile-fields">
            <ProfileField
              label="Job"
              value={character.job}
            />

            <ProfileField
              label="Side job"
              value={
                character.sideJob
              }
            />

            <ProfileField
              label="Affiliation"
              value={
                character.affiliation
              }
            />

            <ProfileField
              label="Past affiliation"
              value={
                character.pastAffiliation
              }
            />

            <ProfileField
              label="Rank"
              value={character.rank}
            />

            <ProfileField
              label="Past rank"
              value={
                character.pastRank
              }
            />

            <ProfileField
              label="Later status"
              value={
                character.laterStatus
              }
            />
          </div>
        </section>

        <section className="profile-section glow-card">
          <h2>Ability</h2>

          <div className="profile-fields">
            <ProfileField
              label="Ability"
              value={character.ability}
            />

            <ProfileField
              label="Weapon"
              value={character.weapon}
            />

            <ProfileField
              label="MBTI"
              value={character.mbti}
            />
          </div>

          {character.abilityDescription && (
            <div className="profile-text">
              <h3>Description</h3>
              <p>
                {
                  character.abilityDescription
                }
              </p>
            </div>
          )}

          {character.sideEffects && (
            <div className="profile-text">
              <h3>Side effects & risks</h3>
              <p>
                {character.sideEffects}
              </p>
            </div>
          )}
        </section>

        <section className="profile-section glow-card profile-wide">
          <h2>Personality</h2>

          <div className="profile-stat-list">
            {PERSONALITY_STATS.map(
              ([left, right]) => (
                <StatBar
                  key={left}
                  left={left}
                  right={right}
                  value={
                    character
                      .personality?.[
                      left
                    ] || 3
                  }
                  onChange={() => {}}
                />
              )
            )}
          </div>
        </section>

        <section className="profile-section glow-card">
          <h2>Skills</h2>

          <div className="profile-skill-list">
            {SKILLS.map((skill) => (
              <SkillBar
                key={skill}
                name={skill}
                value={
                  character.skills?.[
                    skill
                  ] || 3
                }
                onChange={() => {}}
              />
            ))}
          </div>
        </section>

        <section className="profile-section glow-card">
          <h2>Social</h2>

          <div className="profile-skill-list">
            {SOCIAL_STATS.map((stat) => (
              <SkillBar
                key={stat}
                name={stat}
                value={
                  character
                    .socialStats?.[
                    stat
                  ] || 3
                }
                onChange={() => {}}
              />
            ))}
          </div>
        </section>

        <section className="profile-section glow-card profile-wide">
          <h2>Personal</h2>

          <div className="profile-text-grid">
            <ProfileField
              label="Fears"
              value={character.fears}
            />

            <ProfileField
              label="Sickness"
              value={
                character.sickness
              }
            />

            <ProfileField
              label="Addictions"
              value={
                character.addictions
              }
            />

            <ProfileField
              label="Likes"
              value={character.likes}
            />

            <ProfileField
              label="Dislikes"
              value={
                character.dislikes
              }
            />
          </div>
        </section>

        <section className="profile-section glow-card profile-wide">
          <h2>Relationships</h2>

          {relationships.length === 0 ? (
            <div className="empty-mini">
              No relationships.
            </div>
          ) : (
            <div className="relationship-display-grid">
              {relationships.map(
                (relationship) => {
                  const target =
                    characters.find(
                      (person) =>
                        person.id ===
                        relationship.targetId
                    );

                  const name =
                    target
                      ? displayName(target)
                      : relationship.personName ||
                        "Unknown person";

                  const type =
                    relationship.type ===
                    "Other"
                      ? relationship.customType ||
                        "Custom"
                      : relationship.type;

                  return (
                    <div
                      className="relationship-display"
                      key={
                        relationship.id
                      }
                    >
                      <div className="relationship-avatar">
                        {target?.image ? (
                          <img
                            src={
                              target.image
                            }
                            alt=""
                          />
                        ) : (
                          "✦"
                        )}
                      </div>

                      <div>
                        <strong>
                          {name}
                        </strong>

                        <span>
                          {type}
                        </span>

                        {relationship.status && (
                          <small>
                            {
                              relationship.status
                            }
                          </small>
                        )}

                        {relationship.description && (
                          <p>
                            {
                              relationship.description
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>

        <section className="profile-section glow-card profile-wide">
          <h2>Organizations</h2>

          <div className="organization-memberships">
            {organizations
              .filter((organization) =>
                organization.members?.includes(
                  character.id
                ) ||
                organization.branches?.some(
                  (branch) =>
                    branch.members?.includes(
                      character.id
                    )
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

                  {organization.branches
                    ?.filter((branch) =>
                      branch.members?.includes(
                        character.id
                      )
                    )
                    .map((branch) => (
                      <span
                        key={branch.id}
                      >
                        {branch.name}
                      </span>
                    ))}
                </div>
              ))}

            {!organizations.some(
              (organization) =>
                organization.members?.includes(
                  character.id
                ) ||
                organization.branches?.some(
                  (branch) =>
                    branch.members?.includes(
                      character.id
                    )
                )
            ) && (
              <div className="empty-mini">
                No organization memberships.
              </div>
            )}
          </div>
        </section>

        {character.moodboard?.length > 0 && (
          <section className="profile-section glow-card profile-wide">
            <h2>Moodboard</h2>

            <div className="moodboard-grid">
              {character.moodboard.map(
                (image, index) => (
                  <img
                    key={`${image}-${index}`}
                    src={image}
                    alt=""
                  />
                )
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   ORGANIZATION EDITOR
========================================================= */

function OrganizationEditor({
  organization,
  characters,
  onSave,
  onCancel,
}) {
  const [form, setForm] = useState({
    ...makeEmptyOrganization(),
    ...clone(organization),
  });

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function toggleMember(
    memberId
  ) {
    setForm((current) => {
      const members =
        current.members || [];

      return {
        ...current,
        members: members.includes(
          memberId
        )
          ? members.filter(
              (id) => id !== memberId
            )
          : [...members, memberId],
      };
    });
  }

  function addBranch() {
    update("branches", [
      ...(form.branches || []),
      makeEmptyBranch(),
    ]);
  }

  function updateBranch(
    branchId,
    field,
    value
  ) {
    update(
      "branches",
      form.branches.map((branch) =>
        branch.id === branchId
          ? {
              ...branch,
              [field]: value,
            }
          : branch
      )
    );
  }

  function toggleBranchMember(
    branchId,
    memberId
  ) {
    update(
      "branches",
      form.branches.map((branch) => {
        if (branch.id !== branchId)
          return branch;

        const members =
          branch.members || [];

        return {
          ...branch,
          members: members.includes(
            memberId
          )
            ? members.filter(
                (id) =>
                  id !== memberId
              )
            : [
                ...members,
                memberId,
              ],
        };
      })
    );
  }

  function removeBranch(
    branchId
  ) {
    update(
      "branches",
      form.branches.filter(
        (branch) =>
          branch.id !== branchId
      )
    );
  }

  async function saveImage(event) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    const image =
      await readFileAsDataURL(file);

    update("image", image);
    event.target.value = "";
  }

  function save() {
    onSave({
      ...form,
      id: form.id || uid("organization"),
      name:
        form.name.trim() ||
        "Unnamed organization",
    });
  }

  return (
    <div className="editor-page">
      <div className="editor-header">
        <div>
          <div className="eyebrow">
            Organization archive
          </div>

          <h1>
            {form.name ||
              "New organization"}
          </h1>
        </div>

        <div className="editor-actions">
          <Button onClick={onCancel}>
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={save}
          >
            Save organization
          </Button>
        </div>
      </div>

      <Section
        title="Organization details"
        eyebrow="01"
      >
        <div className="form-grid">
          <Field
            label="Name"
            value={form.name}
            onChange={(value) =>
              update("name", value)
            }
          />
        </div>

        <TextField
          label="Description"
          value={form.description}
          onChange={(value) =>
            update(
              "description",
              value
            )
          }
        />

        <label className="field field-wide">
          <span>Organization image</span>

          <input
            type="file"
            accept="image/*"
            onChange={saveImage}
          />
        </label>

        {form.image && (
          <div className="organization-editor-image">
            <img
              src={form.image}
              alt=""
            />

            <Button
              variant="danger"
              onClick={() =>
                update("image", "")
              }
            >
              Remove image
            </Button>
          </div>
        )}
      </Section>

      <Section
        title="Organization members"
        eyebrow="02"
      >
        <p className="section-description">
          Add any number of characters to
          the main organization. A character
          can also belong to several branches.
        </p>

        <div className="member-selector">
          {characters.length === 0 ? (
            <div className="empty-mini">
              Create characters first.
            </div>
          ) : (
            characters.map((character) => (
              <label
                className={`member-option ${
                  form.members?.includes(
                    character.id
                  )
                    ? "selected"
                    : ""
                }`}
                key={character.id}
              >
                <input
                  type="checkbox"
                  checked={
                    form.members?.includes(
                      character.id
                    ) || false
                  }
                  onChange={() =>
                    toggleMember(
                      character.id
                    )
                  }
                />

                <span>
                  {displayName(
                    character
                  )}
                </span>
              </label>
            ))
          )}
        </div>
      </Section>

      <Section
        title="Branches"
        eyebrow="03"
      >
        <div className="branch-header">
          <p className="section-description">
            Create as many branches as you
            need and assign different
            characters to each one.
          </p>

          <Button
            variant="primary"
            onClick={addBranch}
          >
            + Add branch
          </Button>
        </div>

        {form.branches?.length === 0 ? (
          <div className="empty-mini">
            No branches yet.
          </div>
        ) : (
          <div className="branch-list">
            {form.branches.map(
              (branch, index) => (
                <div
                  className="branch-editor-card"
                  key={branch.id}
                >
                  <div className="branch-editor-top">
                    <strong>
                      Branch {index + 1}
                    </strong>

                    <Button
                      variant="danger"
                      onClick={() =>
                        removeBranch(
                          branch.id
                        )
                      }
                    >
                      Delete branch
                    </Button>
                  </div>

                  <div className="form-grid">
                    <Field
                      label="Branch name"
                      value={
                        branch.name
                      }
                      onChange={(value) =>
                        updateBranch(
                          branch.id,
                          "name",
                          value
                        )
                      }
                    />

                    <TextField
                      label="Description"
                      value={
                        branch.description
                      }
                      onChange={(value) =>
                        updateBranch(
                          branch.id,
                          "description",
                          value
                        )
                      }
                      rows={3}
                    />
                  </div>

                  <div className="branch-members">
                    <h4>
                      Branch members
                    </h4>

                    <div className="member-selector">
                      {characters.map(
                        (character) => (
                          <label
                            className={`member-option ${
                              branch.members?.includes(
                                character.id
                              )
                                ? "selected"
                                : ""
                            }`}
                            key={
                              character.id
                            }
                          >
                            <input
                              type="checkbox"
                              checked={
                                branch.members?.includes(
                                  character.id
                                ) ||
                                false
                              }
                              onChange={() =>
                                toggleBranchMember(
                                  branch.id,
                                  character.id
                                )
                              }
                            />

                            <span>
                              {displayName(
                                character
                              )}
                            </span>
                          </label>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </Section>

      <div className="bottom-actions">
        <Button onClick={onCancel}>
          Cancel
        </Button>

        <Button
          variant="primary"
          onClick={save}
        >
          Save organization
        </Button>
      </div>
    </div>
  );
}

/* =========================================================
   ORGANIZATIONS PAGE
========================================================= */

function OrganizationsPage({
  organizations,
  characters,
  onNew,
  onEdit,
  onDelete,
}) {
  return (
    <div className="archive-page">
      <div className="page-header">
        <div>
          <div className="eyebrow">
            World building
          </div>

          <h1>Organizations</h1>

          <p>
            Groups, factions, branches,
            members and hierarchies.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={onNew}
        >
          + Add organization
        </Button>
      </div>

      {organizations.length === 0 ? (
        <div className="empty-state glow-card">
          <div>♠</div>

          <h2>
            No organizations yet
          </h2>

          <p>
            Create your first organization
            and start assigning characters.
          </p>
        </div>
      ) : (
        <div className="organization-grid">
          {organizations.map(
            (organization) => (
              <article
                className="organization-card glow-card"
                key={organization.id}
              >
                <div className="organization-image">
                  {organization.image ? (
                    <img
                      src={
                        organization.image
                      }
                      alt=""
                    />
                  ) : (
                    <span>♠</span>
                  )}
                </div>

                <div className="organization-content">
                  <div className="card-kicker">
                    Organization
                  </div>

                  <h2>
                    {organization.name}
                  </h2>

                  <p>
                    {organization.description ||
                      "No description."}
                  </p>

                  <div className="organization-meta">
                    <span>
                      {
                        organization.members
                          ?.length
                      }{" "}
                      members
                    </span>

                    <span>
                      {
                        organization
                          .branches?.length
                      }{" "}
                      branches
                    </span>
                  </div>

                  <div className="card-actions">
                    <Button
                      onClick={() =>
                        onEdit(
                          organization
                        )
                      }
                    >
                      Edit
                    </Button>

                    <Button
                      variant="danger"
                      onClick={() =>
                        onDelete(
                          organization.id
                        )
                      }
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
  onNew,
  onEdit,
  onDelete,
}) {
  return (
    <div className="archive-page">
      <div className="page-header">
        <div>
          <div className="eyebrow">
            World building
          </div>

          <h1>Lore</h1>

          <p>
            Keep your world, timeline and
            important notes in one place.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={onNew}
        >
          + Add lore
        </Button>
      </div>

      {lore.length === 0 ? (
        <div className="empty-state glow-card">
          <div>✦</div>
          <h2>No lore yet</h2>
          <p>
            Start documenting your world.
          </p>
        </div>
      ) : (
        <div className="lore-grid">
          {lore.map((entry) => (
            <article
              className="lore-card glow-card"
              key={entry.id}
            >
              <div className="card-kicker">
                {entry.category ||
                  "Lore"}
              </div>

              <h2>{entry.title}</h2>

              <p>
                {entry.content}
              </p>

              <div className="card-actions">
                <Button
                  onClick={() =>
                    onEdit(entry)
                  }
                >
                  Edit
                </Button>

                <Button
                  variant="danger"
                  onClick={() =>
                    onDelete(entry.id)
                  }
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

function LoreEditor({
  entry,
  onSave,
  onCancel,
}) {
  const [form, setForm] = useState({
    ...makeEmptyLore(),
    ...clone(entry),
  });

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function save() {
    onSave({
      ...form,
      id: form.id || uid("lore"),
      title:
        form.title.trim() ||
        "Untitled lore",
    });
  }

  return (
    <div className="editor-page">
      <div className="editor-header">
        <div>
          <div className="eyebrow">
            Lore archive
          </div>

          <h1>
            {form.title ||
              "New lore"}
          </h1>
        </div>

        <div className="editor-actions">
          <Button onClick={onCancel}>
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={save}
          >
            Save lore
          </Button>
        </div>
      </div>

      <Section
        title="Lore entry"
        eyebrow="01"
      >
        <div className="form-grid">
          <Field
            label="Title"
            value={form.title}
            onChange={(value) =>
              update("title", value)
            }
          />

          <Field
            label="Category"
            value={form.category}
            placeholder="History, event, place..."
            onChange={(value) =>
              update(
                "category",
                value
              )
            }
          />
        </div>

        <TextField
          label="Content"
          rows={16}
          value={form.content}
          onChange={(value) =>
            update("content", value)
          }
        />
      </Section>

      <div className="bottom-actions">
        <Button onClick={onCancel}>
          Cancel
        </Button>

        <Button
          variant="primary"
          onClick={save}
        >
          Save lore
        </Button>
      </div>
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
  onNavigate,
}) {
  return (
    <div className="home-page">
      <section className="hero glow-card">
        <div className="hero-decoration">
          ✦
        </div>

        <div className="hero-copy">
          <div className="eyebrow">
            Original character archive
          </div>

          <h1>
            Your characters.
            <br />
            Your world.
          </h1>

          <p>
            A personal archive for
            characters, relationships,
            organizations and lore.
          </p>

          <div className="hero-actions">
            <Button
              variant="primary"
              onClick={() =>
                onNavigate("characters")
              }
            >
              Open character archive
            </Button>

            <Button
              onClick={() =>
                onNavigate(
                  "organizations"
                )
              }
            >
              Organizations
            </Button>
          </div>
        </div>

        <div className="hero-symbol">
          ☾
        </div>
      </section>

      <section className="stats-overview">
        <div
          className="overview-card glow-card"
          onClick={() =>
            onNavigate("characters")
          }
        >
          <span>Characters</span>
          <strong>
            {characters.length}
          </strong>
        </div>

        <div
          className="overview-card glow-card"
          onClick={() =>
            onNavigate(
              "organizations"
            )
          }
        >
          <span>Organizations</span>
          <strong>
            {organizations.length}
          </strong>
        </div>

        <div
          className="overview-card glow-card"
          onClick={() =>
            onNavigate("lore")
          }
        >
          <span>Lore entries</span>
          <strong>
            {lore.length}
          </strong>
        </div>
      </section>

      <section className="theme-summary glow-card">
        <div>
          <div className="eyebrow">
            Archive atmosphere
          </div>

          <h2>
            Six worlds, one archive.
          </h2>

          <p>
            Switch between Goth, Circus,
            Forest, Detective, Mafia and
            Asylum whenever you want.
          </p>
        </div>

        <div className="theme-mark">
          ✦
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   CHARACTER ARCHIVE
========================================================= */

function CharactersPage({
  characters,
  onNew,
  onOpen,
  onEdit,
  onDelete,
}) {
  const [search, setSearch] =
    useState("");

  const filtered = useMemo(() => {
    const query =
      search.toLowerCase().trim();

    if (!query) return characters;

    return characters.filter(
      (character) =>
        displayName(character)
          .toLowerCase()
          .includes(query) ||
        character.nicknames
          ?.toLowerCase()
          .includes(query) ||
        character.affiliation
          ?.toLowerCase()
          .includes(query) ||
        character.job
          ?.toLowerCase()
          .includes(query)
    );
  }, [characters, search]);

  return (
    <div className="archive-page">
      <div className="page-header">
        <div>
          <div className="eyebrow">
            Character archive
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
          onClick={onNew}
        >
          + New character
        </Button>
      </div>

      <div className="archive-tools">
        <input
          className="search-box"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Search characters..."
        />

        <span className="archive-count">
          {filtered.length} shown
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state glow-card">
          <div>☾</div>

          <h2>
            {characters.length === 0
              ? "Your archive is empty"
              : "No characters found"}
          </h2>

          <p>
            {characters.length === 0
              ? "Create your first character to begin."
              : "Try another search."}
          </p>

          {characters.length === 0 && (
            <Button
              variant="primary"
              onClick={onNew}
            >
              Create character
            </Button>
          )}
        </div>
      ) : (
        <div className="character-grid">
          {filtered.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onOpen={() =>
                onOpen(character)
              }
              onEdit={() =>
                onEdit(character)
              }
              onDelete={() =>
                onDelete(character.id)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   DATA PAGE
========================================================= */

function DataPage({
  characters,
  organizations,
  lore,
  onImport,
}) {
  const fileRef = useRef(null);

  function exportData() {
    const data = {
      version: 2,
      exportedAt:
        new Date().toISOString(),
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

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;
    anchor.download =
      "oc-archive-backup.json";

    anchor.click();

    URL.revokeObjectURL(url);
  }

  async function importFile(
    event
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    try {
      const text =
        await file.text();

      const data =
        JSON.parse(text);

      if (
        !Array.isArray(
          data.characters
        )
      ) {
        throw new Error(
          "Invalid archive"
        );
      }

      onImport(data);

      alert(
        "Archive imported successfully."
      );
    } catch {
      alert(
        "This file is not a valid OC Archive backup."
      );
    }

    event.target.value = "";
  }

  return (
    <div className="archive-page">
      <div className="page-header">
        <div>
          <div className="eyebrow">
            Archive management
          </div>

          <h1>
            Import / Export
          </h1>

          <p>
            Keep a backup of your entire
            archive.
          </p>
        </div>
      </div>

      <div className="import-export-grid">
        <section className="data-card glow-card">
          <div className="data-icon">
            ↓
          </div>

          <h2>Export archive</h2>

          <p>
            Download your characters,
            organizations and lore as one
            JSON file.
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

          <h2>Import archive</h2>

          <p>
            Restore a previous OC Archive
            backup.
          </p>

          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={importFile}
          />

          <Button
            variant="primary"
            onClick={() =>
              fileRef.current?.click()
            }
          >
            Choose JSON
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
  const [theme, setTheme] =
    useState(getTheme());

  const [page, setPage] =
    useState("home");

  const [characters, setCharacters] =
    useState(() =>
      readStorage(
        "oc-characters",
        []
      ).map(normalizeCharacter)
    );

  const [organizations, setOrganizations] =
    useState(() =>
      readStorage(
        "oc-organizations",
        []
      )
    );

  const [lore, setLore] =
    useState(() =>
      readStorage(
        "oc-lore",
        []
      )
    );

  const [
    selectedCharacter,
    setSelectedCharacter,
  ] = useState(null);

  const [
    editingCharacter,
    setEditingCharacter,
  ] = useState(null);

  const [
    editingOrganization,
    setEditingOrganization,
  ] = useState(null);

  const [
    editingLore,
    setEditingLore,
  ] = useState(null);

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

  function changeTheme(
    nextTheme
  ) {
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }

  function saveCharacter(
    character
  ) {
    setCharacters((current) => {
      const exists = current.some(
        (item) =>
          item.id === character.id
      );

      return exists
        ? current.map((item) =>
            item.id === character.id
              ? normalizeCharacter(
                  character
                )
              : item
          )
        : [
            ...current,
            normalizeCharacter(
              character
            ),
          ];
    });

    setEditingCharacter(null);
    setSelectedCharacter(
      character
    );
    setPage("profile");
  }

  function deleteCharacter(
    id
  ) {
    if (
      !window.confirm(
        "Delete this character?"
      )
    ) {
      return;
    }

    setCharacters((current) =>
      current.filter(
        (character) =>
          character.id !== id
      )
    );

    setOrganizations(
      (current) =>
        current.map(
          (organization) => ({
            ...organization,
            members:
              organization.members?.filter(
                (memberId) =>
                  memberId !== id
              ) || [],
            branches:
              organization.branches?.map(
                (branch) => ({
                  ...branch,
                  members:
                    branch.members?.filter(
                      (memberId) =>
                        memberId !== id
                    ) || [],
                })
              ) || [],
          })
        )
    );

    setPage("characters");
  }

  function saveOrganization(
    organization
  ) {
    setOrganizations((current) => {
      const exists = current.some(
        (item) =>
          item.id ===
          organization.id
      );

      return exists
        ? current.map((item) =>
            item.id ===
            organization.id
              ? organization
              : item
          )
        : [
            ...current,
            organization,
          ];
    });

    setEditingOrganization(
      null
    );

    setPage("organizations");
  }

  function deleteOrganization(
    id
  ) {
    if (
      !window.confirm(
        "Delete this organization?"
      )
    ) {
      return;
    }

    setOrganizations((current) =>
      current.filter(
        (organization) =>
          organization.id !== id
      )
    );
  }

  function saveLore(entry) {
    setLore((current) => {
      const exists = current.some(
        (item) =>
          item.id === entry.id
      );

      return exists
        ? current.map((item) =>
            item.id === entry.id
              ? entry
              : item
          )
        : [...current, entry];
    });

    setEditingLore(null);
    setPage("lore");
  }

  function deleteLore(id) {
    if (
      !window.confirm(
        "Delete this lore entry?"
      )
    ) {
      return;
    }

    setLore((current) =>
      current.filter(
        (entry) => entry.id !== id
      )
    );
  }

  function importData(data) {
    setCharacters(
      (data.characters || []).map(
        normalizeCharacter
      )
    );

    setOrganizations(
      data.organizations || []
    );

    setLore(data.lore || []);

    setSelectedCharacter(null);
    setEditingCharacter(null);
    setEditingOrganization(
      null
    );
    setEditingLore(null);

    setPage("home");
  }

  function navigate(
    nextPage
  ) {
    setPage(nextPage);
    setSelectedCharacter(null);
    setEditingCharacter(null);
    setEditingOrganization(
      null
    );
    setEditingLore(null);
  }

  const pageContent =
    page === "home" ? (
      <HomePage
        characters={characters}
        organizations={organizations}
        lore={lore}
        onNavigate={navigate}
      />
    ) : page === "characters" ? (
      <CharactersPage
        characters={characters}
        onNew={() => {
          setEditingCharacter(
            makeEmptyCharacter()
          );
          setPage("character-editor");
        }}
        onOpen={(character) => {
          setSelectedCharacter(
            character
          );
          setPage("profile");
        }}
        onEdit={(character) => {
          setEditingCharacter(
            character
          );
          setPage("character-editor");
        }}
        onDelete={deleteCharacter}
      />
    ) : page === "character-editor" ? (
      <CharacterEditor
        character={
          editingCharacter ||
          makeEmptyCharacter()
        }
        characters={characters}
        onSave={saveCharacter}
        onCancel={() =>
          navigate("characters")
        }
      />
    ) : page === "profile" &&
      selectedCharacter ? (
      <CharacterProfile
        character={
          characters.find(
            (character) =>
              character.id ===
              selectedCharacter.id
          ) ||
          selectedCharacter
        }
        characters={characters}
        organizations={organizations}
        onBack={() =>
          navigate("characters")
        }
        onEdit={() => {
          const current =
            characters.find(
              (character) =>
                character.id ===
                selectedCharacter.id
            );

          setEditingCharacter(
            current ||
              selectedCharacter
          );

          setPage(
            "character-editor"
          );
        }}
      />
    ) : page === "organizations" ? (
      <OrganizationsPage
        organizations={organizations}
        characters={characters}
        onNew={() => {
          setEditingOrganization(
            makeEmptyOrganization()
          );
          setPage(
            "organization-editor"
          );
        }}
        onEdit={(organization) => {
          setEditingOrganization(
            organization
          );
          setPage(
            "organization-editor"
          );
        }}
        onDelete={
          deleteOrganization
        }
      />
    ) : page ===
      "organization-editor" ? (
      <OrganizationEditor
        organization={
          editingOrganization ||
          makeEmptyOrganization()
        }
        characters={characters}
        onSave={saveOrganization}
        onCancel={() =>
          navigate(
            "organizations"
          )
        }
      />
    ) : page === "lore" ? (
      <LorePage
        lore={lore}
        onNew={() => {
          setEditingLore(
            makeEmptyLore()
          );
          setPage("lore-editor");
        }}
        onEdit={(entry) => {
          setEditingLore(entry);
          setPage("lore-editor");
        }}
        onDelete={deleteLore}
      />
    ) : page === "lore-editor" ? (
      <LoreEditor
        entry={
          editingLore ||
          makeEmptyLore()
        }
        onSave={saveLore}
        onCancel={() =>
          navigate("lore")
        }
      />
    ) : page === "data" ? (
      <DataPage
        characters={characters}
        organizations={organizations}
        lore={lore}
        onImport={importData}
      />
    ) : (
      <HomePage
        characters={characters}
        organizations={organizations}
        lore={lore}
        onNavigate={navigate}
      />
    );

  return (
    <div className="site-shell">
      <header className="topbar">
        <button
          className="brand"
          onClick={() =>
            navigate("home")
          }
        >
          <span className="brand-symbol">
            ✦
          </span>

          <span>
            <strong>OC</strong>
            <small>ARCHIVE</small>
          </span>
        </button>

        <nav className="archive-nav">
          <button
            className={
              page === "home"
                ? "nav-active"
                : ""
            }
            onClick={() =>
              navigate("home")
            }
          >
            Home
          </button>

          <button
            className={
              [
                "characters",
                "character-editor",
                "profile",
              ].includes(page)
                ? "nav-active"
                : ""
            }
            onClick={() =>
              navigate("characters")
            }
          >
            Characters
          </button>

          <button
            className={
              [
                "organizations",
                "organization-editor",
              ].includes(page)
                ? "nav-active"
                : ""
            }
            onClick={() =>
              navigate(
                "organizations"
              )
            }
          >
            Organizations
          </button>

          <button
            className={
              ["lore", "lore-editor"].includes(
                page
              )
                ? "nav-active"
                : ""
            }
            onClick={() =>
              navigate("lore")
            }
          >
            Lore
          </button>

          <button
            className={
              page === "data"
                ? "nav-active"
                : ""
            }
            onClick={() =>
              navigate("data")
            }
          >
            Data
          </button>
        </nav>

        <label className="theme-picker">
          <span>Theme</span>

          <select
            value={theme}
            onChange={(event) =>
              changeTheme(
                event.target.value
              )
            }
          >
            {THEMES.map((item) => (
              <option
                value={item.id}
                key={item.id}
              >
                {item.symbol}{" "}
                {item.name}
              </option>
            ))}
          </select>
        </label>
      </header>

      <main className="main-content">
        {pageContent}
      </main>

      <footer className="footer">
        <span>
          OC Archive
        </span>

        <span>
          Your characters · Your world
        </span>
      </footer>
    </div>
  );
}
