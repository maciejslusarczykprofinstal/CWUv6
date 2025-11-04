import { NextRequest } from "next/server";
import { makeResidentLetterPDF } from "@/lib/report/resident-letter-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const raw = req.nextUrl.searchParams.get("data");
    type Payload = { input?: any; result?: any };
    let input: any;
    let result: any;

    if (!raw) {
      // Fallback demo payload dla wejścia GET bez ?data
      input = {
        cwuPriceFromBill: 65,
        monthlyConsumption: 3.5,
        coldTempC: 8,
        hotTempC: 55,
        heatPriceFromCity: 82.13,
        letterCity: "Kraków",
      };
      const deltaT = input.hotTempC - input.coldTempC;
      const energyPerM3 = 0.004186 * deltaT;
      const theoreticalCostPerM3 = energyPerM3 * input.heatPriceFromCity;
      const lossPerM3 = input.cwuPriceFromBill - theoreticalCostPerM3;
      const energyLossPerM3 = lossPerM3 / input.heatPriceFromCity;
      const monthlyFinancialLoss = lossPerM3 * input.monthlyConsumption;
      const monthlyEnergyLoss = energyLossPerM3 * input.monthlyConsumption;
      const yearlyFinancialLoss = monthlyFinancialLoss * 12;
      const yearlyEnergyLoss = monthlyEnergyLoss * 12;
      const theoreticalMonthlyPayment = theoreticalCostPerM3 * input.monthlyConsumption;
      const actualMonthlyPayment = input.cwuPriceFromBill * input.monthlyConsumption;
      result = {
        energyLossPerM3,
        lossPerM3,
        monthlyFinancialLoss,
        monthlyEnergyLoss,
        yearlyFinancialLoss,
        yearlyEnergyLoss,
        theoreticalCostPerM3,
        theoreticalMonthlyPayment,
        actualMonthlyPayment,
        energyPerM3,
      };
    } else {
      let payload: Payload;
      try {
        payload = JSON.parse(raw) as Payload;
      } catch {
        return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      input = payload.input;
      result = payload.result;
    }

    const bytes = await makeResidentLetterPDF(input, result);
    // Podajemy ArrayBuffer bezpośrednio do Response (bez Blob) – stabilniej w Node
    const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    return new Response(ab, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=pismo-do-zarzadcy.pdf",
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    type Payload = { input?: unknown; result?: unknown };
    let payload: Payload;
    try {
      payload = (await req.json()) as Payload;
    } catch {
      return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { input, result } = payload || {};
    const bytes = await makeResidentLetterPDF(input, result);
    const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    return new Response(ab, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=pismo-do-zarzadcy.pdf",
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
