"use client";

import type { ScheduleResult } from "@/lib/schedule/scheduleEngine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Props = {
  result: ScheduleResult;
};

export default function ResultsPanel({ result }: Props) {
  const s = result.stats;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Wynik (kierownik)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="text-sm font-semibold">Waskie gardla</div>
          <div className="text-2xl font-semibold">
            {s.totalCalendarDays} dni kal. <span className="text-sm text-muted-foreground">({s.totalWorkDays} dni rob.)</span>
          </div>
          <div className="text-sm text-muted-foreground">
            min–max: {s.totalCalendarDaysMin}–{s.totalCalendarDaysMax} dni kal.
          </div>
        </div>

        <div className="rounded-2xl border p-3">
          <div className="text-sm font-semibold">Straty organizacyjne</div>
          <div className="mt-1 text-sm text-muted-foreground">
            {s.organizationalLossPct}% czasu roboczego = {s.organizationalWorkDays} dni rob. (wejscia, bufor)
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold">Etapy krytyczne</div>
          {result.criticalStages.length === 0 ? (
            <div className="text-sm text-muted-foreground">Brak wyliczonych etapow krytycznych.</div>
          ) : (
            <div className="space-y-2">
              {result.criticalStages.map((c) => (
                <div key={c.taskId} className="rounded-2xl border p-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="text-[10px]">KRYTYCZNE</Badge>
                    <div className="text-sm font-medium">{c.title}</div>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{c.reason}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold">Wąskie gardła</div>
          {result.bottlenecks.length === 0 ? (
            <div className="text-sm text-muted-foreground">Brak wykrytych wąskich gardeł.</div>
          ) : (
            <ul className="space-y-2">
              {result.bottlenecks.map((b) => (
                <li key={b} className="rounded-2xl border p-3 text-sm">
                  {b}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
