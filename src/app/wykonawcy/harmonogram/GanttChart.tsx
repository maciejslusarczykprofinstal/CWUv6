"use client";

import { useMemo } from "react";
import type { ScheduledTask } from "@/lib/schedule/scheduleEngine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type GanttScale = "days" | "weeks";

type Props = {
  scheduled: ScheduledTask[];
  scale: GanttScale;
  criticalTaskIds: string[];
  bottleneckTaskIds: string[];
  onChangeDuration: (taskId: string, nextDurationWorkDays: number) => void;
};

type Group = {
  id: string;
  title: string;
  tasks: ScheduledTask[];
};

function toNumber(value: string, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function formatShortDate(iso: string) {
  return iso;
}

export default function GanttChart({
  scheduled,
  scale,
  criticalTaskIds,
  bottleneckTaskIds,
  onChangeDuration,
}: Props) {
  const maxWorkDay = useMemo(() => Math.max(0, ...scheduled.map((t) => t.endWorkDay)), [scheduled]);

  const criticalTaskIdSet = useMemo(() => new Set<string>(criticalTaskIds ?? []), [criticalTaskIds]);
  const bottleneckTaskIdSet = useMemo(
    () => new Set<string>(bottleneckTaskIds ?? []),
    [bottleneckTaskIds],
  );

  const groups = useMemo<Group[]>(() => {
    const common = scheduled.filter((t) => t.category === "common");
    const byRiser = new Map<string, ScheduledTask[]>();
    for (const t of scheduled) {
      if (!t.riserId) continue;
      const arr = byRiser.get(t.riserId) ?? [];
      arr.push(t);
      byRiser.set(t.riserId, arr);
    }

    const risers = Array.from(byRiser.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, tasks]) => ({ id, title: `Pion ${id}`, tasks: tasks.sort((a, b) => a.startWorkDay - b.startWorkDay) }));

    const result: Group[] = [];
    if (common.length) {
      result.push({ id: "common", title: "Roboty wspolne", tasks: common.sort((a, b) => a.startWorkDay - b.startWorkDay) });
    }
    return result.concat(risers);
  }, [scheduled]);

  const columns = useMemo(() => {
    if (scale === "weeks") {
      return Math.max(1, Math.ceil(maxWorkDay / 5));
    }
    return Math.max(1, maxWorkDay);
  }, [maxWorkDay, scale]);

  const headerLabels = useMemo(() => {
    if (scale === "weeks") {
      return Array.from({ length: columns }, (_, i) => `Tydz ${i + 1}`);
    }
    return Array.from({ length: columns }, (_, i) => `D${i + 1}`);
  }, [columns, scale]);

  const colTemplate = useMemo(() => {
    // 320px na opis + edycja, reszta kolumny osi czasu
    return `320px repeat(${columns}, minmax(28px, 1fr))`;
  }, [columns]);

  const toGridPosition = (t: ScheduledTask) => {
    if (scale === "weeks") {
      const start = Math.floor(t.startWorkDay / 5);
      const end = Math.ceil(t.endWorkDay / 5);
      return { startCol: start, span: Math.max(1, end - start) };
    }
    return { startCol: t.startWorkDay, span: Math.max(1, t.endWorkDay - t.startWorkDay) };
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Os czasu (Gantt)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* header */}
            <div className="grid gap-1" style={{ gridTemplateColumns: colTemplate }}>
              <div className="text-xs font-semibold text-muted-foreground">Task</div>
              {headerLabels.map((h) => (
                <div key={h} className="text-[10px] text-muted-foreground text-center">
                  {h}
                </div>
              ))}
            </div>

            <div className="mt-2 space-y-4">
              {groups.map((g) => (
                <div key={g.id} className="space-y-2">
                  <div className="text-sm font-semibold">{g.title}</div>

                  <div className="space-y-2">
                    {g.tasks.map((t, rowIdx) => {
                      const pos = toGridPosition(t);
                      const isCritical = criticalTaskIdSet.has(t.id);
                      const isBottleneck = bottleneckTaskIdSet.has(t.id);
                      const isWaterOff = t.affectsWaterOutage;

                      const accentClass = isWaterOff
                        ? "border-l-4 border-destructive"
                        : isCritical
                          ? "border-l-4 border-destructive"
                          : isBottleneck
                            ? "border-l-4 border-secondary"
                            : "border-l-4 border-transparent";

                      return (
                        <div
                          key={t.id}
                          className={cn(
                            "grid gap-1 items-center rounded-xl p-1",
                            rowIdx % 2 === 1 ? "bg-muted/30" : "bg-background",
                          )}
                          style={{ gridTemplateColumns: colTemplate }}
                        >
                          <div className="pr-2">
                            <div className={cn("flex items-center gap-2 pl-2", accentClass)}>
                              <div
                                className={cn(
                                  "font-medium text-sm truncate",
                                  isCritical ? "text-foreground" : "text-foreground",
                                )}
                                title={t.title}
                              >
                                {t.title}
                              </div>
                              {isCritical && (
                                <Badge
                                  variant={isWaterOff ? "outline" : "destructive"}
                                  className="text-[10px] px-2 py-0.5"
                                >
                                  KRYT
                                </Badge>
                              )}
                              {isBottleneck && (
                                <Badge variant="warning" className="text-[10px] px-2 py-0.5">
                                  WASKIE
                                </Badge>
                              )}
                              {isWaterOff && (
                                <Badge variant="destructive" className="text-[10px] px-2 py-0.5">
                                  WODA OFF
                                </Badge>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              <div className="w-[120px]">
                                <Input
                                  inputMode="decimal"
                                  value={String(t.durationWorkDays)}
                                  onChange={(e) =>
                                    onChangeDuration(
                                      t.id,
                                      toNumber(e.target.value, t.durationWorkDays),
                                    )
                                  }
                                  className="h-10"
                                />
                              </div>
                              <div className="text-xs text-muted-foreground">
                                dni rob. = {formatShortDate(t.startDateISO)} → {formatShortDate(t.endDateISO)}
                              </div>
                            </div>
                          </div>

                          {/* timeline cells */}
                          {Array.from({ length: columns }).map((_, idx) => {
                            const isBar = idx >= pos.startCol && idx < pos.startCol + pos.span;
                            return (
                              <div
                                key={idx}
                                className={cn(
                                  "h-8 rounded-md border",
                                  isBar
                                    ? cn(
                                        isWaterOff
                                          ? "bg-destructive/30 border-destructive/60 ring-2 ring-destructive/70 ring-inset"
                                          : "bg-primary/25 border-primary/40",
                                        !isWaterOff && isCritical
                                          ? "ring-2 ring-destructive/60 ring-inset"
                                          : !isWaterOff && isBottleneck
                                            ? "ring-2 ring-secondary/60 ring-inset"
                                            : "",
                                      )
                                    : rowIdx % 2 === 1
                                      ? "bg-muted/20 border-border"
                                      : "bg-background border-border",
                                )}
                              />
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
