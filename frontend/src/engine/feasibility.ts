/* ─── Feasibility Calculation Engine ─── */
import type {
  Site,
  ZoningRules,
  BuildingParameters,
  FinancialInputs,
  FeasibilityResult,
  FeasibilityIndicator,
  Polygon,
} from '../types';
import { calculateArea, calculateBuildableRect } from './geometry';
import { calculateFinancials } from './finance';

/**
 * Core feasibility calculation.
 * Takes site + zoning + building + finance inputs → produces complete result.
 */
export function calculateFeasibility(
  site: Site,
  zoning: ZoningRules,
  building: BuildingParameters,
  finance: FinancialInputs
): FeasibilityResult {
  const plotAreaSqft = site.areaSqft;

  // Calculate buildable polygon from setbacks
  const buildablePolygon = calculateBuildableRect(
    site.dimensions.width,
    site.dimensions.depth,
    zoning.frontSetback,
    zoning.rearSetback,
    zoning.sideSetbackLeft,
    zoning.sideSetbackRight
  );

  const buildableAreaSqft = calculateArea(buildablePolygon);

  // Maximum GFA from FAR
  const maxGFAFromFAR = plotAreaSqft * building.targetFAR;

  // GFA from floor count (constrained by buildable footprint)
  const gfaFromFloors = buildableAreaSqft * building.floors;

  // Use the lesser of FAR-based GFA and floor-based GFA
  const grossFloorArea = Math.min(maxGFAFromFAR, gfaFromFloors);

  // Saleable area
  const saleableArea = grossFloorArea * building.efficiency;

  // Building height
  const buildingHeightM = building.floors * building.floorHeight;

  // Parking spaces
  const parkingSpaces = Math.ceil(saleableArea / zoning.parkingRatio);

  // Financial calculations
  const financials = calculateFinancials(
    grossFloorArea,
    saleableArea,
    finance,
    parkingSpaces
  );

  return {
    plotAreaSqft,
    buildableAreaSqft,
    buildablePolygon,
    grossFloorArea,
    saleableArea,
    floors: building.floors,
    buildingHeightM,
    parkingSpaces,
    landCost: financials.landCost,
    constructionCost: financials.constructionCost,
    additionalCost: financials.additionalCost,
    totalDevelopmentCost: financials.totalDevelopmentCost,
    estimatedRevenue: financials.estimatedRevenue,
    estimatedProfit: financials.estimatedProfit,
    marginPercent: financials.marginPercent,
  };
}

/** Generate feasibility indicators based on result */
export function generateIndicators(result: FeasibilityResult): FeasibilityIndicator[] {
  const indicators: FeasibilityIndicator[] = [];

  // Margin indicator
  if (result.marginPercent >= 30) {
    indicators.push({
      label: 'Strong development margin',
      status: 'positive',
      description: `Estimated margin of ${result.marginPercent.toFixed(1)}% exceeds typical threshold`,
    });
  } else if (result.marginPercent >= 15) {
    indicators.push({
      label: 'Moderate development margin',
      status: 'warning',
      description: `Estimated margin of ${result.marginPercent.toFixed(1)}% is within acceptable range`,
    });
  } else {
    indicators.push({
      label: 'Low development margin',
      status: 'critical',
      description: `Estimated margin of ${result.marginPercent.toFixed(1)}% may be insufficient`,
    });
  }

  // Development capacity
  const utilizationRatio = result.buildableAreaSqft / result.plotAreaSqft;
  if (utilizationRatio >= 0.6) {
    indicators.push({
      label: 'Strong development capacity',
      status: 'positive',
      description: `${(utilizationRatio * 100).toFixed(0)}% of plot is buildable after setbacks`,
    });
  } else if (utilizationRatio >= 0.4) {
    indicators.push({
      label: 'Moderate development capacity',
      status: 'warning',
      description: `${(utilizationRatio * 100).toFixed(0)}% of plot is buildable after setbacks`,
    });
  } else {
    indicators.push({
      label: 'Limited development capacity',
      status: 'critical',
      description: `Only ${(utilizationRatio * 100).toFixed(0)}% of plot is buildable after setbacks`,
    });
  }

  // Parking constraint
  if (result.parkingSpaces > 50) {
    indicators.push({
      label: 'Significant parking requirement',
      status: 'warning',
      description: `${result.parkingSpaces} parking spaces may require dedicated parking structure`,
    });
  } else {
    indicators.push({
      label: 'Manageable parking requirement',
      status: 'neutral',
      description: `${result.parkingSpaces} parking spaces required`,
    });
  }

  // Land cost sensitivity
  const landCostRatio = result.landCost / result.totalDevelopmentCost;
  if (landCostRatio > 0.4) {
    indicators.push({
      label: 'High land-cost sensitivity',
      status: 'warning',
      description: `Land constitutes ${(landCostRatio * 100).toFixed(0)}% of total development cost`,
    });
  } else {
    indicators.push({
      label: 'Balanced cost structure',
      status: 'positive',
      description: `Land constitutes ${(landCostRatio * 100).toFixed(0)}% of total development cost`,
    });
  }

  return indicators;
}
