
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";


type HarmonogramPDFProps = {
  project: Project | null;
  stages: Stage[];
  startDate: string;
};

function HarmonogramPDF({ project, stages, startDate }: HarmonogramPDFProps) {
  return (
    <Document>
      <Page size="A4" style={{ padding: 40, fontSize: 12, fontFamily: "Helvetica" }}>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Harmonogram prac</Text>
          <Text>Projekt: {project?.name}</Text>
          <Text>Adres: {project?.address}</Text>
          {project?.estimateId && <Text>ID wyceny: {project.estimateId}</Text>}
          {project?.offerId && <Text>ID oferty: {project.offerId}</Text>}
          <Text>Data rozpoczęcia: {startDate}</Text>
        </View>
        <View>
          <Text style={{ fontWeight: 700, marginBottom: 6 }}>Etapy:</Text>
          {stages.map((s, i) => (
            <View key={s.id} style={{ marginBottom: 4 }}>
              <Text>{i + 1}. {s.name}</Text>
              <Text>  • {s.startDate ? s.startDate.split('T')[0] : "-"} → {s.endDate ? s.endDate.split('T')[0] : "-"} ({s.durationDays} dni)</Text>
              <Text>  • Status: {s.status === "not_started" ? "Nie rozpoczęto" : s.status === "in_progress" ? "W trakcie" : s.status === "completed" ? "Zakończono" : "Opóźnione"}, Postęp: {s.progress}%</Text>
              {s.notes && <Text>  • Notatki: {s.notes}</Text>}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
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

const stepLabels = [
  "Wybór projektu",
  "Etapy modernizacji",
  "Planowanie terminów",
  "Postęp prac",
  "Udostępnianie harmonogramu",
];

export default function HarmonogramPracPage() {
    // Krok aktywny (0-4)
    const [activeStep, setActiveStep] = useState(0);
    const [validationError, setValidationError] = useState<string | null>(null);

    // Walidacja kroków
    function validateStep(step: number): string | null {
      if (step > 0 && !currentProjectId) return "Wybierz projekt, aby kontynuować.";
      if (step > 1 && sortedStages.length === 0) return "Dodaj przynajmniej jeden etap.";
      if (step > 2) {
        if (!projectStartDate) return "Ustaw datę rozpoczęcia projektu.";
        if (sortedStages.some(s => !s.startDate || !s.endDate)) return "Ustal terminy dla wszystkich etapów.";
        if (sortedStages.some(s => !s.durationDays || s.durationDays < 1)) return "Czas trwania każdego etapu musi być >= 1 dzień.";
      }
      return null;
    }

    function trySetStep(nextStep: number) {
      const err = validateStep(nextStep);
      setValidationError(err);
      if (!err) setActiveStep(nextStep);
    }
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
  useEffect(() => {
    if (!showNewProjectModal) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setShowNewProjectModal(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showNewProjectModal]);

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
    const invalid = stages.find(s => !s.durationDays || s.durationDays < 1);
    if (invalid) {
      alert("Ustal prawidłowy czas trwania (>=1 dzień) dla wszystkich etapów.");
      return;
    }
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
    // Nie używamy tej funkcji, bo PDFDownloadLink jest w renderze
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
        <div className="flex flex-wrap gap-2 mb-2 justify-center">
          {stepLabels.map((label, i) => (
            <button
              key={label}
              type="button"
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all border ${activeStep === i ? "bg-green-700 text-white border-green-700 scale-105" : "bg-slate-800 text-green-300 border-green-700 hover:bg-green-800 hover:text-white"}`}
              onClick={() => trySetStep(i)}
              aria-current={activeStep === i ? "step" : undefined}
              disabled={i > activeStep + 1}
            >
              {label}
            </button>
          ))}
        </div>
        {validationError && (
          <div className="text-center text-red-400 font-semibold mb-6">{validationError}</div>
        )}
        {/* Przyciski Dalej/Wstecz */}
        <div className="flex justify-between mt-4 mb-8 max-w-2xl mx-auto">
          <button
            type="button"
            className="px-6 py-2 rounded-xl font-bold bg-slate-800 text-green-200 border border-green-700 hover:bg-slate-700 disabled:opacity-50"
            onClick={() => trySetStep(activeStep - 1)}
            disabled={activeStep === 0}
          >
            Wstecz
          </button>
          <button
            type="button"
            className="px-6 py-2 rounded-xl font-bold bg-gradient-to-r from-green-700 to-cyan-600 text-white shadow-lg hover:scale-105 transition-all disabled:opacity-50"
            onClick={() => trySetStep(activeStep + 1)}
            disabled={activeStep === stepLabels.length - 1}
          >
            Dalej
          </button>
        </div>

        {/* Sekcje kroków */}
        {activeStep === 0 && (
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
        )}

        {activeStep === 1 && (
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
        )}

        {activeStep === 2 && (
          <div className="mb-12">
            {/* Sekcja 3: Planowanie terminów */}
            {/* ...istniejący kod sekcji 3... */}
            {/* Skopiowane z poprzedniej sekcji 3 */}
            <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
              <div>
                <label className="block text-green-300 font-semibold mb-1">Data rozpoczęcia projektu</label>
                <input type="date" className="rounded-lg bg-slate-800 text-green-100 px-3 py-2 border border-green-700" value={projectStartDate} onChange={e => setProjectStartDate(e.target.value)} />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-green-200">
                  <input type="checkbox" checked={scheduleOptions.workdaysOnly} onChange={e => setScheduleOptions(o => ({ ...o, workdaysOnly: e.target.checked }))} /> Tylko dni robocze
                </label>
                <label className="flex items-center gap-2 text-green-200">
                  <input type="checkbox" checked={scheduleOptions.includeWeekends} onChange={e => setScheduleOptions(o => ({ ...o, includeWeekends: e.target.checked }))} /> Uwzględnij weekendy
                </label>
              </div>
              <button type="button" className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold bg-gradient-to-r from-green-700 to-cyan-600 text-white shadow-lg hover:scale-105 transition-all" onClick={generateSchedule}>
                <CalendarClock className="w-5 h-5" /> Generuj terminy
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-green-200">
                    <th className="text-left py-2">Etap</th>
                    <th className="text-left py-2">Start</th>
                    <th className="text-left py-2">Koniec</th>
                    <th className="text-left py-2">Dni</th>
                    <th className="text-left py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStages.map(stage => (
                    <tr key={stage.id} className="border-t border-green-800 text-green-100">
                      <td className="py-2">{stage.name}</td>
                      <td className="py-2">
                        <input type="date" className="rounded-lg bg-slate-800 px-2 py-1 border border-green-700" value={formatDateInput(stage.startDate)} onChange={e => handleStageDateChange(stage.id, "startDate", e.target.value)} />
                      </td>
                      <td className="py-2">
                        <input type="date" className="rounded-lg bg-slate-800 px-2 py-1 border border-green-700" value={formatDateInput(stage.endDate)} onChange={e => handleStageDateChange(stage.id, "endDate", e.target.value)} />
                      </td>
                      <td className="py-2">{stage.durationDays} dni</td>
                      <td className="py-2">
                        <Badge variant="outline" className="border-green-700 text-green-200">
                          {stage.status === "not_started" ? "Nie rozpoczęto" : stage.status === "in_progress" ? "W trakcie" : stage.status === "completed" ? "Zakończono" : "Opóźnione"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeStep === 3 && (
          <div className="mb-12">
            {/* Sekcja 4: Postęp prac */}
            {/* ...istniejący kod sekcji 4... */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-green-200">Postęp prac</h3>
              <div className="flex items-center gap-3">
                <span className="text-green-300">Łączny postęp:</span>
                <div className="w-40 h-3 bg-slate-800 rounded-full overflow-hidden border border-green-800">
                  <div className="h-full bg-green-600" style={{ width: `${overallProgress}%` }} />
                </div>
                <span className="text-green-200 font-bold">{overallProgress}%</span>
              </div>
            </div>
            <div className="space-y-4">
              {sortedStages.map(stage => (
                <div key={stage.id} className="border border-green-800 rounded-2xl p-4 bg-slate-900/60">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="text-green-200 font-semibold mb-1">{stage.name}</div>
                      <div className="flex items-center gap-3">
                        <select className="rounded-lg bg-slate-800 text-green-100 px-3 py-2 border border-green-700" value={stage.status} onChange={e => handleStageChange(stage.id, "status", e.target.value)}>
                          <option value="not_started">Nie rozpoczęto</option>
                          <option value="in_progress">W trakcie</option>
                          <option value="completed">Zakończono</option>
                          <option value="delayed">Opóźnione</option>
                        </select>
                        <input type="range" min={0} max={100} value={stage.progress} onChange={e => handleStageChange(stage.id, "progress", Number(e.target.value))} />
                        <span className="text-green-200 font-bold w-10 text-right">{stage.progress}%</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-green-300 font-semibold mb-1">Notatki</label>
                      <input type="text" className="w-full rounded-lg bg-slate-800 text-green-100 px-3 py-2 border border-green-700" value={stage.notes || ""} onChange={e => handleStageChange(stage.id, "notes", e.target.value)} placeholder="Uwagi, ryzyka, ustalenia" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeStep === 4 && (
          <div className="mb-8">
            {/* Podsumowanie harmonogramu */}
            <div className="bg-slate-800/80 rounded-2xl p-6 mb-6 border border-green-700 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-green-200 mb-2">Podsumowanie harmonogramu</h3>
              <div className="text-green-100 mb-2"><span className="font-semibold">Projekt:</span> {currentProject?.name} – {currentProject?.address}</div>
              <div className="text-green-100 mb-2"><span className="font-semibold">Liczba etapów:</span> {sortedStages.length}</div>
              <div className="text-green-100 mb-2"><span className="font-semibold">Data rozpoczęcia:</span> {projectStartDate}</div>
              <div className="text-green-100 mb-2"><span className="font-semibold">Data zakończenia:</span> {sortedStages.length ? formatDateInput(sortedStages[sortedStages.length-1].endDate) : "-"}</div>
              <div className="text-green-100 mb-2"><span className="font-semibold">Łączny postęp:</span> {overallProgress}%</div>
              {currentProject?.estimateId && (
                <div className="mb-2"><span className="font-semibold">ID wyceny:</span> <a href={`/wykonawcy/generator-ofert?wycena=${currentProject.estimateId}`} className="underline text-cyan-400" target="_blank" rel="noopener noreferrer">{currentProject.estimateId}</a></div>
              )}
              {currentProject?.offerId && (
                <div className="mb-2"><span className="font-semibold">ID oferty:</span> <a href={`/wykonawcy/generator-ofert?oferta=${currentProject.offerId}`} className="underline text-cyan-400" target="_blank" rel="noopener noreferrer">{currentProject.offerId}</a></div>
              )}
            </div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <button type="button" className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold border ${viewMode === "list" ? "bg-green-700 text-white border-green-700" : "bg-slate-800 text-green-200 border-green-700"}`} onClick={() => setViewMode("list")}> <List className="w-4 h-4" /> Lista </button>
                <button type="button" className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold border ${viewMode === "timeline" ? "bg-green-700 text-white border-green-700" : "bg-slate-800 text-green-200 border-green-700"}`} onClick={() => setViewMode("timeline")}> <CalendarClock className="w-4 h-4" /> Oś czasu </button>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold bg-slate-800 text-green-200 border border-green-700" onClick={() => setShowClientPreview(true)}>
                  <Eye className="w-4 h-4" /> Podgląd dla klienta
                </button>
                <button type="button" className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold bg-slate-800 text-green-200 border border-green-700" onClick={handlePrint}>
                  <Printer className="w-4 h-4" /> Drukuj
                </button>
                <PDFDownloadLink
                  document={<HarmonogramPDF project={currentProject} stages={sortedStages} startDate={projectStartDate} />}
                  fileName={`harmonogram_${currentProject?.name?.replace(/\s+/g, "_") || "projekt"}.pdf`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold bg-slate-800 text-green-200 border border-green-700 hover:bg-slate-700"
                >
                  {({ loading }) => (
                    <>
                      <FileText className="w-4 h-4" /> {loading ? "Generowanie..." : "PDF"}
                    </>
                  )}
                </PDFDownloadLink>
              </div>
            </div>
            {viewMode === "list" ? (
              <div className="space-y-2">
                {sortedStages.map(s => (
                  <div key={s.id} className="flex items-center gap-3 border border-green-800 rounded-xl p-3 bg-slate-900/60">
                    <div className="flex-1 text-green-200">{s.name}</div>
                    <div className="text-green-300">{formatDateInput(s.startDate)} → {formatDateInput(s.endDate)}</div>
                    <div className="text-green-300">{s.durationDays} dni</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-green-800 rounded-2xl p-4 bg-slate-900/60">
                {/* Oblicz proporcje szerokości względem całego projektu */}
                {(() => {
                  const starts = sortedStages.map(s => s.startDate ? new Date(s.startDate).getTime() : null).filter(Boolean) as number[];
                  const ends = sortedStages.map(s => s.endDate ? new Date(s.endDate).getTime() : null).filter(Boolean) as number[];
                  const minStart = starts.length ? Math.min(...starts) : null;
                  const maxEnd = ends.length ? Math.max(...ends) : null;
                  return (
                    <div className="space-y-3">
                      {sortedStages.map(s => {
                        const sStart = s.startDate ? new Date(s.startDate).getTime() : null;
                        const sEnd = s.endDate ? new Date(s.endDate).getTime() : null;
                        let leftPct = 0;
                        let widthPct = 0;
                        if (minStart && maxEnd && sStart && sEnd && maxEnd > minStart && sEnd >= sStart) {
                          leftPct = ((sStart - minStart) / (maxEnd - minStart)) * 100;
                          widthPct = ((sEnd - sStart) / (maxEnd - minStart)) * 100;
                        }
                        return (
                          <div key={s.id}>
                            <div className="text-green-300 mb-1">{s.name} ({formatDateInput(s.startDate)} → {formatDateInput(s.endDate)})</div>
                            <div className="relative h-6 bg-slate-800 rounded-full overflow-hidden border border-green-800">
                              <div className="absolute top-0 left-0 h-full bg-green-600" style={{ width: `${Math.max(3, widthPct)}%`, marginLeft: `${leftPct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* Modal nowego projektu */}
        {showNewProjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={(e) => {
            if (e.target === e.currentTarget) setShowNewProjectModal(false);
          }}>
            <form className="bg-slate-900 rounded-2xl p-6 md:p-8 shadow-2xl border border-green-800 w-full max-w-lg md:max-w-xl space-y-4 max-h-[80vh] overflow-y-auto" onSubmit={handleCreateProject}>
              <h4 className="text-lg font-bold text-green-200 mb-2">Nowy projekt harmonogramu</h4>
              <div>
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

        {/* Sekcja 3: Planowanie terminów */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
            <div>
              <label className="block text-green-300 font-semibold mb-1">Data rozpoczęcia projektu</label>
              <input type="date" className="rounded-lg bg-slate-800 text-green-100 px-3 py-2 border border-green-700" value={projectStartDate} onChange={e => setProjectStartDate(e.target.value)} />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-green-200">
                <input type="checkbox" checked={scheduleOptions.workdaysOnly} onChange={e => setScheduleOptions(o => ({ ...o, workdaysOnly: e.target.checked }))} /> Tylko dni robocze
              </label>
              <label className="flex items-center gap-2 text-green-200">
                <input type="checkbox" checked={scheduleOptions.includeWeekends} onChange={e => setScheduleOptions(o => ({ ...o, includeWeekends: e.target.checked }))} /> Uwzględnij weekendy
              </label>
            </div>
            <button type="button" className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold bg-gradient-to-r from-green-700 to-cyan-600 text-white shadow-lg hover:scale-105 transition-all" onClick={generateSchedule}>
              <CalendarClock className="w-5 h-5" /> Generuj terminy
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-green-200">
                  <th className="text-left py-2">Etap</th>
                  <th className="text-left py-2">Start</th>
                  <th className="text-left py-2">Koniec</th>
                  <th className="text-left py-2">Dni</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedStages.map(stage => (
                  <tr key={stage.id} className="border-t border-green-800 text-green-100">
                    <td className="py-2">{stage.name}</td>
                    <td className="py-2">
                      <input type="date" className="rounded-lg bg-slate-800 px-2 py-1 border border-green-700" value={formatDateInput(stage.startDate)} onChange={e => handleStageDateChange(stage.id, "startDate", e.target.value)} />
                    </td>
                    <td className="py-2">
                      <input type="date" className="rounded-lg bg-slate-800 px-2 py-1 border border-green-700" value={formatDateInput(stage.endDate)} onChange={e => handleStageDateChange(stage.id, "endDate", e.target.value)} />
                    </td>
                    <td className="py-2">{stage.durationDays} dni</td>
                    <td className="py-2">
                      <Badge variant="outline" className="border-green-700 text-green-200">
                        {stage.status === "not_started" ? "Nie rozpoczęto" : stage.status === "in_progress" ? "W trakcie" : stage.status === "completed" ? "Zakończono" : "Opóźnione"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sekcja 4: Postęp prac */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-green-200">Postęp prac</h3>
            <div className="flex items-center gap-3">
              <span className="text-green-300">Łączny postęp:</span>
              <div className="w-40 h-3 bg-slate-800 rounded-full overflow-hidden border border-green-800">
                <div className="h-full bg-green-600" style={{ width: `${overallProgress}%` }} />
              </div>
              <span className="text-green-200 font-bold">{overallProgress}%</span>
            </div>
          </div>
          <div className="space-y-4">
            {sortedStages.map(stage => (
              <div key={stage.id} className="border border-green-800 rounded-2xl p-4 bg-slate-900/60">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="text-green-200 font-semibold mb-1">{stage.name}</div>
                    <div className="flex items-center gap-3">
                      <select className="rounded-lg bg-slate-800 text-green-100 px-3 py-2 border border-green-700" value={stage.status} onChange={e => handleStageChange(stage.id, "status", e.target.value)}>
                        <option value="not_started">Nie rozpoczęto</option>
                        <option value="in_progress">W trakcie</option>
                        <option value="completed">Zakończono</option>
                        <option value="delayed">Opóźnione</option>
                      </select>
                      <input type="range" min={0} max={100} value={stage.progress} onChange={e => handleStageChange(stage.id, "progress", Number(e.target.value))} />
                      <span className="text-green-200 font-bold w-10 text-right">{stage.progress}%</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-green-300 font-semibold mb-1">Notatki</label>
                    <input type="text" className="w-full rounded-lg bg-slate-800 text-green-100 px-3 py-2 border border-green-700" value={stage.notes || ""} onChange={e => handleStageChange(stage.id, "notes", e.target.value)} placeholder="Uwagi, ryzyka, ustalenia" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sekcja 5: Widok listy / osi czasu + udostępnianie */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <button type="button" className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold border ${viewMode === "list" ? "bg-green-700 text-white border-green-700" : "bg-slate-800 text-green-200 border-green-700"}`} onClick={() => setViewMode("list")}>
                <List className="w-4 h-4" /> Lista
              </button>
              <button type="button" className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold border ${viewMode === "timeline" ? "bg-green-700 text-white border-green-700" : "bg-slate-800 text-green-200 border-green-700"}`} onClick={() => setViewMode("timeline")}>
                <CalendarClock className="w-4 h-4" /> Oś czasu
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold bg-slate-800 text-green-200 border border-green-700" onClick={() => setShowClientPreview(true)}>
                <Eye className="w-4 h-4" /> Podgląd dla klienta
              </button>
              <button type="button" className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold bg-slate-800 text-green-200 border border-green-700" onClick={handlePrint}>
                <Printer className="w-4 h-4" /> Drukuj
              </button>
              <PDFDownloadLink
                document={<HarmonogramPDF project={currentProject} stages={sortedStages} startDate={projectStartDate} />}
                fileName={`harmonogram_${currentProject?.name?.replace(/\s+/g, "_") || "projekt"}.pdf`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold bg-slate-800 text-green-200 border border-green-700 hover:bg-slate-700"
              >
                {({ loading }) => (
                  <>
                    <FileText className="w-4 h-4" /> {loading ? "Generowanie..." : "PDF"}
                  </>
                )}
              </PDFDownloadLink>
            </div>
          </div>

          {viewMode === "list" ? (
            <div className="space-y-2">
              {sortedStages.map(s => (
                <div key={s.id} className="flex items-center gap-3 border border-green-800 rounded-xl p-3 bg-slate-900/60">
                  <div className="flex-1 text-green-200">{s.name}</div>
                  <div className="text-green-300">{formatDateInput(s.startDate)} → {formatDateInput(s.endDate)}</div>
                  <div className="text-green-300">{s.durationDays} dni</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-green-800 rounded-2xl p-4 bg-slate-900/60">
              {/* Oblicz proporcje szerokości względem całego projektu */}
              {(() => {
                const starts = sortedStages.map(s => s.startDate ? new Date(s.startDate).getTime() : null).filter(Boolean) as number[];
                const ends = sortedStages.map(s => s.endDate ? new Date(s.endDate).getTime() : null).filter(Boolean) as number[];
                const minStart = starts.length ? Math.min(...starts) : null;
                const maxEnd = ends.length ? Math.max(...ends) : null;
                return (
                  <div className="space-y-3">
                    {sortedStages.map(s => {
                      const sStart = s.startDate ? new Date(s.startDate).getTime() : null;
                      const sEnd = s.endDate ? new Date(s.endDate).getTime() : null;
                      let leftPct = 0;
                      let widthPct = 0;
                      if (minStart && maxEnd && sStart && sEnd && maxEnd > minStart && sEnd >= sStart) {
                        leftPct = ((sStart - minStart) / (maxEnd - minStart)) * 100;
                        widthPct = ((sEnd - sStart) / (maxEnd - minStart)) * 100;
                      }
                      return (
                        <div key={s.id}>
                          <div className="text-green-300 mb-1">{s.name} ({formatDateInput(s.startDate)} → {formatDateInput(s.endDate)})</div>
                          <div className="relative h-6 bg-slate-800 rounded-full overflow-hidden border border-green-800">
                            <div className="absolute top-0 left-0 h-full bg-green-600" style={{ width: `${Math.max(3, widthPct)}%`, marginLeft: `${leftPct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Modal podglądu dla klienta */}
        {showClientPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={(e) => { if (e.target === e.currentTarget) setShowClientPreview(false); }}>
            <div className="bg-slate-900 rounded-2xl p-6 md:p-8 shadow-2xl border border-green-800 w-full max-w-3xl space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-bold text-green-200">Harmonogram dla inwestora / mieszkańców</h4>
                <button className="px-3 py-1 rounded-xl font-bold bg-slate-800 text-green-200 border border-green-700" onClick={() => setShowClientPreview(false)}>Zamknij</button>
              </div>
              <div className="text-green-100">
                <div className="mb-2"><span className="font-semibold">Projekt:</span> {currentProject?.name} – {currentProject?.address}</div>
                <div className="mb-2"><span className="font-semibold">Start:</span> {projectStartDate}</div>
                {currentProject?.estimateId && (
                  <div className="mb-2">
                    <span className="font-semibold">ID wyceny:</span> <a href={`/wykonawcy/generator-ofert?wycena=${currentProject.estimateId}`} className="underline text-cyan-400" target="_blank" rel="noopener noreferrer">{currentProject.estimateId}</a>
                  </div>
                )}
                {currentProject?.offerId && (
                  <div className="mb-2">
                    <span className="font-semibold">ID oferty:</span> <a href={`/wykonawcy/generator-ofert?oferta=${currentProject.offerId}`} className="underline text-cyan-400" target="_blank" rel="noopener noreferrer">{currentProject.offerId}</a>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {sortedStages.map(s => (
                  <div key={s.id} className="flex items-center gap-3 border border-green-800 rounded-xl p-3 bg-slate-900/60">
                    {shareOptions.showNames && <div className="flex-1 text-green-200">{s.name}</div>}
                    {shareOptions.showDates && <div className="text-green-300">{formatDateInput(s.startDate)} → {formatDateInput(s.endDate)}</div>}
                    {shareOptions.showNotes && s.notes && <div className="text-green-300">{s.notes}</div>}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-green-200">
                  <input type="checkbox" checked={shareOptions.showNames} onChange={e => setShareOptions(o => ({ ...o, showNames: e.target.checked }))} /> Nazwy etapów
                </label>
                <label className="flex items-center gap-2 text-green-200">
                  <input type="checkbox" checked={shareOptions.showDates} onChange={e => setShareOptions(o => ({ ...o, showDates: e.target.checked }))} /> Daty
                </label>
                <label className="flex items-center gap-2 text-green-200">
                  <input type="checkbox" checked={shareOptions.showNotes} onChange={e => setShareOptions(o => ({ ...o, showNotes: e.target.checked }))} /> Notatki
                </label>
                <label className="flex items-center gap-2 text-green-200">
                  <input type="checkbox" checked={shareOptions.hideInternal} onChange={e => setShareOptions(o => ({ ...o, hideInternal: e.target.checked }))} /> Ukryj wewnętrzne
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
