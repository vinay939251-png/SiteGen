/* ─── Financial Calculation Engine ─── */
import type { FinancialInputs, FeasibilityResult } from '../types';

/** Format number in Indian currency style (Lakhs / Crores) */
export function formatIndianCurrency(amount: number): string {
  const absAmount = Math.abs(amount);
  if (absAmount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)} Cr`;
  } else if (absAmount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)} L`;
  } else {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
}

/** Format large numbers with commas (Indian style) */
export function formatNumber(n: number, decimals = 0): string {
  return n.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Calculate financial metrics */
export function calculateFinancials(
  grossFloorArea: number,
  saleableArea: number,
  inputs: FinancialInputs,
  parkingSpaces: number
): {
  landCost: number;
  constructionCost: number;
  parkingCost: number;
  additionalCost: number;
  totalDevelopmentCost: number;
  estimatedRevenue: number;
  estimatedProfit: number;
  marginPercent: number;
} {
  const landCost = inputs.landCost;
  const constructionCost = grossFloorArea * inputs.constructionCostPerSqft;
  const parkingCost = parkingSpaces * inputs.parkingCostPerSpace;
  const additionalCost = constructionCost * (inputs.additionalCostPercent / 100);
  const totalDevelopmentCost = landCost + constructionCost + parkingCost + additionalCost;
  const estimatedRevenue = saleableArea * inputs.sellingPricePerSqft;
  const estimatedProfit = estimatedRevenue - totalDevelopmentCost;
  const marginPercent = estimatedRevenue > 0 ? (estimatedProfit / estimatedRevenue) * 100 : 0;

  return {
    landCost,
    constructionCost,
    parkingCost,
    additionalCost,
    totalDevelopmentCost,
    estimatedRevenue,
    estimatedProfit,
    marginPercent,
  };
}
