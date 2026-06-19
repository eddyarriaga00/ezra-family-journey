import { lazy, Suspense, useEffect, useState } from "react";
import { AddEntryModal } from "./components/AddEntryModal";
import { AuthModal } from "./components/AuthModal";
import { BottomNav, TopBar } from "./components/Navigation";
import { LanguageWelcome } from "./components/LanguageWelcome";
import { HomeScreen } from "./components/HomeScreen";
import { CareScreen } from "./components/CareScreen";
import { MomentsScreen } from "./components/MomentsScreen";
import { useFamilyDatabase } from "./hooks/useFamilyDatabase";
import { useCopy } from "./i18n";
import type { EntryKind, Language, Screen } from "./types";

const GrowthScreen = lazy(() => import("./components/GrowthScreen").then((module) => ({ default: module.GrowthScreen })));

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
  const {
    account,
    babyId,
    deleteEntry,
    entries,
    isConfigured,
    passwordRecovery,
    saveEntry,
    setPasswordRecovery,
    signOutAccount,
    syncError,
    syncState,
  } = useFamilyDatabase();
  const t = useCopy(language);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const chooseLanguage = (value: Language) => {
    setLanguage(value);
    localStorage.setItem("ezra-language", value);
    setShowWelcome(false);
  };
  const add = (kind?: EntryKind) => {
    if (isConfigured && !account) {
      setAuthOpen(true);
      return;
    }
    if (isConfigured && account && !babyId) return;
    setModal({ open: true, kind });
  };
  const save = async (entry: Parameters<typeof saveEntry>[0]) => {
    const saved = await saveEntry(entry);
    if (!saved) return false;
    setModal({ open: false });
    if (entry.kind === "milestone") setScreen("moments");
    else if (entry.kind === "weight") setScreen("growth");
    else setScreen("care");
    return true;
  };

  const syncMessage = syncError || (syncState === "syncing" ? t.syncing : syncState === "synced" ? t.synced : t.publicMode);

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
      {(authOpen || passwordRecovery) && <AuthModal recovery={passwordRecovery} language={language} onClose={() => { setAuthOpen(false); setPasswordRecovery(false); }} />}
      <TopBar
        language={language}
        onLanguage={chooseLanguage}
        account={account?.email}
        showAccount={isConfigured}
        onAccount={() => account ? void signOutAccount() : setAuthOpen(true)}
      />
      {isConfigured ? <div className={`sync-status ${syncState === "synced" ? "online" : ""}`}>{syncMessage}</div> : null}
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
          <Suspense fallback={<p className="screen loading-copy">{t.loading}</p>}>
            <GrowthScreen language={language} entries={entries} onAdd={() => add("weight")} />
          </Suspense>
        )}
        {screen === "care" && (
          <CareScreen
            language={language}
            entries={entries}
            onAdd={add}
            canEdit={!isConfigured || Boolean(account)}
            onDelete={(id) => {
              if (isConfigured && !account) {
                setAuthOpen(true);
                return;
              }
              void deleteEntry(id);
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
