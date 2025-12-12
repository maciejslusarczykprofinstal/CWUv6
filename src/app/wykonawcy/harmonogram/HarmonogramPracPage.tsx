"use client";

import { useMemo, useState } from "react";

type ViewMode = "list" | "timeline";

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
          Lista kroków i pionowa oś czasu. Dodawaj, edytuj, oznaczaj wykonanie i usuwaj.
        </p>

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
