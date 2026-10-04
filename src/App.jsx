import { useEffect, useMemo, useRef, useState } from "react";
import { THEMES, applyTheme, getTheme } from "./themes";

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

    socialStats: {
      ...emptyCharacter.socialStats,
      ...(character?.socialStats || {}),
    },

    relationships: Array.isArray(character?.relationships)
      ? character.relationships
      : [],

    moodboard: Array.isArray(character?.moodboard)
      ? character.moodboard
      : [],
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

/* =========================================================
   BASIC UI
   ========================================================= */

function Section({ title, children, className = "" }) {
  return (
    <section className={`form-section glow-card ${className}`}>
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
        rows="5"
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function StatBar({
  leftLabel,
  rightLabel,
  value,
  onChange,
}) {
  return (
    <div className="stat-row">
      <div className="stat-label left">
        {leftLabel}
      </div>

      <div className="stat-pips">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            type="button"
            className={
              level === value
                ? "stat-pip active"
                : "stat-pip"
            }
            onClick={() => onChange(level)}
          >
            {level}
          </button>
        ))}
      </div>

      <div className="stat-label right">
        {rightLabel}
      </div>
    </div>
  );
}

function SkillBar({ label, value, onChange }) {
  return (
    <div className="skill-row">
      <span className="skill-name">{label}</span>

      <div className="skill-pips">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            type="button"
            className={
              level <= value
                ? "skill-pip active"
                : "skill-pip"
            }
            onClick={() => onChange(level)}
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
   CHARACTER FORM
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
        /* skip bad files */
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
      id:
        character.id ||
        makeId("character"),
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
              ? `${character.name || "Character"}`
              : "Create an OC"}
          </h1>

          <p className="muted">
            Complete the sheet however you want.
            Everything is saved when you save the character.
          </p>
        </div>

        <button
          type="button"
          className="button secondary"
          onClick={onCancel}
        >
          Back
        </button>
      </div>

      {/* IDENTITY */}

      <Section title="Identity">
        <Field
          label="First name"
          value={character.name}
          onChange={(value) =>
            update("name", value)
          }
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
          onChange={(value) =>
            update("age", value)
          }
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

      {/* STATUS */}

      <Section title="Status">
        <label className="field">
          <span>Current status</span>

          <select
            value={character.status}
            onChange={(event) =>
              update(
                "status",
                event.target.value
              )
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
          onChange={(value) =>
            update("laterStatus", value)
          }
          placeholder="Future status / fate"
        />
      </Section>

      {/* AFFILIATIONS */}

      <Section title="Occupation & Affiliations">
        <Field
          label="Job"
          value={character.job}
          onChange={(value) =>
            update("job", value)
          }
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
            update(
              "pastAffiliation",
              value
            )
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

      {/* APPEARANCE */}

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

      {/* ABILITY */}

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
            update(
              "abilityDescription",
              value
            )
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

      {/* PERSONALITY */}

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
                  updatePersonality(
                    id,
                    value
                  )
                }
              />
            )
          )}
        </div>
      </Section>

      {/* SKILLS */}

      <Section title="Skills">
        <div className="stats-panel field-wide">
          {SKILLS.map((skill) => (
            <SkillBar
              key={skill}
              label={skill}
              value={
                character.skills[skill]
              }
              onChange={(value) =>
                updateSkill(
                  skill,
                  value
                )
              }
            />
          ))}
        </div>
      </Section>

      {/* SOCIAL */}

      <Section title="Social Stats">
        <div className="stats-panel field-wide">
          {SOCIAL_STATS.map((stat) => (
            <SkillBar
              key={stat}
              label={stat}
              value={
                character.socialStats[
                  stat
                ]
              }
              onChange={(value) =>
                updateSocialStat(
                  stat,
                  value
                )
              }
            />
          ))}
        </div>
      </Section>

      {/* PERSONAL */}

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
          placeholder="Illnesses, conditions, vulnerabilities..."
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

      {/* RELATIONSHIPS */}

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
                  value={
                    relationship.status
                  }
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
                  value={
                    relationship.notes
                  }
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
                  className="button danger"
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

      {/* MOODBOARD */}

      <Section title="Moodboard">
        <div className="moodboard-editor field-wide">
          <label className="button secondary upload-button">
            + Add images
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={addMoodboardImage}
            />
          </label>

          {character.moodboard.length > 0 && (
            <div className="moodboard-grid">
              {character.moodboard.map(
                (image) => (
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
                )
              )}
            </div>
          )}
        </div>
      </Section>

      {/* SAVE */}

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
          {character.id
            ? "Save changes"
            : "Create character"}
        </button>
      </div>
    </form>
  );
}

/* =========================================================
   CHARACTER DETAIL
   ========================================================= */

function CharacterProfile({
  character,
  characters,
  onEdit,
  onBack,
}) {
  const getCharacterName = (id) => {
    const found = characters.find(
      (item) => item.id === id
    );

    if (!found) return "Unknown character";

    return `${found.name}${
      found.lastName
        ? ` ${found.lastName}`
        : ""
    }`;
  };

  return (
    <main className="page character-profile">
      <div className="profile-topbar">
        <button
          className="button secondary"
          onClick={onBack}
        >
          ← Back
        </button>

        <button
          className="button primary"
          onClick={onEdit}
        >
          Edit character
        </button>
      </div>

      <section className="profile-hero glow-card">
        <div className="profile-image">
          {character.image ? (
            <img
              src={character.image}
              alt={character.name}
            />
          ) : (
            <div className="image-placeholder large">
              ✦
            </div>
          )}
        </div>

        <div className="profile-heading">
          <div className="character-status">
            <span
              className={`status-dot ${
                character.status === "dead"
                  ? "dead"
                  : character.status ===
                      "unknown"
                    ? "unknown"
                    : "alive"
              }`}
            />

            {character.status}
          </div>

          <p className="eyebrow">
            CHARACTER FILE
          </p>

          <h1>
            {character.name}{" "}
            {character.lastName}
          </h1>

          {character.nickname && (
            <p className="nickname">
              “{character.nickname}”
            </p>
          )}

          <div className="profile-tags">
            {character.age && (
              <span>{character.age}</span>
            )}

            {character.gender && (
              <span>
                {character.gender}
              </span>
            )}

            {character.mbti && (
              <span>{character.mbti}</span>
            )}

            {character.affiliation && (
              <span>
                {character.affiliation}
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="profile-grid">
        <Section title="Identity">
          <Info
            label="Nationality"
            value={character.nationality}
          />

          <Info
            label="Origins"
            value={character.origins}
          />

          <Info
            label="Species"
            value={character.species}
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
            label="Later status"
            value={character.laterStatus}
          />
        </Section>

        <Section title="Occupation">
          <Info
            label="Job"
            value={character.job}
          />

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
            label="Eyes"
            value={character.eyeColor}
          />

          <Info
            label="Hair"
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
            label="Description"
            value={
              character.abilityDescription
            }
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
                  onChange={() => {}}
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
                value={
                  character.skills[skill]
                }
                onChange={() => {}}
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
                  character.socialStats[
                    stat
                  ]
                }
                onChange={() => {}}
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
            label="Sickness"
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
            {character.relationships.length ===
            0 ? (
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
            {character.moodboard.length ===
            0 ? (
              <p className="muted">
                No moodboard images.
              </p>
            ) : (
              character.moodboard.map(
                (image) => (
                  <img
                    key={image.id}
                    src={image.src}
                    alt=""
                  />
                )
              )
            )}
          </div>
        </Section>
      </div>
    </main>
  );
}

function Info({ label, value }) {
  return (
    <div className="info-field">
      <span>{label}</span>
      <strong>
        {value || "—"}
      </strong>
    </div>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div className="info-block field-wide">
      <span>{label}</span>
      <p>{value || "—"}</p>
    </div>
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
  onDelete,
}) {
  const filteredCharacters = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) return characters;

    return characters.filter(
      (character) =>
        [
          character.name,
          character.lastName,
          character.nickname,
          character.job,
          character.affiliation,
          character.species,
        ]
          .filter(Boolean)
          .some((value) =>
            value
              .toLowerCase()
              .includes(query)
          )
    );
  }, [characters, search]);

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">
            CHARACTER ARCHIVE
          </p>

          <h1>Your Characters</h1>

          <p className="muted">
            {characters.length} character
            {characters.length !== 1
              ? "s"
              : ""}
          </p>
        </div>

        <button
          className="button primary"
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
          <div className="empty-icon">
            ✦
          </div>

          <h2>
            {characters.length === 0
              ? "Your archive is empty"
              : "No characters found"}
          </h2>

          <p className="muted">
            {characters.length === 0
              ? "Create your first original character."
              : "Try another search."}
          </p>

          {characters.length === 0 && (
            <button
              className="button primary"
              onClick={onCreate}
            >
              Create your first OC
            </button>
          )}
        </div>
      ) : (
        <div className="character-grid">
          {filteredCharacters.map(
            (character) => (
              <article
                className="character-card glow-card"
                key={character.id}
                onClick={() =>
                  onOpen(character.id)
                }
              >
                <div className="character-image">
                  {character.image ? (
                    <img
                      src={character.image}
                      alt={character.name}
                    />
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
                        character.status ===
                        "dead"
                          ? "dead"
                          : character.status ===
                              "unknown"
                            ? "unknown"
                            : "alive"
                      }`}
                    />

                    {character.status}
                  </div>

                  <h2>
                    {character.name}{" "}
                    {character.lastName && (
                      <span>
                        {character.lastName}
                      </span>
                    )}
                  </h2>

                  {character.nickname && (
                    <p className="nickname">
                      “{character.nickname}”
                    </p>
                  )}

                  <div className="character-meta">
                    {character.age && (
                      <span>
                        {character.age}
                      </span>
                    )}

                    {character.job && (
                      <span>
                        {character.job}
                      </span>
                    )}

                    {character.affiliation && (
                      <span>
                        {character.affiliation}
                      </span>
                    )}
                  </div>

                  <div
                    className="character-card-actions"
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                  >
                    <button
                      className="button danger"
                      onClick={() =>
                        onDelete(
                          character.id
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
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

function OrganizationsPage({
  organizations,
  characters,
  onCreate,
  onEdit,
  onDelete,
}) {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">
            WORLD DATABASE
          </p>

          <h1>Organizations</h1>

          <p className="muted">
            {organizations.length} organization
            {organizations.length !== 1
              ? "s"
              : ""}
          </p>
        </div>

        <button
          className="button primary"
          onClick={onCreate}
        >
          + New organization
        </button>
      </div>

      {organizations.length === 0 ? (
        <div className="empty-state glow-card">
          <div className="empty-icon">
            ♢
          </div>

          <h2>No organizations yet</h2>

          <p className="muted">
            Create factions, companies,
            gangs, schools, armies and more.
          </p>

          <button
            className="button primary"
            onClick={onCreate}
          >
            Create organization
          </button>
        </div>
      ) : (
        <div className="organization-grid">
          {organizations.map(
            (organization) => (
              <article
                className="organization-card glow-card"
                key={organization.id}
              >
                {organization.image && (
                  <img
                    src={organization.image}
                    alt=""
                  />
                )}

                <div className="organization-content">
                  <p className="eyebrow">
                    ORGANIZATION
                  </p>

                  <h2>
                    {organization.name}
                  </h2>

                  <p className="muted">
                    {organization.description ||
                      "No description."}
                  </p>

                  <div className="organization-branches">
                    {organization.branches
                      .length === 0 ? (
                      <span>
                        No branches
                      </span>
                    ) : (
                      organization.branches.map(
                        (branch) => (
                          <div
                            className="branch-card"
                            key={
                              branch.id
                            }
                          >
                            <strong>
                              {
                                branch.name
                              }
                            </strong>

                            <small>
                              {branch.description ||
                                "No description"}
                            </small>

                            <small>
                              {
                                branch.members
                                  .length
                              }{" "}
                              member
                              {branch.members
                                .length !==
                              1
                                ? "s"
                                : ""}
                            </small>
                          </div>
                        )
                      )
                    )}
                  </div>

                  <div className="character-card-actions">
                    <button
                      className="button secondary"
                      onClick={() =>
                        onEdit(
                          organization
                        )
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="button danger"
                      onClick={() =>
                        onDelete(
                          organization.id
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            )
          )}
        </div>
      )}
    </main>
  );
}

function OrganizationEditor({
  initialOrganization,
  characters,
  onSave,
  onCancel,
}) {
  const [organization, setOrganization] =
    useState({
      ...emptyOrganization,
      ...initialOrganization,
      branches:
        initialOrganization?.branches ||
        [],
    });

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
      branches:
        current.branches.filter(
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
          Back
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
          value={
            organization.description
          }
          onChange={(value) =>
            update(
              "description",
              value
            )
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
          {organization.branches.map(
            (branch) => (
              <div
                className="branch-edit-card"
                key={branch.id}
              >
                <div className="branch-edit-header">
                  <input
                    value={branch.name}
                    onChange={(event) =>
                      updateBranch(
                        branch.id,
                        "name",
                        event.target.value
                      )
                    }
                    placeholder="Branch name"
                  />

                  <button
                    type="button"
                    className="button danger"
                    onClick={() =>
                      removeBranch(
                        branch.id
                      )
                    }
                  >
                    Delete
                  </button>
                </div>

                <textarea
                  value={
                    branch.description
                  }
                  onChange={(event) =>
                    updateBranch(
                      branch.id,
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Branch description"
                  rows="3"
                />

                <div className="member-picker">
                  <strong>
                    Members
                  </strong>

                  {characters.length ===
                  0 ? (
                    <p className="muted">
                      Create characters
                      first.
                    </p>
                  ) : (
                    characters.map(
                      (character) => {
                        const selected =
                          branch.members.includes(
                            character.id
                          );

                        return (
                          <label
                            className={
                              selected
                                ? "member-option selected"
                                : "member-option"
                            }
                            key={
                              character.id
                            }
                          >
                            <input
                              type="checkbox"
                              checked={
                                selected
                              }
                              onChange={() =>
                                toggleMember(
                                  branch.id,
                                  character.id
                                )
                              }
                            />

                            <span>
                              {
                                character.name
                              }{" "}
                              {
                                character.lastName
                              }
                            </span>
                          </label>
                        );
                      }
                    )
                  )}
                </div>
              </div>
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

function LorePage({
  lore,
  onCreate,
  onEdit,
  onDelete,
}) {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">
            WORLD DATABASE
          </p>

          <h1>Lore</h1>

          <p className="muted">
            Stories, events, places, concepts
            and worldbuilding.
          </p>
        </div>

        <button
          className="button primary"
          onClick={onCreate}
        >
          + New lore entry
        </button>
      </div>

      {lore.length === 0 ? (
        <div className="empty-state glow-card">
          <div className="empty-icon">
            ✧
          </div>

          <h2>No lore yet</h2>

          <p className="muted">
            Start building your world.
          </p>

          <button
            className="button primary"
            onClick={onCreate}
          >
            Create lore entry
          </button>
        </div>
      ) : (
        <div className="lore-grid">
          {lore.map((entry) => (
            <article
              className="lore-card glow-card"
              key={entry.id}
            >
              <p className="eyebrow">
                {entry.category ||
                  "LORE"}
              </p>

              <h2>{entry.title}</h2>

              <p>
                {entry.content}
              </p>

              <div className="character-card-actions">
                <button
                  className="button secondary"
                  onClick={() =>
                    onEdit(entry)
                  }
                >
                  Edit
                </button>

                <button
                  className="button danger"
                  onClick={() =>
                    onDelete(entry.id)
                  }
                >
                  Delete
                </button>
              </div>
            </article>
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
  const [entry, setEntry] = useState({
    ...emptyLore,
    ...initialLore,
  });

  const update = (field, value) => {
    setEntry((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const submit = (event) => {
    event.preventDefault();

    if (!entry.title.trim()) {
      alert("Please give this entry a title.");
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
          Back
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
   APP
   ========================================================= */

export default function App() {
  const [theme, setTheme] =
    useState(getTheme());

  const [activeTab, setActiveTab] =
    useState("characters");

  const [characters, setCharacters] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            "oc-characters"
          );

        if (!saved) return [];

        return JSON.parse(saved).map(
          normalizeCharacter
        );
      } catch {
        return [];
      }
    });

  const [organizations, setOrganizations] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            "oc-organizations"
          );

        return saved
          ? JSON.parse(saved)
          : [];
      } catch {
        return [];
      }
    });

  const [lore, setLore] = useState(() => {
    try {
      const saved =
        localStorage.getItem("oc-lore");

      return saved
        ? JSON.parse(saved)
        : [];
    } catch {
      return [];
    }
  });

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

  const [showOrganizationEditor, setShowOrganizationEditor] =
    useState(false);

  const [showLoreEditor, setShowLoreEditor] =
    useState(false);

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

  /* -------------------------------------------------------
     CHARACTER ACTIONS
     ------------------------------------------------------- */

  const saveCharacter = (character) => {
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

    setShowCharacterEditor(false);
    setEditingCharacter(null);
    setViewCharacterId(character.id);
  };

  const deleteCharacter = (id) => {
    const character =
      characters.find(
        (item) => item.id === id
      );

    const confirmed = window.confirm(
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

    setViewCharacterId(null);
  };

  const openNewCharacter = () => {
    setEditingCharacter(
      normalizeCharacter(emptyCharacter)
    );

    setShowCharacterEditor(true);
    setViewCharacterId(null);
  };

  const openEditCharacter = (
    character
  ) => {
    setEditingCharacter(
      normalizeCharacter(character)
    );

    setShowCharacterEditor(true);
  };

  /* -------------------------------------------------------
     ORGANIZATION ACTIONS
     ------------------------------------------------------- */

  const saveOrganization = (
    organization
  ) => {
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

      return [
        ...current,
        organization,
      ];
    });

    setShowOrganizationEditor(false);
    setEditingOrganization(null);
  };

  const deleteOrganization = (id) => {
    const confirmed = window.confirm(
      "Delete this organization?"
    );

    if (!confirmed) return;

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

    setShowLoreEditor(false);
    setEditingLore(null);
  };

  const deleteLore = (id) => {
    const confirmed = window.confirm(
      "Delete this lore entry?"
    );

    if (!confirmed) return;

    setLore((current) =>
      current.filter(
        (item) => item.id !== id
      )
    );
  };

  /* -------------------------------------------------------
     EXPORT
     ------------------------------------------------------- */

  const exportData = () => {
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

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "oc-archive-backup.json";

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
  };

  /* -------------------------------------------------------
     IMPORT
     ------------------------------------------------------- */

  const importData = async (event) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    try {
      const text =
        await file.text();

      const data =
        JSON.parse(text);

      if (
        !data ||
        typeof data !== "object"
      ) {
        throw new Error();
      }

      if (
        Array.isArray(
          data.characters
        )
      ) {
        setCharacters(
          data.characters.map(
            normalizeCharacter
          )
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

      alert(
        "OC Archive imported successfully."
      );
    } catch {
      alert(
        "This file does not contain a valid OC Archive backup."
      );
    }

    event.target.value = "";
  };

  /* -------------------------------------------------------
     CURRENT CHARACTER
     ------------------------------------------------------- */

  const currentCharacter =
    characters.find(
      (character) =>
        character.id ===
        viewCharacterId
    );

  /* -------------------------------------------------------
     RENDER
     ------------------------------------------------------- */

  let content;

  if (showCharacterEditor) {
    content = (
      <CharacterEditor
        initialCharacter={
          editingCharacter ||
          normalizeCharacter(
            emptyCharacter
          )
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
          setShowOrganizationEditor(
            false
          );
          setEditingOrganization(
            null
          );
        }}
      />
    );
  } else if (showLoreEditor) {
    content = (
      <LoreEditor
        initialLore={
          editingLore || emptyLore
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
          setEditingOrganization(
            null
          );
          setShowOrganizationEditor(
            true
          );
        }}
        onEdit={(organization) => {
          setEditingOrganization(
            organization
          );
          setShowOrganizationEditor(
            true
          );
        }}
        onDelete={
          deleteOrganization
        }
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
          onClick={() => {
            setViewCharacterId(null);
            setShowCharacterEditor(false);
            setShowOrganizationEditor(
              false
            );
            setShowLoreEditor(false);
            setActiveTab("characters");
          }}
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
            onClick={() => {
              setActiveTab("characters");
              setViewCharacterId(null);
              setShowCharacterEditor(false);
              setShowOrganizationEditor(false);
              setShowLoreEditor(false);
            }}
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
            onClick={() => {
              setActiveTab(
                "organizations"
              );
              setViewCharacterId(null);
              setShowCharacterEditor(false);
              setShowOrganizationEditor(false);
              setShowLoreEditor(false);
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
              setViewCharacterId(null);
              setShowCharacterEditor(false);
              setShowOrganizationEditor(false);
              setShowLoreEditor(false);
            }}
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
              onChange={(event) => {
                const value =
                  event.target.value;

                setTheme(value);
                applyTheme(value);
              }}
            >
              {THEMES.map(
                (themeOption) => (
                  <option
                    key={
                      themeOption.id
                    }
                    value={
                      themeOption.id
                    }
                  >
                    {themeOption.name}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="data-tools">
            <button
              className="button secondary small"
              onClick={exportData}
              title="Export backup"
            >
              Export
            </button>

            <label
              className="button secondary small"
              title="Import backup"
            >
              Import
              <input
                type="file"
                accept=".json,application/json"
                hidden
                onChange={importData}
              />
            </label>
          </div>
        </div>
      </header>

      {content}

      <footer className="site-footer">
        <span>OC Archive</span>
        <span>✦</span>
        <span>
          {characters.length} OC
          {characters.length !== 1
            ? "s"
            : ""}
        </span>
        <span>✦</span>
        <span>
          {organizations.length} organization
          {organizations.length !== 1
            ? "s"
            : ""}
        </span>
      </footer>
    </div>
  );
}
