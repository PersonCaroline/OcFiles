import { useEffect, useMemo, useRef, useState } from "react";
import { THEMES, applyTheme, getTheme } from "./themes";

const PERSONALITY_STATS = [
  ["nice", "Mean"],
  ["brave", "Coward"],
  ["pacifist", "Violent"],
  ["thoughtful", "Impulsive"],
  ["agreeable", "Contrary"],
  ["idealistic", "Pragmatic"],
  ["frugal", "Big spender"],
  ["collected", "Wild"],
  ["honest", "Deceptive"],
  ["polite", "Rude"],
  ["smart", "Idiot"],
  ["confident", "Insecure"],
  ["calm", "Anxious"],
  ["patient", "Impatient"],
  ["gullible", "Skeptical"],
  ["reserved", "Flirty"],
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
    PERSONALITY_STATS.map(([a]) => [a, 3])
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

function uid(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function safeParse(key, fallback) {
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

function normalizeCharacter(character) {
  const base = {
    ...emptyCharacter,
    ...character,
  };

  base.personality = {
    ...emptyCharacter.personality,
    ...(character.personality || {}),
  };

  base.skills = {
    ...emptyCharacter.skills,
    ...(character.skills || {}),
  };

  base.socialStats = {
    ...emptyCharacter.socialStats,
    ...(character.socialStats || {}),
  };

  base.relationships = Array.isArray(character.relationships)
    ? character.relationships
    : [];

  base.moodboard = Array.isArray(character.moodboard)
    ? character.moodboard
    : [];

  return base;
}

function Field({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}) {
  return (
    <label className="field">
      <span>{label}</span>

      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder = "",
  rows = 5,
}) {
  return (
    <label className="field field-wide">
      <span>{label}</span>

      <textarea
        rows={rows}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Section({ title, children }) {
  return (
    <section className="form-section glow-card">
      <div className="section-title">
        <h3>{title}</h3>
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
      <span className="stat-label left">{left}</span>

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

      <span className="stat-label right">{right}</span>
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
      <span className="skill-name">{name}</span>

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
            aria-label={`${name}: ${number}/5`}
          />
        ))}
      </div>

      <span className="skill-value">{value}/5</span>
    </div>
  );
}

function ImageUpload({
  label,
  value,
  onChange,
  multiple = false,
}) {
  const inputRef = useRef(null);

  async function handleFiles(files) {
    if (!files || !files.length) return;

    try {
      const images = await Promise.all(
        Array.from(files).map(readFileAsDataURL)
      );

      if (multiple) {
        onChange(images);
      } else {
        onChange(images[0]);
      }
    } catch {
      alert("Impossible de charger cette image.");
    }
  }

  return (
    <div className="image-upload field-wide">
      <span>{label}</span>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      <button
        type="button"
        className="upload-area"
        onClick={() => inputRef.current?.click()}
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

      {value && !multiple && (
        <div className="upload-actions">
          <button
            type="button"
            className="button secondary"
            onClick={() => onChange("")}
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

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

  const update = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateNested = (group, field, value) => {
    setForm((current) => ({
      ...current,
      [group]: {
        ...current[group],
        [field]: value,
      },
    }));
  };

  function save() {
    const finalCharacter = {
      ...form,
      id: form.id || uid("character"),
      name:
        form.name.trim() ||
        "Unnamed character",
    };

    onSave(finalCharacter);
  }

  return (
    <div className="creator-page character-editor">
      <div className="creator-header">
        <div>
          <div className="eyebrow">
            Character archive
          </div>

          <h1>
            {form.name || "New character"}
          </h1>

          <p className="muted">
            Build every detail of your character.
          </p>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="button secondary"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            type="button"
            className="button primary"
            onClick={save}
          >
            Save character
          </button>
        </div>
      </div>

      <Section title="Appearance">
        <div className="form-grid">
          <Field
            label="First name"
            value={form.name}
            onChange={(v) => update("name", v)}
          />

          <Field
            label="Last name"
            value={form.lastName}
            onChange={(v) => update("lastName", v)}
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
            value={form.dateOfBirth}
            type="date"
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
            onChange={(v) => update("height", v)}
          />

          <Field
            label="Weight"
            value={form.weight}
            onChange={(v) => update("weight", v)}
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
              ...(form.moodboard || []),
              ...images,
            ])
          }
        />
      </Section>

      <Section title="Status & occupation">
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
          {PERSONALITY_STATS.map(
            ([left, right]) => (
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
            )
          )}
        </div>
      </Section>

      <Section title="Skills">
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

      <Section title="Social statistics">
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
          onChange={(v) =>
            update("likes", v)
          }
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
        <RelationshipEditor
          form={form}
          characters={characters}
          onChange={(relationships) =>
            update(
              "relationships",
              relationships
            )
          }
        />
      </Section>

      <Section title="Organizations">
        <div className="organization-memberships">
          {organizations.length === 0 ? (
            <p className="muted">
              No organizations created yet.
            </p>
          ) : (
            organizations.map((org) => (
              <div
                className="mini-card"
                key={org.id}
              >
                <strong>{org.name}</strong>

                <span className="muted">
                  {org.description ||
                    "No description"}
                </span>
              </div>
            ))
          )}
        </div>
      </Section>

      <div className="form-actions bottom-actions">
        <button
          type="button"
          className="button secondary"
          onClick={onCancel}
        >
          Cancel
        </button>

        <button
          type="button"
          className="button primary"
          onClick={save}
        >
          Save character
        </button>
      </div>
    </div>
  );
}

function RelationshipEditor({
  form,
  characters,
  onChange,
}) {
  const relationships = form.relationships || [];

  function addRelationship() {
    onChange([
      ...relationships,
      {
        id: uid("relationship"),
        type: "Friend",
        targetId: "",
        name: "",
        status: "",
        description: "",
      },
    ]);
  }

  function updateRelationship(id, field, value) {
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
      {relationships.map((relationship) => (
        <div
          className="relationship-card"
          key={relationship.id}
        >
          <div className="relationship-edit-row">
            <label className="field">
              <span>Type</span>

              <select
                value={relationship.type}
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

            <label className="field">
              <span>Character</span>

              <select
                value={
                  relationship.targetId
                }
                onChange={(e) => {
                  const targetId =
                    e.target.value;

                  const target =
                    characters.find(
                      (character) =>
                        character.id ===
                        targetId
                    );

                  updateRelationship(
                    relationship.id,
                    "targetId",
                    targetId
                  );

                  if (target) {
                    updateRelationship(
                      relationship.id,
                      "name",
                      target.name
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
                      character.id !== form.id
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
              value={relationship.name}
              onChange={(value) =>
                updateRelationship(
                  relationship.id,
                  "name",
                  value
                )
              }
            />

            <Field
              label="Status"
              value={relationship.status}
              onChange={(value) =>
                updateRelationship(
                  relationship.id,
                  "status",
                  value
                )
              }
            />
          </div>

          <TextField
            label="Description"
            rows={3}
            value={relationship.description}
            onChange={(value) =>
              updateRelationship(
                relationship.id,
                "description",
                value
              )
            }
          />

          <button
            type="button"
            className="button danger"
            onClick={() =>
              removeRelationship(
                relationship.id
              )
            }
          >
            Remove relationship
          </button>
        </div>
      ))}

      <button
        type="button"
        className="button secondary"
        onClick={addRelationship}
      >
        ＋ Add relationship
      </button>
    </div>
  );
}

function CharacterCard({
  character,
  onEdit,
  onDelete,
  onView,
}) {
  const fullName =
    `${character.name || ""} ${
      character.lastName || ""
    }`.trim() || "Unnamed character";

  return (
    <article className="character-card glow-card">
      <div className="character-image">
        {character.image ? (
          <img
            src={character.image}
            alt={fullName}
          />
        ) : (
          <span>✦</span>
        )}

        <span
          className={
            character.status === "dead"
              ? "badge-dead"
              : "badge-alive"
          }
        >
          {character.status === "dead"
            ? "DEAD"
            : "ALIVE"}
        </span>
      </div>

      <div className="character-card-content">
        <div className="character-card-top">
          <span className="eyebrow">
            {character.species ||
              "Character"}
          </span>
        </div>

        <h3>{fullName}</h3>

        {character.nicknames && (
          <p className="nickname">
            "{character.nicknames}"
          </p>
        )}

        <p className="muted">
          {character.job ||
            "No occupation specified"}
        </p>

        <div className="character-summary">
          {character.affiliation && (
            <span>
              {character.affiliation}
            </span>
          )}

          {character.mbti && (
            <span>{character.mbti}</span>
          )}
        </div>

        <div className="character-card-actions">
          <button
            type="button"
            className="button secondary"
            onClick={() => onView(character)}
          >
            View
          </button>

          <button
            type="button"
            className="button secondary"
            onClick={() => onEdit(character)}
          >
            Edit
          </button>

          <button
            type="button"
            className="delete-button"
            onClick={() => onDelete(character)}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function CharacterProfile({
  character,
  onBack,
  onEdit,
}) {
  const fullName =
    `${character.name || ""} ${
      character.lastName || ""
    }`.trim() || "Unnamed character";

  return (
    <div className="profile-page">
      <div className="profile-actions">
        <button
          type="button"
          className="button secondary"
          onClick={onBack}
        >
          ← Back
        </button>

        <button
          type="button"
          className="button primary"
          onClick={() => onEdit(character)}
        >
          Edit character
        </button>
      </div>

      <div className="profile-hero glow-card">
        <div className="profile-image">
          {character.image ? (
            <img
              src={character.image}
              alt={fullName}
            />
          ) : (
            <span>✦</span>
          )}
        </div>

        <div className="profile-heading">
          <div className="eyebrow">
            {character.species}
          </div>

          <h1>{fullName}</h1>

          {character.nicknames && (
            <p className="nickname">
              "{character.nicknames}"
            </p>
          )}

          <div className="profile-badges">
            <span
              className={
                character.status === "dead"
                  ? "badge-dead"
                  : "badge-alive"
              }
            >
              {character.status}
            </span>

            {character.mbti && (
              <span className="profile-tag">
                {character.mbti}
              </span>
            )}

            {character.age && (
              <span className="profile-tag">
                {character.age} years
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="profile-grid">
        <ProfileSection
          title="Identity"
          fields={[
            ["Pronouns", character.pronouns],
            ["Gender", character.gender],
            [
              "Sexuality",
              character.sexuality,
            ],
            [
              "Nationality",
              character.nationality,
            ],
            ["Origins", character.origins],
            [
              "Date of birth",
              character.dateOfBirth,
            ],
            ["Height", character.height],
            ["Weight", character.weight],
          ]}
        />

        <ProfileSection
          title="Occupation"
          fields={[
            ["Job", character.job],
            ["Side job", character.sideJob],
            [
              "Affiliation",
              character.affiliation,
            ],
            [
              "Past affiliation",
              character.pastAffiliation,
            ],
            ["Rank", character.rank],
            [
              "Past rank",
              character.pastRank,
            ],
          ]}
        />

        <div className="profile-section glow-card">
          <h3>Ability</h3>

          <h4>{character.ability || "—"}</h4>

          <p>
            {character.abilityDescription ||
              "No description."}
          </p>

          {character.sideEffects && (
            <>
              <h4>Side effects & risks</h4>
              <p>{character.sideEffects}</p>
            </>
          )}

          {character.weapon && (
            <>
              <h4>Weapon</h4>
              <p>{character.weapon}</p>
            </>
          )}
        </div>

        <div className="profile-section glow-card">
          <h3>Personality</h3>

          {PERSONALITY_STATS.map(
            ([left, right]) => (
              <div
                className="profile-stat"
                key={left}
              >
                <span>
                  {left} — {right}
                </span>

                <strong>
                  {character.personality[left]}/5
                </strong>
              </div>
            )
          )}
        </div>

        <div className="profile-section glow-card">
          <h3>Skills</h3>

          {SKILLS.map((skill) => (
            <div
              className="profile-stat"
              key={skill}
            >
              <span>{skill}</span>

              <strong>
                {character.skills[skill]}/5
              </strong>
            </div>
          ))}
        </div>

        <ProfileSection
          title="Personal"
          fields={[
            ["Fears", character.fears],
            ["Sickness", character.sickness],
            [
              "Addictions",
              character.addictions,
            ],
            ["Likes", character.likes],
            [
              "Dislikes",
              character.dislikes,
            ],
          ]}
        />

        <div className="profile-section glow-card">
          <h3>Relationships</h3>

          {character.relationships?.length ? (
            character.relationships.map(
              (relationship) => (
                <div
                  className="relationship-display"
                  key={relationship.id}
                >
                  <strong>
                    {relationship.name ||
                      "Unknown"}
                  </strong>

                  <span>
                    {relationship.type}
                  </span>

                  {relationship.status && (
                    <small>
                      {relationship.status}
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
              )
            )
          ) : (
            <p className="muted">
              No relationships recorded.
            </p>
          )}
        </div>
      </div>

      {character.moodboard?.length > 0 && (
        <div className="profile-section glow-card moodboard">
          <h3>Moodboard</h3>

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
        </div>
      )}
    </div>
  );
}

function ProfileSection({ title, fields }) {
  return (
    <div className="profile-section glow-card">
      <h3>{title}</h3>

      <div className="profile-fields">
        {fields.map(([label, value]) => (
          <div
            className="profile-field"
            key={label}
          >
            <span>{label}</span>
            <strong>{value || "—"}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function Organizations({
  organizations,
  characters,
  onSave,
  onDelete,
}) {
  const [editing, setEditing] =
    useState(null);

  const [search, setSearch] = useState("");

  const visibleOrganizations =
    organizations.filter((organization) =>
      organization.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  function createOrganization() {
    setEditing({
      ...emptyOrganization,
      id: uid("organization"),
    });
  }

  return (
    <div className="archive-page">
      <div className="archive-header">
        <div>
          <div className="eyebrow">
            World building
          </div>

          <h1>Organizations</h1>

          <p className="muted">
            Build factions, branches and
            memberships.
          </p>
        </div>

        <button
          type="button"
          className="button primary"
          onClick={createOrganization}
        >
          ＋ Add organization
        </button>
      </div>

      <div className="archive-tools glow-card">
        <div className="search-box">
          <span>⌕</span>

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search organizations..."
          />
        </div>

        <span className="archive-count">
          {visibleOrganizations.length}
        </span>
      </div>

      {editing ? (
        <OrganizationEditor
          organization={editing}
          characters={characters}
          onCancel={() => setEditing(null)}
          onSave={(organization) => {
            onSave(organization);
            setEditing(null);
          }}
        />
      ) : visibleOrganizations.length ? (
        <div className="organization-grid">
          {visibleOrganizations.map(
            (organization) => (
              <OrganizationCard
                key={organization.id}
                organization={organization}
                characters={characters}
                onEdit={() =>
                  setEditing(organization)
                }
                onDelete={() =>
                  onDelete(organization)
                }
              />
            )
          )}
        </div>
      ) : (
        <EmptyState
          symbol="♜"
          title="No organizations"
          text="Create your first organization."
          button="Add organization"
          onClick={createOrganization}
        />
      )}
    </div>
  );
}

function OrganizationEditor({
  organization,
  characters,
  onSave,
  onCancel,
}) {
  const [form, setForm] = useState({
    ...emptyOrganization,
    ...organization,
    branches: organization.branches || [],
  });

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function uploadImage(file) {
    if (!file) return;

    const image =
      await readFileAsDataURL(file);

    update("image", image);
  }

  function addBranch() {
    update("branches", [
      ...form.branches,
      {
        id: uid("branch"),
        name: "",
        description: "",
        members: [],
      },
    ]);
  }

  function updateBranch(
    id,
    field,
    value
  ) {
    update(
      "branches",
      form.branches.map((branch) =>
        branch.id === id
          ? {
              ...branch,
              [field]: value,
            }
          : branch
      )
    );
  }

  function removeBranch(id) {
    update(
      "branches",
      form.branches.filter(
        (branch) => branch.id !== id
      )
    );
  }

  return (
    <div className="editor-panel glow-card">
      <div className="creator-header">
        <div>
          <div className="eyebrow">
            Organization editor
          </div>

          <h2>
            {form.name ||
              "New organization"}
          </h2>
        </div>

        <div className="form-actions">
          <button
            className="button secondary"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>

          <button
            className="button primary"
            type="button"
            onClick={() =>
              onSave({
                ...form,
                name:
                  form.name ||
                  "Unnamed organization",
              })
            }
          >
            Save
          </button>
        </div>
      </div>

      <div className="form-grid">
        <Field
          label="Organization name"
          value={form.name}
          onChange={(v) => update("name", v)}
        />
      </div>

      <TextField
        label="Description"
        value={form.description}
        onChange={(v) =>
          update("description", v)
        }
      />

      <label className="field field-wide">
        <span>Organization image</span>

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            uploadImage(e.target.files?.[0])
          }
        />
      </label>

      {form.image && (
        <img
          className="editor-image-preview"
          src={form.image}
          alt=""
        />
      )}

      <div className="branch-editor">
        <div className="section-title">
          <h3>Branches</h3>

          <button
            type="button"
            className="button secondary"
            onClick={addBranch}
          >
            ＋ Add branch
          </button>
        </div>

        {form.branches.map((branch) => (
          <div
            className="branch-card glow-card"
            key={branch.id}
          >
            <Field
              label="Branch name"
              value={branch.name}
              onChange={(v) =>
                updateBranch(
                  branch.id,
                  "name",
                  v
                )
              }
            />

            <TextField
              label="Branch description"
              rows={3}
              value={branch.description}
              onChange={(v) =>
                updateBranch(
                  branch.id,
                  "description",
                  v
                )
              }
            />

            <label className="field">
              <span>Members</span>

              <select
                multiple
                value={branch.members || []}
                onChange={(e) => {
                  const members =
                    Array.from(
                      e.target.selectedOptions
                    ).map(
                      (option) => option.value
                    );

                  updateBranch(
                    branch.id,
                    "members",
                    members
                  );
                }}
              >
                {characters.map(
                  (character) => (
                    <option
                      key={character.id}
                      value={character.id}
                    >
                      {character.name}{" "}
                      {character.lastName}
                    </option>
                  )
                )}
              </select>
            </label>

            <button
              type="button"
              className="button danger"
              onClick={() =>
                removeBranch(branch.id)
              }
            >
              Remove branch
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrganizationCard({
  organization,
  characters,
  onEdit,
  onDelete,
}) {
  const memberIds =
    organization.branches?.flatMap(
      (branch) => branch.members || []
    ) || [];

  const members = characters.filter(
    (character) =>
      memberIds.includes(character.id)
  );

  return (
    <article className="organization-card glow-card">
      <div className="organization-image">
        {organization.image ? (
          <img
            src={organization.image}
            alt={organization.name}
          />
        ) : (
          <span>♜</span>
        )}
      </div>

      <div className="organization-content">
        <div className="eyebrow">
          Organization
        </div>

        <h3>{organization.name}</h3>

        <p className="muted">
          {organization.description ||
            "No description."}
        </p>

        <div className="organization-meta">
          <span>
            {organization.branches?.length ||
              0}{" "}
            branches
          </span>

          <span>
            {members.length} members
          </span>
        </div>

        <div className="character-card-actions">
          <button
            type="button"
            className="button secondary"
            onClick={onEdit}
          >
            Edit
          </button>

          <button
            type="button"
            className="delete-button"
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function Lore({
  lore,
  onSave,
  onDelete,
}) {
  const [editing, setEditing] =
    useState(null);

  const [search, setSearch] = useState("");

  const visibleLore = lore.filter((entry) =>
    `${entry.title} ${entry.category} ${entry.content}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function createLore() {
    setEditing({
      ...emptyLore,
      id: uid("lore"),
    });
  }

  return (
    <div className="archive-page">
      <div className="archive-header">
        <div>
          <div className="eyebrow">
            World archive
          </div>

          <h1>Lore</h1>

          <p className="muted">
            Store events, places, concepts,
            history and secrets.
          </p>
        </div>

        <button
          type="button"
          className="button primary"
          onClick={createLore}
        >
          ＋ Add lore entry
        </button>
      </div>

      <div className="archive-tools glow-card">
        <div className="search-box">
          <span>⌕</span>

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search lore..."
          />
        </div>

        <span className="archive-count">
          {visibleLore.length}
        </span>
      </div>

      {editing ? (
        <LoreEditor
          entry={editing}
          onCancel={() => setEditing(null)}
          onSave={(entry) => {
            onSave(entry);
            setEditing(null);
          }}
        />
      ) : visibleLore.length ? (
        <div className="lore-grid">
          {visibleLore.map((entry) => (
            <article
              className="lore-card glow-card"
              key={entry.id}
            >
              <div className="eyebrow">
                {entry.category ||
                  "Uncategorized"}
              </div>

              <h3>{entry.title}</h3>

              <p>
                {entry.content ||
                  "No content."}
              </p>

              <div className="character-card-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() =>
                    setEditing(entry)
                  }
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="delete-button"
                  onClick={() => onDelete(entry)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          symbol="✧"
          title="No lore yet"
          text="Create your first lore entry."
          button="Add lore"
          onClick={createLore}
        />
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
    ...emptyLore,
    ...entry,
  });

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <div className="editor-panel glow-card">
      <div className="creator-header">
        <div>
          <div className="eyebrow">
            Lore editor
          </div>

          <h2>
            {form.title || "New lore entry"}
          </h2>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="button secondary"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            type="button"
            className="button primary"
            onClick={() =>
              onSave({
                ...form,
                title:
                  form.title ||
                  "Untitled lore",
              })
            }
          >
            Save
          </button>
        </div>
      </div>

      <div className="form-grid">
        <Field
          label="Title"
          value={form.title}
          onChange={(v) =>
            update("title", v)
          }
        />

        <Field
          label="Category"
          value={form.category}
          onChange={(v) =>
            update("category", v)
          }
        />
      </div>

      <TextField
        label="Content"
        value={form.content}
        onChange={(v) =>
          update("content", v)
        }
        rows={14}
      />
    </div>
  );
}

function EmptyState({
  symbol,
  title,
  text,
  button,
  onClick,
}) {
  return (
    <div className="empty-state glow-card">
      <div className="empty-symbol">
        {symbol}
      </div>

      <h2>{title}</h2>

      <p>{text}</p>

      {button && (
        <button
          type="button"
          className="button primary"
          onClick={onClick}
        >
          {button}
        </button>
      )}
    </div>
  );
}

function Home({
  characters,
  organizations,
  lore,
  onCreate,
  onView,
  onEdit,
  onDelete,
  onNavigate,
}) {
  const alive = characters.filter(
    (character) =>
      character.status !== "dead"
  ).length;

  const dead = characters.filter(
    (character) =>
      character.status === "dead"
  ).length;

  return (
    <div className="home-page">
      <section className="hero glow-card">
        <div className="hero-copy">
          <div className="eyebrow">
            Original Character Archive
          </div>

          <h1>
            Your characters.
            <br />
            Your universe.
          </h1>

          <p>
            A personal archive for characters,
            relationships, organizations and
            lore.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="button primary"
              onClick={onCreate}
            >
              ＋ Create character
            </button>

            <button
              type="button"
              className="button secondary"
              onClick={() =>
                onNavigate("characters")
              }
            >
              Browse archive
            </button>
          </div>
        </div>

        <div className="hero-symbol">
          ✦
        </div>
      </section>

      <div className="stats-overview">
        <div className="overview-card glow-card">
          <span>Characters</span>
          <strong>{characters.length}</strong>
        </div>

        <div className="overview-card glow-card">
          <span>Alive</span>
          <strong>{alive}</strong>
        </div>

        <div className="overview-card glow-card">
          <span>Dead</span>
          <strong>{dead}</strong>
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

      {characters.length > 0 && (
        <section>
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                Archive
              </div>

              <h2>Recent characters</h2>
            </div>

            <button
              type="button"
              className="button secondary"
              onClick={() =>
                onNavigate("characters")
              }
            >
              View all
            </button>
          </div>

          <div className="character-grid">
            {characters
              .slice(-3)
              .reverse()
              .map((character) => (
                <CharacterCard
                  key={character.id}
                  character={character}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
          </div>
        </section>
      )}

      <section className="theme-summary glow-card">
        <div>
          <div className="eyebrow">
            Archive system
          </div>

          <h3>
            Built for your universe
          </h3>

          <p>
            Characters, relationships,
            organizations and lore stay
            together in your browser.
          </p>
        </div>

        <div className="theme-mark">
          ◈
        </div>
      </section>
    </div>
  );
}

function CharactersArchive({
  characters,
  onCreate,
  onEdit,
  onDelete,
  onView,
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] =
    useState("all");

  const visibleCharacters =
    characters.filter((character) => {
      const query = search.toLowerCase();

      const matchesSearch =
        `${character.name} ${
          character.lastName
        } ${
          character.nicknames
        } ${
          character.affiliation
        }`
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        status === "all" ||
        character.status === status;

      return matchesSearch && matchesStatus;
    });

  return (
    <div className="archive-page">
      <div className="archive-header">
        <div>
          <div className="eyebrow">
            Character database
          </div>

          <h1>Characters</h1>

          <p className="muted">
            Every character in your archive.
          </p>
        </div>

        <button
          type="button"
          className="button primary"
          onClick={onCreate}
        >
          ＋ New character
        </button>
      </div>

      <div className="archive-tools glow-card">
        <div className="search-box">
          <span>⌕</span>

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search characters..."
          />
        </div>

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
        >
          <option value="all">
            All statuses
          </option>

          <option value="alive">
            Alive
          </option>

          <option value="dead">
            Dead
          </option>

          <option value="unknown">
            Unknown
          </option>
        </select>

        <span className="archive-count">
          {visibleCharacters.length}
        </span>
      </div>

      {visibleCharacters.length ? (
        <div className="character-grid">
          {visibleCharacters.map(
            (character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            )
          )}
        </div>
      ) : (
        <EmptyState
          symbol="✦"
          title="No characters found"
          text={
            characters.length
              ? "Try another search."
              : "Create your first character."
          }
          button={
            characters.length
              ? undefined
              : "Create character"
          }
          onClick={onCreate}
        />
      )}
    </div>
  );
}

function ImportExport({
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

  async function importFile(file) {
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (
        !data ||
        !Array.isArray(data.characters)
      ) {
        throw new Error("Invalid backup");
      }

      onImport({
        characters:
          data.characters.map(
            normalizeCharacter
          ),
        organizations:
          Array.isArray(data.organizations)
            ? data.organizations
            : [],
        lore:
          Array.isArray(data.lore)
            ? data.lore
            : [],
      });
    } catch {
      alert(
        "Ce fichier n'est pas un backup OC valide."
      );
    }
  }

  return (
    <div className="archive-page">
      <div className="archive-header">
        <div>
          <div className="eyebrow">
            Data management
          </div>

          <h1>Import / Export</h1>

          <p className="muted">
            Backup your entire archive.
          </p>
        </div>
      </div>

      <div className="import-export-grid">
        <div className="glow-card data-card">
          <div className="empty-symbol">
            ↓
          </div>

          <h2>Export</h2>

          <p className="muted">
            Download every character,
            organization and lore entry as
            one JSON file.
          </p>

          <button
            type="button"
            className="button primary"
            onClick={exportData}
          >
            Export archive
          </button>
        </div>

        <div className="glow-card data-card">
          <div className="empty-symbol">
            ↑
          </div>

          <h2>Import</h2>

          <p className="muted">
            Restore an archive from a JSON
            backup.
          </p>

          <input
            ref={inputRef}
            hidden
            type="file"
            accept=".json,application/json"
            onChange={(e) =>
              importFile(e.target.files?.[0])
            }
          />

          <button
            type="button"
            className="button primary"
            onClick={() =>
              inputRef.current?.click()
            }
          >
            Import backup
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [theme, setTheme] =
    useState(getTheme());

  const [page, setPage] =
    useState("home");

  const [characters, setCharacters] =
    useState(() =>
      safeParse(
        "oc-characters",
        []
      ).map(normalizeCharacter)
    );

  const [organizations, setOrganizations] =
    useState(() =>
      safeParse(
        "oc-organizations",
        []
      )
    );

  const [lore, setLore] =
    useState(() =>
      safeParse("oc-lore", [])
    );

  const [editingCharacter, setEditingCharacter] =
    useState(null);

  const [viewingCharacter, setViewingCharacter] =
    useState(null);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(
      "oc-characters",
      JSON.stringify(characters)
    );
  }, [characters]);

  useEffect(() => {
    localStorage.setItem(
      "oc-organizations",
      JSON.stringify(organizations)
    );
  }, [organizations]);

  useEffect(() => {
    localStorage.setItem(
      "oc-lore",
      JSON.stringify(lore)
    );
  }, [lore]);

  const currentTheme = useMemo(
    () =>
      THEMES.find(
        (item) => item.id === theme
      ) || THEMES[0],
    [theme]
  );

  function changeTheme(id) {
    setTheme(id);
    applyTheme(id);
  }

  function createCharacter() {
    setViewingCharacter(null);

    setEditingCharacter({
      ...emptyCharacter,
      id: uid("character"),
    });

    setPage("characters");
  }

  function editCharacter(character) {
    setViewingCharacter(null);
    setEditingCharacter(
      normalizeCharacter(character)
    );
  }

  function saveCharacter(character) {
    setCharacters((current) => {
      const exists = current.some(
        (item) => item.id === character.id
      );

      if (exists) {
        return current.map((item) =>
          item.id === character.id
            ? character
            : item
        );
      }

      return [...current, character];
    });

    setEditingCharacter(null);
    setViewingCharacter(null);
    setPage("characters");
  }

  function deleteCharacter(character) {
    const confirmed = window.confirm(
      `Delete "${character.name || "this character"}"?`
    );

    if (!confirmed) return;

    setCharacters((current) =>
      current.filter(
        (item) =>
          item.id !== character.id
      )
    );

    if (
      viewingCharacter?.id ===
      character.id
    ) {
      setViewingCharacter(null);
    }

    if (
      editingCharacter?.id ===
      character.id
    ) {
      setEditingCharacter(null);
    }
  }

  function saveOrganization(organization) {
    setOrganizations((current) => {
      const exists = current.some(
        (item) =>
          item.id === organization.id
      );

      if (exists) {
        return current.map((item) =>
          item.id === organization.id
            ? organization
            : item
        );
      }

      return [...current, organization];
    });
  }

  function deleteOrganization(
    organization
  ) {
    if (
      !window.confirm(
        `Delete "${organization.name}"?`
      )
    ) {
      return;
    }

    setOrganizations((current) =>
      current.filter(
        (item) =>
          item.id !== organization.id
      )
    );
  }

  function saveLore(entry) {
    setLore((current) => {
      const exists = current.some(
        (item) => item.id === entry.id
      );

      if (exists) {
        return current.map((item) =>
          item.id === entry.id
            ? entry
            : item
        );
      }

      return [...current, entry];
    });
  }

  function deleteLore(entry) {
    if (
      !window.confirm(
        `Delete "${entry.title}"?`
      )
    ) {
      return;
    }

    setLore((current) =>
      current.filter(
        (item) => item.id !== entry.id
      )
    );
  }

  function importData(data) {
    setCharacters(data.characters);
    setOrganizations(
      data.organizations
    );
    setLore(data.lore);

    alert(
      "Archive imported successfully."
    );
  }

  const navigate = (nextPage) => {
    setEditingCharacter(null);
    setViewingCharacter(null);
    setPage(nextPage);
  };

  let content;

  if (editingCharacter) {
    content = (
      <CharacterEditor
        character={editingCharacter}
        characters={characters}
        organizations={organizations}
        onSave={saveCharacter}
        onCancel={() =>
          setEditingCharacter(null)
        }
      />
    );
  } else if (viewingCharacter) {
    content = (
      <CharacterProfile
        character={viewingCharacter}
        onBack={() =>
          setViewingCharacter(null)
        }
        onEdit={editCharacter}
      />
    );
  } else if (page === "characters") {
    content = (
      <CharactersArchive
        characters={characters}
        onCreate={createCharacter}
        onEdit={editCharacter}
        onDelete={deleteCharacter}
        onView={setViewingCharacter}
      />
    );
  } else if (page === "organizations") {
    content = (
      <Organizations
        organizations={organizations}
        characters={characters}
        onSave={saveOrganization}
        onDelete={deleteOrganization}
      />
    );
  } else if (page === "lore") {
    content = (
      <Lore
        lore={lore}
        onSave={saveLore}
        onDelete={deleteLore}
      />
    );
  } else if (page === "data") {
    content = (
      <ImportExport
        characters={characters}
        organizations={organizations}
        lore={lore}
        onImport={importData}
      />
    );
  } else {
    content = (
      <Home
        characters={characters}
        organizations={organizations}
        lore={lore}
        onCreate={createCharacter}
        onView={setViewingCharacter}
        onEdit={editCharacter}
        onDelete={deleteCharacter}
        onNavigate={navigate}
      />
    );
  }

  return (
    <div className="site-shell">
      <header className="topbar glow-card">
        <button
          type="button"
          className="brand"
          onClick={() => navigate("home")}
        >
          <span className="brand-symbol">
            ✦
          </span>

          <span>
            <strong>OC Archive</strong>
            <small>
              Original Character Database
            </small>
          </span>
        </button>

        <div className="theme-picker">
          <span>Theme</span>

          <select
            value={theme}
            onChange={(e) =>
              changeTheme(e.target.value)
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
      </header>

      <nav className="archive-nav glow-card">
        <button
          type="button"
          className={
            page === "home"
              ? "nav-active"
              : ""
          }
          onClick={() => navigate("home")}
        >
          Home
        </button>

        <button
          type="button"
          className={
            page === "characters"
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
          type="button"
          className={
            page === "organizations"
              ? "nav-active"
              : ""
          }
          onClick={() =>
            navigate("organizations")
          }
        >
          Organizations
        </button>

        <button
          type="button"
          className={
            page === "lore"
              ? "nav-active"
              : ""
          }
          onClick={() => navigate("lore")}
        >
          Lore
        </button>

        <button
          type="button"
          className={
            page === "data"
              ? "nav-active"
              : ""
          }
          onClick={() => navigate("data")}
        >
          Import / Export
        </button>
      </nav>

      <main>{content}</main>

      <footer>
        <span>
          OC Archive · {currentTheme.name}
        </span>

        <span>
          Stored locally in your browser
        </span>
      </footer>
    </div>
  );
}
