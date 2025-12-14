import React from "react";
import { describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Font, pdf } from "@react-pdf/renderer";

import { ResidentCwuIssueLetterPDFDocument } from "./resident-cwu-complaint-letter-pdf-client";

Font.register({
  family: "Roboto",
  fonts: [
    { src: path.resolve(process.cwd(), "public/fonts/Roboto-Regular.ttf"), fontWeight: 400 },
    { src: path.resolve(process.cwd(), "public/fonts/Roboto-Bold.ttf"), fontWeight: 700 },
  ],
});

describe("ResidentCwuIssueLetterPDFDocument", () => {
  it("generuje PDF bez błędów (buffer > 0)", async () => {
    const createdAt = new Date("2025-12-14T10:00:00.000Z");

    const doc = (
      <ResidentCwuIssueLetterPDFDocument
        createdAt={createdAt}
        input={{
          cwuPriceFromBill: 65,
          monthlyConsumption: 8.6,
        }}
        result={{
          theoreticalCostPerM3: 21.5,
          lossPerM3: 43.5,
          monthlyFinancialLoss: 374.1,
          yearlyFinancialLoss: 4489.2,
        }}
        complaint={{
          reasons: [
            {
              id: "circulation24h",
              label: "Podejrzenie pracy cyrkulacji/pomp 24h (zbędne straty)",
              title: "Podejrzenie pracy pomp cyrkulacji 24h",
              technicalDescription:
                "Stała praca cyrkulacji może powodować straty energii w pionach i przewodach, niezależnie od poboru CWU. Zażółć gęślą jaźń.",
              consequences: ["Wyższe GJ/m³", "Wyższe rachunki (Łódź, Śródmieście)"],
              recommendedActions: ["Weryfikacja harmonogramów pomp", "Optymalizacja automatyki"],
            },
          ],
          otherReason: "Wahania temperatury wieczorem (żółć, ąęłńóśźż)",
          description: "Od kilku miesięcy rachunki są istotnie wyższe, mimo podobnego zużycia — proszę o analizę (Zażółć gęślą jaźń).",
        }}
        issue={{
          fullName: "Jan Żółć",
          email: "jan.kowalski@example.com",
          phone: "600 000 000",
          street: "ul. Przykładowa Żurawia",
          buildingNumber: "12",
          apartmentNumber: "34",
          letterCity: "Łódź",
          managerName: "Zarządca Budynku Sp. z o.o. (Żółć)",
          managerAddress: "ul. Administracyjna 1\n00-000 Łódź",
          managerEmail: "biuro@zarzadca.pl",
          problemType: "zawyzony_koszt",
          otherProblem: "",
          symptoms: {
            longFlush: true,
            coolsFast: false,
            unstableTemp: true,
            specificHours: false,
            longTime: true,
          },
          description: "Podejrzenie zawyżonych kosztów CWU w ostatnim rozliczeniu (Zażółć gęślą jaźń).",
          goal: "analiza_kosztow",
        }}
      />
    );

    const instance: any = pdf(doc as any);

    // Preferuj tryb blob/arrayBuffer (działa stabilnie w Node 20+ i w środowiskach web).
    if (typeof instance.toBlob === "function") {
      const blob = (await instance.toBlob()) as Blob;
      const ab = await blob.arrayBuffer();
      expect(ab.byteLength).toBeGreaterThan(1000);

      if (process.env.WRITE_PDF === "1") {
        const outPath = path.join(os.tmpdir(), "resident-cwu-unicode-check.pdf");
        await fs.writeFile(outPath, Buffer.from(new Uint8Array(ab)));
        // eslint-disable-next-line no-console
        console.log(`WRITE_PDF=1: zapisano PDF do: ${outPath}`);
      }
      return;
    }

    const out = await instance.toBuffer();
    const len =
      typeof out?.byteLength === "number"
        ? out.byteLength
        : typeof out?.length === "number"
          ? out.length
          : typeof out?.buffer?.byteLength === "number"
            ? out.buffer.byteLength
            : 0;
    expect(len).toBeGreaterThan(1000);

    if (process.env.WRITE_PDF === "1") {
      const outPath = path.join(os.tmpdir(), "resident-cwu-unicode-check.pdf");
      await fs.writeFile(outPath, Buffer.isBuffer(out) ? out : Buffer.from(out));
      // eslint-disable-next-line no-console
      console.log(`WRITE_PDF=1: zapisano PDF do: ${outPath}`);
    }
  });
});
