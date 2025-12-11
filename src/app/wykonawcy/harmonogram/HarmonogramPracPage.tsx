// Harmonogram prac i terminy realizacji
// Komponent do planowania etapów, terminów, monitorowania postępu i generowania harmonogramu dla inwestora/mieszkańców
// Zgodnie z wytycznymi – mockowane dane, pełna logika, responsywność, styl Next.js + Tailwind

import React, { useMemo, useState } from "react";
import { CalendarClock, Plus, ChevronUp, ChevronDown, Eye, Printer, FileText, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Typy
export type Project = {
  id: string;
  name: string;
  address: string;
  estimateId?: string;
  offerId?: string;
};

export type StageStatus = "not_started" | "in_progress" | "completed" | "delayed";

export type Stage = {
  id: string;
  projectId: string;
  name: string;
  type?: string;
  durationDays: number;
  order: number;
  startDate?: string;
  endDate?: string;
  status: StageStatus;
  progress: number;
  notes?: string;
};

export type ScheduleOptions = {
  workdaysOnly: boolean;
  includeWeekends: boolean;
};

const stageTypeOptions = [
  { value: "przygotowanie", label: "Przygotowanie" },
  { value: "montaz", label: "Montaż" },
  { value: "proby", label: "Próby" },
  { value: "odbior", label: "Odbiór" },
];

const defaultStages: Stage[] = [
  { id: "s1", projectId: "1", name: "Przygotowanie dokumentacji i uzgodnień", type: "przygotowanie", durationDays: 7, order: 1, status: "not_started", progress: 0 },
  { id: "s2", projectId: "1", name: "Zamówienie i dostawa materiałów", type: "przygotowanie", durationDays: 10, order: 2, status: "not_started", progress: 0 },
  { id: "s3", projectId: "1", name: "Demontaż starej instalacji", type: "montaz", durationDays: 5, order: 3, status: "not_started", progress: 0 },
  { id: "s4", projectId: "1", name: "Montaż nowej instalacji CWU i cyrkulacji", type: "montaz", durationDays: 12, order: 4, status: "not_started", progress: 0 },
  { id: "s5", projectId: "1", name: "Izolacja i prace wykończeniowe", type: "montaz", durationDays: 4, order: 5, status: "not_started", progress: 0 },
  { id: "s6", projectId: "1", name: "Próby szczelności i regulacja", type: "proby", durationDays: 3, order: 6, status: "not_started", progress: 0 },
  { id: "s7", projectId: "1", name: "Odbiór techniczny i rozruch", type: "odbior", durationDays: 2, order: 7, status: "not_started", progress: 0 },
];

export default function HarmonogramPracPage() {
  // Stan projektów i aktualnie wybranego projektu
  const [projects, setProjects] = useState<Project[]>([
    { id: "1", name: "Modernizacja CWU – Zielona 8", address: "ul. Zielona 8, Warszawa", estimateId: "WY-2025-001", offerId: "OF-2025-001" },
    { id: "2", name: "CWU – Słoneczna 12", address: "ul. Słoneczna 12, Warszawa", estimateId: "WY-2025-002" },
    { id: "3", name: "Wymiana CWU – Osiedle Parkowe", address: "Osiedle Parkowe 5, Pruszków" },
  ]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(projects[0]?.id || null);
  const currentProject = projects.find(p => p.id === currentProjectId) || null;

  // Modal do tworzenia nowego projektu
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({ name: "", address: "", estimateId: "", offerId: "" });

  // Etapy modernizacji
  const [stages, setStages] = useState<Stage[]>(defaultStages);
  const sortedStages = useMemo(() => [...stages].sort((a, b) => a.order - b.order), [stages]);

  // Planowanie terminów
  const [projectStartDate, setProjectStartDate] = useState<string>("2025-01-15");
  const [scheduleOptions, setScheduleOptions] = useState<ScheduleOptions>({ workdaysOnly: true, includeWeekends: false });
  const [viewMode, setViewMode] = useState<"list" | "timeline">("list");

  // Udostępnianie
  const [shareOptions, setShareOptions] = useState({
    showNames: true,
    showDates: true,
    showNotes: false,
    hideInternal: true,
  });
  const [showClientPreview, setShowClientPreview] = useState(false);

  const overallProgress = useMemo(() => {
    if (!sortedStages.length) return 0;
    const total = sortedStages.reduce((sum, stage) => sum + (stage.progress || 0), 0);
    return Math.round(total / sortedStages.length);
  }, [sortedStages]);

  function handleStageChange(stageId: string, field: keyof Stage, value: string | number) {
    setStages(prev => prev.map(stage => stage.id === stageId ? { ...stage, [field]: value } : stage));
  }

  function addStage() {
    const nextOrder = stages.length + 1;
    const id = `s${nextOrder}`;
    const newStage: Stage = {
      id,
      projectId: currentProjectId || "1",
      name: `Nowy etap ${nextOrder}`,
      type: "przygotowanie",
      durationDays: 3,
      order: nextOrder,
      status: "not_started",
      progress: 0,
    };
    setStages(prev => [...prev, newStage]);
  }

  function moveStage(stageId: string, direction: "up" | "down") {
    setStages(prev => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex(s => s.id === stageId);
      if (index === -1) return prev;
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= sorted.length) return prev;
      const tempOrder = sorted[index].order;
      sorted[index].order = sorted[targetIndex].order;
      sorted[targetIndex].order = tempOrder;
      return sorted.map((stage, idx) => ({ ...stage, order: idx + 1 }));
    });
  }

  function addDaysSkippingWeekends(start: Date, days: number, options: ScheduleOptions) {
    const date = new Date(start);
    let remaining = days;
    while (remaining > 0) {
      date.setDate(date.getDate() + 1);
      const day = date.getDay();
      const isWeekend = day === 0 || day === 6;
      if (options.workdaysOnly && isWeekend) continue;
      remaining -= 1;
    }
    return date;
  }

  function formatDateInput(date?: string) {
    if (!date) return "";
    return date.split("T")[0];
  }

  function generateSchedule() {
    if (!projectStartDate) return;
    const start = new Date(projectStartDate);
    setStages(prev => {
      let current = new Date(start);
      return [...prev].sort((a, b) => a.order - b.order).map(stage => {
        const stageStart = new Date(current);
        const stageEnd = addDaysSkippingWeekends(stageStart, stage.durationDays, scheduleOptions);
        current = new Date(stageEnd);
        return { ...stage, startDate: stageStart.toISOString(), endDate: stageEnd.toISOString() };
      });
    });
  }

  function handleStageDateChange(stageId: string, field: "startDate" | "endDate", value: string) {
    setStages(prev => prev.map(stage => stage.id === stageId ? { ...stage, [field]: value ? new Date(value).toISOString() : undefined } : stage));
  }

  function handlePrint() {
    window.print();
  }

  function handleExportPDF() {
    // TODO: integracja z generatorem PDF
    alert("Eksport PDF będzie dostępny wkrótce.");
  }

  function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!newProject.name || !newProject.address) return;
    const id = (projects.length + 1).toString();
    setProjects(prev => [...prev, { id, name: newProject.name!, address: newProject.address!, estimateId: newProject.estimateId, offerId: newProject.offerId }]);
    setCurrentProjectId(id);
    setShowNewProjectModal(false);
    setNewProject({ name: "", address: "", estimateId: "", offerId: "" });
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-green-900 via-blue-900 to-slate-900 px-4 py-12">
      <div className="max-w-5xl w-full bg-slate-900/80 rounded-3xl shadow-2xl p-8 md:p-12 border border-green-800 mt-4">
        {/* Nagłówek */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-green-300 mb-2">Harmonogram prac i terminy realizacji</h1>
          <h2 className="text-lg text-green-200 mb-2">Tutaj możesz zaplanować harmonogram prac modernizacyjnych instalacji CWU, ustalić terminy realizacji oraz monitorować postęp.</h2>
          <p className="text-sm text-slate-300">Najpierw wybierz projekt, potem zdefiniuj etapy, ustaw terminy i śledź realizację robót.</p>
        </div>

        {/* Pasek kroków (nagłówki sekcji) */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {[
            "Wybór projektu",
            "Etapy modernizacji",
            "Planowanie terminów",
            "Postęp prac",
            "Udostępnianie harmonogramu",
          ].map((label, i) => (
            <span key={label} className={`px-4 py-2 rounded-xl font-bold text-sm ${i === 0 ? "bg-green-700 text-white" : "bg-slate-800 text-green-300"}`}>{label}</span>
          ))}
        </div>

        {/* Sekcja 1: Wybór projektu / budynku */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-green-200 mb-4">Wybierz projekt / budynek</h3>
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div>
              <label className="block text-green-300 font-semibold mb-1">Projekt</label>
              <select
                className="w-64 rounded-lg bg-slate-800 text-green-100 px-3 py-2 border border-green-700"
                value={currentProjectId || ""}
                onChange={e => setCurrentProjectId(e.target.value)}
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name} – {p.address}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold bg-gradient-to-r from-green-700 to-cyan-600 text-white shadow-lg hover:scale-105 transition-all"
              onClick={() => setShowNewProjectModal(true)}
            >
              <Plus className="w-5 h-5" /> Utwórz nowy projekt harmonogramu
            </button>
          </div>
        </div>

        {/* Modal nowego projektu */}
        {showNewProjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <form className="bg-slate-900 rounded-2xl p-8 shadow-2xl border border-green-800 w-full max-w-md space-y-4" onSubmit={handleCreateProject}>
              <h4 className="text-lg font-bold text-green-200 mb-2">Nowy projekt harmonogramu</h4>
              <div>

              {/* Sekcja 3: Planowanie terminów */}
              <div className="mb-12">
                <h3 className="text-xl font-bold text-green-200 mb-4">Planowanie terminów</h3>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-green-300 font-semibold mb-1">Data rozpoczęcia prac</label>
                    <input type="date" className="w-full rounded-lg bg-slate-800 text-green-100 px-3 py-2 border border-green-700" value={projectStartDate} onChange={e => setProjectStartDate(e.target.value)} />
                  </div>
                  <label className="flex items-center gap-2 text-green-200 font-semibold">
                    <input type="checkbox" checked={scheduleOptions.workdaysOnly} onChange={() => setScheduleOptions(o => ({ ...o, workdaysOnly: !o.workdaysOnly }))} />
                    Uwzględniaj tylko dni robocze (pon–pt)
                  </label>
                  <label className="flex items-center gap-2 text-green-200 font-semibold">
                    <input type="checkbox" checked={scheduleOptions.includeWeekends} onChange={() => setScheduleOptions(o => ({ ...o, includeWeekends: !o.includeWeekends }))} />
                    Uwzględniaj weekendy
                  </label>
                </div>
                <button type="button" className="px-6 py-2 rounded-xl font-bold bg-gradient-to-r from-green-700 to-cyan-600 text-white shadow-lg hover:scale-105 transition-all" onClick={generateSchedule}>
                  Wyznacz terminy etapów
                </button>
                <div className="overflow-x-auto mt-6">
                  <table className="w-full text-sm border border-green-800 rounded-2xl overflow-hidden">
                    <thead className="bg-slate-800 text-green-200">
                      <tr>
                        <th className="px-3 py-2 text-left">Etap</th>
                        <th className="px-3 py-2">Start</th>
                        <th className="px-3 py-2">Koniec</th>
                        <th className="px-3 py-2">Czas trwania (dni)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedStages.map(stage => (
                        <tr key={stage.id} className="border-t border-green-900">
                          <td className="px-3 py-2 text-green-100">{stage.name}</td>
                          <td className="px-3 py-2">
                            <input type="date" className="rounded-lg bg-slate-900 text-green-100 px-2 py-1 border border-green-700" value={formatDateInput(stage.startDate)} onChange={e => handleStageDateChange(stage.id, "startDate", e.target.value)} />
                          </td>
                          <td className="px-3 py-2">
                            <input type="date" className="rounded-lg bg-slate-900 text-green-100 px-2 py-1 border border-green-700" value={formatDateInput(stage.endDate)} onChange={e => handleStageDateChange(stage.id, "endDate", e.target.value)} />
                          </td>
                          <td className="px-3 py-2 text-center text-green-100">{stage.durationDays}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sekcja 4: Monitorowanie postępu */}
              <div className="mb-12">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-green-200">Postęp prac</h3>
                    <p className="text-sm text-slate-400">Aktualizuj statusy etapów, aby monitorować realizację.</p>
                  </div>
                  <div className="text-lg font-bold text-green-200">Postęp projektu: <span className="text-white">{overallProgress}%</span></div>
                </div>
                <div className="space-y-4">
                  {sortedStages.map(stage => (
                    <div key={stage.id} className="border border-green-800 rounded-2xl p-4 bg-slate-900/60">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                          <div className="text-green-200 font-semibold">{stage.name}</div>
                          <div className="text-xs text-slate-400">{stage.startDate ? new Date(stage.startDate).toLocaleDateString("pl-PL") : "brak terminu"} – {stage.endDate ? new Date(stage.endDate).toLocaleDateString("pl-PL") : "brak"}</div>
                        </div>
                        <div>
                          <label className="block text-green-300 font-semibold mb-1">Status</label>
                          <select className="rounded-lg bg-slate-800 text-green-100 px-3 py-2 border border-green-700" value={stage.status} onChange={e => handleStageChange(stage.id, "status", e.target.value)}>
                            <option value="not_started">Nie rozpoczęto</option>
                            <option value="in_progress">W toku</option>
                            <option value="completed">Zakończono</option>
                            <option value="delayed">Opóźnione</option>
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="block text-green-300 font-semibold mb-1">Postęp (%)</label>
                          <input type="range" min={0} max={100} value={stage.progress} onChange={e => handleStageChange(stage.id, "progress", Number(e.target.value))} className="w-full" />
                          <div className="text-sm text-green-200">{stage.progress}%</div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="block text-green-300 font-semibold mb-1">Notatki</label>
                        <textarea className="w-full rounded-lg bg-slate-800 text-green-100 px-3 py-2 border border-green-700" rows={2} value={stage.notes || ""} onChange={e => handleStageChange(stage.id, "notes", e.target.value)} placeholder="Uwagi dla zespołu lub inwestora" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Widoki harmonogramu */}
              <div className="mb-12">
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-xl font-bold text-green-200">Widok harmonogramu</h3>
                  <div className="flex gap-2">
                    <button type="button" className={`px-4 py-2 rounded-xl font-bold border ${viewMode === "list" ? "bg-green-700 text-white border-green-700" : "bg-slate-800 text-green-200 border-green-700"}`} onClick={() => setViewMode("list")}>
                      <List className="inline-block w-4 h-4 mr-1" /> Widok listy
                    </button>
                    <button type="button" className={`px-4 py-2 rounded-xl font-bold border ${viewMode === "timeline" ? "bg-green-700 text-white border-green-700" : "bg-slate-800 text-green-200 border-green-700"}`} onClick={() => setViewMode("timeline")}>
                      <CalendarClock className="inline-block w-4 h-4 mr-1" /> Widok osi czasu
                    </button>
                  </div>
                </div>
                {viewMode === "list" ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-green-800 rounded-2xl overflow-hidden">
                      <thead className="bg-slate-800 text-green-200">
                        <tr>
                          <th className="px-3 py-2 text-left">Etap</th>
                          <th className="px-3 py-2">Start</th>
                          <th className="px-3 py-2">Koniec</th>
                          <th className="px-3 py-2">Status</th>
                          <th className="px-3 py-2">Postęp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedStages.map(stage => (
                          <tr key={stage.id} className="border-t border-green-900">
                            <td className="px-3 py-2 text-green-100">{stage.name}</td>
                            <td className="px-3 py-2 text-center text-green-100">{stage.startDate ? new Date(stage.startDate).toLocaleDateString("pl-PL") : "-"}</td>
                            <td className="px-3 py-2 text-center text-green-100">{stage.endDate ? new Date(stage.endDate).toLocaleDateString("pl-PL") : "-"}</td>
                            <td className="px-3 py-2 text-center">
                              <Badge variant="secondary" className="bg-slate-800 text-green-200 border border-green-700">
                                {stage.status === "not_started" && "Nie rozpoczęto"}
                                {stage.status === "in_progress" && "W toku"}
                                {stage.status === "completed" && "Zakończono"}
                                {stage.status === "delayed" && "Opóźnione"}
                              </Badge>
                            </td>
                            <td className="px-3 py-2 text-center text-green-100">{stage.progress}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedStages.map(stage => {
                      const widthPercent = stage.durationDays ? Math.min(100, stage.durationDays * 5) : 10;
                      return (
                        <div key={stage.id} className="bg-slate-800 rounded-2xl p-4">
                          <div className="flex justify-between text-sm text-green-200 mb-1">
                            <span>{stage.name}</span>
                            <span>{stage.startDate ? new Date(stage.startDate).toLocaleDateString("pl-PL") : "-"} – {stage.endDate ? new Date(stage.endDate).toLocaleDateString("pl-PL") : "-"}</span>
                          </div>
                          <div className="h-3 rounded-full bg-slate-900 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-green-600 to-cyan-500" style={{ width: `${widthPercent}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sekcja 5: Udostępnianie harmonogramu */}
              <div className="mb-12">
                <h3 className="text-xl font-bold text-green-200 mb-4">Udostępnij harmonogram</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <label className="flex items-center gap-2 text-green-200">
                    <input type="checkbox" checked={shareOptions.showNames} onChange={() => setShareOptions(o => ({ ...o, showNames: !o.showNames }))} />
                    Pokaż nazwy etapów
                  </label>
                  <label className="flex items-center gap-2 text-green-200">
                    <input type="checkbox" checked={shareOptions.showDates} onChange={() => setShareOptions(o => ({ ...o, showDates: !o.showDates }))} />
                    Pokaż daty start/koniec
                  </label>
                  <label className="flex items-center gap-2 text-green-200">
                    <input type="checkbox" checked={shareOptions.showNotes} onChange={() => setShareOptions(o => ({ ...o, showNotes: !o.showNotes }))} />
                    Pokaż opis/uwagi
                  </label>
                  <label className="flex items-center gap-2 text-green-200">
                    <input type="checkbox" checked={shareOptions.hideInternal} onChange={() => setShareOptions(o => ({ ...o, hideInternal: !o.hideInternal }))} />
                    Ukryj wewnętrzne notatki i statusy
                  </label>
                </div>
                <div className="flex flex-wrap gap-4">
                  <button type="button" className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold bg-gradient-to-r from-green-700 to-cyan-600 text-white shadow-lg hover:scale-105" onClick={() => setShowClientPreview(true)}>
                    <Eye className="w-5 h-5" /> Podgląd harmonogramu dla klienta
                  </button>
                  <button type="button" className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold bg-slate-800 text-green-200 border border-green-700 hover:bg-slate-700" onClick={handlePrint}>
                    <Printer className="w-5 h-5" /> Wersja do wydruku
                  </button>
                  <button type="button" className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold bg-slate-800 text-green-200 border border-green-700 hover:bg-slate-700" onClick={handleExportPDF}>
                    <FileText className="w-5 h-5" /> Pobierz jako PDF
                  </button>
                </div>
              </div>

              {showClientPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                  <div className="bg-white text-slate-900 rounded-3xl shadow-2xl max-w-3xl w-full p-8 overflow-y-auto max-h-[90vh]">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-2xl font-bold text-green-700">Planowany harmonogram prac przy modernizacji instalacji CWU</h4>
                        {currentProject && (
                          <p className="text-sm text-slate-600">Projekt: {currentProject.name} – {currentProject.address}</p>
                        )}
                      </div>
                      <button type="button" className="text-sm text-slate-500 hover:text-slate-900" onClick={() => setShowClientPreview(false)}>Zamknij</button>
                    </div>
                    <div className="space-y-4">
                      {sortedStages.map(stage => (
                        <div key={stage.id} className="border border-green-200 rounded-2xl p-4">
                          {shareOptions.showNames && <div className="font-bold text-green-800">{stage.name}</div>}
                          {shareOptions.showDates && (
                            <div className="text-sm text-slate-600">{stage.startDate ? new Date(stage.startDate).toLocaleDateString("pl-PL") : "-"} – {stage.endDate ? new Date(stage.endDate).toLocaleDateString("pl-PL") : "-"}</div>
                          )}
                          {shareOptions.showNotes && stage.notes && (
                            <div className="text-sm text-slate-700 mt-2">{stage.notes}</div>
                          )}
                          {!shareOptions.hideInternal && (
                            <div className="text-xs text-slate-500 mt-2">Status: {stage.status}, Postęp: {stage.progress}%</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
                <label className="block text-green-300 font-semibold mb-1">Nazwa projektu</label>
                <input type="text" className="w-full rounded-lg bg-slate-800 text-green-100 px-3 py-2 border border-green-700" value={newProject.name || ""} onChange={e => setNewProject(np => ({ ...np, name: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-green-300 font-semibold mb-1">Adres budynku</label>
                <input type="text" className="w-full rounded-lg bg-slate-800 text-green-100 px-3 py-2 border border-green-700" value={newProject.address || ""} onChange={e => setNewProject(np => ({ ...np, address: e.target.value }))} required />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-green-300 font-semibold mb-1">ID wyceny (opcjonalnie)</label>
                  <input type="text" className="w-full rounded-lg bg-slate-800 text-green-100 px-3 py-2 border border-green-700" value={newProject.estimateId || ""} onChange={e => setNewProject(np => ({ ...np, estimateId: e.target.value }))} />
                </div>
                <div className="flex-1">
                  <label className="block text-green-300 font-semibold mb-1">ID oferty (opcjonalnie)</label>
                  <input type="text" className="w-full rounded-lg bg-slate-800 text-green-100 px-3 py-2 border border-green-700" value={newProject.offerId || ""} onChange={e => setNewProject(np => ({ ...np, offerId: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-4">
                <button type="button" className="px-4 py-2 rounded-xl font-bold bg-slate-700 text-green-200 hover:bg-slate-800 transition-all" onClick={() => setShowNewProjectModal(false)}>Anuluj</button>
                <button type="submit" className="px-6 py-2 rounded-xl font-bold bg-gradient-to-r from-green-700 to-cyan-600 text-white shadow-lg hover:scale-105 transition-all">Utwórz projekt</button>
              </div>
            </form>
          </div>
        )}

        {/* Sekcja 2: Etapy modernizacji */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-green-200">Etapy modernizacji</h3>
            <button type="button" className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold bg-slate-800 text-green-200 border border-green-700 hover:bg-slate-700" onClick={addStage}>
              <Plus className="w-4 h-4" /> Dodaj etap
            </button>
          </div>
          <p className="text-sm text-slate-400 mb-4">Możesz edytować nazwy etapów, typ prac, czas trwania oraz kolejność. To pozwoli dopasować harmonogram do realiów inwestycji.</p>
          <div className="space-y-4">
            {sortedStages.map(stage => (
              <div key={stage.id} className="border border-green-800 rounded-2xl p-4 bg-slate-900/60">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <label className="block text-green-300 font-semibold mb-1">Nazwa etapu</label>
                    <input type="text" className="w-full rounded-lg bg-slate-800 text-green-100 px-3 py-2 border border-green-700" value={stage.name} onChange={e => handleStageChange(stage.id, "name", e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-green-300 font-semibold mb-1">Typ</label>
                    <select className="rounded-lg bg-slate-800 text-green-100 px-3 py-2 border border-green-700" value={stage.type} onChange={e => handleStageChange(stage.id, "type", e.target.value)}>
                      {stageTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-green-300 font-semibold mb-1">Czas trwania (dni)</label>
                    <input type="number" min={1} className="w-28 rounded-lg bg-slate-800 text-green-100 px-3 py-2 border border-green-700" value={stage.durationDays} onChange={e => handleStageChange(stage.id, "durationDays", Number(e.target.value))} />
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="p-2 rounded-full bg-slate-800 text-green-200 border border-green-700 hover:bg-slate-700" onClick={() => moveStage(stage.id, "up")} aria-label="Przesuń w górę">
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button type="button" className="p-2 rounded-full bg-slate-800 text-green-200 border border-green-700 hover:bg-slate-700" onClick={() => moveStage(stage.id, "down")} aria-label="Przesuń w dół">
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {sortedStages.length === 0 && (
              <div className="text-center text-slate-400 border border-dashed border-green-800 rounded-2xl p-6">Brak zdefiniowanych etapów. Dodaj pierwszy etap, aby rozpocząć planowanie.</div>
            )}
          </div>
        </div>

        {/* TODO: kolejne sekcje */}
      </div>
    </div>
  );
}
