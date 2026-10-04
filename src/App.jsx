import { useEffect, useMemo, useRef, useState } from "react";
import { THEMES, applyTheme, getTheme } from "./themes";

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

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can fail if browser storage is unavailable.
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

function displayName(character) {
  if (!character) return "Unknown";

  const name = [character.name, character.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || "Unnamed character";
}

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

function normalizeOrganization(organization = {}) {
  const base = makeEmptyOrganization();

  return {
    ...base,
    ...organization,

    members: Array.isArray(organization.members)
      ? organization.members
      : [],

    branches: Array.isArray(organization.branches)
      ? organization.branches.map((branch) => ({
          ...makeEmptyBranch(),
          ...branch,
          members: Array.isArray(branch.members)
            ? branch.members
            : [],
        }))
      : [],
  };
}

function normalizeLore(lore = {}) {
  return {
    ...makeEmptyLore(),
    ...lore,
  };
}

/* =========================================================
   SMALL UI COMPONENTS
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
        {options.map((option) => {
          const item =
            typeof option === "string"
              ? {
                  value: option,
                  label: option,
                }
              : option;

          return (
            <option
              key={item.value}
              value={item.value}
            >
              {item.label}
            </option>
          );
        })}
      </select>
    </label>
  );
}

function Section({
  title,
  eyebrow,
  children,
}) {
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

        <span className="section-symbol">
          ✦
        </span>
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
            Unlimited relationships
          </strong>

          <p>
            Add as many family members, friends,
            enemies, lovers, rivals and custom
            relationships as you need.
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
          {relationships.map(
            (relationship) => (
              <div
                className="relationship-card"
                key={relationship.id}
              >
                <div className="relationship-card-heading">
                  <span>
                    {relationship.type ===
                    "Other"
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
                    <span>
                      Choose existing character
                    </span>

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
                              character.id ===
                              id
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
                    placeholder="Can also be someone not in the archive"
                  />

                  <Field
                    label="Relationship status"
                    value={
                      relationship.status
                    }
                    placeholder="Close, complicated, deceased..."
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
                      placeholder="Handler, soulmate, guardian..."
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
            )
          )}
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
            {form.name || "New character"}
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
          label="Character / appearance picture"
          value={form.image}
          onChange={(value) =>
            update("image", value)
          }
        />
      </Section>

      <Section
        title="Status, work & affiliations"
        eyebrow="02"
      >
        <div className="form-grid">
          <SelectField
            label="Current status"
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
            placeholder="What happens later?"
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
            value={form.pastAffiliation}
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
        </div>
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
                  form.personality[left] ||
                  3
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
        title="Social stats"
        eyebrow="06"
      >
        <div className="skills-list">
          {SOCIAL_STATS.map((stat) => (
            <SkillBar
              key={stat}
              name={stat}
              value={
                form.socialStats[stat] ||
                3
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
        title="Personal details"
        eyebrow="07"
      >
        <div className="form-grid">
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
              update(
                "sickness",
                value
              )
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
        </div>
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
          label="Appearance, clothes, atmosphere, references..."
          value={form.moodboard}
          multiple
          onChange={(value) =>
            update(
              "moodboard",
              value
            )
          }
        />
      </Section>

      <div className="editor-actions bottom-actions">
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
   CHARACTER PROFILE
========================================================= */

function CharacterProfile({
  character,
  characters,
  organizations,
  onBack,
  onEdit,
}) {
  const relationships =
    character.relationships || [];

  const memberships =
    organizations.flatMap((organization) => {
      const result = [];

      if (
        organization.members.includes(
          character.id
        )
      ) {
        result.push({
          organization:
            organization.name,
          branch: "Main organization",
        });
      }

      organization.branches.forEach(
        (branch) => {
          if (
            branch.members.includes(
              character.id
            )
          ) {
            result.push({
              organization:
                organization.name,
              branch: branch.name,
            });
          }
        }
      );

      return result;
    });

  return (
    <div className="profile-page">
      <div className="page-header">
        <div>
          <div className="eyebrow">
            Character profile
          </div>

          <h1>
            {displayName(character)}
          </h1>

          <p>
            {character.nicknames ||
              "No nickname recorded."}
          </p>
        </div>

        <div className="editor-actions">
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
      </div>

      <div className="profile-grid">
        <section className="profile-section">
          {character.image ? (
            <img
              className="profile-image"
              src={character.image}
              alt={displayName(character)}
            />
          ) : (
            <div className="empty-state">
              No main image.
            </div>
          )}
        </section>

        <section className="profile-section">
          <h2>Identity</h2>

          <dl>
            <dt>Name</dt>
            <dd>
              {displayName(character)}
            </dd>

            <dt>Nicknames</dt>
            <dd>
              {character.nicknames ||
                "—"}
            </dd>

            <dt>Age</dt>
            <dd>
              {character.age || "—"}
            </dd>

            <dt>Pronouns</dt>
            <dd>
              {character.pronouns ||
                "—"}
            </dd>

            <dt>Gender</dt>
            <dd>
              {character.gender || "—"}
            </dd>

            <dt>Sexuality</dt>
            <dd>
              {character.sexuality ||
                "—"}
            </dd>

            <dt>Nationality</dt>
            <dd>
              {character.nationality ||
                "—"}
            </dd>

            <dt>Origins</dt>
            <dd>
              {character.origins || "—"}
            </dd>

            <dt>Species</dt>
            <dd>
              {character.species || "—"}
            </dd>
          </dl>
        </section>

        <section className="profile-section">
          <h2>Status & career</h2>

          <dl>
            <dt>Status</dt>
            <dd>
              {character.status}
            </dd>

            <dt>Later status</dt>
            <dd>
              {character.laterStatus ||
                "—"}
            </dd>

            <dt>Job</dt>
            <dd>
              {character.job || "—"}
            </dd>

            <dt>Side job</dt>
            <dd>
              {character.sideJob || "—"}
            </dd>

            <dt>Affiliation</dt>
            <dd>
              {character.affiliation ||
                "—"}
            </dd>

            <dt>Past affiliation</dt>
            <dd>
              {character.pastAffiliation ||
                "—"}
            </dd>

            <dt>Rank</dt>
            <dd>
              {character.rank || "—"}
            </dd>

            <dt>Past rank</dt>
            <dd>
              {character.pastRank || "—"}
            </dd>
          </dl>
        </section>

        <section className="profile-section">
          <h2>Appearance</h2>

          <dl>
            <dt>Height</dt>
            <dd>
              {character.height || "—"}
            </dd>

            <dt>Weight</dt>
            <dd>
              {character.weight || "—"}
            </dd>

            <dt>Eyes</dt>
            <dd>
              {character.eyeColor || "—"}
            </dd>

            <dt>Hair</dt>
            <dd>
              {character.hairColor || "—"}
            </dd>

            <dt>Hair style</dt>
            <dd>
              {character.hairStyle || "—"}
            </dd>
          </dl>
        </section>

        <section className="profile-section profile-wide">
          <h2>Ability</h2>

          <h3>
            {character.ability ||
              "No ability recorded."}
          </h3>

          <p>
            {character.abilityDescription ||
              "No description."}
          </p>

          <h3>Side effects & risks</h3>

          <p>
            {character.sideEffects ||
              "None recorded."}
          </p>

          <h3>Weapon</h3>

          <p>
            {character.weapon || "—"}
          </p>

          <h3>MBTI</h3>

          <p>
            {character.mbti || "—"}
          </p>
        </section>

        <section className="profile-section">
          <h2>Personality</h2>

          <div className="stats-list">
            {PERSONALITY_STATS.map(
              ([left, right]) => (
                <StatBar
                  key={left}
                  left={left}
                  right={right}
                  value={
                    character.personality[
                      left
                    ] || 3
                  }
                  onChange={() => {}}
                />
              )
            )}
          </div>
        </section>

        <section className="profile-section">
          <h2>Skills</h2>

          <div className="skills-list">
            {SKILLS.map((skill) => (
              <SkillBar
                key={skill}
                name={skill}
                value={
                  character.skills[skill] ||
                  3
                }
                onChange={() => {}}
              />
            ))}
          </div>
        </section>

        <section className="profile-section">
          <h2>Personal</h2>

          <h3>Fears</h3>
          <p>
            {character.fears || "—"}
          </p>

          <h3>Sickness</h3>
          <p>
            {character.sickness || "—"}
          </p>

          <h3>Addictions</h3>
          <p>
            {character.addictions ||
              "—"}
          </p>

          <h3>Likes</h3>
          <p>
            {character.likes || "—"}
          </p>

          <h3>Dislikes</h3>
          <p>
            {character.dislikes || "—"}
          </p>
        </section>

        <section className="profile-section">
          <h2>Organizations</h2>

          {memberships.length === 0 ? (
            <div className="empty-mini">
              No organization membership.
            </div>
          ) : (
            <div className="organization-memberships">
              {memberships.map(
                (membership, index) => (
                  <div
                    className="membership-card"
                    key={`${membership.organization}-${membership.branch}-${index}`}
                  >
                    <strong>
                      {
                        membership.organization
                      }
                    </strong>

                    <p>
                      {membership.branch}
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        <section className="profile-section profile-wide">
          <h2>Relationships</h2>

          {relationships.length ===
          0 ? (
            <div className="empty-mini">
              No relationships.
            </div>
          ) : (
            <div className="relationship-list">
              {relationships.map(
                (relationship) => {
                  const target =
                    characters.find(
                      (person) =>
                        person.id ===
                        relationship.targetId
                    );

                  return (
                    <div
                      className="relationship-card"
                      key={relationship.id}
                    >
                      <div className="relationship-card-heading">
                        <span>
                          {relationship.type ===
                          "Other"
                            ? relationship.customType ||
                              "Custom"
                            : relationship.type}
                        </span>
                      </div>

                      <h3>
                        {target
                          ? displayName(target)
                          : relationship.personName ||
                            "Unknown person"}
                      </h3>

                      {relationship.status && (
                        <p>
                          Status:{" "}
                          {
                            relationship.status
                          }
                        </p>
                      )}

                      {relationship.description && (
                        <p>
                          {
                            relationship.description
                          }
                        </p>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>

        <section className="profile-section profile-wide">
          <h2>Moodboard</h2>

          {character.moodboard.length ===
          0 ? (
            <div className="empty-mini">
              No moodboard images.
            </div>
          ) : (
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
          )}
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   CHARACTER ARCHIVE
========================================================= */

function CharacterArchive({
  characters,
  onCreate,
  onOpen,
  onEdit,
  onDelete,
}) {
  const [search, setSearch] =
    useState("");

  const filtered =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) return characters;

      return characters.filter(
        (character) =>
          [
            character.name,
            character.lastName,
            character.nicknames,
            character.job,
            character.affiliation,
            character.nationality,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query)
      );
    }, [characters, search]);

  return (
    <div className="archive-page">
      <div className="archive-header">
        <div>
          <div className="eyebrow">
            Character archive
          </div>

          <h1>Characters</h1>

          <p>
            Your complete original character
            database.
          </p>
        </div>

        <div className="archive-tools">
          <Button
            variant="primary"
            onClick={onCreate}
          >
            + New character
          </Button>
        </div>
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

        <div className="archive-count">
          {filtered.length} character
          {filtered.length === 1
            ? ""
            : "s"}
        </div>
      </div>

      <div className="character-grid">
        {filtered.map((character) => (
          <article
            className="character-card"
            key={character.id}
          >
            {character.image ? (
              <img
                className="character-image"
                src={character.image}
                alt={displayName(character)}
              />
            ) : (
              <div className="character-image character-image-empty">
                ✦
              </div>
            )}

            <div className="character-card-content">
              <div className="character-card-top">
                <div>
                  <h3>
                    {displayName(character)}
                  </h3>

                  {character.nicknames && (
                    <div className="nickname">
                      {character.nicknames}
                    </div>
                  )}
                </div>

                <span
                  className={
                    character.status ===
                    "dead"
                      ? "badge-dead"
                      : "badge-alive"
                  }
                >
                  {character.status}
                </span>
              </div>

              <p className="character-summary">
                {character.job ||
                  character.affiliation ||
                  character.species ||
                  "Character"}
              </p>

              <div className="character-card-actions">
                <Button
                  variant="primary"
                  onClick={() =>
                    onOpen(character.id)
                  }
                >
                  View
                </Button>

                <Button
                  onClick={() =>
                    onEdit(character.id)
                  }
                >
                  Edit
                </Button>

                <Button
                  variant="danger"
                  onClick={() =>
                    onDelete(character.id)
                  }
                >
                  Delete
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          {characters.length === 0
            ? "No characters yet. Create your first one."
            : "No characters match your search."}
        </div>
      )}
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
  const [form, setForm] =
    useState(
      normalizeOrganization(
        organization
      )
    );

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function toggleMember(id) {
    setForm((current) => ({
      ...current,
      members: current.members.includes(
        id
      )
        ? current.members.filter(
            (memberId) =>
              memberId !== id
          )
        : [...current.members, id],
    }));
  }

  function addBranch() {
    setForm((current) => ({
      ...current,
      branches: [
        ...current.branches,
        makeEmptyBranch(),
      ],
    }));
  }

  function updateBranch(
    branchId,
    field,
    value
  ) {
    setForm((current) => ({
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
  }

  function deleteBranch(branchId) {
    setForm((current) => ({
      ...current,
      branches: current.branches.filter(
        (branch) =>
          branch.id !== branchId
      ),
    }));
  }

  function toggleBranchMember(
    branchId,
    characterId
  ) {
    setForm((current) => ({
      ...current,
      branches: current.branches.map(
        (branch) => {
          if (branch.id !== branchId) {
            return branch;
          }

          return {
            ...branch,
            members:
              branch.members.includes(
                characterId
              )
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

          <p>
            Build organizations, branches and
            memberships.
          </p>
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
        </div>

        <ImageUpload
          label="Organization image"
          value={form.image}
          onChange={(value) =>
            update("image", value)
          }
        />
      </Section>

      <Section
        title="Organization members"
        eyebrow="02"
      >
        <div className="member-selector">
          {characters.length === 0 ? (
            <div className="empty-mini">
              Create characters first.
            </div>
          ) : (
            characters.map((character) => (
              <label
                className="member-option"
                key={character.id}
              >
                <input
                  type="checkbox"
                  checked={form.members.includes(
                    character.id
                  )}
                  onChange={() =>
                    toggleMember(
                      character.id
                    )
                  }
                />

                <span>
                  {displayName(character)}
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
        <div className="section-heading">
          <div>
            <h3>
              Organization branches
            </h3>

            <p>
              A character can belong to
              several branches.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={addBranch}
          >
            + Add branch
          </Button>
        </div>

        {form.branches.length === 0 ? (
          <div className="empty-mini">
            No branches yet.
          </div>
        ) : (
          <div className="branch-list">
            {form.branches.map(
              (branch) => (
                <div
                  className="branch"
                  key={branch.id}
                >
                  <div className="form-grid">
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
                    />

                    <TextField
                      label="Branch description"
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
                    />
                  </div>

                  <h3>
                    Branch members
                  </h3>

                  <div className="member-selector">
                    {characters.map(
                      (character) => (
                        <label
                          className="member-option"
                          key={character.id}
                        >
                          <input
                            type="checkbox"
                            checked={branch.members.includes(
                              character.id
                            )}
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

                  <div className="upload-actions">
                    <Button
                      variant="danger"
                      onClick={() =>
                        deleteBranch(
                          branch.id
                        )
                      }
                    >
                      Delete branch
                    </Button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </Section>
    </div>
  );
}

/* =========================================================
   ORGANIZATION ARCHIVE
========================================================= */

function OrganizationArchive({
  organizations,
  characters,
  onCreate,
  onEdit,
  onDelete,
}) {
  return (
    <div className="archive-page">
      <div className="archive-header">
        <div>
          <div className="eyebrow">
            World building
          </div>

          <h1>Organizations</h1>

          <p>
            Groups, factions, companies,
            families, institutions and branches.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={onCreate}
        >
          + New organization
        </Button>
      </div>

      <div className="organization-grid">
        {organizations.map(
          (organization) => (
            <article
              className="organization-card"
              key={organization.id}
            >
              {organization.image && (
                <img
                  src={organization.image}
                  alt=""
                />
              )}

              <div className="organization-card-content">
                <h3>
                  {organization.name}
                </h3>

                <p>
                  {organization.description ||
                    "No description."}
                </p>

                <p>
                  <strong>
                    {organization.members.length}
                  </strong>{" "}
                  direct member
                  {organization.members
                    .length === 1
                    ? ""
                    : "s"}
                </p>

                <p>
                  <strong>
                    {organization.branches.length}
                  </strong>{" "}
                  branch
                  {organization.branches
                    .length === 1
                    ? ""
                    : "es"}
                </p>

                <div className="character-card-actions">
                  <Button
                    variant="primary"
                    onClick={() =>
                      onEdit(
                        organization.id
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

      {organizations.length === 0 && (
        <div className="empty-state">
          No organizations yet.
        </div>
      )}
    </div>
  );
}

/* =========================================================
   LORE
========================================================= */

function LoreEditor({
  lore,
  onSave,
  onCancel,
}) {
  const [form, setForm] =
    useState(normalizeLore(lore));

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
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
              "New lore entry"}
          </h1>
        </div>

        <div className="editor-actions">
          <Button onClick={onCancel}>
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={() =>
              onSave({
                ...form,
                id:
                  form.id ||
                  uid("lore"),
                title:
                  form.title.trim() ||
                  "Untitled lore",
              })
            }
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
            placeholder="World, history, event, location..."
            onChange={(value) =>
              update(
                "category",
                value
              )
            }
          />

          <TextField
            label="Content"
            value={form.content}
            onChange={(value) =>
              update(
                "content",
                value
              )
            }
            rows={12}
          />
        </div>
      </Section>
    </div>
  );
}

function LorePage({
  lore,
  onCreate,
  onEdit,
  onDelete,
}) {
  return (
    <div className="archive-page">
      <div className="archive-header">
        <div>
          <div className="eyebrow">
            World building
          </div>

          <h1>Lore</h1>

          <p>
            Keep your universe, history and
            world-building notes together.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={onCreate}
        >
          + New lore
        </Button>
      </div>

      <div className="lore-grid">
        {lore.map((entry) => (
          <article
            className="lore-card"
            key={entry.id}
          >
            <span className="lore-category">
              {entry.category ||
                "Uncategorized"}
            </span>

            <h2>{entry.title}</h2>

            <p>
              {entry.content ||
                "No content yet."}
            </p>

            <div className="character-card-actions">
              <Button
                onClick={() =>
                  onEdit(entry.id)
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

      {lore.length === 0 && (
        <div className="empty-state">
          No lore entries yet.
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
  const inputRef = useRef(null);

  function exportData() {
    const data = {
      version: 1,
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

  async function importData(event) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    try {
      const text =
        await file.text();

      const data =
        JSON.parse(text);

      onImport(data);
    } catch {
      alert(
        "This file is not a valid OC Archive backup."
      );
    }

    event.target.value = "";
  }

  return (
    <div className="import-export-page">
      <div className="page-header">
        <div>
          <div className="eyebrow">
            Archive management
          </div>

          <h1>
            Import / Export
          </h1>

          <p>
            Back up your characters,
            organizations and lore.
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
            Download everything as one JSON
            backup file.
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
   HOME
========================================================= */

function HomePage({
  characters,
  organizations,
  lore,
  theme,
  onCharacters,
  onOrganizations,
  onLore,
}) {
  const currentTheme =
    THEMES.find(
      (item) => item.id === theme
    ) || THEMES[0];

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            Personal OC database
          </div>

          <h1>
            Your characters.
            <br />
            Your universe.
          </h1>

          <p>
            Build detailed original characters,
            relationships, organizations,
            branches and lore in one place.
          </p>

          <div className="hero-actions">
            <Button
              variant="primary"
              onClick={onCharacters}
            >
              Open characters
            </Button>

            <Button
              onClick={onOrganizations}
            >
              Organizations
            </Button>

            <Button onClick={onLore}>
              Lore
            </Button>
          </div>
        </div>

        <div className="hero-symbol">
          {currentTheme.symbol}
        </div>
      </section>

      <div className="stats-overview">
        <div className="overview-card">
          <strong>
            {characters.length}
          </strong>

          <span>Characters</span>
        </div>

        <div className="overview-card">
          <strong>
            {organizations.length}
          </strong>

          <span>Organizations</span>
        </div>

        <div className="overview-card">
          <strong>
            {lore.length}
          </strong>

          <span>Lore entries</span>
        </div>
      </div>

      <div className="section-heading">
        <div>
          <h2>
            OC Archive
          </h2>

          <p>
            Everything is saved automatically
            in this browser.
          </p>
        </div>

        <div className="theme-summary">
          <div className="theme-mark">
            {currentTheme.symbol}
          </div>

          <span>
            {currentTheme.name} theme
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN APP
========================================================= */

export default function App() {
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
      ).map(normalizeOrganization)
    );

  const [lore, setLore] =
    useState(() =>
      readStorage(
        "oc-lore",
        []
      ).map(normalizeLore)
    );

  const [theme, setTheme] =
    useState(getTheme());

  const [page, setPage] =
    useState("home");

  const [editingCharacterId, setEditingCharacterId] =
    useState(null);

  const [viewingCharacterId, setViewingCharacterId] =
    useState(null);

  const [editingOrganizationId, setEditingOrganizationId] =
    useState(null);

  const [editingLoreId, setEditingLoreId] =
    useState(null);

  useEffect(() => {
    writeStorage(
      "oc-characters",
      characters
    );
  }, [characters]);

  useEffect(() => {
    writeStorage(
      "oc-organizations",
      organizations
    );
  }, [organizations]);

  useEffect(() => {
    writeStorage(
      "oc-lore",
      lore
    );
  }, [lore]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function changeTheme(value) {
    setTheme(value);
    applyTheme(value);
  }

  function createCharacter() {
    setEditingCharacterId("new");
    setViewingCharacterId(null);
  }

  function editCharacter(id) {
    setEditingCharacterId(id);
    setViewingCharacterId(null);
  }

  function openCharacter(id) {
    setViewingCharacterId(id);
    setEditingCharacterId(null);
  }

  function saveCharacter(character) {
    setCharacters((current) => {
      const exists = current.some(
        (item) =>
          item.id === character.id
      );

      if (exists) {
        return current.map((item) =>
          item.id === character.id
            ? normalizeCharacter(
                character
              )
            : item
        );
      }

      return [
        ...current,
        normalizeCharacter(
          character
        ),
      ];
    });

    setEditingCharacterId(null);
    setViewingCharacterId(
      character.id
    );

    setPage("characters");
  }

  function deleteCharacter(id) {
    const character =
      characters.find(
        (item) => item.id === id
      );

    if (!character) return;

    const confirmed =
      window.confirm(
        `Delete ${displayName(
          character
        )}? This cannot be undone.`
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

    setViewingCharacterId(null);
  }

  function createOrganization() {
    setEditingOrganizationId(
      "new"
    );
  }

  function editOrganization(id) {
    setEditingOrganizationId(id);
  }

  function saveOrganization(
    organization
  ) {
    setOrganizations((current) => {
      const exists = current.some(
        (item) =>
          item.id === organization.id
      );

      if (exists) {
        return current.map((item) =>
          item.id === organization.id
            ? normalizeOrganization(
                organization
              )
            : item
        );
      }

      return [
        ...current,
        normalizeOrganization(
          organization
        ),
      ];
    });

    setEditingOrganizationId(null);
  }

  function deleteOrganization(id) {
    const organization =
      organizations.find(
        (item) => item.id === id
      );

    if (!organization) return;

    if (
      !window.confirm(
        `Delete ${organization.name}?`
      )
    ) {
      return;
    }

    setOrganizations((current) =>
      current.filter(
        (item) => item.id !== id
      )
    );
  }

  function createLore() {
    setEditingLoreId("new");
  }

  function editLore(id) {
    setEditingLoreId(id);
  }

  function saveLore(entry) {
    setLore((current) => {
      const exists = current.some(
        (item) =>
          item.id === entry.id
      );

      if (exists) {
        return current.map((item) =>
          item.id === entry.id
            ? normalizeLore(entry)
            : item
        );
      }

      return [
        ...current,
        normalizeLore(entry),
      ];
    });

    setEditingLoreId(null);
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
        (item) => item.id !== id
      )
    );
  }

  function importArchive(data) {
    if (
      !data ||
      !Array.isArray(data.characters)
    ) {
      alert(
        "This backup does not contain valid character data."
      );

      return;
    }

    if (
      !window.confirm(
        "Import this archive? Your current data will be replaced."
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
      Array.isArray(
        data.organizations
      )
        ? data.organizations.map(
            normalizeOrganization
          )
        : []
    );

    setLore(
      Array.isArray(data.lore)
        ? data.lore.map(
            normalizeLore
          )
        : []
    );

    setPage("home");

    alert(
      "Archive imported successfully."
    );
  }

  function renderPage() {
    if (editingCharacterId) {
      const character =
        editingCharacterId === "new"
          ? makeEmptyCharacter()
          : characters.find(
              (item) =>
                item.id ===
                editingCharacterId
            ) ||
            makeEmptyCharacter();

      return (
        <CharacterEditor
          character={character}
          characters={characters}
          onSave={saveCharacter}
          onCancel={() =>
            setEditingCharacterId(
              null
            )
          }
        />
      );
    }

    if (viewingCharacterId) {
      const character =
        characters.find(
          (item) =>
            item.id ===
            viewingCharacterId
        );

      if (!character) {
        setViewingCharacterId(null);
        return null;
      }

      return (
        <CharacterProfile
          character={character}
          characters={characters}
          organizations={
            organizations
          }
          onBack={() =>
            setViewingCharacterId(
              null
            )
          }
          onEdit={() =>
            editCharacter(
              character.id
            )
          }
        />
      );
    }

    if (editingOrganizationId) {
      const organization =
        editingOrganizationId ===
        "new"
          ? makeEmptyOrganization()
          : organizations.find(
              (item) =>
                item.id ===
                editingOrganizationId
            ) ||
            makeEmptyOrganization();

      return (
        <OrganizationEditor
          organization={
            organization
          }
          characters={characters}
          onSave={
            saveOrganization
          }
          onCancel={() =>
            setEditingOrganizationId(
              null
            )
          }
        />
      );
    }

    if (editingLoreId) {
      const entry =
        editingLoreId === "new"
          ? makeEmptyLore()
          : lore.find(
              (item) =>
                item.id ===
                editingLoreId
            ) ||
            makeEmptyLore();

      return (
        <LoreEditor
          lore={entry}
          onSave={saveLore}
          onCancel={() =>
            setEditingLoreId(null)
          }
        />
      );
    }

    if (page === "characters") {
      return (
        <CharacterArchive
          characters={characters}
          onCreate={createCharacter}
          onOpen={openCharacter}
          onEdit={editCharacter}
          onDelete={
            deleteCharacter
          }
        />
      );
    }

    if (page === "organizations") {
      return (
        <OrganizationArchive
          organizations={
            organizations
          }
          characters={characters}
          onCreate={
            createOrganization
          }
          onEdit={
            editOrganization
          }
          onDelete={
            deleteOrganization
          }
        />
      );
    }

    if (page === "lore") {
      return (
        <LorePage
          lore={lore}
          onCreate={createLore}
          onEdit={editLore}
          onDelete={deleteLore}
        />
      );
    }

    if (page === "data") {
      return (
        <DataPage
          characters={characters}
          organizations={
            organizations
          }
          lore={lore}
          onImport={importArchive}
        />
      );
    }

    return (
      <HomePage
        characters={characters}
        organizations={
          organizations
        }
        lore={lore}
        theme={theme}
        onCharacters={() =>
          setPage("characters")
        }
        onOrganizations={() =>
          setPage("organizations")
        }
        onLore={() =>
          setPage("lore")
        }
      />
    );
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <button
          className="brand"
          type="button"
          onClick={() => {
            setPage("home");
            setViewingCharacterId(
              null
            );
            setEditingCharacterId(
              null
            );
          }}
        >
          <span className="brand-symbol">
            ✦
          </span>

          <span>
            <strong>
              OC ARCHIVE
            </strong>

            <small>
              ORIGINAL CHARACTER DATABASE
            </small>
          </span>
        </button>

        <nav className="archive-nav">
          {NAV_ITEMS.map(
            ([id, label]) => (
              <button
                key={id}
                type="button"
                className={
                  page === id &&
                  !editingCharacterId &&
                  !viewingCharacterId &&
                  !editingOrganizationId &&
                  !editingLoreId
                    ? "nav-active"
                    : ""
                }
                onClick={() => {
                  setPage(id);
                  setViewingCharacterId(
                    null
                  );
                  setEditingCharacterId(
                    null
                  );
                  setEditingOrganizationId(
                    null
                  );
                  setEditingLoreId(
                    null
                  );
                }}
              >
                {label}
              </button>
            )
          )}
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
                key={item.id}
                value={item.id}
              >
                {item.name}
              </option>
            ))}
          </select>
        </label>
      </header>

      <main className="main-content">
        {renderPage()}
      </main>

      <footer className="footer">
        <span>
          OC Archive
        </span>

        <span>
          Saved automatically in your
          browser.
        </span>
      </footer>
    </div>
  );
}
