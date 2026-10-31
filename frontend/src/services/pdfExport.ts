/* ─── PDF Report Generator with Embedded 3D Model Snapshot ─── */
import jsPDF from 'jspdf';
import type { Site, ZoningRules, BuildingParameters, FeasibilityResult } from '../types';
import { formatNumber, formatIndianCurrency } from '../engine/finance';

export async function generatePDFReport(
  site: Site,
  zoning: ZoningRules,
  building: BuildingParameters,
  feasibility: FeasibilityResult
): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const darkBg: [number, number, number] = [8, 9, 11];
  const accentBlue: [number, number, number] = [76, 158, 235];
  const textPrimary: [number, number, number] = [240, 242, 245];
  const textSecondary: [number, number, number] = [139, 146, 154];
  const textTertiary: [number, number, number] = [92, 99, 112];
  const warningColor: [number, number, number] = [232, 168, 56];
  const positiveColor: [number, number, number] = [61, 214, 140];

  // Try capturing 3D canvas render from DOM
  let canvasImgData: string | null = null;
  try {
    const canvas = (document.querySelector('.canvas-split-3d canvas') ||
      document.querySelector('.canvas-container canvas')) as HTMLCanvasElement;
    if (canvas && canvas.toDataURL) {
      canvasImgData = canvas.toDataURL('image/jpeg', 0.9);
    }
  } catch (err) {
    console.warn('Could not grab 3D canvas screenshot:', err);
  }

  function applyHeader(doc: jsPDF, pageNum: number, totalPages: number) {
    doc.setFillColor(...darkBg);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Header bar
    doc.setTextColor(...textPrimary);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('SITEGEN', margin, 20);

    doc.setFontSize(9);
    doc.setTextColor(...textSecondary);
    doc.setFont('helvetica', 'normal');
    doc.text('Land Feasibility Intelligence', margin, 25);

    // Status badge
    doc.setFontSize(8);
    doc.setTextColor(...warningColor);
    doc.setFont('helvetica', 'bold');
    doc.text('PRELIMINARY ANALYSIS', pageWidth - margin, 20, { align: 'right' });

    doc.setDrawColor(40, 44, 52);
    doc.setLineWidth(0.3);
    doc.line(margin, 30, pageWidth - margin, 30);

    // Footer
    const footerY = pageHeight - 10;
    doc.setDrawColor(40, 44, 52);
    doc.setLineWidth(0.2);
    doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

    doc.setFontSize(7);
    doc.setTextColor(...textTertiary);
    doc.setFont('helvetica', 'normal');
    doc.text('SiteGen — Parametric Architectural Feasibility Engine', margin, footerY);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, footerY, { align: 'right' });
  }

  // ═══════════════════════════════════════════════════════════
  // PAGE 1: SITE INFO, 3D VISUALIZATION & DEVELOPMENT CAPACITY
  // ═══════════════════════════════════════════════════════════
  applyHeader(doc, 1, 2);
  let y = 38;

  // Title
  doc.setFontSize(15);
  doc.setTextColor(...textPrimary);
  doc.setFont('helvetica', 'bold');
  doc.text('Preliminary Site Feasibility & Acquisition Report', margin, y);
  y += 6;

  doc.setFontSize(8);
  doc.setTextColor(...textSecondary);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Site: ${site.name}  •  Date: ${new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })}`,
    margin,
    y
  );
  y += 10;

  // ─── Section: 3D Massing & Urban Context ───
  y = addSectionTitle(doc, '3D DEVELOPMENT ENVELOPE & MASSING VISUALIZATION', margin, y, accentBlue);

  if (canvasImgData) {
    const imgH = 68;
    // Dark border box for render
    doc.setFillColor(15, 18, 24);
    doc.setDrawColor(45, 52, 65);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentWidth, imgH, 2, 2, 'FD');

    // Embed 3D render image
    doc.addImage(canvasImgData, 'JPEG', margin + 1, y + 1, contentWidth - 2, imgH - 2);
    y += imgH + 8;
  } else {
    y += 4;
  }

  // ─── Section: Site & Spatial Information ───
  y = addSectionTitle(doc, 'SITE & SPATIAL GEOMETRY', margin, y, accentBlue);
  y = addRow(doc, 'Site Name', site.name, margin, y, contentWidth, textSecondary, textPrimary);
  y = addRow(doc, 'Address', site.address, margin, y, contentWidth, textSecondary, textPrimary);
  y = addRow(
    doc,
    'Coordinates',
    `${site.coordinates.lat.toFixed(4)}°N, ${site.coordinates.lng.toFixed(4)}°E`,
    margin,
    y,
    contentWidth,
    textSecondary,
    textPrimary
  );
  y = addRow(doc, 'Plot Area', `${formatNumber(site.areaSqft)} sq.ft (${formatNumber(site.areaSqm)} sq.m)`, margin, y, contentWidth, textSecondary, textPrimary);
  y = addRow(doc, 'Plot Dimensions', `${site.dimensions.width} ft × ${site.dimensions.depth} ft`, margin, y, contentWidth, textSecondary, textPrimary);
  y = addRow(doc, 'Access Road Width', `${site.roadWidth} ft corridor`, margin, y, contentWidth, textSecondary, textPrimary);
  y += 6;

  // ─── Section: Development Capacity ───
  y = addSectionTitle(doc, 'DEVELOPMENT CAPACITY & MASSING', margin, y, accentBlue);
  y = addRow(doc, 'Building Typology', building.typology, margin, y, contentWidth, textSecondary, textPrimary);
  y = addRow(doc, 'Target FAR / FSI', `${building.targetFAR.toFixed(2)}`, margin, y, contentWidth, textSecondary, textPrimary);
  y = addRow(doc, 'Buildable Footprint', `${formatNumber(feasibility.buildableAreaSqft)} sq.ft`, margin, y, contentWidth, textSecondary, textPrimary);
  y = addRow(doc, 'Gross Floor Area (GFA)', `${formatNumber(feasibility.grossFloorArea)} sq.ft`, margin, y, contentWidth, textSecondary, textPrimary);
  y = addRow(doc, 'Estimated Saleable Area', `${formatNumber(feasibility.saleableArea)} sq.ft (${(building.efficiency * 100).toFixed(0)}% efficiency)`, margin, y, contentWidth, textSecondary, textPrimary);
  y = addRow(doc, 'Floor Count & Height', `${feasibility.floors} floors (Height: ${feasibility.buildingHeightM.toFixed(1)} m)`, margin, y, contentWidth, textSecondary, textPrimary);
  y = addRow(doc, 'Mandatory Parking Spaces', `${feasibility.parkingSpaces} bays required`, margin, y, contentWidth, textSecondary, textPrimary);

  // ═══════════════════════════════════════════════════════════
  // PAGE 2: FINANCIAL UNDERWRITING & ZONING COMPLIANCE
  // ═══════════════════════════════════════════════════════════
  doc.addPage();
  applyHeader(doc, 2, 2);
  y = 38;

  // ─── Section: Regulatory Assumptions ───
  y = addSectionTitle(doc, 'REGULATORY & ZONING ASSUMPTIONS (GHMC / HMDA)', margin, y, accentBlue);
  y = addRow(doc, 'Jurisdiction & Authority', `${zoning.jurisdiction} (${zoning.authority})`, margin, y, contentWidth, textSecondary, textPrimary);
  y = addRow(doc, 'Front Setback', `${zoning.frontSetback} ft`, margin, y, contentWidth, textSecondary, textPrimary);
  y = addRow(doc, 'Rear Setback', `${zoning.rearSetback} ft`, margin, y, contentWidth, textSecondary, textPrimary);
  y = addRow(doc, 'Side Setbacks (L / R)', `${zoning.sideSetbackLeft} ft / ${zoning.sideSetbackRight} ft`, margin, y, contentWidth, textSecondary, textPrimary);
  y = addRow(doc, 'Maximum Statutory FAR', `${zoning.maxFAR}`, margin, y, contentWidth, textSecondary, textPrimary);
  y = addRow(doc, 'Maximum Building Height', `${zoning.maxHeight} m`, margin, y, contentWidth, textSecondary, textPrimary);
  y = addRow(doc, 'Statutory Parking Ratio', `1 space per ${zoning.parkingRatio} sq.ft saleable`, margin, y, contentWidth, textSecondary, textPrimary);
  y += 8;

  // ─── Section: Financial Feasibility Underwriting ───
  y = addSectionTitle(doc, 'FINANCIAL UNDERWRITING & PRO-FORMA', margin, y, accentBlue);
  y = addRow(doc, 'Land Acquisition Cost', formatIndianCurrency(feasibility.landCost), margin, y, contentWidth, textSecondary, textPrimary);
  y = addRow(doc, 'Construction Cost', formatIndianCurrency(feasibility.constructionCost), margin, y, contentWidth, textSecondary, textPrimary);
  y = addRow(doc, 'Approvals, Consultants & Contingency', formatIndianCurrency(feasibility.additionalCost), margin, y, contentWidth, textSecondary, textPrimary);
  y = addRow(doc, 'Total Development Cost', formatIndianCurrency(feasibility.totalDevelopmentCost), margin, y, contentWidth, textSecondary, textPrimary);

  // Separator
  doc.setDrawColor(40, 44, 52);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  y = addRow(doc, 'Projected Gross Revenue', formatIndianCurrency(feasibility.estimatedRevenue), margin, y, contentWidth, positiveColor, positiveColor);
  y = addRow(
    doc,
    'Estimated Net Profit',
    formatIndianCurrency(feasibility.estimatedProfit),
    margin,
    y,
    contentWidth,
    textSecondary,
    feasibility.estimatedProfit >= 0 ? positiveColor : [232, 84, 84]
  );
  y = addRow(
    doc,
    'Estimated Development Margin',
    `${feasibility.marginPercent.toFixed(1)}%`,
    margin,
    y,
    contentWidth,
    textSecondary,
    feasibility.marginPercent >= 25 ? positiveColor : warningColor
  );
  y += 14;

  // ─── Disclaimer Box ───
  doc.setFillColor(25, 20, 15);
  doc.setDrawColor(...warningColor);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 28, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(...warningColor);
  doc.setFont('helvetica', 'bold');
  doc.text('STATUTORY & INVESTMENT DISCLAIMER', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(200, 205, 215);
  const disclaimer =
    'Preliminary feasibility estimate — not a statutory approval. Regulatory assumptions used in this analysis are preliminary heuristics derived from GHMC/HMDA guidelines and must be independently verified with local planning authorities and licensed project architects prior to executing land acquisition or financial commitments. Financial projections are indicative estimates and do not constitute formal investment advice.';
  const splitDisclaimer = doc.splitTextToSize(disclaimer, contentWidth - 8);
  doc.text(splitDisclaimer, margin + 4, y + 12);

  // Save PDF
  doc.save(`SiteGen_Feasibility_${site.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

function addSectionTitle(
  doc: jsPDF,
  title: string,
  x: number,
  y: number,
  color: [number, number, number]
): number {
  doc.setFontSize(8.5);
  doc.setTextColor(...color);
  doc.setFont('helvetica', 'bold');
  doc.text(title, x, y);
  y += 2;
  doc.setDrawColor(...color);
  doc.setLineWidth(0.3);
  doc.line(x, y, x + doc.getTextWidth(title), y);
  return y + 5;
}

function addRow(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
  labelColor: [number, number, number],
  valueColor: [number, number, number]
): number {
  doc.setFontSize(8.5);
  doc.setTextColor(...labelColor);
  doc.setFont('helvetica', 'normal');
  doc.text(label, x, y);

  doc.setTextColor(...valueColor);
  doc.setFont('helvetica', 'bold');
  doc.text(value, x + width, y, { align: 'right' });

  return y + 5.2;
}
