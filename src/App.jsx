import { useEffect, useMemo, useState } from "react";
import { DEFAULT_THEME, THEMES, applyTheme } from "./themes";

/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY = "ocfiles-database-v1";

const emptyDatabase = {
  characters: [],
  organizations: [],
  branches: [],
  posts: [],
  cases: [],
  lore: [],
  settings: {
    theme: DEFAULT_THEME
  }
};

function loadDatabase() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return emptyDatabase;
    }

    const parsed = JSON.parse(saved);

    return {
      ...emptyDatabase,
      ...parsed,
      settings: {
        ...emptyDatabase.settings,
        ...(parsed.settings || {})
      }
    };
  } catch {
    return emptyDatabase;
  }
}

function saveDatabase(database) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
  } catch {
    console.warn("OcFiles could not save the database.");
  }
}

function uid(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function emptyCharacter() {
  return {
    id: uid("character"),

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
    species: "",

    status: "Alive",
    laterStatus: "",

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

    fears: [],
    sickness: "",
    addictions: [],

    likes: [],
    dislikes: [],

    anecdotes: "",
    lyrics: "",
    songs: "",
    quotes: "",

    picture: "",
    moodboard: [],

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
      handlingAnimals: 3,
      pacifyingChildren: 3,
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

    relationships: [],
    notes: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function emptyOrganization() {
  return {
    id: uid("organization"),
    name: "",
    type: "",
    description: "",
    leader: "",
    headquarters: "",
    goals: "",
    members: [],
    branches: [],
    logo: "",
    notes: ""
  };
}

function emptyBranch() {
  return {
    id: uid("branch"),
    name: "",
    organizationId: "",
    location: "",
    description: "",
    leader: "",
    members: [],
    notes: ""
  };
}

function emptyPost() {
  return {
    id: uid("post"),
    title: "",
    content: "",
    author: "",
    tags: [],
    date: new Date().toISOString().slice(0, 10),
    image: ""
  };
}

function emptyCase() {
  return {
    id: uid("case"),
    title: "",
    status: "Open",
    difficulty: "Medium",
    what: "",
    who: "",
    how: "",
    why: "",
    where: "",
    when: "",
    involved: [],
    evidence: [],
    clues: [],
    suspects: [],
    solution: "",
    notes: ""
  };
}

function emptyLore() {
  return {
    id: uid("lore"),
    title: "",
    category: "",
    content: "",
    relatedCharacters: [],
    relatedOrganizations: [],
    tags: []
  };
}

/* =========================================================
   CONSTANTS
========================================================= */

const personalityTraits = [
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

const skillDefinitions = [
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
  ["flexibility", "Flexibility"]
];

const socialDefinitions = [
  ["charisma", "Charisma"],
  ["empathy", "Empathy"],
  ["generosity", "Generosity"],
  ["wealth", "Wealth"],
  ["aggression", "Aggression"],
  ["libido", "Libido"]
];

const navItems = [
  ["dashboard", "⌂", "Dashboard"],
  ["characters", "♟", "Characters"],
  ["organizations", "♜", "Organizations"],
  ["branches", "⌘", "Branches"],
  ["relationships", "♡", "Relationships"],
  ["cases", "⚠", "Investigation"],
  ["lore", "◈", "Lore"],
  ["posts", "✦", "Posts"],
  ["settings", "⚙", "Settings"]
];

/* =========================================================
   HELPERS
========================================================= */

function displayName(character) {
  if (!character) return "Unknown";
  return (
    [character.name, character.lastName]
      .filter(Boolean)
      .join(" ") ||
    character.nickname ||
    "Unnamed Character"
  );
}

function initials(character) {
  const name = displayName(character);

  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function splitLines(value) {
  if (Array.isArray(value)) return value;
  return String(value || "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

function joinLines(value) {
  return Array.isArray(value) ? value.join("\n") : value || "";
}

function normalizeCharacter(character) {
  const base = emptyCharacter();

  return {
    ...base,
    ...character,
    personality: {
      ...base.personality,
      ...(character.personality || {})
    },
    skills: {
      ...base.skills,
      ...(character.skills || {})
    },
    socials: {
      ...base.socials,
      ...(character.socials || {})
    },
    fears: character.fears || [],
    addictions: character.addictions || [],
    likes: character.likes || [],
    dislikes: character.dislikes || [],
    moodboard: character.moodboard || [],
    relationships: character.relationships || []
  };
}

/* =========================================================
   APP
========================================================= */

export default function App() {
  const [database, setDatabase] = useState(loadDatabase);
  const [page, setPage] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState(
    database.settings?.theme || DEFAULT_THEME
  );

  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [characterEditor, setCharacterEditor] = useState(null);

  const [selectedOrganization, setSelectedOrganization] =
    useState(null);
  const [organizationEditor, setOrganizationEditor] =
    useState(null);

  const [selectedCase, setSelectedCase] = useState(null);
  const [caseEditor, setCaseEditor] = useState(null);

  const [selectedLore, setSelectedLore] = useState(null);
  const [loreEditor, setLoreEditor] = useState(null);

  const [postEditor, setPostEditor] = useState(null);

  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    saveDatabase(database);
  }, [database]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    setDatabase((current) => ({
      ...current,
      settings: {
        ...current.settings,
        theme
      }
    }));
  }, [theme]);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), 2800);

    return () => clearTimeout(timer);
  }, [toast]);

  function notify(message, type = "success") {
    setToast({
      message,
      type
    });
  }

  function navigate(target) {
    setPage(target);
    setSearch("");
    setSelectedCharacter(null);
    setSelectedOrganization(null);
    setSelectedCase(null);
    setSelectedLore(null);
  }

  function addCharacter() {
    const character = emptyCharacter();

    setCharacterEditor(character);
  }

  function saveCharacter(character) {
    const normalized = normalizeCharacter({
      ...character,
      updatedAt: new Date().toISOString()
    });

    setDatabase((current) => {
      const exists = current.characters.some(
        (item) => item.id === normalized.id
      );

      return {
        ...current,
        characters: exists
          ? current.characters.map((item) =>
              item.id === normalized.id ? normalized : item
            )
          : [...current.characters, normalized]
      };
    });

    setCharacterEditor(null);
    setSelectedCharacter(normalized.id);
    notify("Character saved.");
  }

  function deleteCharacter(id) {
    setConfirm({
      title: "Delete character?",
      message:
        "This will permanently remove this character from OcFiles.",
      danger: true,
      action: () => {
        setDatabase((current) => ({
          ...current,
          characters: current.characters.filter(
            (character) => character.id !== id
          )
        }));

        setSelectedCharacter(null);
        setCharacterEditor(null);
        notify("Character deleted.", "danger");
      }
    });
  }

  function addOrganization() {
    setOrganizationEditor(emptyOrganization());
  }

  function saveOrganization(organization) {
    setDatabase((current) => {
      const exists = current.organizations.some(
        (item) => item.id === organization.id
      );

      return {
        ...current,
        organizations: exists
          ? current.organizations.map((item) =>
              item.id === organization.id
                ? organization
                : item
            )
          : [...current.organizations, organization]
      };
    });

    setOrganizationEditor(null);
    notify("Organization saved.");
  }

  function deleteOrganization(id) {
    setConfirm({
      title: "Delete organization?",
      message: "The organization will be removed.",
      danger: true,
      action: () => {
        setDatabase((current) => ({
          ...current,
          organizations: current.organizations.filter(
            (item) => item.id !== id
          )
        }));

        notify("Organization deleted.", "danger");
      }
    });
  }

  function saveBranch(branch) {
    setDatabase((current) => {
      const exists = current.branches.some(
        (item) => item.id === branch.id
      );

      return {
        ...current,
        branches: exists
          ? current.branches.map((item) =>
              item.id === branch.id ? branch : item
            )
          : [...current.branches, branch]
      };
    });

    notify("Branch saved.");
  }

  function deleteBranch(id) {
    setConfirm({
      title: "Delete branch?",
      message: "This branch will be removed.",
      danger: true,
      action: () => {
        setDatabase((current) => ({
          ...current,
          branches: current.branches.filter(
            (item) => item.id !== id
          )
        }));

        notify("Branch deleted.", "danger");
      }
    });
  }

  function saveCase(item) {
    setDatabase((current) => {
      const exists = current.cases.some(
        (caseItem) => caseItem.id === item.id
      );

      return {
        ...current,
        cases: exists
          ? current.cases.map((caseItem) =>
              caseItem.id === item.id ? item : caseItem
            )
          : [...current.cases, item]
      };
    });

    setCaseEditor(null);
    notify("Investigation case saved.");
  }

  function deleteCase(id) {
    setConfirm({
      title: "Delete case?",
      message: "This investigation will be permanently deleted.",
      danger: true,
      action: () => {
        setDatabase((current) => ({
          ...current,
          cases: current.cases.filter((item) => item.id !== id)
        }));

        setSelectedCase(null);
        notify("Case deleted.", "danger");
      }
    });
  }

  function saveLore(item) {
    setDatabase((current) => {
      const exists = current.lore.some(
        (loreItem) => loreItem.id === item.id
      );

      return {
        ...current,
        lore: exists
          ? current.lore.map((loreItem) =>
              loreItem.id === item.id ? item : loreItem
            )
          : [...current.lore, item]
      };
    });

    setLoreEditor(null);
    notify("Lore entry saved.");
  }

  function deleteLore(id) {
    setConfirm({
      title: "Delete lore?",
      message: "This lore entry will be deleted.",
      danger: true,
      action: () => {
        setDatabase((current) => ({
          ...current,
          lore: current.lore.filter((item) => item.id !== id)
        }));

        notify("Lore deleted.", "danger");
      }
    });
  }

  function savePost(item) {
    setDatabase((current) => {
      const exists = current.posts.some(
        (post) => post.id === item.id
      );

      return {
        ...current,
        posts: exists
          ? current.posts.map((post) =>
              post.id === item.id ? item : post
            )
          : [...current.posts, item]
      };
    });

    setPostEditor(null);
    notify("Post saved.");
  }

  function deletePost(id) {
    setConfirm({
      title: "Delete post?",
      message: "This post will be deleted.",
      danger: true,
      action: () => {
        setDatabase((current) => ({
          ...current,
          posts: current.posts.filter((item) => item.id !== id)
        }));

        notify("Post deleted.", "danger");
      }
    });
  }

  function resetDatabase() {
    setConfirm({
      title: "Reset everything?",
      message:
        "Every character, organization, case, lore entry and post will be permanently deleted.",
      danger: true,
      action: () => {
        const fresh = {
          ...emptyDatabase,
          settings: {
            theme
          }
        };

        setDatabase(fresh);
        setSelectedCharacter(null);
        setSelectedOrganization(null);
        setSelectedCase(null);
        setSelectedLore(null);

        notify("Database reset.", "danger");
      }
    });
  }

  function exportDatabase() {
    const blob = new Blob(
      [JSON.stringify(database, null, 2)],
      {
        type: "application/json"
      }
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "ocfiles-backup.json";
    anchor.click();

    URL.revokeObjectURL(url);

    notify("Backup exported.");
  }

  function importDatabase(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);

        if (
          !imported ||
          typeof imported !== "object"
        ) {
          throw new Error("Invalid file");
        }

        setDatabase({
          ...emptyDatabase,
          ...imported,
          settings: {
            ...emptyDatabase.settings,
            ...(imported.settings || {})
          }
        });

        notify("Backup imported.");
      } catch {
        notify(
          "That file is not a valid OcFiles backup.",
          "danger"
        );
      }
    };

    reader.readAsText(file);

    event.target.value = "";
  }

  const filteredCharacters = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return database.characters;

    return database.characters.filter((character) => {
      const text = JSON.stringify(character).toLowerCase();

      return text.includes(term);
    });
  }, [database.characters, search]);

  const selectedCharacterObject = database.characters.find(
    (character) => character.id === selectedCharacter
  );

  const selectedOrganizationObject =
    database.organizations.find(
      (organization) =>
        organization.id === selectedOrganization
    );

  const selectedCaseObject = database.cases.find(
    (item) => item.id === selectedCase
  );

  const selectedLoreObject = database.lore.find(
    (item) => item.id === selectedLore
  );

  return (
    <div className="app-shell">
      <Sidebar
        page={page}
        navigate={navigate}
        database={database}
      />

      <div className="main-area">
        <MobileHeader
          page={page}
          navigate={navigate}
        />

        <TopBar
          page={page}
          search={search}
          setSearch={setSearch}
          onNew={page === "characters" ? addCharacter : undefined}
        />

        <main className="content">
          {page === "dashboard" && (
            <Dashboard
              database={database}
              navigate={navigate}
              onCharacter={(id) => {
                setPage("characters");
                setSelectedCharacter(id);
              }}
            />
          )}

          {page === "characters" && (
            <CharactersPage
              characters={filteredCharacters}
              allCharacters={database.characters}
              organizations={database.organizations}
              search={search}
              onAdd={addCharacter}
              onSelect={setSelectedCharacter}
              onEdit={(character) =>
                setCharacterEditor(
                  normalizeCharacter(character)
                )
              }
              onDelete={deleteCharacter}
            />
          )}

          {page === "organizations" && (
            <OrganizationsPage
              organizations={database.organizations}
              characters={database.characters}
              onAdd={addOrganization}
              onSelect={setSelectedOrganization}
              onEdit={setOrganizationEditor}
              onDelete={deleteOrganization}
            />
          )}

          {page === "branches" && (
            <BranchesPage
              branches={database.branches}
              organizations={database.organizations}
              characters={database.characters}
              onSave={saveBranch}
              onDelete={deleteBranch}
            />
          )}

          {page === "relationships" && (
            <RelationshipsPage
              characters={database.characters}
            />
          )}

          {page === "cases" && (
            <CasesPage
              cases={database.cases}
              characters={database.characters}
              onAdd={() => setCaseEditor(emptyCase())}
              onSelect={setSelectedCase}
              onEdit={setCaseEditor}
              onDelete={deleteCase}
            />
          )}

          {page === "lore" && (
            <LorePage
              lore={database.lore}
              characters={database.characters}
              organizations={database.organizations}
              onAdd={() => setLoreEditor(emptyLore())}
              onSelect={setSelectedLore}
              onEdit={setLoreEditor}
              onDelete={deleteLore}
            />
          )}

          {page === "posts" && (
            <PostsPage
              posts={database.posts}
              onAdd={() => setPostEditor(emptyPost())}
              onEdit={setPostEditor}
              onSave={savePost}
              onDelete={deletePost}
            />
          )}

          {page === "settings" && (
            <SettingsPage
              theme={theme}
              setTheme={setTheme}
              database={database}
              exportDatabase={exportDatabase}
              importDatabase={importDatabase}
              resetDatabase={resetDatabase}
            />
          )}
        </main>
      </div>

      {selectedCharacterObject && (
        <CharacterModal
          character={selectedCharacterObject}
          characters={database.characters}
          organizations={database.organizations}
          branches={database.branches}
          onClose={() => setSelectedCharacter(null)}
          onEdit={() =>
            setCharacterEditor(
              normalizeCharacter(selectedCharacterObject)
            )
          }
          onDelete={() =>
            deleteCharacter(selectedCharacterObject.id)
          }
        />
      )}

      {characterEditor && (
        <CharacterEditor
          character={characterEditor}
          characters={database.characters}
          organizations={database.organizations}
          branches={database.branches}
          onClose={() => setCharacterEditor(null)}
          onSave={saveCharacter}
          onDelete={
            database.characters.some(
              (item) => item.id === characterEditor.id
            )
              ? () => deleteCharacter(characterEditor.id)
              : undefined
          }
        />
      )}

      {selectedOrganizationObject && (
        <OrganizationModal
          organization={selectedOrganizationObject}
          characters={database.characters}
          branches={database.branches}
          onClose={() => setSelectedOrganization(null)}
          onEdit={() =>
            setOrganizationEditor(selectedOrganizationObject)
          }
          onDelete={() =>
            deleteOrganization(
              selectedOrganizationObject.id
            )
          }
        />
      )}

      {organizationEditor && (
        <OrganizationEditor
          organization={organizationEditor}
          characters={database.characters}
          onClose={() => setOrganizationEditor(null)}
          onSave={saveOrganization}
        />
      )}

      {selectedCaseObject && (
        <CaseModal
          caseItem={selectedCaseObject}
          characters={database.characters}
          onClose={() => setSelectedCase(null)}
          onEdit={() => setCaseEditor(selectedCaseObject)}
          onDelete={() =>
            deleteCase(selectedCaseObject.id)
          }
        />
      )}

      {caseEditor && (
        <CaseEditor
          caseItem={caseEditor}
          characters={database.characters}
          onClose={() => setCaseEditor(null)}
          onSave={saveCase}
        />
      )}

      {selectedLoreObject && (
        <LoreModal
          lore={selectedLoreObject}
          characters={database.characters}
          organizations={database.organizations}
          onClose={() => setSelectedLore(null)}
          onEdit={() => setLoreEditor(selectedLoreObject)}
          onDelete={() =>
            deleteLore(selectedLoreObject.id)
          }
        />
      )}

      {loreEditor && (
        <LoreEditor
          lore={loreEditor}
          characters={database.characters}
          organizations={database.organizations}
          onClose={() => setLoreEditor(null)}
          onSave={saveLore}
        />
      )}

      {postEditor && (
        <PostEditor
          post={postEditor}
          onClose={() => setPostEditor(null)}
          onSave={savePost}
        />
      )}

      {confirm && (
        <ConfirmModal
          {...confirm}
          onClose={() => setConfirm(null)}
          onConfirm={() => {
            confirm.action();
            setConfirm(null);
          }}
        />
      )}

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === "success" ? "✓" : "!"}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar({ page, navigate, database }) {
  return (
    <aside className="sidebar">
      <div className="brand" onClick={() => navigate("dashboard")}>
        <div className="brand-mark">OC</div>

        <div>
          <strong>OcFiles</strong>
          <span>Character Archive</span>
        </div>
      </div>

      <nav className="navigation">
        {navItems.map(([id, icon, label]) => (
          <button
            key={id}
            className={`nav-item ${
              page === id ? "active" : ""
            }`}
            onClick={() => navigate(id)}
          >
            <span className="nav-icon">{icon}</span>
            <span>{label}</span>

            {id === "characters" &&
              database.characters.length > 0 && (
                <small>{database.characters.length}</small>
              )}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="database-mini">
          <span>DATABASE</span>
          <strong>
            {database.characters.length} characters
          </strong>
        </div>

        <div className="database-mini">
          <span>STORAGE</span>
          <strong>Local</strong>
        </div>
      </div>
    </aside>
  );
}

function MobileHeader({ page, navigate }) {
  return (
    <div className="mobile-header">
      <button
        className="mobile-brand"
        onClick={() => navigate("dashboard")}
      >
        <span className="brand-mark">OC</span>
        <strong>OcFiles</strong>
      </button>

      <select
        value={page}
        onChange={(event) => navigate(event.target.value)}
      >
        {navItems.map(([id, , label]) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}

function TopBar({
  page,
  search,
  setSearch,
  onNew
}) {
  const current = navItems.find(
    ([id]) => id === page
  );

  return (
    <header className="topbar">
      <div>
        <div className="eyebrow">
          {current?.[1]} OCFILES
        </div>

        <h1>{current?.[2] || "Dashboard"}</h1>
      </div>

      <div className="topbar-actions">
        {page !== "settings" &&
          page !== "dashboard" && (
            <label className="global-search">
              <span>⌕</span>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search..."
              />
            </label>
          )}

        {onNew && (
          <button
            className="button primary"
            onClick={onNew}
          >
            + New
          </button>
        )}
      </div>
    </header>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  database,
  navigate,
  onCharacter
}) {
  const recentCharacters = [...database.characters]
    .sort(
      (a, b) =>
        new Date(b.updatedAt || 0) -
        new Date(a.updatedAt || 0)
    )
    .slice(0, 6);

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div>
          <span className="eyebrow">PERSONAL ARCHIVE</span>

          <h2>
            Welcome to
            <br />
            <em>OcFiles.</em>
          </h2>

          <p>
            Your private database for original characters,
            relationships, organizations, mysteries and lore.
          </p>

          <div className="hero-actions">
            <button
              className="button primary"
              onClick={() => navigate("characters")}
            >
              Open Characters
            </button>

            <button
              className="button ghost"
              onClick={() => navigate("cases")}
            >
              Investigations
            </button>
          </div>
        </div>

        <div className="hero-symbol">
          ♢
          <span>OC</span>
        </div>
      </section>

      <div className="stats-grid">
        <StatCard
          icon="♟"
          label="Characters"
          value={database.characters.length}
          onClick={() => navigate("characters")}
        />

        <StatCard
          icon="♜"
          label="Organizations"
          value={database.organizations.length}
          onClick={() => navigate("organizations")}
        />

        <StatCard
          icon="⚠"
          label="Open cases"
          value={
            database.cases.filter(
              (item) => item.status === "Open"
            ).length
          }
          onClick={() => navigate("cases")}
        />

        <StatCard
          icon="◈"
          label="Lore entries"
          value={database.lore.length}
          onClick={() => navigate("lore")}
        />
      </div>

      <section className="section">
        <SectionHeader
          title="Recent characters"
          subtitle="Recently modified files"
          action="View all"
          onAction={() => navigate("characters")}
        />

        {recentCharacters.length === 0 ? (
          <EmptyState
            icon="♟"
            title="No characters yet"
            text="Create your first OC to start building the archive."
            button="Create character"
            onClick={() => navigate("characters")}
          />
        ) : (
          <div className="character-grid compact">
            {recentCharacters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onClick={() => onCharacter(character.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <SectionHeader
          title="Quick access"
          subtitle="Jump into your archive"
        />

        <div className="quick-grid">
          <QuickCard
            icon="♡"
            title="Relationships"
            text="See connections between your characters."
            onClick={() => navigate("relationships")}
          />

          <QuickCard
            icon="⚠"
            title="Investigation"
            text="Track mysteries, clues, suspects and evidence."
            onClick={() => navigate("cases")}
          />

          <QuickCard
            icon="◈"
            title="Lore"
            text="Keep your worldbuilding organized."
            onClick={() => navigate("lore")}
          />

          <QuickCard
            icon="✦"
            title="Posts"
            text="Write notes, updates and in-universe posts."
            onClick={() => navigate("posts")}
          />
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  onClick
}) {
  return (
    <button className="stat-card" onClick={onClick}>
      <span className="stat-icon">{icon}</span>

      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </button>
  );
}

function QuickCard({
  icon,
  title,
  text,
  onClick
}) {
  return (
    <button className="quick-card" onClick={onClick}>
      <span className="quick-icon">{icon}</span>

      <strong>{title}</strong>

      <p>{text}</p>
    </button>
  );
}

/* =========================================================
   CHARACTERS
========================================================= */

function CharactersPage({
  characters,
  allCharacters,
  organizations,
  onAdd,
  onSelect,
  onEdit,
  onDelete
}) {
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("name");

  const visible = characters
    .filter((character) => {
      if (status === "All") return true;
      return character.status === status;
    })
    .sort((a, b) => {
      if (sort === "name") {
        return displayName(a).localeCompare(
          displayName(b)
        );
      }

      if (sort === "age") {
        return Number(a.age || 0) - Number(b.age || 0);
      }

      return (
        new Date(b.updatedAt || 0) -
        new Date(a.updatedAt || 0)
      );
    });

  return (
    <div className="page-stack">
      <section className="page-intro">
        <div>
          <span className="eyebrow">ARCHIVE / FILES</span>
          <h2>Character Files</h2>
          <p>
            {allCharacters.length} total character
            {allCharacters.length === 1 ? "" : "s"}.
          </p>
        </div>

        <button className="button primary" onClick={onAdd}>
          + Create character
        </button>
      </section>

      <div className="toolbar">
        <div className="filter-group">
          {["All", "Alive", "Dead"].map((item) => (
            <button
              key={item}
              className={`filter ${
                status === item ? "active" : ""
              }`}
              onClick={() => setStatus(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <select
          className="select small"
          value={sort}
          onChange={(event) => setSort(event.target.value)}
        >
          <option value="name">Sort: Name</option>
          <option value="age">Sort: Age</option>
          <option value="updated">Sort: Updated</option>
        </select>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon="♟"
          title="No matching characters"
          text="Try another filter or create a new character."
          button="Create character"
          onClick={onAdd}
        />
      ) : (
        <div className="character-grid">
          {visible.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              organizations={organizations}
              onClick={() => onSelect(character.id)}
              onEdit={() => onEdit(character)}
              onDelete={() => onDelete(character.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CharacterCard({
  character,
  organizations = [],
  onClick,
  onEdit,
  onDelete
}) {
  const org = organizations.find(
    (item) => item.id === character.affiliation
  );

  return (
    <article
      className="character-card card"
      onClick={onClick}
    >
      <div className="character-cover">
        {character.picture ? (
          <img
            src={character.picture}
            alt={displayName(character)}
          />
        ) : (
          <div className="character-initials">
            {initials(character)}
          </div>
        )}

        <span
          className={`status-dot ${
            character.status === "Dead"
              ? "dead"
              : ""
          }`}
        />
      </div>

      <div className="character-card-body">
        <div className="character-name-row">
          <div>
            <h3>{displayName(character)}</h3>

            {character.nickname && (
              <span className="nickname">
                "{character.nickname}"
              </span>
            )}
          </div>

          <span className="mbti">
            {character.mbti || "—"}
          </span>
        </div>

        <div className="mini-details">
          <span>
            {character.age
              ? `${character.age} years`
              : "Age unknown"}
          </span>

          <span>
            {character.pronouns || "Pronouns —"}
          </span>
        </div>

        {org && (
          <div className="tag">
            ♜ {org.name}
          </div>
        )}

        <div
          className="card-actions"
          onClick={(event) => event.stopPropagation()}
        >
          {onEdit && (
            <button
              className="icon-button"
              onClick={onEdit}
              title="Edit"
            >
              ✎
            </button>
          )}

          {onDelete && (
            <button
              className="icon-button danger"
              onClick={onDelete}
              title="Delete"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   CHARACTER MODAL
========================================================= */

function CharacterModal({
  character,
  characters,
  organizations,
  branches,
  onClose,
  onEdit,
  onDelete
}) {
  const organization = organizations.find(
    (item) => item.id === character.affiliation
  );

  return (
    <Modal
      title={displayName(character)}
      subtitle="Character file"
      onClose={onClose}
      wide
      actions={
        <>
          <button className="button ghost" onClick={onEdit}>
            Edit
          </button>

          <button
            className="button danger"
            onClick={onDelete}
          >
            Delete
          </button>
        </>
      }
    >
      <div className="character-profile">
        <div className="profile-header">
          <div className="profile-picture">
            {character.picture ? (
              <img
                src={character.picture}
                alt={displayName(character)}
              />
            ) : (
              initials(character)
            )}
          </div>

          <div className="profile-title">
            <span className="eyebrow">
              {character.status || "STATUS UNKNOWN"}
            </span>

            <h2>{displayName(character)}</h2>

            {character.nickname && (
              <p>"{character.nickname}"</p>
            )}

            <div className="tag-row">
              {character.mbti && (
                <span className="tag">{character.mbti}</span>
              )}

              {character.gender && (
                <span className="tag">
                  {character.gender}
                </span>
              )}

              {character.pronouns && (
                <span className="tag">
                  {character.pronouns}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="detail-grid">
          <Info
            label="Name"
            value={character.name}
          />

          <Info
            label="Last name"
            value={character.lastName}
          />

          <Info
            label="Age"
            value={character.age}
          />

          <Info
            label="Date of birth"
            value={character.dateOfBirth}
          />

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
            label="Sexuality"
            value={character.sexuality}
          />

          <Info
            label="Job"
            value={character.job}
          />

          <Info
            label="Side job"
            value={character.sideJob}
          />

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

          <Info
            label="Affiliation"
            value={organization?.name}
          />

          <Info
            label="Past affiliation"
            value={character.pastAffiliation}
          />

          <Info
            label="Rank"
            value={character.rank}
          />

          <Info
            label="Past rank"
            value={character.pastRank}
          />

          <Info
            label="Later status"
            value={character.laterStatus}
          />
        </div>

        <ProfileTextSection
          title="Abilities"
          text={character.abilities}
        />

        <ProfileTextSection
          title="Effects of abilities"
          text={character.abilityEffects}
        />

        <ProfileTextSection
          title="Weapon"
          text={character.weapon}
        />

        <div className="profile-two-column">
          <ListSection
            title="Likes"
            items={character.likes}
          />

          <ListSection
            title="Dislikes"
            items={character.dislikes}
          />

          <ListSection
            title="Fears"
            items={character.fears}
          />

          <ListSection
            title="Addictions"
            items={character.addictions}
          />
        </div>

        <section className="profile-section">
          <SectionHeader
            title="Personality"
            subtitle="Character spectrum"
          />

          <div className="traits-list">
            {personalityTraits.map(
              ([key, left, right]) => (
                <TraitBar
                  key={key}
                  left={left}
                  right={right}
                  value={character.personality[key]}
                />
              )
            )}
          </div>
        </section>

        <section className="profile-section">
          <SectionHeader
            title="Skills"
            subtitle="Five-level rating"
          />

          <div className="skill-grid">
            {skillDefinitions.map(
              ([key, label]) => (
                <SkillBar
                  key={key}
                  label={label}
                  value={character.skills[key]}
                />
              )
            )}
          </div>
        </section>

        <section className="profile-section">
          <SectionHeader
            title="Social stats"
            subtitle="Five-level rating"
          />

          <div className="skill-grid">
            {socialDefinitions.map(
              ([key, label]) => (
                <SkillBar
                  key={key}
                  label={label}
                  value={character.socials[key]}
                />
              )
            )}
          </div>
        </section>

        <ProfileTextSection
          title="Sickness"
          text={character.sickness}
        />

        <ProfileTextSection
          title="Anecdotes / extra"
          text={character.anecdotes}
        />

        <ProfileTextSection
          title="Songs"
          text={character.songs}
        />

        <ProfileTextSection
          title="Lyrics"
          text={character.lyrics}
        />

        <ProfileTextSection
          title="Quotes"
          text={character.quotes}
        />

        <ProfileTextSection
          title="Notes"
          text={character.notes}
        />

        <section className="profile-section">
          <SectionHeader
            title="Relationships"
            subtitle={`${character.relationships.length} connection${
              character.relationships.length === 1
                ? ""
                : "s"
            }`}
          />

          {character.relationships.length === 0 ? (
            <EmptyInline text="No relationships added." />
          ) : (
            <div className="relationship-list">
              {character.relationships.map(
                (relationship, index) => {
                  const target = characters.find(
                    (item) =>
                      item.id === relationship.characterId
                  );

                  return (
                    <div
                      className="relationship-card"
                      key={`${relationship.characterId}-${index}`}
                    >
                      <div className="relationship-avatar">
                        {target
                          ? initials(target)
                          : "?"}
                      </div>

                      <div>
                        <strong>
                          {target
                            ? displayName(target)
                            : "Unknown character"}
                        </strong>

                        <span>
                          {relationship.type ||
                            "Relationship"}
                        </span>

                        {relationship.status && (
                          <small>
                            {relationship.status}
                          </small>
                        )}
                      </div>

                      {relationship.description && (
                        <p>
                          {relationship.description}
                        </p>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>

        <section className="profile-section">
          <SectionHeader
            title="Mood board"
            subtitle={`${character.moodboard.length} image${
              character.moodboard.length === 1
                ? ""
                : "s"
            }`}
          />

          {character.moodboard.length === 0 ? (
            <EmptyInline text="No mood board images." />
          ) : (
            <div className="moodboard">
              {character.moodboard.map(
                (image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Mood board ${index + 1}`}
                  />
                )
              )}
            </div>
          )}
        </section>

        {branches.length > 0 && (
          <section className="profile-section">
            <SectionHeader
              title="Connected branches"
            />

            <div className="tag-row">
              {branches
                .filter((branch) =>
                  branch.members?.includes(character.id)
                )
                .map((branch) => (
                  <span
                    className="tag"
                    key={branch.id}
                  >
                    ⌘ {branch.name}
                  </span>
                ))}
            </div>
          </section>
        )}
      </div>
    </Modal>
  );
}

/* =========================================================
   CHARACTER EDITOR
========================================================= */

function CharacterEditor({
  character,
  characters,
  organizations,
  branches,
  onClose,
  onSave,
  onDelete
}) {
  const [form, setForm] = useState(
    normalizeCharacter(character)
  );

  const [activeTab, setActiveTab] = useState("identity");

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function updateNested(group, field, value) {
    setForm((current) => ({
      ...current,
      [group]: {
        ...current[group],
        [field]: value
      }
    }));
  }

  function addListItem(field) {
    setForm((current) => ({
      ...current,
      [field]: [
        ...(current[field] || []),
        ""
      ]
    }));
  }

  function updateListItem(field, index, value) {
    setForm((current) => ({
      ...current,
      [field]: current[field].map(
        (item, itemIndex) =>
          itemIndex === index ? value : item
      )
    }));
  }

  function removeListItem(field, index) {
    setForm((current) => ({
      ...current,
      [field]: current[field].filter(
        (_, itemIndex) => itemIndex !== index
      )
    }));
  }

  function addRelationship() {
    setForm((current) => ({
      ...current,
      relationships: [
        ...current.relationships,
        {
          characterId: "",
          type: "",
          status: "",
          description: ""
        }
      ]
    }));
  }

  function updateRelationship(
    index,
    field,
    value
  ) {
    setForm((current) => ({
      ...current,
      relationships: current.relationships.map(
        (relationship, relationshipIndex) =>
          relationshipIndex === index
            ? {
                ...relationship,
                [field]: value
              }
            : relationship
      )
    }));
  }

  function removeRelationship(index) {
    setForm((current) => ({
      ...current,
      relationships: current.relationships.filter(
        (_, relationshipIndex) =>
          relationshipIndex !== index
      )
    }));
  }

  const tabs = [
    ["identity", "Identity"],
    ["appearance", "Appearance"],
    ["story", "Story"],
    ["personality", "Personality"],
    ["skills", "Skills"],
    ["relationships", "Relationships"],
    ["extras", "Extras"]
  ];

  return (
    <Modal
      title={
        displayName(form) === "Unnamed Character"
          ? "New Character"
          : displayName(form)
      }
      subtitle="Character editor"
      onClose={onClose}
      wide
      extraClass="editor-modal"
      actions={
        <>
          {onDelete && (
            <button
              className="button danger"
              onClick={onDelete}
            >
              Delete
            </button>
          )}

          <button
            className="button primary"
            onClick={() => onSave(form)}
          >
            Save character
          </button>
        </>
      }
    >
      <div className="editor-tabs">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            className={
              activeTab === id ? "active" : ""
            }
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "identity" && (
        <div className="form-section">
          <FormSectionTitle
            title="Identity"
            text="Basic information about the character."
          />

          <div className="form-grid">
            <TextField
              label="Name"
              value={form.name}
              onChange={(value) =>
                update("name", value)
              }
            />

            <TextField
              label="Last name"
              value={form.lastName}
              onChange={(value) =>
                update("lastName", value)
              }
            />

            <TextField
              label="Nickname(s)"
              value={form.nickname}
              onChange={(value) =>
                update("nickname", value)
              }
            />

            <TextField
              label="Age"
              type="number"
              value={form.age}
              onChange={(value) =>
                update("age", value)
              }
            />

            <TextField
              label="Date of birth"
              type="date"
              value={form.dateOfBirth}
              onChange={(value) =>
                update("dateOfBirth", value)
              }
            />

            <TextField
              label="Gender"
              value={form.gender}
              onChange={(value) =>
                update("gender", value)
              }
            />

            <TextField
              label="Pronouns"
              value={form.pronouns}
              onChange={(value) =>
                update("pronouns", value)
              }
            />

            <TextField
              label="Sexuality"
              value={form.sexuality}
              onChange={(value) =>
                update("sexuality", value)
              }
            />

            <TextField
              label="Nationality"
              value={form.nationality}
              onChange={(value) =>
                update("nationality", value)
              }
            />

            <TextField
              label="Origins"
              value={form.origins}
              onChange={(value) =>
                update("origins", value)
              }
            />

            <TextField
              label="Species / race"
              value={form.species}
              onChange={(value) =>
                update("species", value)
              }
            />

            <TextField
              label="MBTI"
              value={form.mbti}
              placeholder="e.g. INFP"
              onChange={(value) =>
                update("mbti", value)
              }
            />

            <SelectField
              label="Current status"
              value={form.status}
              options={[
                "Alive",
                "Dead",
                "Unknown",
                "Missing"
              ]}
              onChange={(value) =>
                update("status", value)
              }
            />

            <TextField
              label="Later status"
              value={form.laterStatus}
              onChange={(value) =>
                update("laterStatus", value)
              }
            />

            <TextField
              label="Rank"
              value={form.rank}
              onChange={(value) =>
                update("rank", value)
              }
            />

            <TextField
              label="Past rank"
              value={form.pastRank}
              onChange={(value) =>
                update("pastRank", value)
              }
            />

            <TextField
              label="Job"
              value={form.job}
              onChange={(value) =>
                update("job", value)
              }
            />

            <TextField
              label="Side job"
              value={form.sideJob}
              onChange={(value) =>
                update("sideJob", value)
              }
            />

            <SelectField
              label="Affiliation"
              value={form.affiliation}
              options={[
                {
                  value: "",
                  label: "None"
                },
                ...organizations.map(
                  (organization) => ({
                    value: organization.id,
                    label: organization.name
                  })
                )
              ]}
              onChange={(value) =>
                update("affiliation", value)
              }
            />

            <TextField
              label="Past affiliation"
              value={form.pastAffiliation}
              onChange={(value) =>
                update("pastAffiliation", value)
              }
            />
          </div>
        </div>
      )}

      {activeTab === "appearance" && (
        <div className="form-section">
          <FormSectionTitle
            title="Appearance"
            text="Physical characteristics and visual references."
          />

          <div className="form-grid">
            <TextField
              label="Height"
              value={form.height}
              placeholder="e.g. 172 cm"
              onChange={(value) =>
                update("height", value)
              }
            />

            <TextField
              label="Weight"
              value={form.weight}
              placeholder="e.g. 61 kg"
              onChange={(value) =>
                update("weight", value)
              }
            />

            <TextField
              label="Eye color"
              value={form.eyeColor}
              onChange={(value) =>
                update("eyeColor", value)
              }
            />

            <TextField
              label="Hair color"
              value={form.hairColor}
              onChange={(value) =>
                update("hairColor", value)
              }
            />

            <TextField
              label="Hair style"
              value={form.hairStyle}
              onChange={(value) =>
                update("hairStyle", value)
              }
            />
          </div>

          <ImageUpload
            label="Character picture"
            value={form.picture}
            onChange={(value) =>
              update("picture", value)
            }
          />

          <ImageListEditor
            label="Mood board"
            values={form.moodboard}
            onChange={(values) =>
              update("moodboard", values)
            }
          />
        </div>
      )}

      {activeTab === "story" && (
        <div className="form-section">
          <FormSectionTitle
            title="Story & abilities"
            text="Lore, powers, weapons and personal details."
          />

          <TextArea
            label="Abilities"
            value={form.abilities}
            rows={5}
            onChange={(value) =>
              update("abilities", value)
            }
          />

          <TextArea
            label="Effects of abilities"
            value={form.abilityEffects}
            rows={4}
            onChange={(value) =>
              update("abilityEffects", value)
            }
          />

          <TextArea
            label="Weapon"
            value={form.weapon}
            rows={3}
            onChange={(value) =>
              update("weapon", value)
            }
          />

          <TextArea
            label="Sickness"
            value={form.sickness}
            rows={3}
            onChange={(value) =>
              update("sickness", value)
            }
          />

          <div className="form-grid">
            <ListEditor
              label="Likes"
              values={form.likes}
              onAdd={() => addListItem("likes")}
              onChange={(index, value) =>
                updateListItem(
                  "likes",
                  index,
                  value
                )
              }
              onRemove={(index) =>
                removeListItem("likes", index)
              }
            />

            <ListEditor
              label="Dislikes"
              values={form.dislikes}
              onAdd={() => addListItem("dislikes")}
              onChange={(index, value) =>
                updateListItem(
                  "dislikes",
                  index,
                  value
                )
              }
              onRemove={(index) =>
                removeListItem(
                  "dislikes",
                  index
                )
              }
            />

            <ListEditor
              label="Fears"
              values={form.fears}
              onAdd={() => addListItem("fears")}
              onChange={(index, value) =>
                updateListItem(
                  "fears",
                  index,
                  value
                )
              }
              onRemove={(index) =>
                removeListItem("fears", index)
              }
            />

            <ListEditor
              label="Addictions"
              values={form.addictions}
              onAdd={() =>
                addListItem("addictions")
              }
              onChange={(index, value) =>
                updateListItem(
                  "addictions",
                  index,
                  value
                )
              }
              onRemove={(index) =>
                removeListItem(
                  "addictions",
                  index
                )
              }
            />
          </div>

          <TextArea
            label="Anecdotes / extra stuff"
            value={form.anecdotes}
            rows={5}
            onChange={(value) =>
              update("anecdotes", value)
            }
          />

          <TextArea
            label="Songs"
            value={form.songs}
            rows={4}
            placeholder="One song per line"
            onChange={(value) =>
              update("songs", value)
            }
          />

          <TextArea
            label="Lyrics"
            value={form.lyrics}
            rows={5}
            onChange={(value) =>
              update("lyrics", value)
            }
          />

          <TextArea
            label="Quotes"
            value={form.quotes}
            rows={5}
            onChange={(value) =>
              update("quotes", value)
            }
          />

          <TextArea
            label="Notes"
            value={form.notes}
            rows={6}
            onChange={(value) =>
              update("notes", value)
            }
          />
        </div>
      )}

      {activeTab === "personality" && (
        <div className="form-section">
          <FormSectionTitle
            title="Personality"
            text="Move each slider toward the trait that fits the character."
          />

          <div className="editor-traits">
            {personalityTraits.map(
              ([key, left, right]) => (
                <TraitEditor
                  key={key}
                  left={left}
                  right={right}
                  value={form.personality[key]}
                  onChange={(value) =>
                    updateNested(
                      "personality",
                      key,
                      Number(value)
                    )
                  }
                />
              )
            )}
          </div>
        </div>
      )}

      {activeTab === "skills" && (
        <div className="form-section">
          <FormSectionTitle
            title="Skills & socials"
            text="Every skill uses a five-level rating."
          />

          <div className="editor-skill-grid">
            {skillDefinitions.map(
              ([key, label]) => (
                <SkillEditor
                  key={key}
                  label={label}
                  value={form.skills[key]}
                  onChange={(value) =>
                    updateNested(
                      "skills",
                      key,
                      Number(value)
                    )
                  }
                />
              )
            )}
          </div>

          <FormSectionTitle
            title="Social statistics"
            text="Social and behavioral attributes."
          />

          <div className="editor-skill-grid">
            {socialDefinitions.map(
              ([key, label]) => (
                <SkillEditor
                  key={key}
                  label={label}
                  value={form.socials[key]}
                  onChange={(value) =>
                    updateNested(
                      "socials",
                      key,
                      Number(value)
                    )
                  }
                />
              )
            )}
          </div>
        </div>
      )}

      {activeTab === "relationships" && (
        <div className="form-section">
          <FormSectionTitle
            title="Relationships"
            text="Directly connect this character to other character files."
          />

          <button
            className="button secondary"
            onClick={addRelationship}
          >
            + Add relationship
          </button>

          <div className="editor-relationships">
            {form.relationships.map(
              (relationship, index) => (
                <div
                  className="relationship-editor"
                  key={index}
                >
                  <div className="form-grid">
                    <SelectField
                      label="Character"
                      value={relationship.characterId}
                      options={[
                        {
                          value: "",
                          label: "Select character"
                        },
                        ...characters
                          .filter(
                            (item) =>
                              item.id !== form.id
                          )
                          .map((item) => ({
                            value: item.id,
                            label: displayName(item)
                          }))
                      ]}
                      onChange={(value) =>
                        updateRelationship(
                          index,
                          "characterId",
                          value
                        )
                      }
                    />

                    <TextField
                      label="Relationship type"
                      value={relationship.type}
                      placeholder="Friend, sibling, enemy..."
                      onChange={(value) =>
                        updateRelationship(
                          index,
                          "type",
                          value
                        )
                      }
                    />

                    <TextField
                      label="Status"
                      value={relationship.status}
                      placeholder="Complicated, close..."
                      onChange={(value) =>
                        updateRelationship(
                          index,
                          "status",
                          value
                        )
                      }
                    />
                  </div>

                  <TextArea
                    label="Description"
                    value={
                      relationship.description
                    }
                    rows={3}
                    onChange={(value) =>
                      updateRelationship(
                        index,
                        "description",
                        value
                      )
                    }
                  />

                  <button
                    className="text-danger"
                    onClick={() =>
                      removeRelationship(index)
                    }
                  >
                    Remove relationship
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {activeTab === "extras" && (
        <div className="form-section">
          <FormSectionTitle
            title="Extra connections"
            text="Connect this character to branches and other archive systems."
          />

          <div className="form-grid">
            <div className="field">
              <label>Branches</label>

              <div className="checkbox-list">
                {branches.map((branch) => (
                  <label
                    className="check-row"
                    key={branch.id}
                  >
                    <input
                      type="checkbox"
                      checked={
                        branch.members?.includes(
                          form.id
                        ) || false
                      }
                      onChange={(event) => {
                        const checked =
                          event.target.checked;

                        /*
                         * Branch membership is displayed
                         * here. The branch itself can also
                         * be edited from the Branches page.
                         */
                        if (!checked) return;

                        update(
                          "notes",
                          form.notes
                        );
                      }}
                    />

                    <span>{branch.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* =========================================================
   ORGANIZATIONS
========================================================= */

function OrganizationsPage({
  organizations,
  characters,
  onAdd,
  onSelect,
  onEdit,
  onDelete
}) {
  return (
    <div className="page-stack">
      <section className="page-intro">
        <div>
          <span className="eyebrow">
            ARCHIVE / FACTIONS
          </span>
          <h2>Organizations</h2>
          <p>
            Build groups, factions, agencies, clans and
            companies.
          </p>
        </div>

        <button className="button primary" onClick={onAdd}>
          + New organization
        </button>
      </section>

      {organizations.length === 0 ? (
        <EmptyState
          icon="♜"
          title="No organizations"
          text="Create an organization to connect characters to a larger structure."
          button="Create organization"
          onClick={onAdd}
        />
      ) : (
        <div className="organization-grid">
          {organizations.map((organization) => (
            <article
              className="organization-card card"
              key={organization.id}
              onClick={() => onSelect(organization.id)}
            >
              <div className="organization-symbol">
                {organization.logo || "♜"}
              </div>

              <div className="organization-content">
                <span className="eyebrow">
                  {organization.type ||
                    "ORGANIZATION"}
                </span>

                <h3>
                  {organization.name ||
                    "Unnamed organization"}
                </h3>

                <p>
                  {organization.description ||
                    "No description yet."}
                </p>

                <div className="tag-row">
                  <span className="tag">
                    {organization.members?.length ||
                      0}{" "}
                    members
                  </span>

                  <span className="tag">
                    {organization.branches?.length ||
                      0}{" "}
                    branches
                  </span>
                </div>

                <div
                  className="card-actions"
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                >
                  <button
                    className="icon-button"
                    onClick={() =>
                      onEdit(organization)
                    }
                  >
                    ✎
                  </button>

                  <button
                    className="icon-button danger"
                    onClick={() =>
                      onDelete(organization.id)
                    }
                  >
                    ×
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {organizations.length > 0 && (
        <section className="section">
          <SectionHeader
            title="Organization overview"
            subtitle="Connected character counts"
          />

          <div className="stats-grid">
            {organizations.map((organization) => (
              <StatCard
                key={organization.id}
                icon="♜"
                label={organization.name}
                value={
                  characters.filter(
                    (character) =>
                      character.affiliation ===
                      organization.id
                  ).length
                }
                onClick={() =>
                  onSelect(organization.id)
                }
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function OrganizationModal({
  organization,
  characters,
  branches,
  onClose,
  onEdit,
  onDelete
}) {
  const members = characters.filter((character) =>
    organization.members?.includes(character.id)
  );

  const linkedBranches = branches.filter((branch) =>
    organization.branches?.includes(branch.id)
  );

  return (
    <Modal
      title={organization.name || "Organization"}
      subtitle="Organization file"
      onClose={onClose}
      wide
      actions={
        <>
          <button className="button ghost" onClick={onEdit}>
            Edit
          </button>

          <button
            className="button danger"
            onClick={onDelete}
          >
            Delete
          </button>
        </>
      }
    >
      <div className="organization-profile">
        <div className="profile-header">
          <div className="organization-big-symbol">
            {organization.logo || "♜"}
          </div>

          <div className="profile-title">
            <span className="eyebrow">
              {organization.type ||
                "ORGANIZATION"}
            </span>

            <h2>{organization.name}</h2>

            <p>{organization.description}</p>
          </div>
        </div>

        <div className="detail-grid">
          <Info
            label="Leader"
            value={organization.leader}
          />

          <Info
            label="Headquarters"
            value={organization.headquarters}
          />

          <Info
            label="Members"
            value={members.length}
          />

          <Info
            label="Branches"
            value={linkedBranches.length}
          />
        </div>

        <ProfileTextSection
          title="Goals"
          text={organization.goals}
        />

        <ProfileTextSection
          title="Notes"
          text={organization.notes}
        />

        <section className="profile-section">
          <SectionHeader
            title="Members"
            subtitle={`${members.length} connected`}
          />

          {members.length === 0 ? (
            <EmptyInline text="No characters connected." />
          ) : (
            <div className="member-grid">
              {members.map((character) => (
                <div className="member-card" key={character.id}>
                  <div className="relationship-avatar">
                    {initials(character)}
                  </div>

                  <strong>
                    {displayName(character)}
                  </strong>

                  <span>
                    {character.rank || "No rank"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="profile-section">
          <SectionHeader title="Branches" />

          {linkedBranches.length === 0 ? (
            <EmptyInline text="No branches connected." />
          ) : (
            <div className="tag-row">
              {linkedBranches.map((branch) => (
                <span className="tag" key={branch.id}>
                  ⌘ {branch.name}
                </span>
              ))}
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
}

function OrganizationEditor({
  organization,
  characters,
  onClose,
  onSave
}) {
  const [form, setForm] = useState({
    ...emptyOrganization(),
    ...organization
  });

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function toggleMember(id) {
    setForm((current) => {
      const members = current.members || [];

      return {
        ...current,
        members: members.includes(id)
          ? members.filter((item) => item !== id)
          : [...members, id]
      };
    });
  }

  return (
    <Modal
      title={
        form.name || "New organization"
      }
      subtitle="Organization editor"
      onClose={onClose}
      wide
      actions={
        <button
          className="button primary"
          onClick={() => onSave(form)}
        >
          Save organization
        </button>
      }
    >
      <div className="form-section">
        <div className="form-grid">
          <TextField
            label="Name"
            value={form.name}
            onChange={(value) =>
              update("name", value)
            }
          />

          <TextField
            label="Type"
            value={form.type}
            placeholder="Agency, clan, company..."
            onChange={(value) =>
              update("type", value)
            }
          />

          <TextField
            label="Leader"
            value={form.leader}
            onChange={(value) =>
              update("leader", value)
            }
          />

          <TextField
            label="Headquarters"
            value={form.headquarters}
            onChange={(value) =>
              update("headquarters", value)
            }
          />

          <TextField
            label="Logo / symbol"
            value={form.logo}
            placeholder="♜"
            onChange={(value) =>
              update("logo", value)
            }
          />
        </div>

        <TextArea
          label="Description"
          value={form.description}
          rows={4}
          onChange={(value) =>
            update("description", value)
          }
        />

        <TextArea
          label="Goals"
          value={form.goals}
          rows={4}
          onChange={(value) =>
            update("goals", value)
          }
        />

        <TextArea
          label="Notes"
          value={form.notes}
          rows={5}
          onChange={(value) =>
            update("notes", value)
          }
        />

        <div className="field">
          <label>Members</label>

          <div className="member-selector">
            {characters.map((character) => (
              <label
                className={`member-select ${
                  form.members?.includes(character.id)
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
                    toggleMember(character.id)
                  }
                />

                <span className="relationship-avatar small">
                  {initials(character)}
                </span>

                <span>
                  {displayName(character)}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* =========================================================
   BRANCHES
========================================================= */

function BranchesPage({
  branches,
  organizations,
  characters,
  onSave,
  onDelete
}) {
  const [editing, setEditing] = useState(null);

  function startNew() {
    setEditing(emptyBranch());
  }

  function save() {
    onSave(editing);
    setEditing(null);
  }

  return (
    <div className="page-stack">
      <section className="page-intro">
        <div>
          <span className="eyebrow">
            ARCHIVE / STRUCTURE
          </span>

          <h2>Branches</h2>

          <p>
            Connect departments, divisions and locations to
            organizations.
          </p>
        </div>

        <button className="button primary" onClick={startNew}>
          + New branch
        </button>
      </section>

      {branches.length === 0 ? (
        <EmptyState
          icon="⌘"
          title="No branches"
          text="Create a branch for an organization."
          button="Create branch"
          onClick={startNew}
        />
      ) : (
        <div className="branch-grid">
          {branches.map((branch) => {
            const organization =
              organizations.find(
                (item) =>
                  item.id === branch.organizationId
              );

            const memberObjects = characters.filter(
              (character) =>
                branch.members?.includes(character.id)
            );

            return (
              <article
                className="card branch-card"
                key={branch.id}
              >
                <span className="branch-icon">⌘</span>

                <div>
                  <span className="eyebrow">
                    {organization?.name ||
                      "NO ORGANIZATION"}
                  </span>

                  <h3>{branch.name || "Unnamed branch"}</h3>

                  <p>
                    {branch.description ||
                      "No description."}
                  </p>

                  <div className="tag-row">
                    {branch.location && (
                      <span className="tag">
                        ◉ {branch.location}
                      </span>
                    )}

                    <span className="tag">
                      {memberObjects.length} members
                    </span>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    className="icon-button"
                    onClick={() => setEditing(branch)}
                  >
                    ✎
                  </button>

                  <button
                    className="icon-button danger"
                    onClick={() =>
                      onDelete(branch.id)
                    }
                  >
                    ×
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {editing && (
        <Modal
          title={
            editing.name || "New branch"
          }
          subtitle="Branch editor"
          onClose={() => setEditing(null)}
          actions={
            <button
              className="button primary"
              onClick={save}
            >
              Save branch
            </button>
          }
        >
          <div className="form-section">
            <TextField
              label="Branch name"
              value={editing.name}
              onChange={(value) =>
                setEditing((current) => ({
                  ...current,
                  name: value
                }))
              }
            />

            <SelectField
              label="Organization"
              value={editing.organizationId}
              options={[
                {
                  value: "",
                  label: "None"
                },
                ...organizations.map(
                  (organization) => ({
                    value: organization.id,
                    label: organization.name
                  })
                )
              ]}
              onChange={(value) =>
                setEditing((current) => ({
                  ...current,
                  organizationId: value
                }))
              }
            />

            <TextField
              label="Location"
              value={editing.location}
              onChange={(value) =>
                setEditing((current) => ({
                  ...current,
                  location: value
                }))
              }
            />

            <TextField
              label="Leader"
              value={editing.leader}
              onChange={(value) =>
                setEditing((current) => ({
                  ...current,
                  leader: value
                }))
              }
            />

            <TextArea
              label="Description"
              value={editing.description}
              rows={4}
              onChange={(value) =>
                setEditing((current) => ({
                  ...current,
                  description: value
                }))
              }
            />

            <TextArea
              label="Notes"
              value={editing.notes}
              rows={4}
              onChange={(value) =>
                setEditing((current) => ({
                  ...current,
                  notes: value
                }))
              }
            />

            <div className="field">
              <label>Members</label>

              <div className="member-selector">
                {characters.map((character) => {
                  const checked =
                    editing.members?.includes(
                      character.id
                    ) || false;

                  return (
                    <label
                      className={`member-select ${
                        checked ? "selected" : ""
                      }`}
                      key={character.id}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setEditing((current) => ({
                            ...current,
                            members: checked
                              ? current.members.filter(
                                  (id) =>
                                    id !==
                                    character.id
                                )
                              : [
                                  ...current.members,
                                  character.id
                                ]
                          }))
                        }
                      />

                      <span>
                        {displayName(character)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* =========================================================
   RELATIONSHIPS
========================================================= */

function RelationshipsPage({ characters }) {
  const relationships = [];

  characters.forEach((character) => {
    (character.relationships || []).forEach(
      (relationship) => {
        const target = characters.find(
          (item) =>
            item.id === relationship.characterId
        );

        relationships.push({
          source: character,
          target,
          ...relationship
        });
      }
    );
  });

  return (
    <div className="page-stack">
      <section className="page-intro">
        <div>
          <span className="eyebrow">
            ARCHIVE / CONNECTIONS
          </span>

          <h2>Relationships</h2>

          <p>
            A connected view of all character
            relationships.
          </p>
        </div>
      </section>

      {relationships.length === 0 ? (
        <EmptyState
          icon="♡"
          title="No relationships yet"
          text="Open a character file and add relationships."
        />
      ) : (
        <div className="relationship-list large">
          {relationships.map(
            (relationship, index) => (
              <div
                className="relationship-card"
                key={`${relationship.source.id}-${index}`}
              >
                <div className="relationship-avatar">
                  {initials(relationship.source)}
                </div>

                <div className="relationship-arrow">
                  →
                </div>

                <div className="relationship-avatar">
                  {relationship.target
                    ? initials(relationship.target)
                    : "?"}
                </div>

                <div className="relationship-main">
                  <strong>
                    {displayName(
                      relationship.source
                    )}
                    {" → "}
                    {relationship.target
                      ? displayName(
                          relationship.target
                        )
                      : "Unknown"}
                  </strong>

                  <span>
                    {relationship.type ||
                      "Relationship"}
                  </span>

                  {relationship.status && (
                    <small>
                      {relationship.status}
                    </small>
                  )}
                </div>

                {relationship.description && (
                  <p>
                    {relationship.description}
                  </p>
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   INVESTIGATION CASES
========================================================= */

function CasesPage({
  cases,
  characters,
  onAdd,
  onSelect,
  onEdit,
  onDelete
}) {
  const [filter, setFilter] = useState("All");

  const visible = cases.filter(
    (item) =>
      filter === "All" || item.status === filter
  );

  return (
    <div className="page-stack">
      <section className="page-intro">
        <div>
          <span className="eyebrow">
            ARCHIVE / INVESTIGATION
          </span>

          <h2>Investigation Cases</h2>

          <p>
            Track what happened, who was involved, how,
            why, evidence and solutions.
          </p>
        </div>

        <button className="button primary" onClick={onAdd}>
          + New case
        </button>
      </section>

      <div className="toolbar">
        <div className="filter-group">
          {["All", "Open", "Solved", "Cold"].map(
            (item) => (
              <button
                className={`filter ${
                  filter === item ? "active" : ""
                }`}
                key={item}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            )
          )}
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon="⚠"
          title="No cases"
          text="Create an investigation to start tracking clues."
          button="Create case"
          onClick={onAdd}
        />
      ) : (
        <div className="case-grid">
          {visible.map((item) => (
            <article
              className="case-card card"
              key={item.id}
              onClick={() => onSelect(item.id)}
            >
              <div className="case-top">
                <span
                  className={`case-status status-${item.status.toLowerCase()}`}
                >
                  {item.status}
                </span>

                <span className="case-difficulty">
                  {item.difficulty}
                </span>
              </div>

              <h3>
                {item.title || "Untitled case"}
              </h3>

              <p>
                {item.what ||
                  "No case summary yet."}
              </p>

              <div className="case-meta">
                <span>
                  👤 {item.involved?.length || 0} involved
                </span>

                <span>
                  ◈ {item.clues?.length || 0} clues
                </span>

                <span>
                  ◆ {item.evidence?.length || 0} evidence
                </span>
              </div>

              <div
                className="card-actions"
                onClick={(event) =>
                  event.stopPropagation()
                }
              >
                <button
                  className="icon-button"
                  onClick={() => onEdit(item)}
                >
                  ✎
                </button>

                <button
                  className="icon-button danger"
                  onClick={() => onDelete(item.id)}
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

function CaseModal({
  caseItem,
  characters,
  onClose,
  onEdit,
  onDelete
}) {
  const names = (caseItem.involved || [])
    .map(
      (id) =>
        characters.find(
          (character) => character.id === id
        )?.name
    )
    .filter(Boolean);

  return (
    <Modal
      title={caseItem.title || "Investigation"}
      subtitle="Case file"
      onClose={onClose}
      wide
      actions={
        <>
          <button className="button ghost" onClick={onEdit}>
            Edit
          </button>

          <button
            className="button danger"
            onClick={onDelete}
          >
            Delete
          </button>
        </>
      }
    >
      <div className="case-profile">
        <div className="case-banner">
          <div>
            <span
              className={`case-status status-${caseItem.status.toLowerCase()}`}
            >
              {caseItem.status}
            </span>

            <h2>{caseItem.title}</h2>
          </div>

          <span className="case-difficulty">
            {caseItem.difficulty}
          </span>
        </div>

        <div className="investigation-grid">
          <Info
            label="What"
            value={caseItem.what}
          />

          <Info
            label="Who"
            value={caseItem.who}
          />

          <Info
            label="How"
            value={caseItem.how}
          />

          <Info
            label="Why"
            value={caseItem.why}
          />

          <Info
            label="Where"
            value={caseItem.where}
          />

          <Info
            label="When"
            value={caseItem.when}
          />
        </div>

        <ListSection
          title="People involved"
          items={names}
        />

        <ListSection
          title="Suspects"
          items={caseItem.suspects}
        />

        <ListSection
          title="Clues"
          items={caseItem.clues}
        />

        <ListSection
          title="Evidence"
          items={caseItem.evidence}
        />

        <ProfileTextSection
          title="Solution"
          text={caseItem.solution}
        />

        <ProfileTextSection
          title="Notes"
          text={caseItem.notes}
        />
      </div>
    </Modal>
  );
}

function CaseEditor({
  caseItem,
  characters,
  onClose,
  onSave
}) {
  const [form, setForm] = useState({
    ...emptyCase(),
    ...caseItem
  });

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function toggleInvolved(id) {
    setForm((current) => ({
      ...current,
      involved: current.involved.includes(id)
        ? current.involved.filter(
            (item) => item !== id
          )
        : [...current.involved, id]
    }));
  }

  return (
    <Modal
      title={form.title || "New investigation"}
      subtitle="Investigation editor"
      onClose={onClose}
      wide
      actions={
        <button
          className="button primary"
          onClick={() => onSave(form)}
        >
          Save case
        </button>
      }
    >
      <div className="form-section">
        <div className="form-grid">
          <TextField
            label="Case title"
            value={form.title}
            onChange={(value) =>
              update("title", value)
            }
          />

          <SelectField
            label="Status"
            value={form.status}
            options={[
              "Open",
              "Solved",
              "Cold"
            ]}
            onChange={(value) =>
              update("status", value)
            }
          />

          <SelectField
            label="Difficulty"
            value={form.difficulty}
            options={[
              "Easy",
              "Medium",
              "Hard",
              "Extreme"
            ]}
            onChange={(value) =>
              update("difficulty", value)
            }
          />

          <TextField
            label="When"
            value={form.when}
            onChange={(value) =>
              update("when", value)
            }
          />

          <TextField
            label="Where"
            value={form.where}
            onChange={(value) =>
              update("where", value)
            }
          />

          <TextField
            label="Who"
            value={form.who}
            onChange={(value) =>
              update("who", value)
            }
          />
        </div>

        <TextArea
          label="What happened?"
          value={form.what}
          rows={5}
          onChange={(value) =>
            update("what", value)
          }
        />

        <TextArea
          label="How?"
          value={form.how}
          rows={4}
          onChange={(value) =>
            update("how", value)
          }
        />

        <TextArea
          label="Why?"
          value={form.why}
          rows={4}
          onChange={(value) =>
            update("why", value)
          }
        />

        <ListEditor
          label="Clues"
          values={form.clues}
          onAdd={() =>
            update("clues", [
              ...form.clues,
              ""
            ])
          }
          onChange={(index, value) =>
            update(
              "clues",
              form.clues.map(
                (item, itemIndex) =>
                  itemIndex === index
                    ? value
                    : item
              )
            )
          }
          onRemove={(index) =>
            update(
              "clues",
              form.clues.filter(
                (_, itemIndex) =>
                  itemIndex !== index
              )
            )
          }
        />

        <ListEditor
          label="Evidence"
          values={form.evidence}
          onAdd={() =>
            update("evidence", [
              ...form.evidence,
              ""
            ])
          }
          onChange={(index, value) =>
            update(
              "evidence",
              form.evidence.map(
                (item, itemIndex) =>
                  itemIndex === index
                    ? value
                    : item
              )
            )
          }
          onRemove={(index) =>
            update(
              "evidence",
              form.evidence.filter(
                (_, itemIndex) =>
                  itemIndex !== index
              )
            )
          }
        />

        <ListEditor
          label="Suspects"
          values={form.suspects}
          onAdd={() =>
            update("suspects", [
              ...form.suspects,
              ""
            ])
          }
          onChange={(index, value) =>
            update(
              "suspects",
              form.suspects.map(
                (item, itemIndex) =>
                  itemIndex === index
                    ? value
                    : item
              )
            )
          }
          onRemove={(index) =>
            update(
              "suspects",
              form.suspects.filter(
                (_, itemIndex) =>
                  itemIndex !== index
              )
            )
          }
        />

        <div className="field">
          <label>Characters involved</label>

          <div className="member-selector">
            {characters.map((character) => {
              const checked =
                form.involved.includes(
                  character.id
                );

              return (
                <label
                  className={`member-select ${
                    checked ? "selected" : ""
                  }`}
                  key={character.id}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      toggleInvolved(
                        character.id
                      )
                    }
                  />

                  <span>
                    {displayName(character)}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <TextArea
          label="Solution"
          value={form.solution}
          rows={6}
          onChange={(value) =>
            update("solution", value)
          }
        />

        <TextArea
          label="Notes"
          value={form.notes}
          rows={5}
          onChange={(value) =>
            update("notes", value)
          }
        />
      </div>
    </Modal>
  );
}

/* =========================================================
   LORE
========================================================= */

function LorePage({
  lore,
  characters,
  organizations,
  onAdd,
  onSelect,
  onEdit,
  onDelete
}) {
  return (
    <div className="page-stack">
      <section className="page-intro">
        <div>
          <span className="eyebrow">
            ARCHIVE / WORLD
          </span>

          <h2>Lore</h2>

          <p>
            Store worldbuilding, history, locations, rules,
            events and mythology.
          </p>
        </div>

        <button className="button primary" onClick={onAdd}>
          + New lore
        </button>
      </section>

      {lore.length === 0 ? (
        <EmptyState
          icon="◈"
          title="No lore entries"
          text="Create your first worldbuilding file."
          button="Create lore"
          onClick={onAdd}
        />
      ) : (
        <div className="lore-grid">
          {lore.map((item) => (
            <article
              className="lore-card card"
              key={item.id}
              onClick={() => onSelect(item.id)}
            >
              <span className="lore-symbol">◈</span>

              <span className="eyebrow">
                {item.category || "LORE"}
              </span>

              <h3>
                {item.title || "Untitled lore"}
              </h3>

              <p>
                {item.content ||
                  "No content yet."}
              </p>

              <div className="tag-row">
                {(item.tags || []).slice(0, 4).map(
                  (tag, index) => (
                    <span className="tag" key={index}>
                      {tag}
                    </span>
                  )
                )}
              </div>

              <div
                className="card-actions"
                onClick={(event) =>
                  event.stopPropagation()
                }
              >
                <button
                  className="icon-button"
                  onClick={() => onEdit(item)}
                >
                  ✎
                </button>

                <button
                  className="icon-button danger"
                  onClick={() => onDelete(item.id)}
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

function LoreModal({
  lore,
  characters,
  organizations,
  onClose,
  onEdit,
  onDelete
}) {
  const linkedCharacters =
    characters.filter((character) =>
      lore.relatedCharacters?.includes(
        character.id
      )
    );

  const linkedOrganizations =
    organizations.filter((organization) =>
      lore.relatedOrganizations?.includes(
        organization.id
      )
    );

  return (
    <Modal
      title={lore.title || "Lore"}
      subtitle={lore.category || "Worldbuilding"}
      onClose={onClose}
      wide
      actions={
        <>
          <button className="button ghost" onClick={onEdit}>
            Edit
          </button>

          <button
            className="button danger"
            onClick={onDelete}
          >
            Delete
          </button>
        </>
      }
    >
      <div className="lore-profile">
        <div className="lore-heading">
          <span className="lore-symbol">◈</span>

          <div>
            <span className="eyebrow">
              {lore.category || "LORE"}
            </span>

            <h2>{lore.title}</h2>
          </div>
        </div>

        <div className="long-text">
          {lore.content || "No content."}
        </div>

        <div className="tag-row">
          {(lore.tags || []).map(
            (tag, index) => (
              <span className="tag" key={index}>
                {tag}
              </span>
            )
          )}
        </div>

        <section className="profile-section">
          <SectionHeader title="Related characters" />

          <div className="member-grid">
            {linkedCharacters.map((character) => (
              <div
                className="member-card"
                key={character.id}
              >
                <div className="relationship-avatar">
                  {initials(character)}
                </div>

                <strong>
                  {displayName(character)}
                </strong>
              </div>
            ))}

            {linkedCharacters.length === 0 && (
              <EmptyInline text="None linked." />
            )}
          </div>
        </section>

        <section className="profile-section">
          <SectionHeader title="Related organizations" />

          <div className="tag-row">
            {linkedOrganizations.map(
              (organization) => (
                <span
                  className="tag"
                  key={organization.id}
                >
                  ♜ {organization.name}
                </span>
              )
            )}

            {linkedOrganizations.length === 0 && (
              <EmptyInline text="None linked." />
            )}
          </div>
        </section>
      </div>
    </Modal>
  );
}

function LoreEditor({
  lore,
  characters,
  organizations,
  onClose,
  onSave
}) {
  const [form, setForm] = useState({
    ...emptyLore(),
    ...lore
  });

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function toggle(field, id) {
    setForm((current) => {
      const list = current[field] || [];

      return {
        ...current,
        [field]: list.includes(id)
          ? list.filter((item) => item !== id)
          : [...list, id]
      };
    });
  }

  return (
    <Modal
      title={form.title || "New lore"}
      subtitle="Lore editor"
      onClose={onClose}
      wide
      actions={
        <button
          className="button primary"
          onClick={() => onSave(form)}
        >
          Save lore
        </button>
      }
    >
      <div className="form-section">
        <div className="form-grid">
          <TextField
            label="Title"
            value={form.title}
            onChange={(value) =>
              update("title", value)
            }
          />

          <TextField
            label="Category"
            value={form.category}
            placeholder="History, location, magic..."
            onChange={(value) =>
              update("category", value)
            }
          />
        </div>

        <TextArea
          label="Content"
          value={form.content}
          rows={12}
          onChange={(value) =>
            update("content", value)
          }
        />

        <TextField
          label="Tags"
          value={joinLines(form.tags)}
          placeholder="One tag per line"
          onChange={(value) =>
            update("tags", splitLines(value))
          }
        />

        <div className="field">
          <label>Related characters</label>

          <div className="member-selector">
            {characters.map((character) => (
              <label
                className={`member-select ${
                  form.relatedCharacters.includes(
                    character.id
                  )
                    ? "selected"
                    : ""
                }`}
                key={character.id}
              >
                <input
                  type="checkbox"
                  checked={form.relatedCharacters.includes(
                    character.id
                  )}
                  onChange={() =>
                    toggle(
                      "relatedCharacters",
                      character.id
                    )
                  }
                />

                <span>
                  {displayName(character)}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Related organizations</label>

          <div className="member-selector">
            {organizations.map((organization) => (
              <label
                className={`member-select ${
                  form.relatedOrganizations.includes(
                    organization.id
                  )
                    ? "selected"
                    : ""
                }`}
                key={organization.id}
              >
                <input
                  type="checkbox"
                  checked={form.relatedOrganizations.includes(
                    organization.id
                  )}
                  onChange={() =>
                    toggle(
                      "relatedOrganizations",
                      organization.id
                    )
                  }
                />

                <span>{organization.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* =========================================================
   POSTS
========================================================= */

function PostsPage({
  posts,
  onAdd,
  onEdit,
  onSave,
  onDelete
}) {
  return (
    <div className="page-stack">
      <section className="page-intro">
        <div>
          <span className="eyebrow">
            ARCHIVE / JOURNAL
          </span>

          <h2>Posts</h2>

          <p>
            Write updates, diary entries, in-universe
            announcements and notes.
          </p>
        </div>

        <button className="button primary" onClick={onAdd}>
          + New post
        </button>
      </section>

      {posts.length === 0 ? (
        <EmptyState
          icon="✦"
          title="No posts"
          text="Create a post to keep additional notes."
          button="Create post"
          onClick={onAdd}
        />
      ) : (
        <div className="post-list">
          {[...posts]
            .reverse()
            .map((post) => (
              <article
                className="post-card card"
                key={post.id}
              >
                {post.image && (
                  <img
                    src={post.image}
                    alt=""
                    className="post-image"
                  />
                )}

                <div className="post-body">
                  <div className="post-meta">
                    <span>
                      {post.date}
                    </span>

                    {post.author && (
                      <span>
                        by {post.author}
                      </span>
                    )}
                  </div>

                  <h3>
                    {post.title ||
                      "Untitled post"}
                  </h3>

                  <p>{post.content}</p>

                  <div className="tag-row">
                    {(post.tags || []).map(
                      (tag, index) => (
                        <span
                          className="tag"
                          key={index}
                        >
                          {tag}
                        </span>
                      )
                    )}
                  </div>

                  <div className="card-actions">
                    <button
                      className="icon-button"
                      onClick={() =>
                        onEdit(post)
                      }
                    >
                      ✎
                    </button>

                    <button
                      className="icon-button danger"
                      onClick={() =>
                        onDelete(post.id)
                      }
                    >
                      ×
                    </button>
                  </div>
                </div>
              </article>
            ))}
        </div>
      )}

      {onSave && null}
    </div>
  );
}

function PostEditor({
  post,
  onClose,
  onSave
}) {
  const [form, setForm] = useState({
    ...emptyPost(),
    ...post
  });

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  return (
    <Modal
      title={form.title || "New post"}
      subtitle="Post editor"
      onClose={onClose}
      wide
      actions={
        <button
          className="button primary"
          onClick={() => onSave(form)}
        >
          Save post
        </button>
      }
    >
      <div className="form-section">
        <div className="form-grid">
          <TextField
            label="Title"
            value={form.title}
            onChange={(value) =>
              update("title", value)
            }
          />

          <TextField
            label="Author"
            value={form.author}
            onChange={(value) =>
              update("author", value)
            }
          />

          <TextField
            label="Date"
            type="date"
            value={form.date}
            onChange={(value) =>
              update("date", value)
            }
          />

          <TextField
            label="Tags"
            value={joinLines(form.tags)}
            placeholder="One tag per line"
            onChange={(value) =>
              update("tags", splitLines(value))
            }
          />
        </div>

        <TextArea
          label="Content"
          value={form.content}
          rows={12}
          onChange={(value) =>
            update("content", value)
          }
        />

        <ImageUpload
          label="Post image"
          value={form.image}
          onChange={(value) =>
            update("image", value)
          }
        />
      </div>
    </Modal>
  );
}

/* =========================================================
   SETTINGS
========================================================= */

function SettingsPage({
  theme,
  setTheme,
  database,
  exportDatabase,
  importDatabase,
  resetDatabase
}) {
  return (
    <div className="page-stack">
      <section className="page-intro">
        <div>
          <span className="eyebrow">
            ARCHIVE / CONFIGURATION
          </span>

          <h2>Settings</h2>

          <p>
            Customize your archive and manage backups.
          </p>
        </div>
      </section>

      <section className="settings-section card">
        <SectionHeader
          title="Theme"
          subtitle="Choose the visual atmosphere of OcFiles."
        />

        <div className="theme-grid">
          {THEMES.map((item) => (
            <button
              key={item.id}
              className={`theme-card ${
                theme === item.id
                  ? "selected"
                  : ""
              } theme-preview-${item.id}`}
              onClick={() => setTheme(item.id)}
            >
              <span className="theme-icon">
                {item.icon}
              </span>

              <strong>{item.name}</strong>

              <small>{item.description}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="settings-section card">
        <SectionHeader
          title="Database"
          subtitle="Your information is stored locally in this browser."
        />

        <div className="database-stats">
          <Info
            label="Characters"
            value={database.characters.length}
          />

          <Info
            label="Organizations"
            value={database.organizations.length}
          />

          <Info
            label="Branches"
            value={database.branches.length}
          />

          <Info
            label="Cases"
            value={database.cases.length}
          />

          <Info
            label="Lore"
            value={database.lore.length}
          />

          <Info
            label="Posts"
            value={database.posts.length}
          />
        </div>

        <div className="settings-actions">
          <button
            className="button secondary"
            onClick={exportDatabase}
          >
            Export backup
          </button>

          <label className="button secondary">
            Import backup
            <input
              type="file"
              accept=".json,application/json"
              hidden
              onChange={importDatabase}
            />
          </label>

          <button
            className="button danger"
            onClick={resetDatabase}
          >
            Reset database
          </button>
        </div>
      </section>

      <section className="settings-section card">
        <SectionHeader
          title="About OcFiles"
          subtitle="Original Character Database"
        />

        <p className="settings-copy">
          OcFiles is a local-first character archive.
          Your characters, organizations, relationships,
          investigations, lore and posts are saved directly
          in your browser using localStorage.
        </p>
      </section>
    </div>
  );
}

/* =========================================================
   GENERIC UI
========================================================= */

function Modal({
  title,
  subtitle,
  children,
  onClose,
  actions,
  wide = false,
  extraClass = ""
}) {
  useEffect(() => {
    function handleKey(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener(
      "keydown",
      handleKey
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKey
      );
    };
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className={`modal ${
          wide ? "modal-wide" : ""
        } ${extraClass}`}
      >
        <header className="modal-header">
          <div>
            <span className="eyebrow">
              {subtitle}
            </span>

            <h2>{title}</h2>
          </div>

          <button
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="modal-content">
          {children}
        </div>

        {actions && (
          <footer className="modal-footer">
            {actions}
          </footer>
        )}
      </section>
    </div>
  );
}

function ConfirmModal({
  title,
  message,
  danger,
  onClose,
  onConfirm
}) {
  return (
    <Modal
      title={title}
      subtitle="Confirmation"
      onClose={onClose}
      actions={
        <>
          <button
            className="button ghost"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className={`button ${
              danger ? "danger" : "primary"
            }`}
            onClick={onConfirm}
          >
            Confirm
          </button>
        </>
      }
    >
      <div className="confirm-content">
        <div className="confirm-icon">!</div>

        <p>{message}</p>
      </div>
    </Modal>
  );
}

function SectionHeader({
  title,
  subtitle,
  action,
  onAction
}) {
  return (
    <div className="section-header">
      <div>
        <h3>{title}</h3>

        {subtitle && <p>{subtitle}</p>}
      </div>

      {action && (
        <button
          className="text-button"
          onClick={onAction}
        >
          {action} →
        </button>
      )}
    </div>
  );
}

function FormSectionTitle({
  title,
  text
}) {
  return (
    <div className="form-section-title">
      <h3>{title}</h3>

      {text && <p>{text}</p>}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="info-box">
      <span>{label}</span>

      <strong>
        {value === undefined ||
        value === null ||
        value === ""
          ? "—"
          : value}
      </strong>
    </div>
  );
}

function ProfileTextSection({
  title,
  text
}) {
  if (!text) return null;

  return (
    <section className="profile-section">
      <SectionHeader title={title} />

      <div className="long-text">{text}</div>
    </section>
  );
}

function ListSection({
  title,
  items
}) {
  const clean = (items || []).filter(Boolean);

  return (
    <section className="profile-section">
      <SectionHeader title={title} />

      {clean.length === 0 ? (
        <EmptyInline text="Nothing recorded." />
      ) : (
        <ul className="styled-list">
          {clean.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

function EmptyInline({ text }) {
  return (
    <div className="empty-inline">
      {text}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  text,
  button,
  onClick
}) {
  return (
    <div className="empty-state card">
      <div className="empty-icon">{icon}</div>

      <h3>{title}</h3>

      <p>{text}</p>

      {button && (
        <button
          className="button primary"
          onClick={onClick}
        >
          {button}
        </button>
      )}
    </div>
  );
}

/* =========================================================
   FORM COMPONENTS
========================================================= */

function TextField({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text"
}) {
  return (
    <div className="field">
      <label>{label}</label>

      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder = "",
  rows = 5
}) {
  return (
    <div className="field">
      <label>{label}</label>

      <textarea
        value={value ?? ""}
        placeholder={placeholder}
        rows={rows}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange
}) {
  return (
    <div className="field">
      <label>{label}</label>

      <select
        value={value ?? ""}
        onChange={(event) =>
          onChange(event.target.value)
        }
      >
        {options.map((option) => {
          const objectOption =
            typeof option === "object";

          return (
            <option
              key={
                objectOption
                  ? option.value
                  : option
              }
              value={
                objectOption
                  ? option.value
                  : option
              }
            >
              {objectOption
                ? option.label
                : option}
            </option>
          );
        })}
      </select>
    </div>
  );
}

function ListEditor({
  label,
  values,
  onAdd,
  onChange,
  onRemove
}) {
  return (
    <div className="list-editor field">
      <div className="field-label-row">
        <label>{label}</label>

        <button
          type="button"
          className="small-button"
          onClick={onAdd}
        >
          + Add
        </button>
      </div>

      <div className="list-inputs">
        {values.length === 0 && (
          <span className="field-hint">
            Nothing added yet.
          </span>
        )}

        {values.map((value, index) => (
          <div
            className="list-input-row"
            key={index}
          >
            <input
              value={value}
              placeholder={`${label} ${index + 1}`}
              onChange={(event) =>
                onChange(
                  index,
                  event.target.value
                )
              }
            />

            <button
              type="button"
              className="remove-button"
              onClick={() => onRemove(index)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImageUpload({
  label,
  value,
  onChange
}) {
  function handleFile(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      onChange(reader.result);
    };

    reader.readAsDataURL(file);
  }

  return (
    <div className="field image-upload-field">
      <label>{label}</label>

      {value && (
        <div className="upload-preview">
          <img src={value} alt="" />

          <button
            type="button"
            className="remove-image"
            onClick={() => onChange("")}
          >
            Remove
          </button>
        </div>
      )}

      <label className="upload-button">
        <span>＋ Upload image</span>

        <input
          type="file"
          accept="image/*"
          hidden
          onChange={handleFile}
        />
      </label>
    </div>
  );
}

function ImageListEditor({
  label,
  values,
  onChange
}) {
  function addImage(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      onChange([
        ...values,
        reader.result
      ]);
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  }

  return (
    <div className="field">
      <label>{label}</label>

      <div className="moodboard-editor">
        {values.map((image, index) => (
          <div
            className="moodboard-edit-item"
            key={index}
          >
            <img src={image} alt="" />

            <button
              type="button"
              onClick={() =>
                onChange(
                  values.filter(
                    (_, itemIndex) =>
                      itemIndex !== index
                  )
                )
              }
            >
              ×
            </button>
          </div>
        ))}

        <label className="moodboard-add">
          <span>+</span>
          <small>Add image</small>

          <input
            type="file"
            accept="image/*"
            hidden
            onChange={addImage}
          />
        </label>
      </div>
    </div>
  );
}

/* =========================================================
   TRAITS / SKILLS
========================================================= */

function TraitBar({
  left,
  right,
  value
}) {
  return (
    <div className="trait-bar">
      <span>{left}</span>

      <div className="trait-track">
        <div
          className="trait-fill"
          style={{
            width: `${value}%`
          }}
        />

        <div
          className="trait-marker"
          style={{
            left: `${value}%`
          }}
        />
      </div>

      <span>{right}</span>
    </div>
  );
}

function TraitEditor({
  left,
  right,
  value,
  onChange
}) {
  return (
    <div className="trait-editor">
      <div className="trait-labels">
        <span>{left}</span>

        <span>{right}</span>
      </div>

      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />
    </div>
  );
}

function SkillBar({
  label,
  value
}) {
  return (
    <div className="skill-bar">
      <div>
        <span>{label}</span>
        <strong>{value}/5</strong>
      </div>

      <div className="skill-pips">
        {[1, 2, 3, 4, 5].map((level) => (
          <span
            key={level}
            className={
              level <= value ? "filled" : ""
            }
          />
        ))}
      </div>
    </div>
  );
}

function SkillEditor({
  label,
  value,
  onChange
}) {
  return (
    <div className="skill-editor">
      <div>
        <label>{label}</label>

        <strong>{value}/5</strong>
      </div>

      <input
        type="range"
        min="1"
        max="5"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />

      <div className="skill-pips">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            type="button"
            key={level}
            className={
              level <= value ? "filled" : ""
            }
            onClick={() => onChange(level)}
          />
        ))}
      </div>
    </div>
  );
}
