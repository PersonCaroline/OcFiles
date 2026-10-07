import React, { useEffect, useMemo, useState } from "react";
import { applyTheme, themes } from "./themes";

const STORAGE_KEY = "oc_archive_v1";
const USER_KEY = "oc_archive_user_v1";

const personalityFields = [
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
  ["Reserved", "Flirty"]
];

const skillFields = [
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
  "Flexibility"
];

const socialFields = [
  "Charisma",
  "Empathy",
  "Generosity",
  "Wealth",
  "Aggression",
  "Libido"
];

const emptyCharacter = {
  id: "",
  name: "",
  lastName: "",
  nickname: "",
  age: "",
  dateOfBirth: "",
  gender: "",
  pronouns: "",
  sexuality: "",
  nationality: "",
  origins: "",
  species: "Human",
  status: "Alive",
  laterStatus: "Alive",
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
  lyrics: "",
  song: "",
  quotes: "",
  lore: "",
  image: "",
  moodboard: [],
  family: "",
  friends: "",
  pets: "",
  personality: {},
  skills: {},
  socials: {},
  organizationIds: [],
  branchIds: [],
  relatedCharacterIds: [],
  postIds: [],
  investigationIds: [],
  createdAt: ""
};

const emptyOrganization = {
  id: "",
  name: "",
  type: "",
  description: "",
  leader: "",
  headquarters: "",
  status: "Active",
  goals: "",
  methods: "",
  branches: [],
  characterIds: [],
  postIds: [],
  lore: ""
};

const emptyInvestigation = {
  id: "",
  title: "",
  status: "Open",
  caseNumber: "",
  what: "",
  who: "",
  when: "",
  where: "",
  how: "",
  why: "",
  culprit: "",
  victims: "",
  witnesses: "",
  evidence: "",
  suspects: "",
  investigators: "",
  involvedCharacterIds: [],
  organizationIds: [],
  notes: "",
  conclusion: ""
};

const emptyLore = {
  id: "",
  title: "",
  category: "",
  era: "",
  summary: "",
  content: "",
  relatedCharacterIds: [],
  organizationIds: [],
  investigationIds: ""
};

const emptyPost = {
  id: "",
  title: "",
  author: "",
  date: "",
  content: "",
  tags: "",
  characterIds: [],
  organizationIds: []
};

function uid(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function blankDatabase() {
  return {
    characters: [],
    organizations: [],
    investigations: [],
    lore: [],
    posts: [],
    settings: {
      theme: "goth"
    }
  };
}

function loadDatabase() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : blankDatabase();
  } catch {
    return blankDatabase();
  }
}

function saveDatabase(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function downloadFile(filename, content, type = "application/json") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function Card({ children, className = "", onClick }) {
  return (
    <div
      className={`card ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

function Button({
  children,
  onClick,
  danger = false,
  secondary = false,
  small = false,
  type = "button"
}) {
  return (
    <button
      type={type}
      className={`button ${danger ? "danger" : ""} ${
        secondary ? "secondary" : ""
      } ${small ? "small" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
  textarea = false
}) {
  return (
    <label className="field">
      <span>{label}</span>

      {textarea ? (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Section({ title, children }) {
  return (
    <section className="editor-section">
      <div className="section-title">
        <h3>{title}</h3>
      </div>
      {children}
    </section>
  );
}

function FiveLevel({ value = 3, onChange }) {
  return (
    <div className="levels">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button"
          key={n}
          className={n <= value ? "level active" : "level"}
          onClick={() => onChange(n)}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function PersonalitySlider({ left, right, value = 3, onChange }) {
  return (
    <div className="personality-row">
      <span>{left}</span>

      <div className="slider-wrap">
        <input
          type="range"
          min="1"
          max="5"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />

        <div className="slider-labels">
          <small>1</small>
          <small>2</small>
          <small>3</small>
          <small>4</small>
          <small>5</small>
        </div>
      </div>

      <span>{right}</span>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();

    const saved = localStorage.getItem(USER_KEY);

    if (mode === "register") {
      if (!username.trim() || !password) {
        setError("Please enter a username and password.");
        return;
      }

      localStorage.setItem(
        USER_KEY,
        JSON.stringify({
          username: username.trim(),
          password
        })
      );

      onLogin(username.trim());
      return;
    }

    if (!saved) {
      setError("No account exists yet. Please register first.");
      return;
    }

    const user = JSON.parse(saved);

    if (
      user.username !== username.trim() ||
      user.password !== password
    ) {
      setError("Incorrect username or password.");
      return;
    }

    onLogin(user.username);
  }

  return (
    <div className="login-page">
      <div className="login-symbol">✦</div>

      <Card className="login-card">
        <div className="brand large">
          <span>✦</span>
          <div>
            <strong>OC ARCHIVE</strong>
            <small>Personal Character Database</small>
          </div>
        </div>

        <h1>{mode === "login" ? "Welcome back" : "Create your archive"}</h1>

        <p className="muted">
          {mode === "login"
            ? "Enter your local archive account."
            : "Your account stays on this device."}
        </p>

        <form onSubmit={submit}>
          <Input
            label="Username"
            value={username}
            onChange={setUsername}
            placeholder="Your username"
          />

          <Input
            label="Password"
            value={password}
            onChange={setPassword}
            type="password"
            placeholder="Your password"
          />

          {error && <div className="error-box">{error}</div>}

          <Button type="submit">
            {mode === "login" ? "Log in" : "Register"}
          </Button>
        </form>

        <button
          className="text-button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
        >
          {mode === "login"
            ? "Create a new account"
            : "Already have an account? Log in"}
        </button>

        <p className="tiny-note">
          This is a local personal account system. It does not send your
          information to a server.
        </p>
      </Card>
    </div>
  );
}

function Sidebar({
  page,
  setPage,
  theme,
  setTheme,
  username,
  onLogout
}) {
  const items = [
    ["dashboard", "⌂", "Dashboard"],
    ["characters", "♙", "Characters"],
    ["organizations", "♜", "Organizations"],
    ["investigations", "⌕", "Investigations"],
    ["lore", "✧", "Lore"],
    ["posts", "✎", "Posts"]
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <span>✦</span>
        <div>
          <strong>OC ARCHIVE</strong>
          <small>Personal Database</small>
        </div>
      </div>

      <nav>
        {items.map(([id, icon, label]) => (
          <button
            key={id}
            className={page === id ? "nav-item active" : "nav-item"}
            onClick={() => setPage(id)}
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <label className="theme-select">
          <span>Theme</span>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            {Object.entries(themes).map(([id, value]) => (
              <option key={id} value={id}>
                {value.icon} {value.name}
              </option>
            ))}
          </select>
        </label>

        <div className="user-box">
          <span>◈</span>
          <div>
            <strong>{username}</strong>
            <small>Local account</small>
          </div>
        </div>

        <Button secondary small onClick={onLogout}>
          Log out
        </Button>
      </div>
    </aside>
  );
}

function Topbar({
  page,
  search,
  setSearch,
  onExport,
  onImport,
  fileInput
}) {
  const titles = {
    dashboard: "Dashboard",
    characters: "Characters",
    organizations: "Organizations",
    investigations: "Investigations",
    lore: "Lore",
    posts: "Posts"
  };

  return (
    <header className="topbar">
      <div>
        <div className="eyebrow">ARCHIVE / {page.toUpperCase()}</div>
        <h1>{titles[page]}</h1>
      </div>

      <div className="top-actions">
        <input
          className="global-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search archive..."
        />

        <Button small secondary onClick={onExport}>
          Export
        </Button>

        <Button
          small
          secondary
          onClick={() => fileInput.current?.click()}
        >
          Import
        </Button>
      </div>
    </header>
  );
}

function Dashboard({ db, setPage }) {
  const alive = db.characters.filter((c) => c.status === "Alive").length;

  return (
    <div className="page-content">
      <div className="hero-card">
        <div>
          <div className="eyebrow">WELCOME TO YOUR ARCHIVE</div>
          <h2>Build your universe.</h2>
          <p>
            Keep your characters, organizations, investigations and lore
            connected in one personal database.
          </p>
        </div>

        <div className="hero-symbol">✦</div>
      </div>

      <div className="stats-grid">
        <Stat title="Characters" value={db.characters.length} icon="♙" />
        <Stat title="Organizations" value={db.organizations.length} icon="♜" />
        <Stat title="Investigations" value={db.investigations.length} icon="⌕" />
        <Stat title="Lore entries" value={db.lore.length} icon="✧" />
        <Stat title="Posts" value={db.posts.length} icon="✎" />
        <Stat title="Alive characters" value={alive} icon="♥" />
      </div>

      <div className="two-columns">
        <Card>
          <h3>Quick actions</h3>
          <div className="quick-actions">
            <Button onClick={() => setPage("characters")}>
              + Character
            </Button>

            <Button
              secondary
              onClick={() => setPage("organizations")}
            >
              + Organization
            </Button>

            <Button
              secondary
              onClick={() => setPage("investigations")}
            >
              + Investigation
            </Button>

            <Button
              secondary
              onClick={() => setPage("lore")}
            >
              + Lore
            </Button>
          </div>
        </Card>

        <Card>
          <h3>Archive status</h3>
          <div className="status-list">
            <div>
              <span>Automatic saving</span>
              <strong className="green">ACTIVE</strong>
            </div>

            <div>
              <span>Local storage</span>
              <strong className="green">ACTIVE</strong>
            </div>

            <div>
              <span>JSON backup</span>
              <strong>AVAILABLE</strong>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Stat({ title, value, icon }) {
  return (
    <Card className="stat-card">
      <span className="stat-icon">{icon}</span>
      <div>
        <small>{title}</small>
        <strong>{value}</strong>
      </div>
    </Card>
  );
}

function CharacterList({
  characters,
  onNew,
  onEdit,
  onDelete
}) {
  return (
    <div className="page-content">
      <div className="page-actions">
        <div>
          <p className="muted">
            {characters.length} character
            {characters.length !== 1 ? "s" : ""}
          </p>
        </div>

        <Button onClick={onNew}>+ New character</Button>
      </div>

      {characters.length === 0 ? (
        <Empty
          title="No characters yet"
          text="Create your first character and start building your universe."
          button="+ Create character"
          onClick={onNew}
        />
      ) : (
        <div className="character-grid">
          {characters.map((character) => (
            <Card key={character.id} className="character-card">
              <div
                className="character-image"
                style={
                  character.image
                    ? { backgroundImage: `url(${character.image})` }
                    : {}
                }
              >
                {!character.image && (
                  <span>{character.name?.[0] || "?"}</span>
                )}

                <div className="status-badge">
                  {character.status}
                </div>
              </div>

              <div className="character-body">
                <div className="eyebrow">
                  {character.species || "Unknown"}
                </div>

                <h2>
                  {character.name || "Unnamed"}{" "}
                  {character.lastName}
                </h2>

                {character.nickname && (
                  <p className="nickname">
                    "{character.nickname}"
                  </p>
                )}

                <div className="character-meta">
                  <span>{character.age || "?"} years</span>
                  <span>{character.mbti || "MBTI ?"}</span>
                  <span>{character.gender || "Gender ?"}</span>
                </div>

                <div className="card-buttons">
                  <Button
                    small
                    onClick={() => onEdit(character)}
                  >
                    Open
                  </Button>

                  <Button
                    small
                    secondary
                    onClick={() => onDelete(character.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CharacterEditor({
  character,
  db,
  onSave,
  onCancel
}) {
  const [form, setForm] = useState({
    ...emptyCharacter,
    ...character,
    personality: {
      ...character.personality
    },
    skills: {
      ...character.skills
    },
    socials: {
      ...character.socials
    },
    moodboard: [...(character.moodboard || [])]
  });

  const update = (key, value) => {
    setForm((old) => ({
      ...old,
      [key]: value
    }));
  };

  const updateNested = (category, key, value) => {
    setForm((old) => ({
      ...old,
      [category]: {
        ...old[category],
        [key]: value
      }
    }));
  };

  function uploadImage(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      update("image", reader.result);
    };

    reader.readAsDataURL(file);
  }

  function uploadMoodboard(event) {
    const files = [...(event.target.files || [])];

    files.forEach((file) => {
      const reader = new FileReader();

      reader.onload = () => {
        setForm((old) => ({
          ...old,
          moodboard: [...old.moodboard, reader.result]
        }));
      };

      reader.readAsDataURL(file);
    });
  }

  function save() {
    onSave({
      ...form,
      id: form.id || uid("character"),
      createdAt: form.createdAt || new Date().toISOString()
    });
  }

  return (
    <div className="page-content editor-page">
      <div className="editor-top">
        <Button secondary onClick={onCancel}>
          ← Back
        </Button>

        <div>
          <div className="eyebrow">CHARACTER FILE</div>
          <h1>
            {form.name || "New character"}{" "}
            {form.lastName}
          </h1>
        </div>

        <Button onClick={save}>Save character</Button>
      </div>

      <Section title="Identity">
        <div className="form-grid">
          <Input
            label="Name"
            value={form.name}
            onChange={(v) => update("name", v)}
          />

          <Input
            label="Last name"
            value={form.lastName}
            onChange={(v) => update("lastName", v)}
          />

          <Input
            label="Nickname(s)"
            value={form.nickname}
            onChange={(v) => update("nickname", v)}
          />

          <Input
            label="Age"
            value={form.age}
            onChange={(v) => update("age", v)}
          />

          <Input
            label="Date of birth"
            type="date"
            value={form.dateOfBirth}
            onChange={(v) => update("dateOfBirth", v)}
          />

          <Input
            label="Gender"
            value={form.gender}
            onChange={(v) => update("gender", v)}
          />

          <Input
            label="Pronouns"
            value={form.pronouns}
            onChange={(v) => update("pronouns", v)}
          />

          <Input
            label="Sexuality"
            value={form.sexuality}
            onChange={(v) => update("sexuality", v)}
          />

          <Input
            label="Nationality"
            value={form.nationality}
            onChange={(v) => update("nationality", v)}
          />

          <Input
            label="Origins"
            value={form.origins}
            onChange={(v) => update("origins", v)}
          />

          <Input
            label="Species / race"
            value={form.species}
            onChange={(v) => update("species", v)}
          />

          <Input
            label="MBTI"
            value={form.mbti}
            onChange={(v) => update("mbti", v)}
          />
        </div>
      </Section>

      <Section title="Status & affiliations">
        <div className="form-grid">
          <Select
            label="Current status"
            value={form.status}
            onChange={(v) => update("status", v)}
            options={["Alive", "Dead", "Unknown", "Missing"]}
          />

          <Select
            label="Later status"
            value={form.laterStatus}
            onChange={(v) => update("laterStatus", v)}
            options={["Alive", "Dead", "Unknown", "Missing"]}
          />

          <Input
            label="Affiliation"
            value={form.affiliation}
            onChange={(v) => update("affiliation", v)}
          />

          <Input
            label="Past affiliation"
            value={form.pastAffiliation}
            onChange={(v) => update("pastAffiliation", v)}
          />

          <Input
            label="Rank"
            value={form.rank}
            onChange={(v) => update("rank", v)}
          />

          <Input
            label="Past rank"
            value={form.pastRank}
            onChange={(v) => update("pastRank", v)}
          />

          <Input
            label="Job"
            value={form.job}
            onChange={(v) => update("job", v)}
          />

          <Input
            label="Side job"
            value={form.sideJob}
            onChange={(v) => update("sideJob", v)}
          />
        </div>
      </Section>

      <Section title="Appearance">
        <div className="form-grid">
          <Input
            label="Height"
            value={form.height}
            onChange={(v) => update("height", v)}
          />

          <Input
            label="Weight"
            value={form.weight}
            onChange={(v) => update("weight", v)}
          />

          <Input
            label="Eye color"
            value={form.eyeColor}
            onChange={(v) => update("eyeColor", v)}
          />

          <Input
            label="Hair color"
            value={form.hairColor}
            onChange={(v) => update("hairColor", v)}
          />

          <Input
            label="Hair style"
            value={form.hairStyle}
            onChange={(v) => update("hairStyle", v)}
          />
        </div>

        <div className="upload-box">
          <strong>Character picture</strong>

          <input
            type="file"
            accept="image/*"
            onChange={uploadImage}
          />

          {form.image && (
            <div
              className="uploaded-preview"
              style={{
                backgroundImage: `url(${form.image})`
              }}
            />
          )}
        </div>
      </Section>

      <Section title="Abilities & combat">
        <div className="form-grid">
          <Input
            label="Abilities"
            textarea
            value={form.abilities}
            onChange={(v) => update("abilities", v)}
            placeholder="List abilities, powers, talents..."
          />

          <Input
            label="Effects of abilities"
            textarea
            value={form.abilityEffects}
            onChange={(v) => update("abilityEffects", v)}
            placeholder="Physical effects, consequences, limitations..."
          />

          <Input
            label="Weapon"
            value={form.weapon}
            onChange={(v) => update("weapon", v)}
          />
        </div>
      </Section>

      <Section title="Personality">
        <div className="personality-list">
          {personalityFields.map(([left, right]) => (
            <PersonalitySlider
              key={`${left}-${right}`}
              left={left}
              right={right}
              value={form.personality[`${left}-${right}`] || 3}
              onChange={(value) =>
                updateNested(
                  "personality",
                  `${left}-${right}`,
                  value
                )
              }
            />
          ))}
        </div>
      </Section>

      <Section title="Skills — 5 levels">
        <div className="stat-editor-grid">
          {skillFields.map((skill) => (
            <div className="stat-row" key={skill}>
              <span>{skill}</span>

              <FiveLevel
                value={form.skills[skill] || 0}
                onChange={(value) =>
                  updateNested("skills", skill, value)
                }
              />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Social attributes — 5 levels">
        <div className="stat-editor-grid">
          {socialFields.map((skill) => (
            <div className="stat-row" key={skill}>
              <span>{skill}</span>

              <FiveLevel
                value={form.socials[skill] || 0}
                onChange={(value) =>
                  updateNested("socials", skill, value)
                }
              />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Psychology & personal details">
        <div className="form-grid">
          <Input
            label="Fears"
            textarea
            value={form.fears}
            onChange={(v) => update("fears", v)}
          />

          <Input
            label="Sickness / medical information"
            textarea
            value={form.sickness}
            onChange={(v) => update("sickness", v)}
          />

          <Input
            label="Addictions"
            textarea
            value={form.addictions}
            onChange={(v) => update("addictions", v)}
          />

          <Input
            label="Likes"
            textarea
            value={form.likes}
            onChange={(v) => update("likes", v)}
          />

          <Input
            label="Dislikes"
            textarea
            value={form.dislikes}
            onChange={(v) => update("dislikes", v)}
          />
        </div>
      </Section>

      <Section title="Relationships">
        <div className="form-grid">
          <Input
            label="Family"
            textarea
            value={form.family}
            onChange={(v) => update("family", v)}
            placeholder="Parents, siblings, children..."
          />

          <Input
            label="Friends"
            textarea
            value={form.friends}
            onChange={(v) => update("friends", v)}
          />

          <Input
            label="Pets"
            textarea
            value={form.pets}
            onChange={(v) => update("pets", v)}
          />
        </div>

        <RelationshipPicker
          title="Linked characters"
          selected={form.relatedCharacterIds}
          items={db.characters.filter((c) => c.id !== form.id)}
          onChange={(value) =>
            update("relatedCharacterIds", value)
          }
        />

        <RelationshipPicker
          title="Linked organizations"
          selected={form.organizationIds}
          items={db.organizations}
          onChange={(value) =>
            update("organizationIds", value)
          }
        />
      </Section>

      <Section title="Writing & atmosphere">
        <div className="form-grid">
          <Input
            label="Anecdotes"
            textarea
            value={form.anecdotes}
            onChange={(v) => update("anecdotes", v)}
            placeholder="Funny, strange, memorable or important stories..."
          />

          <Input
            label="Lore"
            textarea
            value={form.lore}
            onChange={(v) => update("lore", v)}
          />

          <Input
            label="Song"
            value={form.song}
            onChange={(v) => update("song", v)}
          />

          <Input
            label="Lyrics"
            textarea
            value={form.lyrics}
            onChange={(v) => update("lyrics", v)}
          />

          <Input
            label="Quotes"
            textarea
            value={form.quotes}
            onChange={(v) => update("quotes", v)}
          />
        </div>
      </Section>

      <Section title="Moodboard">
        <div className="upload-box">
          <strong>Upload moodboard images</strong>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={uploadMoodboard}
          />

          <div className="moodboard">
            {form.moodboard.map((image, index) => (
              <div
                className="mood-image"
                key={`${image}-${index}`}
                style={{
                  backgroundImage: `url(${image})`
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    update(
                      "moodboard",
                      form.moodboard.filter(
                        (_, i) => i !== index
                      )
                    )
                  }
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <div className="save-bottom">
        <Button secondary onClick={onCancel}>
          Cancel
        </Button>

        <Button onClick={save}>
          Save character
        </Button>
      </div>
    </div>
  );
}

function RelationshipPicker({
  title,
  selected,
  items,
  onChange
}) {
  function toggle(id) {
    if (selected.includes(id)) {
      onChange(selected.filter((item) => item !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <div className="relationship-picker">
      <h4>{title}</h4>

      {items.length === 0 ? (
        <p className="muted">Nothing available yet.</p>
      ) : (
        <div className="picker-list">
          {items.map((item) => (
            <button
              type="button"
              key={item.id}
              className={
                selected.includes(item.id)
                  ? "picker-item selected"
                  : "picker-item"
              }
              onClick={() => toggle(item.id)}
            >
              <span>
                {item.name || item.title}
                {item.lastName
                  ? ` ${item.lastName}`
                  : ""}
              </span>

              {selected.includes(item.id) && <b>✓</b>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function OrganizationList({
  organizations,
  onNew,
  onEdit,
  onDelete
}) {
  return (
    <div className="page-content">
      <div className="page-actions">
        <p className="muted">
          {organizations.length} organization
          {organizations.length !== 1 ? "s" : ""}
        </p>

        <Button onClick={onNew}>+ New organization</Button>
      </div>

      {organizations.length === 0 ? (
        <Empty
          title="No organizations"
          text="Create organizations and connect characters to them."
          button="+ Create organization"
          onClick={onNew}
        />
      ) : (
        <div className="organization-grid">
          {organizations.map((organization) => (
            <Card key={organization.id}>
              <div className="org-symbol">♜</div>

              <div className="eyebrow">
                {organization.type || "Organization"}
              </div>

              <h2>{organization.name || "Unnamed organization"}</h2>

              <p>{organization.description || "No description."}</p>

              <div className="character-meta">
                <span>{organization.status}</span>
                <span>{organization.characterIds.length} linked characters</span>
              </div>

              <div className="card-buttons">
                <Button
                  small
                  onClick={() => onEdit(organization)}
                >
                  Open
                </Button>

                <Button
                  small
                  secondary
                  onClick={() => onDelete(organization.id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function OrganizationEditor({
  organization,
  db,
  onSave,
  onCancel
}) {
  const [form, setForm] = useState({
    ...emptyOrganization,
    ...organization
  });

  function update(key, value) {
    setForm((old) => ({
      ...old,
      [key]: value
    }));
  }

  function save() {
    onSave({
      ...form,
      id: form.id || uid("organization")
    });
  }

  return (
    <div className="page-content editor-page">
      <div className="editor-top">
        <Button secondary onClick={onCancel}>
          ← Back
        </Button>

        <div>
          <div className="eyebrow">ORGANIZATION FILE</div>
          <h1>{form.name || "New organization"}</h1>
        </div>

        <Button onClick={save}>Save organization</Button>
      </div>

      <Section title="Organization information">
        <div className="form-grid">
          <Input
            label="Name"
            value={form.name}
            onChange={(v) => update("name", v)}
          />

          <Input
            label="Type"
            value={form.type}
            onChange={(v) => update("type", v)}
            placeholder="Government, gang, company..."
          />

          <Select
            label="Status"
            value={form.status}
            onChange={(v) => update("status", v)}
            options={["Active", "Inactive", "Destroyed", "Unknown"]}
          />

          <Input
            label="Leader"
            value={form.leader}
            onChange={(v) => update("leader", v)}
          />

          <Input
            label="Headquarters"
            value={form.headquarters}
            onChange={(v) => update("headquarters", v)}
          />

          <Input
            label="Description"
            textarea
            value={form.description}
            onChange={(v) => update("description", v)}
          />

          <Input
            label="Goals"
            textarea
            value={form.goals}
            onChange={(v) => update("goals", v)}
          />

          <Input
            label="Methods"
            textarea
            value={form.methods}
            onChange={(v) => update("methods", v)}
          />

          <Input
            label="Lore"
            textarea
            value={form.lore}
            onChange={(v) => update("lore", v)}
          />
        </div>
      </Section>

      <Section title="Branches">
        <div className="branch-editor">
          {(form.branches || []).map((branch, index) => (
            <div className="branch-row" key={index}>
              <Input
                label={`Branch ${index + 1}`}
                value={branch}
                onChange={(value) => {
                  const branches = [...form.branches];
                  branches[index] = value;
                  update("branches", branches);
                }}
              />

              <Button
                danger
                small
                onClick={() =>
                  update(
                    "branches",
                    form.branches.filter(
                      (_, i) => i !== index
                    )
                  )
                }
              >
                Delete
              </Button>
            </div>
          ))}

          <Button
            secondary
            onClick={() =>
              update("branches", [...form.branches, ""])
            }
          >
            + Add branch
          </Button>
        </div>
      </Section>

      <Section title="Linked characters">
        <RelationshipPicker
          title="Characters belonging to this organization"
          selected={form.characterIds}
          items={db.characters}
          onChange={(value) =>
            update("characterIds", value)
          }
        />
      </Section>

      <div className="save-bottom">
        <Button secondary onClick={onCancel}>
          Cancel
        </Button>

        <Button onClick={save}>
          Save organization
        </Button>
      </div>
    </div>
  );
}

function InvestigationList({
  investigations,
  onNew,
  onEdit,
  onDelete
}) {
  return (
    <div className="page-content">
      <div className="page-actions">
        <p className="muted">
          Detective case database
        </p>

        <Button onClick={onNew}>
          + New investigation
        </Button>
      </div>

      {investigations.length === 0 ? (
        <Empty
          title="No investigations"
          text="Create a detective case and document everything surrounding it."
          button="+ New case"
          onClick={onNew}
        />
      ) : (
        <div className="investigation-grid">
          {investigations.map((item) => (
            <Card key={item.id}>
              <div className="case-header">
                <span className="case-number">
                  {item.caseNumber || "CASE"}
                </span>

                <span className="status-badge">
                  {item.status}
                </span>
              </div>

              <h2>{item.title || "Untitled case"}</h2>

              <p>{item.what || "No case summary."}</p>

              <div className="case-fields">
                <span>
                  <b>Who:</b> {item.who || "—"}
                </span>

                <span>
                  <b>Where:</b> {item.where || "—"}
                </span>

                <span>
                  <b>Why:</b> {item.why || "—"}
                </span>
              </div>

              <div className="card-buttons">
                <Button
                  small
                  onClick={() => onEdit(item)}
                >
                  Open case
                </Button>

                <Button
                  small
                  secondary
                  onClick={() => onDelete(item.id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function InvestigationEditor({
  investigation,
  db,
  onSave,
  onCancel
}) {
  const [form, setForm] = useState({
    ...emptyInvestigation,
    ...investigation
  });

  function update(key, value) {
    setForm((old) => ({
      ...old,
      [key]: value
    }));
  }

  function save() {
    onSave({
      ...form,
      id: form.id || uid("case")
    });
  }

  return (
    <div className="page-content editor-page">
      <div className="editor-top">
        <Button secondary onClick={onCancel}>
          ← Back
        </Button>

        <div>
          <div className="eyebrow">INVESTIGATION FILE</div>
          <h1>{form.title || "New investigation"}</h1>
        </div>

        <Button onClick={save}>Save case</Button>
      </div>

      <Section title="Case identification">
        <div className="form-grid">
          <Input
            label="Case title"
            value={form.title}
            onChange={(v) => update("title", v)}
          />

          <Input
            label="Case number"
            value={form.caseNumber}
            onChange={(v) => update("caseNumber", v)}
          />

          <Select
            label="Status"
            value={form.status}
            onChange={(v) => update("status", v)}
            options={[
              "Open",
              "Solved",
              "Cold",
              "Unsolved",
              "Classified"
            ]}
          />
        </div>
      </Section>

      <Section title="What / Who / When / Where / How / Why">
        <div className="form-grid">
          <Input
            label="What happened?"
            textarea
            value={form.what}
            onChange={(v) => update("what", v)}
          />

          <Input
            label="Who?"
            textarea
            value={form.who}
            onChange={(v) => update("who", v)}
          />

          <Input
            label="When?"
            value={form.when}
            onChange={(v) => update("when", v)}
          />

          <Input
            label="Where?"
            textarea
            value={form.where}
            onChange={(v) => update("where", v)}
          />

          <Input
            label="How?"
            textarea
            value={form.how}
            onChange={(v) => update("how", v)}
          />

          <Input
            label="Why?"
            textarea
            value={form.why}
            onChange={(v) => update("why", v)}
          />
        </div>
      </Section>

      <Section title="People involved">
        <div className="form-grid">
          <Input
            label="Culprit"
            value={form.culprit}
            onChange={(v) => update("culprit", v)}
          />

          <Input
            label="Victims"
            textarea
            value={form.victims}
            onChange={(v) => update("victims", v)}
          />

          <Input
            label="Witnesses"
            textarea
            value={form.witnesses}
            onChange={(v) => update("witnesses", v)}
          />

          <Input
            label="Suspects"
            textarea
            value={form.suspects}
            onChange={(v) => update("suspects", v)}
          />

          <Input
            label="Investigators"
            textarea
            value={form.investigators}
            onChange={(v) => update("investigators", v)}
          />
        </div>

        <RelationshipPicker
          title="Characters involved"
          selected={form.involvedCharacterIds}
          items={db.characters}
          onChange={(value) =>
            update("involvedCharacterIds", value)
          }
        />

        <RelationshipPicker
          title="Organizations involved"
          selected={form.organizationIds}
          items={db.organizations}
          onChange={(value) =>
            update("organizationIds", value)
          }
        />
      </Section>

      <Section title="Evidence & conclusion">
        <div className="form-grid">
          <Input
            label="Evidence"
            textarea
            value={form.evidence}
            onChange={(v) => update("evidence", v)}
          />

          <Input
            label="Notes"
            textarea
            value={form.notes}
            onChange={(v) => update("notes", v)}
          />

          <Input
            label="Conclusion"
            textarea
            value={form.conclusion}
            onChange={(v) => update("conclusion", v)}
          />
        </div>
      </Section>

      <div className="save-bottom">
        <Button secondary onClick={onCancel}>
          Cancel
        </Button>

        <Button onClick={save}>
          Save investigation
        </Button>
      </div>
    </div>
  );
}

function LoreList({ lore, onNew, onEdit, onDelete }) {
  return (
    <div className="page-content">
      <div className="page-actions">
        <p className="muted">Worldbuilding and historical records</p>

        <Button onClick={onNew}>+ New lore entry</Button>
      </div>

      {lore.length === 0 ? (
        <Empty
          title="No lore yet"
          text="Create the history behind your world."
          button="+ Add lore"
          onClick={onNew}
        />
      ) : (
        <div className="lore-grid">
          {lore.map((entry) => (
            <Card key={entry.id}>
              <div className="eyebrow">
                {entry.category || "Lore"}
              </div>

              <h2>{entry.title || "Untitled"}</h2>

              <p>{entry.summary || entry.content || "No content."}</p>

              <div className="character-meta">
                {entry.era && <span>{entry.era}</span>}
              </div>

              <div className="card-buttons">
                <Button
                  small
                  onClick={() => onEdit(entry)}
                >
                  Open
                </Button>

                <Button
                  small
                  secondary
                  onClick={() => onDelete(entry.id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function LoreEditor({ lore, db, onSave, onCancel }) {
  const [form, setForm] = useState({
    ...emptyLore,
    ...lore
  });

  function update(key, value) {
    setForm((old) => ({
      ...old,
      [key]: value
    }));
  }

  function save() {
    onSave({
      ...form,
      id: form.id || uid("lore")
    });
  }

  return (
    <div className="page-content editor-page">
      <div className="editor-top">
        <Button secondary onClick={onCancel}>
          ← Back
        </Button>

        <div>
          <div className="eyebrow">LORE FILE</div>
          <h1>{form.title || "New lore"}</h1>
        </div>

        <Button onClick={save}>Save lore</Button>
      </div>

      <Section title="Lore information">
        <div className="form-grid">
          <Input
            label="Title"
            value={form.title}
            onChange={(v) => update("title", v)}
          />

          <Input
            label="Category"
            value={form.category}
            onChange={(v) => update("category", v)}
            placeholder="History, mythology, event..."
          />

          <Input
            label="Era / date"
            value={form.era}
            onChange={(v) => update("era", v)}
          />

          <Input
            label="Summary"
            textarea
            value={form.summary}
            onChange={(v) => update("summary", v)}
          />

          <Input
            label="Full lore"
            textarea
            value={form.content}
            onChange={(v) => update("content", v)}
          />
        </div>
      </Section>

      <Section title="Connected characters">
        <RelationshipPicker
          title="Characters"
          selected={form.relatedCharacterIds}
          items={db.characters}
          onChange={(value) =>
            update("relatedCharacterIds", value)
          }
        />
      </Section>

      <Section title="Connected organizations">
        <RelationshipPicker
          title="Organizations"
          selected={form.organizationIds}
          items={db.organizations}
          onChange={(value) =>
            update("organizationIds", value)
          }
        />
      </Section>

      <div className="save-bottom">
        <Button secondary onClick={onCancel}>
          Cancel
        </Button>

        <Button onClick={save}>Save lore</Button>
      </div>
    </div>
  );
}

function PostList({ posts, onNew, onEdit, onDelete }) {
  return (
    <div className="page-content">
      <div className="page-actions">
        <p className="muted">Archive notes and posts</p>

        <Button onClick={onNew}>+ New post</Button>
      </div>

      {posts.length === 0 ? (
        <Empty
          title="No posts"
          text="Create notes, announcements, theories or story fragments."
          button="+ New post"
          onClick={onNew}
        />
      ) : (
        <div className="post-grid">
          {posts.map((post) => (
            <Card key={post.id}>
              <div className="eyebrow">
                {post.date || "No date"}
              </div>

              <h2>{post.title || "Untitled post"}</h2>

              <p className="muted">
                {post.author || "Unknown author"}
              </p>

              <p className="post-preview">
                {post.content || "No content."}
              </p>

              <div className="card-buttons">
                <Button
                  small
                  onClick={() => onEdit(post)}
                >
                  Open
                </Button>

                <Button
                  small
                  secondary
                  onClick={() => onDelete(post.id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function PostEditor({ post, db, onSave, onCancel }) {
  const [form, setForm] = useState({
    ...emptyPost,
    ...post
  });

  function update(key, value) {
    setForm((old) => ({
      ...old,
      [key]: value
    }));
  }

  function save() {
    onSave({
      ...form,
      id: form.id || uid("post")
    });
  }

  return (
    <div className="page-content editor-page">
      <div className="editor-top">
        <Button secondary onClick={onCancel}>
          ← Back
        </Button>

        <div>
          <div className="eyebrow">POST</div>
          <h1>{form.title || "New post"}</h1>
        </div>

        <Button onClick={save}>Save post</Button>
      </div>

      <Section title="Post">
        <div className="form-grid">
          <Input
            label="Title"
            value={form.title}
            onChange={(v) => update("title", v)}
          />

          <Input
            label="Author"
            value={form.author}
            onChange={(v) => update("author", v)}
          />

          <Input
            label="Date"
            value={form.date}
            onChange={(v) => update("date", v)}
          />

          <Input
            label="Tags"
            value={form.tags}
            onChange={(v) => update("tags", v)}
          />

          <Input
            label="Content"
            textarea
            value={form.content}
            onChange={(v) => update("content", v)}
          />
        </div>
      </Section>

      <Section title="Connected characters">
        <RelationshipPicker
          title="Characters"
          selected={form.characterIds}
          items={db.characters}
          onChange={(value) =>
            update("characterIds", value)
          }
        />
      </Section>

      <Section title="Connected organizations">
        <RelationshipPicker
          title="Organizations"
          selected={form.organizationIds}
          items={db.organizations}
          onChange={(value) =>
            update("organizationIds", value)
          }
        />
      </Section>

      <div className="save-bottom">
        <Button secondary onClick={onCancel}>
          Cancel
        </Button>

        <Button onClick={save}>Save post</Button>
      </div>
    </div>
  );
}

function Empty({ title, text, button, onClick }) {
  return (
    <Card className="empty-state">
      <div className="empty-symbol">✦</div>
      <h2>{title}</h2>
      <p>{text}</p>
      <Button onClick={onClick}>{button}</Button>
    </Card>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [db, setDb] = useState(loadDatabase);
  const [page, setPage] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  const fileInput = React.useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem(USER_KEY);

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser).username);
      } catch {}
    }
  }, []);

  useEffect(() => {
    saveDatabase(db);
    applyTheme(db.settings.theme);
  }, [db]);

  function changeTheme(theme) {
    setDb((old) => ({
      ...old,
      settings: {
        ...old.settings,
        theme
      }
    }));
  }

  function logout() {
    setUser(null);
    setPage("dashboard");
    setEditing(null);
  }

  function exportDatabase() {
    downloadFile(
      `oc-archive-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(db, null, 2)
    );
  }

  function importDatabase(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);

        if (!imported.characters) {
          throw new Error("Invalid archive");
        }

        setDb({
          ...blankDatabase(),
          ...imported
        });

        alert("Archive imported successfully.");
      } catch {
        alert("This file is not a valid OC Archive backup.");
      }
    };

    reader.readAsText(file);
    event.target.value = "";
  }

  function confirmDelete(type, id) {
    if (!window.confirm("Delete this entry permanently?")) {
      return;
    }

    setDb((old) => ({
      ...old,
      [type]: old[type].filter((item) => item.id !== id)
    }));
  }

  function saveItem(type, item) {
    setDb((old) => {
      const exists = old[type].some(
        (entry) => entry.id === item.id
      );

      return {
        ...old,
        [type]: exists
          ? old[type].map((entry) =>
              entry.id === item.id ? item : entry
            )
          : [...old[type], item]
      };
    });

    setEditing(null);
  }

  const filteredCharacters = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return db.characters;

    return db.characters.filter((character) =>
      JSON.stringify(character)
        .toLowerCase()
        .includes(q)
    );
  }, [db.characters, search]);

  const filteredOrganizations = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return db.organizations;

    return db.organizations.filter((organization) =>
      JSON.stringify(organization)
        .toLowerCase()
        .includes(q)
    );
  }, [db.organizations, search]);

  const filteredInvestigations = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return db.investigations;

    return db.investigations.filter((item) =>
      JSON.stringify(item)
        .toLowerCase()
        .includes(q)
    );
  }, [db.investigations, search]);

  const filteredLore = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return db.lore;

    return db.lore.filter((item) =>
      JSON.stringify(item)
        .toLowerCase()
        .includes(q)
    );
  }, [db.lore, search]);

  const filteredPosts = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return db.posts;

    return db.posts.filter((item) =>
      JSON.stringify(item)
        .toLowerCase()
        .includes(q)
    );
  }, [db.posts, search]);

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  function renderPage() {
    if (editing?.type === "character") {
      return (
        <CharacterEditor
          character={editing.item}
          db={db}
          onSave={(item) =>
            saveItem("characters", item)
          }
          onCancel={() => setEditing(null)}
        />
      );
    }

    if (editing?.type === "organization") {
      return (
        <OrganizationEditor
          organization={editing.item}
          db={db}
          onSave={(item) =>
            saveItem("organizations", item)
          }
          onCancel={() => setEditing(null)}
        />
      );
    }

    if (editing?.type === "investigation") {
      return (
        <InvestigationEditor
          investigation={editing.item}
          db={db}
          onSave={(item) =>
            saveItem("investigations", item)
          }
          onCancel={() => setEditing(null)}
        />
      );
    }

    if (editing?.type === "lore") {
      return (
        <LoreEditor
          lore={editing.item}
          db={db}
          onSave={(item) => saveItem("lore", item)}
          onCancel={() => setEditing(null)}
        />
      );
    }

    if (editing?.type === "post") {
      return (
        <PostEditor
          post={editing.item}
          db={db}
          onSave={(item) => saveItem("posts", item)}
          onCancel={() => setEditing(null)}
        />
      );
    }

    switch (page) {
      case "characters":
        return (
          <CharacterList
            characters={filteredCharacters}
            onNew={() =>
              setEditing({
                type: "character",
                item: {
                  ...emptyCharacter,
                  id: ""
                }
              })
            }
            onEdit={(item) =>
              setEditing({
                type: "character",
                item
              })
            }
            onDelete={(id) =>
              confirmDelete("characters", id)
            }
          />
        );

      case "organizations":
        return (
          <OrganizationList
            organizations={filteredOrganizations}
            onNew={() =>
              setEditing({
                type: "organization",
                item: {
                  ...emptyOrganization,
                  id: "",
                  characterIds: [],
                  branches: []
                }
              })
            }
            onEdit={(item) =>
              setEditing({
                type: "organization",
                item
              })
            }
            onDelete={(id) =>
              confirmDelete("organizations", id)
            }
          />
        );

      case "investigations":
        return (
          <InvestigationList
            investigations={filteredInvestigations}
            onNew={() =>
              setEditing({
                type: "investigation",
                item: {
                  ...emptyInvestigation,
                  id: "",
                  involvedCharacterIds: [],
                  organizationIds: []
                }
              })
            }
            onEdit={(item) =>
              setEditing({
                type: "investigation",
                item
              })
            }
            onDelete={(id) =>
              confirmDelete("investigations", id)
            }
          />
        );

      case "lore":
        return (
          <LoreList
            lore={filteredLore}
            onNew={() =>
              setEditing({
                type: "lore",
                item: {
                  ...emptyLore,
                  id: "",
                  relatedCharacterIds: [],
                  organizationIds: []
                }
              })
            }
            onEdit={(item) =>
              setEditing({
                type: "lore",
                item
              })
            }
            onDelete={(id) =>
              confirmDelete("lore", id)
            }
          />
        );

      case "posts":
        return (
          <PostList
            posts={filteredPosts}
            onNew={() =>
              setEditing({
                type: "post",
                item: {
                  ...emptyPost,
                  id: "",
                  characterIds: [],
                  organizationIds: []
                }
              })
            }
            onEdit={(item) =>
              setEditing({
                type: "post",
                item
              })
            }
            onDelete={(id) =>
              confirmDelete("posts", id)
            }
          />
        );

      default:
        return (
          <Dashboard
            db={db}
            setPage={setPage}
          />
        );
    }
  }

  return (
    <div className="app">
      <input
        ref={fileInput}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={importDatabase}
      />

      <button
        className="mobile-menu-button"
        onClick={() => setMobileMenu(!mobileMenu)}
      >
        ☰
      </button>

      <div
        className={
          mobileMenu
            ? "mobile-overlay visible"
            : "mobile-overlay"
        }
        onClick={() => setMobileMenu(false)}
      />

      <div
        className={
          mobileMenu
            ? "sidebar-container open"
            : "sidebar-container"
        }
        onClick={() => setMobileMenu(false)}
      >
        <Sidebar
          page={page}
          setPage={(value) => {
            setPage(value);
            setEditing(null);
          }}
          theme={db.settings.theme}
          setTheme={changeTheme}
          username={user}
          onLogout={logout}
        />
      </div>

      <main className="main">
        {!editing && (
          <Topbar
            page={page}
            search={search}
            setSearch={setSearch}
            onExport={exportDatabase}
            onImport={importDatabase}
            fileInput={fileInput}
          />
        )}

        {renderPage()}
      </main>
    </div>
  );
}
