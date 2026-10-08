import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import { THEMES } from "./themes";

const STORAGE_KEY = "ocfiles_database_v2";

const uid = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

const blankCharacter = () => ({
  id: uid(),

  name: "",
  lastName: "",
  nickname: "",

  age: "",
  dob: "",

  gender: "",
  pronouns: "",
  sexuality: "",

  nationality: "",
  origins: "",
  species: "Human",

  job: "",
  sideJob: "",

  height: "",
  weight: "",

  eyeColor: "",
  hairColor: "",
  hairStyle: "",

  affiliation: "",
  pastAffiliation: "",

  rank: "",
  pastRank: "",

  status: "Alive",
  laterStatus: "",

  mbti: "",

  abilities: "",
  abilityEffects: "",
  weapon: "",

  fears: "",
  sickness: "",
  addictions: "",

  likes: "",
  dislikes: "",

  anecdotes: "",

  songs: "",
  lyrics: "",
  quotes: "",

  notes: "",

  image: "",
  moodboard: [],

  traits: {
    nice: 50,
    brave: 50,
    pacifist: 50,
    thoughtful: 50,
    agreeable: 50,
    idealistic: 50,
    frugal: 50,
    collected: 50,
    honest: 50,
    polite: 50,
    smart: 50,
    confident: 50,
    calm: 50,
    patient: 50,
    gullible: 50,
    reserved: 50
  },

  skills: {
    perception: 3,
    communication: 3,
    persuasion: 3,
    mediation: 3,
    literacy: 3,
    creativity: 3,
    cooking: 3,
    tech: 3,
    combat: 3,
    survival: 3,
    stealth: 3,
    street: 3,
    seduction: 3,
    luck: 3,
    animals: 3,
    children: 3,
    reflexes: 3,
    strength: 3,
    speed: 3,
    battleIQ: 3,
    resistance: 3,
    flexibility: 3
  },

  socials: {
    charisma: 3,
    empathy: 3,
    generosity: 3,
    wealth: 3,
    aggression: 3,
    libido: 3
  },

  relationships: {
    family: [],
    friends: [],
    pets: []
  },

  linkedOrganizations: [],
  linkedPosts: [],
  linkedCases: [],

  createdAt: Date.now()
});

const blankOrganization = () => ({
  id: uid(),
  name: "",
  type: "",
  description: "",
  ideology: "",
  headquarters: "",
  leader: "",
  branches: [],
  members: [],
  posts: [],
  notes: ""
});

const blankPost = () => ({
  id: uid(),
  title: "Untitled post",
  content: "",
  characters: [],
  organizations: [],
  date: new Date().toLocaleDateString()
});

const blankLore = () => ({
  id: uid(),
  title: "New lore entry",
  category: "General",
  content: "",
  linkedCharacters: [],
  linkedOrganizations: []
});

const blankCase = () => ({
  id: uid(),
  title: "Untitled investigation",
  status: "Open",

  what: "",
  who: "",
  how: "",
  why: "",
  where: "",
  when: "",

  involved: [],

  evidence: "",
  theory: "",
  motive: "",
  solution: "",

  notes: "",

  linkedCharacters: [],
  linkedOrganizations: [],

  createdAt: Date.now()
});

const initialDatabase = {
  theme: "goth",

  activeTab: "dashboard",

  session: null,

  users: [],

  characters: [],
  organizations: [],
  posts: [],
  lore: [],
  investigations: []
};

function loadDatabase() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return initialDatabase;
    }

    return {
      ...initialDatabase,
      ...JSON.parse(raw)
    };
  } catch {
    return initialDatabase;
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function App() {
  const [database, setDatabase] = useState(loadDatabase);

  const [selectedCharacter, setSelectedCharacter] =
    useState(null);

  const [selectedOrganization, setSelectedOrganization] =
    useState(null);

  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(database)
    );
  }, [database]);

  useEffect(() => {
    const theme =
      THEMES[database.theme] || THEMES.goth;

    document.documentElement.dataset.theme =
      database.theme;

    Object.entries(theme.vars).forEach(
      ([key, value]) => {
        document.documentElement.style.setProperty(
          `--${key}`,
          value
        );
      }
    );
  }, [database.theme]);

  const updateDatabase = (callback) => {
    setDatabase((current) => {
      const next = clone(current);

      callback(next);

      return next;
    });
  };

  const characters = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) {
      return database.characters;
    }

    return database.characters.filter((character) =>
      [
        character.name,
        character.lastName,
        character.nickname,
        character.affiliation,
        character.job,
        character.species
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [database.characters, search]);

  if (!database.session) {
    return (
      <Authentication
        database={database}
        setDatabase={setDatabase}
      />
    );
  }

  const tabs = [
    ["dashboard", "⌂", "Dashboard"],
    ["characters", "♙", "Characters"],
    ["organizations", "♜", "Organizations"],
    ["posts", "✦", "Posts"],
    ["lore", "☾", "Lore"],
    ["investigations", "⌕", "Investigations"],
    ["settings", "⚙", "Settings"]
  ];

  const activeTitle =
    tabs.find(
      ([id]) => id === database.activeTab
    )?.[2] || "OC Files";

  const changeTab = (tab) => {
    updateDatabase(
      (db) => {
        db.activeTab = tab;
      }
    );

    setSelectedCharacter(null);
    setSelectedOrganization(null);
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          OC <span>FILES</span>
        </div>

        <div className="user-pill">
          ◈ {database.session}
        </div>

        <nav>
          {tabs.map(([id, icon, label]) => (
            <button
              key={id}
              className={
                database.activeTab === id
                  ? "nav-button active"
                  : "nav-button"
              }
              onClick={() => changeTab(id)}
            >
              <b>{icon}</b>
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="theme-mini">
          {Object.entries(THEMES).map(
            ([id, theme]) => (
              <button
                key={id}
                title={theme.name}
                className={
                  database.theme === id
                    ? "theme-dot selected"
                    : "theme-dot"
                }
                onClick={() =>
                  updateDatabase(
                    (db) => {
                      db.theme = id;
                    }
                  )
                }
              >
                {theme.icon}
              </button>
            )
          )}
        </div>

        <button
          className="logout"
          onClick={() =>
            updateDatabase(
              (db) => {
                db.session = null;
              }
            )
          }
        >
          Log out
        </button>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <div className="eyebrow">
              PERSONAL UNIVERSE ARCHIVE
            </div>

            <h1>{activeTitle}</h1>
          </div>

          <div className="top-actions">
            {database.activeTab ===
              "characters" && (
              <input
                className="search"
                placeholder="Search characters..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            )}

            {database.activeTab ===
              "characters" && (
              <button
                className="primary"
                onClick={() => {
                  const character =
                    blankCharacter();

                  updateDatabase((db) => {
                    db.characters.unshift(
                      character
                    );
                  });

                  setSelectedCharacter(
                    character.id
                  );
                }}
              >
                + New character
              </button>
            )}

            {database.activeTab ===
              "organizations" && (
              <button
                className="primary"
                onClick={() => {
                  const organization =
                    blankOrganization();

                  updateDatabase((db) => {
                    db.organizations.unshift(
                      organization
                    );
                  });

                  setSelectedOrganization(
                    organization.id
                  );
                }}
              >
                + Organization
              </button>
            )}
          </div>
        </header>

        {database.activeTab ===
          "dashboard" && (
          <Dashboard
            database={database}
            updateDatabase={updateDatabase}
            setSelectedCharacter={
              setSelectedCharacter
            }
          />
        )}

        {database.activeTab ===
          "characters" && (
          <CharactersPage
            database={database}
            characters={characters}
            updateDatabase={updateDatabase}
            selectedCharacter={
              selectedCharacter
            }
            setSelectedCharacter={
              setSelectedCharacter
            }
          />
        )}

        {database.activeTab ===
          "organizations" && (
          <OrganizationsPage
            database={database}
            updateDatabase={updateDatabase}
            selectedOrganization={
              selectedOrganization
            }
            setSelectedOrganization={
              setSelectedOrganization
            }
          />
        )}

        {database.activeTab === "posts" && (
          <PostsPage
            database={database}
            updateDatabase={updateDatabase}
          />
        )}

        {database.activeTab === "lore" && (
          <LorePage
            database={database}
            updateDatabase={updateDatabase}
          />
        )}

        {database.activeTab ===
          "investigations" && (
          <InvestigationsPage
            database={database}
            updateDatabase={updateDatabase}
          />
        )}

        {database.activeTab === "settings" && (
          <SettingsPage
            database={database}
            updateDatabase={updateDatabase}
            setDatabase={setDatabase}
          />
        )}
      </main>
    </div>
  );
}

/* =========================================================
   AUTHENTICATION
========================================================= */

function Authentication({
  database,
  setDatabase
}) {
  const [mode, setMode] = useState("login");

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] = useState("");

  const submit = (event) => {
    event.preventDefault();

    setError("");

    if (!username.trim() || !password) {
      setError(
        "Please enter a username and password."
      );

      return;
    }

    if (mode === "register") {
      const exists = database.users.some(
        (user) =>
          user.username.toLowerCase() ===
          username.trim().toLowerCase()
      );

      if (exists) {
        setError(
          "That username already exists."
        );

        return;
      }

      setDatabase({
        ...database,

        users: [
          ...database.users,
          {
            username: username.trim(),
            password
          }
        ],

        session: username.trim()
      });

      return;
    }

    const account = database.users.find(
      (user) =>
        user.username === username.trim() &&
        user.password === password
    );

    if (!account) {
      setError(
        "Incorrect username or password."
      );

      return;
    }

    setDatabase({
      ...database,
      session: account.username
    });
  };

  return (
    <div className="authentication">
      <div className="auth-card">
        <div className="brand brand-large">
          OC <span>FILES</span>
        </div>

        <p className="muted center">
          Your private fictional universe archive.
        </p>

        <div className="auth-tabs">
          <button
            className={
              mode === "login"
                ? "active"
                : ""
            }
            onClick={() => {
              setMode("login");
              setError("");
            }}
          >
            Log in
          </button>

          <button
            className={
              mode === "register"
                ? "active"
                : ""
            }
            onClick={() => {
              setMode("register");
              setError("");
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={submit}>
          <Field label="Username">
            <input
              value={username}
              onChange={(event) =>
                setUsername(
                  event.target.value
                )
              }
              autoComplete="username"
            />
          </Field>

          <Field label="Password">
            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              autoComplete={
                mode === "register"
                  ? "new-password"
                  : "current-password"
              }
            />
          </Field>

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          <button className="primary full">
            {mode === "login"
              ? "Enter archive"
              : "Create archive"}
          </button>
        </form>

        <small className="muted center">
          This is a personal local archive.
          Your data is saved in this browser.
        </small>
      </div>
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  database,
  updateDatabase,
  setSelectedCharacter
}) {
  const alive = database.characters.filter(
    (character) =>
      character.status === "Alive"
  ).length;

  const quickCharacter = () => {
    const character = blankCharacter();

    updateDatabase((db) => {
      db.characters.unshift(character);
      db.activeTab = "characters";
    });

    setSelectedCharacter(character.id);
  };

  return (
    <section className="page">
      <div className="hero card">
        <div>
          <div className="eyebrow">
            WELCOME BACK
          </div>

          <h2>
            Build your universe.
          </h2>

          <p>
            Create characters, connect their
            stories, investigate mysteries,
            organize factions and keep your
            lore together.
          </p>
        </div>

        <div className="hero-symbol">
          ✦
        </div>
      </div>

      <div className="stats-grid">
        <Stat
          number={database.characters.length}
          label="Characters"
        />

        <Stat
          number={
            database.organizations.length
          }
          label="Organizations"
        />

        <Stat
          number={
            database.investigations.length
          }
          label="Cases"
        />

        <Stat
          number={alive}
          label="Alive"
        />
      </div>

      <div className="two-columns">
        <section className="card">
          <div className="section-title">
            <h3>Recent characters</h3>

            <span className="counter">
              {database.characters.length}
            </span>
          </div>

          {database.characters
            .slice(0, 6)
            .map((character) => (
              <button
                className="character-row"
                key={character.id}
                onClick={() => {
                  updateDatabase(
                    (db) => {
                      db.activeTab =
                        "characters";
                    }
                  );

                  setSelectedCharacter(
                    character.id
                  );
                }}
              >
                <Avatar
                  character={character}
                />

                <span>
                  <b>
                    {character.name ||
                      "Unnamed"}
                    {" "}
                    {character.lastName}
                  </b>

                  <small>
                    {character.affiliation ||
                      "Independent"}
                  </small>
                </span>

                <i>›</i>
              </button>
            ))}

          {!database.characters.length && (
            <Empty text="No characters yet." />
          )}
        </section>

        <section className="card">
          <div className="section-title">
            <h3>Quick creation</h3>
          </div>

          <div className="quick-grid">
            <button
              onClick={quickCharacter}
            >
              ♙
              <span>Character</span>
            </button>

            <button
              onClick={() =>
                updateDatabase((db) => {
                  db.organizations.unshift(
                    blankOrganization()
                  );

                  db.activeTab =
                    "organizations";
                })
              }
            >
              ♜
              <span>Organization</span>
            </button>

            <button
              onClick={() =>
                updateDatabase((db) => {
                  db.investigations.unshift(
                    blankCase()
                  );

                  db.activeTab =
                    "investigations";
                })
              }
            >
              ⌕
              <span>Investigation</span>
            </button>

            <button
              onClick={() =>
                updateDatabase((db) => {
                  db.lore.unshift(
                    blankLore()
                  );

                  db.activeTab =
                    "lore";
                })
              }
            >
              ☾
              <span>Lore</span>
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}

function Stat({
  number,
  label
}) {
  return (
    <div className="stat-card card">
      <strong>{number}</strong>
      <span>{label}</span>
    </div>
  );
}

/* =========================================================
   CHARACTERS
========================================================= */

function CharactersPage({
  database,
  characters,
  updateDatabase,
  selectedCharacter,
  setSelectedCharacter
}) {
  const character =
    characters.find(
      (item) =>
        item.id === selectedCharacter
    );

  return (
    <section className="page split-layout">
      <div className="card character-list">
        <div className="section-title">
          <h3>Character archive</h3>

          <span className="counter">
            {characters.length}
          </span>
        </div>

        {characters.map((item) => (
          <button
            key={item.id}
            className={
              selectedCharacter === item.id
                ? "character-select active"
                : "character-select"
            }
            onClick={() =>
              setSelectedCharacter(
                item.id
              )
            }
          >
            <Avatar character={item} />

            <span>
              <b>
                {item.name ||
                  "Unnamed character"}
                {" "}
                {item.lastName}
              </b>

              <small>
                {item.nickname ||
                  item.species}
              </small>

              <small>
                {item.status}
                {" · "}
                {item.affiliation ||
                  "Independent"}
              </small>
            </span>
          </button>
        ))}

        {!characters.length && (
          <Empty text="No matching characters." />
        )}
      </div>

      {character ? (
        <CharacterEditor
          character={character}
          database={database}
          updateDatabase={
            updateDatabase
          }
          close={() =>
            setSelectedCharacter(null)
          }
        />
      ) : (
        <div className="card empty-editor">
          <div className="large-symbol">
            ♙
          </div>

          <h2>
            Select a character
          </h2>

          <p>
            Create a character or select
            one from the archive.
          </p>
        </div>
      )}
    </section>
  );
}

const characterSections = [
  {
    title: "Identity",
    fields: [
      ["name", "Name"],
      ["lastName", "Last name"],
      ["nickname", "Nickname(s)"],
      ["age", "Age"],
      ["dob", "Date of birth"],
      ["gender", "Gender"],
      ["pronouns", "Pronouns"],
      ["sexuality", "Sexuality"],
      ["nationality", "Nationality"],
      ["origins", "Origins"],
      ["species", "Species / race"]
    ]
  },

  {
    title: "Appearance",
    fields: [
      ["height", "Height"],
      ["weight", "Weight"],
      ["eyeColor", "Eye color"],
      ["hairColor", "Hair color"],
      ["hairStyle", "Hair style"]
    ]
  },

  {
    title: "Occupation & affiliations",
    fields: [
      ["job", "Job"],
      ["sideJob", "Side job"],
      ["affiliation", "Affiliation"],
      [
        "pastAffiliation",
        "Past affiliation"
      ],
      ["rank", "Rank"],
      ["pastRank", "Past rank"]
    ]
  },

  {
    title: "Story & abilities",
    fields: [
      ["status", "Current status"],
      ["laterStatus", "Later status"],
      ["mbti", "MBTI"],
      ["weapon", "Weapon"],
      ["abilities", "Abilities"],
      [
        "abilityEffects",
        "Effects / limitations of abilities"
      ],
      ["fears", "Fears"],
      ["sickness", "Sickness"],
      ["addictions", "Addiction(s)"]
    ]
  },

  {
    title: "Personal",
    fields: [
      ["likes", "Likes"],
      ["dislikes", "Dislikes"],
      [
        "anecdotes",
        "Anecdotes / trivia"
      ],
      ["songs", "Songs"],
      ["lyrics", "Lyrics"],
      ["quotes", "Quotes"],
      ["notes", "Extra notes"]
    ]
  }
];

const traitPairs = [
  ["nice", "Nice", "Mean"],
  ["brave", "Brave", "Coward"],
  ["pacifist", "Pacifist", "Violent"],
  [
    "thoughtful",
    "Thoughtful",
    "Impulsive"
  ],
  [
    "agreeable",
    "Agreeable",
    "Contrary"
  ],
  [
    "idealistic",
    "Idealistic",
    "Pragmatic"
  ],
  [
    "frugal",
    "Frugal",
    "Big spender"
  ],
  [
    "collected",
    "Collected",
    "Wild"
  ],
  [
    "honest",
    "Honest",
    "Deceptive"
  ],
  ["polite", "Polite", "Rude"],
  ["smart", "Smart", "Idiot"],
  [
    "confident",
    "Confident",
    "Insecure"
  ],
  ["calm", "Calm", "Anxious"],
  [
    "patient",
    "Patient",
    "Impatient"
  ],
  [
    "gullible",
    "Gullible",
    "Skeptical"
  ],
  [
    "reserved",
    "Reserved",
    "Flirty"
  ]
];

const skillNames = [
  ["perception", "Perception"],
  ["communication", "Communication"],
  ["persuasion", "Persuasion"],
  ["mediation", "Mediation"],
  ["literacy", "Literacy"],
  ["creativity", "Creativity"],
  ["cooking", "Cooking"],
  ["tech", "Tech savvy"],
  ["combat", "Combat"],
  ["survival", "Survival"],
  ["stealth", "Stealth"],
  ["street", "Street smarts"],
  ["seduction", "Seduction"],
  ["luck", "Luck"],
  ["animals", "Handling animals"],
  ["children", "Pacifying children"],
  ["reflexes", "Reflexes"],
  ["strength", "Strength"],
  ["speed", "Speed"],
  ["battleIQ", "Battle IQ"],
  ["resistance", "Resistance"],
  ["flexibility", "Flexibility"]
];

const socialNames = [
  ["charisma", "Charisma"],
  ["empathy", "Empathy"],
  ["generosity", "Generosity"],
  ["wealth", "Wealth"],
  ["aggression", "Aggression"],
  ["libido", "Libido"]
];

function CharacterEditor({
  character,
  database,
  updateDatabase,
  close
}) {
  const set = (key, value) => {
    updateDatabase((db) => {
      const item =
        db.characters.find(
          (x) => x.id === character.id
        );

      if (item) {
        item[key] = value;
      }
    });
  };

  const setNested = (
    section,
    key,
    value
  ) => {
    updateDatabase((db) => {
      const item =
        db.characters.find(
          (x) => x.id === character.id
        );

      if (item) {
        item[section][key] = value;
      }
    });
  };

  const deleteCharacter = () => {
    if (
      !window.confirm(
        "Delete this character permanently?"
      )
    ) {
      return;
    }

    updateDatabase((db) => {
      db.characters =
        db.characters.filter(
          (x) =>
            x.id !== character.id
        );

      db.posts.forEach((post) => {
        post.characters =
          post.characters.filter(
            (id) =>
              id !== character.id
          );
      });

      db.investigations.forEach(
        (investigation) => {
          investigation.linkedCharacters =
            investigation.linkedCharacters.filter(
              (id) =>
                id !== character.id
            );
        }
      );
    });

    close();
  };

  const uploadImage = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    const reader =
      new FileReader();

    reader.onload = () =>
      set("image", reader.result);

    reader.readAsDataURL(file);
  };

  const uploadMoodboard = (
    event
  ) => {
    const files = [
      ...(event.target.files || [])
    ];

    files.forEach((file) => {
      const reader =
        new FileReader();

      reader.onload = () => {
        updateDatabase((db) => {
          const item =
            db.characters.find(
              (x) =>
                x.id === character.id
            );

          if (item) {
            item.moodboard.push(
              reader.result
            );
          }
        });
      };

      reader.readAsDataURL(file);
    });
  };

  const multiline = [
    "abilities",
    "abilityEffects",
    "fears",
    "sickness",
    "addictions",
    "likes",
    "dislikes",
    "anecdotes",
    "songs",
    "lyrics",
    "quotes",
    "notes"
  ];

  return (
    <div className="card editor">
      <div className="editor-header">
        <div className="portrait-area">
          <Avatar character={character} />

          <label className="upload">
            Upload picture
            <input
              type="file"
              accept="image/*"
              onChange={uploadImage}
            />
          </label>
        </div>

        <div className="editor-heading">
          <input
            className="big-input"
            placeholder="Character name"
            value={character.name}
            onChange={(event) =>
              set(
                "name",
                event.target.value
              )
            }
          />

          <input
            className="subtitle-input"
            placeholder="Last name / title"
            value={character.lastName}
            onChange={(event) =>
              set(
                "lastName",
                event.target.value
              )
            }
          />

          <div className="badges">
            <span>
              {character.status}
            </span>

            <span>
              {character.affiliation ||
                "Independent"}
            </span>

            <span>
              {character.mbti ||
                "MBTI —"}
            </span>
          </div>
        </div>

        <button
          className="icon-button"
          onClick={close}
        >
          ×
        </button>
      </div>

      {characterSections.map(
        (section) => (
          <fieldset key={section.title}>
            <legend>
              {section.title}
            </legend>

            <div className="form-grid">
              {section.fields.map(
                ([key, label]) => (
                  <Field
                    key={key}
                    label={label}
                  >
                    {key ===
                    "status" ? (
                      <select
                        value={
                          character[key]
                        }
                        onChange={(
                          event
                        ) =>
                          set(
                            key,
                            event.target
                              .value
                          )
                        }
                      >
                        <option>
                          Alive
                        </option>
                        <option>
                          Dead
                        </option>
                        <option>
                          Unknown
                        </option>
                      </select>
                    ) : multiline.includes(
                        key
                      ) ? (
                      <textarea
                        value={
                          character[key]
                        }
                        onChange={(
                          event
                        ) =>
                          set(
                            key,
                            event.target
                              .value
                          )
                        }
                      />
                    ) : (
                      <input
                        value={
                          character[key]
                        }
                        onChange={(
                          event
                        ) =>
                          set(
                            key,
                            event.target
                              .value
                          )
                        }
                      />
                    )}
                  </Field>
                )
              )}
            </div>
          </fieldset>
        )
      )}

      <fieldset>
        <legend>
          Personality — cursor lines
        </legend>

        <div className="traits">
          {traitPairs.map(
            ([key, left, right]) => (
              <label
                className="trait"
                key={key}
              >
                <div>
                  <span>{left}</span>
                  <span>{right}</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={
                    character.traits[key]
                  }
                  onChange={(event) =>
                    setNested(
                      "traits",
                      key,
                      Number(
                        event.target.value
                      )
                    )
                  }
                />
              </label>
            )
          )}
        </div>
      </fieldset>

      <fieldset>
        <legend>
          Skills — 5 levels
        </legend>

        <div className="levels-grid">
          {skillNames.map(
            ([key, label]) => (
              <Level
                key={key}
                label={label}
                value={
                  character.skills[key]
                }
                onChange={(value) =>
                  setNested(
                    "skills",
                    key,
                    value
                  )
                }
              />
            )
          )}
        </div>
      </fieldset>

      <fieldset>
        <legend>
          Socials — 5 levels
        </legend>

        <div className="levels-grid">
          {socialNames.map(
            ([key, label]) => (
              <Level
                key={key}
                label={label}
                value={
                  character.socials[key]
                }
                onChange={(value) =>
                  setNested(
                    "socials",
                    key,
                    value
                  )
                }
              />
            )
          )}
        </div>
      </fieldset>

      <fieldset>
        <legend>
          Relationships
        </legend>

        <Relationships
          character={character}
          database={database}
          updateDatabase={
            updateDatabase
          }
        />
      </fieldset>

      <fieldset>
        <legend>
          Linked organizations
        </legend>

        <LinkList
          values={
            character.linkedOrganizations
          }
          items={
            database.organizations
          }
          placeholder="organization"
          onAdd={(id) =>
            updateDatabase((db) => {
              const item =
                db.characters.find(
                  (x) =>
                    x.id ===
                    character.id
                );

              if (
                item &&
                !item.linkedOrganizations.includes(
                  id
                )
              ) {
                item.linkedOrganizations.push(
                  id
                );
              }
            })
          }
          onRemove={(id) =>
            updateDatabase((db) => {
              const item =
                db.characters.find(
                  (x) =>
                    x.id ===
                    character.id
                );

              if (item) {
                item.linkedOrganizations =
                  item.linkedOrganizations.filter(
                    (x) => x !== id
                  );
              }
            })
          }
        />
      </fieldset>

      <fieldset>
        <legend>
          Mood board
        </legend>

        <label className="upload mood-upload">
          + Upload moodboard images

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={
              uploadMoodboard
            }
          />
        </label>

        <div className="moodboard">
          {character.moodboard.map(
            (image, index) => (
              <div
                className="mood-item"
                key={index}
              >
                <img
                  src={image}
                  alt=""
                />

                <button
                  onClick={() =>
                    updateDatabase(
                      (db) => {
                        const item =
                          db.characters.find(
                            (x) =>
                              x.id ===
                              character.id
                          );

                        item.moodboard.splice(
                          index,
                          1
                        );
                      }
                    )
                  }
                >
                  ×
                </button>
              </div>
            )
          )}
        </div>
      </fieldset>

      <div className="editor-footer">
        <button
          className="danger"
          onClick={
            deleteCharacter
          }
        >
          Delete character
        </button>

        <span className="autosave">
          ✓ Automatically saved
        </span>
      </div>
    </div>
  );
}

function Level({
  label,
  value,
  onChange
}) {
  return (
    <div className="level">
      <div className="level-title">
        <span>{label}</span>

        <b>{value}/5</b>
      </div>

      <div className="pips">
        {[1, 2, 3, 4, 5].map(
          (number) => (
            <button
              type="button"
              key={number}
              className={
                number <= value
                  ? "pip active"
                  : "pip"
              }
              onClick={() =>
                onChange(number)
              }
            />
          )
        )}
      </div>
    </div>
  );
}

function Relationships({
  character,
  updateDatabase
}) {
  const groups = [
    ["family", "Family"],
    ["friends", "Friends"],
    ["pets", "Pets"]
  ];

  return (
    <div className="relationship-grid">
      {groups.map(
        ([key, label]) => (
          <div
            className="relationship-box"
            key={key}
          >
            <h4>{label}</h4>

            {character.relationships[
              key
            ].map((id) => (
              <div
                className="tag"
                key={id}
              >
                {id}

                <button
                  onClick={() =>
                    updateDatabase(
                      (db) => {
                        const item =
                          db.characters.find(
                            (x) =>
                              x.id ===
                              character.id
                          );

                        item.relationships[
                          key
                        ] =
                          item.relationships[
                            key
                          ].filter(
                            (x) =>
                              x !== id
                          );
                      }
                    )
                  }
                >
                  ×
                </button>
              </div>
            ))}

            <button
              className="secondary small"
              onClick={() => {
                const value =
                  window.prompt(
                    `Enter ${label.toLowerCase()} name or character ID:`
                  );

                if (!value) return;

                updateDatabase(
                  (db) => {
                    const item =
                      db.characters.find(
                        (x) =>
                          x.id ===
                          character.id
                      );

                    item.relationships[
                      key
                    ].push(value);
                  }
                );
              }}
            >
              + Link
            </button>
          </div>
        )
      )}
    </div>
  );
}

/* =========================================================
   ORGANIZATIONS
========================================================= */

function OrganizationsPage({
  database,
  updateDatabase,
  selectedOrganization,
  setSelectedOrganization
}) {
  const organization =
    database.organizations.find(
      (item) =>
        item.id ===
        selectedOrganization
    );

  return (
    <section className="page split-layout">
      <div className="card side-list">
        <div className="section-title">
          <h3>Organizations</h3>

          <span className="counter">
            {database.organizations.length}
          </span>
        </div>

        {database.organizations.map(
          (item) => (
            <button
              key={item.id}
              className={
                selectedOrganization ===
                item.id
                  ? "list-button active"
                  : "list-button"
              }
              onClick={() =>
                setSelectedOrganization(
                  item.id
                )
              }
            >
              <b>
                {item.name ||
                  "Unnamed organization"}
              </b>

              <small>
                {item.type ||
                  "Organization"}
              </small>
            </button>
          )
        )}

        {!database.organizations
          .length && (
          <Empty text="Create an organization above." />
        )}
      </div>

      {organization ? (
        <OrganizationEditor
          organization={organization}
          database={database}
          updateDatabase={
            updateDatabase
          }
          close={() =>
            setSelectedOrganization(
              null
            )
          }
        />
      ) : (
        <div className="card empty-editor">
          <div className="large-symbol">
            ♜
          </div>

          <h2>
            Select an organization
          </h2>
        </div>
      )}
    </section>
  );
}

function OrganizationEditor({
  organization,
  database,
  updateDatabase,
  close
}) {
  const set = (key, value) =>
    updateDatabase((db) => {
      const item =
        db.organizations.find(
          (x) =>
            x.id === organization.id
        );

      if (item) {
        item[key] = value;
      }
    });

  const remove = () => {
    if (
      !window.confirm(
        "Delete this organization?"
      )
    ) {
      return;
    }

    updateDatabase((db) => {
      db.organizations =
        db.organizations.filter(
          (x) =>
            x.id !== organization.id
        );

      db.characters.forEach(
        (character) => {
          character.linkedOrganizations =
            character.linkedOrganizations.filter(
              (id) =>
                id !== organization.id
            );
        }
      );
    });

    close();
  };

  return (
    <div className="card editor">
      <div className="editor-header">
        <div className="editor-heading">
          <input
            className="big-input"
            placeholder="Organization name"
            value={organization.name}
            onChange={(event) =>
              set(
                "name",
                event.target.value
              )
            }
          />

          <input
            placeholder="Type / faction / ideology"
            value={organization.type}
            onChange={(event) =>
              set(
                "type",
                event.target.value
              )
            }
          />
        </div>

        <button
          className="icon-button"
          onClick={close}
        >
          ×
        </button>
      </div>

      <div className="form-grid">
        <Field label="Headquarters">
          <input
            value={
              organization.headquarters
            }
            onChange={(event) =>
              set(
                "headquarters",
                event.target.value
              )
            }
          />
        </Field>

        <Field label="Leader">
          <input
            value={organization.leader}
            onChange={(event) =>
              set(
                "leader",
                event.target.value
              )
            }
          />
        </Field>

        <Field label="Ideology">
          <textarea
            value={organization.ideology}
            onChange={(event) =>
              set(
                "ideology",
                event.target.value
              )
            }
          />
        </Field>

        <Field label="Description">
          <textarea
            value={
              organization.description
            }
            onChange={(event) =>
              set(
                "description",
                event.target.value
              )
            }
          />
        </Field>
      </div>

      <fieldset>
        <legend>
          Branches
        </legend>

        <EditableList
          values={
            organization.branches
          }
          addLabel="Add branch"
          onAdd={(value) =>
            updateDatabase((db) => {
              db.organizations.find(
                (x) =>
                  x.id ===
                  organization.id
              ).branches.push(
                value
              );
            })
          }
          onRemove={(index) =>
            updateDatabase((db) => {
              db.organizations.find(
                (x) =>
                  x.id ===
                  organization.id
              ).branches.splice(
                index,
                1
              );
            })
          }
        />
      </fieldset>

      <fieldset>
        <legend>
          Linked characters
        </legend>

        <LinkList
          values={
            organization.members
          }
          items={
            database.characters
          }
          placeholder="character"
          onAdd={(id) =>
            updateDatabase((db) => {
              const item =
                db.organizations.find(
                  (x) =>
                    x.id ===
                    organization.id
                );

              if (
                !item.members.includes(
                  id
                )
              ) {
                item.members.push(
                  id
                );
              }

              const character =
                db.characters.find(
                  (x) => x.id === id
                );

              if (
                character &&
                !character.linkedOrganizations.includes(
                  organization.id
                )
              ) {
                character.linkedOrganizations.push(
                  organization.id
                );
              }
            })
          }
          onRemove={(id) =>
            updateDatabase((db) => {
              const item =
                db.organizations.find(
                  (x) =>
                    x.id ===
                    organization.id
                );

              item.members =
                item.members.filter(
                  (x) => x !== id
                );

              const character =
                db.characters.find(
                  (x) => x.id === id
                );

              if (character) {
                character.linkedOrganizations =
                  character.linkedOrganizations.filter(
                    (x) =>
                      x !==
                      organization.id
                  );
              }
            })
          }
        />
      </fieldset>

      <Field label="Notes">
        <textarea
          value={organization.notes}
          onChange={(event) =>
            set(
              "notes",
              event.target.value
            )
          }
        />
      </Field>

      <div className="editor-footer">
        <button
          className="danger"
          onClick={remove}
        >
          Delete organization
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   POSTS
========================================================= */

function PostsPage({
  database,
  updateDatabase
}) {
  const create = () =>
    updateDatabase((db) => {
      db.posts.unshift(
        blankPost()
      );
    });

  return (
    <section className="page">
      <div className="toolbar">
        <div>
          <div className="eyebrow">
            ARCHIVE POSTS
          </div>

          <p className="muted">
            Scenes, events, records,
            announcements and character
            moments.
          </p>
        </div>

        <button
          className="primary"
          onClick={create}
        >
          + New post
        </button>
      </div>

      <div className="post-grid">
        {database.posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            database={database}
            updateDatabase={
              updateDatabase
            }
          />
        ))}
      </div>

      {!database.posts.length && (
        <div className="card empty-editor">
          <h2>No posts yet.</h2>

          <p>
            Create your first scene or
            record.
          </p>
        </div>
      )}
    </section>
  );
}

function PostCard({
  post,
  database,
  updateDatabase
}) {
  const set = (key, value) =>
    updateDatabase((db) => {
      const item =
        db.posts.find(
          (x) => x.id === post.id
        );

      item[key] = value;
    });

  const remove = () => {
    if (
      window.confirm(
        "Delete this post?"
      )
    ) {
      updateDatabase((db) => {
        db.posts =
          db.posts.filter(
            (x) =>
              x.id !== post.id
          );
      });
    }
  };

  return (
    <article className="card post-card">
      <input
        className="card-title-input"
        value={post.title}
        onChange={(event) =>
          set(
            "title",
            event.target.value
          )
        }
      />

      <small className="muted">
        {post.date}
      </small>

      <textarea
        placeholder="Write the post, scene or event..."
        value={post.content}
        onChange={(event) =>
          set(
            "content",
            event.target.value
          )
        }
      />

      <Field label="Linked characters">
        <input
          value={
            post.characters.join(", ")
          }
          onChange={(event) =>
            set(
              "characters",
              event.target.value
                .split(",")
                .map((x) =>
                  x.trim()
                )
                .filter(Boolean)
            )
          }
          placeholder="Character names or IDs"
        />
      </Field>

      <Field label="Linked organizations">
        <input
          value={
            post.organizations.join(
              ", "
            )
          }
          onChange={(event) =>
            set(
              "organizations",
              event.target.value
                .split(",")
                .map((x) =>
                  x.trim()
                )
                .filter(Boolean)
            )
          }
          placeholder="Organization names or IDs"
        />
      </Field>

      <button
        className="danger small"
        onClick={remove}
      >
        Delete
      </button>
    </article>
  );
}

/* =========================================================
   LORE
========================================================= */

function LorePage({
  database,
  updateDatabase
}) {
  const create = () =>
    updateDatabase((db) => {
      db.lore.unshift(
        blankLore()
      );
    });

  return (
    <section className="page">
      <div className="toolbar">
        <div>
          <div className="eyebrow">
            WORLD BUILDING
          </div>

          <p className="muted">
            Canon, history, secrets,
            locations, rules and timelines.
          </p>
        </div>

        <button
          className="primary"
          onClick={create}
        >
          + Lore entry
        </button>
      </div>

      <div className="lore-grid">
        {database.lore.map((entry) => (
          <LoreCard
            key={entry.id}
            entry={entry}
            database={database}
            updateDatabase={
              updateDatabase
            }
          />
        ))}
      </div>
    </section>
  );
}

function LoreCard({
  entry,
  database,
  updateDatabase
}) {
  const set = (key, value) =>
    updateDatabase((db) => {
      const item =
        db.lore.find(
          (x) => x.id === entry.id
        );

      item[key] = value;
    });

  return (
    <article className="card lore-card">
      <input
        className="card-title-input"
        value={entry.title}
        onChange={(event) =>
          set(
            "title",
            event.target.value
          )
        }
      />

      <input
        value={entry.category}
        placeholder="Category"
        onChange={(event) =>
          set(
            "category",
            event.target.value
          )
        }
      />

      <textarea
        value={entry.content}
        placeholder="Write your lore..."
        onChange={(event) =>
          set(
            "content",
            event.target.value
          )
        }
      />

      <Field label="Linked characters">
        <input
          value={
            entry.linkedCharacters.join(
              ", "
            )
          }
          onChange={(event) =>
            set(
              "linkedCharacters",
              event.target.value
                .split(",")
                .map((x) =>
                  x.trim()
                )
                .filter(Boolean)
            )
          }
        />
      </Field>

      <Field label="Linked organizations">
        <input
          value={
            entry.linkedOrganizations.join(
              ", "
            )
          }
          onChange={(event) =>
            set(
              "linkedOrganizations",
              event.target.value
                .split(",")
                .map((x) =>
                  x.trim()
                )
                .filter(Boolean)
            )
          }
        />
      </Field>

      <button
        className="danger small"
        onClick={() =>
          updateDatabase((db) => {
            db.lore =
              db.lore.filter(
                (x) =>
                  x.id !== entry.id
              );
          })
        }
      >
        Delete lore
      </button>
    </article>
  );
}

/* =========================================================
   INVESTIGATIONS
========================================================= */

function InvestigationsPage({
  database,
  updateDatabase
}) {
  const create = () =>
    updateDatabase((db) => {
      db.investigations.unshift(
        blankCase()
      );
    });

  return (
    <section className="page">
      <div className="toolbar">
        <div>
          <div className="eyebrow">
            DETECTIVE ARCHIVE
          </div>

          <p className="muted">
            What. Who. How. Why. Where.
            When. Evidence. Motive.
          </p>
        </div>

        <button
          className="primary"
          onClick={create}
        >
          + New case
        </button>
      </div>

      {database.investigations.map(
        (item) => (
          <InvestigationCard
            key={item.id}
            investigation={item}
            database={database}
            updateDatabase={
              updateDatabase
            }
          />
        )
      )}

      {!database.investigations
        .length && (
        <div className="card empty-editor">
          <div className="large-symbol">
            ⌕
          </div>

          <h2>
            No investigations yet.
          </h2>
        </div>
      )}
    </section>
  );
}

function InvestigationCard({
  investigation,
  database,
  updateDatabase
}) {
  const set = (key, value) =>
    updateDatabase((db) => {
      const item =
        db.investigations.find(
          (x) =>
            x.id ===
            investigation.id
        );

      item[key] = value;
    });

  const remove = () => {
    if (
      window.confirm(
        "Delete this investigation?"
      )
    ) {
      updateDatabase((db) => {
        db.investigations =
          db.investigations.filter(
            (x) =>
              x.id !==
              investigation.id
          );
      });
    }
  };

  return (
    <article className="card case-card">
      <div className="case-header">
        <input
          className="big-input"
          value={
            investigation.title
          }
          onChange={(event) =>
            set(
              "title",
              event.target.value
            )
          }
        />

        <select
          value={
            investigation.status
          }
          onChange={(event) =>
            set(
              "status",
              event.target.value
            )
          }
        >
          <option>Open</option>
          <option>In progress</option>
          <option>Solved</option>
          <option>Cold</option>
          <option>Redacted</option>
        </select>
      </div>

      <div className="case-grid">
        {[
          ["what", "WHAT happened?"],
          ["who", "WHO?"],
          ["how", "HOW?"],
          ["why", "WHY?"],
          ["where", "WHERE?"],
          ["when", "WHEN?"]
        ].map(
          ([key, label]) => (
            <Field
              label={label}
              key={key}
            >
              <textarea
                value={
                  investigation[key]
                }
                onChange={(event) =>
                  set(
                    key,
                    event.target.value
                  )
                }
              />
            </Field>
          )
        )}

        <Field label="WHO is involved?">
          <textarea
            value={investigation.involved.join(
              ", "
            )}
            onChange={(event) =>
              set(
                "involved",
                event.target.value
                  .split(",")
                  .map((x) =>
                    x.trim()
                  )
                  .filter(Boolean)
              )
            }
          />
        </Field>
      </div>

      <div className="two-columns">
        <Field label="Evidence">
          <textarea
            value={
              investigation.evidence
            }
            onChange={(event) =>
              set(
                "evidence",
                event.target.value
              )
            }
          />
        </Field>

        <Field label="Theory">
          <textarea
            value={
              investigation.theory
            }
            onChange={(event) =>
              set(
                "theory",
                event.target.value
              )
            }
          />
        </Field>

        <Field label="Motive">
          <textarea
            value={
              investigation.motive
            }
            onChange={(event) =>
              set(
                "motive",
                event.target.value
              )
            }
          />
        </Field>

        <Field label="Solution / reveal">
          <textarea
            value={
              investigation.solution
            }
            onChange={(event) =>
              set(
                "solution",
                event.target.value
              )
            }
          />
        </Field>
      </div>

      <Field label="Investigator notes">
        <textarea
          value={
            investigation.notes
          }
          onChange={(event) =>
            set(
              "notes",
              event.target.value
            )
          }
        />
      </Field>

      <div className="two-columns">
        <Field label="Linked characters">
          <input
            value={
              investigation.linkedCharacters.join(
                ", "
              )
            }
            onChange={(event) =>
              set(
                "linkedCharacters",
                event.target.value
                  .split(",")
                  .map((x) =>
                    x.trim()
                  )
                  .filter(Boolean)
              )
            }
          />
        </Field>

        <Field label="Linked organizations">
          <input
            value={
              investigation.linkedOrganizations.join(
                ", "
              )
            }
            onChange={(event) =>
              set(
                "linkedOrganizations",
                event.target.value
                  .split(",")
                  .map((x) =>
                    x.trim()
                  )
                  .filter(Boolean)
              )
            }
          />
        </Field>
      </div>

      <button
        className="danger small"
        onClick={remove}
      >
        Delete case
      </button>
    </article>
  );
}

/* =========================================================
   SETTINGS
========================================================= */

function SettingsPage({
  database,
  updateDatabase,
  setDatabase
}) {
  const exportDatabase = () => {
    const blob = new Blob(
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
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;

    anchor.download =
      "ocfiles-backup.json";

    anchor.click();

    URL.revokeObjectURL(url);
  };

  const importDatabase = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    const reader =
      new FileReader();

    reader.onload = () => {
      try {
        const imported =
          JSON.parse(
            reader.result
          );

        if (
          !imported.characters ||
          !imported.organizations
        ) {
          throw new Error();
        }

        setDatabase({
          ...initialDatabase,
          ...imported
        });

        alert(
          "OC Files backup imported successfully."
        );
      } catch {
        alert(
          "That file is not a valid OC Files backup."
        );
      }
    };

    reader.readAsText(file);

    event.target.value = "";
  };

  const erase = () => {
    if (
      !window.confirm(
        "This will erase the complete local archive. Continue?"
      )
    ) {
      return;
    }

    localStorage.removeItem(
      STORAGE_KEY
    );

    window.location.reload();
  };

  return (
    <section className="page">
      <div className="card settings-card">
        <div className="eyebrow">
          CUSTOMIZATION
        </div>

        <h2>
          Choose your universe aesthetic
        </h2>

        <p className="muted">
          Every theme changes the entire
          visual atmosphere.
        </p>

        <div className="theme-grid">
          {Object.entries(
            THEMES
          ).map(
            ([id, theme]) => (
              <button
                key={id}
                className={
                  database.theme ===
                  id
                    ? "theme-card active"
                    : "theme-card"
                }
                onClick={() =>
                  updateDatabase(
                    (db) => {
                      db.theme =
                        id;
                    }
                  )
                }
              >
                <strong>
                  {theme.icon}{" "}
                  {theme.name}
                </strong>

                <span>
                  Custom visual motif
                </span>
              </button>
            )
          )}
        </div>

        <hr />

        <div className="eyebrow">
          BACKUP
        </div>

        <h2>
          Protect your archive
        </h2>

        <p className="muted">
          Your data is automatically saved
          to this browser. Export a JSON
          backup regularly so you can restore
          your universe later.
        </p>

        <div className="backup-actions">
          <button
            className="primary"
            onClick={
              exportDatabase
            }
          >
            Export JSON
          </button>

          <label className="upload-button">
            Import JSON

            <input
              type="file"
              accept="application/json"
              onChange={
                importDatabase
              }
            />
          </label>

          <button
            className="danger"
            onClick={erase}
          >
            Erase local archive
          </button>
        </div>

        <hr />

        <h3>
          Current archive
        </h3>

        <div className="backup-stats">
          <span>
            Characters:{" "}
            <b>
              {database.characters.length}
            </b>
          </span>

          <span>
            Organizations:{" "}
            <b>
              {
                database.organizations
                  .length
              }
            </b>
          </span>

          <span>
            Posts:{" "}
            <b>
              {database.posts.length}
            </b>
          </span>

          <span>
            Lore:{" "}
            <b>
              {database.lore.length}
            </b>
          </span>

          <span>
            Cases:{" "}
            <b>
              {
                database.investigations
                  .length
              }
            </b>
          </span>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   GENERIC COMPONENTS
========================================================= */

function Field({
  label,
  children
}) {
  return (
    <label className="field">
      <span>{label}</span>

      {children}
    </label>
  );
}

function Avatar({
  character
}) {
  if (character.image) {
    return (
      <img
        className="avatar"
        src={character.image}
        alt=""
      />
    );
  }

  return (
    <div className="avatar placeholder">
      {(
        character.name ||
        "?"
      )
        .charAt(0)
        .toUpperCase()}
    </div>
  );
}

function Empty({
  text
}) {
  return (
    <div className="empty">
      {text}
    </div>
  );
}

function EditableList({
  values,
  onAdd,
  onRemove,
  addLabel
}) {
  return (
    <div>
      <div className="tag-list">
        {values.map(
          (value, index) => (
            <span
              className="tag"
              key={`${value}-${index}`}
            >
              {value}

              <button
                onClick={() =>
                  onRemove(index)
                }
              >
                ×
              </button>
            </span>
          )
        )}
      </div>

      <button
        className="secondary small"
        onClick={() => {
          const value =
            window.prompt(
              addLabel
            );

          if (
            value?.trim()
          ) {
            onAdd(value.trim());
          }
        }}
      >
        + {addLabel}
      </button>
    </div>
  );
}

function LinkList({
  values,
  items,
  onAdd,
  onRemove,
  placeholder
}) {
  return (
    <div>
      <div className="tag-list">
        {values.map((id) => {
          const item =
            items.find(
              (x) =>
                x.id === id
            );

          return (
            <span
              className="tag"
              key={id}
            >
              {item
                ? item.name ||
                  "Unnamed"
                : id}

              <button
                onClick={() =>
                  onRemove(id)
                }
              >
                ×
              </button>
            </span>
          );
        })}
      </div>

      <select
        className="link-select"
        value=""
        onChange={(event) => {
          if (
            event.target.value
          ) {
            onAdd(
              event.target.value
            );
          }
        }}
      >
        <option value="">
          + Link {placeholder}
        </option>

        {items
          .filter(
            (item) =>
              !values.includes(
                item.id
              )
          )
          .map((item) => (
            <option
              value={item.id}
              key={item.id}
            >
              {item.name ||
                "Unnamed"}
            </option>
          ))}
      </select>
    </div>
  );
}

export default App;
