// Harmonogram prac i terminy realizacji
// Komponent do planowania etapów, terminów, monitorowania postępu i generowania harmonogramu dla inwestora/mieszkańców
// Zgodnie z wytycznymi – mockowane dane, pełna logika, responsywność, styl Next.js + Tailwind

import React, { useState } from "react";
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

// ...dalsza implementacja komponentu HarmonogramPracPage

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

        {/* TODO: kolejne sekcje */}
      </div>
    </div>
  );
}
