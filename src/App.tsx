import { useEffect, useState } from "react";
import { AddEntryModal } from "./components/AddEntryModal";
import { AuthModal } from "./components/AuthModal";
import { BottomNav, TopBar } from "./components/Navigation";
import { LanguageWelcome } from "./components/LanguageWelcome";
import { HomeScreen } from "./components/HomeScreen";
import { GrowthScreen } from "./components/GrowthScreen";
import { CareScreen } from "./components/CareScreen";
import { MomentsScreen } from "./components/MomentsScreen";
import { seedEntries } from "./data";
import { useCopy } from "./i18n";
import {
  createEntry,
  getSession,
  loadDatabase,
  onSessionChange,
  removeEntry,
  signOut,
} from "./lib/database";
import { isSupabaseConfigured } from "./lib/supabase";
import type { Entry, EntryKind, Language, Screen } from "./types";

const STORAGE_KEY = "ezra-family-updates-v2";
const MIGRATION_OWNER_KEY = "ezra-database-migration-owner";

function readLocalEntries() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as Entry[]) : seedEntries;
  } catch {
    return seedEntries;
  }
}

export default function App() {
  const storedLanguage = localStorage.getItem(
    "ezra-language",
  ) as Language | null;
  const [language, setLanguage] = useState<Language>(storedLanguage || "en");
  const [showWelcome, setShowWelcome] = useState(!storedLanguage);
  const [screen, setScreen] = useState<Screen>("home");
  const [modal, setModal] = useState<{ open: boolean; kind?: EntryKind }>({
    open: false,
  });
  const [authOpen, setAuthOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>();
  const [babyId, setBabyId] = useState<string>();
  const [syncMessage, setSyncMessage] = useState("");
  const [entries, setEntries] = useState<Entry[]>(readLocalEntries);
  const t = useCopy(language);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    void getSession()
      .then((session) => {
        if (active) setUserEmail(session?.user.email);
      })
      .catch((error) => active && setSyncMessage(error.message));
    const { data } = onSessionChange((session) => {
      if (active) setUserEmail(session?.user.email);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!userEmail || !isSupabaseConfigured) {
      setBabyId(undefined);
      return;
    }
    let active = true;
    setSyncMessage(language === "es" ? "Sincronizando…" : "Syncing…");
    const migrationOwner = localStorage.getItem(MIGRATION_OWNER_KEY);
    const migrationEntries = !migrationOwner || migrationOwner === userEmail
      ? readLocalEntries()
      : seedEntries;
    void loadDatabase(migrationEntries)
      .then((database) => {
        if (!active) return;
        if (!migrationOwner) localStorage.setItem(MIGRATION_OWNER_KEY, userEmail);
        setBabyId(database.babyId);
        setEntries(database.entries);
        setSyncMessage(language === "es" ? "Guardado de forma segura" : "Securely synced");
      })
      .catch((error) => active && setSyncMessage(error.message));
    return () => {
      active = false;
    };
  }, [userEmail, language]);

  const chooseLanguage = (value: Language) => {
    setLanguage(value);
    localStorage.setItem("ezra-language", value);
    setShowWelcome(false);
  };
  const add = (kind?: EntryKind) => {
    if (isSupabaseConfigured && !userEmail) {
      setAuthOpen(true);
      return;
    }
    if (isSupabaseConfigured && userEmail && !babyId) {
      setSyncMessage(language === "es" ? "Espera a que termine la sincronización." : "Wait for syncing to finish.");
      return;
    }
    setModal({ open: true, kind });
  };
  const save = (entry: Entry) => {
    setEntries((current) => [...current, entry]);
    setModal({ open: false });
    if (babyId) {
      void createEntry(babyId, entry)
        .then((saved) => setEntries((current) => current.map((item) => item.id === entry.id ? saved : item)))
        .catch((error) => setSyncMessage(error.message));
    }
    if (entry.kind === "milestone") setScreen("moments");
    else if (entry.kind === "weight") setScreen("growth");
    else setScreen("care");
  };

  return (
    <div className="app">
      {showWelcome && <LanguageWelcome onChoose={chooseLanguage} />}
      {modal.open && (
        <AddEntryModal
          language={language}
          initialKind={modal.kind}
          onClose={() => setModal({ open: false })}
          onSave={save}
        />
      )}
      {authOpen && <AuthModal language={language} onClose={() => setAuthOpen(false)} />}
      <TopBar
        language={language}
        onLanguage={chooseLanguage}
        account={userEmail}
        showAccount={isSupabaseConfigured}
        onAccount={() => userEmail ? void signOut().catch((error) => setSyncMessage(error.message)) : setAuthOpen(true)}
      />
      {isSupabaseConfigured ? <div className={`sync-status ${babyId ? "online" : ""}`}>{syncMessage || (userEmail ? t.syncing : t.publicMode)}</div> : null}
      <main>
        {screen === "home" && (
          <HomeScreen
            language={language}
            entries={entries}
            onAdd={add}
            setScreen={setScreen}
          />
        )}
        {screen === "growth" && (
          <GrowthScreen
            language={language}
            entries={entries}
            onAdd={() => add("weight")}
          />
        )}
        {screen === "care" && (
          <CareScreen
            language={language}
            entries={entries}
            onAdd={add}
            onDelete={(id) => {
              setEntries((current) => current.filter((e) => e.id !== id));
              if (babyId) void removeEntry(id).catch((error) => setSyncMessage(error.message));
            }}
          />
        )}
        {screen === "moments" && (
          <MomentsScreen
            language={language}
            entries={entries}
            onAdd={() => add("milestone")}
          />
        )}
      </main>
      <footer className="site-footer">
        <strong>{t.familyFooter}</strong>
        <span>{t.disclaimer}</span>
      </footer>
      <BottomNav language={language} screen={screen} setScreen={setScreen} />
    </div>
  );
}
