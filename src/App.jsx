import { useEffect, useMemo, useRef, useState } from "react";
import { THEMES, applyTheme, getTheme } from "./themes";

/* =========================================================
   DATA
   ========================================================= */

const PERSONALITY = [
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

const SOCIAL = [
  "Charisma",
  "Empathy",
  "Generosity",
  "Wealth",
  "Aggression",
  "Libido",
];

const RELATION_TYPES = [
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
    PERSONALITY.map(([left]) => [left, 3])
  ),

  skills: Object.fromEntries(
    SKILLS.map((skill) => [skill, 3])
  ),

  social: Object.fromEntries(
    SOCIAL.map((stat) => [stat, 3])
  ),

  relationships: [],
  organizations: [],
  moodboard: [],
};

const emptyOrganization = {
  id: "",
  name: "",
  description: "",
  image: "",
  branches: [],
};

const emptyLore = {
  id: "",
  title: "",
  category: "",
  content: "",
};

/* =========================================================
   HELPERS
   ========================================================= */

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function load(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors.
  }
}

function imageToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}

function normalizeCharacter(character) {
  return {
    ...emptyCharacter,
    ...character,
    personality: {
      ...emptyCharacter.personality,
      ...(character?.personality || {}),
    },
    skills: {
      ...emptyCharacter.skills,
      ...(character?.skills || {}),
    },
    social: {
      ...emptyCharacter.social,
      ...(character?.social || {}),
    },
    relationships: Array.isArray(character?.relationships)
      ? character.relationships
      : [],
    organizations: Array.isArray(character?.organizations)
      ? character.organizations
      : [],
    moodboard: Array.isArray(character?.moodboard)
      ? character.moodboard
      : [],
  };
}

/* =========================================================
   SMALL UI
   ========================================================= */

function Button({
  children,
  className = "",
  ...props
}) {
  return (
    <button
      className={`button ${className}`}
      {...props}
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
    <label className={wide ? "field field-wide" : "field"}>
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

function Section({ title, children }) {
  return (
    <section className="form-section glow-card">
      <div className="section-title">
        <span className="section-decoration">✦</span>
        <h2>{title}</h2>
      </div>

      {children}
    </section>
  );
}

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

function ImageUpload({
  label,
  value,
  onChange,
  multiple = false,
}) {
  const input = useRef(null);

  async function handleChange(event) {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    try {
      const images = await Promise.all(
        files.map(imageToDataURL)
      );

      if (multiple) {
        onChange(images);
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
      <span>{label}</span>

      <input
        ref={input}
        hidden
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleChange}
      />

      <button
        type="button"
        className="upload-area"
        onClick={() => input.current?.click()}
      >
        {multiple ? (
          value?.length ? (
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

      {value && (
        <div className="upload-actions">
          <Button
            type="button"
            className="secondary"
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
   CHARACTER EDITOR
   ========================================================= */

function CharacterEditor({
  character,
  characters,
  organizations,
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

  function updateNested(group, field, value) {
    setForm((current) => ({
      ...current,
      [group]: {
        ...current[group],
        [field]: value,
      },
    }));
  }

  function saveCharacter() {
    const finalCharacter = {
      ...form,
      id: form.id || uid("character"),
      name: form.name.trim() || "Unnamed character",
    };

    onSave(finalCharacter);
  }

  function addRelationship() {
    setForm((current) => ({
      ...current,
      relationships: [
        ...current.relationships,
        {
          id: uid("relation"),
          characterId: "",
          name: "",
          type: "Friend",
          status: "",
          description: "",
        },
      ],
    }));
  }

  function updateRelationship(id, field, value) {
    setForm((current) => ({
      ...current,
      relationships: current.relationships.map(
        (relation) =>
          relation.id === id
            ? {
                ...relation,
                [field]: value,
              }
            : relation
      ),
    }));
  }

  function removeRelationship(id) {
    setForm((current) => ({
      ...current,
      relationships: current.relationships.filter(
        (relation) => relation.id !== id
      ),
    }));
  }

  function toggleOrganization(id) {
    setForm((current) => {
      const exists = current.organizations.includes(id);

      return {
        ...current,
        organizations: exists
          ? current.organizations.filter(
              (item) => item !== id
            )
          : [...current.organizations, id],
      };
    });
  }

  return (
    <div className="page creator-page">
      <div className="creator-header">
        <div>
          <div className="eyebrow">
            CHARACTER ARCHIVE
          </div>

          <h1>
            {form.name || "New character"}
          </h1>

          <p className="muted">
            Build every detail of your character.
          </p>
        </div>

        <div className="form-actions">
          <Button
            type="button"
            className="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>

          <Button
            type="button"
            className="primary"
            onClick={saveCharacter}
          >
            Save character
          </Button>
        </div>
      </div>

      <Section title="Identity & appearance">
        <div className="form-grid">
          <Field
            label="First name"
            value={form.name}
            onChange={(v) => update("name", v)}
          />

          <Field
            label="Last name"
            value={form.lastName}
            onChange={(v) =>
              update("lastName", v)
            }
          />

          <Field
            label="Nickname(s)"
            value={form.nicknames}
            onChange={(v) =>
              update("nicknames", v)
            }
          />

          <Field
            label="Age"
            value={form.age}
            onChange={(v) => update("age", v)}
          />

          <Field
            label="Pronouns"
            value={form.pronouns}
            onChange={(v) =>
              update("pronouns", v)
            }
          />

          <Field
            label="Date of birth"
            type="date"
            value={form.dateOfBirth}
            onChange={(v) =>
              update("dateOfBirth", v)
            }
          />

          <Field
            label="Gender"
            value={form.gender}
            onChange={(v) => update("gender", v)}
          />

          <Field
            label="Sexuality"
            value={form.sexuality}
            onChange={(v) =>
              update("sexuality", v)
            }
          />

          <Field
            label="Nationality"
            value={form.nationality}
            onChange={(v) =>
              update("nationality", v)
            }
          />

          <Field
            label="Origins"
            value={form.origins}
            onChange={(v) =>
              update("origins", v)
            }
          />

          <Field
            label="Species / race"
            value={form.species}
            onChange={(v) =>
              update("species", v)
            }
          />

          <Field
            label="Height"
            value={form.height}
            onChange={(v) =>
              update("height", v)
            }
          />

          <Field
            label="Weight"
            value={form.weight}
            onChange={(v) =>
              update("weight", v)
            }
          />

          <Field
            label="Eye color"
            value={form.eyeColor}
            onChange={(v) =>
              update("eyeColor", v)
            }
          />

          <Field
            label="Hair color"
            value={form.hairColor}
            onChange={(v) =>
              update("hairColor", v)
            }
          />

          <Field
            label="Hair style"
            value={form.hairStyle}
            onChange={(v) =>
              update("hairStyle", v)
            }
          />
        </div>

        <ImageUpload
          label="Appearance picture"
          value={form.image}
          onChange={(v) => update("image", v)}
        />

        <ImageUpload
          label="Moodboard"
          multiple
          value={form.moodboard}
          onChange={(images) =>
            update("moodboard", [
              ...form.moodboard,
              ...images,
            ])
          }
        />
      </Section>

      <Section title="Status, work & affiliation">
        <div className="form-grid">
          <label className="field">
            <span>Status</span>

            <select
              value={form.status}
              onChange={(e) =>
                update("status", e.target.value)
              }
            >
              <option value="alive">Alive</option>
              <option value="dead">Dead</option>
              <option value="unknown">Unknown</option>
            </select>
          </label>

          <Field
            label="Later status"
            value={form.laterStatus}
            onChange={(v) =>
              update("laterStatus", v)
            }
          />

          <Field
            label="Job"
            value={form.job}
            onChange={(v) => update("job", v)}
          />

          <Field
            label="Side job"
            value={form.sideJob}
            onChange={(v) =>
              update("sideJob", v)
            }
          />

          <Field
            label="Affiliation"
            value={form.affiliation}
            onChange={(v) =>
              update("affiliation", v)
            }
          />

          <Field
            label="Past affiliation"
            value={form.pastAffiliation}
            onChange={(v) =>
              update("pastAffiliation", v)
            }
          />

          <Field
            label="Rank"
            value={form.rank}
            onChange={(v) => update("rank", v)}
          />

          <Field
            label="Past rank"
            value={form.pastRank}
            onChange={(v) =>
              update("pastRank", v)
            }
          />
        </div>
      </Section>

      <Section title="Ability & combat">
        <div className="form-grid">
          <Field
            label="Ability"
            value={form.ability}
            onChange={(v) =>
              update("ability", v)
            }
          />

          <Field
            label="Weapon"
            value={form.weapon}
            onChange={(v) =>
              update("weapon", v)
            }
          />

          <Field
            label="MBTI"
            value={form.mbti}
            onChange={(v) => update("mbti", v)}
          />
        </div>

        <TextField
          label="Ability description"
          value={form.abilityDescription}
          onChange={(v) =>
            update("abilityDescription", v)
          }
        />

        <TextField
          label="Side effects & risks"
          value={form.sideEffects}
          onChange={(v) =>
            update("sideEffects", v)
          }
        />
      </Section>

      <Section title="Personality">
        <div className="stats-list">
          {PERSONALITY.map(([left, right]) => (
            <StatBar
              key={left}
              left={left}
              right={right}
              value={
                form.personality[left] || 3
              }
              onChange={(value) =>
                updateNested(
                  "personality",
                  left,
                  value
                )
              }
            />
          ))}
        </div>
      </Section>

      <Section title="Skills">
        <div className="skills-list">
          {SKILLS.map((skill) => (
            <SkillBar
              key={skill}
              name={skill}
              value={form.skills[skill] || 3}
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

      <Section title="Social statistics">
        <div className="skills-list">
          {SOCIAL.map((stat) => (
            <SkillBar
              key={stat}
              name={stat}
              value={form.social[stat] || 3}
              onChange={(value) =>
                updateNested(
                  "social",
                  stat,
                  value
                )
              }
            />
          ))}
        </div>
      </Section>

      <Section title="Personal information">
        <TextField
          label="Fears"
          value={form.fears}
          onChange={(v) => update("fears", v)}
        />

        <TextField
          label="Sickness"
          value={form.sickness}
          onChange={(v) =>
            update("sickness", v)
          }
        />

        <TextField
          label="Addictions"
          value={form.addictions}
          onChange={(v) =>
            update("addictions", v)
          }
        />

        <TextField
          label="Likes"
          value={form.likes}
          onChange={(v) => update("likes", v)}
        />

        <TextField
          label="Dislikes"
          value={form.dislikes}
          onChange={(v) =>
            update("dislikes", v)
          }
        />
      </Section>

      <Section title="Relationships">
        <div className="relationship-editor">
          {form.relationships.map(
            (relation) => (
              <div
                className="relationship-card"
                key={relation.id}
              >
                <div className="relationship-edit-row">
                  <label className="field">
                    <span>Character</span>

                    <select
                      value={
                        relation.characterId || ""
                      }
                      onChange={(e) => {
                        const id =
                          e.target.value;

                        const target =
                          characters.find(
                            (character) =>
                              character.id === id
                          );

                        updateRelationship(
                          relation.id,
                          "characterId",
                          id
                        );

                        if (target) {
                          updateRelationship(
                            relation.id,
                            "name",
                            `${target.name} ${target.lastName}`.trim()
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
                            form.id
                        )
                        .map((character) => (
                          <option
                            key={character.id}
                            value={character.id}
                          >
                            {character.name}{" "}
                            {character.lastName}
                          </option>
                        ))}
                    </select>
                  </label>

                  <Field
                    label="Name"
                    value={relation.name}
                    onChange={(v) =>
                      updateRelationship(
                        relation.id,
                        "name",
                        v
                      )
                    }
                  />

                  <label className="field">
                    <span>Type</span>

                    <select
                      value={relation.type}
                      onChange={(e) =>
                        updateRelationship(
                          relation.id,
                          "type",
                          e.target.value
                        )
                      }
                    >
                      {RELATION_TYPES.map(
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

                  <Field
                    label="Status"
                    value={relation.status}
                    onChange={(v) =>
                      updateRelationship(
                        relation.id,
                        "status",
                        v
                      )
                    }
                  />
                </div>

                <TextField
                  label="Description"
                  value={relation.description}
                  onChange={(v) =>
                    updateRelationship(
                      relation.id,
                      "description",
                      v
                    )
                  }
                  rows={3}
                />

                <Button
                  type="button"
                  className="danger small"
                  onClick={() =>
                    removeRelationship(
                      relation.id
                    )
                  }
                >
                  Remove relationship
                </Button>
              </div>
            )
          )}

          {!form.relationships.length && (
            <p className="empty-mini">
              No relationships yet.
            </p>
          )}

          <Button
            type="button"
            className="secondary"
            onClick={addRelationship}
          >
            + Add relationship
          </Button>
        </div>
      </Section>

      <Section title="Organizations">
        {organizations.length ? (
          <div className="organization-checks">
            {organizations.map((organization) => (
              <label
                className="organization-check"
                key={organization.id}
              >
                <input
                  type="checkbox"
                  checked={form.organizations.includes(
                    organization.id
                  )}
                  onChange={() =>
                    toggleOrganization(
                      organization.id
                    )
                  }
                />

                <span>
                  {organization.name}
                </span>
              </label>
            ))}
          </div>
        ) : (
          <p className="muted">
            Create organizations first.
          </p>
        )}
      </Section>

      <div className="bottom-save">
        <Button
          type="button"
          className="secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button
          type="button"
          className="primary"
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
  const fullName =
    `${character.name} ${character.lastName}`.trim();

  return (
    <article
      className="character-card glow-card"
      onClick={() => onOpen(character.id)}
    >
      <div className="character-image">
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
          className={
            character.status === "dead"
              ? "badge-dead"
              : "badge-alive"
          }
        >
          {character.status}
        </span>
      </div>

      <div className="character-card-content">
        <div className="character-card-top">
          <div>
            <h3>{fullName || "Unnamed"}</h3>

            {character.nicknames && (
              <span className="nickname">
                “{character.nicknames}”
              </span>
            )}
          </div>

          <button
            className="delete-button"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(character.id);
            }}
          >
            ×
          </button>
        </div>

        <div className="character-summary">
          {character.job && (
            <span>{character.job}</span>
          )}

          {character.affiliation && (
            <span>
              {character.affiliation}
            </span>
          )}

          {character.age && (
            <span>Age {character.age}</span>
          )}
        </div>

        <div className="character-card-actions">
          <Button
            type="button"
            className="secondary small"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(character.id);
            }}
          >
            Edit
          </Button>

          <Button
            type="button"
            className="primary small"
            onClick={(event) => {
              event.stopPropagation();
              onOpen(character.id);
            }}
          >
            Open
          </Button>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   PROFILE
   ========================================================= */

function Profile({
  character,
  organizations,
  onBack,
  onEdit,
}) {
  const fullName =
    `${character.name} ${character.lastName}`.trim();

  const relatedOrganizations =
    organizations.filter((organization) =>
      character.organizations?.includes(
        organization.id
      )
    );

  return (
    <div className="page profile-page">
      <div className="profile-actions">
        <Button
          className="secondary"
          onClick={onBack}
        >
          ← Back
        </Button>

        <Button
          className="primary"
          onClick={onEdit}
        >
          Edit character
        </Button>
      </div>

      <section className="profile-hero glow-card">
        <div className="profile-image">
          {character.image ? (
            <img
              src={character.image}
              alt=""
            />
          ) : (
            <div className="profile-placeholder">
              ✦
            </div>
          )}
        </div>

        <div className="profile-heading">
          <div className="eyebrow">
            CHARACTER FILE
          </div>

          <h1>{fullName || "Unnamed"}</h1>

          {character.nicknames && (
            <p className="profile-nickname">
              “{character.nicknames}”
            </p>
          )}

          <div className="profile-badges">
            <span className="profile-tag">
              {character.status}
            </span>

            {character.species && (
              <span className="profile-tag">
                {character.species}
              </span>
            )}

            {character.mbti && (
              <span className="profile-tag">
                {character.mbti}
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="profile-grid">
        <section className="profile-section glow-card">
          <div className="section-title">
            <span className="section-decoration">
              ✦
            </span>
            <h2>Identity</h2>
          </div>

          <div className="profile-fields">
            {[
              ["Age", character.age],
              ["Pronouns", character.pronouns],
              ["Gender", character.gender],
              ["Sexuality", character.sexuality],
              ["Nationality", character.nationality],
              ["Origins", character.origins],
              ["Date of birth", character.dateOfBirth],
              ["Height", character.height],
              ["Weight", character.weight],
              ["Eye color", character.eyeColor],
              ["Hair color", character.hairColor],
              ["Hair style", character.hairStyle],
            ].map(([label, value]) =>
              value ? (
                <div
                  className="profile-field"
                  key={label}
                >
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ) : null
            )}
          </div>
        </section>

        <section className="profile-section glow-card">
          <div className="section-title">
            <span className="section-decoration">
              ✦
            </span>
            <h2>Work & status</h2>
          </div>

          <div className="profile-fields">
            {[
              ["Status", character.status],
              ["Later status", character.laterStatus],
              ["Job", character.job],
              ["Side job", character.sideJob],
              ["Affiliation", character.affiliation],
              ["Past affiliation", character.pastAffiliation],
              ["Rank", character.rank],
              ["Past rank", character.pastRank],
            ].map(([label, value]) =>
              value ? (
                <div
                  className="profile-field"
                  key={label}
                >
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ) : null
            )}
          </div>
        </section>

        <section className="profile-section glow-card">
          <div className="section-title">
            <span className="section-decoration">
              ✦
            </span>
            <h2>Ability</h2>
          </div>

          <div className="profile-highlight">
            {character.ability || "No ability recorded."}
          </div>

          {character.abilityDescription && (
            <p>{character.abilityDescription}</p>
          )}

          {character.weapon && (
            <div className="profile-field">
              <span>Weapon</span>
              <strong>{character.weapon}</strong>
            </div>
          )}

          {character.sideEffects && (
            <>
              <h3>Side effects & risks</h3>
              <p>{character.sideEffects}</p>
            </>
          )}
        </section>

        <section className="profile-section glow-card">
          <div className="section-title">
            <span className="section-decoration">
              ✦
            </span>
            <h2>Personality</h2>
          </div>

          <div className="profile-stat-list">
            {PERSONALITY.map(([left, right]) => (
              <div
                className="profile-stat"
                key={left}
              >
                <span>{left}</span>

                <div className="mini-pips">
                  {[1, 2, 3, 4, 5].map(
                    (number) => (
                      <i
                        key={number}
                        className={
                          number <=
                          (character.personality[
                            left
                          ] || 3)
                            ? "on"
                            : ""
                        }
                      />
                    )
                  )}
                </div>

                <span>{right}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="profile-section glow-card">
          <div className="section-title">
            <span className="section-decoration">
              ✦
            </span>
            <h2>Skills</h2>
          </div>

          <div className="profile-stat-list">
            {SKILLS.map((skill) => (
              <div
                className="profile-stat"
                key={skill}
              >
                <span>{skill}</span>

                <div className="mini-pips">
                  {[1, 2, 3, 4, 5].map(
                    (number) => (
                      <i
                        key={number}
                        className={
                          number <=
                          (character.skills[
                            skill
                          ] || 3)
                            ? "on"
                            : ""
                        }
                      />
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="profile-section glow-card">
          <div className="section-title">
            <span className="section-decoration">
              ✦
            </span>
            <h2>Social</h2>
          </div>

          <div className="profile-stat-list">
            {SOCIAL.map((stat) => (
              <div
                className="profile-stat"
                key={stat}
              >
                <span>{stat}</span>

                <div className="mini-pips">
                  {[1, 2, 3, 4, 5].map(
                    (number) => (
                      <i
                        key={number}
                        className={
                          number <=
                          (character.social[
                            stat
                          ] || 3)
                            ? "on"
                            : ""
                        }
                      />
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="profile-section glow-card">
          <div className="section-title">
            <span className="section-decoration">
              ✦
            </span>
            <h2>Personal information</h2>
          </div>

          {[
            ["Fears", character.fears],
            ["Sickness", character.sickness],
            ["Addictions", character.addictions],
            ["Likes", character.likes],
            ["Dislikes", character.dislikes],
          ].map(([title, value]) =>
            value ? (
              <div
                className="profile-text-block"
                key={title}
              >
                <h3>{title}</h3>
                <p>{value}</p>
              </div>
            ) : null
          )}
        </section>

        <section className="profile-section glow-card">
          <div className="section-title">
            <span className="section-decoration">
              ✦
            </span>
            <h2>Relationships</h2>
          </div>

          {character.relationships?.length ? (
            <div className="relationship-display">
              {character.relationships.map(
                (relation) => (
                  <div
                    className="relationship-display-card"
                    key={relation.id}
                  >
                    <strong>
                      {relation.name ||
                        "Unknown"}
                    </strong>

                    <span>
                      {relation.type}
                    </span>

                    {relation.status && (
                      <small>
                        {relation.status}
                      </small>
                    )}

                    {relation.description && (
                      <p>
                        {relation.description}
                      </p>
                    )}
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="muted">
              No relationships recorded.
            </p>
          )}
        </section>

        <section className="profile-section glow-card">
          <div className="section-title">
            <span className="section-decoration">
              ✦
            </span>
            <h2>Organizations</h2>
          </div>

          {relatedOrganizations.length ? (
            <div className="organization-memberships">
              {relatedOrganizations.map(
                (organization) => (
                  <div
                    className="mini-card"
                    key={organization.id}
                  >
                    <strong>
                      {organization.name}
                    </strong>
                    <span>
                      {organization.description}
                    </span>
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="muted">
              No organizations.
            </p>
          )}
        </section>
      </div>

      {character.moodboard?.length > 0 && (
        <section className="profile-section glow-card">
          <div className="section-title">
            <span className="section-decoration">
              ✦
            </span>
            <h2>Moodboard</h2>
          </div>

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
        </section>
      )}
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
  const [editing, setEditing] = useState(null);

  function saveOrganization() {
    const organization = {
      ...editing,
      id: editing.id || uid("organization"),
      name:
        editing.name.trim() ||
        "Unnamed organization",
    };

    onSave(organization);
    setEditing(null);
  }

  if (editing) {
    return (
      <div className="page">
        <div className="creator-header">
          <div>
            <div className="eyebrow">
              ORGANIZATIONS
            </div>

            <h1>
              {editing.name ||
                "New organization"}
            </h1>
          </div>

          <div className="form-actions">
            <Button
              className="secondary"
              onClick={() => setEditing(null)}
            >
              Cancel
            </Button>

            <Button
              className="primary"
              onClick={saveOrganization}
            >
              Save organization
            </Button>
          </div>
        </div>

        <section className="form-section glow-card">
          <div className="form-grid">
            <Field
              label="Name"
              value={editing.name}
              onChange={(value) =>
                setEditing({
                  ...editing,
                  name: value,
                })
              }
            />
          </div>

          <TextField
            label="Description"
            value={editing.description}
            onChange={(value) =>
              setEditing({
                ...editing,
                description: value,
              })
            }
          />

          <ImageUpload
            label="Organization image"
            value={editing.image}
            onChange={(value) =>
              setEditing({
                ...editing,
                image: value,
              })
            }
          />
        </section>

        <section className="form-section glow-card">
          <div className="section-title">
            <span className="section-decoration">
              ✦
            </span>
            <h2>Branches</h2>
          </div>

          <div className="branch-editor">
            {editing.branches.map(
              (branch, index) => (
                <div
                  className="branch-card"
                  key={branch.id}
                >
                  <Field
                    label="Branch name"
                    value={branch.name}
                    onChange={(value) => {
                      const branches = [
                        ...editing.branches,
                      ];

                      branches[index] = {
                        ...branch,
                        name: value,
                      };

                      setEditing({
                        ...editing,
                        branches,
                      });
                    }}
                  />

                  <TextField
                    label="Description"
                    value={branch.description}
                    onChange={(value) => {
                      const branches = [
                        ...editing.branches,
                      ];

                      branches[index] = {
                        ...branch,
                        description: value,
                      };

                      setEditing({
                        ...editing,
                        branches,
                      });
                    }}
                    rows={3}
                  />

                  <Button
                    className="danger small"
                    onClick={() =>
                      setEditing({
                        ...editing,
                        branches:
                          editing.branches.filter(
                            (_, i) =>
                              i !== index
                          ),
                      })
                    }
                  >
                    Remove branch
                  </Button>
                </div>
              )
            )}

            <Button
              className="secondary"
              onClick={() =>
                setEditing({
                  ...editing,
                  branches: [
                    ...editing.branches,
                    {
                      id: uid("branch"),
                      name: "",
                      description: "",
                    },
                  ],
                })
              }
            >
              + Add branch
            </Button>
          </div>
        </section>

        <section className="form-section glow-card">
          <div className="section-title">
            <span className="section-decoration">
              ✦
            </span>
            <h2>Members</h2>
          </div>

          <div className="member-list">
            {characters.filter((character) =>
              character.organizations?.includes(
                editing.id
              )
            ).length ? (
              characters
                .filter((character) =>
                  character.organizations?.includes(
                    editing.id
                  )
                )
                .map((character) => (
                  <div
                    className="mini-card"
                    key={character.id}
                  >
                    <strong>
                      {character.name}{" "}
                      {character.lastName}
                    </strong>
                    <span>
                      {character.rank ||
                        character.job ||
                        "Member"}
                    </span>
                  </div>
                ))
            ) : (
              <p className="muted">
                No members yet.
              </p>
            )}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="archive-header">
        <div>
          <div className="eyebrow">
            ARCHIVE
          </div>
          <h1>Organizations</h1>
          <p className="muted">
            Build factions, groups and branches.
          </p>
        </div>

        <Button
          className="primary"
          onClick={() =>
            setEditing({
              ...emptyOrganization,
              id: "",
              branches: [],
            })
          }
        >
          + New organization
        </Button>
      </div>

      {organizations.length ? (
        <div className="organization-grid">
          {organizations.map((organization) => {
            const members = characters.filter(
              (character) =>
                character.organizations?.includes(
                  organization.id
                )
            );

            return (
              <article
                className="organization-card glow-card"
                key={organization.id}
              >
                <div className="organization-image">
                  {organization.image ? (
                    <img
                      src={organization.image}
                      alt=""
                    />
                  ) : (
                    <span>✦</span>
                  )}
                </div>

                <div className="organization-content">
                  <h2>{organization.name}</h2>

                  <p>
                    {organization.description ||
                      "No description yet."}
                  </p>

                  <div className="organization-meta">
                    <span>
                      {members.length} member
                      {members.length !== 1
                        ? "s"
                        : ""}
                    </span>

                    <span>
                      {organization.branches
                        .length}{" "}
                      branches
                    </span>
                  </div>

                  <div className="card-actions">
                    <Button
                      className="secondary small"
                      onClick={() =>
                        setEditing(
                          organization
                        )
                      }
                    >
                      Edit
                    </Button>

                    <Button
                      className="danger small"
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
            );
          })}
        </div>
      ) : (
        <EmptyState
          symbol="✦"
          title="No organizations yet"
          text="Create your first faction, group or organization."
        />
      )}
    </div>
  );
}

/* =========================================================
   LORE
   ========================================================= */

function LorePage({ lore, onSave, onDelete }) {
  const [editing, setEditing] = useState(null);

  function saveLore() {
    onSave({
      ...editing,
      id: editing.id || uid("lore"),
      title:
        editing.title.trim() || "Untitled entry",
    });

    setEditing(null);
  }

  if (editing) {
    return (
      <div className="page">
        <div className="creator-header">
          <div>
            <div className="eyebrow">
              WORLD BUILDING
            </div>
            <h1>
              {editing.title ||
                "New lore entry"}
            </h1>
          </div>

          <div className="form-actions">
            <Button
              className="secondary"
              onClick={() => setEditing(null)}
            >
              Cancel
            </Button>

            <Button
              className="primary"
              onClick={saveLore}
            >
              Save entry
            </Button>
          </div>
        </div>

        <section className="form-section glow-card">
          <div className="form-grid">
            <Field
              label="Title"
              value={editing.title}
              onChange={(value) =>
                setEditing({
                  ...editing,
                  title: value,
                })
              }
            />

            <Field
              label="Category"
              value={editing.category}
              onChange={(value) =>
                setEditing({
                  ...editing,
                  category: value,
                })
              }
            />
          </div>

          <TextField
            label="Content"
            value={editing.content}
            rows={18}
            onChange={(value) =>
              setEditing({
                ...editing,
                content: value,
              })
            }
          />
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="archive-header">
        <div>
          <div className="eyebrow">
            WORLD BUILDING
          </div>
          <h1>Lore</h1>
          <p className="muted">
            Keep your universe in one place.
          </p>
        </div>

        <Button
          className="primary"
          onClick={() =>
            setEditing({
              ...emptyLore,
              id: "",
            })
          }
        >
          + New lore entry
        </Button>
      </div>

      {lore.length ? (
        <div className="lore-grid">
          {lore.map((entry) => (
            <article
              className="lore-card glow-card"
              key={entry.id}
            >
              <div className="lore-card-top">
                <span className="profile-tag">
                  {entry.category ||
                    "General"}
                </span>

                <button
                  className="delete-button"
                  onClick={() =>
                    onDelete(entry.id)
                  }
                >
                  ×
                </button>
              </div>

              <h2>{entry.title}</h2>

              <p>
                {entry.content ||
                  "Empty lore entry."}
              </p>

              <Button
                className="secondary small"
                onClick={() =>
                  setEditing(entry)
                }
              >
                Edit
              </Button>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          symbol="◇"
          title="No lore yet"
          text="Start building your world."
        />
      )}
    </div>
  );
}

/* =========================================================
   EMPTY STATE
   ========================================================= */

function EmptyState({
  symbol,
  title,
  text,
}) {
  return (
    <div className="empty-state glow-card">
      <div className="empty-symbol">
        {symbol}
      </div>

      <h2>{title}</h2>

      <p>{text}</p>
    </div>
  );
}

/* =========================================================
   HOME
   ========================================================= */

function Home({
  characters,
  organizations,
  lore,
  onCreate,
  onArchive,
}) {
  return (
    <div className="page home-page">
      <section className="hero glow-card">
        <div className="hero-symbol">
          ✦
        </div>

        <div className="hero-copy">
          <div className="eyebrow">
            ORIGINAL CHARACTER ARCHIVE
          </div>

          <h1>
            Your characters.
            <br />
            Your universe.
          </h1>

          <p>
            A personal archive for characters,
            relationships, factions and lore.
          </p>

          <div className="hero-actions">
            <Button
              className="primary"
              onClick={onCreate}
            >
              + Create character
            </Button>

            <Button
              className="secondary"
              onClick={onArchive}
            >
              Open archive
            </Button>
          </div>
        </div>
      </section>

      <div className="stats-overview">
        <div className="overview-card glow-card">
          <span>Characters</span>
          <strong>{characters.length}</strong>
        </div>

        <div className="overview-card glow-card">
          <span>Organizations</span>
          <strong>
            {organizations.length}
          </strong>
        </div>

        <div className="overview-card glow-card">
          <span>Lore entries</span>
          <strong>{lore.length}</strong>
        </div>
      </div>

      <section className="home-intro glow-card">
        <div className="section-heading">
          <div>
            <div className="eyebrow">
              ARCHIVE SYSTEM
            </div>
            <h2>Everything in one place.</h2>
          </div>
        </div>

        <div className="feature-grid">
          <div>
            <span>01</span>
            <h3>Character files</h3>
            <p>
              Store appearance, personality,
              abilities, stats and relationships.
            </p>
          </div>

          <div>
            <span>02</span>
            <h3>Organizations</h3>
            <p>
              Build factions, branches and
              character memberships.
            </p>
          </div>

          <div>
            <span>03</span>
            <h3>World lore</h3>
            <p>
              Keep important locations,
              history and concepts together.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   ARCHIVE
   ========================================================= */

function Archive({
  characters,
  search,
  setSearch,
  onCreate,
  onOpen,
  onEdit,
  onDelete,
}) {
  const filtered = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) return characters;

    return characters.filter((character) => {
      const text = [
        character.name,
        character.lastName,
        character.nicknames,
        character.job,
        character.affiliation,
        character.species,
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    });
  }, [characters, search]);

  return (
    <div className="page archive-page">
      <div className="archive-header">
        <div>
          <div className="eyebrow">
            CHARACTER DATABASE
          </div>

          <h1>Archive</h1>

          <p className="muted">
            {characters.length} character
            {characters.length !== 1
              ? "s"
              : ""}{" "}
            stored.
          </p>
        </div>

        <Button
          className="primary"
          onClick={onCreate}
        >
          + New character
        </Button>
      </div>

      <div className="archive-tools">
        <input
          className="search-box"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search characters..."
        />

        <span className="archive-count">
          {filtered.length} shown
        </span>
      </div>

      {filtered.length ? (
        <div className="character-grid">
          {filtered.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onOpen={onOpen}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          symbol="✦"
          title={
            characters.length
              ? "No matching characters"
              : "Your archive is empty"
          }
          text={
            characters.length
              ? "Try another search."
              : "Create your first character to begin."
          }
        />
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
  const fileInput = useRef(null);

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
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const anchor =
      document.createElement("a");

    anchor.href = url;
    anchor.download = "oc-archive.json";
    anchor.click();

    URL.revokeObjectURL(url);
  }

  async function importFile(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      onImport(data);

      alert("Archive imported successfully.");
    } catch {
      alert(
        "This file is not a valid OC Archive JSON file."
      );
    }

    event.target.value = "";
  }

  return (
    <div className="page">
      <div className="archive-header">
        <div>
          <div className="eyebrow">
            ARCHIVE TOOLS
          </div>

          <h1>Import & export</h1>

          <p className="muted">
            Back up your entire archive as a
            JSON file.
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
            className="primary"
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
            Restore a previously exported OC
            Archive file.
          </p>

          <input
            ref={fileInput}
            hidden
            type="file"
            accept="application/json,.json"
            onChange={importFile}
          />

          <Button
            className="secondary"
            onClick={() =>
              fileInput.current?.click()
            }
          >
            Choose JSON file
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
  const [theme, setTheme] = useState(getTheme());

  const [page, setPage] = useState("home");

  const [characters, setCharacters] =
    useState(() =>
      load("oc-characters", []).map(
        normalizeCharacter
      )
    );

  const [organizations, setOrganizations] =
    useState(() =>
      load("oc-organizations", [])
    );

  const [lore, setLore] = useState(() =>
    load("oc-lore", [])
  );

  const [selectedCharacter, setSelectedCharacter] =
    useState(null);

  const [editingCharacter, setEditingCharacter] =
    useState(null);

  const [search, setSearch] = useState("");

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    save("oc-characters", characters);
  }, [characters]);

  useEffect(() => {
    save("oc-organizations", organizations);
  }, [organizations]);

  useEffect(() => {
    save("oc-lore", lore);
  }, [lore]);

  function createCharacter() {
    setEditingCharacter({
      ...emptyCharacter,
      personality: {
        ...emptyCharacter.personality,
      },
      skills: {
        ...emptyCharacter.skills,
      },
      social: {
        ...emptyCharacter.social,
      },
      relationships: [],
      organizations: [],
      moodboard: [],
    });

    setPage("create");
  }

  function editCharacter(id) {
    const character = characters.find(
      (item) => item.id === id
    );

    if (!character) return;

    setEditingCharacter(character);
    setPage("create");
  }

  function saveCharacter(character) {
    setCharacters((current) => {
      const exists = current.some(
        (item) => item.id === character.id
      );

      return exists
        ? current.map((item) =>
            item.id === character.id
              ? character
              : item
          )
        : [...current, character];
    });

    setSelectedCharacter(character.id);
    setEditingCharacter(null);
    setPage("profile");
  }

  function deleteCharacter(id) {
    const character = characters.find(
      (item) => item.id === id
    );

    if (!character) return;

    const confirmed = window.confirm(
      `Delete "${character.name}"?`
    );

    if (!confirmed) return;

    setCharacters((current) =>
      current.filter((item) => item.id !== id)
    );

    if (selectedCharacter === id) {
      setSelectedCharacter(null);
      setPage("archive");
    }
  }

  function openCharacter(id) {
    setSelectedCharacter(id);
    setPage("profile");
  }

  function saveOrganization(organization) {
    setOrganizations((current) => {
      const exists = current.some(
        (item) => item.id === organization.id
      );

      return exists
        ? current.map((item) =>
            item.id === organization.id
              ? organization
              : item
          )
        : [...current, organization];
    });
  }

  function deleteOrganization(id) {
    if (
      !window.confirm(
        "Delete this organization?"
      )
    ) {
      return;
    }

    setOrganizations((current) =>
      current.filter((item) => item.id !== id)
    );

    setCharacters((current) =>
      current.map((character) => ({
        ...character,
        organizations:
          character.organizations?.filter(
            (organizationId) =>
              organizationId !== id
          ) || [],
      }))
    );
  }

  function saveLore(entry) {
    setLore((current) => {
      const exists = current.some(
        (item) => item.id === entry.id
      );

      return exists
        ? current.map((item) =>
            item.id === entry.id
              ? entry
              : item
          )
        : [...current, entry];
    });
  }

  function deleteLore(id) {
    if (
      !window.confirm("Delete this lore entry?")
    ) {
      return;
    }

    setLore((current) =>
      current.filter((item) => item.id !== id)
    );
  }

  function importData(data) {
    if (
      Array.isArray(data.characters)
    ) {
      setCharacters(
        data.characters.map(
          normalizeCharacter
        )
      );
    }

    if (
      Array.isArray(data.organizations)
    ) {
      setOrganizations(data.organizations);
    }

    if (Array.isArray(data.lore)) {
      setLore(data.lore);
    }

    setPage("home");
  }

  const activeCharacter =
    characters.find(
      (character) =>
        character.id === selectedCharacter
    ) || null;

  return (
    <div className="site-shell">
      <header className="topbar">
        <button
          className="brand"
          onClick={() => setPage("home")}
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
            onClick={() => setPage("home")}
          >
            Home
          </button>

          <button
            className={
              page === "archive"
                ? "nav-active"
                : ""
            }
            onClick={() => setPage("archive")}
          >
            Characters
          </button>

          <button
            className={
              page === "organizations"
                ? "nav-active"
                : ""
            }
            onClick={() =>
              setPage("organizations")
            }
          >
            Organizations
          </button>

          <button
            className={
              page === "lore"
                ? "nav-active"
                : ""
            }
            onClick={() => setPage("lore")}
          >
            Lore
          </button>

          <button
            className={
              page === "data"
                ? "nav-active"
                : ""
            }
            onClick={() => setPage("data")}
          >
            Data
          </button>
        </nav>

        <label className="theme-picker">
          <span>Theme</span>

          <select
            value={theme}
            onChange={(event) => {
              const value =
                event.target.value;

              setTheme(value);
              applyTheme(value);
            }}
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

      <main>
        {page === "home" && (
          <Home
            characters={characters}
            organizations={organizations}
            lore={lore}
            onCreate={createCharacter}
            onArchive={() =>
              setPage("archive")
            }
          />
        )}

        {page === "archive" && (
          <Archive
            characters={characters}
            search={search}
            setSearch={setSearch}
            onCreate={createCharacter}
            onOpen={openCharacter}
            onEdit={editCharacter}
            onDelete={deleteCharacter}
          />
        )}

        {page === "create" &&
          editingCharacter && (
            <CharacterEditor
              character={editingCharacter}
              characters={characters}
              organizations={organizations}
              onSave={saveCharacter}
              onCancel={() => {
                setEditingCharacter(null);
                setPage("archive");
              }}
            />
          )}

        {page === "profile" &&
          activeCharacter && (
            <Profile
              character={activeCharacter}
              organizations={organizations}
              onBack={() =>
                setPage("archive")
              }
              onEdit={() =>
                editCharacter(
                  activeCharacter.id
                )
              }
            />
          )}

        {page === "organizations" && (
          <OrganizationsPage
            organizations={organizations}
            characters={characters}
            onSave={saveOrganization}
            onDelete={deleteOrganization}
          />
        )}

        {page === "lore" && (
          <LorePage
            lore={lore}
            onSave={saveLore}
            onDelete={deleteLore}
          />
        )}

        {page === "data" && (
          <DataPage
            characters={characters}
            organizations={organizations}
            lore={lore}
            onImport={importData}
          />
        )}

        {page === "profile" &&
          !activeCharacter && (
            <EmptyState
              symbol="?"
              title="Character not found"
              text="Return to the archive."
            />
          )}
      </main>

      <footer className="footer">
        <span>OC ARCHIVE</span>
        <span>✦</span>
        <span>Your universe, your rules.</span>
      </footer>
    </div>
  );
}
