"use client";
import { useState, useEffect } from "react";

// Typy wyników
interface AuditResults {
  residentsCost: number;
  lossCost: number;
  systemEfficiency: number;
}

// Hook pobierający wyniki z localStorage (docelowo z context/API)
export function useAuditResults(): AuditResults {
  const [results, setResults] = useState<AuditResults>({
    residentsCost: 0,
    lossCost: 0,
    systemEfficiency: 0,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const wyniki = JSON.parse(localStorage.getItem("licznikiWyniki") || "null");
        if (wyniki && wyniki.kosztMieszkancow > 0) {
          const residentsCost = wyniki.kosztMieszkancow ?? 0;
          const lossCost = residentsCost - (wyniki.kosztMieszkancow - wyniki.kosztStrat);
          const kosztPodgrzaniaBezStrat = residentsCost - lossCost;
          const systemEfficiency = residentsCost > 0 ? (kosztPodgrzaniaBezStrat / residentsCost) * 100 : 0;
          setResults({ residentsCost, lossCost, systemEfficiency });
        } else {
          setResults({ residentsCost: 0, lossCost: 0, systemEfficiency: 0 });
        }
      } catch {
        setResults({ residentsCost: 0, lossCost: 0, systemEfficiency: 0 });
      }
    }
  }, []);

  return results;
}
