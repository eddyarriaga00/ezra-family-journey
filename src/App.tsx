import { useEffect, useState } from "react";
import { AddEntryModal } from "./components/AddEntryModal";
import { BottomNav, TopBar } from "./components/Navigation";
import { LanguageWelcome } from "./components/LanguageWelcome";
import { HomeScreen } from "./components/HomeScreen";
import { GrowthScreen } from "./components/GrowthScreen";
import { CareScreen } from "./components/CareScreen";
import { MomentsScreen } from "./components/MomentsScreen";
import { seedEntries } from "./data";
import { useCopy } from "./i18n";
import type { Entry, EntryKind, Language, Screen } from "./types";

const STORAGE_KEY = "ezra-family-updates-v2";

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
  const [entries, setEntries] = useState<Entry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : seedEntries;
    } catch {
      return seedEntries;
    }
  });
  const t = useCopy(language);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const chooseLanguage = (value: Language) => {
    setLanguage(value);
    localStorage.setItem("ezra-language", value);
    setShowWelcome(false);
  };
  const add = (kind?: EntryKind) => setModal({ open: true, kind });
  const save = (entry: Entry) => {
    setEntries((current) => [...current, entry]);
    setModal({ open: false });
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
      <TopBar language={language} onLanguage={chooseLanguage} />
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
            onDelete={(id) =>
              setEntries((current) => current.filter((e) => e.id !== id))
            }
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
