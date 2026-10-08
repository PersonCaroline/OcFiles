import React, { useEffect, useMemo, useState } from "react";
import { THEMES } from "./themes";
import "./style.css";

/* =========================================================
   OCFILES
   Personal OC / Lore / Investigation Database
   ========================================================= */

const STORAGE_KEY = "ocfiles_database_v1";
const USER_KEY = "ocfiles_user_v1";
const THEME_KEY = "ocfiles_theme_v1";

const uid = (prefix = "id") =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const emptyCharacter = () => ({
  id: uid("character"),

  firstName: "",
  lastName: "",
  nickname: "",
  age: "",
  dateOfBirth: "",
  gender: "",
  pronouns: "",
  sexuality: "",
  nationality: "",
  origins: "",
  species: "",
  status: "Alive",
  laterStatus: "",

  mbti: "",
  job: "",
  sideJob: "",
  affiliation: "",
  pastAffiliation: "",
  rank: "",
  pastRank: "",

  height: "",
  weight: "",
  eyeColor: "",
  hairColor: "",
  hairStyle: "",

  portrait: "",

  abilities: [],
  weapons: [],

  abilityEffects: "",
  abilityWeaknesses: "",
  fears: [],
  sickness: [],
  addictions: [],

  likes: [],
  dislikes: [],

  anecdotes: [],
  quotes: [],
  lyrics: [],
  songs: [],

  moodboard: [],

  family: [],
  friends: [],
  pets: [],

  organizations: [],
  branches: [],

  relationships: [],

  personality: {
    niceMean: 50,
    braveCoward: 50,
    pacifistViolent: 50,
    thoughtfulImpulsive: 50,
    agreeableContrary: 50,
    idealisticPragmatic: 50,
    frugalBigSpender: 50,
    collectedWild: 50,
    honestDeceptive: 50,
    politeRude: 50,
    smartIdiot: 50,
    confidentInsecure: 50,
    calmAnxious: 50,
    patientImpatient: 50,
    gullibleSkeptical: 50,
    reservedFlirty: 50,
  },

  skills: {
    perception: 1,
    communication: 1,
    persuasion: 1,
    mediation: 1,
    literacy: 1,
    creativity: 1,
    cooking: 1,
    techSavvy: 1,
    combat: 1,
    survival: 1,
    stealth: 1,
    streetSmarts: 1,
    seduction: 1,
    luck: 1,
    handlingAnimals: 1,
    pacifyingChildren: 1,
    reflexes: 1,
    strength: 1,
    speed: 1,
    battleIQ: 1,
    resistance: 1,
    flexibility: 1,
  },

  socials: {
    charisma: 1,
    empathy: 1,
    generosity: 1,
    wealth: 1,
    aggression: 1,
    libido: 1,
  },

  notes: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const emptyOrganization = () => ({
  id: uid("organization"),
  name: "",
  acronym: "",
  type: "",
  description: "",
  leader: "",
  headquarters: "",
  ideology: "",
  status: "Active",
  logo: "",
  branches: [],
  members: [],
  enemies: [],
  allies: [],
  notes: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const emptyInvestigation = () => ({
  id: uid("investigation"),
  title: "",
  status: "Open",
  difficulty: 3,
  summary: "",

  what: "",
  who: "",
  where: "",
  when: "",
  how: "",
  why: "",

  victim: "",
  suspect: "",
  culprit: "",

  peopleInvolved: [],
  evidence: [],
  clues: [],
  theories: [],
  timeline: [],

  organizations: [],
  characters: [],

  notes: "",

  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const emptyLore = () => ({
  id: uid("lore"),
  title: "",
  category: "General",
  era: "",
  summary: "",
  content: "",
  characters: [],
  organizations: [],
  investigations: [],
  tags: [],
  image: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const emptyPost = () => ({
  id: uid("post"),
  title: "",
  author: "",
  date: new Date().toISOString().slice(0, 10),
  category: "General",
  content: "",
  characters: [],
  organizations: [],
  investigation: "",
  image: "",
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const emptyDatabase = () => ({
  characters: [],
  organizations: [],
  investigations: [],
  lore: [],
  posts: [],
});

const personalityFields = [
  ["niceMean", "Nice", "Mean"],
  ["braveCoward", "Brave", "Coward"],
  ["pacifistViolent", "Pacifist", "Violent"],
  ["thoughtfulImpulsive", "Thoughtful", "Impulsive"],
  ["agreeableContrary", "Agreeable", "Contrary"],
  ["idealisticPragmatic", "Idealistic", "Pragmatic"],
  ["frugalBigSpender", "Frugal", "Big spender"],
  ["collectedWild", "Collected", "Wild"],
  ["honestDeceptive", "Honest", "Deceptive"],
  ["politeRude", "Polite", "Rude"],
  ["smartIdiot", "Smart", "Idiot"],
  ["confidentInsecure", "Confident", "Insecure"],
  ["calmAnxious", "Calm", "Anxious"],
  ["patientImpatient", "Patient", "Impatient"],
  ["gullibleSkeptical", "Gullible", "Skeptical"],
  ["reservedFlirty", "Reserved", "Flirty"],
];

const skillFields = [
  ["perception", "Perception"],
  ["communication", "Communication"],
  ["persuasion", "Persuasion"],
  ["mediation", "Mediation"],
  ["literacy", "Literacy"],
  ["creativity", "Creativity"],
  ["cooking", "Cooking"],
  ["techSavvy", "Tech savvy"],
  ["combat", "Combat"],
  ["survival", "Survival"],
  ["stealth", "Stealth"],
  ["streetSmarts", "Street smarts"],
  ["seduction", "Seduction"],
  ["luck", "Luck"],
  ["handlingAnimals", "Handling animals"],
  ["pacifyingChildren", "Pacifying children"],
  ["reflexes", "Reflexes"],
  ["strength", "Strength"],
  ["speed", "Speed"],
  ["battleIQ", "Battle IQ"],
  ["resistance", "Resistance"],
  ["flexibility", "Flexibility"],
];

const socialFields = [
  ["charisma", "Charisma"],
  ["empathy", "Empathy"],
  ["generosity", "Generosity"],
  ["wealth", "Wealth"],
  ["aggression", "Aggression"],
  ["libido", "Libido"],
];

function normalizeDatabase(data) {
  const base = emptyDatabase();

  return {
    characters: Array.isArray(data?.characters) ? data.characters : base.characters,
    organizations: Array.isArray(data?.organizations)
      ? data.organizations
      : base.organizations,
    investigations: Array.isArray(data?.investigations)
      ? data.investigations
      : base.investigations,
    lore: Array.isArray(data?.lore) ? data.lore : base.lore,
    posts: Array.isArray(data?.posts) ? data.posts : base.posts,
  };
}

function loadDatabase() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return emptyDatabase();
    }

    return normalizeDatabase(JSON.parse(raw));
  } catch {
    return emptyDatabase();
  }
}

function saveDatabase(database) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
    return true;
  } catch {
    return false;
  }
}

function loadTheme() {
  return localStorage.getItem(THEME_KEY) || "goth";
}

function formatDate(value) {
  if (!value) return "Unknown";

  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function displayName(character) {
  if (!character) return "Unknown character";

  const name = `${character.firstName || ""} ${character.lastName || ""}`.trim();

  return name || character.nickname || "Unnamed character";
}

function arrayText(value) {
  if (!Array.isArray(value)) return [];

  return value;
}

function downloadFile(filename, content, type = "application/json") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
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
   SMALL REUSABLE COMPONENTS
   ========================================================= */

function Icon({ children }) {
  return <span className="icon">{children}</span>;
}

function Button({
  children,
  onClick,
  variant = "default",
  type = "button",
  disabled = false,
  className = "",
}) {
  return (
    <button
      type={type}
      className={`button button-${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
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
  required = false,
}) {
  return (
    <label className="field">
      {label && <span className="field-label">{label}</span>}

      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
  placeholder = "",
  rows = 5,
}) {
  return (
    <label className="field">
      {label && <span className="field-label">{label}</span>}

      <textarea
        value={value ?? ""}
        placeholder={placeholder}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="field">
      {label && <span className="field-label">{label}</span>}

      <select value={value ?? ""} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value ?? option} value={option.value ?? option}>
            {option.label ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TagInput({ label, values, onChange, placeholder = "Type and press Enter" }) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const clean = draft.trim();

    if (!clean) return;

    onChange([...values, clean]);
    setDraft("");
  };

  const remove = (index) => {
    onChange(values.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <div className="field">
      <span className="field-label">{label}</span>

      <div className="tag-input">
        <input
          value={draft}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
        />

        <Button type="button" variant="small" onClick={add}>
          +
        </Button>
      </div>

      {values.length > 0 && (
        <div className="tags">
          {values.map((item, index) => (
            <span className="tag" key={`${item}-${index}`}>
              {item}

              <button type="button" onClick={() => remove(index)}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Section({ title, subtitle, children, className = "" }) {
  return (
    <section className={`panel section-panel ${className}`}>
      <div className="section-heading">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>

      {children}
    </section>
  );
}

function EmptyState({ title, text, action }) {
  return (
    <div className="empty-state">
      <div className="empty-symbol">✦</div>
      <h3>{title}</h3>
      <p>{text}</p>

      {action}
    </div>
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
  className = "",
}) {
  const handleChange = async (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    try {
      const images = await Promise.all(files.map(readFileAsDataURL));

      if (multiple) {
        onChange([...(value || []), ...images]);
      } else {
        onChange(images[0]);
      }
    } catch {
      alert("The image could not be loaded.");
    }

    event.target.value = "";
  };

  return (
    <div className={`image-upload ${className}`}>
      <div className="field-label">{label}</div>

      <label className="upload-zone">
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleChange}
        />

        <span className="upload-icon">＋</span>
        <strong>{multiple ? "Add images" : "Upload image"}</strong>
        <small>Stored locally in your browser</small>
      </label>

      {!multiple && value && (
        <div className="uploaded-preview">
          <img src={value} alt={label} />

          <Button variant="danger" onClick={() => onChange("")}>
            Remove
          </Button>
        </div>
      )}

      {multiple && value?.length > 0 && (
        <div className="moodboard-grid">
          {value.map((image, index) => (
            <div className="moodboard-image" key={`${image.slice(0, 20)}-${index}`}>
              <img src={image} alt={`Moodboard ${index + 1}`} />

              <button
                type="button"
                onClick={() =>
                  onChange(value.filter((_, imageIndex) => imageIndex !== index))
                }
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   AUTHENTICATION
   ========================================================= */

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const submit = (event) => {
    event.preventDefault();

    const cleanUsername = username.trim();

    if (!cleanUsername || !password) {
      setMessage("Please complete every field.");
      return;
    }

    let users = [];

    try {
      users = JSON.parse(localStorage.getItem("ocfiles_users_v1") || "[]");
    } catch {
      users = [];
    }

    if (mode === "register") {
      const exists = users.some(
        (user) => user.username.toLowerCase() === cleanUsername.toLowerCase()
      );

      if (exists) {
        setMessage("That username already exists.");
        return;
      }

      const user = {
        id: uid("user"),
        username: cleanUsername,
        password,
        createdAt: new Date().toISOString(),
      };

      users.push(user);

      localStorage.setItem("ocfiles_users_v1", JSON.stringify(users));
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      onLogin(user);
      return;
    }

    const user = users.find(
      (item) =>
        item.username.toLowerCase() === cleanUsername.toLowerCase() &&
        item.password === password
    );

    if (!user) {
      setMessage("Incorrect username or password.");
      return;
    }

    localStorage.setItem(USER_KEY, JSON.stringify(user));
    onLogin(user);
  };

  return (
    <main className="auth-screen">
      <div className="auth-decoration auth-decoration-one" />
      <div className="auth-decoration auth-decoration-two" />

      <div className="auth-card panel">
        <div className="brand-mark">✦</div>

        <span className="eyebrow">PERSONAL CHARACTER DATABASE</span>

        <h1>OcFiles</h1>

        <p className="auth-subtitle">
          Your characters, lore, organizations, investigations and stories —
          gathered in one dark archive.
        </p>

        <div className="auth-tabs">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => {
              setMode("login");
              setMessage("");
            }}
          >
            Log in
          </button>

          <button
            className={mode === "register" ? "active" : ""}
            onClick={() => {
              setMode("register");
              setMessage("");
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={submit} className="auth-form">
          <Input
            label="Username"
            value={username}
            onChange={setUsername}
            placeholder="Your archive name"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Your password"
          />

          {message && <div className="form-error">{message}</div>}

          <Button type="submit" variant="primary" className="full-width">
            {mode === "login" ? "Enter the archive" : "Create archive"}
          </Button>
        </form>

        <div className="auth-warning">
          <strong>Personal-site note</strong>
          <span>
            This login is stored locally in your browser. GitHub Pages does not
            provide a private server database.
          </span>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   NAVIGATION
   ========================================================= */

const navigation = [
  { id: "dashboard", icon: "⌂", label: "Dashboard" },
  { id: "characters", icon: "♙", label: "Characters" },
  { id: "organizations", icon: "♜", label: "Organizations" },
  { id: "investigations", icon: "♧", label: "Investigations" },
  { id: "lore", icon: "✦", label: "Lore" },
  { id: "posts", icon: "✎", label: "Posts" },
];

function Sidebar({
  activeTab,
  setActiveTab,
  user,
  theme,
  setTheme,
  onLogout,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        className="mobile-menu-button"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Open menu"
      >
        ☰
      </button>

      {mobileOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="sidebar-symbol">✦</div>

          <div>
            <strong>OcFiles</strong>
            <span>PERSONAL ARCHIVE</span>
          </div>
        </div>

        <nav className="main-nav">
          {navigation.map((item) => (
            <button
              key={item.id}
              className={activeTab === item.id ? "active" : ""}
              onClick={() => {
                setActiveTab(item.id);
                setMobileOpen(false);
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-divider" />

        <div className="sidebar-section-label">ATMOSPHERE</div>

        <div className="theme-mini-list">
          {Object.entries(THEMES).map(([id, item]) => (
            <button
              key={id}
              className={theme === id ? "active" : ""}
              onClick={() => setTheme(id)}
              title={item.description}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </div>

        <div className="sidebar-bottom">
          <div className="current-user">
            <div className="user-avatar">
              {(user?.username || "?")[0].toUpperCase()}
            </div>

            <div>
              <strong>{user?.username || "Guest"}</strong>
              <span>Archive owner</span>
            </div>
          </div>

          <button className="logout-button" onClick={onLogout}>
            ↪ Log out
          </button>
        </div>
      </aside>
    </>
  );
}

/* =========================================================
   TOPBAR
   ========================================================= */

function Topbar({
  title,
  search,
  setSearch,
  onExport,
  onImport,
  fileInputRef,
}) {
  return (
    <header className="topbar">
      <div>
        <span className="topbar-small">OCFILES / ARCHIVE</span>
        <h1>{title}</h1>
      </div>

      <div className="topbar-actions">
        <div className="global-search">
          <span>⌕</span>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search your archive..."
          />
        </div>

        <Button variant="ghost" onClick={onExport}>
          ↓ Export
        </Button>

        <Button
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
        >
          ↑ Import
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden-input"
          onChange={onImport}
        />
      </div>
    </header>
  );
}

/* =========================================================
   DASHBOARD
   ========================================================= */

function Dashboard({
  database,
  setActiveTab,
  setSelectedCharacter,
  setSelectedOrganization,
  setSelectedInvestigation,
}) {
  const characters = database.characters;
  const organizations = database.organizations;
  const investigations = database.investigations;

  const alive = characters.filter(
    (character) => character.status === "Alive"
  ).length;

  const openCases = investigations.filter(
    (investigation) => investigation.status !== "Closed"
  ).length;

  const recentCharacters = [...characters]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  return (
    <div className="dashboard-page">
      <div className="hero-banner panel">
        <div className="hero-rings" />

        <div className="hero-content">
          <span className="eyebrow">WELCOME TO YOUR ARCHIVE</span>

          <h2>
            Every character has
            <br />
            <span>a story.</span>
          </h2>

          <p>
            Build interconnected characters, organizations, mysteries and
            worlds without losing track of the details.
          </p>

          <div className="hero-actions">
            <Button
              variant="primary"
              onClick={() => setActiveTab("characters")}
            >
              ♙ View characters
            </Button>

            <Button
              variant="ghost"
              onClick={() => setActiveTab("investigations")}
            >
              ♧ Open investigations
            </Button>
          </div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card panel">
          <span className="stat-icon">♙</span>
          <span className="stat-label">Characters</span>
          <strong>{characters.length}</strong>
          <small>{alive} currently alive</small>
        </div>

        <div className="stat-card panel">
          <span className="stat-icon">♜</span>
          <span className="stat-label">Organizations</span>
          <strong>{organizations.length}</strong>
          <small>groups & branches</small>
        </div>

        <div className="stat-card panel">
          <span className="stat-icon">♧</span>
          <span className="stat-label">Investigations</span>
          <strong>{investigations.length}</strong>
          <small>{openCases} active cases</small>
        </div>

        <div className="stat-card panel">
          <span className="stat-icon">✦</span>
          <span className="stat-label">Lore entries</span>
          <strong>{database.lore.length}</strong>
          <small>worldbuilding archive</small>
        </div>
      </div>

      <div className="dashboard-columns">
        <Section
          title="Recently updated"
          subtitle="Your latest characters"
        >
          {recentCharacters.length === 0 ? (
            <EmptyState
              title="The archive is empty"
              text="Create your first character to begin."
              action={
                <Button
                  variant="primary"
                  onClick={() => setActiveTab("characters")}
                >
                  Create character
                </Button>
              }
            />
          ) : (
            <div className="recent-list">
              {recentCharacters.map((character) => (
                <button
                  className="recent-character"
                  key={character.id}
                  onClick={() => {
                    setSelectedCharacter(character.id);
                    setActiveTab("character-editor");
                  }}
                >
                  {character.portrait ? (
                    <img src={character.portrait} alt="" />
                  ) : (
                    <div className="avatar-placeholder">✦</div>
                  )}

                  <div>
                    <strong>{displayName(character)}</strong>
                    <span>
                      {character.job || "No occupation"} ·{" "}
                      {character.status || "Unknown"}
                    </span>
                  </div>

                  <small>{formatDate(character.updatedAt)}</small>
                </button>
              ))}
            </div>
          )}
        </Section>

        <Section
          title="Archive shortcuts"
          subtitle="Jump directly into a system"
        >
          <div className="shortcut-grid">
            <button onClick={() => setActiveTab("characters")}>
              <span>♙</span>
              <strong>Character files</strong>
              <small>Profiles, skills & relationships</small>
            </button>

            <button onClick={() => setActiveTab("organizations")}>
              <span>♜</span>
              <strong>Organizations</strong>
              <small>Groups, branches & members</small>
            </button>

            <button onClick={() => setActiveTab("investigations")}>
              <span>♧</span>
              <strong>Detective cases</strong>
              <small>Clues, suspects & evidence</small>
            </button>

            <button onClick={() => setActiveTab("lore")}>
              <span>✦</span>
              <strong>Lore archive</strong>
              <small>Worldbuilding & history</small>
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}

/* =========================================================
   CHARACTER LIST
   ========================================================= */

function CharacterList({
  characters,
  search,
  setSelectedCharacter,
  setActiveTab,
  deleteCharacter,
  duplicateCharacter,
}) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [sort, setSort] = useState("name");

  const filtered = useMemo(() => {
    let result = [...characters];

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((character) =>
        [
          character.firstName,
          character.lastName,
          character.nickname,
          character.job,
          character.affiliation,
          character.nationality,
          character.species,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query)
      );
    }

    if (statusFilter !== "All") {
      result = result.filter(
        (character) => character.status === statusFilter
      );
    }

    if (sort === "name") {
      result.sort((a, b) =>
        displayName(a).localeCompare(displayName(b))
      );
    }

    if (sort === "updated") {
      result.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
    }

    if (sort === "age") {
      result.sort(
        (a, b) => Number(a.age || 0) - Number(b.age || 0)
      );
    }

    return result;
  }, [characters, search, statusFilter, sort]);

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="eyebrow">CHARACTER ARCHIVE</span>
          <h2>Characters</h2>
          <p>
            Every OC, every detail, every connection.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            setSelectedCharacter("new");
            setActiveTab("character-editor");
          }}
        >
          + New character
        </Button>
      </div>

      <div className="toolbar panel">
        <div className="toolbar-info">
          <strong>{filtered.length}</strong>
          <span>character files</span>
        </div>

        <div className="toolbar-controls">
          <Select
            label=""
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              "All",
              "Alive",
              "Dead",
              "Unknown",
            ]}
          />

          <Select
            label=""
            value={sort}
            onChange={setSort}
            options={[
              { value: "name", label: "Name" },
              { value: "updated", label: "Recently updated" },
              { value: "age", label: "Age" },
            ]}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No characters found"
          text={
            search
              ? "Try another search term."
              : "Create your first character file."
          }
          action={
            !search && (
              <Button
                variant="primary"
                onClick={() => {
                  setSelectedCharacter("new");
                  setActiveTab("character-editor");
                }}
              >
                Create character
              </Button>
            )
          }
        />
      ) : (
        <div className="character-grid">
          {filtered.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onOpen={() => {
                setSelectedCharacter(character.id);
                setActiveTab("character-editor");
              }}
              onDelete={() => deleteCharacter(character.id)}
              onDuplicate={() => duplicateCharacter(character)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   CHARACTER CARD
   ========================================================= */

function CharacterCard({
  character,
  onOpen,
  onDelete,
  onDuplicate,
}) {
  const skillAverage = useMemo(() => {
    const values = Object.values(character.skills || {});

    if (!values.length) return 0;

    return (
      values.reduce((sum, value) => sum + Number(value || 0), 0) /
      values.length
    ).toFixed(1);
  }, [character.skills]);

  return (
    <article className="character-card panel">
      <button className="card-main-click" onClick={onOpen}>
        <div className="character-card-image">
          {character.portrait ? (
            <img src={character.portrait} alt={displayName(character)} />
          ) : (
            <div className="portrait-placeholder">
              <span>✦</span>
            </div>
          )}

          <span
            className={`status-dot ${
              character.status === "Alive"
                ? "alive"
                : character.status === "Dead"
                ? "dead"
                : ""
            }`}
          />
        </div>

        <div className="character-card-body">
          <span className="character-card-label">
            {character.nickname || character.species || "CHARACTER"}
          </span>

          <h3>{displayName(character)}</h3>

          <p>
            {character.job ||
              character.affiliation ||
              "No occupation recorded"}
          </p>

          <div className="character-mini-stats">
            <span>{character.mbti || "MBTI —"}</span>
            <span>{character.age ? `${character.age} years` : "Age —"}</span>
            <span>{character.status || "Status —"}</span>
          </div>

          <div className="skill-summary">
            <div>
              <span>SKILLS</span>
              <strong>{skillAverage}/5</strong>
            </div>

            <div className="mini-bar">
              <i style={{ width: `${(skillAverage / 5) * 100}%` }} />
            </div>
          </div>
        </div>
      </button>

      <div className="card-actions">
        <button onClick={onOpen} title="Edit">
          ✎
        </button>

        <button onClick={onDuplicate} title="Duplicate">
          ⧉
        </button>

        <button className="danger-icon" onClick={onDelete} title="Delete">
          ×
        </button>
      </div>
    </article>
  );
}

/* =========================================================
   RELATIONSHIP EDITOR
   ========================================================= */

function RelationshipEditor({
  character,
  characters,
  onChange,
}) {
  const [targetId, setTargetId] = useState("");
  const [type, setType] = useState("Friend");
  const [description, setDescription] = useState("");

  const addRelationship = () => {
    if (!targetId) return;

    const exists = (character.relationships || []).some(
      (relationship) => relationship.targetId === targetId
    );

    if (exists) {
      alert("This character is already linked.");
      return;
    }

    onChange([
      ...(character.relationships || []),
      {
        id: uid("relationship"),
        targetId,
        type,
        description,
      },
    ]);

    setTargetId("");
    setDescription("");
  };

  const removeRelationship = (id) => {
    onChange(
      (character.relationships || []).filter(
        (relationship) => relationship.id !== id
      )
    );
  };

  return (
    <div className="relationship-editor">
      <div className="relationship-add">
        <Select
          label="Character"
          value={targetId}
          onChange={setTargetId}
          options={[
            { value: "", label: "Choose a character..." },
            ...characters
              .filter((item) => item.id !== character.id)
              .map((item) => ({
                value: item.id,
                label: displayName(item),
              })),
          ]}
        />

        <Select
          label="Relationship"
          value={type}
          onChange={setType}
          options={[
            "Family",
            "Parent",
            "Child",
            "Sibling",
            "Partner",
            "Ex-partner",
            "Friend",
            "Best friend",
            "Enemy",
            "Rival",
            "Colleague",
            "Mentor",
            "Student",
            "Acquaintance",
            "Other",
          ]}
        />

        <Input
          label="Description"
          value={description}
          onChange={setDescription}
          placeholder="How are they connected?"
        />

        <Button variant="primary" onClick={addRelationship}>
          Link
        </Button>
      </div>

      <div className="relationship-list">
        {(character.relationships || []).map((relationship) => {
          const target = characters.find(
            (item) => item.id === relationship.targetId
          );

          if (!target) return null;

          return (
            <div className="relationship-row" key={relationship.id}>
              {target.portrait ? (
                <img src={target.portrait} alt="" />
              ) : (
                <div className="tiny-avatar">✦</div>
              )}

              <div>
                <strong>{displayName(target)}</strong>
                <span>{relationship.type}</span>

                {relationship.description && (
                  <small>{relationship.description}</small>
                )}
              </div>

              <button
                className="danger-icon"
                onClick={() => removeRelationship(relationship.id)}
              >
                ×
              </button>
            </div>
          );
        })}

        {!character.relationships?.length && (
          <div className="inline-empty">
            No direct relationships added yet.
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   CHARACTER EDITOR — START
   ========================================================= */

function CharacterEditor({
  character,
  characters,
  organizations,
  onSave,
  onDelete,
  setActiveTab,
}) {
  const [draft, setDraft] = useState(() => ({
    ...character,
    personality: {
      ...emptyCharacter().personality,
      ...(character.personality || {}),
    },
    skills: {
      ...emptyCharacter().skills,
      ...(character.skills || {}),
    },
    socials: {
      ...emptyCharacter().socials,
      ...(character.socials || {}),
    },
  }));

  const update = (key, value) => {
    setDraft((current) => ({
      ...current,
      [key]: value,
      updatedAt: new Date().toISOString(),
    }));
  };

  const updateNested = (section, key, value) => {
    setDraft((current) => ({
      ...current,
      [section]: {
        ...(current[section] || {}),
        [key]: value,
      },
      updatedAt: new Date().toISOString(),
    }));
  };

  const save = () => {
    if (!draft.firstName && !draft.lastName && !draft.nickname) {
      alert("Please give this character at least a name or nickname.");
      return;
    }

    onSave({
      ...draft,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="editor-page">
      <div className="editor-header">
        <div>
          <button
            className="back-button"
            onClick={() => setActiveTab("characters")}
          >
            ← Characters
          </button>

          <span className="eyebrow">
            {character.id === "new" ? "NEW FILE" : "CHARACTER FILE"}
          </span>

          <h2>
            {displayName(draft) === "Unnamed character"
              ? "New character"
              : displayName(draft)}
          </h2>
        </div>

        <div className="editor-header-actions">
          {character.id !== "new" && (
            <Button variant="danger" onClick={() => onDelete(draft.id)}>
              Delete
            </Button>
          )}

          <Button variant="primary" onClick={save}>
            ✓ Save character
          </Button>
        </div>
      </div>

      <div className="editor-layout">
        <aside className="editor-nav panel">
          <div className="editor-nav-title">FILE CONTENTS</div>

          {[
            ["identity", "Identity"],
            ["appearance", "Appearance"],
            ["abilities", "Abilities & weapons"],
            ["personality", "Personality"],
            ["skills", "Skills"],
            ["socials", "Socials"],
            ["psychology", "Fears & addictions"],
            ["stories", "Stories & quotes"],
            ["relationships", "Relationships"],
            ["organizations", "Organizations"],
            ["moodboard", "Moodboard"],
            ["notes", "Notes"],
          ].map(([id, label]) => (
            <a href={`#character-${id}`} key={id}>
              {label}
            </a>
          ))}
        </aside>

        <div className="editor-content">
          <Section
            title="Identity"
            subtitle="The basic information of your character."
          >
            <div id="character-identity" className="form-grid">
              <Input
                label="First name"
                value={draft.firstName}
                onChange={(value) => update("firstName", value)}
              />

              <Input
                label="Last name"
                value={draft.lastName}
                onChange={(value) => update("lastName", value)}
              />

              <Input
                label="Nickname(s)"
                value={draft.nickname}
                onChange={(value) => update("nickname", value)}
              />

              <Input
                label="Age"
                type="number"
                value={draft.age}
                onChange={(value) => update("age", value)}
              />

              <Input
                label="Date of birth"
                type="date"
                value={draft.dateOfBirth}
                onChange={(value) => update("dateOfBirth", value)}
              />

              <Input
                label="Gender"
                value={draft.gender}
                onChange={(value) => update("gender", value)}
              />

              <Input
                label="Pronouns"
                value={draft.pronouns}
                onChange={(value) => update("pronouns", value)}
              />

              <Input
                label="Sexuality"
                value={draft.sexuality}
                onChange={(value) => update("sexuality", value)}
              />

              <Input
                label="Nationality"
                value={draft.nationality}
                onChange={(value) => update("nationality", value)}
              />

              <Input
                label="Origins"
                value={draft.origins}
                onChange={(value) => update("origins", value)}
              />

              <Input
                label="Species / race"
                value={draft.species}
                onChange={(value) => update("species", value)}
              />

              <Select
                label="Status"
                value={draft.status}
                onChange={(value) => update("status", value)}
                options={["Alive", "Dead", "Unknown", "Missing"]}
              />

              <Input
                label="Later status"
                value={draft.laterStatus}
                onChange={(value) => update("laterStatus", value)}
                placeholder="What happens later?"
              />

              <Input
                label="MBTI"
                value={draft.mbti}
                onChange={(value) => update("mbti", value)}
                placeholder="INTJ"
              />

              <Input
                label="Job"
                value={draft.job}
                onChange={(value) => update("job", value)}
              />

              <Input
                label="Side job"
                value={draft.sideJob}
                onChange={(value) => update("sideJob", value)}
              />

              <Input
                label="Rank"
                value={draft.rank}
                onChange={(value) => update("rank", value)}
              />

              <Input
                label="Past rank"
                value={draft.pastRank}
                onChange={(value) => update("pastRank", value)}
              />

              <Input
                label="Affiliation"
                value={draft.affiliation}
                onChange={(value) => update("affiliation", value)}
              />

              <Input
                label="Past affiliation"
                value={draft.pastAffiliation}
                onChange={(value) => update("pastAffiliation", value)}
              />
            </div>
          </Section>

          <Section
            title="Appearance"
            subtitle="Physical characteristics and portrait."
          >
            <div id="character-appearance">
              <div className="form-grid">
                <Input
                  label="Height"
                  value={draft.height}
                  onChange={(value) => update("height", value)}
                  placeholder="170 cm"
                />

                <Input
                  label="Weight"
                  value={draft.weight}
                  onChange={(value) => update("weight", value)}
                  placeholder="60 kg"
                />

                <Input
                  label="Eye color"
                  value={draft.eyeColor}
                  onChange={(value) => update("eyeColor", value)}
                />

                <Input
                  label="Hair color"
                  value={draft.hairColor}
                  onChange={(value) => update("hairColor", value)}
                />

                <Input
                  label="Hair style"
                  value={draft.hairStyle}
                  onChange={(value) => update("hairStyle", value)}
                />
              </div>

              <ImageUpload
                label="Character portrait"
                value={draft.portrait}
                onChange={(value) => update("portrait", value)}
              />
            </div>
          </Section>

          <Section
            title="Abilities & weapons"
            subtitle="Powers, equipment, consequences and limitations."
          >
            <div id="character-abilities">
              <TagInput
                label="Abilities"
                values={draft.abilities || []}
                onChange={(value) => update("abilities", value)}
                placeholder="Add an ability..."
              />

              <TagInput
                label="Weapons"
                values={draft.weapons || []}
                onChange={(value) => update("weapons", value)}
                placeholder="Add a weapon..."
              />

              <Textarea
                label="Effects of abilities"
                value={draft.abilityEffects}
                onChange={(value) => update("abilityEffects", value)}
                placeholder="What do the abilities actually do? What visual or physical effects do they create?"
                rows={6}
              />

              <Textarea
                label="Ability weaknesses / limitations"
                value={draft.abilityWeaknesses}
                onChange={(value) => update("abilityWeaknesses", value)}
                placeholder="Costs, limits, counters, weaknesses..."
                rows={5}
              />
            </div>
          </Section>

          <Section
            title="Personality"
            subtitle="Move each cursor from the first trait toward the second."
          >
            <div id="character-personality" className="slider-list">
              {personalityFields.map(([key, left, right]) => (
                <div className="personality-row" key={key}>
                  <span>{left}</span>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={draft.personality?.[key] ?? 50}
                    onChange={(event) =>
                      updateNested(
                        "personality",
                        key,
                        Number(event.target.value)
                      )
                    }
                  />

                  <span>{right}</span>

                  <b>{draft.personality?.[key] ?? 50}</b>
                </div>
              ))}
            </div>
          </Section>

          <Section
            title="Skills"
            subtitle="Every skill has five levels."
          >
            <div id="character-skills" className="rating-grid">
              {skillFields.map(([key, label]) => (
                <RatingFive
                  key={key}
                  label={label}
                  value={draft.skills?.[key] ?? 1}
                  onChange={(value) =>
                    updateNested("skills", key, value)
                  }
                />
              ))}
            </div>
          </Section>

          <Section
            title="Socials"
            subtitle="Social and interpersonal characteristics."
          >
            <div id="character-socials" className="rating-grid">
              {socialFields.map(([key, label]) => (
                <RatingFive
                  key={key}
                  label={label}
                  value={draft.socials?.[key] ?? 1}
                  onChange={(value) =>
                    updateNested("socials", key, value)
                  }
                />
              ))}
            </div>
          </Section>

          <Section
            title="Fears, sickness & addictions"
            subtitle="The things that affect the character beyond their statistics."
          >
            <div id="character-psychology">
              <TagInput
                label="Fears"
                values={draft.fears || []}
                onChange={(value) => update("fears", value)}
                placeholder="Add a fear..."
              />

              <TagInput
                label="Sickness / medical conditions"
                values={draft.sickness || []}
                onChange={(value) => update("sickness", value)}
                placeholder="Add sickness..."
              />

              <TagInput
                label="Addictions"
                values={draft.addictions || []}
                onChange={(value) => update("addictions", value)}
                placeholder="Add addiction..."
              />

              <div className="two-column">
                <TagInput
                  label="Likes"
                  values={draft.likes || []}
                  onChange={(value) => update("likes", value)}
                  placeholder="Add something they like..."
                />

                <TagInput
                  label="Dislikes"
                  values={draft.dislikes || []}
                  onChange={(value) => update("dislikes", value)}
                  placeholder="Add something they dislike..."
                />
              </div>
            </div>
          </Section>

          <Section
            title="Stories, anecdotes, lyrics & quotes"
            subtitle="The little details that make your character feel alive."
          >
            <div id="character-stories">
              <TagInput
                label="Anecdotes"
                values={draft.anecdotes || []}
                onChange={(value) => update("anecdotes", value)}
                placeholder="Add an anecdote..."
              />

              <TagInput
                label="Quotes"
                values={draft.quotes || []}
                onChange={(value) => update("quotes", value)}
                placeholder="Add a quote..."
              />

              <TagInput
                label="Songs"
                values={draft.songs || []}
                onChange={(value) => update("songs", value)}
                placeholder="Add a song..."
              />

              <TagInput
                label="Lyrics"
                values={draft.lyrics || []}
                onChange={(value) => update("lyrics", value)}
                placeholder="Add lyrics..."
              />
            </div>
          </Section>

          <Section
            title="Relationships"
            subtitle="Directly connect this character to other characters."
          >
            <div id="character-relationships">
              <RelationshipEditor
                character={draft}
                characters={characters}
                onChange={(value) => update("relationships", value)}
              />

              <div className="two-column relationship-tags">
                <TagInput
                  label="Family"
                  values={draft.family || []}
                  onChange={(value) => update("family", value)}
                  placeholder="Family member..."
                />

                <TagInput
                  label="Friends"
                  values={draft.friends || []}
                  onChange={(value) => update("friends", value)}
                  placeholder="Friend..."
                />

                <TagInput
                  label="Pets"
                  values={draft.pets || []}
                  onChange={(value) => update("pets", value)}
                  placeholder="Pet..."
                />
              </div>
            </div>
          </Section>

          <Section
            title="Organizations"
            subtitle="Connect this character directly to groups and branches."
          >
            <div id="character-organizations">
              <div className="organization-link-grid">
                {organizations.length === 0 ? (
                  <div className="inline-empty">
                    Create an organization first to link it here.
                  </div>
                ) : (
                  organizations.map((organization) => {
                    const selected = (draft.organizations || []).includes(
                      organization.id
                    );

                    return (
                      <button
                        type="button"
                        className={`organization-link ${
                          selected ? "selected" : ""
                        }`}
                        key={organization.id}
                        onClick={() => {
                          const current = draft.organizations || [];

                          update(
                            "organizations",
                            selected
                              ? current.filter(
                                  (id) => id !== organization.id
                                )
                              : [...current, organization.id]
                          );
                        }}
                      >
                        <span>{selected ? "✓" : "＋"}</span>
                        <strong>
                          {organization.name || "Unnamed organization"}
                        </strong>
                      </button>
                    );
                  })
                )}
              </div>

              <TagInput
                label="Branches / divisions"
                values={draft.branches || []}
                onChange={(value) => update("branches", value)}
                placeholder="Branch name..."
              />
            </div>
          </Section>

          <Section
            title="Moodboard"
            subtitle="Build a visual board for the character."
          >
            <div id="character-moodboard">
              <ImageUpload
                label="Moodboard images"
                multiple
                value={draft.moodboard || []}
                onChange={(value) => update("moodboard", value)}
              />
            </div>
          </Section>

          <Section
            title="Notes"
            subtitle="Anything else that doesn't fit elsewhere."
          >
            <div id="character-notes">
              <Textarea
                label="Character notes"
                value={draft.notes}
                onChange={(value) => update("notes", value)}
                placeholder="Extra information, chronology, ideas, secrets..."
                rows={12}
              />
            </div>
          </Section>

          <div className="editor-save-footer">
            <Button variant="primary" onClick={save}>
              ✓ Save character
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RatingFive({ label, value, onChange }) {
  return (
    <div className="rating-item">
      <div className="rating-heading">
        <span>{label}</span>
        <strong>{value}/5</strong>
      </div>

      <div className="rating-dots">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            type="button"
            key={level}
            className={level <= value ? "active" : ""}
            onClick={() => onChange(level)}
            aria-label={`${label}: ${level}/5`}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   ORGANIZATION LIST
   ========================================================= */

function OrganizationList({
  organizations,
  characters,
  search,
  setSelectedOrganization,
  setActiveTab,
  deleteOrganization,
}) {
  const filtered = organizations.filter((organization) => {
    const query = search.toLowerCase();

    return [
      organization.name,
      organization.acronym,
      organization.type,
      organization.ideology,
      organization.headquarters,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="eyebrow">GROUP ARCHIVE</span>
          <h2>Organizations</h2>
          <p>Organizations, branches, members, allies and enemies.</p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            setSelectedOrganization("new");
            setActiveTab("organization-editor");
          }}
        >
          + New organization
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No organizations found"
          text="Create your first organization."
          action={
            <Button
              variant="primary"
              onClick={() => {
                setSelectedOrganization("new");
                setActiveTab("organization-editor");
              }}
            >
              Create organization
            </Button>
          }
        />
      ) : (
        <div className="organization-grid">
          {filtered.map((organization) => (
            <article className="organization-card panel" key={organization.id}>
              <button
                className="organization-card-main"
                onClick={() => {
                  setSelectedOrganization(organization.id);
                  setActiveTab("organization-editor");
                }}
              >
                {organization.logo ? (
                  <img src={organization.logo} alt="" />
                ) : (
                  <div className="organization-symbol">♜</div>
                )}

                <div>
                  <span className="card-label">
                    {organization.acronym || organization.type || "ORGANIZATION"}
                  </span>

                  <h3>{organization.name || "Unnamed organization"}</h3>

                  <p>
                    {organization.description ||
                      "No description recorded."}
                  </p>

                  <div className="organization-meta">
                    <span>{organization.status}</span>
                    <span>
                      {(organization.members || []).length} members
                    </span>
                    <span>
                      {(organization.branches || []).length} branches
                    </span>
                  </div>
                </div>
              </button>

              <div className="card-actions">
                <button
                  onClick={() => {
                    setSelectedOrganization(organization.id);
                    setActiveTab("organization-editor");
                  }}
                >
                  ✎
                </button>

                <button
                  className="danger-icon"
                  onClick={() => deleteOrganization(organization.id)}
                >
                  ×
                </button>
              </div>
            </article>
          ))}
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
  onDelete,
  setActiveTab,
}) {
  const [draft, setDraft] = useState(organization);

  const update = (key, value) => {
    setDraft((current) => ({
      ...current,
      [key]: value,
      updatedAt: new Date().toISOString(),
    }));
  };

  const save = () => {
    if (!draft.name.trim()) {
      alert("Please give the organization a name.");
      return;
    }

    onSave({
      ...draft,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="editor-page">
      <div className="editor-header">
        <div>
          <button
            className="back-button"
            onClick={() => setActiveTab("organizations")}
          >
            ← Organizations
          </button>

          <span className="eyebrow">ORGANIZATION FILE</span>
          <h2>{draft.name || "New organization"}</h2>
        </div>

        <div className="editor-header-actions">
          {organization.id !== "new" && (
            <Button variant="danger" onClick={() => onDelete(draft.id)}>
              Delete
            </Button>
          )}

          <Button variant="primary" onClick={save}>
            ✓ Save organization
          </Button>
        </div>
      </div>

      <div className="editor-content narrow-editor">
        <Section
          title="Organization identity"
          subtitle="Basic information."
        >
          <div className="form-grid">
            <Input
              label="Name"
              value={draft.name}
              onChange={(value) => update("name", value)}
            />

            <Input
              label="Acronym"
              value={draft.acronym}
              onChange={(value) => update("acronym", value)}
            />

            <Input
              label="Type"
              value={draft.type}
              onChange={(value) => update("type", value)}
              placeholder="Military, criminal, government..."
            />

            <Select
              label="Status"
              value={draft.status}
              onChange={(value) => update("status", value)}
              options={["Active", "Inactive", "Disbanded", "Secret", "Unknown"]}
            />

            <Input
              label="Leader"
              value={draft.leader}
              onChange={(value) => update("leader", value)}
            />

            <Input
              label="Headquarters"
              value={draft.headquarters}
              onChange={(value) => update("headquarters", value)}
            />

            <Input
              label="Ideology"
              value={draft.ideology}
              onChange={(value) => update("ideology", value)}
            />
          </div>

          <Textarea
            label="Description"
            value={draft.description}
            onChange={(value) => update("description", value)}
            rows={7}
          />

          <ImageUpload
            label="Organization logo"
            value={draft.logo}
            onChange={(value) => update("logo", value)}
          />
        </Section>

        <Section
          title="Branches"
          subtitle="Divisions, departments and locations."
        >
          <TagInput
            label="Branches"
            values={draft.branches || []}
            onChange={(value) => update("branches", value)}
            placeholder="Add branch..."
          />
        </Section>

        <Section
          title="Members"
          subtitle="Directly connect characters to this organization."
        >
          <div className="organization-member-grid">
            {characters.length === 0 ? (
              <div className="inline-empty">
                Create characters first.
              </div>
            ) : (
              characters.map((character) => {
                const selected = (draft.members || []).includes(character.id);

                return (
                  <button
                    type="button"
                    className={`member-selector ${
                      selected ? "selected" : ""
                    }`}
                    key={character.id}
                    onClick={() => {
                      const current = draft.members || [];

                      update(
                        "members",
                        selected
                          ? current.filter((id) => id !== character.id)
                          : [...current, character.id]
                      );
                    }}
                  >
                    {character.portrait ? (
                      <img src={character.portrait} alt="" />
                    ) : (
                      <div className="tiny-avatar">✦</div>
                    )}

                    <span>
                      <strong>{displayName(character)}</strong>
                      <small>{character.rank || character.job || ""}</small>
                    </span>

                    <b>{selected ? "✓" : "+"}</b>
                  </button>
                );
              })
            )}
          </div>
        </Section>

        <Section title="Allies & enemies">
          <div className="two-column">
            <TagInput
              label="Allies"
              values={draft.allies || []}
              onChange={(value) => update("allies", value)}
              placeholder="Add ally..."
            />

            <TagInput
              label="Enemies"
              values={draft.enemies || []}
              onChange={(value) => update("enemies", value)}
              placeholder="Add enemy..."
            />
          </div>
        </Section>

        <Section title="Notes">
          <Textarea
            label="Organization notes"
            value={draft.notes}
            onChange={(value) => update("notes", value)}
            rows={12}
          />
        </Section>

        <div className="editor-save-footer">
          <Button variant="primary" onClick={save}>
            ✓ Save organization
          </Button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   INVESTIGATIONS
   ========================================================= */

function InvestigationList({
  investigations,
  search,
  characters,
  organizations,
  setSelectedInvestigation,
  setActiveTab,
  deleteInvestigation,
}) {
  const filtered = investigations.filter((investigation) =>
    [
      investigation.title,
      investigation.summary,
      investigation.status,
      investigation.suspect,
      investigation.culprit,
      investigation.victim,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="eyebrow">DETECTIVE ARCHIVE</span>
          <h2>Investigations</h2>
          <p>
            Cases, suspects, evidence, clues, theories and connections.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            setSelectedInvestigation("new");
            setActiveTab("investigation-editor");
          }}
        >
          + New case
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No cases found"
          text="Open an investigation to begin building a mystery."
          action={
            <Button
              variant="primary"
              onClick={() => {
                setSelectedInvestigation("new");
                setActiveTab("investigation-editor");
              }}
            >
              Create case
            </Button>
          }
        />
      ) : (
        <div className="investigation-grid">
          {filtered.map((investigation) => {
            const linkedCharacters = (investigation.characters || [])
              .map((id) => characters.find((character) => character.id === id))
              .filter(Boolean);

            const linkedOrganizations = (investigation.organizations || [])
              .map((id) =>
                organizations.find((organization) => organization.id === id)
              )
              .filter(Boolean);

            return (
              <article
                className="investigation-card panel"
                key={investigation.id}
              >
                <button
                  className="investigation-main"
                  onClick={() => {
                    setSelectedInvestigation(investigation.id);
                    setActiveTab("investigation-editor");
                  }}
                >
                  <div className="case-number">
                    #{investigation.id.slice(-5).toUpperCase()}
                  </div>

                  <div className="case-status-row">
                    <span
                      className={`case-status ${investigation.status
                        .toLowerCase()
                        .replace(/\s/g, "-")}`}
                    >
                      {investigation.status}
                    </span>

                    <span className="case-difficulty">
                      Difficulty {investigation.difficulty}/5
                    </span>
                  </div>

                  <h3>{investigation.title || "Untitled case"}</h3>

                  <p>
                    {investigation.summary ||
                      "No case summary has been written yet."}
                  </p>

                  <div className="case-meta">
                    <span>
                      Evidence: {(investigation.evidence || []).length}
                    </span>

                    <span>
                      Clues: {(investigation.clues || []).length}
                    </span>

                    <span>
                      People: {linkedCharacters.length}
                    </span>

                    <span>
                      Organizations: {linkedOrganizations.length}
                    </span>
                  </div>
                </button>

                <div className="card-actions">
                  <button
                    onClick={() => {
                      setSelectedInvestigation(investigation.id);
                      setActiveTab("investigation-editor");
                    }}
                  >
                    ✎
                  </button>

                  <button
                    className="danger-icon"
                    onClick={() => deleteInvestigation(investigation.id)}
                  >
                    ×
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   INVESTIGATION EDITOR
   ========================================================= */

function InvestigationEditor({
  investigation,
  characters,
  organizations,
  onSave,
  onDelete,
  setActiveTab,
}) {
  const [draft, setDraft] = useState(investigation);

  const update = (key, value) => {
    setDraft((current) => ({
      ...current,
      [key]: value,
      updatedAt: new Date().toISOString(),
    }));
  };

  const save = () => {
    if (!draft.title.trim()) {
      alert("Please give the case a title.");
      return;
    }

    onSave({
      ...draft,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="editor-page">
      <div className="editor-header">
        <div>
          <button
            className="back-button"
            onClick={() => setActiveTab("investigations")}
          >
            ← Investigations
          </button>

          <span className="eyebrow">CASE FILE</span>
          <h2>{draft.title || "New investigation"}</h2>
        </div>

        <div className="editor-header-actions">
          {investigation.id !== "new" && (
            <Button variant="danger" onClick={() => onDelete(draft.id)}>
              Delete
            </Button>
          )}

          <Button variant="primary" onClick={save}>
            ✓ Save case
          </Button>
        </div>
      </div>

      <div className="editor-content narrow-editor">
        <Section
          title="Case overview"
          subtitle="The central information."
        >
          <div className="form-grid">
            <Input
              label="Case title"
              value={draft.title}
              onChange={(value) => update("title", value)}
            />

            <Select
              label="Status"
              value={draft.status}
              onChange={(value) => update("status", value)}
              options={[
                "Open",
                "Investigating",
                "Solved",
                "Cold case",
                "Closed",
              ]}
            />

            <Select
              label="Difficulty"
              value={draft.difficulty}
              onChange={(value) => update("difficulty", Number(value))}
              options={[
                { value: 1, label: "1 — Easy" },
                { value: 2, label: "2 — Moderate" },
                { value: 3, label: "3 — Difficult" },
                { value: 4, label: "4 — Very difficult" },
                { value: 5, label: "5 — Extreme" },
              ]}
            />

            <Input
              label="Victim"
              value={draft.victim}
              onChange={(value) => update("victim", value)}
            />

            <Input
              label="Main suspect"
              value={draft.suspect}
              onChange={(value) => update("suspect", value)}
            />

            <Input
              label="Culprit"
              value={draft.culprit}
              onChange={(value) => update("culprit", value)}
            />
          </div>

          <Textarea
            label="Summary"
            value={draft.summary}
            onChange={(value) => update("summary", value)}
            rows={5}
          />
        </Section>

        <Section
          title="The six questions"
          subtitle="Build the investigation around what, who, where, when, how and why."
        >
          <div className="six-question-grid">
            <Textarea
              label="WHAT?"
              value={draft.what}
              onChange={(value) => update("what", value)}
              rows={5}
            />

            <Textarea
              label="WHO?"
              value={draft.who}
              onChange={(value) => update("who", value)}
              rows={5}
            />

            <Textarea
              label="WHERE?"
              value={draft.where}
              onChange={(value) => update("where", value)}
              rows={5}
            />

            <Textarea
              label="WHEN?"
              value={draft.when}
              onChange={(value) => update("when", value)}
              rows={5}
            />

            <Textarea
              label="HOW?"
              value={draft.how}
              onChange={(value) => update("how", value)}
              rows={5}
            />

            <Textarea
              label="WHY?"
              value={draft.why}
              onChange={(value) => update("why", value)}
              rows={5}
            />
          </div>
        </Section>

        <Section
          title="People involved"
          subtitle="Connect the case directly to your characters."
        >
          <div className="organization-member-grid">
            {characters.map((character) => {
              const selected = (draft.characters || []).includes(
                character.id
              );

              return (
                <button
                  type="button"
                  className={`member-selector ${selected ? "selected" : ""}`}
                  key={character.id}
                  onClick={() => {
                    const current = draft.characters || [];

                    update(
                      "characters",
                      selected
                        ? current.filter((id) => id !== character.id)
                        : [...current, character.id]
                    );
                  }}
                >
                  {character.portrait ? (
                    <img src={character.portrait} alt="" />
                  ) : (
                    <div className="tiny-avatar">✦</div>
                  )}

                  <span>
                    <strong>{displayName(character)}</strong>
                    <small>{character.job || ""}</small>
                  </span>

                  <b>{selected ? "✓" : "+"}</b>
                </button>
              );
            })}
          </div>
        </Section>

        <Section
          title="Organizations involved"
          subtitle="Connect the investigation to organizations and branches."
        >
          <div className="organization-link-grid">
            {organizations.map((organization) => {
              const selected = (draft.organizations || []).includes(
                organization.id
              );

              return (
                <button
                  type="button"
                  className={`organization-link ${
                    selected ? "selected" : ""
                  }`}
                  key={organization.id}
                  onClick={() => {
                    const current = draft.organizations || [];

                    update(
                      "organizations",
                      selected
                        ? current.filter((id) => id !== organization.id)
                        : [...current, organization.id]
                    );
                  }}
                >
                  <span>{selected ? "✓" : "＋"}</span>
                  <strong>
                    {organization.name || "Unnamed organization"}
                  </strong>
                </button>
              );
            })}
          </div>
        </Section>

        <Section
          title="Evidence & clues"
          subtitle="Keep track of everything discovered."
        >
          <TagInput
            label="Evidence"
            values={draft.evidence || []}
            onChange={(value) => update("evidence", value)}
            placeholder="Add evidence..."
          />

          <TagInput
            label="Clues"
            values={draft.clues || []}
            onChange={(value) => update("clues", value)}
            placeholder="Add clue..."
          />

          <TagInput
            label="Theories"
            values={draft.theories || []}
            onChange={(value) => update("theories", value)}
            placeholder="Add theory..."
          />

          <TagInput
            label="Timeline events"
            values={draft.timeline || []}
            onChange={(value) => update("timeline", value)}
            placeholder="Add event..."
          />
        </Section>

        <Section title="Case notes">
          <Textarea
            label="Investigator notes"
            value={draft.notes}
            onChange={(value) => update("notes", value)}
            rows={14}
          />
        </Section>

        <div className="editor-save-footer">
          <Button variant="primary" onClick={save}>
            ✓ Save investigation
          </Button>
        </div>
      </div>
    </div>
  );
}

// ==============================
// OcFiles — App.jsx — PART 2
// ==============================

// ---------- ORGANIZATIONS ----------

function OrganizationsView({
  organizations,
  setOrganizations,
  characters,
  saveData,
}) {
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const emptyOrganization = {
    id: createId(),
    name: "",
    description: "",
    type: "",
    status: "Active",
    leader: "",
    members: [],
    branches: [],
    posts: [],
    founded: "",
    headquarters: "",
    goals: "",
    enemies: "",
    allies: "",
    notes: "",
  };

  const startNew = () => {
    setEditing({
      ...emptyOrganization,
      id: createId(),
    });
    setShowForm(true);
  };

  const saveOrganization = () => {
    if (!editing.name.trim()) return;

    const exists = organizations.some(
      (organization) => organization.id === editing.id
    );

    const updated = exists
      ? organizations.map((organization) =>
          organization.id === editing.id ? editing : organization
        )
      : [...organizations, editing];

    setOrganizations(updated);
    saveData("organizations", updated);
    setShowForm(false);
    setEditing(null);
  };

  const deleteOrganization = (id) => {
    if (!window.confirm("Delete this organization?")) return;

    const updated = organizations.filter(
      (organization) => organization.id !== id
    );

    setOrganizations(updated);
    saveData("organizations", updated);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">WORLD DATABASE</p>
          <h1>Organizations</h1>
          <p className="page-description">
            Manage organizations, branches, members, enemies, allies and posts.
          </p>
        </div>

        <button className="primary-button" onClick={startNew}>
          + New Organization
        </button>
      </div>

      {showForm && editing && (
        <div className="modal-overlay">
          <div className="modal-card large-modal">
            <div className="modal-header">
              <div>
                <p className="eyebrow">ORGANIZATION FILE</p>
                <h2>
                  {editing.name || "New Organization"}
                </h2>
              </div>

              <button
                className="icon-button"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="form-grid">
              <Field
                label="Name"
                value={editing.name}
                onChange={(value) =>
                  setEditing({ ...editing, name: value })
                }
              />

              <Field
                label="Type"
                value={editing.type}
                onChange={(value) =>
                  setEditing({ ...editing, type: value })
                }
              />

              <SelectField
                label="Status"
                value={editing.status}
                options={[
                  "Active",
                  "Inactive",
                  "Disbanded",
                  "Secret",
                  "Unknown",
                ]}
                onChange={(value) =>
                  setEditing({ ...editing, status: value })
                }
              />

              <Field
                label="Founded"
                value={editing.founded}
                onChange={(value) =>
                  setEditing({ ...editing, founded: value })
                }
              />

              <Field
                label="Headquarters"
                value={editing.headquarters}
                onChange={(value) =>
                  setEditing({ ...editing, headquarters: value })
                }
              />

              <Field
                label="Leader"
                value={editing.leader}
                onChange={(value) =>
                  setEditing({ ...editing, leader: value })
                }
              />

              <TextAreaField
                className="full-width"
                label="Description"
                value={editing.description}
                onChange={(value) =>
                  setEditing({ ...editing, description: value })
                }
              />

              <TextAreaField
                className="full-width"
                label="Goals"
                value={editing.goals}
                onChange={(value) =>
                  setEditing({ ...editing, goals: value })
                }
              />

              <TextAreaField
                className="full-width"
                label="Allies"
                value={editing.allies}
                onChange={(value) =>
                  setEditing({ ...editing, allies: value })
                }
              />

              <TextAreaField
                className="full-width"
                label="Enemies"
                value={editing.enemies}
                onChange={(value) =>
                  setEditing({ ...editing, enemies: value })
                }
              />

              <TextAreaField
                className="full-width"
                label="Notes"
                value={editing.notes}
                onChange={(value) =>
                  setEditing({ ...editing, notes: value })
                }
              />
            </div>

            <div className="modal-actions">
              <button
                className="secondary-button"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
              >
                Cancel
              </button>

              <button
                className="primary-button"
                onClick={saveOrganization}
              >
                Save Organization
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card-grid">
        {organizations.map((organization) => (
          <div
            className="database-card organization-card"
            key={organization.id}
          >
            <div className="card-top">
              <div className="avatar-placeholder organization-avatar">
                ♜
              </div>

              <div className="card-title-area">
                <h3>{organization.name}</h3>
                <span className="small-tag">
                  {organization.status}
                </span>
              </div>

              <div className="card-actions">
                <button
                  className="icon-button"
                  onClick={() => {
                    setEditing(organization);
                    setShowForm(true);
                  }}
                >
                  ✎
                </button>

                <button
                  className="icon-button danger"
                  onClick={() =>
                    deleteOrganization(organization.id)
                  }
                >
                  🗑
                </button>
              </div>
            </div>

            {organization.description && (
              <p className="card-description">
                {organization.description}
              </p>
            )}

            <div className="mini-info-grid">
              <div>
                <span>Leader</span>
                <strong>
                  {organization.leader || "Unknown"}
                </strong>
              </div>

              <div>
                <span>HQ</span>
                <strong>
                  {organization.headquarters || "Unknown"}
                </strong>
              </div>

              <div>
                <span>Members</span>
                <strong>
                  {organization.members?.length || 0}
                </strong>
              </div>

              <div>
                <span>Branches</span>
                <strong>
                  {organization.branches?.length || 0}
                </strong>
              </div>
            </div>

            <div className="relationship-strip">
              {organization.members?.length > 0 && (
                <span>👥 {organization.members.length} members</span>
              )}

              {organization.branches?.length > 0 && (
                <span>⌂ {organization.branches.length} branches</span>
              )}

              {organization.posts?.length > 0 && (
                <span>▣ {organization.posts.length} posts</span>
              )}
            </div>
          </div>
        ))}

        {organizations.length === 0 && (
          <EmptyState
            icon="♜"
            title="No organizations yet"
            text="Create your first organization to begin building your world."
            buttonText="+ Create Organization"
            onClick={startNew}
          />
        )}
      </div>
    </div>
  );
}

// ---------- INVESTIGATIONS ----------

function InvestigationsView({
  investigations,
  setInvestigations,
  characters,
  organizations,
  saveData,
}) {
  const [selectedCase, setSelectedCase] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const emptyCase = {
    id: createId(),
    caseNumber: `CASE-${String(investigations.length + 1).padStart(
      3,
      "0"
    )}`,
    title: "",
    status: "Open",
    priority: "Medium",
    dateOpened: "",
    dateClosed: "",
    investigator: "",
    what: "",
    who: "",
    where: "",
    when: "",
    how: "",
    why: "",
    motive: "",
    evidence: "",
    suspects: [],
    victims: [],
    witnesses: [],
    involvedCharacters: [],
    involvedOrganizations: [],
    timeline: [],
    notes: "",
    conclusion: "",
  };

  const createCase = () => {
    setSelectedCase({
      ...emptyCase,
      id: createId(),
      caseNumber: `CASE-${String(
        investigations.length + 1
      ).padStart(3, "0")}`,
    });

    setShowForm(true);
  };

  const saveCase = () => {
    if (!selectedCase.title.trim()) return;

    const exists = investigations.some(
      (item) => item.id === selectedCase.id
    );

    const updated = exists
      ? investigations.map((item) =>
          item.id === selectedCase.id ? selectedCase : item
        )
      : [...investigations, selectedCase];

    setInvestigations(updated);
    saveData("investigations", updated);

    setSelectedCase(null);
    setShowForm(false);
  };

  const deleteCase = (id) => {
    if (!window.confirm("Delete this investigation?")) return;

    const updated = investigations.filter(
      (item) => item.id !== id
    );

    setInvestigations(updated);
    saveData("investigations", updated);
  };

  return (
    <div className="page-container detective-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">CASE FILES</p>
          <h1>Investigations</h1>
          <p className="page-description">
            Build detective cases, suspects, evidence, timelines and
            conclusions.
          </p>
        </div>

        <button className="primary-button" onClick={createCase}>
          + New Case
        </button>
      </div>

      {showForm && selectedCase && (
        <div className="modal-overlay">
          <div className="modal-card huge-modal">
            <div className="modal-header">
              <div>
                <p className="eyebrow">
                  {selectedCase.caseNumber}
                </p>

                <h2>
                  {selectedCase.title || "Untitled Investigation"}
                </h2>
              </div>

              <button
                className="icon-button"
                onClick={() => {
                  setShowForm(false);
                  setSelectedCase(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="form-grid">
              <Field
                label="Case title"
                value={selectedCase.title}
                onChange={(value) =>
                  setSelectedCase({
                    ...selectedCase,
                    title: value,
                  })
                }
              />

              <SelectField
                label="Status"
                value={selectedCase.status}
                options={[
                  "Open",
                  "Investigating",
                  "Solved",
                  "Cold",
                  "Closed",
                  "Unsolved",
                ]}
                onChange={(value) =>
                  setSelectedCase({
                    ...selectedCase,
                    status: value,
                  })
                }
              />

              <SelectField
                label="Priority"
                value={selectedCase.priority}
                options={[
                  "Low",
                  "Medium",
                  "High",
                  "Critical",
                ]}
                onChange={(value) =>
                  setSelectedCase({
                    ...selectedCase,
                    priority: value,
                  })
                }
              />

              <Field
                label="Investigator"
                value={selectedCase.investigator}
                onChange={(value) =>
                  setSelectedCase({
                    ...selectedCase,
                    investigator: value,
                  })
                }
              />

              <Field
                label="Date opened"
                value={selectedCase.dateOpened}
                onChange={(value) =>
                  setSelectedCase({
                    ...selectedCase,
                    dateOpened: value,
                  })
                }
              />

              <Field
                label="Date closed"
                value={selectedCase.dateClosed}
                onChange={(value) =>
                  setSelectedCase({
                    ...selectedCase,
                    dateClosed: value,
                  })
                }
              />

              <TextAreaField
                label="WHAT happened?"
                value={selectedCase.what}
                onChange={(value) =>
                  setSelectedCase({
                    ...selectedCase,
                    what: value,
                  })
                }
              />

              <TextAreaField
                label="WHO is involved?"
                value={selectedCase.who}
                onChange={(value) =>
                  setSelectedCase({
                    ...selectedCase,
                    who: value,
                  })
                }
              />

              <TextAreaField
                label="WHERE?"
                value={selectedCase.where}
                onChange={(value) =>
                  setSelectedCase({
                    ...selectedCase,
                    where: value,
                  })
                }
              />

              <TextAreaField
                label="WHEN?"
                value={selectedCase.when}
                onChange={(value) =>
                  setSelectedCase({
                    ...selectedCase,
                    when: value,
                  })
                }
              />

              <TextAreaField
                label="HOW?"
                value={selectedCase.how}
                onChange={(value) =>
                  setSelectedCase({
                    ...selectedCase,
                    how: value,
                  })
                }
              />

              <TextAreaField
                label="WHY?"
                value={selectedCase.why}
                onChange={(value) =>
                  setSelectedCase({
                    ...selectedCase,
                    why: value,
                  })
                }
              />

              <TextAreaField
                className="full-width"
                label="Possible motive"
                value={selectedCase.motive}
                onChange={(value) =>
                  setSelectedCase({
                    ...selectedCase,
                    motive: value,
                  })
                }
              />

              <TextAreaField
                className="full-width"
                label="Evidence"
                value={selectedCase.evidence}
                onChange={(value) =>
                  setSelectedCase({
                    ...selectedCase,
                    evidence: value,
                  })
                }
              />

              <TextAreaField
                className="full-width"
                label="Suspects"
                value={selectedCase.suspects.join("\n")}
                onChange={(value) =>
                  setSelectedCase({
                    ...selectedCase,
                    suspects: value
                      .split("\n")
                      .filter(Boolean),
                  })
                }
              />

              <TextAreaField
                className="full-width"
                label="Victims"
                value={selectedCase.victims.join("\n")}
                onChange={(value) =>
                  setSelectedCase({
                    ...selectedCase,
                    victims: value
                      .split("\n")
                      .filter(Boolean),
                  })
                }
              />

              <TextAreaField
                className="full-width"
                label="Witnesses"
                value={selectedCase.witnesses.join("\n")}
                onChange={(value) =>
                  setSelectedCase({
                    ...selectedCase,
                    witnesses: value
                      .split("\n")
                      .filter(Boolean),
                  })
                }
              />

              <TextAreaField
                className="full-width"
                label="Conclusion"
                value={selectedCase.conclusion}
                onChange={(value) =>
                  setSelectedCase({
                    ...selectedCase,
                    conclusion: value,
                  })
                }
              />

              <TextAreaField
                className="full-width"
                label="Additional notes"
                value={selectedCase.notes}
                onChange={(value) =>
                  setSelectedCase({
                    ...selectedCase,
                    notes: value,
                  })
                }
              />
            </div>

            <div className="modal-actions">
              <button
                className="secondary-button"
                onClick={() => {
                  setShowForm(false);
                  setSelectedCase(null);
                }}
              >
                Cancel
              </button>

              <button
                className="primary-button"
                onClick={saveCase}
              >
                Save Case
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="case-grid">
        {investigations.map((caseFile) => (
          <div className="database-card case-card" key={caseFile.id}>
            <div className="card-top">
              <div className="case-number">
                {caseFile.caseNumber}
              </div>

              <div className="card-actions">
                <button
                  className="icon-button"
                  onClick={() => {
                    setSelectedCase(caseFile);
                    setShowForm(true);
                  }}
                >
                  ✎
                </button>

                <button
                  className="icon-button danger"
                  onClick={() =>
                    deleteCase(caseFile.id)
                  }
                >
                  🗑
                </button>
              </div>
            </div>

            <h3>{caseFile.title}</h3>

            <div className="case-meta">
              <span className="small-tag">
                {caseFile.status}
              </span>

              <span className="small-tag">
                {caseFile.priority}
              </span>
            </div>

            <div className="case-summary">
              {caseFile.what && (
                <div>
                  <strong>WHAT</strong>
                  <p>{caseFile.what}</p>
                </div>
              )}

              {caseFile.who && (
                <div>
                  <strong>WHO</strong>
                  <p>{caseFile.who}</p>
                </div>
              )}

              {caseFile.where && (
                <div>
                  <strong>WHERE</strong>
                  <p>{caseFile.where}</p>
                </div>
              )}

              {caseFile.why && (
                <div>
                  <strong>WHY</strong>
                  <p>{caseFile.why}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {investigations.length === 0 && (
          <EmptyState
            icon="🕵"
            title="No investigations"
            text="Create a case to start investigating your fictional world."
            buttonText="+ New Case"
            onClick={createCase}
          />
        )}
      </div>
    </div>
  );
}

// ---------- LORE ----------

function LoreView({
  loreEntries,
  setLoreEntries,
  saveData,
}) {
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const createLore = () => {
    setEditing({
      id: createId(),
      title: "",
      category: "General",
      era: "",
      summary: "",
      content: "",
      importance: "Normal",
      tags: [],
      relatedCharacters: [],
      relatedOrganizations: [],
      relatedCases: [],
    });

    setShowForm(true);
  };

  const saveLore = () => {
    if (!editing.title.trim()) return;

    const exists = loreEntries.some(
      (entry) => entry.id === editing.id
    );

    const updated = exists
      ? loreEntries.map((entry) =>
          entry.id === editing.id ? editing : entry
        )
      : [...loreEntries, editing];

    setLoreEntries(updated);
    saveData("lore", updated);

    setEditing(null);
    setShowForm(false);
  };

  const deleteLore = (id) => {
    if (!window.confirm("Delete this lore entry?")) return;

    const updated = loreEntries.filter(
      (entry) => entry.id !== id
    );

    setLoreEntries(updated);
    saveData("lore", updated);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">WORLD BUILDING</p>
          <h1>Lore</h1>
          <p className="page-description">
            Store history, mythology, events, secrets and world-building
            information.
          </p>
        </div>

        <button className="primary-button" onClick={createLore}>
          + New Lore Entry
        </button>
      </div>

      {showForm && editing && (
        <div className="modal-overlay">
          <div className="modal-card large-modal">
            <div className="modal-header">
              <div>
                <p className="eyebrow">LORE ENTRY</p>
                <h2>{editing.title || "New Lore"}</h2>
              </div>

              <button
                className="icon-button"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="form-grid">
              <Field
                label="Title"
                value={editing.title}
                onChange={(value) =>
                  setEditing({ ...editing, title: value })
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

              <Field
                label="Era / Period"
                value={editing.era}
                onChange={(value) =>
                  setEditing({
                    ...editing,
                    era: value,
                  })
                }
              />

              <SelectField
                label="Importance"
                value={editing.importance}
                options={[
                  "Minor",
                  "Normal",
                  "Important",
                  "Critical",
                  "Secret",
                ]}
                onChange={(value) =>
                  setEditing({
                    ...editing,
                    importance: value,
                  })
                }
              />

              <TextAreaField
                className="full-width"
                label="Summary"
                value={editing.summary}
                onChange={(value) =>
                  setEditing({
                    ...editing,
                    summary: value,
                  })
                }
              />

              <TextAreaField
                className="full-width lore-editor"
                label="Lore"
                value={editing.content}
                onChange={(value) =>
                  setEditing({
                    ...editing,
                    content: value,
                  })
                }
              />

              <Field
                className="full-width"
                label="Tags"
                value={editing.tags.join(", ")}
                onChange={(value) =>
                  setEditing({
                    ...editing,
                    tags: value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>

            <div className="modal-actions">
              <button
                className="secondary-button"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
              >
                Cancel
              </button>

              <button
                className="primary-button"
                onClick={saveLore}
              >
                Save Lore
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="lore-grid">
        {loreEntries.map((entry) => (
          <article className="database-card lore-card" key={entry.id}>
            <div className="card-top">
              <div>
                <span className="small-tag">
                  {entry.category}
                </span>

                <h3>{entry.title}</h3>
              </div>

              <div className="card-actions">
                <button
                  className="icon-button"
                  onClick={() => {
                    setEditing(entry);
                    setShowForm(true);
                  }}
                >
                  ✎
                </button>

                <button
                  className="icon-button danger"
                  onClick={() =>
                    deleteLore(entry.id)
                  }
                >
                  🗑
                </button>
              </div>
            </div>

            {entry.era && (
              <div className="lore-era">
                ⌛ {entry.era}
              </div>
            )}

            {entry.summary && (
              <p className="card-description">
                {entry.summary}
              </p>
            )}

            {entry.content && (
              <div className="lore-preview">
                {entry.content.length > 350
                  ? `${entry.content.substring(0, 350)}…`
                  : entry.content}
              </div>
            )}

            {entry.tags?.length > 0 && (
              <div className="tag-list">
                {entry.tags.map((tag) => (
                  <span className="tag" key={tag}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}

        {loreEntries.length === 0 && (
          <EmptyState
            icon="✦"
            title="The lore is empty"
            text="Start documenting the history of your universe."
            buttonText="+ Add Lore"
            onClick={createLore}
          />
        )}
      </div>
    </div>
  );
}

// ---------- POSTS ----------

function PostsView({
  posts,
  setPosts,
  characters,
  organizations,
  saveData,
}) {
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const createPost = () => {
    setEditing({
      id: createId(),
      title: "",
      content: "",
      author: "",
      date: new Date().toISOString().slice(0, 10),
      category: "General",
      pinned: false,
      tags: [],
      relatedCharacters: [],
      relatedOrganizations: [],
      relatedCases: [],
    });

    setShowForm(true);
  };

  const savePost = () => {
    if (!editing.title.trim()) return;

    const exists = posts.some(
      (post) => post.id === editing.id
    );

    const updated = exists
      ? posts.map((post) =>
          post.id === editing.id ? editing : post
        )
      : [...posts, editing];

    setPosts(updated);
    saveData("posts", updated);

    setEditing(null);
    setShowForm(false);
  };

  const deletePost = (id) => {
    if (!window.confirm("Delete this post?")) return;

    const updated = posts.filter(
      (post) => post.id !== id
    );

    setPosts(updated);
    saveData("posts", updated);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">ARCHIVE</p>
          <h1>Posts</h1>
          <p className="page-description">
            Write notes, theories, announcements, character thoughts and
            world-building posts.
          </p>
        </div>

        <button className="primary-button" onClick={createPost}>
          + New Post
        </button>
      </div>

      {showForm && editing && (
        <div className="modal-overlay">
          <div className="modal-card large-modal">
            <div className="modal-header">
              <div>
                <p className="eyebrow">ARCHIVE POST</p>
                <h2>{editing.title || "New Post"}</h2>
              </div>

              <button
                className="icon-button"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
              >
                ×
              </button>
            </div>

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
                label="Author"
                value={editing.author}
                onChange={(value) =>
                  setEditing({
                    ...editing,
                    author: value,
                  })
                }
              />

              <Field
                label="Date"
                value={editing.date}
                onChange={(value) =>
                  setEditing({
                    ...editing,
                    date: value,
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

              <TextAreaField
                className="full-width post-editor"
                label="Content"
                value={editing.content}
                onChange={(value) =>
                  setEditing({
                    ...editing,
                    content: value,
                  })
                }
              />

              <Field
                className="full-width"
                label="Tags"
                value={editing.tags.join(", ")}
                onChange={(value) =>
                  setEditing({
                    ...editing,
                    tags: value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean),
                  })
                }
              />

              <label className="checkbox-field">
                <input
                  type="checkbox"
                  checked={editing.pinned}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      pinned: event.target.checked,
                    })
                  }
                />
                <span>Pin this post</span>
              </label>
            </div>

            <div className="modal-actions">
              <button
                className="secondary-button"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
              >
                Cancel
              </button>

              <button
                className="primary-button"
                onClick={savePost}
              >
                Save Post
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="posts-list">
        {posts
          .slice()
          .sort((a, b) => Number(b.pinned) - Number(a.pinned))
          .map((post) => (
            <article className="database-card post-card" key={post.id}>
              <div className="card-top">
                <div>
                  {post.pinned && (
                    <span className="pinned-label">
                      ★ PINNED
                    </span>
                  )}

                  <h3>{post.title}</h3>

                  <div className="post-meta">
                    {post.author && <span>by {post.author}</span>}
                    {post.date && <span>{post.date}</span>}
                    {post.category && (
                      <span>{post.category}</span>
                    )}
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    className="icon-button"
                    onClick={() => {
                      setEditing(post);
                      setShowForm(true);
                    }}
                  >
                    ✎
                  </button>

                  <button
                    className="icon-button danger"
                    onClick={() =>
                      deletePost(post.id)
                    }
                  >
                    🗑
                  </button>
                </div>
              </div>

              <p className="post-content">
                {post.content}
              </p>

              {post.tags?.length > 0 && (
                <div className="tag-list">
                  {post.tags.map((tag) => (
                    <span className="tag" key={tag}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}

        {posts.length === 0 && (
          <EmptyState
            icon="✒"
            title="No posts"
            text="Create your first archive entry."
            buttonText="+ New Post"
            onClick={createPost}
          />
        )}
      </div>
    </div>
  );
}

// ---------- RELATIONSHIP VIEW ----------

function RelationshipsView({
  characters,
  setCharacters,
  saveData,
}) {
  const [sourceId, setSourceId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [relationType, setRelationType] = useState("Friend");
  const [description, setDescription] = useState("");

  const relationTypes = [
    "Family",
    "Parent",
    "Child",
    "Sibling",
    "Twin",
    "Partner",
    "Spouse",
    "Ex",
    "Friend",
    "Best Friend",
    "Enemy",
    "Rival",
    "Mentor",
    "Student",
    "Colleague",
    "Acquaintance",
    "Crush",
    "Love Interest",
    "Other",
  ];

  const addRelationship = () => {
    if (!sourceId || !targetId || sourceId === targetId) return;

    const relationship = {
      id: createId(),
      characterId: targetId,
      type: relationType,
      description,
    };

    const updatedCharacters = characters.map((character) => {
      if (character.id !== sourceId) return character;

      return {
        ...character,
        relationships: [
          ...(character.relationships || []),
          relationship,
        ],
      };
    });

    setCharacters(updatedCharacters);
    saveData("characters", updatedCharacters);

    setDescription("");
  };

  const getCharacter = (id) =>
    characters.find((character) => character.id === id);

  const removeRelationship = (characterId, relationshipId) => {
    const updatedCharacters = characters.map((character) => {
      if (character.id !== characterId) return character;

      return {
        ...character,
        relationships: (character.relationships || []).filter(
          (relationship) =>
            relationship.id !== relationshipId
        ),
      };
    });

    setCharacters(updatedCharacters);
    saveData("characters", updatedCharacters);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">CONNECTION DATABASE</p>
          <h1>Relationships</h1>
          <p className="page-description">
            Connect characters directly to family members, friends, enemies,
            partners and rivals.
          </p>
        </div>
      </div>

      <div className="relationship-builder database-card">
        <h2>Connect two characters</h2>

        <div className="form-grid">
          <SelectField
            label="Character"
            value={sourceId}
            options={characters.map(
              (character) =>
                `${character.id}::${getCharacterName(character)}`
            )}
            optionLabels={characters.map((character) =>
              getCharacterName(character)
            )}
            onChange={setSourceId}
          />

          <SelectField
            label="Relationship"
            value={relationType}
            options={relationTypes}
            onChange={setRelationType}
          />

          <SelectField
            label="Connected character"
            value={targetId}
            options={characters.map(
              (character) =>
                `${character.id}::${getCharacterName(character)}`
            )}
            optionLabels={characters.map((character) =>
              getCharacterName(character)
            )}
            onChange={setTargetId}
          />

          <TextAreaField
            className="full-width"
            label="Description"
            value={description}
            onChange={setDescription}
          />
        </div>

        <button
          className="primary-button"
          onClick={addRelationship}
        >
          + Create Relationship
        </button>
      </div>

      <div className="relationship-list">
        {characters.map((character) => {
          const relationships =
            character.relationships || [];

          if (!relationships.length) return null;

          return (
            <div
              className="database-card"
              key={character.id}
            >
              <div className="card-top">
                <div>
                  <p className="eyebrow">CHARACTER</p>
                  <h3>{getCharacterName(character)}</h3>
                </div>
              </div>

              <div className="relationship-items">
                {relationships.map((relationship) => {
                  const target = getCharacter(
                    relationship.characterId
                  );

                  return (
                    <div
                      className="relationship-item"
                      key={relationship.id}
                    >
                      <div className="relationship-line">
                        <strong>
                          {relationship.type}
                        </strong>

                        <span>→</span>

                        <span>
                          {target
                            ? getCharacterName(target)
                            : "Unknown character"}
                        </span>

                        <button
                          className="icon-button danger"
                          onClick={() =>
                            removeRelationship(
                              character.id,
                              relationship.id
                            )
                          }
                        >
                          ×
                        </button>
                      </div>

                      {relationship.description && (
                        <p>
                          {relationship.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- SETTINGS ----------

function SettingsView({
  theme,
  setTheme,
  resetEverything,
  exportDatabase,
  importDatabase,
}) {
  const [importInput, setImportInput] = useState("");

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importInput);

      importDatabase(parsed);
      setImportInput("");

      alert("Database imported successfully.");
    } catch {
      alert("The imported data is not valid JSON.");
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="eyebrow">SYSTEM</p>
          <h1>Settings</h1>
          <p className="page-description">
            Customize OcFiles and manage your local database.
          </p>
        </div>
      </div>

      <div className="settings-grid">
        <section className="database-card">
          <h2>Appearance</h2>

          <p className="card-description">
            Choose the atmosphere of your universe.
          </p>

          <div className="theme-selector">
            {THEMES.map((item) => (
              <button
                key={item.id}
                className={`theme-option ${
                  theme === item.id ? "active" : ""
                }`}
                onClick={() => setTheme(item.id)}
              >
                <span className="theme-option-icon">
                  {item.icon}
                </span>

                <span>
                  <strong>{item.name}</strong>
                  <small>{item.description}</small>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="database-card">
          <h2>Backup</h2>

          <p className="card-description">
            Download a copy of your entire OcFiles database.
          </p>

          <button
            className="primary-button"
            onClick={exportDatabase}
          >
            ↓ Export Database
          </button>
        </section>

        <section className="database-card">
          <h2>Import</h2>

          <p className="card-description">
            Restore a previously exported OcFiles database.
          </p>

          <textarea
            className="input textarea"
            value={importInput}
            onChange={(event) =>
              setImportInput(event.target.value)
            }
            placeholder="Paste exported JSON here..."
          />

          <button
            className="secondary-button"
            onClick={handleImport}
          >
            ↑ Import Database
          </button>
        </section>

        <section className="database-card danger-card">
          <h2>Danger Zone</h2>

          <p className="card-description">
            This will permanently remove all locally saved OcFiles data
            from this browser.
          </p>

          <button
            className="danger-button"
            onClick={resetEverything}
          >
            Delete Local Database
          </button>
        </section>
      </div>
    </div>
  );
}

// ---------- EMPTY STATE ----------

function EmptyState({
  icon,
  title,
  text,
  buttonText,
  onClick,
}) {
  return (
    <div className="empty-state database-card">
      <div className="empty-state-icon">{icon}</div>

      <h2>{title}</h2>

      <p>{text}</p>

      {buttonText && onClick && (
        <button
          className="primary-button"
          onClick={onClick}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}

// ---------- GENERIC FORM COMPONENTS ----------

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  className = "",
}) {
  return (
    <label className={`form-field ${className}`}>
      <span>{label}</span>

      <input
        className="input"
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

function TextAreaField({
  label,
  value,
  onChange,
  placeholder = "",
  className = "",
}) {
  return (
    <label className={`form-field ${className}`}>
      <span>{label}</span>

      <textarea
        className="input textarea"
        value={value ?? ""}
        placeholder={placeholder}
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
  options,
  onChange,
  optionLabels,
}) {
  return (
    <label className="form-field">
      <span>{label}</span>

      <select
        className="input"
        value={value ?? ""}
        onChange={(event) =>
          onChange(event.target.value)
        }
      >
        <option value="">Select...</option>

        {options.map((option, index) => {
          const actualValue = option.includes("::")
            ? option.split("::")[0]
            : option;

          const labelText = optionLabels
            ? optionLabels[index]
            : option.includes("::")
            ? option.split("::")[1]
            : option;

          return (
            <option
              key={option}
              value={actualValue}
            >
              {labelText}
            </option>
          );
        })}
      </select>
    </label>
  );
}

// ---------- IMAGE UPLOAD ----------

function ImageUpload({
  value,
  onChange,
  label = "Upload Picture",
}) {
  const handleFile = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      onChange(reader.result);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="image-upload">
      <span className="form-label">{label}</span>

      <label className="upload-box">
        {value ? (
          <img
            src={value}
            alt="Uploaded"
            className="uploaded-image"
          />
        ) : (
          <>
            <span className="upload-icon">＋</span>
            <span>Choose image</span>
          </>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          hidden
        />
      </label>

      {value && (
        <button
          className="secondary-button small-button"
          onClick={() => onChange("")}
        >
          Remove image
        </button>
      )}
    </div>
  );
}

// ---------- MOODBOARD ----------

function Moodboard({
  images,
  setImages,
  saveData,
}) {
  const uploadMoodboardImage = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const newImage = {
        id: createId(),
        src: reader.result,
        caption: "",
      };

      const updated = [...images, newImage];

      setImages(updated);
      saveData("moodboard", updated);
    };

    reader.readAsDataURL(file);
  };

  const removeImage = (id) => {
    const updated = images.filter(
      (image) => image.id !== id
    );

    setImages(updated);
    saveData("moodboard", updated);
  };

  return (
    <section className="moodboard-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">VISUAL REFERENCES</p>
          <h2>Mood Board</h2>
        </div>

        <label className="primary-button upload-button">
          + Add Image
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={uploadMoodboardImage}
          />
        </label>
      </div>

      <div className="moodboard-grid">
        {images.map((image) => (
          <div
            className="moodboard-image"
            key={image.id}
          >
            <img src={image.src} alt="" />

            <button
              className="moodboard-delete"
              onClick={() =>
                removeImage(image.id)
              }
            >
              ×
            </button>
          </div>
        ))}

        {images.length === 0 && (
          <div className="moodboard-empty">
            <span>✦</span>
            <p>Your mood board is empty.</p>
          </div>
        )}
      </div>
    </section>
  );
}

// ---------- DATABASE SEARCH ----------

function SearchResults({
  query,
  characters,
  organizations,
  investigations,
  loreEntries,
  posts,
  onCharacter,
}) {
  if (!query.trim()) return null;

  const normalized = query.toLowerCase();

  const characterResults = characters.filter((character) =>
    JSON.stringify(character)
      .toLowerCase()
      .includes(normalized)
  );

  const organizationResults = organizations.filter((organization) =>
    JSON.stringify(organization)
      .toLowerCase()
      .includes(normalized)
  );

  const caseResults = investigations.filter((item) =>
    JSON.stringify(item)
      .toLowerCase()
      .includes(normalized)
  );

  const loreResults = loreEntries.filter((item) =>
    JSON.stringify(item)
      .toLowerCase()
      .includes(normalized)
  );

  const postResults = posts.filter((item) =>
    JSON.stringify(item)
      .toLowerCase()
      .includes(normalized)
  );

  const total =
    characterResults.length +
    organizationResults.length +
    caseResults.length +
    loreResults.length +
    postResults.length;

  return (
    <div className="search-results-panel">
      <div className="search-results-header">
        <strong>Search results</strong>
        <span>{total}</span>
      </div>

      {total === 0 && (
        <div className="search-empty">
          Nothing found for "{query}".
        </div>
      )}

      {characterResults.length > 0 && (
        <div className="search-group">
          <span className="search-group-title">
            Characters
          </span>

          {characterResults.slice(0, 5).map((character) => (
            <button
              className="search-result"
              key={character.id}
              onClick={() =>
                onCharacter(character.id)
              }
            >
              <span>♟</span>
              <strong>
                {getCharacterName(character)}
              </strong>
            </button>
          ))}
        </div>
      )}

      {organizationResults.length > 0 && (
        <div className="search-group">
          <span className="search-group-title">
            Organizations
          </span>

          {organizationResults.slice(0, 5).map((organization) => (
            <div
              className="search-result"
              key={organization.id}
            >
              <span>♜</span>
              <strong>{organization.name}</strong>
            </div>
          ))}
        </div>
      )}

      {caseResults.length > 0 && (
        <div className="search-group">
          <span className="search-group-title">
            Investigations
          </span>

          {caseResults.slice(0, 5).map((item) => (
            <div
              className="search-result"
              key={item.id}
            >
              <span>🕵</span>
              <strong>{item.title}</strong>
            </div>
          ))}
        </div>
      )}

      {loreResults.length > 0 && (
        <div className="search-group">
          <span className="search-group-title">
            Lore
          </span>

          {loreResults.slice(0, 5).map((item) => (
            <div
              className="search-result"
              key={item.id}
            >
              <span>✦</span>
              <strong>{item.title}</strong>
            </div>
          ))}
        </div>
      )}

      {postResults.length > 0 && (
        <div className="search-group">
          <span className="search-group-title">
            Posts
          </span>

          {postResults.slice(0, 5).map((item) => (
            <div
              className="search-result"
              key={item.id}
            >
              <span>✒</span>
              <strong>{item.title}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- TOAST ----------

function Toast({
  message,
  type = "success",
  onClose,
}) {
  if (!message) return null;

  return (
    <div className={`toast toast-${type}`}>
      <span>
        {type === "success"
          ? "✓"
          : type === "error"
          ? "!"
          : "✦"}
      </span>

      <p>{message}</p>

      <button onClick={onClose}>×</button>
    </div>
  );
}

// ---------- CONFIRM DIALOG ----------

function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card confirm-modal">
        <div className="confirm-icon">!</div>

        <h2>{title}</h2>

        <p>{message}</p>

        <div className="modal-actions">
          <button
            className="secondary-button"
            onClick={onCancel}
          >
            {cancelText}
          </button>

          <button
            className="danger-button"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- APP ERROR BOUNDARY ----------

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, info) {
    console.error(
      "OcFiles error:",
      error,
      info
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fatal-error-screen">
          <div className="fatal-error-card">
            <div className="fatal-error-symbol">
              ☠
            </div>

            <p className="eyebrow">
              OCFILES SYSTEM ERROR
            </p>

            <h1>Something went wrong.</h1>

            <p>
              OcFiles encountered an unexpected error.
              Your locally saved data should remain intact.
            </p>

            <details>
              <summary>Technical information</summary>

              <pre>
                {this.state.error?.stack ||
                  String(this.state.error)}
              </pre>
            </details>

            <button
              className="primary-button"
              onClick={() =>
                window.location.reload()
              }
            >
              Reload OcFiles
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ---------- EXPORT DEFAULT ----------

export default function App() {
  return (
    <AppErrorBoundary>
      <OcFilesApp />
    </AppErrorBoundary>
  );
}
