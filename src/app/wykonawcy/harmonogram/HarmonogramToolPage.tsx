"use client";

import { useMemo, useState } from "react";
import type { DurationOverrides, ScheduleInput } from "@/lib/schedule/scheduleEngine";
import { generateSchedule } from "@/lib/schedule/scheduleEngine";
import { DEFAULT_SCHEDULE_INPUT } from "./defaultScheduleInput";
import ScheduleForm from "./ScheduleForm";
import GanttChart, { type GanttScale } from "./GanttChart";
import ResultsPanel from "./ResultsPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HarmonogramToolPage() {
  const [input, setInput] = useState<ScheduleInput>(DEFAULT_SCHEDULE_INPUT);
  const [overrides, setOverrides] = useState<DurationOverrides>({});
  const [scale, setScale] = useState<GanttScale>("days");
  const [isMvpAssumptionsOpen, setIsMvpAssumptionsOpen] = useState(false);

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

        <GanttChart
          scheduled={result.scheduled}
          scale={scale}
          criticalTaskIds={result.criticalTaskIds}
          bottleneckTaskIds={result.bottleneckTaskIds}
          onChangeDuration={onChangeDuration}
        />
      </div>

      <div className="space-y-6">
        <ResultsPanel result={result} />

        <Card className="relative mt-4 z-auto">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-xl">Zalozenia MVP</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsMvpAssumptionsOpen((v) => !v)}
              >
                {isMvpAssumptionsOpen ? "Zwin" : "Rozwin"}
              </Button>
            </div>
          </CardHeader>
          {isMvpAssumptionsOpen ? (
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div>- Dni robocze → kalendarz: przyjete 5/2 (weekendy niepracujace).</div>
              <div>{'- "WODA OFF" oznacza przerwe w dostawie wody dla danej strefy/pionu.'}</div>
              <div>- Czasy sa w dniach roboczych (mozliwe ulamki).</div>
            </CardContent>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
