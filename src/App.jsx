import React, { useEffect, useMemo, useState } from "react";
import { THEMES, DEFAULT_THEME, applyTheme } from "./themes.jsx";

/* =========================================================
   OCFILES
   A self-contained local-first OC / Lore / Investigation app
   ========================================================= */

const STORAGE_KEY = "ocfiles_database_v1";
const SESSION_KEY = "ocfiles_session_v1";
const THEME_KEY = "ocfiles_theme_v1";

/* ---------------------------------------------------------
   Utilities
   --------------------------------------------------------- */

function uid(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function now() {
  return new Date().toISOString();
}

function safeParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function loadDatabase() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return createInitialDatabase();
  }

  const parsed = safeParse(raw, null);

  if (!parsed) {
    return createInitialDatabase();
  }

  return normalizeDatabase(parsed);
}

function saveDatabase(database) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
}

function createInitialDatabase() {
  return {
    characters: [],
    organizations: [],
    branches: [],
    investigations: [],
    lore: [],
    posts: [],
    notes: [],
    settings: {
      createdAt: now(),
      updatedAt: now()
    }
  };
}

function normalizeDatabase(db) {
  return {
    characters: Array.isArray(db.characters) ? db.characters : [],
    organizations: Array.isArray(db.organizations) ? db.organizations : [],
    branches: Array.isArray(db.branches) ? db.branches : [],
    investigations: Array.isArray(db.investigations) ? db.investigations : [],
    lore: Array.isArray(db.lore) ? db.lore : [],
    posts: Array.isArray(db.posts) ? db.posts : [],
    notes: Array.isArray(db.notes) ? db.notes : [],
    settings: {
      ...(db.settings || {}),
      updatedAt: now()
    }
  };
}

function blankCharacter() {
  return {
    id: uid("character"),

    name: "",
    lastName: "",
    nickname: "",
    pronouns: "",
    gender: "",
    sexuality: "",
    dateOfBirth: "",
    age: "",
    nationality: "",
    origins: "",
    species: "",
    height: "",
    weight: "",

    status: "Alive",
    laterStatus: "",

    affiliation: "",
    pastAffiliation: "",
    organizationIds: [],
    branchIds: [],

    rank: "",
    pastRank: "",

    job: "",
    sideJob: "",

    mbti: "",

    abilities: "",
    abilityEffects: "",
    weapons: "",

    fears: "",
    sickness: "",
    addictions: "",

    hairColor: "",
    hairStyle: "",
    eyeColor: "",

    picture: "",
    moodboard: [],

    likes: "",
    dislikes: "",

    anecdotes: "",
    quotes: "",
    songs: "",
    lyrics: "",

    family: [],
    friends: [],
    pets: [],

    personality: {
      niceMean: 50,
      braveCoward: 50,
      pacifistViolent: 50,
      thoughtfulImpulsive: 50,
      agreeableContrary: 50,
      idealisticPragmatic: 50,
      frugalSpender: 50,
      collectedWild: 50,
      honestDeceptive: 50,
      politeRude: 50,
      smartIdiot: 50,
      confidentInsecure: 50,
      calmAnxious: 50,
      patientImpatient: 50,
      gullibleSkeptical: 50,
      reservedFlirty: 50
    },

    skills: {
      perception: 3,
      communication: 3,
      persuasion: 3,
      mediation: 3,
      literacy: 3,
      creativity: 3,
      cooking: 3,
      techSavvy: 3,
      combat: 3,
      survival: 3,
      stealth: 3,
      streetSmarts: 3,
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

    createdAt: now(),
    updatedAt: now()
  };
}

function blankOrganization() {
  return {
    id: uid("organization"),
    name: "",
    description: "",
    type: "",
    leader: "",
    status: "Active",
    colors: "",
    headquarters: "",
    purpose: "",
    members: [],
    branchIds: [],
    createdAt: now(),
    updatedAt: now()
  };
}

function blankBranch() {
  return {
    id: uid("branch"),
    organizationId: "",
    name: "",
    description: "",
    leader: "",
    location: "",
    status: "Active",
    members: [],
    createdAt: now(),
    updatedAt: now()
  };
}

function blankInvestigation() {
  return {
    id: uid("case"),
    title: "",
    caseNumber: "",
    status: "Open",
    priority: "Medium",
    date: "",
    location: "",
    what: "",
    who: "",
    how: "",
    why: "",
    when: "",
    where: "",
    motive: "",
    evidence: "",
    clues: "",
    suspects: "",
    victims: "",
    witnesses: "",
    solution: "",
    notes: "",
    characterIds: [],
    organizationIds: [],
    createdAt: now(),
    updatedAt: now()
  };
}

function blankLore() {
  return {
    id: uid("lore"),
    title: "",
    category: "General",
    summary: "",
    content: "",
    era: "",
    location: "",
    characterIds: [],
    organizationIds: [],
    createdAt: now(),
    updatedAt: now()
  };
}

function blankPost() {
  return {
    id: uid("post"),
    title: "",
    content: "",
    category: "General",
    characterIds: [],
    organizationIds: [],
    createdAt: now(),
    updatedAt: now()
  };
}

/* ---------------------------------------------------------
   App
   --------------------------------------------------------- */

export default function App() {
  const [database, setDatabase] = useState(loadDatabase);
  const [themeId, setThemeId] = useState(
    localStorage.getItem(THEME_KEY) || DEFAULT_THEME
  );

  const [session, setSession] = useState(() =>
    safeParse(localStorage.getItem(SESSION_KEY), null)
  );

  const [page, setPage] = useState("dashboard");
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    applyTheme(themeId);
    localStorage.setItem(THEME_KEY, themeId);
  }, [themeId]);

  useEffect(() => {
    saveDatabase(database);
  }, [database]);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), 2800);

    return () => clearTimeout(timer);
  }, [toast]);

  function notify(message, type = "success") {
    setToast({ message, type });
  }

  function updateDatabase(updater) {
    setDatabase((previous) => {
      const next =
        typeof updater === "function" ? updater(previous) : updater;

      next.settings = {
        ...(next.settings || {}),
        updatedAt: now()
      };

      return next;
    });
  }

  function navigate(nextPage, id = null) {
    setPage(nextPage);
    setSelectedId(id);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteItem(collection, id) {
    const item = database[collection]?.find((entry) => entry.id === id);

    if (!item) return;

    const confirmed = window.confirm(
      `Delete "${item.name || item.title || "this item"}"? This cannot be undone.`
    );

    if (!confirmed) return;

    updateDatabase((db) => ({
      ...db,
      [collection]: db[collection].filter((entry) => entry.id !== id)
    }));

    setSelectedId(null);
    notify("Deleted successfully.", "success");
  }

  function exportDatabase() {
    const blob = new Blob([JSON.stringify(database, null, 2)], {
      type: "application/json"
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "OcFiles-backup.json";
    anchor.click();

    URL.revokeObjectURL(url);

    notify("Backup exported.");
  }

  function importDatabase(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const imported = safeParse(reader.result, null);

      if (!imported) {
        notify("This file is not a valid OCFiles backup.", "error");
        return;
      }

      const normalized = normalizeDatabase(imported);

      updateDatabase(normalized);
      notify("Backup imported successfully.");
    };

    reader.readAsText(file);
    event.target.value = "";
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    navigate("dashboard");
  }

  const counts = {
    characters: database.characters.length,
    organizations: database.organizations.length,
    branches: database.branches.length,
    investigations: database.investigations.length,
    lore: database.lore.length,
    posts: database.posts.length
  };

  if (!session) {
    return (
      <>
        <AuthScreen
          onLogin={(user) => {
            localStorage.setItem(SESSION_KEY, JSON.stringify(user));
            setSession(user);
            notify("Welcome back.");
          }}
        />

        {toast && <Toast {...toast} />}
      </>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        page={page}
        navigate={navigate}
        open={sidebarOpen}
        close={() => setSidebarOpen(false)}
        themeId={themeId}
        setThemeId={setThemeId}
        logout={logout}
      />

      <main className="main-content">
        <Topbar
          page={page}
          search={search}
          setSearch={setSearch}
          onMenu={() => setSidebarOpen(true)}
          onExport={exportDatabase}
          onImport={importDatabase}
        />

        <div className="page-container">
          {page === "dashboard" && (
            <Dashboard
              database={database}
              counts={counts}
              navigate={navigate}
              themeId={themeId}
            />
          )}

          {page === "characters" && (
            <CharactersPage
              database={database}
              updateDatabase={updateDatabase}
              search={search}
              selectedId={selectedId}
              navigate={navigate}
              deleteItem={deleteItem}
              notify={notify}
            />
          )}

          {page === "organizations" && (
            <OrganizationsPage
              database={database}
              updateDatabase={updateDatabase}
              search={search}
              selectedId={selectedId}
              navigate={navigate}
              deleteItem={deleteItem}
              notify={notify}
            />
          )}

          {page === "branches" && (
            <BranchesPage
              database={database}
              updateDatabase={updateDatabase}
              search={search}
              selectedId={selectedId}
              navigate={navigate}
              deleteItem={deleteItem}
              notify={notify}
            />
          )}

          {page === "investigations" && (
            <InvestigationsPage
              database={database}
              updateDatabase={updateDatabase}
              search={search}
              selectedId={selectedId}
              navigate={navigate}
              deleteItem={deleteItem}
              notify={notify}
            />
          )}

          {page === "lore" && (
            <LorePage
              database={database}
              updateDatabase={updateDatabase}
              search={search}
              selectedId={selectedId}
              navigate={navigate}
              deleteItem={deleteItem}
              notify={notify}
            />
          )}

          {page === "posts" && (
            <PostsPage
              database={database}
              updateDatabase={updateDatabase}
              search={search}
              selectedId={selectedId}
              navigate={navigate}
              deleteItem={deleteItem}
              notify={notify}
            />
          )}

          {page === "settings" && (
            <SettingsPage
              themeId={themeId}
              setThemeId={setThemeId}
              exportDatabase={exportDatabase}
              importDatabase={importDatabase}
              database={database}
              updateDatabase={updateDatabase}
              notify={notify}
            />
          )}
        </div>
      </main>

      {toast && <Toast {...toast} />}
    </div>
  );
}

/* ---------------------------------------------------------
   Authentication
   --------------------------------------------------------- */

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("Please fill in both fields.");
      return;
    }

    const stored = safeParse(
      localStorage.getItem("ocfiles_user_v1"),
      null
    );

    if (mode === "register") {
      if (stored) {
        setError(
          "An account already exists on this browser. Use Log in."
        );
        return;
      }

      const user = {
        username: username.trim(),
        password,
        createdAt: now()
      };

      localStorage.setItem(
        "ocfiles_user_v1",
        JSON.stringify(user)
      );

      onLogin({
        username: user.username,
        loggedAt: now()
      });

      return;
    }

    if (!stored) {
      setError("No local account exists yet. Choose Register.");
      return;
    }

    if (
      stored.username !== username.trim() ||
      stored.password !== password
    ) {
      setError("Incorrect username or password.");
      return;
    }

    onLogin({
      username: stored.username,
      loggedAt: now()
    });
  }

  return (
    <div className="auth-screen">
      <div className="auth-orbit orbit-one" />
      <div className="auth-orbit orbit-two" />

      <div className="auth-card">
        <div className="brand-mark large">OC</div>

        <p className="eyebrow">PERSONAL CHARACTER ARCHIVE</p>

        <h1>OcFiles</h1>

        <p className="auth-subtitle">
          Your characters, organizations, lore and investigations.
          All stored locally in your browser.
        </p>

        <div className="auth-tabs">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => {
              setMode("login");
              setError("");
            }}
          >
            Log in
          </button>

          <button
            className={mode === "register" ? "active" : ""}
            onClick={() => {
              setMode("register");
              setError("");
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={submit}>
          <Field
            label="Username"
            value={username}
            onChange={setUsername}
            placeholder="Your archive name"
          />

          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Your password"
          />

          {error && <div className="form-error">{error}</div>}

          <button className="primary-button full" type="submit">
            {mode === "login" ? "Enter the archive" : "Create archive"}
          </button>
        </form>

        <p className="auth-note">
          This is a local personal login. No information is sent to a
          server.
        </p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Layout
   --------------------------------------------------------- */

function Sidebar({
  page,
  navigate,
  open,
  close,
  themeId,
  setThemeId,
  logout
}) {
  const groups = [
    {
      title: "Archive",
      items: [
        ["dashboard", "⌂", "Dashboard"],
        ["characters", "♙", "Characters"],
        ["organizations", "♜", "Organizations"],
        ["branches", "⌘", "Branches"]
      ]
    },
    {
      title: "World",
      items: [
        ["lore", "◈", "Lore"],
        ["investigations", "♧", "Investigations"],
        ["posts", "✦", "Posts"]
      ]
    }
  ];

  return (
    <>
      {open && (
        <div className="mobile-overlay" onClick={close} />
      )}

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-header">
          <button
            className="brand"
            onClick={() => navigate("dashboard")}
          >
            <span className="brand-mark">OC</span>

            <span>
              <strong>OcFiles</strong>
              <small>personal archive</small>
            </span>
          </button>

          <button
            className="mobile-close"
            onClick={close}
          >
            ×
          </button>
        </div>

        <div className="theme-mini">
          <span>{THEMES[themeId]?.icon}</span>
          <select
            value={themeId}
            onChange={(event) =>
              setThemeId(event.target.value)
            }
          >
            {Object.values(THEMES).map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.name}
              </option>
            ))}
          </select>
        </div>

        <nav className="sidebar-nav">
          {groups.map((group) => (
            <div className="nav-group" key={group.title}>
              <div className="nav-label">{group.title}</div>

              {group.items.map(([id, icon, label]) => (
                <button
                  key={id}
                  className={`nav-item ${
                    page === id ? "active" : ""
                  }`}
                  onClick={() => navigate(id)}
                >
                  <span className="nav-icon">{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          ))}

          <div className="nav-group">
            <div className="nav-label">System</div>

            <button
              className={`nav-item ${
                page === "settings" ? "active" : ""
              }`}
              onClick={() => navigate("settings")}
            >
              <span className="nav-icon">⚙</span>
              <span>Settings</span>
            </button>
          </div>
        </nav>

        <div className="sidebar-bottom">
          <div className="storage-status">
            <span className="status-dot" />
            <div>
              <strong>Local archive</strong>
              <small>Auto-saving enabled</small>
            </div>
          </div>

          <button className="logout-button" onClick={logout}>
            ↪ Log out
          </button>
        </div>
      </aside>
    </>
  );
}

function Topbar({
  page,
  search,
  setSearch,
  onMenu,
  onExport,
  onImport
}) {
  const titles = {
    dashboard: ["Dashboard", "Your personal OC archive"],
    characters: ["Characters", "Build and manage your cast"],
    organizations: ["Organizations", "Groups, factions and affiliations"],
    branches: ["Branches", "Connect branches to organizations"],
    investigations: ["Investigations", "Detective cases and evidence"],
    lore: ["Lore", "Build your universe"],
    posts: ["Posts", "Notes, scenes and world entries"],
    settings: ["Settings", "Archive configuration"]
  };

  const [title, subtitle] =
    titles[page] || titles.dashboard;

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-button" onClick={onMenu}>
          ☰
        </button>

        <div>
          <h2>{title}</h2>
          <span>{subtitle}</span>
        </div>
      </div>

      <div className="topbar-actions">
        <div className="global-search">
          <span>⌕</span>
          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search archive..."
          />

          {search && (
            <button onClick={() => setSearch("")}>
              ×
            </button>
          )}
        </div>

        <button
          className="icon-button"
          title="Export backup"
          onClick={onExport}
        >
          ↓
        </button>

        <label
          className="icon-button"
          title="Import backup"
        >
          ↑
          <input
            type="file"
            accept=".json,application/json"
            onChange={onImport}
            hidden
          />
        </label>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------
   Dashboard
   --------------------------------------------------------- */

function Dashboard({
  database,
  counts,
  navigate,
  themeId
}) {
  const recentCharacters = [...database.characters]
    .sort((a, b) =>
      (b.updatedAt || "").localeCompare(a.updatedAt || "")
    )
    .slice(0, 6);

  const recentCases = [...database.investigations]
    .sort((a, b) =>
      (b.updatedAt || "").localeCompare(a.updatedAt || "")
    )
    .slice(0, 4);

  return (
    <div className="dashboard">
      <section className="hero-panel">
        <div className="hero-pattern" />

        <div className="hero-content">
          <span className="eyebrow">
            {THEMES[themeId].icon} {THEMES[themeId].name} archive
          </span>

          <h1>
            Welcome to your
            <br />
            <em>OC universe.</em>
          </h1>

          <p>
            Build characters, connect their relationships,
            investigate mysteries and keep your entire fictional
            world in one place.
          </p>

          <div className="hero-actions">
            <button
              className="primary-button"
              onClick={() => navigate("characters")}
            >
              + Create character
            </button>

            <button
              className="secondary-button"
              onClick={() => navigate("investigations")}
            >
              Open investigations
            </button>
          </div>
        </div>

        <div className="hero-symbol">✦</div>
      </section>

      <section className="stats-grid">
        <StatCard
          icon="♙"
          label="Characters"
          value={counts.characters}
          onClick={() => navigate("characters")}
        />

        <StatCard
          icon="♜"
          label="Organizations"
          value={counts.organizations}
          onClick={() => navigate("organizations")}
        />

        <StatCard
          icon="♧"
          label="Cases"
          value={counts.investigations}
          onClick={() => navigate("investigations")}
        />

        <StatCard
          icon="◈"
          label="Lore entries"
          value={counts.lore}
          onClick={() => navigate("lore")}
        />
      </section>

      <div className="dashboard-grid">
        <section className="panel">
          <PanelHeader
            title="Recent characters"
            action="View all"
            onAction={() => navigate("characters")}
          />

          {recentCharacters.length === 0 ? (
            <EmptyState
              icon="♙"
              title="Your archive is empty"
              text="Create your first character to start building your universe."
              action="Create character"
              onAction={() => navigate("characters")}
            />
          ) : (
            <div className="mini-character-list">
              {recentCharacters.map((character) => (
                <button
                  className="mini-character"
                  key={character.id}
                  onClick={() =>
                    navigate("characters", character.id)
                  }
                >
                  <Avatar character={character} />

                  <div>
                    <strong>
                      {character.name || "Unnamed character"}{" "}
                      {character.lastName}
                    </strong>

                    <span>
                      {character.nickname ||
                        character.job ||
                        "No description"}
                    </span>
                  </div>

                  <span className="mini-arrow">›</span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <PanelHeader
            title="Open cases"
            action="View cases"
            onAction={() => navigate("investigations")}
          />

          {recentCases.length === 0 ? (
            <EmptyState
              icon="♧"
              title="No investigations"
              text="Create detective cases, suspects, clues and evidence."
              action="New case"
              onAction={() => navigate("investigations")}
            />
          ) : (
            <div className="case-list">
              {recentCases.map((item) => (
                <button
                  className="case-row"
                  key={item.id}
                  onClick={() =>
                    navigate("investigations", item.id)
                  }
                >
                  <span className="case-number">
                    {item.caseNumber || "CASE"}
                  </span>

                  <div>
                    <strong>
                      {item.title || "Untitled case"}
                    </strong>

                    <span>
                      {item.location || "Unknown location"}
                    </span>
                  </div>

                  <StatusBadge status={item.status} />
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="quick-grid">
        <QuickAction
          icon="♙"
          title="Character"
          text="Full profile, skills, relationships, moodboard and lore."
          onClick={() => navigate("characters")}
        />

        <QuickAction
          icon="♜"
          title="Organization"
          text="Create factions and connect their members and branches."
          onClick={() => navigate("organizations")}
        />

        <QuickAction
          icon="♧"
          title="Investigation"
          text="Track what, who, how, why, clues, suspects and evidence."
          onClick={() => navigate("investigations")}
        />

        <QuickAction
          icon="◈"
          title="Lore"
          text="Keep your world history, locations, events and mythology."
          onClick={() => navigate("lore")}
        />
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, onClick }) {
  return (
    <button className="stat-card" onClick={onClick}>
      <span className="stat-icon">{icon}</span>

      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>

      <span className="stat-arrow">↗</span>
    </button>
  );
}

function QuickAction({ icon, title, text, onClick }) {
  return (
    <button className="quick-action" onClick={onClick}>
      <span className="quick-icon">{icon}</span>

      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>

      <span>→</span>
    </button>
  );
}

/* ---------------------------------------------------------
   Characters
   --------------------------------------------------------- */

function CharactersPage({
  database,
  updateDatabase,
  search,
  selectedId,
  navigate,
  deleteItem,
  notify
}) {
  const selected = database.characters.find(
    (item) => item.id === selectedId
  );

  const filtered = database.characters.filter((character) => {
    const haystack = [
      character.name,
      character.lastName,
      character.nickname,
      character.job,
      character.affiliation,
      character.nationality,
      character.species
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(search.toLowerCase());
  });

  if (selected) {
    return (
      <CharacterEditor
        character={selected}
        database={database}
        updateDatabase={updateDatabase}
        navigate={navigate}
        deleteItem={deleteItem}
        notify={notify}
      />
    );
  }

  return (
    <div>
      <PageHeading
        eyebrow="CHARACTER ARCHIVE"
        title="Characters"
        description={`${database.characters.length} character${
          database.characters.length === 1 ? "" : "s"
        } in your archive.`}
        action="+ New character"
        onAction={() => {
          const character = blankCharacter();

          updateDatabase((db) => ({
            ...db,
            characters: [character, ...db.characters]
          }));

          navigate("characters", character.id);
        }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          large
          icon="♙"
          title={
            search
              ? "No characters found"
              : "Create your first character"
          }
          text={
            search
              ? "Try another search term."
              : "Every character can have abilities, relationships, organizations, lore, songs, quotes and much more."
          }
          action={search ? null : "Create character"}
          onAction={() => {
            const character = blankCharacter();

            updateDatabase((db) => ({
              ...db,
              characters: [character, ...db.characters]
            }));

            navigate("characters", character.id);
          }}
        />
      ) : (
        <div className="character-grid">
          {filtered.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              database={database}
              onClick={() =>
                navigate("characters", character.id)
              }
              onDelete={() =>
                deleteItem("characters", character.id)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CharacterCard({
  character,
  database,
  onClick,
  onDelete
}) {
  const organizations = (character.organizationIds || [])
    .map((id) =>
      database.organizations.find(
        (organization) => organization.id === id
      )
    )
    .filter(Boolean);

  return (
    <article className="character-card">
      <button className="character-card-main" onClick={onClick}>
        <div className="character-image">
          {character.picture ? (
            <img
              src={character.picture}
              alt={character.name}
            />
          ) : (
            <div className="avatar-placeholder">
              {(character.name || "?")
                .charAt(0)
                .toUpperCase()}
            </div>
          )}

          <span className="status-dot-card" />
        </div>

        <div className="character-card-info">
          <span className="card-eyebrow">
            {character.species || "Character"}
          </span>

          <h3>
            {character.name || "Unnamed"}{" "}
            {character.lastName}
          </h3>

          <p>
            {character.nickname
              ? `"${character.nickname}"`
              : character.job || "No job defined"}
          </p>

          <div className="card-tags">
            {character.mbti && (
              <span>{character.mbti}</span>
            )}

            {character.rank && (
              <span>{character.rank}</span>
            )}

            <span>{character.status}</span>
          </div>

          {organizations.length > 0 && (
            <div className="relation-preview">
              {organizations.slice(0, 2).map((organization) => (
                <span key={organization.id}>
                  ♜ {organization.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </button>

      <div className="card-footer">
        <span>
          {character.updatedAt
            ? formatDate(character.updatedAt)
            : ""}
        </span>

        <button
          className="danger-text-button"
          onClick={onDelete}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

/* ---------------------------------------------------------
   Character editor
   --------------------------------------------------------- */

function CharacterEditor({
  character,
  database,
  updateDatabase,
  navigate,
  deleteItem,
  notify
}) {
  const [form, setForm] = useState(character);

  useEffect(() => {
    setForm(character);
  }, [character.id]);

  function update(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value
    }));
  }

  function updateNested(group, field, value) {
    setForm((previous) => ({
      ...previous,
      [group]: {
        ...previous[group],
        [field]: value
      }
    }));
  }

  function save() {
    const updated = {
      ...form,
      updatedAt: now()
    };

    updateDatabase((db) => ({
      ...db,
      characters: db.characters.map((item) =>
        item.id === form.id ? updated : item
      )
    }));

    notify("Character saved.");
  }

  function addMoodboardImage() {
    const url = window.prompt(
      "Paste an image URL for the moodboard:"
    );

    if (!url) return;

    update("moodboard", [
      ...(form.moodboard || []),
      {
        id: uid("mood"),
        url
      }
    ]);
  }

  function removeMoodboardImage(id) {
    update(
      "moodboard",
      (form.moodboard || []).filter((item) => item.id !== id)
    );
  }

  function addRelationship(type) {
    const name = window.prompt(
      `Name of ${type === "family" ? "family member" : type}:`
    );

    if (!name?.trim()) return;

    const relationship = {
      id: uid(type),
      name: name.trim(),
      relation: ""
    };

    update(type, [
      ...(form[type] || []),
      relationship
    ]);
  }

  function removeRelationship(type, id) {
    update(
      type,
      (form[type] || []).filter((item) => item.id !== id)
    );
  }

  function uploadImage(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify("Please select an image.", "error");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      update("picture", reader.result);
      notify("Picture added. Save the character to keep it.");
    };

    reader.readAsDataURL(file);
  }

  return (
    <div className="editor-page">
      <div className="editor-top">
        <button
          className="back-button"
          onClick={() => navigate("characters")}
        >
          ← Characters
        </button>

        <div className="editor-actions">
          <button
            className="secondary-button"
            onClick={() =>
              deleteItem("characters", form.id)
            }
          >
            Delete
          </button>

          <button
            className="primary-button"
            onClick={save}
          >
            Save character
          </button>
        </div>
      </div>

      <section className="character-cover">
        <div className="cover-glow" />

        <div className="large-character-image">
          {form.picture ? (
            <img src={form.picture} alt="" />
          ) : (
            <div className="large-avatar">
              {(form.name || "?")
                .charAt(0)
                .toUpperCase()}
            </div>
          )}

          <label className="image-upload-button">
            📷
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={uploadImage}
            />
          </label>
        </div>

        <div className="cover-info">
          <span className="eyebrow">
            CHARACTER FILE
          </span>

          <input
            className="title-input"
            value={form.name}
            onChange={(event) =>
              update("name", event.target.value)
            }
            placeholder="Character name"
          />

          <input
            className="subtitle-input"
            value={form.lastName}
            onChange={(event) =>
              update("lastName", event.target.value)
            }
            placeholder="Last name"
          />

          <div className="cover-tags">
            <StatusBadge status={form.status} />

            {form.mbti && (
              <span className="tag">
                {form.mbti}
              </span>
            )}

            {form.species && (
              <span className="tag">
                {form.species}
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="editor-grid">
        <div className="editor-main">
          <EditorSection
            icon="♙"
            title="Identity"
            description="The basic information of the character."
          >
            <div className="form-grid three">
              <Field
                label="Name"
                value={form.name}
                onChange={(value) => update("name", value)}
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
                value={form.nickname}
                onChange={(value) =>
                  update("nickname", value)
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
                label="Date of birth"
                type="date"
                value={form.dateOfBirth}
                onChange={(value) =>
                  update("dateOfBirth", value)
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
                label="MBTI"
                value={form.mbti}
                onChange={(value) =>
                  update("mbti", value)
                }
              />

              <Field
                label="Nationality"
                value={form.nationality}
                onChange={(value) =>
                  update("nationality", value)
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
            </div>
          </EditorSection>

          <EditorSection
            icon="⚔"
            title="Role & abilities"
            description="Combat identity, abilities and their consequences."
          >
            <div className="form-grid two">
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
                  update("pastRank", value)
                }
              />

              <Field
                label="Weapon(s)"
                value={form.weapons}
                onChange={(value) =>
                  update("weapons", value)
                }
              />

              <Field
                label="Past affiliation"
                value={form.pastAffiliation}
                onChange={(value) =>
                  update("pastAffiliation", value)
                }
              />
            </div>

            <Field
              label="Abilities"
              textarea
              value={form.abilities}
              onChange={(value) =>
                update("abilities", value)
              }
              placeholder="Describe powers, techniques, talents..."
            />

            <Field
              label="Effects of abilities"
              textarea
              value={form.abilityEffects}
              onChange={(value) =>
                update("abilityEffects", value)
              }
              placeholder="Side effects, limits, consequences, weaknesses..."
            />
          </EditorSection>

          <EditorSection
            icon="◉"
            title="Physical appearance"
            description="Visual references and physical details."
          >
            <div className="form-grid four">
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
            </div>

            <Field
              label="Hair style"
              textarea
              value={form.hairStyle}
              onChange={(value) =>
                update("hairStyle", value)
              }
            />
          </EditorSection>

          <EditorSection
            icon="☾"
            title="Personality"
            description="Drag the sliders to position the character."
          >
            <PersonalitySliders
              personality={form.personality}
              update={(key, value) =>
                updateNested("personality", key, value)
              }
            />
          </EditorSection>

          <EditorSection
            icon="★"
            title="Skills"
            description="Five-level skill ratings."
          >
            <SkillGrid
              values={form.skills}
              update={(key, value) =>
                updateNested("skills", key, value)
              }
            />
          </EditorSection>

          <EditorSection
            icon="♥"
            title="Social profile"
            description="Social attributes and tendencies."
          >
            <SkillGrid
              values={form.socials}
              update={(key, value) =>
                updateNested("socials", key, value)
              }
              labels={{
                charisma: "Charisma",
                empathy: "Empathy",
                generosity: "Generosity",
                wealth: "Wealth",
                aggression: "Aggression",
                libido: "Libido"
              }}
            />
          </EditorSection>

          <EditorSection
            icon="☠"
            title="Mental & personal"
            description="Fears, sickness, addictions and vulnerabilities."
          >
            <Field
              label="Fears"
              textarea
              value={form.fears}
              onChange={(value) =>
                update("fears", value)
              }
            />

            <Field
              label="Sickness"
              textarea
              value={form.sickness}
              onChange={(value) =>
                update("sickness", value)
              }
            />

            <Field
              label="Addiction(s)"
              textarea
              value={form.addictions}
              onChange={(value) =>
                update("addictions", value)
              }
            />
          </EditorSection>

          <EditorSection
            icon="♫"
            title="Quotes, songs & lyrics"
            description="Keep the character's soundtrack and memorable lines."
          >
            <Field
              label="Quotes"
              textarea
              value={form.quotes}
              onChange={(value) =>
                update("quotes", value)
              }
            />

            <Field
              label="Songs"
              textarea
              value={form.songs}
              onChange={(value) =>
                update("songs", value)
              }
              placeholder="Song title — artist..."
            />

            <Field
              label="Lyrics"
              textarea
              value={form.lyrics}
              onChange={(value) =>
                update("lyrics", value)
              }
            />
          </EditorSection>

          <EditorSection
            icon="✎"
            title="Anecdotes & notes"
            description="Little facts, memories, scenes and miscellaneous details."
          >
            <Field
              label="Anecdotes"
              textarea
              value={form.anecdotes}
              onChange={(value) =>
                update("anecdotes", value)
              }
            />

            <div className="form-grid two">
              <Field
                label="Likes"
                textarea
                value={form.likes}
                onChange={(value) =>
                  update("likes", value)
                }
              />

              <Field
                label="Dislikes"
                textarea
                value={form.dislikes}
                onChange={(value) =>
                  update("dislikes", value)
                }
              />
            </div>
          </EditorSection>

          <Moodboard
            images={form.moodboard}
            add={addMoodboardImage}
            remove={removeMoodboardImage}
          />

          <RelationshipsEditor
            title="Family"
            icon="♧"
            items={form.family}
            type="family"
            add={addRelationship}
            remove={removeRelationship}
            update={(items) => update("family", items)}
          />

          <RelationshipsEditor
            title="Friends"
            icon="♢"
            items={form.friends}
            type="friends"
            add={addRelationship}
            remove={removeRelationship}
            update={(items) => update("friends", items)}
          />

          <RelationshipsEditor
            title="Pets"
            icon="♤"
            items={form.pets}
            type="pets"
            add={addRelationship}
            remove={removeRelationship}
            update={(items) => update("pets", items)}
          />
        </div>

        <aside className="editor-side">
          <EditorSection
            icon="◈"
            title="Status"
          >
            <SelectField
              label="Current status"
              value={form.status}
              onChange={(value) =>
                update("status", value)
              }
              options={[
                "Alive",
                "Dead",
                "Missing",
                "Unknown",
                "Other"
              ]}
            />

            <Field
              label="Later status"
              value={form.laterStatus}
              onChange={(value) =>
                update("laterStatus", value)
              }
            />
          </EditorSection>

          <EditorSection
            icon="♜"
            title="Affiliations"
          >
            <MultiRelationSelect
              label="Organizations"
              values={form.organizationIds || []}
              options={database.organizations}
              onChange={(values) =>
                update("organizationIds", values)
              }
            />

            <MultiRelationSelect
              label="Branches"
              values={form.branchIds || []}
              options={database.branches}
              onChange={(values) =>
                update("branchIds", values)
              }
            />

            <Field
              label="Affiliation text"
              textarea
              value={form.affiliation}
              onChange={(value) =>
                update("affiliation", value)
              }
            />
          </EditorSection>

          <EditorSection
            icon="♥"
            title="Quick profile"
          >
            <ProfileFact
              label="Name"
              value={`${form.name || "Unnamed"} ${
                form.lastName || ""
              }`}
            />

            <ProfileFact
              label="Age"
              value={form.age || "—"}
            />

            <ProfileFact
              label="Gender"
              value={form.gender || "—"}
            />

            <ProfileFact
              label="Pronouns"
              value={form.pronouns || "—"}
            />

            <ProfileFact
              label="Nationality"
              value={form.nationality || "—"}
            />

            <ProfileFact
              label="Origin"
              value={form.origins || "—"}
            />
          </EditorSection>

          <div className="save-reminder">
            <span>✦</span>
            <div>
              <strong>Auto-save</strong>
              <p>
                Your archive is saved in this browser.
                Use Export Backup for an extra copy.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Organizations
   --------------------------------------------------------- */

function OrganizationsPage({
  database,
  updateDatabase,
  search,
  selectedId,
  navigate,
  deleteItem,
  notify
}) {
  const selected = database.organizations.find(
    (item) => item.id === selectedId
  );

  if (selected) {
    return (
      <OrganizationEditor
        organization={selected}
        database={database}
        updateDatabase={updateDatabase}
        navigate={navigate}
        deleteItem={deleteItem}
        notify={notify}
      />
    );
  }

  const filtered = database.organizations.filter((item) =>
    [
      item.name,
      item.description,
      item.type,
      item.leader
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeading
        eyebrow="ORGANIZATION ARCHIVE"
        title="Organizations"
        description="Factions, groups, companies, families, governments and more."
        action="+ New organization"
        onAction={() => {
          const item = blankOrganization();

          updateDatabase((db) => ({
            ...db,
            organizations: [
              item,
              ...db.organizations
            ]
          }));

          navigate("organizations", item.id);
        }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          large
          icon="♜"
          title="No organizations yet"
          text="Create an organization and connect characters and branches directly to it."
          action="Create organization"
          onAction={() => {
            const item = blankOrganization();

            updateDatabase((db) => ({
              ...db,
              organizations: [
                item,
                ...db.organizations
              ]
            }));

            navigate("organizations", item.id);
          }}
        />
      ) : (
        <div className="organization-grid">
          {filtered.map((organization) => (
            <article
              className="organization-card"
              key={organization.id}
            >
              <button
                className="organization-card-main"
                onClick={() =>
                  navigate(
                    "organizations",
                    organization.id
                  )
                }
              >
                <div className="organization-symbol">
                  ♜
                </div>

                <span className="card-eyebrow">
                  {organization.type || "Organization"}
                </span>

                <h3>
                  {organization.name ||
                    "Unnamed organization"}
                </h3>

                <p>
                  {organization.description ||
                    "No description yet."}
                </p>

                <div className="card-tags">
                  <span>{organization.status}</span>

                  <span>
                    {
                      database.characters.filter((character) =>
                        (
                          character.organizationIds || []
                        ).includes(organization.id)
                      ).length
                    }{" "}
                    members
                  </span>
                </div>
              </button>

              <div className="card-footer">
                <span>
                  {organization.headquarters ||
                    "No headquarters"}
                </span>

                <button
                  className="danger-text-button"
                  onClick={() =>
                    deleteItem(
                      "organizations",
                      organization.id
                    )
                  }
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function OrganizationEditor({
  organization,
  database,
  updateDatabase,
  navigate,
  deleteItem,
  notify
}) {
  const [form, setForm] = useState(organization);

  useEffect(() => {
    setForm(organization);
  }, [organization.id]);

  function update(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value
    }));
  }

  function save() {
    updateDatabase((db) => ({
      ...db,
      organizations: db.organizations.map((item) =>
        item.id === form.id
          ? { ...form, updatedAt: now() }
          : item
      )
    }));

    notify("Organization saved.");
  }

  const members = database.characters.filter((character) =>
    (character.organizationIds || []).includes(form.id)
  );

  const branches = database.branches.filter(
    (branch) => branch.organizationId === form.id
  );

  return (
    <div className="editor-page">
      <div className="editor-top">
        <button
          className="back-button"
          onClick={() => navigate("organizations")}
        >
          ← Organizations
        </button>

        <div className="editor-actions">
          <button
            className="secondary-button"
            onClick={() =>
              deleteItem("organizations", form.id)
            }
          >
            Delete
          </button>

          <button
            className="primary-button"
            onClick={save}
          >
            Save organization
          </button>
        </div>
      </div>

      <section className="entity-banner">
        <div className="entity-symbol">♜</div>

        <div>
          <span className="eyebrow">
            ORGANIZATION FILE
          </span>

          <input
            className="title-input"
            value={form.name}
            onChange={(event) =>
              update("name", event.target.value)
            }
            placeholder="Organization name"
          />

          <p>
            {form.type || "Organization"} ·{" "}
            {form.status}
          </p>
        </div>
      </section>

      <div className="editor-grid">
        <div className="editor-main">
          <EditorSection
            icon="♜"
            title="Organization information"
          >
            <div className="form-grid two">
              <Field
                label="Name"
                value={form.name}
                onChange={(value) =>
                  update("name", value)
                }
              />

              <Field
                label="Type"
                value={form.type}
                onChange={(value) =>
                  update("type", value)
                }
              />

              <Field
                label="Leader"
                value={form.leader}
                onChange={(value) =>
                  update("leader", value)
                }
              />

              <Field
                label="Headquarters"
                value={form.headquarters}
                onChange={(value) =>
                  update("headquarters", value)
                }
              />

              <Field
                label="Colors / aesthetic"
                value={form.colors}
                onChange={(value) =>
                  update("colors", value)
                }
              />

              <SelectField
                label="Status"
                value={form.status}
                onChange={(value) =>
                  update("status", value)
                }
                options={[
                  "Active",
                  "Inactive",
                  "Destroyed",
                  "Secret",
                  "Unknown"
                ]}
              />
            </div>

            <Field
              label="Description"
              textarea
              value={form.description}
              onChange={(value) =>
                update("description", value)
              }
            />

            <Field
              label="Purpose / ideology"
              textarea
              value={form.purpose}
              onChange={(value) =>
                update("purpose", value)
              }
            />
          </EditorSection>

          <EditorSection
            icon="♙"
            title="Connected characters"
            description="Characters directly affiliated with this organization."
          >
            {members.length === 0 ? (
              <EmptyInline text="No characters are linked yet." />
            ) : (
              <div className="relation-list">
                {members.map((character) => (
                  <button
                    className="relation-row"
                    key={character.id}
                    onClick={() =>
                      navigate(
                        "characters",
                        character.id
                      )
                    }
                  >
                    <Avatar character={character} />

                    <div>
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

                    <span>→</span>
                  </button>
                ))}
              </div>
            )}
          </EditorSection>

          <EditorSection
            icon="⌘"
            title="Branches"
            description="Branches belonging to this organization."
          >
            {branches.length === 0 ? (
              <EmptyInline text="No branches yet." />
            ) : (
              <div className="relation-list">
                {branches.map((branch) => (
                  <button
                    className="relation-row"
                    key={branch.id}
                    onClick={() =>
                      navigate("branches", branch.id)
                    }
                  >
                    <div className="relation-symbol">
                      ⌘
                    </div>

                    <div>
                      <strong>
                        {branch.name ||
                          "Unnamed branch"}
                      </strong>

                      <span>
                        {branch.location ||
                          "Unknown location"}
                      </span>
                    </div>

                    <span>→</span>
                  </button>
                ))}
              </div>
            )}
          </EditorSection>
        </div>

        <aside className="editor-side">
          <EditorSection icon="✦" title="Overview">
            <ProfileFact
              label="Members"
              value={members.length}
            />

            <ProfileFact
              label="Branches"
              value={branches.length}
            />

            <ProfileFact
              label="Status"
              value={form.status}
            />

            <ProfileFact
              label="Leader"
              value={form.leader || "—"}
            />
          </EditorSection>

          <div className="save-reminder">
            <span>♜</span>
            <div>
              <strong>Connected data</strong>
              <p>
                Characters automatically appear here when
                this organization is selected in their
                profile.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Branches
   --------------------------------------------------------- */

function BranchesPage({
  database,
  updateDatabase,
  search,
  selectedId,
  navigate,
  deleteItem,
  notify
}) {
  const selected = database.branches.find(
    (item) => item.id === selectedId
  );

  if (selected) {
    return (
      <BranchEditor
        branch={selected}
        database={database}
        updateDatabase={updateDatabase}
        navigate={navigate}
        deleteItem={deleteItem}
        notify={notify}
      />
    );
  }

  const filtered = database.branches.filter((branch) =>
    [
      branch.name,
      branch.description,
      branch.location
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeading
        eyebrow="BRANCH ARCHIVE"
        title="Branches"
        description="Departments, chapters, locations and sub-groups."
        action="+ New branch"
        onAction={() => {
          const item = blankBranch();

          updateDatabase((db) => ({
            ...db,
            branches: [item, ...db.branches]
          }));

          navigate("branches", item.id);
        }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          large
          icon="⌘"
          title="No branches yet"
          text="Branches can be directly connected to organizations and characters."
          action="Create branch"
          onAction={() => {
            const item = blankBranch();

            updateDatabase((db) => ({
              ...db,
              branches: [item, ...db.branches]
            }));

            navigate("branches", item.id);
          }}
        />
      ) : (
        <div className="organization-grid">
          {filtered.map((branch) => {
            const organization =
              database.organizations.find(
                (item) =>
                  item.id === branch.organizationId
              );

            return (
              <article
                className="organization-card"
                key={branch.id}
              >
                <button
                  className="organization-card-main"
                  onClick={() =>
                    navigate("branches", branch.id)
                  }
                >
                  <div className="organization-symbol">
                    ⌘
                  </div>

                  <span className="card-eyebrow">
                    {organization?.name ||
                      "Independent branch"}
                  </span>

                  <h3>
                    {branch.name || "Unnamed branch"}
                  </h3>

                  <p>
                    {branch.description ||
                      "No description yet."}
                  </p>

                  <div className="card-tags">
                    <span>{branch.status}</span>

                    <span>
                      {branch.location ||
                        "Unknown location"}
                    </span>
                  </div>
                </button>

                <div className="card-footer">
                  <span>
                    {branch.leader ||
                      "No leader"}
                  </span>

                  <button
                    className="danger-text-button"
                    onClick={() =>
                      deleteItem(
                        "branches",
                        branch.id
                      )
                    }
                  >
                    Delete
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

function BranchEditor({
  branch,
  database,
  updateDatabase,
  navigate,
  deleteItem,
  notify
}) {
  const [form, setForm] = useState(branch);

  useEffect(() => {
    setForm(branch);
  }, [branch.id]);

  function update(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value
    }));
  }

  function save() {
    updateDatabase((db) => ({
      ...db,
      branches: db.branches.map((item) =>
        item.id === form.id
          ? { ...form, updatedAt: now() }
          : item
      )
    }));

    notify("Branch saved.");
  }

  const organization = database.organizations.find(
    (item) => item.id === form.organizationId
  );

  const members = database.characters.filter((character) =>
    (character.branchIds || []).includes(form.id)
  );

  return (
    <div className="editor-page">
      <div className="editor-top">
        <button
          className="back-button"
          onClick={() => navigate("branches")}
        >
          ← Branches
        </button>

        <div className="editor-actions">
          <button
            className="secondary-button"
            onClick={() =>
              deleteItem("branches", form.id)
            }
          >
            Delete
          </button>

          <button
            className="primary-button"
            onClick={save}
          >
            Save branch
          </button>
        </div>
      </div>

      <section className="entity-banner">
        <div className="entity-symbol">⌘</div>

        <div>
          <span className="eyebrow">
            BRANCH FILE
          </span>

          <input
            className="title-input"
            value={form.name}
            onChange={(event) =>
              update("name", event.target.value)
            }
            placeholder="Branch name"
          />

          <p>
            {organization?.name ||
              "Independent branch"}
          </p>
        </div>
      </section>

      <div className="editor-grid">
        <div className="editor-main">
          <EditorSection
            icon="⌘"
            title="Branch information"
          >
            <div className="form-grid two">
              <Field
                label="Name"
                value={form.name}
                onChange={(value) =>
                  update("name", value)
                }
              />

              <SelectField
                label="Organization"
                value={form.organizationId}
                onChange={(value) =>
                  update("organizationId", value)
                }
                options={[
                  "",
                  ...database.organizations.map(
                    (item) => item.id
                  )
                ]}
                labels={{
                  "": "Independent"
                }}
                optionLabels={Object.fromEntries(
                  database.organizations.map(
                    (item) => [
                      item.id,
                      item.name || "Unnamed"
                    ]
                  )
                )}
              />

              <Field
                label="Leader"
                value={form.leader}
                onChange={(value) =>
                  update("leader", value)
                }
              />

              <Field
                label="Location"
                value={form.location}
                onChange={(value) =>
                  update("location", value)
                }
              />

              <SelectField
                label="Status"
                value={form.status}
                onChange={(value) =>
                  update("status", value)
                }
                options={[
                  "Active",
                  "Inactive",
                  "Destroyed",
                  "Secret",
                  "Unknown"
                ]}
              />
            </div>

            <Field
              label="Description"
              textarea
              value={form.description}
              onChange={(value) =>
                update("description", value)
              }
            />
          </EditorSection>

          <EditorSection
            icon="♙"
            title="Connected characters"
          >
            {members.length === 0 ? (
              <EmptyInline text="No characters are linked to this branch." />
            ) : (
              <div className="relation-list">
                {members.map((character) => (
                  <button
                    className="relation-row"
                    key={character.id}
                    onClick={() =>
                      navigate(
                        "characters",
                        character.id
                      )
                    }
                  >
                    <Avatar character={character} />

                    <div>
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

                    <span>→</span>
                  </button>
                ))}
              </div>
            )}
          </EditorSection>
        </div>

        <aside className="editor-side">
          <EditorSection
            icon="♜"
            title="Parent organization"
          >
            {organization ? (
              <button
                className="relation-row"
                onClick={() =>
                  navigate(
                    "organizations",
                    organization.id
                  )
                }
              >
                <div className="relation-symbol">
                  ♜
                </div>

                <div>
                  <strong>
                    {organization.name}
                  </strong>

                  <span>
                    {organization.type ||
                      "Organization"}
                  </span>
                </div>

                <span>→</span>
              </button>
            ) : (
              <EmptyInline text="No organization connected." />
            )}
          </EditorSection>
        </aside>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Investigations
   --------------------------------------------------------- */

function InvestigationsPage({
  database,
  updateDatabase,
  search,
  selectedId,
  navigate,
  deleteItem,
  notify
}) {
  const selected = database.investigations.find(
    (item) => item.id === selectedId
  );

  if (selected) {
    return (
      <InvestigationEditor
        investigation={selected}
        database={database}
        updateDatabase={updateDatabase}
        navigate={navigate}
        deleteItem={deleteItem}
        notify={notify}
      />
    );
  }

  const filtered = database.investigations.filter((item) =>
    [
      item.title,
      item.caseNumber,
      item.location,
      item.what,
      item.who,
      item.why,
      item.status
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeading
        eyebrow="CASE FILES"
        title="Investigations"
        description="What happened, who was involved, how it happened and why."
        action="+ New case"
        onAction={() => {
          const item = blankInvestigation();

          updateDatabase((db) => ({
            ...db,
            investigations: [
              item,
              ...db.investigations
            ]
          }));

          navigate("investigations", item.id);
        }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          large
          icon="♧"
          title="No cases yet"
          text="Create a detective file with suspects, victims, evidence, clues and connected characters."
          action="Open case"
          onAction={() => {
            const item = blankInvestigation();

            updateDatabase((db) => ({
              ...db,
              investigations: [
                item,
                ...db.investigations
              ]
            }));

            navigate("investigations", item.id);
          }}
        />
      ) : (
        <div className="case-grid">
          {filtered.map((item) => (
            <article className="case-card" key={item.id}>
              <button
                className="case-card-main"
                onClick={() =>
                  navigate(
                    "investigations",
                    item.id
                  )
                }
              >
                <div className="case-card-top">
                  <span>
                    {item.caseNumber || "CASE"}
                  </span>

                  <StatusBadge status={item.status} />
                </div>

                <h3>
                  {item.title || "Untitled case"}
                </h3>

                <p>
                  {item.what ||
                    "No description of the case yet."}
                </p>

                <div className="case-meta">
                  <span>
                    📍 {item.location || "Unknown"}
                  </span>

                  <span>
                    ⚑ {item.priority}
                  </span>
                </div>
              </button>

              <div className="card-footer">
                <span>
                  {item.date || "No date"}
                </span>

                <button
                  className="danger-text-button"
                  onClick={() =>
                    deleteItem(
                      "investigations",
                      item.id
                    )
                  }
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function InvestigationEditor({
  investigation,
  database,
  updateDatabase,
  navigate,
  deleteItem,
  notify
}) {
  const [form, setForm] = useState(investigation);

  useEffect(() => {
    setForm(investigation);
  }, [investigation.id]);

  function update(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value
    }));
  }

  function save() {
    updateDatabase((db) => ({
      ...db,
      investigations: db.investigations.map(
        (item) =>
          item.id === form.id
            ? { ...form, updatedAt: now() }
            : item
      )
    }));

    notify("Investigation saved.");
  }

  return (
    <div className="editor-page">
      <div className="editor-top">
        <button
          className="back-button"
          onClick={() => navigate("investigations")}
        >
          ← Investigations
        </button>

        <div className="editor-actions">
          <button
            className="secondary-button"
            onClick={() =>
              deleteItem(
                "investigations",
                form.id
              )
            }
          >
            Delete
          </button>

          <button
            className="primary-button"
            onClick={save}
          >
            Save case
          </button>
        </div>
      </div>

      <section className="case-banner">
        <div className="case-file-stamp">
          CASE
        </div>

        <div>
          <span className="eyebrow">
            INVESTIGATION FILE
          </span>

          <input
            className="title-input"
            value={form.title}
            onChange={(event) =>
              update("title", event.target.value)
            }
            placeholder="Case title"
          />

          <p>
            {form.caseNumber ||
              "Case number not assigned"}
          </p>
        </div>
      </section>

      <div className="editor-grid">
        <div className="editor-main">
          <EditorSection
            icon="♧"
            title="Case overview"
          >
            <div className="form-grid three">
              <Field
                label="Case number"
                value={form.caseNumber}
                onChange={(value) =>
                  update("caseNumber", value)
                }
              />

              <SelectField
                label="Status"
                value={form.status}
                onChange={(value) =>
                  update("status", value)
                }
                options={[
                  "Open",
                  "Investigating",
                  "Solved",
                  "Cold",
                  "Closed",
                  "Unsolved"
                ]}
              />

              <SelectField
                label="Priority"
                value={form.priority}
                onChange={(value) =>
                  update("priority", value)
                }
                options={[
                  "Low",
                  "Medium",
                  "High",
                  "Critical"
                ]}
              />

              <Field
                label="Date"
                type="date"
                value={form.date}
                onChange={(value) =>
                  update("date", value)
                }
              />

              <Field
                label="Location"
                value={form.location}
                onChange={(value) =>
                  update("location", value)
                }
              />

              <Field
                label="When"
                value={form.when}
                onChange={(value) =>
                  update("when", value)
                }
              />
            </div>
          </EditorSection>

          <EditorSection
            icon="?"
            title="What / Who / How / Why"
            description="The central investigation questions."
          >
            <Field
              label="What happened?"
              textarea
              value={form.what}
              onChange={(value) =>
                update("what", value)
              }
            />

            <Field
              label="Who?"
              textarea
              value={form.who}
              onChange={(value) =>
                update("who", value)
              }
            />

            <Field
              label="How?"
              textarea
              value={form.how}
              onChange={(value) =>
                update("how", value)
              }
            />

            <Field
              label="Why?"
              textarea
              value={form.why}
              onChange={(value) =>
                update("why", value)
              }
            />

            <Field
              label="Motive"
              textarea
              value={form.motive}
              onChange={(value) =>
                update("motive", value)
              }
            />
          </EditorSection>

          <EditorSection
            icon="☠"
            title="People involved"
          >
            <Field
              label="Suspects"
              textarea
              value={form.suspects}
              onChange={(value) =>
                update("suspects", value)
              }
            />

            <Field
              label="Victims"
              textarea
              value={form.victims}
              onChange={(value) =>
                update("victims", value)
              }
            />

            <Field
              label="Witnesses"
              textarea
              value={form.witnesses}
              onChange={(value) =>
                update("witnesses", value)
              }
            />
          </EditorSection>

          <EditorSection
            icon="⌕"
            title="Evidence & clues"
          >
            <Field
              label="Evidence"
              textarea
              value={form.evidence}
              onChange={(value) =>
                update("evidence", value)
              }
            />

            <Field
              label="Clues"
              textarea
              value={form.clues}
              onChange={(value) =>
                update("clues", value)
              }
            />
          </EditorSection>

          <EditorSection
            icon="✓"
            title="Solution"
          >
            <Field
              label="Solution / reveal"
              textarea
              value={form.solution}
              onChange={(value) =>
                update("solution", value)
              }
            />

            <Field
              label="Investigator notes"
              textarea
              value={form.notes}
              onChange={(value) =>
                update("notes", value)
              }
            />
          </EditorSection>
        </div>

        <aside className="editor-side">
          <EditorSection
            icon="♙"
            title="Connected characters"
          >
            <MultiRelationSelect
              label="Characters"
              values={form.characterIds || []}
              options={database.characters}
              getLabel={(item) =>
                `${item.name || "Unnamed"} ${
                  item.lastName || ""
                }`.trim()
              }
              onChange={(values) =>
                update("characterIds", values)
              }
            />

            {(form.characterIds || []).map((id) => {
              const character =
                database.characters.find(
                  (item) => item.id === id
                );

              if (!character) return null;

              return (
                <button
                  className="relation-row"
                  key={id}
                  onClick={() =>
                    navigate(
                      "characters",
                      character.id
                    )
                  }
                >
                  <Avatar character={character} />

                  <div>
                    <strong>
                      {character.name}{" "}
                      {character.lastName}
                    </strong>

                    <span>
                      {character.job ||
                        "Character"}
                    </span>
                  </div>

                  <span>→</span>
                </button>
              );
            })}
          </EditorSection>

          <EditorSection
            icon="♜"
            title="Connected organizations"
          >
            <MultiRelationSelect
              label="Organizations"
              values={form.organizationIds || []}
              options={database.organizations}
              onChange={(values) =>
                update("organizationIds", values)
              }
            />
          </EditorSection>

          <div className="case-note">
            <strong>Detective tip</strong>
            <p>
              Keep facts separate from theories. Use Evidence
              for confirmed information and Clues for things
              that still need interpretation.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Lore
   --------------------------------------------------------- */

function LorePage({
  database,
  updateDatabase,
  search,
  selectedId,
  navigate,
  deleteItem,
  notify
}) {
  const selected = database.lore.find(
    (item) => item.id === selectedId
  );

  if (selected) {
    return (
      <LoreEditor
        lore={selected}
        database={database}
        updateDatabase={updateDatabase}
        navigate={navigate}
        deleteItem={deleteItem}
        notify={notify}
      />
    );
  }

  const filtered = database.lore.filter((item) =>
    [
      item.title,
      item.category,
      item.summary,
      item.content,
      item.era,
      item.location
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeading
        eyebrow="WORLD ARCHIVE"
        title="Lore"
        description="History, mythology, locations, events and worldbuilding."
        action="+ New lore"
        onAction={() => {
          const item = blankLore();

          updateDatabase((db) => ({
            ...db,
            lore: [item, ...db.lore]
          }));

          navigate("lore", item.id);
        }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          large
          icon="◈"
          title="No lore entries yet"
          text="Create worldbuilding entries and connect them to characters and organizations."
          action="Create lore"
          onAction={() => {
            const item = blankLore();

            updateDatabase((db) => ({
              ...db,
              lore: [item, ...db.lore]
            }));

            navigate("lore", item.id);
          }}
        />
      ) : (
        <div className="lore-grid">
          {filtered.map((item) => (
            <article className="lore-card" key={item.id}>
              <button
                onClick={() =>
                  navigate("lore", item.id)
                }
              >
                <span className="card-eyebrow">
                  {item.category}
                </span>

                <h3>
                  {item.title || "Untitled lore"}
                </h3>

                <p>
                  {item.summary ||
                    item.content ||
                    "No content yet."}
                </p>

                <div className="card-tags">
                  {item.era && (
                    <span>{item.era}</span>
                  )}

                  {item.location && (
                    <span>{item.location}</span>
                  )}
                </div>
              </button>

              <div className="card-footer">
                <span>Worldbuilding</span>

                <button
                  className="danger-text-button"
                  onClick={() =>
                    deleteItem("lore", item.id)
                  }
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function LoreEditor({
  lore,
  database,
  updateDatabase,
  navigate,
  deleteItem,
  notify
}) {
  const [form, setForm] = useState(lore);

  useEffect(() => {
    setForm(lore);
  }, [lore.id]);

  function update(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value
    }));
  }

  function save() {
    updateDatabase((db) => ({
      ...db,
      lore: db.lore.map((item) =>
        item.id === form.id
          ? { ...form, updatedAt: now() }
          : item
      )
    }));

    notify("Lore entry saved.");
  }

  return (
    <div className="editor-page">
      <div className="editor-top">
        <button
          className="back-button"
          onClick={() => navigate("lore")}
        >
          ← Lore
        </button>

        <div className="editor-actions">
          <button
            className="secondary-button"
            onClick={() =>
              deleteItem("lore", form.id)
            }
          >
            Delete
          </button>

          <button
            className="primary-button"
            onClick={save}
          >
            Save lore
          </button>
        </div>
      </div>

      <section className="entity-banner">
        <div className="entity-symbol">◈</div>

        <div>
          <span className="eyebrow">
            LORE FILE
          </span>

          <input
            className="title-input"
            value={form.title}
            onChange={(event) =>
              update("title", event.target.value)
            }
            placeholder="Lore title"
          />
        </div>
      </section>

      <div className="editor-grid">
        <div className="editor-main">
          <EditorSection
            icon="◈"
            title="Lore entry"
          >
            <div className="form-grid two">
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
                onChange={(value) =>
                  update("category", value)
                }
              />

              <Field
                label="Era"
                value={form.era}
                onChange={(value) =>
                  update("era", value)
                }
              />

              <Field
                label="Location"
                value={form.location}
                onChange={(value) =>
                  update("location", value)
                }
              />
            </div>

            <Field
              label="Summary"
              textarea
              value={form.summary}
              onChange={(value) =>
                update("summary", value)
              }
            />

            <Field
              label="Full lore"
              textarea
              value={form.content}
              onChange={(value) =>
                update("content", value)
              }
            />
          </EditorSection>
        </div>

        <aside className="editor-side">
          <EditorSection
            icon="♙"
            title="Connected characters"
          >
            <MultiRelationSelect
              label="Characters"
              values={form.characterIds || []}
              options={database.characters}
              getLabel={(item) =>
                `${item.name || "Unnamed"} ${
                  item.lastName || ""
                }`.trim()
              }
              onChange={(values) =>
                update("characterIds", values)
              }
            />
          </EditorSection>

          <EditorSection
            icon="♜"
            title="Connected organizations"
          >
            <MultiRelationSelect
              label="Organizations"
              values={form.organizationIds || []}
              options={database.organizations}
              onChange={(values) =>
                update("organizationIds", values)
              }
            />
          </EditorSection>
        </aside>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Posts
   --------------------------------------------------------- */

function PostsPage({
  database,
  updateDatabase,
  search,
  selectedId,
  navigate,
  deleteItem,
  notify
}) {
  const selected = database.posts.find(
    (item) => item.id === selectedId
  );

  if (selected) {
    return (
      <PostEditor
        post={selected}
        database={database}
        updateDatabase={updateDatabase}
        navigate={navigate}
        deleteItem={deleteItem}
        notify={notify}
      />
    );
  }

  const filtered = database.posts.filter((item) =>
    [
      item.title,
      item.content,
      item.category
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeading
        eyebrow="POSTS & NOTES"
        title="Posts"
        description="Scenes, snippets, ideas, theories, journal entries and miscellaneous writing."
        action="+ New post"
        onAction={() => {
          const item = blankPost();

          updateDatabase((db) => ({
            ...db,
            posts: [item, ...db.posts]
          }));

          navigate("posts", item.id);
        }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          large
          icon="✦"
          title="No posts yet"
          text="Keep scenes, ideas and character-related writing here."
          action="Create post"
          onAction={() => {
            const item = blankPost();

            updateDatabase((db) => ({
              ...db,
              posts: [item, ...db.posts]
            }));

            navigate("posts", item.id);
          }}
        />
      ) : (
        <div className="post-grid">
          {filtered.map((item) => (
            <article className="post-card" key={item.id}>
              <button
                onClick={() =>
                  navigate("posts", item.id)
                }
              >
                <span className="card-eyebrow">
                  {item.category}
                </span>

                <h3>
                  {item.title || "Untitled post"}
                </h3>

                <p>
                  {item.content ||
                    "No content yet."}
                </p>
              </button>

              <div className="card-footer">
                <span>
                  {formatDate(item.updatedAt)}
                </span>

                <button
                  className="danger-text-button"
                  onClick={() =>
                    deleteItem("posts", item.id)
                  }
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function PostEditor({
  post,
  database,
  updateDatabase,
  navigate,
  deleteItem,
  notify
}) {
  const [form, setForm] = useState(post);

  useEffect(() => {
    setForm(post);
  }, [post.id]);

  function update(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value
    }));
  }

  function save() {
    updateDatabase((db) => ({
      ...db,
      posts: db.posts.map((item) =>
        item.id === form.id
          ? { ...form, updatedAt: now() }
          : item
      )
    }));

    notify("Post saved.");
  }

  return (
    <div className="editor-page">
      <div className="editor-top">
        <button
          className="back-button"
          onClick={() => navigate("posts")}
        >
          ← Posts
        </button>

        <div className="editor-actions">
          <button
            className="secondary-button"
            onClick={() =>
              deleteItem("posts", form.id)
            }
          >
            Delete
          </button>

          <button
            className="primary-button"
            onClick={save}
          >
            Save post
          </button>
        </div>
      </div>

      <div className="editor-grid">
        <div className="editor-main">
          <EditorSection icon="✦" title="Post">
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
              onChange={(value) =>
                update("category", value)
              }
            />

            <Field
              label="Content"
              textarea
              value={form.content}
              onChange={(value) =>
                update("content", value)
              }
            />
          </EditorSection>
        </div>

        <aside className="editor-side">
          <EditorSection
            icon="♙"
            title="Characters"
          >
            <MultiRelationSelect
              label="Connected characters"
              values={form.characterIds || []}
              options={database.characters}
              getLabel={(item) =>
                `${item.name || "Unnamed"} ${
                  item.lastName || ""
                }`.trim()
              }
              onChange={(values) =>
                update("characterIds", values)
              }
            />
          </EditorSection>

          <EditorSection
            icon="♜"
            title="Organizations"
          >
            <MultiRelationSelect
              label="Connected organizations"
              values={form.organizationIds || []}
              options={database.organizations}
              onChange={(values) =>
                update("organizationIds", values)
              }
            />
          </EditorSection>
        </aside>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Reusable Editor Components
   --------------------------------------------------------- */

function EditorSection({
  icon,
  title,
  description,
  children
}) {
  return (
    <section className="editor-section">
      <header className="section-header">
        <div className="section-title">
          <span className="section-icon">{icon}</span>

          <div>
            <h3>{title}</h3>

            {description && (
              <p>{description}</p>
            )}
          </div>
        </div>
      </header>

      <div className="section-body">
        {children}
      </div>
    </section>
  );
}

function PersonalitySliders({
  personality,
  update
}) {
  const fields = [
    ["niceMean", "Nice", "Mean"],
    ["braveCoward", "Brave", "Coward"],
    ["pacifistViolent", "Pacifist", "Violent"],
    ["thoughtfulImpulsive", "Thoughtful", "Impulsive"],
    ["agreeableContrary", "Agreeable", "Contrary"],
    ["idealisticPragmatic", "Idealistic", "Pragmatic"],
    ["frugalSpender", "Frugal", "Big spender"],
    ["collectedWild", "Collected", "Wild"],
    ["honestDeceptive", "Honest", "Deceptive"],
    ["politeRude", "Polite", "Rude"],
    ["smartIdiot", "Smart", "Idiot"],
    ["confidentInsecure", "Confident", "Insecure"],
    ["calmAnxious", "Calm", "Anxious"],
    ["patientImpatient", "Patient", "Impatient"],
    ["gullibleSkeptical", "Gullible", "Skeptical"],
    ["reservedFlirty", "Reserved", "Flirty"]
  ];

  return (
    <div className="personality-grid">
      {fields.map(([key, left, right]) => (
        <div className="personality-row" key={key}>
          <div className="slider-labels">
            <span>{left}</span>
            <strong>
              {Math.round(
                Number(personality[key] || 50) / 10
              )} / 10
            </strong>
            <span>{right}</span>
          </div>

          <input
            className="range-input"
            type="range"
            min="0"
            max="100"
            value={personality[key] ?? 50}
            onChange={(event) =>
              update(
                key,
                Number(event.target.value)
              )
            }
          />
        </div>
      ))}
    </div>
  );
}

const DEFAULT_SKILL_LABELS = {
  perception: "Perception",
  communication: "Communication",
  persuasion: "Persuasion",
  mediation: "Mediation",
  literacy: "Literacy",
  creativity: "Creativity",
  cooking: "Cooking",
  techSavvy: "Tech savvy",
  combat: "Combat",
  survival: "Survival",
  stealth: "Stealth",
  streetSmarts: "Street smarts",
  seduction: "Seduction",
  luck: "Luck",
  animals: "Handling animals",
  children: "Pacifying children",
  reflexes: "Reflexes",
  strength: "Strength",
  speed: "Speed",
  battleIQ: "Battle IQ",
  resistance: "Resistance",
  flexibility: "Flexibility"
};

function SkillGrid({
  values,
  update,
  labels = DEFAULT_SKILL_LABELS
}) {
  return (
    <div className="skill-grid">
      {Object.entries(values).map(([key, value]) => (
        <div className="skill-row" key={key}>
          <span>{labels[key] || key}</span>

          <div className="skill-levels">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                className={
                  level <= value ? "filled" : ""
                }
                onClick={() =>
                  update(key, level)
                }
                aria-label={`${labels[key] || key} level ${level}`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Moodboard({
  images,
  add,
  remove
}) {
  return (
    <section className="editor-section">
      <header className="section-header">
        <div className="section-title">
          <span className="section-icon">▦</span>

          <div>
            <h3>Mood board</h3>
            <p>
              Add image URLs to create a visual reference board.
            </p>
          </div>
        </div>

        <button
          className="small-primary-button"
          onClick={add}
        >
          + Add image
        </button>
      </header>

      <div className="moodboard">
        {images?.length ? (
          images.map((image) => (
            <div className="mood-image" key={image.id}>
              <img src={image.url} alt="" />

              <button
                onClick={() =>
                  remove(image.id)
                }
              >
                ×
              </button>
            </div>
          ))
        ) : (
          <div className="mood-empty">
            <span>▧</span>
            <p>No moodboard images yet.</p>
            <button onClick={add}>
              Add the first image
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function RelationshipsEditor({
  title,
  icon,
  items,
  type,
  add,
  remove,
  update
}) {
  function changeRelation(id, relation) {
    update(
      items.map((item) =>
        item.id === id
          ? { ...item, relation }
          : item
      )
    );
  }

  return (
    <section className="editor-section">
      <header className="section-header">
        <div className="section-title">
          <span className="section-icon">{icon}</span>

          <div>
            <h3>{title}</h3>
            <p>
              Directly connected people and relationships.
            </p>
          </div>
        </div>

        <button
          className="small-primary-button"
          onClick={() => add(type)}
        >
          + Add
        </button>
      </header>

      <div className="relationship-list">
        {items?.length ? (
          items.map((item) => (
            <div
              className="relationship-item"
              key={item.id}
            >
              <div className="relationship-avatar">
                {item.name
                  ?.charAt(0)
                  .toUpperCase() || "?"}
              </div>

              <div className="relationship-fields">
                <input
                  value={item.name}
                  onChange={(event) =>
                    update(
                      items.map((current) =>
                        current.id === item.id
                          ? {
                              ...current,
                              name: event.target.value
                            }
                          : current
                      )
                    )
                  }
                  placeholder="Name"
                />

                <input
                  value={item.relation || ""}
                  onChange={(event) =>
                    changeRelation(
                      item.id,
                      event.target.value
                    )
                  }
                  placeholder="Relationship"
                />
              </div>

              <button
                className="delete-icon-button"
                onClick={() =>
                  remove(type, item.id)
                }
              >
                ×
              </button>
            </div>
          ))
        ) : (
          <EmptyInline
            text={`No ${title.toLowerCase()} added yet.`}
          />
        )}
      </div>
    </section>
  );
}

function MultiRelationSelect({
  label,
  values,
  options,
  onChange,
  getLabel = (item) =>
    item.name || item.title || "Unnamed"
}) {
  function toggle(id) {
    if (values.includes(id)) {
      onChange(
        values.filter((value) => value !== id)
      );
    } else {
      onChange([...values, id]);
    }
  }

  return (
    <div className="multi-select">
      <label>{label}</label>

      <div className="multi-select-options">
        {options.length === 0 ? (
          <span className="muted">
            Nothing available yet.
          </span>
        ) : (
          options.map((option) => (
            <button
              key={option.id}
              className={
                values.includes(option.id)
                  ? "selected"
                  : ""
              }
              onClick={() => toggle(option.id)}
              type="button"
            >
              <span>
                {values.includes(option.id)
                  ? "✓"
                  : "+"}
              </span>

              {getLabel(option)}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Settings
   --------------------------------------------------------- */

function SettingsPage({
  themeId,
  setThemeId,
  exportDatabase,
  importDatabase,
  database,
  updateDatabase,
  notify
}) {
  function clearArchive() {
    const confirmed = window.confirm(
      "This will permanently delete every OCFiles entry stored in this browser. Continue?"
    );

    if (!confirmed) return;

    updateDatabase(createInitialDatabase());
    notify("Archive cleared.");
  }

  return (
    <div>
      <PageHeading
        eyebrow="CONFIGURATION"
        title="Settings"
        description="Customize the archive and manage your local data."
      />

      <div className="settings-grid">
        <section className="settings-card">
          <div className="settings-heading">
            <span>◐</span>
            <div>
              <h3>Visual theme</h3>
              <p>
                Choose the atmosphere for your archive.
              </p>
            </div>
          </div>

          <div className="theme-grid">
            {Object.values(THEMES).map((theme) => (
              <button
                key={theme.id}
                className={`theme-card ${
                  themeId === theme.id
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setThemeId(theme.id)
                }
              >
                <span>{theme.icon}</span>

                <strong>{theme.name}</strong>

                <small>
                  {theme.description}
                </small>
              </button>
            ))}
          </div>
        </section>

        <section className="settings-card">
          <div className="settings-heading">
            <span>▣</span>
            <div>
              <h3>Data & backups</h3>
              <p>
                Everything is stored locally in your browser.
              </p>
            </div>
          </div>

          <div className="backup-actions">
            <button
              className="primary-button"
              onClick={exportDatabase}
            >
              ↓ Export complete backup
            </button>

            <label className="secondary-button">
              ↑ Import backup
              <input
                type="file"
                accept=".json,application/json"
                hidden
                onChange={importDatabase}
              />
            </label>
          </div>

          <div className="data-stat-grid">
            <DataStat
              label="Characters"
              value={database.characters.length}
            />

            <DataStat
              label="Organizations"
              value={database.organizations.length}
            />

            <DataStat
              label="Branches"
              value={database.branches.length}
            />

            <DataStat
              label="Cases"
              value={database.investigations.length}
            />

            <DataStat
              label="Lore"
              value={database.lore.length}
            />

            <DataStat
              label="Posts"
              value={database.posts.length}
            />
          </div>
        </section>

        <section className="settings-card danger-card">
          <div className="settings-heading">
            <span>⚠</span>
            <div>
              <h3>Danger zone</h3>
              <p>
                These actions affect your local archive.
              </p>
            </div>
          </div>

          <button
            className="danger-button"
            onClick={clearArchive}
          >
            Delete entire archive
          </button>
        </section>
      </div>
    </div>
  );
}

function DataStat({ label, value }) {
  return (
    <div className="data-stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

/* ---------------------------------------------------------
   Generic UI
   --------------------------------------------------------- */

function PageHeading({
  eyebrow,
  title,
  description,
  action,
  onAction
}) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>

        {description && (
          <p>{description}</p>
        )}
      </div>

      {action && (
        <button
          className="primary-button"
          onClick={onAction}
        >
          {action}
        </button>
      )}
    </div>
  );
}

function PanelHeader({
  title,
  action,
  onAction
}) {
  return (
    <div className="panel-header">
      <h3>{title}</h3>

      {action && (
        <button onClick={onAction}>
          {action} →
        </button>
      )}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  text,
  action,
  onAction,
  large
}) {
  return (
    <div className={`empty-state ${large ? "large" : ""}`}>
      <div className="empty-symbol">
        {icon}
      </div>

      <h3>{title}</h3>
      <p>{text}</p>

      {action && (
        <button
          className="primary-button"
          onClick={onAction}
        >
          {action}
        </button>
      )}
    </div>
  );
}

function EmptyInline({ text }) {
  return (
    <div className="empty-inline">
      <span>◇</span>
      {text}
    </div>
  );
}

function Avatar({ character }) {
  return (
    <div className="avatar">
      {character.picture ? (
        <img
          src={character.picture}
          alt=""
        />
      ) : (
        (
          character.name ||
          "?"
        ).charAt(0).toUpperCase()
      )}
    </div>
  );
}

function ProfileFact({ label, value }) {
  return (
    <div className="profile-fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = String(status || "")
    .toLowerCase()
    .replace(/\s+/g, "-");

  return (
    <span
      className={`status-badge status-${normalized}`}
    >
      <span />
      {status || "Unknown"}
    </span>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  textarea = false,
  placeholder = ""
}) {
  return (
    <label className="field">
      <span>{label}</span>

      {textarea ? (
        <textarea
          value={value ?? ""}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          rows="5"
        />
      ) : (
        <input
          type={type}
          value={value ?? ""}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
        />
      )}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  labels = {},
  optionLabels = {}
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
          <option key={option} value={option}>
            {labels[option] ||
              optionLabels[option] ||
              option ||
              "None"}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toast({ message, type }) {
  return (
    <div className={`toast ${type || "success"}`}>
      <span>
        {type === "error" ? "!" : "✓"}
      </span>

      {message}
    </div>
  );
}

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}
