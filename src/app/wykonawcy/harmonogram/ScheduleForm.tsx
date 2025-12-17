"use client";

import type { ScheduleInput } from "@/lib/schedule/scheduleEngine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  value: ScheduleInput;
  onChange: (next: ScheduleInput) => void;
  onResetToDefault: () => void;
};

function toNumber(value: string, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export default function ScheduleForm({ value, onChange, onResetToDefault }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Dane wejsciowe</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="space-y-3">
          <div className="text-sm font-semibold">Start</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Data startu</label>
              <Input
                type="date"
                value={value.startDateISO}
                onChange={(e) => onChange({ ...value, startDateISO: e.target.value })}
              />
            </div>
            <div className="flex items-end justify-start gap-2">
              <Button type="button" variant="outline" onClick={onResetToDefault}>
                Wczytaj dane testowe (blok z lat 80.)
              </Button>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="text-sm font-semibold">Parametry budynku</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Klatki</label>
              <Input
                inputMode="numeric"
                value={String(value.budynek.klatki)}
                onChange={(e) =>
                  onChange({
                    ...value,
                    budynek: { ...value.budynek, klatki: toNumber(e.target.value, value.budynek.klatki) },
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Kondygnacje</label>
              <Input
                inputMode="numeric"
                value={String(value.budynek.kondygnacje)}
                onChange={(e) =>
                  onChange({
                    ...value,
                    budynek: {
                      ...value.budynek,
                      kondygnacje: toNumber(e.target.value, value.budynek.kondygnacje),
                    },
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Piony na klatke</label>
              <Input
                inputMode="numeric"
                value={String(value.budynek.pionyNaKlatke)}
                onChange={(e) =>
                  onChange({
                    ...value,
                    budynek: {
                      ...value.budynek,
                      pionyNaKlatke: toNumber(e.target.value, value.budynek.pionyNaKlatke),
                    },
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Lokale (razem)</label>
              <Input
                inputMode="numeric"
                value={String(value.budynek.lokale)}
                onChange={(e) =>
                  onChange({
                    ...value,
                    budynek: { ...value.budynek, lokale: toNumber(e.target.value, value.budynek.lokale) },
                  })
                }
              />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="text-sm font-semibold">Zakres robot</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(
              [
                { key: "zw", label: "ZW" },
                { key: "cwu", label: "CWU" },
                { key: "cyrkulacja", label: "Cyrkulacja" },
              ] as const
            ).map((opt) => (
              <label key={opt.key} className="flex items-center gap-2 rounded-2xl border p-3">
                <input
                  type="checkbox"
                  checked={value.zakres[opt.key]}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      zakres: { ...value.zakres, [opt.key]: e.target.checked },
                    })
                  }
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="text-sm font-semibold">Roboty wspolne</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(
              [
                { key: "piwnica", label: "Piwnica / poziomy" },
                { key: "wezel", label: "Wezel / armatura" },
              ] as const
            ).map((opt) => (
              <label key={opt.key} className="flex items-center gap-2 rounded-2xl border p-3">
                <input
                  type="checkbox"
                  checked={value.robotyWspolne[opt.key]}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      robotyWspolne: { ...value.robotyWspolne, [opt.key]: e.target.checked },
                    })
                  }
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="text-sm font-semibold">Organizacja robot</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Ekipy instalacyjne</label>
              <Input
                inputMode="numeric"
                value={String(value.organizacja.ekipyInstalacyjne)}
                onChange={(e) =>
                  onChange({
                    ...value,
                    organizacja: {
                      ...value.organizacja,
                      ekipyInstalacyjne: toNumber(e.target.value, value.organizacja.ekipyInstalacyjne),
                    },
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Ekipy odtworzeniowe</label>
              <Input
                inputMode="numeric"
                value={String(value.organizacja.ekipyOdtworzeniowe)}
                onChange={(e) =>
                  onChange({
                    ...value,
                    organizacja: {
                      ...value.organizacja,
                      ekipyOdtworzeniowe: toNumber(e.target.value, value.organizacja.ekipyOdtworzeniowe),
                    },
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Max rownoleglych pionow</label>
              <Input
                inputMode="numeric"
                value={String(value.organizacja.maxRownoleglychPionow)}
                onChange={(e) =>
                  onChange({
                    ...value,
                    organizacja: {
                      ...value.organizacja,
                      maxRownoleglychPionow: toNumber(
                        e.target.value,
                        value.organizacja.maxRownoleglychPionow,
                      ),
                    },
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Bufor czasowy (%)</label>
              <Input
                inputMode="numeric"
                value={String(value.organizacja.buforCzasowyPct)}
                onChange={(e) =>
                  onChange({
                    ...value,
                    organizacja: {
                      ...value.organizacja,
                      buforCzasowyPct: toNumber(e.target.value, value.organizacja.buforCzasowyPct),
                    },
                  })
                }
              />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="text-sm font-semibold">Dostepnosc lokali</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Preset</label>
              <Select
                value={String(value.dostepnosc.dostepnoscLokaliPct)}
                onValueChange={(v) =>
                  onChange({
                    ...value,
                    dostepnosc: { ...value.dostepnosc, dostepnoscLokaliPct: toNumber(v, 70) },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="90">90% (dobrze)</SelectItem>
                  <SelectItem value="70">70% (typowo)</SelectItem>
                  <SelectItem value="50">50% (trudno)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">% (recznie)</label>
              <Input
                inputMode="numeric"
                value={String(value.dostepnosc.dostepnoscLokaliPct)}
                onChange={(e) =>
                  onChange({
                    ...value,
                    dostepnosc: {
                      ...value.dostepnosc,
                      dostepnoscLokaliPct: toNumber(
                        e.target.value,
                        value.dostepnosc.dostepnoscLokaliPct,
                      ),
                    },
                  })
                }
              />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="text-sm font-semibold">Odtworzenia</div>
          <Select
            value={value.odtworzenia.odtworzenia}
            onValueChange={(v) =>
              onChange({
                ...value,
                odtworzenia: {
                  odtworzenia: v as ScheduleInput["odtworzenia"]["odtworzenia"],
                },
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Wybierz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minimalne">Minimalne</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="rozszerzone">Rozszerzone</SelectItem>
            </SelectContent>
          </Select>
        </section>
      </CardContent>
    </Card>
  );
}
