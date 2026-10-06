import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import {
  THEMES,
  applyTheme,
  getTheme
} from "./themes";


/* =========================================================
   CONSTANTS
   ========================================================= */

const STORAGE_KEY =
  "oc-archive-data-v3";

const PERSONALITY = [
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
  ["reserved", "Reserved", "Flirty"]
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
  "Flexibility"
];

const SOCIAL = [
  "Charisma",
  "Empathy",
  "Generosity",
  "Wealth",
  "Aggression",
  "Libido"
];

const RELATIONSHIP_TYPES = [
  "Family",
  "Friends",
  "Enemies",
  "Lovers",
  "Colleagues",
  "Rivals",
  "Mentors",
  "Protégés"
];

const TABS = [
  ["characters", "Characters"],
  ["organizations", "Organizations"],
  ["lore", "Lore"]
];


/* =========================================================
   UTILITIES
   ========================================================= */

function uid(prefix = "id") {
  return (
    prefix +
    "_" +
    Math.random()
      .toString(36)
      .slice(2, 9) +
    "_" +
    Date.now()
      .toString(36)
  );
}

function emptyArray(value) {
  return Array.isArray(value)
    ? value
    : [];
}

function text(value) {
  return value == null
    ? ""
    : String(value);
}

function clamp(value, min, max) {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return min;
  }

  return Math.min(
    max,
    Math.max(min, number)
  );
}

function safeParse(value, fallback) {
  try {
    const parsed =
      JSON.parse(value);

    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}


/* =========================================================
   DEFAULT CHARACTER
   ========================================================= */

function createCharacter(overrides = {}) {
  const personality = {};

  PERSONALITY.forEach(
    ([key]) => {
      personality[key] = 3;
    }
  );

  const skills = {};

  SKILLS.forEach(
    (key) => {
      skills[key] = 3;
    }
  );

  const social = {};

  SOCIAL.forEach(
    (key) => {
      social[key] = 3;
    }
  );

  return {
    id: uid("character"),

    firstName: "",
    lastName: "",
    nicknames: "",

    age: "",
    dateOfBirth: "",

    pronouns: "",
    gender: "",
    sexuality: "",

    nationality: "",
    origins: "",

    species: "",
    height: "",
    weight: "",

    eyeColor: "",
    hairColor: "",
    hairStyle: "",

    job: "",
    sideJob: "",

    affiliation: "",
    pastAffiliation: "",

    rank: "",
    pastRank: "",

    status: "Alive",
    laterStatus: "",

    mbti: "",

    ability: "",
    abilityDescription: "",
    abilityRisks: "",

    weapon: "",

    fears: "",
    sickness: "",
    addictions: "",

    likes: "",
    dislikes: "",

    personality,
    skills,
    social,

    image: "",

    moodboard: [],

    music: "",
    musicLyrics: "",
    quotes: "",

    notes: "",
    backstory: "",

    relationships: {},

    organizations: [],

    customFields: [],

    createdAt: Date.now(),
    updatedAt: Date.now(),

    ...overrides
  };
}


/* =========================================================
   DEFAULT ORGANIZATION
   ========================================================= */

function createOrganization(
  overrides = {}
) {
  return {
    id: uid("organization"),

    name: "",
    description: "",

    branches: [],

    notes: "",

    createdAt: Date.now(),

    ...overrides
  };
}


/* =========================================================
   DEFAULT LORE
   ========================================================= */

function createLore(
  overrides = {}
) {
  return {
    id: uid("lore"),

    title: "",
    category: "General",

    content: "",

    date: "",

    tags: [],

    createdAt: Date.now(),

    ...overrides
  };
}


/* =========================================================
   DEFAULT DATABASE
   ========================================================= */

function createDatabase() {
  return {
    characters: [],
    organizations: [],
    lore: [],

    relationshipTypes:
      [...RELATIONSHIP_TYPES],

    categories: [
      "General",
      "World",
      "History",
      "Events",
      "Places",
      "Factions"
    ],

    version: 3
  };
}


/* =========================================================
   NORMALIZATION
   ========================================================= */

function normalizeCharacter(character) {
  const base =
    createCharacter();

  const merged = {
    ...base,
    ...character
  };

  merged.personality = {
    ...base.personality,
    ...(character.personality || {})
  };

  merged.skills = {
    ...base.skills,
    ...(character.skills || {})
  };

  merged.social = {
    ...base.social,
    ...(character.social || {})
  };

  merged.moodboard =
    emptyArray(
      character.moodboard
    );

  merged.organizations =
    emptyArray(
      character.organizations
    );

  merged.customFields =
    emptyArray(
      character.customFields
    );

  merged.relationships =
    character.relationships &&
    typeof character.relationships ===
      "object"
      ? character.relationships
      : {};

  return merged;
}

function normalizeDatabase(data) {
  const base =
    createDatabase();

  if (
    !data ||
    typeof data !== "object"
  ) {
    return base;
  }

  return {
    ...base,
    ...data,

    characters:
      emptyArray(
        data.characters
      ).map(
        normalizeCharacter
      ),

    organizations:
      emptyArray(
        data.organizations
      ).map((organization) => ({
        ...createOrganization(),
        ...organization,
        branches:
          emptyArray(
            organization.branches
          )
      })),

    lore:
      emptyArray(
        data.lore
      ).map((entry) => ({
        ...createLore(),
        ...entry
      })),

    relationshipTypes:
      data.relationshipTypes?.length
        ? data.relationshipTypes
        : base.relationshipTypes,

    categories:
      data.categories?.length
        ? data.categories
        : base.categories
  };
}


/* =========================================================
   STORAGE
   ========================================================= */

function loadDatabase() {
  try {
    const saved =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!saved) {
      return createDatabase();
    }

    return normalizeDatabase(
      JSON.parse(saved)
    );
  } catch {
    return createDatabase();
  }
}

function downloadJSON(
  database
) {
  const blob =
    new Blob(
      [
        JSON.stringify(
          database,
          null,
          2
        )
      ],
      {
        type:
          "application/json"
      }
    );

  const url =
    URL.createObjectURL(
      blob
    );

  const anchor =
    document.createElement(
      "a"
    );

  anchor.href = url;

  anchor.download =
    "oc-archive-backup.json";

  document.body.appendChild(
    anchor
  );

  anchor.click();

  anchor.remove();

  URL.revokeObjectURL(url);
}


/* =========================================================
   IMAGE READER
   ========================================================= */

function ImageInput({
  label,
  value,
  onChange,
  multiple = false
}) {
  const inputRef =
    useRef(null);

  function readFiles(files) {
    const list =
      Array.from(files || []);

    if (!list.length) {
      return;
    }

    const readers =
      list.map(
        (file) =>
          new Promise(
            (resolve) => {
              const reader =
                new FileReader();

              reader.onload =
                () =>
                  resolve(
                    reader.result
                  );

              reader.readAsDataURL(
                file
              );
            }
          )
      );

    Promise.all(readers)
      .then((results) => {
        if (multiple) {
          onChange([
            ...emptyArray(value),
            ...results
          ]);
        } else {
          onChange(
            results[0] || ""
          );
        }
      });
  }

  return (
    <div className="image-input">
      <div className="image-input-head">
        <label>{label}</label>

        <button
          type="button"
          className="button button-small"
          onClick={() =>
            inputRef.current?.click()
          }
        >
          Upload
        </button>
      </div>

      <input
        ref={inputRef}
        hidden
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={(event) =>
          readFiles(
            event.target.files
          )
        }
      />

      {multiple ? (
        <div className="image-preview-grid">
          {emptyArray(value).map(
            (image, index) => (
              <div
                className="image-preview"
                key={
                  image +
                  index
                }
              >
                <img
                  src={image}
                  alt=""
                />

                <button
                  type="button"
                  onClick={() =>
                    onChange(
                      value.filter(
                        (_, i) =>
                          i !== index
                      )
                    )
                  }
                >
                  ×
                </button>
              </div>
            )
          )}
        </div>
      ) : value ? (
        <div className="single-image-preview">
          <img
            src={value}
            alt=""
          />

          <button
            type="button"
            className="button button-danger"
            onClick={() =>
              onChange("")
            }
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="image-placeholder">
          No image uploaded
        </div>
      )}
    </div>
  );
}


/* =========================================================
   UI PRIMITIVES
   ========================================================= */

function Button({
  children,
  onClick,
  variant = "secondary",
  type = "button",
  disabled = false
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={
        `button button-${variant}`
      }
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Section({
  title,
  description,
  children,
  className = ""
}) {
  return (
    <section
      className={
        `panel form-section ${className}`
      }
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            Archive
          </span>

          <h3>{title}</h3>

          {description && (
            <p className="muted">
              {description}
            </p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  textarea = false,
  children
}) {
  return (
    <label className="field">
      <span>{label}</span>

      {children ||
        (textarea ? (
          <textarea
            value={value ?? ""}
            placeholder={placeholder}
            onChange={(event) =>
              onChange(
                event.target.value
              )
            }
          />
        ) : (
          <input
            type={type}
            value={value ?? ""}
            placeholder={placeholder}
            onChange={(event) =>
              onChange(
                event.target.value
              )
            }
          />
        ))}
    </label>
  );
}

function EmptyState({
  symbol = "◇",
  title,
  text,
  children
}) {
  return (
    <div className="empty-state panel">
      <div className="empty-symbol">
        {symbol}
      </div>

      <h2>{title}</h2>

      <p>{text}</p>

      {children}
    </div>
  );
}


/* =========================================================
   STAT PIPS
   ========================================================= */

function PipSelector({
  value,
  onChange,
  min = 1,
  max = 5
}) {
  return (
    <div className="pip-selector">
      {Array.from(
        {
          length:
            max - min + 1
        },
        (_, index) => {
          const current =
            min + index;

          return (
            <button
              type="button"
              key={current}
              className={
                current <= value
                  ? "pip-filled"
                  : "pip-empty"
              }
              aria-label={
                String(current)
              }
              onClick={() =>
                onChange(current)
              }
            />
          );
        }
      )}
    </div>
  );
}


/* =========================================================
   RANGE STAT
   ========================================================= */

function RangeStat({
  label,
  left,
  right,
  value,
  onChange
}) {
  return (
    <div className="range-stat">
      <div className="range-title">
        <span>{left}</span>
        <strong>{label}</strong>
        <span>{right}</span>
      </div>

      <input
        className="oc-range"
        type="range"
        min="1"
        max="5"
        value={value}
        onChange={(event) =>
          onChange(
            Number(
              event.target.value
            )
          )
        }
      />

      <div className="range-dots">
        <PipSelector
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
}


/* =========================================================
   ORGANIZATION SELECTOR
   ========================================================= */

function OrganizationSelector({
  organizations,
  value,
  onChange
}) {
  const selected =
    emptyArray(value);

  function toggleOrganization(
    organizationId
  ) {
    const exists =
      selected.find(
        (entry) =>
          entry.organizationId ===
          organizationId
      );

    if (exists) {
      onChange(
        selected.filter(
          (entry) =>
            entry.organizationId !==
            organizationId
        )
      );

      return;
    }

    onChange([
      ...selected,
      {
        organizationId,
        branchIds: []
      }
    ]);
  }

  function toggleBranch(
    organizationId,
    branchId
  ) {
    onChange(
      selected.map(
        (entry) => {
          if (
            entry.organizationId !==
            organizationId
          ) {
            return entry;
          }

          const branches =
            emptyArray(
              entry.branchIds
            );

          const exists =
            branches.includes(
              branchId
            );

          return {
            ...entry,
            branchIds: exists
              ? branches.filter(
                  (id) =>
                    id !== branchId
                )
              : [
                  ...branches,
                  branchId
                ]
          };
        }
      )
    );
  }

  return (
    <div className="organization-selector">
      {organizations.length ===
      0 ? (
        <div className="empty-mini">
          No organizations yet.
          Create one in the
          Organizations tab.
        </div>
      ) : (
        organizations.map(
          (organization) => {
            const selectedOrg =
              selected.find(
                (entry) =>
                  entry.organizationId ===
                  organization.id
              );

            return (
              <div
                className="organization-choice"
                key={
                  organization.id
                }
              >
                <label className="check-row">
                  <input
                    type="checkbox"
                    checked={
                      !!selectedOrg
                    }
                    onChange={() =>
                      toggleOrganization(
                        organization.id
                      )
                    }
                  />

                  <strong>
                    {
                      organization.name ||
                      "Unnamed organization"
                    }
                  </strong>
                </label>

                {selectedOrg &&
                  organization.branches
                    .length > 0 && (
                    <div className="branch-list">
                      {organization.branches.map(
                        (branch) => (
                          <label
                            className="check-row branch-row"
                            key={
                              branch.id
                            }
                          >
                            <input
                              type="checkbox"
                              checked={selectedOrg.branchIds.includes(
                                branch.id
                              )}
                              onChange={() =>
                                toggleBranch(
                                  organization.id,
                                  branch.id
                                )
                              }
                            />

                            {
                              branch.name
                            }
                          </label>
                        )
                      )}
                    </div>
                  )}
              </div>
            );
          }
        )
      )}
    </div>
  );
}


/* =========================================================
   RELATIONSHIP EDITOR
   ========================================================= */

function RelationshipEditor({
  character,
  characters,
  types,
  onChange
}) {
  const relationships =
    character.relationships ||
    {};

  function updateType(
    type,
    entries
  ) {
    onChange({
      ...relationships,
      [type]: entries
    });
  }

  function addRelation(type) {
    updateType(type, [
      ...emptyArray(
        relationships[type]
      ),
      {
        id: uid("relation"),
        characterId: "",
        status: "",
        description: ""
      }
    ]);
  }

  function updateRelation(
    type,
    id,
    patch
  ) {
    updateType(
      type,
      emptyArray(
        relationships[type]
      ).map((relation) =>
        relation.id === id
          ? {
              ...relation,
              ...patch
            }
          : relation
      )
    );
  }

  function removeRelation(
    type,
    id
  ) {
    updateType(
      type,
      emptyArray(
        relationships[type]
      ).filter(
        (relation) =>
          relation.id !== id
      )
    );
  }

  return (
    <div className="relationships-editor">
      {types.map((type) => (
        <div
          className="relationship-group"
          key={type}
        >
          <div className="relationship-heading">
            <h4>{type}</h4>

            <Button
              variant="small"
              onClick={() =>
                addRelation(type)
              }
            >
              + Add
            </Button>
          </div>

          {emptyArray(
            relationships[type]
          ).map((relation) => (
            <div
              className="relationship-card"
              key={relation.id}
            >
              <div className="form-grid">
                <Field
                  label="Person"
                  value={
                    relation.characterId
                  }
                  onChange={(value) =>
                    updateRelation(
                      type,
                      relation.id,
                      {
                        characterId:
                          value
                      }
                    )
                  }
                >
                  <select
                    value={
                      relation.characterId
                    }
                    onChange={(event) =>
                      updateRelation(
                        type,
                        relation.id,
                        {
                          characterId:
                            event.target
                              .value
                        }
                      )
                    }
                  >
                    <option value="">
                      Choose character
                    </option>

                    {characters
                      .filter(
                        (other) =>
                          other.id !==
                          character.id
                      )
                      .map((other) => (
                        <option
                          value={
                            other.id
                          }
                          key={
                            other.id
                          }
                        >
                          {other.firstName}{" "}
                          {other.lastName}
                        </option>
                      ))}
                  </select>
                </Field>

                <Field
                  label="Relationship status"
                  value={
                    relation.status
                  }
                  onChange={(value) =>
                    updateRelation(
                      type,
                      relation.id,
                      {
                        status: value
                      }
                    )
                  }
                  placeholder="Close, complicated, ex..."
                />
              </div>

              <Field
                label="Description / notes"
                value={
                  relation.description
                }
                onChange={(value) =>
                  updateRelation(
                    type,
                    relation.id,
                    {
                      description:
                        value
                    }
                  )
                }
                textarea
              />

              <Button
                variant="danger"
                onClick={() =>
                  removeRelation(
                    type,
                    relation.id
                  )
                }
              >
                Remove relation
              </Button>
            </div>
          ))}
        </div>
      ))}

      {types.length === 0 && (
        <div className="empty-mini">
          No relationship categories.
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
  relationshipTypes,
  onSave,
  onCancel,
  onAddRelationshipType
}) {
  const [
    draft,
    setDraft
  ] = useState(
    normalizeCharacter(
      character
    )
  );

  const [newType, setNewType] =
    useState("");

  function update(
    key,
    value
  ) {
    setDraft((current) => ({
      ...current,
      [key]: value,
      updatedAt: Date.now()
    }));
  }

  function updateNested(
    group,
    key,
    value
  ) {
    setDraft((current) => ({
      ...current,

      [group]: {
        ...current[group],
        [key]: value
      },

      updatedAt: Date.now()
    }));
  }

  function save(event) {
    event.preventDefault();

    onSave({
      ...draft,
      updatedAt: Date.now()
    });
  }

  function addCustomField() {
    update(
      "customFields",
      [
        ...draft.customFields,
        {
          id: uid("field"),
          label: "",
          value: ""
        }
      ]
    );
  }

  function updateCustomField(
    id,
    patch
  ) {
    update(
      "customFields",
      draft.customFields.map(
        (field) =>
          field.id === id
            ? {
                ...field,
                ...patch
              }
            : field
      )
    );
  }

  function removeCustomField(
    id
  ) {
    update(
      "customFields",
      draft.customFields.filter(
        (field) =>
          field.id !== id
      )
    );
  }

  function addRelationshipType() {
    const name =
      newType.trim();

    if (!name) {
      return;
    }

    onAddRelationshipType(
      name
    );

    setNewType("");
  }

  return (
    <form
      className="editor-page"
      onSubmit={save}
    >

      <div className="editor-toolbar">
        <div>
          <span className="eyebrow">
            Character archive
          </span>

          <h1>
            {draft.firstName ||
            draft.lastName
              ? `${draft.firstName} ${draft.lastName}`
              : "New character"}
          </h1>
        </div>

        <div className="toolbar-actions">
          <Button
            onClick={onCancel}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            type="submit"
          >
            Save character
          </Button>
        </div>
      </div>


      {/* =====================================================
          BASIC IDENTITY
          ===================================================== */}

      <Section
        title="Identity"
        description="Core information about the character."
      >
        <div className="form-grid">
          <Field
            label="First name"
            value={draft.firstName}
            onChange={(value) =>
              update(
                "firstName",
                value
              )
            }
          />

          <Field
            label="Last name"
            value={draft.lastName}
            onChange={(value) =>
              update(
                "lastName",
                value
              )
            }
          />

          <Field
            label="Nickname(s)"
            value={draft.nicknames}
            onChange={(value) =>
              update(
                "nicknames",
                value
              )
            }
          />

          <Field
            label="Age"
            value={draft.age}
            onChange={(value) =>
              update(
                "age",
                value
              )
            }
          />

          <Field
            label="Date of birth"
            value={
              draft.dateOfBirth
            }
            onChange={(value) =>
              update(
                "dateOfBirth",
                value
              )
            }
            type="date"
          />

          <Field
            label="Pronouns"
            value={draft.pronouns}
            onChange={(value) =>
              update(
                "pronouns",
                value
              )
            }
          />

          <Field
            label="Gender"
            value={draft.gender}
            onChange={(value) =>
              update(
                "gender",
                value
              )
            }
          />

          <Field
            label="Sexuality"
            value={
              draft.sexuality
            }
            onChange={(value) =>
              update(
                "sexuality",
                value
              )
            }
          />

          <Field
            label="Nationality"
            value={
              draft.nationality
            }
            onChange={(value) =>
              update(
                "nationality",
                value
              )
            }
          />

          <Field
            label="Origins"
            value={draft.origins}
            onChange={(value) =>
              update(
                "origins",
                value
              )
            }
          />

          <Field
            label="Species / race"
            value={draft.species}
            onChange={(value) =>
              update(
                "species",
                value
              )
            }
          />

          <Field
            label="MBTI"
            value={draft.mbti}
            onChange={(value) =>
              update(
                "mbti",
                value
              )
            }
          />
        </div>
      </Section>


      {/* =====================================================
          APPEARANCE
          ===================================================== */}

      <Section
        title="Appearance"
        description="Physical characteristics."
      >
        <div className="form-grid">
          <Field
            label="Height"
            value={draft.height}
            onChange={(value) =>
              update(
                "height",
                value
              )
            }
          />

          <Field
            label="Weight"
            value={draft.weight}
            onChange={(value) =>
              update(
                "weight",
                value
              )
            }
          />

          <Field
            label="Eye color"
            value={
              draft.eyeColor
            }
            onChange={(value) =>
              update(
                "eyeColor",
                value
              )
            }
          />

          <Field
            label="Hair color"
            value={
              draft.hairColor
            }
            onChange={(value) =>
              update(
                "hairColor",
                value
              )
            }
          />

          <Field
            label="Hair style"
            value={
              draft.hairStyle
            }
            onChange={(value) =>
              update(
                "hairStyle",
                value
              )
            }
          />
        </div>

        <ImageInput
          label="Character portrait"
          value={draft.image}
          onChange={(value) =>
            update(
              "image",
              value
            )
          }
        />

        <ImageInput
          label="Moodboard"
          value={draft.moodboard}
          multiple
          onChange={(value) =>
            update(
              "moodboard",
              value
            )
          }
        />
      </Section>


      {/* =====================================================
          STATUS / WORK
          ===================================================== */}

      <Section
        title="Occupation & status"
        description="Career, affiliation and current state."
      >
        <div className="form-grid">
          <Field
            label="Job"
            value={draft.job}
            onChange={(value) =>
              update(
                "job",
                value
              )
            }
          />

          <Field
            label="Side job"
            value={draft.sideJob}
            onChange={(value) =>
              update(
                "sideJob",
                value
              )
            }
          />

          <Field
            label="Affiliation"
            value={
              draft.affiliation
            }
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
              draft.pastAffiliation
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
            value={draft.rank}
            onChange={(value) =>
              update(
                "rank",
                value
              )
            }
          />

          <Field
            label="Past rank"
            value={
              draft.pastRank
            }
            onChange={(value) =>
              update(
                "pastRank",
                value
              )
            }
          />

          <Field
            label="Current status"
            value={draft.status}
            onChange={(value) =>
              update(
                "status",
                value
              )
            }
          />

          <Field
            label="Later status"
            value={
              draft.laterStatus
            }
            onChange={(value) =>
              update(
                "laterStatus",
                value
              )
            }
          />
        </div>
      </Section>


      {/* =====================================================
          POWER
          ===================================================== */}

      <Section
        title="Ability & equipment"
        description="Power, consequences and weapons."
      >
        <div className="form-grid">
          <Field
            label="Ability"
            value={draft.ability}
            onChange={(value) =>
              update(
                "ability",
                value
              )
            }
          />

          <Field
            label="Weapon"
            value={draft.weapon}
            onChange={(value) =>
              update(
                "weapon",
                value
              )
            }
          />
        </div>

        <div className="form-grid-wide">
          <Field
            label="Ability description"
            value={
              draft.abilityDescription
            }
            onChange={(value) =>
              update(
                "abilityDescription",
                value
              )
            }
            textarea
          />

          <Field
            label="Side effects & risks"
            value={
              draft.abilityRisks
            }
            onChange={(value) =>
              update(
                "abilityRisks",
                value
              )
            }
            textarea
          />
        </div>
      </Section>


      {/* =====================================================
          HEALTH / PERSONAL
          ===================================================== */}

      <Section
        title="Personal"
        description="Health, fears and habits."
      >
        <div className="form-grid-wide">
          <Field
            label="Fears"
            value={draft.fears}
            onChange={(value) =>
              update(
                "fears",
                value
              )
            }
            textarea
          />

          <Field
            label="Sickness"
            value={draft.sickness}
            onChange={(value) =>
              update(
                "sickness",
                value
              )
            }
            textarea
          />

          <Field
            label="Addictions"
            value={
              draft.addictions
            }
            onChange={(value) =>
              update(
                "addictions",
                value
              )
            }
            textarea
          />

          <Field
            label="Likes"
            value={draft.likes}
            onChange={(value) =>
              update(
                "likes",
                value
              )
            }
            textarea
          />

          <Field
            label="Dislikes"
            value={
              draft.dislikes
            }
            onChange={(value) =>
              update(
                "dislikes",
                value
              )
            }
            textarea
          />
        </div>
      </Section>


      {/* =====================================================
          PERSONALITY
          ===================================================== */}

      <Section
        title="Personality"
        description="Five-point personality spectrum."
      >
        <div className="stats-grid">
          {PERSONALITY.map(
            ([
              key,
              left,
              right
            ]) => (
              <RangeStat
                key={key}
                label={
                  key
                    .replace(
                      /([A-Z])/g,
                      " $1"
                    )
                    .replace(
                      /^./,
                      (letter) =>
                        letter.toUpperCase()
                    )
                }
                left={left}
                right={right}
                value={
                  draft.personality[
                    key
                  ]
                }
                onChange={(value) =>
                  updateNested(
                    "personality",
                    key,
                    value
                  )
                }
              />
            )
          )}
        </div>
      </Section>


      {/* =====================================================
          SKILLS
          ===================================================== */}

      <Section
        title="Skills"
        description="General and combat abilities."
      >
        <div className="skill-grid">
          {SKILLS.map(
            (skill) => (
              <div
                className="skill-row"
                key={skill}
              >
                <span>
                  {skill}
                </span>

                <PipSelector
                  value={
                    draft.skills[
                      skill
                    ]
                  }
                  onChange={(value) =>
                    updateNested(
                      "skills",
                      skill,
                      value
                    )
                  }
                />
              </div>
            )
          )}
        </div>
      </Section>


      {/* =====================================================
          SOCIAL
          ===================================================== */}

      <Section
        title="Social statistics"
        description="Social and personal tendencies."
      >
        <div className="skill-grid">
          {SOCIAL.map(
            (skill) => (
              <div
                className="skill-row"
                key={skill}
              >
                <span>
                  {skill}
                </span>

                <PipSelector
                  value={
                    draft.social[
                      skill
                    ]
                  }
                  onChange={(value) =>
                    updateNested(
                      "social",
                      skill,
                      value
                    )
                  }
                />
              </div>
            )
          )}
        </div>
      </Section>


      {/* =====================================================
          ORGANIZATIONS
          ===================================================== */}

      <Section
        title="Organizations"
        description="Choose organizations and branches directly from this character."
      >
        <OrganizationSelector
          organizations={
            organizations
          }
          value={
            draft.organizations
          }
          onChange={(value) =>
            update(
              "organizations",
              value
            )
          }
        />
      </Section>


      {/* =====================================================
          RELATIONSHIPS
          ===================================================== */}

      <Section
        title="Relationships"
        description="Unlimited people in each category, with custom categories."
      >
        <div className="add-category">
          <input
            value={newType}
            placeholder="New relationship category..."
            onChange={(event) =>
              setNewType(
                event.target.value
              )
            }
          />

          <Button
            onClick={
              addRelationshipType
            }
          >
            + Category
          </Button>
        </div>

        <RelationshipEditor
          character={draft}
          characters={characters}
          types={relationshipTypes}
          onChange={(relationships) =>
            update(
              "relationships",
              relationships
            )
          }
        />
      </Section>


      {/* =====================================================
          MUSIC
          ===================================================== */}

      <Section
        title="Music"
        description="The soundtrack of the character."
      >
        <Field
          label="Song / artist"
          value={draft.music}
          onChange={(value) =>
            update(
              "music",
              value
            )
          }
          placeholder="Song — Artist"
        />

        <Field
          label="Lyrics"
          value={
            draft.musicLyrics
          }
          onChange={(value) =>
            update(
              "musicLyrics",
              value
            )
          }
          textarea
          placeholder="Paste your own lyrics or notes here..."
        />
      </Section>


      {/* =====================================================
          QUOTES
          ===================================================== */}

      <Section
        title="Quotes"
        description="Character quotes and memorable lines."
      >
        <Field
          label="Quotes"
          value={draft.quotes}
          onChange={(value) =>
            update(
              "quotes",
              value
            )
          }
          textarea
        />
      </Section>


      {/* =====================================================
          BACKSTORY
          ===================================================== */}

      <Section
        title="Lore & notes"
        description="Backstory and personal notes."
      >
        <Field
          label="Backstory"
          value={
            draft.backstory
          }
          onChange={(value) =>
            update(
              "backstory",
              value
            )
          }
          textarea
        />

        <Field
          label="Private notes"
          value={draft.notes}
          onChange={(value) =>
            update(
              "notes",
              value
            )
          }
          textarea
        />
      </Section>


      {/* =====================================================
          CUSTOM FIELDS
          ===================================================== */}

      <Section
        title="Custom fields"
        description="Anything that does not fit elsewhere."
      >
        <div className="custom-fields">
          {draft.customFields.map(
            (field) => (
              <div
                className="custom-field"
                key={field.id}
              >
                <Field
                  label="Field name"
                  value={
                    field.label
                  }
                  onChange={(value) =>
                    updateCustomField(
                      field.id,
                      {
                        label:
                          value
                      }
                    )
                  }
                />

                <Field
                  label="Value"
                  value={
                    field.value
                  }
                  onChange={(value) =>
                    updateCustomField(
                      field.id,
                      {
                        value
                      }
                    )
                  }
                />

                <Button
                  variant="danger"
                  onClick={() =>
                    removeCustomField(
                      field.id
                    )
                  }
                >
                  Remove
                </Button>
              </div>
            )
          )}
        </div>

        <Button
          onClick={
            addCustomField
          }
        >
          + Add custom field
        </Button>
      </Section>


      <div className="editor-bottom-actions">
        <Button
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button
          variant="primary"
          type="submit"
        >
          Save character
        </Button>
      </div>
    </form>
  );
}


/* =========================================================
   CHARACTER CARD
   ========================================================= */

function CharacterCard({
  character,
  organizations,
  onOpen,
  onEdit,
  onDelete
}) {
  const organizationNames =
    character.organizations
      .map((membership) =>
        organizations.find(
          (organization) =>
            organization.id ===
            membership.organizationId
        )
      )
      .filter(Boolean)
      .map(
        (organization) =>
          organization.name
      );

  return (
    <article className="character-card panel">
      <div className="character-image">
        {character.image ? (
          <img
            src={character.image}
            alt=""
          />
        ) : (
          <span>
            {character.firstName
              ?.charAt(0)
              .toUpperCase() ||
              "◇"}
          </span>
        )}

        <div
          className={
            character.status
              ?.toLowerCase() ===
            "dead"
              ? "badge-dead"
              : "badge-alive"
          }
        >
          {character.status ||
            "Unknown"}
        </div>
      </div>

      <div className="character-card-content">
        <div className="card-symbol">
          ◈
        </div>

        <h3>
          {character.firstName ||
            character.lastName
            ? `${character.firstName} ${character.lastName}`
            : "Unnamed character"}
        </h3>

        {character.nicknames && (
          <p className="nickname">
            “{character.nicknames}”
          </p>
        )}

        {character.ability && (
          <p className="muted">
            {character.ability}
          </p>
        )}

        {organizationNames.length >
          0 && (
          <div className="card-tags">
            {organizationNames.map(
              (name) => (
                <span
                  className="tag"
                  key={name}
                >
                  {name}
                </span>
              )
            )}
          </div>
        )}

        <div className="character-card-actions">
          <Button
            variant="primary"
            onClick={() =>
              onOpen(
                character
              )
            }
          >
            Open
          </Button>

          <Button
            onClick={() =>
              onEdit(
                character
              )
            }
          >
            Edit
          </Button>

          <Button
            variant="danger"
            onClick={() =>
              onDelete(
                character.id
              )
            }
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

function CharacterProfile({
  character,
  characters,
  organizations,
  onBack,
  onEdit
}) {
  const [imageIndex, setImageIndex] =
    useState(0);

  const allImages =
    [
      character.image,
      ...emptyArray(
        character.moodboard
      )
    ].filter(Boolean);

  const organizationData =
    character.organizations
      .map((membership) => {
        const organization =
          organizations.find(
            (entry) =>
              entry.id ===
              membership.organizationId
          );

        if (!organization) {
          return null;
        }

        return {
          organization,
          branches:
            organization.branches.filter(
              (branch) =>
                emptyArray(
                  membership.branchIds
                ).includes(
                  branch.id
                )
            )
        };
      })
      .filter(Boolean);

  function getCharacterName(
    id
  ) {
    const found =
      characters.find(
        (entry) =>
          entry.id === id
      );

    return found
      ? `${found.firstName} ${found.lastName}`
      : "Unknown character";
  }

  return (
    <div className="profile-page">

      <div className="profile-toolbar">
        <Button
          onClick={onBack}
        >
          ← Back
        </Button>

        <Button
          variant="primary"
          onClick={() =>
            onEdit(character)
          }
        >
          Edit character
        </Button>
      </div>


      <div className="profile-hero panel">

        <div className="profile-portrait">
          {allImages.length ? (
            <img
              src={
                allImages[
                  imageIndex %
                    allImages.length
                ]
              }
              alt=""
            />
          ) : (
            <div className="profile-placeholder">
              {character.firstName
                ?.charAt(0) ||
                "◇"}
            </div>
          )}
        </div>

        <div className="profile-heading">
          <span className="eyebrow">
            Character file
          </span>

          <h1>
            {character.firstName}{" "}
            {character.lastName}
          </h1>

          {character.nicknames && (
            <p className="profile-nickname">
              {character.nicknames}
            </p>
          )}

          <div className="profile-badges">
            <span className="tag">
              {character.status ||
                "Unknown"}
            </span>

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

          {allImages.length > 1 && (
            <div className="image-selector">
              {allImages.map(
                (image, index) => (
                  <button
                    type="button"
                    key={
                      image +
                      index
                    }
                    className={
                      index ===
                      imageIndex
                        ? "image-dot active"
                        : "image-dot"
                    }
                    onClick={() =>
                      setImageIndex(
                        index
                      )
                    }
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>


      <div className="profile-grid">

        <ProfileSection title="Identity">
          <ProfileItem
            label="Age"
            value={character.age}
          />

          <ProfileItem
            label="Date of birth"
            value={
              character.dateOfBirth
            }
          />

          <ProfileItem
            label="Pronouns"
            value={
              character.pronouns
            }
          />

          <ProfileItem
            label="Gender"
            value={
              character.gender
            }
          />

          <ProfileItem
            label="Sexuality"
            value={
              character.sexuality
            }
          />

          <ProfileItem
            label="Nationality"
            value={
              character.nationality
            }
          />

          <ProfileItem
            label="Origins"
            value={
              character.origins
            }
          />
        </ProfileSection>


        <ProfileSection title="Appearance">
          <ProfileItem
            label="Height"
            value={
              character.height
            }
          />

          <ProfileItem
            label="Weight"
            value={
              character.weight
            }
          />

          <ProfileItem
            label="Eyes"
            value={
              character.eyeColor
            }
          />

          <ProfileItem
            label="Hair"
            value={
              character.hairColor
            }
          />

          <ProfileItem
            label="Hair style"
            value={
              character.hairStyle
            }
          />
        </ProfileSection>


        <ProfileSection title="Occupation">
          <ProfileItem
            label="Job"
            value={
              character.job
            }
          />

          <ProfileItem
            label="Side job"
            value={
              character.sideJob
            }
          />

          <ProfileItem
            label="Affiliation"
            value={
              character.affiliation
            }
          />

          <ProfileItem
            label="Rank"
            value={
              character.rank
            }
          />

          <ProfileItem
            label="Past affiliation"
            value={
              character.pastAffiliation
            }
          />

          <ProfileItem
            label="Past rank"
            value={
              character.pastRank
            }
          />
        </ProfileSection>


        <ProfileSection
          title="Ability"
          wide
        >
          <ProfileItem
            label="Ability"
            value={
              character.ability
            }
          />

          <ProfileText
            title="Description"
            value={
              character.abilityDescription
            }
          />

          <ProfileText
            title="Risks"
            value={
              character.abilityRisks
            }
          />

          <ProfileItem
            label="Weapon"
            value={
              character.weapon
            }
          />
        </ProfileSection>


        <ProfileSection
          title="Personal"
          wide
        >
          <ProfileText
            title="Fears"
            value={
              character.fears
            }
          />

          <ProfileText
            title="Sickness"
            value={
              character.sickness
            }
          />

          <ProfileText
            title="Addictions"
            value={
              character.addictions
            }
          />

          <ProfileText
            title="Likes"
            value={
              character.likes
            }
          />

          <ProfileText
            title="Dislikes"
            value={
              character.dislikes
            }
          />
        </ProfileSection>


        <ProfileSection
          title="Organizations"
          wide
        >
          {organizationData.length ===
          0 ? (
            <p className="muted">
              No organization.
            </p>
          ) : (
            <div className="organization-profile-list">
              {organizationData.map(
                ({
                  organization,
                  branches
                }) => (
                  <div
                    className="organization-profile-card"
                    key={
                      organization.id
                    }
                  >
                    <strong>
                      {
                        organization.name
                      }
                    </strong>

                    {branches.length >
                      0 && (
                      <div className="card-tags">
                        {branches.map(
                          (
                            branch
                          ) => (
                            <span
                              className="tag"
                              key={
                                branch.id
                              }
                            >
                              {
                                branch.name
                              }
                            </span>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </ProfileSection>


        <ProfileSection
          title="Music"
          wide
        >
          <ProfileText
            title="Song"
            value={
              character.music
            }
          />

          <ProfileText
            title="Lyrics"
            value={
              character.musicLyrics
            }
          />
        </ProfileSection>


        <ProfileSection
          title="Quotes"
          wide
        >
          <ProfileText
            title="Quotes"
            value={
              character.quotes
            }
          />
        </ProfileSection>


        <ProfileSection
          title="Backstory"
          wide
        >
          <ProfileText
            title="Lore"
            value={
              character.backstory
            }
          />

          <ProfileText
            title="Notes"
            value={
              character.notes
            }
          />
        </ProfileSection>

      </div>


      <div className="profile-grid">

        <ProfileStats
          title="Personality"
          data={character.personality}
          definitions={
            PERSONALITY
          }
        />

        <ProfilePips
          title="Skills"
          data={
            character.skills
          }
        />

        <ProfilePips
          title="Social statistics"
          data={
            character.social
          }
        />

      </div>


      <ProfileSection
        title="Relationships"
        wide
      >
        <div className="profile-relationships">
          {Object.entries(
            character.relationships ||
              {}
          ).map(
            ([
              type,
              relations
            ]) => (
              <div
                className="profile-relation-group"
                key={type}
              >
                <h4>{type}</h4>

                {emptyArray(
                  relations
                ).length === 0 ? (
                  <p className="muted">
                    None
                  </p>
                ) : (
                  emptyArray(
                    relations
                  ).map(
                    (relation) => (
                      <div
                        className="profile-relation"
                        key={
                          relation.id
                        }
                      >
                        <strong>
                          {getCharacterName(
                            relation.characterId
                          )}
                        </strong>

                        {relation.status && (
                          <span className="tag">
                            {
                              relation.status
                            }
                          </span>
                        )}

                        {relation.description && (
                          <p>
                            {
                              relation.description
                            }
                          </p>
                        )}
                      </div>
                    )
                  )
                )}
              </div>
            )
          )}
        </div>
      </ProfileSection>

    </div>
  );
}


function ProfileItem({
  label,
  value
}) {
  if (!value) {
    return null;
  }

  return (
    <div className="profile-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ProfileText({
  title,
  value
}) {
  if (!value) {
    return null;
  }

  return (
    <div className="profile-text">
      <h4>{title}</h4>
      <p>{value}</p>
    </div>
  );
}

function ProfileSection({
  title,
  children,
  wide = false
}) {
  return (
    <section
      className={
        wide
          ? "profile-section panel wide"
          : "profile-section panel"
      }
    >
      <h3>{title}</h3>

      <div className="profile-section-content">
        {children}
      </div>
    </section>
  );
}

function ProfileStats({
  title,
  data,
  definitions
}) {
  return (
    <ProfileSection
      title={title}
    >
      <div className="profile-stat-list">
        {definitions.map(
          ([
            key,
            left,
            right
          ]) => (
            <div
              className="profile-stat"
              key={key}
            >
              <div>
                <span>
                  {left}
                </span>

                <strong>
                  {key}
                </strong>

                <span>
                  {right}
                </span>
              </div>

              <PipSelector
                value={
                  data[key] || 3
                }
                onChange={() => {}}
              />
            </div>
          )
        )}
      </div>
    </ProfileSection>
  );
}

function ProfilePips({
  title,
  data
}) {
  return (
    <ProfileSection
      title={title}
    >
      <div className="profile-stat-list">
        {Object.entries(
          data
        ).map(
          ([
            label,
            value
          ]) => (
            <div
              className="profile-stat"
              key={label}
            >
              <strong>
                {label}
              </strong>

              <PipSelector
                value={value}
                onChange={() => {}}
              />
            </div>
          )
        )}
      </div>
    </ProfileSection>
  );
}


/* =========================================================
   ORGANIZATION PAGE
   ========================================================= */

function OrganizationsPage({
  organizations,
  characters,
  onCreate,
  onUpdate,
  onDelete
}) {
  const [editing, setEditing] =
    useState(null);

  const [
    draft,
    setDraft
  ] = useState(null);

  function beginNew() {
    const organization =
      createOrganization();

    setEditing(
      organization.id
    );

    setDraft(
      organization
    );
  }

  function beginEdit(
    organization
  ) {
    setEditing(
      organization.id
    );

    setDraft({
      ...organization,
      branches:
        emptyArray(
          organization.branches
        )
    });
  }

  function save() {
    if (!draft.name.trim()) {
      return;
    }

    const exists =
      organizations.some(
        (organization) =>
          organization.id ===
          draft.id
      );

    if (exists) {
      onUpdate(draft);
    } else {
      onCreate(draft);
    }

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
          name: "",
          description: ""
        }
      ]
    }));
  }

  function updateBranch(
    id,
    patch
  ) {
    setDraft((current) => ({
      ...current,

      branches:
        current.branches.map(
          (branch) =>
            branch.id === id
              ? {
                  ...branch,
                  ...patch
                }
              : branch
        )
    }));
  }

  function removeBranch(id) {
    setDraft((current) => ({
      ...current,

      branches:
        current.branches.filter(
          (branch) =>
            branch.id !== id
        )
    }));
  }

  return (
    <div className="page">

      <div className="page-header">
        <div>
          <span className="eyebrow">
            Archive structure
          </span>

          <h1>
            Organizations
          </h1>

          <p className="muted">
            Build factions, groups and
            branches.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={beginNew}
        >
          + New organization
        </Button>
      </div>


      {editing && draft && (
        <div className="modal-backdrop">
          <div className="modal panel">

            <div className="modal-header">
              <h2>
                {draft.name ||
                  "New organization"}
              </h2>

              <button
                type="button"
                className="close-button"
                onClick={() => {
                  setEditing(null);
                  setDraft(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="form-grid">
              <Field
                label="Name"
                value={
                  draft.name
                }
                onChange={(value) =>
                  setDraft(
                    (
                      current
                    ) => ({
                      ...current,
                      name: value
                    })
                  )
                }
              />
            </div>

            <Field
              label="Description"
              value={
                draft.description
              }
              onChange={(value) =>
                setDraft(
                  (
                    current
                  ) => ({
                    ...current,
                    description:
                      value
                  })
                )
              }
              textarea
            />

            <div className="branch-editor">

              <div className="relationship-heading">
                <h3>
                  Branches
                </h3>

                <Button
                  onClick={
                    addBranch
                  }
                >
                  + Branch
                </Button>
              </div>

              {draft.branches.map(
                (branch) => (
                  <div
                    className="branch-editor-card"
                    key={
                      branch.id
                    }
                  >
                    <Field
                      label="Branch name"
                      value={
                        branch.name
                      }
                      onChange={(
                        value
                      ) =>
                        updateBranch(
                          branch.id,
                          {
                            name: value
                          }
                        )
                      }
                    />

                    <Field
                      label="Description"
                      value={
                        branch.description
                      }
                      onChange={(
                        value
                      ) =>
                        updateBranch(
                          branch.id,
                          {
                            description:
                              value
                          }
                        )
                      }
                      textarea
                    />

                    <Button
                      variant="danger"
                      onClick={() =>
                        removeBranch(
                          branch.id
                        )
                      }
                    >
                      Remove branch
                    </Button>
                  </div>
                )
              )}
            </div>

            <Field
              label="Notes"
              value={
                draft.notes
              }
              onChange={(value) =>
                setDraft(
                  (
                    current
                  ) => ({
                    ...current,
                    notes: value
                  })
                )
              }
              textarea
            />

            <div className="modal-actions">
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
                Save organization
              </Button>
            </div>

          </div>
        </div>
      )}


      {organizations.length ===
      0 ? (
        <EmptyState
          symbol="♠"
          title="No organizations"
          text="Create your first organization and add branches to it."
        >
          <Button
            variant="primary"
            onClick={
              beginNew
            }
          >
            Create organization
          </Button>
        </EmptyState>
      ) : (
        <div className="organization-grid">
          {organizations.map(
            (organization) => {
              const members =
                characters.filter(
                  (character) =>
                    character.organizations.some(
                      (
                        membership
                      ) =>
                        membership.organizationId ===
                        organization.id
                    )
                );

              return (
                <article
                  className="organization-card panel"
                  key={
                    organization.id
                  }
                >
                  <div className="organization-card-symbol">
                    ♠
                  </div>

                  <h2>
                    {
                      organization.name
                    }
                  </h2>

                  <p>
                    {
                      organization.description ||
                      "No description."
                    }
                  </p>

                  <div className="card-tags">
                    {organization.branches.map(
                      (
                        branch
                      ) => (
                        <span
                          className="tag"
                          key={
                            branch.id
                          }
                        >
                          {
                            branch.name ||
                            "Unnamed branch"
                          }
                        </span>
                      )
                    )}
                  </div>

                  <div className="organization-member-count">
                    {members.length}{" "}
                    member
                    {members.length ===
                    1
                      ? ""
                      : "s"}
                  </div>

                  <div className="character-card-actions">
                    <Button
                      variant="primary"
                      onClick={() =>
                        beginEdit(
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
                </article>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}


/* =========================================================
   LORE PAGE
   ========================================================= */

function LorePage({
  lore,
  categories,
  onCreate,
  onUpdate,
  onDelete,
  onAddCategory
}) {
  const [editing, setEditing] =
    useState(null);

  const [
    draft,
    setDraft
  ] = useState(null);

  const [newCategory, setNewCategory] =
    useState("");

  function beginNew() {
    const entry =
      createLore();

    setDraft(entry);
    setEditing(entry.id);
  }

  function beginEdit(entry) {
    setDraft({
      ...entry
    });

    setEditing(entry.id);
  }

  function save() {
    if (!draft.title.trim()) {
      return;
    }

    const exists =
      lore.some(
        (entry) =>
          entry.id ===
          draft.id
      );

    if (exists) {
      onUpdate(draft);
    } else {
      onCreate(draft);
    }

    setDraft(null);
    setEditing(null);
  }

  function addCategory() {
    const category =
      newCategory.trim();

    if (!category) {
      return;
    }

    onAddCategory(
      category
    );

    setNewCategory("");
  }

  return (
    <div className="page">

      <div className="page-header">
        <div>
          <span className="eyebrow">
            World archive
          </span>

          <h1>
            Lore
          </h1>

          <p className="muted">
            Keep your universe, history
            and events together.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={beginNew}
        >
          + New lore entry
        </Button>
      </div>


      <div className="lore-tools panel">

        <div className="add-category">
          <input
            value={newCategory}
            placeholder="New lore category..."
            onChange={(event) =>
              setNewCategory(
                event.target.value
              )
            }
          />

          <Button
            onClick={
              addCategory
            }
          >
            + Category
          </Button>
        </div>

        <div className="card-tags">
          {categories.map(
            (category) => (
              <span
                className="tag"
                key={category}
              >
                {category}
              </span>
            )
          )}
        </div>

      </div>


      {editing &&
        draft && (
          <div className="modal-backdrop">
            <div className="modal panel">

              <div className="modal-header">
                <h2>
                  {draft.title ||
                    "New lore entry"}
                </h2>

                <button
                  type="button"
                  className="close-button"
                  onClick={() => {
                    setEditing(null);
                    setDraft(null);
                  }}
                >
                  ×
                </button>
              </div>

              <div className="form-grid">

                <Field
                  label="Title"
                  value={
                    draft.title
                  }
                  onChange={(value) =>
                    setDraft(
                      (
                        current
                      ) => ({
                        ...current,
                        title:
                          value
                      })
                    )
                  }
                />

                <Field
                  label="Date / period"
                  value={
                    draft.date
                  }
                  onChange={(value) =>
                    setDraft(
                      (
                        current
                      ) => ({
                        ...current,
                        date:
                          value
                      })
                    )
                  }
                />

                <Field
                  label="Category"
                  value={
                    draft.category
                  }
                  onChange={(value) =>
                    setDraft(
                      (
                        current
                      ) => ({
                        ...current,
                        category:
                          value
                      })
                    )
                  }
                >
                  <select
                    value={
                      draft.category
                    }
                    onChange={(event) =>
                      setDraft(
                        (
                          current
                        ) => ({
                          ...current,
                          category:
                            event
                              .target
                              .value
                        })
                      )
                    }
                  >
                    {categories.map(
                      (
                        category
                      ) => (
                        <option
                          value={
                            category
                          }
                          key={
                            category
                          }
                        >
                          {
                            category
                          }
                        </option>
                      )
                    )}
                  </select>
                </Field>

              </div>

              <Field
                label="Content"
                value={
                  draft.content
                }
                onChange={(value) =>
                  setDraft(
                    (
                      current
                    ) => ({
                      ...current,
                      content:
                        value
                    })
                  )
                }
                textarea
              />

              <div className="modal-actions">

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
                  Save entry
                </Button>

              </div>

            </div>
          </div>
        )}


      {lore.length === 0 ? (
        <EmptyState
          symbol="⌕"
          title="Your lore is empty"
          text="Create your first piece of worldbuilding."
        >
          <Button
            variant="primary"
            onClick={
              beginNew
            }
          >
            Create lore
          </Button>
        </EmptyState>
      ) : (
        <div className="lore-grid">
          {lore.map(
            (entry) => (
              <article
                className="lore-card panel"
                key={
                  entry.id
                }
              >
                <div className="lore-card-top">
                  <span className="tag">
                    {
                      entry.category
                    }
                  </span>

                  {entry.date && (
                    <span className="muted">
                      {
                        entry.date
                      }
                    </span>
                  )}
                </div>

                <h2>
                  {
                    entry.title
                  }
                </h2>

                <p>
                  {
                    entry.content ||
                    "No content."
                  }
                </p>

                <div className="character-card-actions">
                  <Button
                    onClick={() =>
                      beginEdit(
                        entry
                      )
                    }
                  >
                    Edit
                  </Button>

                  <Button
                    variant="danger"
                    onClick={() =>
                      onDelete(
                        entry.id
                      )
                    }
                  >
                    Delete
                  </Button>
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
   MAIN APP
   ========================================================= */

export default function App() {

  const [
    database,
    setDatabase
  ] = useState(
    loadDatabase
  );

  const [
    activeTab,
    setActiveTab
  ] = useState(
    "characters"
  );

  const [
    selectedCharacter,
    setSelectedCharacter
  ] = useState(null);

  const [
    editingCharacter,
    setEditingCharacter
  ] = useState(null);

  const [
    search,
    setSearch
  ] = useState("");

  const [
    theme,
    setTheme
  ] = useState(
    getTheme()
  );

  const [
    statusFilter,
    setStatusFilter
  ] = useState("all");

  const [
    importError,
    setImportError
  ] = useState("");

  const importRef =
    useRef(null);


  /* =======================================================
     PERSISTENCE
     ======================================================= */

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          database
        )
      );
    } catch {
      // Browser storage can be unavailable.
    }
  }, [database]);


  /* =======================================================
     THEME
     ======================================================= */

  function changeTheme(
    value
  ) {
    setTheme(value);

    applyTheme(value);
  }


  /* =======================================================
     DATABASE UPDATE
     ======================================================= */

  function updateDatabase(
    updater
  ) {
    setDatabase(
      (current) =>
        normalizeDatabase(
          typeof updater ===
          "function"
            ? updater(current)
            : updater
        )
    );
  }


  /* =======================================================
     CHARACTERS
     ======================================================= */

  function createNewCharacter() {
    setSelectedCharacter(null);

    setEditingCharacter(
      createCharacter()
    );

    setActiveTab(
      "characters"
    );
  }

  function saveCharacter(
    character
  ) {
    updateDatabase(
      (current) => {
        const exists =
          current.characters.some(
            (entry) =>
              entry.id ===
              character.id
          );

        return {
          ...current,

          characters: exists
            ? current.characters.map(
                (entry) =>
                  entry.id ===
                  character.id
                    ? normalizeCharacter(
                        character
                      )
                    : entry
              )
            : [
                ...current.characters,
                normalizeCharacter(
                  character
                )
              ]
        };
      }
    );

    setEditingCharacter(null);

    setSelectedCharacter(
      character.id
    );
  }

  function deleteCharacter(
    id
  ) {
    const character =
      database.characters.find(
        (entry) =>
          entry.id === id
      );

    if (!character) {
      return;
    }

    const name =
      `${character.firstName} ${character.lastName}`.trim();

    const confirmed =
      window.confirm(
        `Delete ${name || "this character"}?`
      );

    if (!confirmed) {
      return;
    }

    updateDatabase(
      (current) => ({
        ...current,

        characters:
          current.characters.filter(
            (entry) =>
              entry.id !== id
          )
      })
    );

    if (
      selectedCharacter === id
    ) {
      setSelectedCharacter(
        null
      );
    }

    if (
      editingCharacter?.id === id
    ) {
      setEditingCharacter(
        null
      );
    }
  }


  /* =======================================================
     RELATIONSHIP TYPES
     ======================================================= */

  function addRelationshipType(
    name
  ) {
    updateDatabase(
      (current) => ({
        ...current,

        relationshipTypes:
          current.relationshipTypes.includes(
            name
          )
            ? current.relationshipTypes
            : [
                ...current.relationshipTypes,
                name
              ]
      })
    );
  }


  /* =======================================================
     ORGANIZATIONS
     ======================================================= */

  function createOrganization(
    organization
  ) {
    updateDatabase(
      (current) => ({
        ...current,

        organizations: [
          ...current.organizations,
          organization
        ]
      })
    );
  }

  function updateOrganization(
    organization
  ) {
    updateDatabase(
      (current) => ({
        ...current,

        organizations:
          current.organizations.map(
            (entry) =>
              entry.id ===
              organization.id
                ? organization
                : entry
          )
      })
    );
  }

  function deleteOrganization(
    id
  ) {
    const confirmed =
      window.confirm(
        "Delete this organization?"
      );

    if (!confirmed) {
      return;
    }

    updateDatabase(
      (current) => ({
        ...current,

        organizations:
          current.organizations.filter(
            (organization) =>
              organization.id !==
              id
          ),

        characters:
          current.characters.map(
            (character) => ({
              ...character,

              organizations:
                character.organizations.filter(
                  (
                    membership
                  ) =>
                    membership.organizationId !==
                    id
                )
            })
          )
      })
    );
  }


  /* =======================================================
     LORE
     ======================================================= */

  function createLoreEntry(
    entry
  ) {
    updateDatabase(
      (current) => ({
        ...current,

        lore: [
          ...current.lore,
          entry
        ]
      })
    );
  }

  function updateLoreEntry(
    entry
  ) {
    updateDatabase(
      (current) => ({
        ...current,

        lore:
          current.lore.map(
            (currentEntry) =>
              currentEntry.id ===
              entry.id
                ? entry
                : currentEntry
          )
      })
    );
  }

  function deleteLoreEntry(
    id
  ) {
    updateDatabase(
      (current) => ({
        ...current,

        lore:
          current.lore.filter(
            (entry) =>
              entry.id !== id
          )
      })
    );
  }

  function addLoreCategory(
    category
  ) {
    updateDatabase(
      (current) => ({
        ...current,

        categories:
          current.categories.includes(
            category
          )
            ? current.categories
            : [
                ...current.categories,
                category
              ]
      })
    );
  }


  /* =======================================================
     IMPORT / EXPORT
     ======================================================= */

  function exportData() {
    downloadJSON(
      database
    );
  }

  function openImport() {
    setImportError("");

    importRef.current?.click();
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
        const parsed =
          JSON.parse(
            reader.result
          );

        const normalized =
          normalizeDatabase(
            parsed
          );

        setDatabase(
          normalized
        );

        setSelectedCharacter(
          null
        );

        setEditingCharacter(
          null
        );

        setImportError("");

        alert(
          "OC Archive imported successfully."
        );
      } catch {
        setImportError(
          "This file is not a valid OC Archive JSON backup."
        );
      }

      event.target.value = "";
    };

    reader.readAsText(
      file
    );
  }


  /* =======================================================
     SEARCH
     ======================================================= */

  const filteredCharacters =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return database.characters.filter(
        (character) => {
          const haystack =
            [
              character.firstName,
              character.lastName,
              character.nicknames,
              character.ability,
              character.job,
              character.affiliation,
              character.nationality,
              character.species,
              character.mbti,
              character.music
            ]
              .join(" ")
              .toLowerCase();

          const matchesSearch =
            !query ||
            haystack.includes(
              query
            );

          const matchesStatus =
            statusFilter ===
              "all" ||
            character.status
              ?.toLowerCase() ===
              statusFilter.toLowerCase();

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      database.characters,
      search,
      statusFilter
    ]);


  /* =======================================================
     CHARACTER VIEW
     ======================================================= */

  const currentCharacter =
    database.characters.find(
      (character) =>
        character.id ===
        selectedCharacter
    );


  /* =======================================================
     RENDER EDITOR
     ======================================================= */

  if (editingCharacter) {
    return (
      <div className="app-shell">
        <CharacterEditor
          character={
            editingCharacter
          }
          characters={
            database.characters
          }
          organizations={
            database.organizations
          }
          relationshipTypes={
            database.relationshipTypes
          }
          onSave={
            saveCharacter
          }
          onCancel={() =>
            setEditingCharacter(
              null
            )
          }
          onAddRelationshipType={
            addRelationshipType
          }
        />
      </div>
    );
  }


  /* =======================================================
     RENDER PROFILE
     ======================================================= */

  if (currentCharacter) {
    return (
      <div className="app-shell">
        <CharacterProfile
          character={
            currentCharacter
          }
          characters={
            database.characters
          }
          organizations={
            database.organizations
          }
          onBack={() =>
            setSelectedCharacter(
              null
            )
          }
          onEdit={(character) =>
            setEditingCharacter(
              character
            )
          }
        />
      </div>
    );
  }


  /* =======================================================
     MAIN APPLICATION
     ======================================================= */

  return (
    <div className="app-shell">

      <header className="topbar panel">

        <div className="brand">

          <div className="brand-symbol">
            ◈
          </div>

          <div>
            <span className="eyebrow">
              Personal archive
            </span>

            <h1>
              OC Archive
            </h1>

            <p className="muted">
              Original characters,
              relationships & lore.
            </p>
          </div>

        </div>


        <div className="topbar-actions">

          <div className="theme-picker">

            <span>
              Theme
            </span>

            <select
              value={theme}
              onChange={(event) =>
                changeTheme(
                  event.target
                    .value
                )
              }
            >
              {THEMES.map(
                (themeOption) => (
                  <option
                    value={
                      themeOption.id
                    }
                    key={
                      themeOption.id
                    }
                  >
                    {
                      themeOption.symbol
                    }{" "}
                    {
                      themeOption.name
                    }
                  </option>
                )
              )}
            </select>

          </div>

          <Button
            onClick={
              exportData
            }
          >
            Export
          </Button>

          <Button
            onClick={
              openImport
            }
          >
            Import
          </Button>

          <input
            ref={importRef}
            hidden
            type="file"
            accept=".json,application/json"
            onChange={
              importData
            }
          />

        </div>

      </header>


      <nav className="archive-nav panel">

        {TABS.map(
          ([
            id,
            label
          ]) => (
            <button
              type="button"
              key={id}
              className={
                activeTab === id
                  ? "nav-active"
                  : ""
              }
              onClick={() =>
                setActiveTab(id)
              }
            >
              {label}
            </button>
          )
        )}

      </nav>


      {importError && (
        <div className="error-banner">
          {importError}
        </div>
      )}


      {activeTab ===
        "characters" && (
        <main className="page">

          <div className="page-header">

            <div>
              <span className="eyebrow">
                Character archive
              </span>

              <h1>
                Characters
              </h1>

              <p className="muted">
                {database.characters.length}{" "}
                character
                {database.characters.length ===
                1
                  ? ""
                  : "s"}{" "}
                archived.
              </p>
            </div>

            <Button
              variant="primary"
              onClick={
                createNewCharacter
              }
            >
              + New character
            </Button>

          </div>


          <div className="archive-tools panel">

            <div className="search-box">
              <span>
                ⌕
              </span>

              <input
                value={search}
                placeholder="Search characters..."
                onChange={(event) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
              />
            </div>

            <select
              className="filter-select"
              value={
                statusFilter
              }
              onChange={(event) =>
                setStatusFilter(
                  event.target
                    .value
                )
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
            </select>

            <span className="archive-count">
              {
                filteredCharacters.length
              }{" "}
              shown
            </span>

          </div>


          {filteredCharacters.length ===
          0 ? (
            <EmptyState
              symbol="◉"
              title={
                database.characters.length ===
                0
                  ? "Your archive is empty"
                  : "No characters found"
              }
              text={
                database.characters.length ===
                0
                  ? "Create your first OC to start building the archive."
                  : "Try another search or filter."
              }
            >
              {database.characters.length ===
                0 && (
                <Button
                  variant="primary"
                  onClick={
                    createNewCharacter
                  }
                >
                  Create character
                </Button>
              )}
            </EmptyState>
          ) : (
            <div className="character-grid">

              {filteredCharacters.map(
                (character) => (
                  <CharacterCard
                    key={
                      character.id
                    }
                    character={
                      character
                    }
                    organizations={
                      database.organizations
                    }
                    onOpen={(entry) =>
                      setSelectedCharacter(
                        entry.id
                      )
                    }
                    onEdit={(entry) =>
                      setEditingCharacter(
                        entry
                      )
                    }
                    onDelete={
                      deleteCharacter
                    }
                  />
                )
              )}

            </div>
          )}

        </main>
      )}


      {activeTab ===
        "organizations" && (
        <OrganizationsPage
          organizations={
            database.organizations
          }
          characters={
            database.characters
          }
          onCreate={
            createOrganization
          }
          onUpdate={
            updateOrganization
          }
          onDelete={
            deleteOrganization
          }
        />
      )}


      {activeTab ===
        "lore" && (
        <LorePage
          lore={
            database.lore
          }
          categories={
            database.categories
          }
          onCreate={
            createLoreEntry
          }
          onUpdate={
            updateLoreEntry
          }
          onDelete={
            deleteLoreEntry
          }
          onAddCategory={
            addLoreCategory
          }
        />
      )}


      <footer>
        <span>
          OC Archive
        </span>

        <span>
          Everything is stored
          locally in your browser.
        </span>

        <span>
          {database.characters.length}{" "}
          characters ·{" "}
          {database.organizations.length}{" "}
          organizations ·{" "}
          {database.lore.length}{" "}
          lore entries
        </span>
      </footer>

    </div>
  );
}
