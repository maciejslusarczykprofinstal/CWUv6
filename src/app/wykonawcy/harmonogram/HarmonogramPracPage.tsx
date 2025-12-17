"use client";

import HarmonogramToolPage from "./HarmonogramToolPage";

export default HarmonogramToolPage;

/*

import { useMemo, useState } from "react";

type ViewMode = "list" | "timeline";

type AudienceMode = "mieszkaniec" | "zarzad" | "inspektor" | "wykonawca";

type Step = {
  id: string;
  name: string;
  description: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  createdAt: number;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}


function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function formatDatePL(iso: string) {
  if (!iso) return "-";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function compareByDateThenCreatedAt(a: Step, b: Step) {
  const ad = a.date || "9999-12-31";
  const bd = b.date || "9999-12-31";
  if (ad < bd) return -1;
  if (ad > bd) return 1;
  return a.createdAt - b.createdAt;
}

export default function HarmonogramPracPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [audienceMode, setAudienceMode] = useState<AudienceMode>("wykonawca");
  const [input, setInput] = useState<ScheduleInput>(DEFAULT_SCHEDULE_INPUT);
  const [overrides, setOverrides] = useState<DurationOverrides>({});
  const [scale, setScale] = useState<GanttScale>("days");
  
  const result = useMemo(() => {
    return generateSchedule({ input, overrides });
  }, [input, overrides]);
  
  function resetToDefault() {
    setInput(DEFAULT_SCHEDULE_INPUT);
    setOverrides({});
  }
  
  function clearManualDurations() {
    setOverrides({});
  }
  
  function onChangeDuration(taskId: string, nextDurationWorkDays: number) {
    setOverrides((prev) => ({ ...prev, [taskId]: nextDurationWorkDays }));
  }
  
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Harmonogram robot (narzedzie)</h1>
          <p className="text-sm text-muted-foreground">
            Formularz przelicza harmonogram automatycznie. Os czasu pozwala zmieniac czasy taskow i
            automatycznie przesuwa zaleznosci.
          </p>
        </div>
  
        <ScheduleForm value={input} onChange={setInput} onResetToDefault={resetToDefault} />
  
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Sterowanie</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={scale === "days" ? "default" : "outline"}
              onClick={() => setScale("days")}
            >
              Widok: dni
            </Button>
            <Button
              type="button"
              variant={scale === "weeks" ? "default" : "outline"}
              onClick={() => setScale("weeks")}
            >
              Widok: tygodnie
            </Button>
            <Button type="button" variant="outline" onClick={clearManualDurations}>
              Wyczysc reczne czasy taskow
            </Button>
          </CardContent>
        </Card>
  
        <GanttChart scheduled={result.scheduled} scale={scale} onChangeDuration={onChangeDuration} />
      </div>
  
      <div className="space-y-6">
        <ResultsPanel result={result} />
  
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Zalozenia MVP</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div>- Dni robocze -> kalendarz: przyjete 5/2 (weekendy niepracujace).</div>
            <div>- "WODA OFF" oznacza przerwe w dostawie wody dla danej strefy/pionu.</div>
            <div>- Czasy sa w dniach roboczych (mozliwe ulamki).</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

  const [steps, setSteps] = useState<Step[]>([
    {
      id: makeId(),
      name: "Uzgodnienia i informacja dla mieszkańców",
      description:
        "Zakres, terminy, możliwe przerwy w CWU. Kartki na klatkach + SMS/mail (jeśli jest system).",
      date: new Date().toISOString().slice(0, 10),
      completed: false,
      createdAt: Date.now(),
    },
    {
      id: makeId(),
      name: "Demontaż starej instalacji (odcinek/klatka)",
      description: "Zabezpieczenie lokali, odcięcie, spuszczenie, demontaż, przygotowanie pod montaż.",
      date: "",
      completed: false,
      createdAt: Date.now() + 1,
    },
  ]);

  // Sekcja A — formularz dodawania
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Edycja
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  const orderedSteps = useMemo(() => [...steps].sort(compareByDateThenCreatedAt), [steps]);

  const stats = useMemo(() => {
    const total = steps.length;
    const done = steps.filter((s) => s.completed).length;
    const pending = total - done;
    const progress = total === 0 ? 0 : Math.round((done / total) * 100);
    return { total, done, pending, progress };
  }, [steps]);

  const phases = useMemo(
    () =>
      [
        {
          id: "f0",
          title: "Faza 0 — Przygotowanie i organizacja",
          goal: "Ustalenie zasad pracy w budynku zamieszkałym (dostępy, komunikacja, przerwy w wodzie) oraz logistyki ekip.",
          includes: [
            "uzgodnienia z administracją i inspektorem (zakres, standard odtworzeń, protokoły)",
            "plan wejść do lokali + procedura kluczy / nieobecności",
            "plan przerw w wodzie (okna wyłączeń, maks. czas, eskalacja)",
            "zabezpieczenia części wspólnych, odpady, transport, magazyn materiałów",
            "komunikaty do mieszkańców (klatki/SMS/mail) + kanał zgłoszeń",
          ],
          dependencies: ["zaakceptowany zakres i standard odtworzeń", "wyznaczone okna wyłączeń", "uzgodniona procedura dostępu"],
          blockers: ["brak decyzji o odtworzeniach", "brak kanału kontaktu z lokatorami"],
          planB: "Jeśli brak dostępu do części lokali: plan pracy odcinkowej + rezerwowe terminy wejść + eskalacja do administracji.",
        },
        {
          id: "f1",
          title: "Faza 1 — Inwentaryzacja i odkrywki",
          goal: "Zminimalizowanie niespodzianek: potwierdzenie tras, średnic, materiałów, dostępu w szachtach i piwnicy.",
          includes: [
            "odkrywki w szachtach (typowe kondygnacje, newralgiczne skrzyżowania)",
            "weryfikacja odcięć, spustów, odpowietrzeń w piwnicy",
            "sprawdzenie przejść przez stropy/ściany (miejsce, kolizje)",
            "identyfikacja przeróbek lokatorskich i kolizji",
          ],
          dependencies: ["dostęp do wybranych lokali/rewizji", "uzgodniona strefa odkrywek"],
          blockers: ["zabudowane szachty bez rewizji", "brak dostępu do piwnicy"],
          planB: "Gdy brak odkrywek w pionie: robić odkrywkę kontrolną na klatce/na 1–2 kondygnacjach i przyjąć bufor na korekty trasy.",
        },
        {
          id: "f2",
          title: "Faza 2 — Roboty brudne / przygotowanie tras",
          goal: "Przygotowanie dostępu do instalacji i miejsc montażu bez blokowania prac instalacyjnych.",
          includes: [
            "otwarcia zabudów, bruzdy w uzgodnionym zakresie",
            "zabezpieczenie lokali (foliowanie, ochrona posadzek)",
            "przygotowanie miejsc przejść przez przegrody",
          ],
          dependencies: ["ustalony standard odtworzeń", "materiały zabezpieczające"],
          blockers: ["spory o zakres kucia", "konflikty o kurz/hałas"],
          planB: "Jeśli lokator nie zgadza się na bruzdy: wariant obejściowy (prowadzenie w szachcie / osłonie) + formalne potwierdzenie odstępstwa.",
        },
        {
          id: "f3",
          title: "Faza 3 — Demontaże odcinkowe (piony/poziomy)",
          goal: "Bezpieczny demontaż z kontrolą ryzyka zalania i skróceniem czasu bez wody.",
          includes: [
            "odcięcie, spuszczenie, demontaż odcinka",
            "zabezpieczenie końcówek, kontrola przecieków",
            "logistyka złomu/odpadów",
          ],
          dependencies: ["sprawne odcięcia lub przygotowany sposób sekcjonowania", "zabezpieczenia lokali"],
          blockers: ["niesprawne zawory odcinające", "korozja i pęknięcia"],
          planB: "Gdy odcięcia nie trzymają: praca na krótszych odcinkach + doraźne opaski/zatyczki + szybka dostępność materiału naprawczego.",
        },
        {
          id: "f4",
          title: "Faza 4 — Montaż instalacji (ZW/CW/cyrkulacja)",
          goal: "Montaż w kolejności technologicznej z czytelnym podziałem na piony i strefy.",
          includes: [
            "piony ZW i CW (mocowania, przejścia, podejścia)",
            "cyrkulacja (prowadzenie, armatura regulacyjna — jeśli w zakresie)",
            "piwnica: poziomy, sekcjonowanie, spusty, odpowietrzenia",
            "zawory odcinające, wodomierze (jeśli dotyczy), oznakowanie punktów",
          ],
          dependencies: ["materiały na miejscu", "uzgodniona kolejność pionów", "gotowe trasy (po F2)"],
          blockers: ["kolizje w szachtach", "brak miejsca na armaturę"],
          planB: "Przy kolizjach: korekta prowadzenia na odcinku + odnotowanie zmian (szkic powykonawczy) + bufor czasowy.",
        },
        {
          id: "f5",
          title: "Faza 5 — Próby, płukanie, uruchomienie, regulacja",
          goal: "Uruchomić instalację bez powrotów awaryjnych i bez cofek/nieszczelności po rozruchu.",
          includes: [
            "próby szczelności (odcinkowa i końcowa) + protokoły",
            "płukanie, napełnienie, odpowietrzenie",
            "regulacja cyrkulacji (jeśli modernizowana)",
            "okno obserwacji po uruchomieniu (wycieki, odpowietrzenie)",
          ],
          dependencies: ["zamknięty montaż w strefie", "obecność osoby decyzyjnej do odbioru próby"],
          blockers: ["nieszczelności po uruchomieniu", "brak dostępu do lokalu z przeciekiem"],
          planB: "Jeśli po uruchomieniu pojawi się przeciek: plan dyżuru + szybki powrót ekipy + priorytetowe wejście do lokalu (procedura z administracją).",
        },
        {
          id: "f6",
          title: "Faza 6 — Izolacje, oznakowanie, zabezpieczenia",
          goal: "Domknąć temat energetycznie i serwisowo: izolacje + opis stref i zaworów.",
          includes: ["izolacje w piwnicy i dostępnych odcinkach", "oznaczenia instalacji i zaworów", "opis stref/klatek"],
          dependencies: ["stabilna praca po F5"],
          blockers: ["brak dostępu do odcinków (zabudowy)", "spory o estetykę"],
          planB: "Jeśli izolacja w szachcie niemożliwa: izolować maksymalnie piwnicę i odcinki dostępne; resztę opisać w raporcie jako ograniczenie.",
        },
        {
          id: "f7",
          title: "Faza 7 — Odtworzenia budowlane",
          goal: "Odtworzyć uzgodniony standard i zamknąć konfliktogenny zakres (kto/za co odpowiada).",
          includes: ["zamurowania, tynki, uzupełnienia bruzd", "odtworzenia zabudów/rewizji", "sprzątanie technologiczne"],
          dependencies: ["zakończone próby i uruchomienie"],
          blockers: ["spory o zakres odtworzeń", "czas schnięcia"],
          planB: "Gdy spór o odtworzenie: protokół stanu istniejącego + rozdzielenie ‘minimalne’ vs ‘ponadstandard’ + decyzja administracji na piśmie.",
        },
        {
          id: "f8",
          title: "Faza 8 — Odbiory i przekazanie dokumentacji",
          goal: "Formalnie zamknąć roboty: odbiory, protokoły, lista zaworów, dokumentacja powykonawcza.",
          includes: ["odbiór strefowy i końcowy", "protokóły prób", "szkice powykonawcze", "instrukcja eksploatacji i serwisu"],
          dependencies: ["ukończone odtworzenia w uzgodnionym standardzie"],
          blockers: ["braki w dokumentacji/protokołach", "nieuzgodnione odstępstwa"],
          planB: "Jeśli są odstępstwa: spisać je jawnie w protokole + zalecenia działań naprawczych/uzupełniających.",
        },
      ] as const,
    [],
  );

  const technicalChecklists = useMemo(
    () =>
      [
        {
          title: "Piwnica / poziomy",
          items: [
            "czy są działające odcięcia strefowe (klatka/pion)?",
            "czy są spusty i odpowietrzenia w punktach skrajnych?",
            "czy jest miejsce na armaturę i izolacje?",
            "czy podpory i prowadzenie nie powodują naprężeń?",
          ],
        },
        {
          title: "Piony ZW/CW (lokale i szachty)",
          items: [
            "dostęp do pionu w lokalu (zabudowa/rewizja)",
            "przejścia przez stropy i ściany (miejsce + uszczelnienie)",
            "mocowania i kompensacje (brak ‘pracy’ rury na tynku)",
            "podejścia — czy nie wchodzimy w konflikt z wyposażeniem lokalu",
          ],
        },
        {
          title: "Cyrkulacja (jeśli modernizowana)",
          items: [
            "trasa i miejsca odpowietrzenia",
            "armatura regulacyjna i możliwość serwisu",
            "rozruch: odpowietrzenie i stabilizacja po uruchomieniu",
          ],
        },
        {
          title: "Próby i uruchomienie",
          items: [
            "próba szczelności odcinkowa i końcowa + protokół",
            "płukanie i odpowietrzenie (okno obserwacji po uruchomieniu)",
            "gotowość na nieszczelności po rozruchu (procedura wejścia do lokalu)",
          ],
        },
        {
          title: "Odtworzenia (źródło sporów)",
          items: [
            "standard minimalny vs rozszerzony spisany przed startem",
            "dokumentacja zdjęciowa stanu istniejącego",
            "kto odtwarza co w lokalu i w częściach wspólnych",
          ],
        },
      ] as const,
    [],
  );

  const durations = useMemo(
    () =>
      [
        { task: "Odkrywki i weryfikacja", range: "0,5–2 dni / klatka", depends: "zabudowy, dostęp, kolizje" },
        { task: "Demontaż + montaż pionu (ZW/CW)", range: "1–3 dni / pion", depends: "dostęp do lokali, stan szachtu" },
        { task: "Cyrkulacja (jeśli w zakresie)", range: "0,5–1,5 dnia / pion/odcinek", depends: "miejsce na armaturę, regulacja" },
        { task: "Poziomy w piwnicy (strefa)", range: "1–3 dni / strefa", depends: "odcięcia, podpory, dostęp" },
        { task: "Próby + płukanie + uruchomienie", range: "0,5–1 dzień / strefa", depends: "szczelność, odpowietrzenie, poprawki" },
        { task: "Izolacje w piwnicy", range: "0,5–2 dni / strefa", depends: "zakres izolacji i dostęp" },
        { task: "Odtworzenia (minimalne)", range: "0,5–2 dni / pion", depends: "technologia, schnięcie, spory" },
      ] as const,
    [],
  );

  const risks = useMemo(
    () =>
      [
        {
          risk: "Niedostępność lokali blokuje pion",
          signal: "brak wejścia w kluczowym lokalu / brak rewizji",
          impact: "przestój, wydłużone przerwy w wodzie, konflikt",
          prevention: "rezerwacje wejść, procedura kluczy, komunikacja + potwierdzenia",
          planB: "praca odcinkowa + rezerwowe terminy + eskalacja do administracji",
        },
        {
          risk: "Nieszczelności po uruchomieniu / cofki",
          signal: "wycieki, zapowietrzenie, niestabilna cyrkulacja",
          impact: "powroty awaryjne, ryzyko zalania, utrata zaufania",
          prevention: "próby odcinkowe, płukanie, okno obserwacji po uruchomieniu",
          planB: "dyżur ekipy + szybkie wejście do lokalu (ustalone z administracją)",
        },
        {
          risk: "Spory o odtworzenia",
          signal: "oczekiwania mieszkańca ‘jak było/ładniej’",
          impact: "blokady wejść, reklamacje, koszty ponad umowę",
          prevention: "standard minimalny/rozszerzony spisany + zdjęcia przed",
          planB: "protokół rozbieżności + decyzja administracji na piśmie",
        },
        {
          risk: "Niespodzianki w szachtach",
          signal: "kolizje, brak miejsca, przeróbki lokatorskie",
          impact: "korekty trasy, opóźnienia, rozszerzenie robót brudnych",
          prevention: "Faza 1: odkrywki kontrolne + bufor",
          planB: "korekta lokalna + dokumentacja zmian + bufor czasowy",
        },
      ] as const,
    [],
  );

  const audienceContent = useMemo(() => {
    if (audienceMode === "mieszkaniec") {
      return {
        title: "Widok mieszkańca (tłumaczenie harmonogramu)",
        points: [
          "Kiedy ekipa wejdzie do mieszkania i gdzie (łazienka/kuchnia/szacht).",
          "Ile potrwa przerwa w wodzie (okno czasowe) oraz co zrobić przed/po.",
          "Jak zabezpieczyć mieszkanie (dostęp do pionu, miejsce pracy, okrycie sprzętów).",
          "Co jest w standardzie odtworzenia, a co jest ponadstandardem.",
        ],
      };
    }

    if (audienceMode === "zarzad") {
      return {
        title: "Widok zarządu/administracji",
        points: [
          "Fazy 0–8, kolejność technologiczna i kluczowe zależności.",
          "Okna wyłączeń wody + plan komunikacji (klatki/SMS/mail).",
          "Ryzyka i wąskie gardła + bufor i plan B.",
          "Decyzje wymagane przed startem: standard odtworzeń, procedura dostępu do lokali.",
        ],
      };
    }

    if (audienceMode === "inspektor") {
      return {
        title: "Widok inspektora (kontrola i odbiory)",
        points: [
          "Punkty kontroli międzyoperacyjnej: demontaż, montaż, próby, uruchomienie.",
          "Kryteria odbioru strefowego (pion/klatka) i końcowego.",
          "Wymagane protokoły: próby szczelności, płukanie/uruchomienie, lista odstępstw.",
          "Checklista: przejścia przez przegrody, dostęp serwisowy, oznakowanie zaworów.",
        ],
      };
    }

    return {
      title: "Widok wykonawcy / kierownika robót",
      points: [
        "Podział na piony i strefy (piwnica/klatka/lokale) + kolejność technologiczna.",
        "Plan zasobów: ekipy instalacyjne i odtworzeniowe + logistyka materiałów.",
        "Plan przerw w wodzie i harmonogram wejść do lokali (największe wąskie gardło).",
        "Checklista robót + plan B na nieszczelności i brak dostępu.",
      ],
    };
  }, [audienceMode]);

  function addStep() {
    const name = formName.trim();
    if (!name) {
      setFormError("Nazwa kroku nie może być pusta.");
      return;
    }

    const step: Step = {
      id: makeId(),
      name,
      description: formDescription.trim(),
      date: formDate,
      completed: false,
      createdAt: Date.now(),
    };

    setSteps((prev) => [...prev, step]);
    setFormName("");
    setFormDescription("");
    setFormDate("");
    setFormError(null);
  }

  function insertTemplateIfEmpty() {
    setSteps((prev) => {
      if (prev.length > 0) return prev;
      const now = Date.now();
      const template: Step[] = [
        {
          id: makeId(),
          name: "F0: Uzgodnienia + komunikacja do mieszkańców",
          description:
            "Zakres, standard odtworzeń, okna wyłączeń wody. Ogłoszenia na klatkach + SMS/mail (jeśli jest). Procedura wejść do lokali.",
          date: "",
          completed: false,
          createdAt: now,
        },
        {
          id: makeId(),
          name: "F1: Odkrywki kontrolne (szachty + piwnica)",
          description: "Potwierdzenie tras/średnic/kolizji. Sprawdzenie odcięć, spustów, odpowietrzeń.",
          date: "",
          completed: false,
          createdAt: now + 1,
        },
        {
          id: makeId(),
          name: "F2: Przygotowanie tras (roboty brudne) — klatka/strefa",
          description: "Otwarcia zabudów, zabezpieczenia lokali, przygotowanie przejść przez przegrody.",
          date: "",
          completed: false,
          createdAt: now + 2,
        },
        {
          id: makeId(),
          name: "F3: Demontaż odcinka — pion/strefa",
          description: "Odcięcie, spuszczenie, demontaż. Minimalizacja czasu bez wody. Gotowość na awarie.",
          date: "",
          completed: false,
          createdAt: now + 3,
        },
        {
          id: makeId(),
          name: "F4: Montaż pionów ZW/CW + armatura",
          description: "Mocowania, przejścia, podejścia. Zawory odcinające, spusty, odpowietrzenia (wg zakresu).",
          date: "",
          completed: false,
          createdAt: now + 4,
        },
        {
          id: makeId(),
          name: "F4: Montaż cyrkulacji (jeśli w zakresie)",
          description: "Trasa, armatura regulacyjna, odpowietrzenia. Przygotowanie do rozruchu.",
          date: "",
          completed: false,
          createdAt: now + 5,
        },
        {
          id: makeId(),
          name: "F5: Próby szczelności + płukanie + uruchomienie",
          description: "Próby odcinkowe/końcowe + protokoły. Okno obserwacji po uruchomieniu (nieszczelności).",
          date: "",
          completed: false,
          createdAt: now + 6,
        },
        {
          id: makeId(),
          name: "F6: Izolacje + oznakowanie (piwnica)",
          description: "Izolacje dostępnych odcinków, opisy zaworów i stref.",
          date: "",
          completed: false,
          createdAt: now + 7,
        },
        {
          id: makeId(),
          name: "F7: Odtworzenia budowlane (wg standardu)",
          description: "Odtworzenia minimalne/rozszerzone — zgodnie z uzgodnieniami. Sprzątanie technologiczne.",
          date: "",
          completed: false,
          createdAt: now + 8,
        },
        {
          id: makeId(),
          name: "F8: Odbiór + dokumentacja powykonawcza",
          description: "Protokoły prób, lista zaworów, szkice zmian, zalecenia eksploatacyjne.",
          date: "",
          completed: false,
          createdAt: now + 9,
        },
      ];
      return template;
    });
  }

  function removeStep(id: string) {
    setSteps((prev) => prev.filter((s) => s.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditError(null);
    }
  }

  function toggleStatus(id: string) {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s)));
  }

  function beginEdit(step: Step) {
    setEditingId(step.id);
    setEditName(step.name);
    setEditDescription(step.description);
    setEditDate(step.date);
    setEditError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError(null);
  }

  function saveEdit(id: string) {
    const name = editName.trim();
    if (!name) {
      setEditError("Nazwa kroku nie może być pusta.");
      return;
    }

    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name, description: editDescription.trim(), date: editDate } : s)),
    );
    setEditingId(null);
    setEditError(null);
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-balance text-2xl font-semibold tracking-tight text-slate-900">
          Harmonogram prac wykonawcy (CWU / instalacje sanitarne)
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Narzędzie do układania realnego harmonogramu robót w budynku zamieszkałym (lata 70–90): technologia, organizacja, ryzyka i komunikacja.
        </p>

        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <h2 className="text-base font-semibold text-slate-900">Założenie kluczowe</h2>
          <p className="mt-2 text-sm text-slate-700">
            Ten harmonogram nie jest marketingiem. Ma odzwierciedlać realne blokady: brak dostępu do lokali, niespodzianki w szachtach, cofki i nieszczelności po
            uruchomieniu, spory o odtworzenia oraz konflikty o przerwy w wodzie.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={insertTemplateIfEmpty}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              title="Wstawi przykładowe kroki tylko wtedy, gdy lista jest pusta"
            >
              Wstaw szablon faz 0–8 (tylko gdy pusto)
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex w-full rounded-lg border border-slate-200 bg-white p-1 sm:w-auto">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "w-1/2 rounded-md px-3 py-2 text-sm font-medium sm:w-auto",
                viewMode === "list" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-50",
              )}
            >
              Widok listy
            </button>
            <button
              type="button"
              onClick={() => setViewMode("timeline")}
              className={cn(
                "w-1/2 rounded-md px-3 py-2 text-sm font-medium sm:w-auto",
                viewMode === "timeline" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-50",
              )}
            >
              Oś czasu
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              <span className="font-medium text-slate-900">{stats.progress}%</span>{" "}
              <span className="text-slate-500">ukończone</span>
            </div>
            <div className="text-sm text-slate-600">
              <span className="font-medium text-slate-900">{stats.total}</span> kroków •{" "}
              <span className="text-emerald-700">{stats.done}</span> wykonane •{" "}
              <span className="text-slate-600">{stats.pending}</span> oczekujące
            </div>
          </div>
        </div>

        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-[width] duration-300"
            style={{ width: `${stats.progress}%` }}
          />
        </div>
      </div>

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900">A. Dodaj nowy krok</h2>
          <p className="mt-1 text-sm text-slate-600">Minimalna walidacja: nazwa jest wymagana.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
          <div className="sm:col-span-5">
            <label className="mb-1 block text-sm font-medium text-slate-700">Nazwa</label>
            <input
              value={formName}
              onChange={(e) => {
                setFormName(e.target.value);
                if (formError) setFormError(null);
              }}
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-sm outline-none",
                formError ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-slate-400",
              )}
              placeholder='np. "Próba szczelności"'
            />
            {formError && <p className="mt-1 text-sm text-rose-600">{formError}</p>}
          </div>

          <div className="sm:col-span-5">
            <label className="mb-1 block text-sm font-medium text-slate-700">Opis / zakres robót</label>
            <input
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              placeholder="Krótki opis (opcjonalnie)"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Data</label>
            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
          </div>

          <div className="sm:col-span-12 flex items-center justify-end">
            <button
              type="button"
              onClick={addStep}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Dodaj krok
            </button>
          </div>
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900">D. Struktura harmonogramu (fazy 0–8)</h2>
          <p className="mt-1 text-sm text-slate-600">
            Kolejność technologiczna. Każda faza ma cel, zależności, typowe blokady i plan B.
          </p>
        </div>

        <div className="space-y-3">
          {phases.map((p) => (
            <details key={p.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer select-none text-sm font-semibold text-slate-900">{p.title}</summary>
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="text-xs font-semibold text-slate-700">Cel</div>
                  <div className="mt-1 text-sm text-slate-700">{p.goal}</div>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="text-xs font-semibold text-slate-700">Typowe blokady</div>
                  <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
                    {p.blockers.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border border-slate-200 p-3 md:col-span-2">
                  <div className="text-xs font-semibold text-slate-700">Zakres</div>
                  <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
                    {p.includes.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border border-slate-200 p-3">
                  <div className="text-xs font-semibold text-slate-700">Zależności wejściowe</div>
                  <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
                    {p.dependencies.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-3">
                  <div className="text-xs font-semibold text-amber-800">Plan B</div>
                  <div className="mt-1 text-sm text-amber-900">{p.planB}</div>
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900">E. Etapy techniczne — checklisty</h2>
          <p className="mt-1 text-sm text-slate-600">Lista kontrolna dla wykonawcy i inspektora (ta sama baza, inna perspektywa).</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {technicalChecklists.map((c) => (
            <div key={c.title} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">{c.title}</div>
              <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
                {c.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900">F. Organizacja robót w budynku zamieszkałym</h2>
          <p className="mt-1 text-sm text-slate-600">To jest najczęstsze wąskie gardło: dostęp do lokali, przerwy w wodzie i konfliktogenne odtworzenia.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="text-sm font-semibold text-slate-900">Wejścia do lokali</div>
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
              <li>harmonogram wejść: dzień/godzina + potwierdzenia</li>
              <li>procedura „lokal nieudostępniony” (eskalacja do administracji)</li>
              <li>bufor czasowy na powroty po uruchomieniu</li>
            </ul>
          </div>
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="text-sm font-semibold text-slate-900">Przerwy w dostawie wody</div>
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
              <li>okna wyłączeń ustalone z administracją (max czas bez wody)</li>
              <li>praca odcinkowa i sekcjonowanie (jeśli możliwe)</li>
              <li>komunikacja: klatki + opcjonalnie SMS/mail</li>
            </ul>
          </div>
          <div className="rounded-lg border border-slate-200 p-4 md:col-span-2">
            <div className="text-sm font-semibold text-slate-900">Odtworzenia — jak nie wejść w spór</div>
            <p className="mt-2 text-sm text-slate-700">
              Przed startem spisz standard: <span className="font-medium">minimalny</span> (funkcja/bezpieczeństwo) vs <span className="font-medium">rozszerzony</span>
              (wykończenie). Zrób dokumentację zdjęciową stanu istniejącego.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900">G. Czasy trwania (widełki) + czynniki wpływu</h2>
          <p className="mt-1 text-sm text-slate-600">Realistycznie: widełki zamiast obietnic. Najczęściej decyduje dostęp do lokali.</p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full border-collapse bg-white text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-900">Element</th>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-900">Widełki</th>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-900">Zależy od</th>
              </tr>
            </thead>
            <tbody>
              {durations.map((d) => (
                <tr key={d.task} className="odd:bg-white even:bg-slate-50/40">
                  <td className="border-b border-slate-200 px-3 py-2 text-slate-900">{d.task}</td>
                  <td className="border-b border-slate-200 px-3 py-2 text-slate-700">{d.range}</td>
                  <td className="border-b border-slate-200 px-3 py-2 text-slate-700">{d.depends}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900">H. Ryzyka i wąskie gardła (z planem B)</h2>
          <p className="mt-1 text-sm text-slate-600">Sekcja operacyjna: sygnał → skutek → prewencja → plan B.</p>
        </div>

        <div className="space-y-3">
          {risks.map((r) => (
            <div key={r.risk} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">{r.risk}</div>
              <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="text-xs font-semibold text-slate-700">Sygnał</div>
                  <div className="mt-1 text-sm text-slate-700">{r.signal}</div>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="text-xs font-semibold text-slate-700">Skutek</div>
                  <div className="mt-1 text-sm text-slate-700">{r.impact}</div>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <div className="text-xs font-semibold text-slate-700">Prewencja</div>
                  <div className="mt-1 text-sm text-slate-700">{r.prevention}</div>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-3">
                  <div className="text-xs font-semibold text-amber-800">Plan B</div>
                  <div className="mt-1 text-sm text-amber-900">{r.planB}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900">I. Widoki dla odbiorców (ten sam harmonogram, inne tłumaczenie)</h2>
          <p className="mt-1 text-sm text-slate-600">Wybierz perspektywę: co ma być jasne dla danej grupy.</p>
        </div>

        <div className="inline-flex w-full rounded-lg border border-slate-200 bg-white p-1 sm:w-auto">
          {(
            [
              { k: "mieszkaniec", label: "Mieszkaniec" },
              { k: "zarzad", label: "Zarząd" },
              { k: "inspektor", label: "Inspektor" },
              { k: "wykonawca", label: "Wykonawca" },
            ] as const
          ).map((t) => (
            <button
              key={t.k}
              type="button"
              onClick={() => setAudienceMode(t.k)}
              className={cn(
                "w-1/2 rounded-md px-3 py-2 text-sm font-medium sm:w-auto",
                audienceMode === t.k ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-50",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold text-slate-900">{audienceContent.title}</div>
          <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
            {audienceContent.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="mb-2">
          <h2 className="text-base font-semibold text-slate-900">J. Opcje rozwoju (moduły)</h2>
          <p className="mt-1 text-sm text-slate-600">Dodatki, które można dołożyć bez psucia logiki harmonogramu.</p>
        </div>
        <ul className="mt-3 list-disc pl-5 text-sm text-slate-700">
          <li>Integracja z kosztami: koszt na pion / klatkę / strefę + warianty zakresu.</li>
          <li>Powiązanie ze stratami CWU i energii: argumenty techniczne (np. cyrkulacja, izolacje), bez marketingu.</li>
          <li>Moduł modernizacji cyrkulacji: regulacja, zawory, izolacje, rozruch i stabilizacja.</li>
          <li>Eksporty PDF: osobno dla mieszkańców (wejścia + przerwy), zarządu (fazy + ryzyka), inspektora (checklisty + protokoły).</li>
        </ul>
      </section>

      {viewMode === "list" && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">B. Widok listy kroków</h2>
            <p className="mt-1 text-sm text-slate-600">Kafelki z szybkim ukończeniem, edycją i usuwaniem.</p>
          </div>

          {orderedSteps.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-600">
              Brak kroków. Dodaj pierwszy krok w formularzu powyżej.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {orderedSteps.map((step, index) => {
                const isEditing = editingId === step.id;
                const statusLabel = step.completed ? "Zrealizowane" : "Oczekujące";

                return (
                  <div
                    key={step.id}
                    className={cn(
                      "border rounded-xl p-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
                      step.completed ? "border-emerald-200 bg-emerald-50/40" : "border-slate-200 bg-white",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex h-6 items-center rounded-full bg-slate-100 px-2 text-xs font-medium text-slate-700">
                          #{index + 1}
                        </span>
                        <span
                          className={cn(
                            "inline-flex h-6 items-center rounded-full px-2 text-xs font-medium",
                            step.completed ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700",
                          )}
                        >
                          {statusLabel}
                        </span>
                        <span className="text-xs text-slate-600">
                          Data: <span className="font-medium text-slate-900">{formatDatePL(step.date)}</span>
                        </span>
                      </div>

                      {!isEditing ? (
                        <>
                          <div
                            className={cn(
                              "mt-2 text-base font-semibold text-slate-900",
                              step.completed && "line-through decoration-slate-400",
                            )}
                          >
                            {step.name}
                          </div>
                          {step.description ? (
                            <p className="mt-1 text-sm text-slate-700">{step.description}</p>
                          ) : (
                            <p className="mt-1 text-sm text-slate-500">Brak opisu.</p>
                          )}
                        </>
                      ) : (
                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-12">
                          <div className="sm:col-span-5">
                            <label className="mb-1 block text-sm font-medium text-slate-700">Nazwa</label>
                            <input
                              value={editName}
                              onChange={(e) => {
                                setEditName(e.target.value);
                                if (editError) setEditError(null);
                              }}
                              className={cn(
                                "w-full rounded-lg border px-3 py-2 text-sm outline-none",
                                editError
                                  ? "border-rose-400 focus:border-rose-500"
                                  : "border-slate-200 focus:border-slate-400",
                              )}
                            />
                            {editError && <p className="mt-1 text-sm text-rose-600">{editError}</p>}
                          </div>
                          <div className="sm:col-span-5">
                            <label className="mb-1 block text-sm font-medium text-slate-700">Opis</label>
                            <input
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-sm font-medium text-slate-700">Data</label>
                            <input
                              type="date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                      <button
                        type="button"
                        onClick={() => toggleStatus(step.id)}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium",
                          step.completed
                            ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            : "border-emerald-200 bg-emerald-600 text-white hover:bg-emerald-500",
                        )}
                        aria-label={step.completed ? "Przywróć krok" : "Oznacz jako ukończony"}
                        title={step.completed ? "Przywróć" : "Ukończ"}
                      >
                        {step.completed ? "↩ Przywróć" : "✓ Ukończ"}
                      </button>

                      {!isEditing ? (
                        <button
                          type="button"
                          onClick={() => beginEdit(step)}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          aria-label="Edytuj krok"
                          title="Edytuj"
                        >
                          ✎ Edytuj
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => saveEdit(step.id)}
                            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
                            aria-label="Zapisz zmiany"
                            title="Zapisz"
                          >
                            💾 Zapisz
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            aria-label="Anuluj edycję"
                            title="Anuluj"
                          >
                            ✕ Anuluj
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => removeStep(step.id)}
                        className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
                        aria-label="Usuń krok"
                        title="Usuń"
                      >
                        🗑 Usuń
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {viewMode === "timeline" && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">C. Widok osi czasu</h2>
            <p className="mt-1 text-sm text-slate-600">
              Zielony = wykonane, szary = w toku. Kolejność wg daty (a bez daty na końcu).
            </p>
          </div>

          {orderedSteps.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-600">
              Brak kroków do wyświetlenia na osi czasu.
            </div>
          ) : (
            <ol className="relative ml-2">
              {orderedSteps.map((step, idx) => {
                const isLast = idx === orderedSteps.length - 1;
                const dotClass = step.completed
                  ? "bg-emerald-500 ring-emerald-200"
                  : "bg-slate-300 ring-slate-200";
                const lineClass = step.completed ? "bg-emerald-200" : "bg-slate-200";
                const titleClass = step.completed
                  ? "text-slate-900 line-through decoration-slate-400"
                  : "text-slate-900";

                return (
                  <li key={step.id} className="relative pb-6 pl-8">
                    {!isLast && (
                      <span
                        className={cn("absolute left-[0.68rem] top-3 h-full w-px", lineClass)}
                        aria-hidden="true"
                      />
                    )}

                    <span
                      className={cn("absolute left-0 top-2 h-3 w-3 rounded-full ring-4", dotClass)}
                      aria-hidden="true"
                    />

                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-slate-600">
                          {step.date ? formatDatePL(step.date) : "Bez daty"}
                        </span>
                        <span
                          className={cn(
                            "inline-flex h-6 items-center rounded-full px-2 text-xs font-medium",
                            step.completed ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700",
                          )}
                        >
                          {step.completed ? "Zrealizowane" : "Oczekujące"}
                        </span>
                        <span className="text-xs text-slate-500">#{idx + 1}</span>
                      </div>

                      <div className={cn("mt-2 text-sm font-semibold", titleClass)}>{step.name}</div>
                      {step.description ? (
                        <p className="mt-1 text-sm text-slate-700">{step.description}</p>
                      ) : (
                        <p className="mt-1 text-sm text-slate-500">Brak opisu.</p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => toggleStatus(step.id)}
                          className={cn(
                            "rounded-lg px-3 py-2 text-sm font-medium",
                            step.completed
                              ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                              : "bg-emerald-600 text-white hover:bg-emerald-500",
                          )}
                        >
                          {step.completed ? "Przywróć" : "Ukończ"}
                        </button>
                        <button
                          type="button"
                          onClick={() => beginEdit(step)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Edytuj
                        </button>
                        <button
                          type="button"
                          onClick={() => removeStep(step.id)}
                          className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
                        >
                          Usuń
                        </button>
                      </div>

                      {editingId === step.id && (
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-12">
                          <div className="sm:col-span-5">
                            <label className="mb-1 block text-sm font-medium text-slate-700">Nazwa</label>
                            <input
                              value={editName}
                              onChange={(e) => {
                                setEditName(e.target.value);
                                if (editError) setEditError(null);
                              }}
                              className={cn(
                                "w-full rounded-lg border px-3 py-2 text-sm outline-none",
                                editError
                                  ? "border-rose-400 focus:border-rose-500"
                                  : "border-slate-200 focus:border-slate-400",
                              )}
                            />
                            {editError && <p className="mt-1 text-sm text-rose-600">{editError}</p>}
                          </div>
                          <div className="sm:col-span-5">
                            <label className="mb-1 block text-sm font-medium text-slate-700">Opis</label>
                            <input
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-sm font-medium text-slate-700">Data</label>
                            <input
                              type="date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                            />
                          </div>
                          <div className="sm:col-span-12 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => saveEdit(step.id)}
                              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
                            >
                              Zapisz
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                              Anuluj
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      )}
    </div>
  );
}

*/
