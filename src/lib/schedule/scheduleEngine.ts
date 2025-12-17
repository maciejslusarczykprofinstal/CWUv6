export type ScheduleScope = {
  zw: boolean;
  cwu: boolean;
  cyrkulacja: boolean;
};

export type ScheduleBuilding = {
  klatki: number;
  kondygnacje: number;
  pionyNaKlatke: number;
  lokale: number;
};

export type ScheduleOrganization = {
  ekipyInstalacyjne: number;
  ekipyOdtworzeniowe: number;
  maxRownoleglychPionow: number;
  buforCzasowyPct: number; // 0..100 (doliczany do czasow roboczych)
};

export type ScheduleAccessibility = {
  dostepnoscLokaliPct: number; // 0..100
};

export type ScheduleSharedWorks = {
  piwnica: boolean;
  wezel: boolean;
};

export type ScheduleReconstructions = {
  odtworzenia: "minimalne" | "standard" | "rozszerzone";
};

export type ScheduleInput = {
  startDateISO: string; // YYYY-MM-DD
  budynek: ScheduleBuilding;
  zakres: ScheduleScope;
  robotyWspolne: ScheduleSharedWorks;
  organizacja: ScheduleOrganization;
  dostepnosc: ScheduleAccessibility;
  odtworzenia: ScheduleReconstructions;
};

export type TaskCategory = "common" | "riser";
export type TaskKind = "org" | "install" | "restore" | "test" | "buffer";
export type ResourcePool = "install" | "restore";

export type ScheduleTask = {
  id: string;
  title: string;
  category: TaskCategory;
  kind: TaskKind;
  resource: ResourcePool;
  riserId?: string;
  deps: string[];
  durationWorkDays: number;
  affectsWaterOutage: boolean;
};

export type ScheduledTask = ScheduleTask & {
  startWorkDay: number; // 0 = pierwszy dzien roboczy
  endWorkDay: number; // exclusive
  startDateISO: string;
  endDateISO: string; // exclusive
};

export type CriticalStage = {
  taskId: string;
  title: string;
  reason: string;
};

export type ScheduleStats = {
  totalWorkDays: number;
  totalCalendarDays: number;
  totalWorkDaysMin: number;
  totalWorkDaysMax: number;
  totalCalendarDaysMin: number;
  totalCalendarDaysMax: number;
  organizationalWorkDays: number;
  organizationalLossPct: number; // 0..100
};

export type ScheduleResult = {
  input: ScheduleInput;
  tasks: ScheduleTask[];
  scheduled: ScheduledTask[];
  stats: ScheduleStats;
  criticalStages: CriticalStage[];
  criticalTaskIds: string[];
  bottlenecks: string[];
  bottleneckTaskIds: string[];
};

export type DurationOverrides = Record<string, number | undefined>;

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function roundToQuarterDay(value: number) {
  const v = Math.max(0, value);
  return Math.round(v * 4) / 4;
}

function makeRiserIds(input: ScheduleInput): string[] {
  const { klatki, pionyNaKlatke } = input.budynek;
  const ids: string[] = [];
  for (let k = 1; k <= klatki; k++) {
    for (let p = 1; p <= pionyNaKlatke; p++) {
      ids.push(`K${k}-P${p}`);
    }
  }
  return ids;
}

function isoAddDays(dateISO: string, days: number): string {
  const d = new Date(`${dateISO}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function isWeekend(dateISO: string): boolean {
  const d = new Date(`${dateISO}T00:00:00`);
  const day = d.getDay();
  return day === 0 || day === 6;
}

function workDayIndexToCalendarDays(startISO: string, workDayExclusive: number): number {
  // Mapuje liczbe dni roboczych na dni kalendarzowe przy zalozeniu 5/2.
  // Liczymy ile dni kalendarzowych trzeba przejsc, zeby zaliczyc `workDayExclusive` dni roboczych.
  let workLeft = Math.max(0, Math.ceil(workDayExclusive));
  let cal = 0;
  let date = startISO;
  while (workLeft > 0) {
    if (!isWeekend(date)) {
      workLeft -= 1;
    }
    cal += 1;
    date = isoAddDays(date, 1);
  }
  return cal;
}

function workRangeToDates(startISO: string, startWorkDay: number, endWorkDay: number) {
  const startCalDays = workDayIndexToCalendarDays(startISO, startWorkDay);
  const endCalDays = workDayIndexToCalendarDays(startISO, endWorkDay);
  const start = isoAddDays(startISO, startCalDays);
  const endExclusive = isoAddDays(startISO, endCalDays);
  return { start, endExclusive };
}

function buildTasks(input: ScheduleInput): ScheduleTask[] {
  const access = clampNumber(input.dostepnosc.dostepnoscLokaliPct, 10, 100) / 100;
  const { lokale } = input.budynek;

  const riserIds = makeRiserIds(input);
  const riserCount = riserIds.length;
  const lokaleNaPion = riserCount > 0 ? Math.max(1, Math.round(lokale / riserCount)) : lokale;

  const hasAnyWater = input.zakres.zw || input.zakres.cwu || input.zakres.cyrkulacja;

  // Bazowe czasy na pion (dni robocze) - deterministyczne i czytelne.
  // Skalujemy lekko liczbe lokali na pion.
  const scaleByApartments = clampNumber(lokaleNaPion / 8, 0.75, 2.5);

  const installBase = roundToQuarterDay(1.0 * scaleByApartments);
  const cyrkExtra = input.zakres.cyrkulacja ? roundToQuarterDay(0.4 * scaleByApartments) : 0;

  const testPerRiser = hasAnyWater ? roundToQuarterDay(0.25 * scaleByApartments) : 0;

  const restoreMultiplier =
    input.odtworzenia.odtworzenia === "minimalne"
      ? 0.6
      : input.odtworzenia.odtworzenia === "standard"
        ? 1.0
        : 1.6;
  const restorePerRiser = roundToQuarterDay(0.75 * scaleByApartments * restoreMultiplier);

  // Organizacyjne opoznienia rosna wraz ze spadkiem dostepnosci.
  // 70% dostepnosci to typowy przypadek, zeby zobaczyc efekt.
  const orgDelayPerRiser = roundToQuarterDay(clampNumber((1 - access) * 1.2, 0, 1.5));

  const tasks: ScheduleTask[] = [];

  const add = (t: Omit<ScheduleTask, "id"> & { id?: string }) => {
    tasks.push({
      id: t.id ?? `${t.category}-${t.kind}-${t.riserId ?? "COMMON"}-${tasks.length + 1}`,
      title: t.title,
      category: t.category,
      kind: t.kind,
      resource: t.resource,
      riserId: t.riserId,
      deps: t.deps,
      durationWorkDays: roundToQuarterDay(t.durationWorkDays),
      affectsWaterOutage: t.affectsWaterOutage,
    });
  };

  // Wspolne
  add({
    id: "common-prep",
    title: "Przygotowanie + organizacja (komunikacja, okna wylaczen)",
    category: "common",
    kind: "org",
    resource: "install",
    deps: [],
    durationWorkDays: 0.5,
    affectsWaterOutage: false,
  });

  if (input.robotyWspolne.piwnica) {
    add({
      id: "common-basement",
      title: "Roboty wspolne: piwnica / poziomy / sekcjonowanie",
      category: "common",
      kind: "install",
      resource: "install",
      deps: ["common-prep"],
      durationWorkDays: roundToQuarterDay(0.8 + 0.15 * riserCount),
      affectsWaterOutage: true,
    });
  }

  if (input.robotyWspolne.wezel) {
    add({
      id: "common-node",
      title: "Roboty wspolne: wezel / przylacza / armatura",
      category: "common",
      kind: "install",
      resource: "install",
      deps: ["common-prep"],
      durationWorkDays: 0.75,
      affectsWaterOutage: true,
    });
  }

  // Piony
  for (const riserId of riserIds) {
    const commonDeps = ["common-prep"] as string[];
    if (input.robotyWspolne.piwnica) commonDeps.push("common-basement");

    add({
      id: `org-${riserId}`,
      title: `Uzgodnienia wejsc do lokali (${riserId})`,
      category: "riser",
      kind: "org",
      resource: "install",
      riserId,
      deps: commonDeps,
      durationWorkDays: orgDelayPerRiser,
      affectsWaterOutage: false,
    });

    add({
      id: `install-${riserId}`,
      title: `Montaz + przelaczenia instalacji (${riserId})`,
      category: "riser",
      kind: "install",
      resource: "install",
      riserId,
      deps: [`org-${riserId}`],
      durationWorkDays: installBase + cyrkExtra,
      affectsWaterOutage: true,
    });

    add({
      id: `test-${riserId}`,
      title: `Proba / plukanie / uruchomienie (${riserId})`,
      category: "riser",
      kind: "test",
      resource: "install",
      riserId,
      deps: [`install-${riserId}`],
      durationWorkDays: testPerRiser,
      affectsWaterOutage: true,
    });

    add({
      id: `restore-${riserId}`,
      title: `Odtworzenia (${riserId})`,
      category: "riser",
      kind: "restore",
      resource: "restore",
      riserId,
      deps: [`test-${riserId}`],
      durationWorkDays: restorePerRiser,
      affectsWaterOutage: false,
    });
  }

  // Bufor na niespodzianki/wycieki - jawny task, eby by widoczny na osi czasu.
  // Bufor na niespodzianki/wycieki - jawny task, zeby byl widoczny na osi czasu.
  const baseWork = tasks.reduce((acc, t) => acc + t.durationWorkDays, 0);
  const bufferPct = clampNumber(input.organizacja.buforCzasowyPct, 0, 40) / 100;
  const bufferDays = roundToQuarterDay(baseWork * bufferPct);
  if (bufferDays > 0) {
    add({
      id: "buffer-global",
      title: "Bufor technologiczny (wycieki, kolizje, powroty)",
      category: "common",
      kind: "buffer",
      resource: "install",
      deps: tasks.filter((t) => t.category === "riser" && t.kind === "test").map((t) => t.id),
      durationWorkDays: bufferDays,
      affectsWaterOutage: false,
    });
  }

  return tasks;
}

function topoSort(tasks: ScheduleTask[]): ScheduleTask[] {
  const byId = new Map(tasks.map((t) => [t.id, t] as const));
  const inDeg = new Map<string, number>();
  const out = new Map<string, string[]>();

  for (const t of tasks) {
    inDeg.set(t.id, 0);
    out.set(t.id, []);
  }
  for (const t of tasks) {
    for (const dep of t.deps) {
      if (!byId.has(dep)) continue;
      inDeg.set(t.id, (inDeg.get(t.id) ?? 0) + 1);
      out.get(dep)?.push(t.id);
    }
  }

  const q: string[] = [];
  for (const [id, deg] of inDeg) {
    if (deg === 0) q.push(id);
  }

  const result: ScheduleTask[] = [];
  while (q.length) {
    const id = q.shift()!;
    const t = byId.get(id);
    if (t) result.push(t);
    for (const next of out.get(id) ?? []) {
      inDeg.set(next, (inDeg.get(next) ?? 0) - 1);
      if ((inDeg.get(next) ?? 0) === 0) q.push(next);
    }
  }

  // Jeeli cykl lub brakujce deps - zwracamy w oryginalnej kolejnoci.
  return result.length === tasks.length ? result : tasks;
}

function scheduleWithResources(args: {
  input: ScheduleInput;
  tasks: ScheduleTask[];
  overrides: DurationOverrides;
}): ScheduledTask[] {
  const { input, tasks, overrides } = args;
  const topo = topoSort(tasks);

  const durationOf = (t: ScheduleTask) => {
    const o = overrides[t.id];
    if (typeof o === "number" && Number.isFinite(o) && o >= 0) return roundToQuarterDay(o);
    return t.durationWorkDays;
  };

  const depsDoneAt = new Map<string, number>();
  const scheduled = new Map<string, { start: number; end: number }>();

  // Prosty day-based resource leveling (5/2 liczymy pniej w mapowaniu na daty)
  const installCrews = Math.max(1, Math.round(input.organizacja.ekipyInstalacyjne));
  const restoreCrews = Math.max(0, Math.round(input.organizacja.ekipyOdtworzeniowe));

  const maxParallelRisers = Math.max(1, Math.round(input.organizacja.maxRownoleglychPionow));

  // Utrzymujemy zajetosc ekip per dzien roboczy
  const installUsage: number[] = [];
  const restoreUsage: number[] = [];

  const riserActiveByDay: Record<string, number[]> = {};
  const markRiserActive = (riserId: string, start: number, end: number) => {
    if (!riserActiveByDay[riserId]) riserActiveByDay[riserId] = [];
    for (let d = start; d < end; d++) {
      riserActiveByDay[riserId][d] = 1;
    }
  };

  const countActiveRisersAtDay = (day: number) => {
    let count = 0;
    for (const k of Object.keys(riserActiveByDay)) {
      if (riserActiveByDay[k]?.[day]) count++;
    }
    return count;
  };

  const findEarliestSlot = (t: ScheduleTask, earliest: number, dur: number): number => {
    const ceilDur = Math.max(0, Math.ceil(dur));

    for (let start = earliest; start < 10000; start++) {
      let ok = true;

      // Limit rownoleglosci pionow: liczymy tylko taski pionowe instalacyjne/testowe jako "aktywny pion".
      if (t.category === "riser" && (t.kind === "install" || t.kind === "test" || t.kind === "org")) {
        for (let d = start; d < start + ceilDur; d++) {
          const active = countActiveRisersAtDay(d);
          if (active >= maxParallelRisers) {
            ok = false;
            break;
          }
        }
        if (!ok) continue;
      }

      const pool = t.resource;
      if (pool === "install") {
        for (let d = start; d < start + ceilDur; d++) {
          installUsage[d] = installUsage[d] ?? 0;
          if (installUsage[d] + 1 > installCrews) {
            ok = false;
            break;
          }
        }
        if (!ok) continue;
      } else {
        if (restoreCrews <= 0) {
          // Jeeli brak ekip odtworzeniowych, jedziemy na instalacyjnych.
          for (let d = start; d < start + ceilDur; d++) {
            installUsage[d] = installUsage[d] ?? 0;
            if (installUsage[d] + 1 > installCrews) {
              ok = false;
              break;
            }
          }
          if (!ok) continue;
        } else {
          for (let d = start; d < start + ceilDur; d++) {
            restoreUsage[d] = restoreUsage[d] ?? 0;
            if (restoreUsage[d] + 1 > restoreCrews) {
              ok = false;
              break;
            }
          }
          if (!ok) continue;
        }
      }

      return start;
    }

    return earliest;
  };

  for (const t of topo) {
    const dur = durationOf(t);
    const depEnd = Math.max(
      0,
      ...t.deps.map((dep) => {
        const e = depsDoneAt.get(dep);
        return typeof e === "number" ? e : 0;
      }),
    );

    const start = findEarliestSlot(t, depEnd, dur);
    const end = start + Math.max(0, Math.ceil(dur));

    // Book resources
    const pool = t.resource;
    for (let d = start; d < end; d++) {
      if (pool === "install" || (pool === "restore" && restoreCrews <= 0)) {
        installUsage[d] = (installUsage[d] ?? 0) + 1;
      } else {
        restoreUsage[d] = (restoreUsage[d] ?? 0) + 1;
      }
    }

    if (t.riserId && t.category === "riser" && (t.kind === "install" || t.kind === "test" || t.kind === "org")) {
      markRiserActive(t.riserId, start, end);
    }

    scheduled.set(t.id, { start, end });
    depsDoneAt.set(t.id, end);
  }

  const scheduledTasks: ScheduledTask[] = [];
  for (const t of tasks) {
    const s = scheduled.get(t.id) ?? { start: 0, end: Math.ceil(durationOf(t)) };
    const dates = workRangeToDates(input.startDateISO, s.start, s.end);

    scheduledTasks.push({
      ...t,
      durationWorkDays: durationOf(t),
      startWorkDay: s.start,
      endWorkDay: s.end,
      startDateISO: dates.start,
      endDateISO: dates.endExclusive,
    });
  }

  scheduledTasks.sort((a, b) => a.startWorkDay - b.startWorkDay || a.title.localeCompare(b.title));
  return scheduledTasks;
}

function computeCpm(tasks: ScheduleTask[], durationOf: (t: ScheduleTask) => number) {
  const byId = new Map(tasks.map((t) => [t.id, t] as const));
  const topo = topoSort(tasks);

  const es = new Map<string, number>();
  const ef = new Map<string, number>();

  for (const t of topo) {
    const start = Math.max(0, ...t.deps.map((d) => ef.get(d) ?? 0));
    es.set(t.id, start);
    ef.set(t.id, start + Math.max(0, Math.ceil(durationOf(t))));
  }

  const projectEnd = Math.max(0, ...Array.from(ef.values()));

  // Reverse edges
  const succ = new Map<string, string[]>();
  for (const t of tasks) succ.set(t.id, []);
  for (const t of tasks) {
    for (const d of t.deps) {
      if (!byId.has(d)) continue;
      succ.get(d)?.push(t.id);
    }
  }

  const lt = new Map<string, number>();
  const lf = new Map<string, number>();

  // init
  for (const t of tasks) {
    lf.set(t.id, projectEnd);
    lt.set(t.id, projectEnd - Math.max(0, Math.ceil(durationOf(t))));
  }

  const revTopo = [...topo].reverse();
  for (const t of revTopo) {
    const successors = succ.get(t.id) ?? [];
    if (successors.length === 0) {
      lf.set(t.id, projectEnd);
      lt.set(t.id, projectEnd - Math.max(0, Math.ceil(durationOf(t))));
      continue;
    }

    const minLs = Math.min(...successors.map((s) => lt.get(s) ?? projectEnd));
    lf.set(t.id, minLs);
    lt.set(t.id, minLs - Math.max(0, Math.ceil(durationOf(t))));
  }

  const slack = new Map<string, number>();
  for (const t of tasks) {
    slack.set(t.id, (lt.get(t.id) ?? 0) - (es.get(t.id) ?? 0));
  }

  return { es, ef, lt, lf, slack, projectEnd };
}

function buildResult(args: {
  input: ScheduleInput;
  overrides: DurationOverrides;
}): ScheduleResult {
  const tasks = buildTasks(args.input);

  const durationOf = (t: ScheduleTask) => {
    const o = args.overrides[t.id];
    if (typeof o === "number" && Number.isFinite(o) && o >= 0) return roundToQuarterDay(o);
    return t.durationWorkDays;
  };

  const scheduled = scheduleWithResources({ input: args.input, tasks, overrides: args.overrides });

  const totalWorkDays = Math.max(0, ...scheduled.map((t) => t.endWorkDay));
  const totalCalendarDays = workDayIndexToCalendarDays(args.input.startDateISO, totalWorkDays);

  // Min/max jako proste widelki ryzyka (bez zmiany logiki UI):
  // min = -10% od zsumowanych czasow roboczych, max = +25%.
  const baseWorkSum = tasks.reduce((acc, t) => acc + Math.max(0, Math.ceil(durationOf(t))), 0);
  const totalWorkDaysMin = Math.max(0, Math.round(baseWorkSum * 0.9));
  const totalWorkDaysMax = Math.max(totalWorkDaysMin, Math.round(baseWorkSum * 1.25));

  const totalCalendarDaysMin = workDayIndexToCalendarDays(args.input.startDateISO, totalWorkDaysMin);
  const totalCalendarDaysMax = workDayIndexToCalendarDays(args.input.startDateISO, totalWorkDaysMax);

  const organizationalWorkDays = tasks
    .filter((t) => t.kind === "org" || t.kind === "buffer")
    .reduce((acc, t) => acc + Math.max(0, Math.ceil(durationOf(t))), 0);

  const organizationalLossPct =
    baseWorkSum <= 0 ? 0 : Math.round((organizationalWorkDays / baseWorkSum) * 100);

  const cpm = computeCpm(tasks, durationOf);
  const criticalAll = tasks.filter((t) => (cpm.slack.get(t.id) ?? 1) === 0);
  const criticalStages = criticalAll.slice(0, 8).map<CriticalStage>((t) => ({
      taskId: t.id,
      title: t.title,
      reason:
        t.kind === "org"
          ? "Brak luzu czasowego: wejscia do lokali blokuja kolejne prace."
          : t.kind === "test"
            ? "Brak luzu czasowego: uruchomienie/proby zamykaja pion."
            : t.kind === "restore"
              ? "Brak luzu czasowego: odtworzenia domykaja pion i odbiory."
              : "Brak luzu czasowego: element krytyczny w lancuchu zaleznosci.",
    }));

  // Bottlenecks (proste, ale widoczne):
  const bottlenecks: string[] = [];
  const { ekipyInstalacyjne, ekipyOdtworzeniowe, maxRownoleglychPionow } = args.input.organizacja;
  if (maxRownoleglychPionow <= 1) bottlenecks.push("Rownoleglosc pionow ograniczona do 1 (organizacja prac odcinkowych)");
  if (ekipyInstalacyjne <= 1) bottlenecks.push("Tylko 1 ekipa instalacyjna (kolejka prac instalacyjnych/testow)");
  if (ekipyOdtworzeniowe <= 0) bottlenecks.push("Brak ekip odtworzeniowych (odtworzenia zjadaja czas ekipy instalacyjnej)");
  if (args.input.dostepnosc.dostepnoscLokaliPct < 80)
    bottlenecks.push("Dostepnosc lokali < 80% (waskie gardlo wejsc)");

  const bottleneckTaskIds = new Set<string>();
  if (maxRownoleglychPionow <= 1) {
    for (const t of tasks) {
      if (t.category === "riser" && (t.kind === "install" || t.kind === "test")) bottleneckTaskIds.add(t.id);
    }
  }
  if (ekipyInstalacyjne <= 1) {
    for (const t of tasks) {
      if (t.resource === "install") bottleneckTaskIds.add(t.id);
    }
  }
  if (ekipyOdtworzeniowe <= 0) {
    for (const t of tasks) {
      if (t.kind === "restore") bottleneckTaskIds.add(t.id);
    }
  }
  if (args.input.dostepnosc.dostepnoscLokaliPct < 80) {
    for (const t of tasks) {
      if (t.kind === "org") bottleneckTaskIds.add(t.id);
    }
  }

  return {
    input: args.input,
    tasks,
    scheduled,
    stats: {
      totalWorkDays,
      totalCalendarDays,
      totalWorkDaysMin,
      totalWorkDaysMax,
      totalCalendarDaysMin,
      totalCalendarDaysMax,
      organizationalWorkDays,
      organizationalLossPct,
    },
    criticalStages,
    criticalTaskIds: criticalAll.map((t) => t.id),
    bottlenecks,
    bottleneckTaskIds: Array.from(bottleneckTaskIds),
  };
}

export function generateSchedule(args: {
  input: ScheduleInput;
  overrides?: DurationOverrides;
}): ScheduleResult {
  const overrides = args.overrides ?? {};

  // Minimalna normalizacja wejscia
  const normalized: ScheduleInput = {
    ...args.input,
    budynek: {
      klatki: Math.max(1, Math.round(args.input.budynek.klatki)),
      kondygnacje: Math.max(1, Math.round(args.input.budynek.kondygnacje)),
      pionyNaKlatke: Math.max(1, Math.round(args.input.budynek.pionyNaKlatke)),
      lokale: Math.max(1, Math.round(args.input.budynek.lokale)),
    },
    organizacja: {
      ekipyInstalacyjne: Math.max(1, Math.round(args.input.organizacja.ekipyInstalacyjne)),
      ekipyOdtworzeniowe: Math.max(0, Math.round(args.input.organizacja.ekipyOdtworzeniowe)),
      maxRownoleglychPionow: Math.max(1, Math.round(args.input.organizacja.maxRownoleglychPionow)),
      buforCzasowyPct: clampNumber(args.input.organizacja.buforCzasowyPct, 0, 40),
    },
    dostepnosc: {
      dostepnoscLokaliPct: clampNumber(args.input.dostepnosc.dostepnoscLokaliPct, 10, 100),
    },
  };

  return buildResult({ input: normalized, overrides });
}
