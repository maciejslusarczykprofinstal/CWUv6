export type CwuLossInputs = {
  cwuPriceFromBill: number;
  monthlyConsumption: number;
  coldTempC: number;
  hotTempC: number;
  heatPriceFromCity: number;
};

export type CwuLossResult = {
  energyLossPerM3: number;
  lossPerM3: number;
  monthlyFinancialLoss: number;
  monthlyEnergyLoss: number;
  yearlyFinancialLoss: number;
  yearlyEnergyLoss: number;
  theoreticalCostPerM3: number;
  theoreticalMonthlyPayment: number;
  actualMonthlyPayment: number;
  energyPerM3: number;
};

export function calculateCwuLoss(input: CwuLossInputs): CwuLossResult {
  const deltaT = Number(input.hotTempC) - Number(input.coldTempC); // K
  const energyPerM3 = 0.004186 * deltaT; // GJ/m³
  const theoreticalCostPerM3 = energyPerM3 * Number(input.heatPriceFromCity); // zł/m³
  const lossPerM3 = Number(input.cwuPriceFromBill) - theoreticalCostPerM3; // zł/m³
  const energyLossPerM3 = lossPerM3 / (Number(input.heatPriceFromCity) || 1); // GJ/m³

  const monthlyConsumption = Number(input.monthlyConsumption);
  const monthlyFinancialLoss = lossPerM3 * monthlyConsumption; // zł/miesiąc
  const monthlyEnergyLoss = energyLossPerM3 * monthlyConsumption; // GJ/miesiąc
  const yearlyFinancialLoss = monthlyFinancialLoss * 12; // zł/rok
  const yearlyEnergyLoss = monthlyEnergyLoss * 12; // GJ/rok

  const theoreticalMonthlyPayment = theoreticalCostPerM3 * monthlyConsumption;
  const actualMonthlyPayment = Number(input.cwuPriceFromBill) * monthlyConsumption;

  // Utrzymujemy zaokrąglenia identyczne jak w dotychczasowej logice /mieszkancy.
  return {
    energyLossPerM3: Number(Number(energyLossPerM3).toFixed(4)),
    lossPerM3: Number(Number(lossPerM3).toFixed(2)),
    monthlyFinancialLoss: Number(Number(monthlyFinancialLoss).toFixed(2)),
    monthlyEnergyLoss: Number(Number(monthlyEnergyLoss).toFixed(3)),
    yearlyFinancialLoss: Number(Number(yearlyFinancialLoss).toFixed(2)),
    yearlyEnergyLoss: Number(Number(yearlyEnergyLoss).toFixed(3)),
    theoreticalCostPerM3: Number(Number(theoreticalCostPerM3).toFixed(2)),
    theoreticalMonthlyPayment: Number(Number(theoreticalMonthlyPayment).toFixed(2)),
    actualMonthlyPayment: Number(Number(actualMonthlyPayment).toFixed(2)),
    energyPerM3: Number(Number(energyPerM3).toFixed(4)),
  };
}
