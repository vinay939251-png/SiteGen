const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');

function generateConceptDocument() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm
  const margin = 16;
  const contentWidth = pageWidth - margin * 2; // 178 mm
  const totalPages = 5;

  // Visual Theme Palette
  const colors = {
    bgDark: [10, 12, 16],
    surfaceDark: [17, 20, 26],
    surfaceCard: [24, 28, 38],
    borderLight: [42, 48, 62],
    accentPrimary: [59, 130, 246],    // Vibrant Blue
    accentSecondary: [99, 102, 241],  // Indigo
    accentPositive: [16, 185, 129],   // Emerald Green
    accentWarning: [245, 158, 11],    // Amber
    textPrimary: [248, 250, 252],     // Slate 50
    textSecondary: [148, 163, 184],   // Slate 400
    textMuted: [100, 116, 139],       // Slate 500
    tagBg: [30, 41, 59],
  };

  function applyPageTemplate(doc, pageNum, pageCategory) {
    // Background
    doc.setFillColor(...colors.bgDark);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Top decorative bar
    doc.setFillColor(...colors.accentPrimary);
    doc.rect(0, 0, pageWidth, 2.5, 'F');

    // Header (for pages 2+)
    if (pageNum > 1) {
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.accentPrimary);
      doc.text('SITEGEN', margin, 10);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.textMuted);
      doc.text(' |  Parametric Land Acquisition & Feasibility Intelligence', margin + 14, 10);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.accentSecondary);
      doc.text(pageCategory.toUpperCase(), pageWidth - margin, 10, { align: 'right' });

      // Header line
      doc.setDrawColor(...colors.borderLight);
      doc.setLineWidth(0.25);
      doc.line(margin, 13, pageWidth - margin, 13);
    }

    // Footer
    const footerY = pageHeight - 8;
    doc.setDrawColor(...colors.borderLight);
    doc.setLineWidth(0.2);
    doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.textMuted);
    doc.text('CONFIDENTIAL & PROPRIETARY  •  SITEGEN CONCEPT DOCUMENT (v1.0)', margin, footerY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.textSecondary);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, footerY, { align: 'right' });
  }

  function drawCard(doc, x, y, w, h, bg = colors.surfaceDark, border = colors.borderLight) {
    doc.setFillColor(...bg);
    doc.setDrawColor(...border);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, w, h, 2, 2, 'FD');
  }

  function drawBadge(doc, text, x, y, bg = colors.tagBg, fg = colors.accentPrimary) {
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    const txtWidth = doc.getTextWidth(text);
    const badgeW = txtWidth + 6;
    const badgeH = 4.5;
    doc.setFillColor(...bg);
    doc.roundedRect(x, y - 3.2, badgeW, badgeH, 1, 1, 'F');
    doc.setTextColor(...fg);
    doc.text(text, x + 3, y);
    return badgeW;
  }

  function drawSectionHeader(doc, title, subtitle, y) {
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.textPrimary);
    doc.text(title, margin, y);

    if (subtitle) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.textSecondary);
      doc.text(subtitle, margin, y + 4.5);
      return y + 9;
    }
    return y + 6;
  }

  // =========================================================================
  // PAGE 1: TITLE & EXECUTIVE SUMMARY
  // =========================================================================
  applyPageTemplate(doc, 1, 'Executive Overview');
  let y = 18;

  // Title Card Hero Banner
  drawCard(doc, margin, y, contentWidth, 54, colors.surfaceDark, colors.borderLight);
  
  // Tag
  drawBadge(doc, 'CONCEPT DOCUMENT & TECHNICAL WHITE PAPER', margin + 6, y + 8, [23, 37, 84], colors.accentPrimary);
  drawBadge(doc, 'STAGE: FUNCTIONAL MVP', margin + 6 + 68, y + 8, [6, 78, 59], colors.accentPositive);
  drawBadge(doc, 'PRIMARY JURISDICTION: HYDERABAD (GHMC / HMDA)', margin + 6 + 108, y + 8, [55, 48, 163], [199, 210, 254]);

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.textPrimary);
  doc.text('SITEGEN', margin + 6, y + 21);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.accentPrimary);
  doc.text('Parametric Architectural Feasibility & Land Acquisition Intelligence Engine', margin + 6, y + 28);

  doc.setFontSize(8.2);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...colors.textSecondary);
  const tagDesc = 'Transforming weeks of fragmented pre-acquisition due diligence into an instant, multi-dimensional parametric simulation answering: "Should I buy this plot of land?"';
  const splitTagDesc = doc.splitTextToSize(tagDesc, contentWidth - 12);
  doc.text(splitTagDesc, margin + 6, y + 36);

  // Metadata ribbon inside hero
  doc.setDrawColor(...colors.borderLight);
  doc.setLineWidth(0.2);
  doc.line(margin + 6, y + 44, margin + contentWidth - 6, y + 44);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textMuted);
  doc.text('AUTHOR: SiteGen Engineering & Urban Analytics Team', margin + 6, y + 49);
  doc.text('TARGET DOMAIN: PropTech / Spatial Computing / ConTech', margin + 78, y + 49);
  doc.text('DATE: October 2026  •  VER: 1.0.0', margin + contentWidth - 6, y + 49, { align: 'right' });

  y += 60;

  // Executive Summary Card
  y = drawSectionHeader(doc, '1. Executive Summary', 'The strategic necessity for instant land acquisition feasibility intelligence', y);

  drawCard(doc, margin, y, contentWidth, 58, colors.surfaceDark);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textSecondary);

  const execSummaryP1 = "In real estate development and land acquisition, billions of dollars are committed annually under severe informational asymmetry. Determining whether a specific land parcel is viable currently requires manual intervention across siloed domains: interpreting complex municipal zoning byelaws, calculating regulatory setback buffers, hand-drafting CAD massing models, and constructing speculative financial spreadsheets. This traditional feasibility cycle takes 2 to 4 weeks and costs substantial consulting capital per plot, creating severe friction in fast-moving land markets.";
  const execSummaryP2 = "SiteGen eliminates this friction through a unified parametric computation engine. By synthesizing GIS parcel geometries, dynamic municipal regulatory frameworks (GHMC/HMDA), automated 3D buildable envelope calculations, and real-time development financial models, SiteGen compresses a multi-week due diligence study into a sub-second, interactive browser session.";
  const execSummaryP3 = "The result is complete acquisition intelligence: developers, architects, and institutional funds can evaluate dozens of spatial scenarios, verify zoning adherence, optimize Floor Area Ratio (FAR), stress-test development margins, and generate executive investment memos in minutes before committing capital.";

  const splitP1 = doc.splitTextToSize(execSummaryP1, contentWidth - 10);
  doc.text(splitP1, margin + 5, y + 7);
  const p1H = splitP1.length * 3.6;

  const splitP2 = doc.splitTextToSize(execSummaryP2, contentWidth - 10);
  doc.text(splitP2, margin + 5, y + 7 + p1H + 3);
  const p2H = splitP2.length * 3.6;

  const splitP3 = doc.splitTextToSize(execSummaryP3, contentWidth - 10);
  doc.text(splitP3, margin + 5, y + 7 + p1H + 3 + p2H + 3);

  y += 64;

  // Core Value Pillars (3 Columns)
  y = drawSectionHeader(doc, '2. Core Value Pillars', 'Three fundamental pillars powering SiteGen', y);
  const colW = (contentWidth - 6) / 3;

  // Pillar 1
  drawCard(doc, margin, y, colW, 46, colors.surfaceCard);
  drawBadge(doc, 'SPEED & AGILITY', margin + 4, y + 7, [30, 41, 59], colors.accentPrimary);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.textPrimary);
  doc.text('Instant Parametric Math', margin + 4, y + 16);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textSecondary);
  const pil1Txt = "Replaces manual CAD modeling with mathematical setback offsets, automatic FAR utilization calculations, and live geometric massing updates at 60 FPS.";
  doc.text(doc.splitTextToSize(pil1Txt, colW - 8), margin + 4, y + 22);

  // Pillar 2
  drawCard(doc, margin + colW + 3, y, colW, 46, colors.surfaceCard);
  drawBadge(doc, 'REGULATORY RIGOR', margin + colW + 7, y + 7, [49, 46, 129], [199, 210, 254]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.textPrimary);
  doc.text('Coded Municipal Logic', margin + colW + 7, y + 16);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textSecondary);
  const pil2Txt = "Directly encodes road-width stepped tables, setback formulas, height caps, and parking ratio requirements specific to Hyderabad (GHMC & HMDA).";
  doc.text(doc.splitTextToSize(pil2Txt, colW - 8), margin + colW + 7, y + 22);

  // Pillar 3
  drawCard(doc, margin + (colW + 3) * 2, y, colW, 46, colors.surfaceCard);
  drawBadge(doc, 'FINANCIAL CERTAINTY', margin + (colW + 3) * 2 + 4, y + 7, [6, 78, 59], colors.accentPositive);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.textPrimary);
  doc.text('Unified Underwriting', margin + (colW + 3) * 2 + 4, y + 16);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textSecondary);
  const pil3Txt = "Directly bridges physical massing to Indian real-estate financial KPIs: Total Development Cost, Land Cost Ratios, Revenue, Net Profit, and ROI Margins.";
  doc.text(doc.splitTextToSize(pil3Txt, colW - 8), margin + (colW + 3) * 2 + 4, y + 22);

  y += 51;

  // The Core Equation Callout
  drawCard(doc, margin, y, contentWidth, 24, [15, 23, 42], colors.accentPrimary);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.accentPrimary);
  doc.text('THE SITEGEN WORKFLOW PARADIGM:', margin + 6, y + 7);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.textPrimary);
  doc.text('Land Polygon  →  Zoning Byelaws  →  Buildable Envelope  →  3D Massing  →  Financials  →  Acquisition Decision', margin + 6, y + 15);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...colors.textSecondary);
  doc.text('One continuous, reactive feedback loop recalculating in under 10 milliseconds across every user parameter change.', margin + 6, y + 20);

  // =========================================================================
  // PAGE 2: PROBLEM STATEMENT & MARKET DRIVERS
  // =========================================================================
  doc.addPage();
  applyPageTemplate(doc, 2, 'Problem & Market Need');
  y = 20;

  y = drawSectionHeader(doc, '3. The Core Problem Statement', 'Why traditional land feasibility analysis is dangerously inefficient', y);

  drawCard(doc, margin, y, contentWidth, 30, colors.surfaceDark);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.accentWarning);
  doc.text('The Core Question: "Should I buy this plot of land?"', margin + 6, y + 8);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textSecondary);
  const probHeadline = "Every land transaction represents a high-stakes, irreversible capital expenditure. Yet buyers must evaluate plot potential under substantial informational friction, outdated regulatory rulebooks, and speculative volumetric estimates. The absence of an integrated computational engine forces developers into costly guesswork.";
  doc.text(doc.splitTextToSize(probHeadline, contentWidth - 12), margin + 6, y + 15);

  y += 36;

  // 4 Detailed Pain Points
  y = drawSectionHeader(doc, '4. Key Failure Points in the Current Industry Workflow', 'The four critical friction barriers holding back rapid land acquisition', y);

  const halfW = (contentWidth - 4) / 2;
  const painH = 40;

  // Pain 1
  drawCard(doc, margin, y, halfW, painH, colors.surfaceCard);
  drawBadge(doc, 'FRICTION POINT 01', margin + 5, y + 7, [69, 26, 26], [248, 113, 113]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.textPrimary);
  doc.text('Regulatory Fragmentation & Opacity', margin + 5, y + 16);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textSecondary);
  const p1Desc = "Municipal zoning codes (e.g. GHMC/HMDA) link setback requirements and maximum FAR to road width tiers and boundary dimensions. Misjudging road width thresholds by just a few feet can restrict allowable height and reduce buildable saleable area by up to 35%.";
  doc.text(doc.splitTextToSize(p1Desc, halfW - 10), margin + 5, y + 22);

  // Pain 2
  drawCard(doc, margin + halfW + 4, y, halfW, painH, colors.surfaceCard);
  drawBadge(doc, 'FRICTION POINT 02', margin + halfW + 9, y + 7, [69, 26, 26], [248, 113, 113]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.textPrimary);
  doc.text('Disconnected Toolchains & Sunk Time', margin + halfW + 9, y + 16);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textSecondary);
  const p2Desc = "Evaluating a single plot requires GIS technicians, architects running CAD/Rhino, and financial analysts building Excel models. This disjointed process takes 10 to 20 days. In competitive land tenders, this latency results in lost deals or rushed, unvetted bids.";
  doc.text(doc.splitTextToSize(p2Desc, halfW - 10), margin + halfW + 9, y + 22);

  y += painH + 4;

  // Pain 3
  drawCard(doc, margin, y, halfW, painH, colors.surfaceCard);
  drawBadge(doc, 'FRICTION POINT 03', margin + 5, y + 7, [69, 26, 26], [248, 113, 113]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.textPrimary);
  doc.text('Disconnected Financial Modeling', margin + 5, y + 16);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textSecondary);
  const p3Desc = "Spatial density and financial yield are fundamentally interlinked, yet traditionally analyzed in isolation. Pro-forma models often assume theoretical FAR numbers that the physical plot geometry and setback rules cannot geometrically accommodate.";
  doc.text(doc.splitTextToSize(p3Desc, halfW - 10), margin + 5, y + 22);

  // Pain 4
  drawCard(doc, margin + halfW + 4, y, halfW, painH, colors.surfaceCard);
  drawBadge(doc, 'FRICTION POINT 04', margin + halfW + 9, y + 7, [69, 26, 26], [248, 113, 113]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.textPrimary);
  doc.text('Lack of Multi-Scenario Exploration', margin + halfW + 9, y + 16);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textSecondary);
  const p4Desc = "Because architectural massing is labor-intensive, teams typically test only 1 or 2 building configurations. Developers miss optimal trade-offs between floor count, parking basement excavation depth, floor heights, and overall profit margins.";
  doc.text(doc.splitTextToSize(p4Desc, halfW - 10), margin + halfW + 9, y + 22);

  y += painH + 8;

  // Market Context: Focus on Hyderabad
  y = drawSectionHeader(doc, '5. Market Context: Why Hyderabad First?', 'The strategic geographic beachhead for SiteGen', y);

  drawCard(doc, margin, y, contentWidth, 52, colors.surfaceDark);
  doc.setFontSize(8.2);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textSecondary);

  const hydText1 = "Hyderabad has emerged as one of India's fastest-growing real estate markets, characterized by rapid commercial IT corridor expansions (Gachibowli, HITEC City, Financial District, Kokapet, Neopolis) and expansive residential growth along the Outer Ring Road (ORR) and Regional Ring Road (RRR).";
  const hydText2 = "Key characteristics making Hyderabad the ideal validation testbed for SiteGen:";
  doc.text(doc.splitTextToSize(hydText1, contentWidth - 10), margin + 5, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.textPrimary);
  doc.text(hydText2, margin + 5, y + 19);

  doc.setFontSize(7.8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textSecondary);
  const bullet1 = "• Progressive High-Rise Policy: Telangana features flexible FAR frameworks coupled with stringent road-width and fire-fighting setback corridors, making parametric setback math critical.";
  const bullet2 = "• Extreme Land Price Escalation: High land acquisition costs demand strict margin optimization; even a 2% miscalculation translates into crores of rupees in capital variance.";
  const bullet3 = "• High Velocity of Transactions: High transaction volumes by institutional funds and tier-1 builders demand rapid pre-screening tools.";

  doc.text(doc.splitTextToSize(bullet1, contentWidth - 12), margin + 7, y + 26);
  doc.text(doc.splitTextToSize(bullet2, contentWidth - 12), margin + 7, y + 34);
  doc.text(doc.splitTextToSize(bullet3, contentWidth - 12), margin + 7, y + 42);

  // =========================================================================
  // PAGE 3: TECHNICAL ARCHITECTURE & MODULES
  // =========================================================================
  doc.addPage();
  applyPageTemplate(doc, 3, 'Product Architecture');
  y = 20;

  y = drawSectionHeader(doc, '6. Product Architecture & Technical Implementation', 'A modern, modular reactive architecture engineered for 60 FPS performance', y);

  // Architectural Diagram Card
  drawCard(doc, margin, y, contentWidth, 42, colors.surfaceCard);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.accentPrimary);
  doc.text('SYSTEM TOPOLOGY: CLIENT-SIDE REACTIVE COMPUTATION PIPELINE', margin + 6, y + 7);

  // Flow boxes
  const boxW = 30;
  const boxH = 18;
  const boxY = y + 13;
  const stepSpacing = (contentWidth - 12 - boxW * 5) / 4;

  const steps = [
    { title: 'GIS Map Engine', sub: 'Leaflet / OSM\nGeo-Coords', badge: 'STEP 1' },
    { title: 'Zoning Engine', sub: 'GHMC Tables\nSetback Offsets', badge: 'STEP 2' },
    { title: 'Geometric Core', sub: 'Polygon Math\nBuildable Footprint', badge: 'STEP 3' },
    { title: '3D Massing', sub: 'R3F / Three.js\nSunCalc Shadows', badge: 'STEP 4' },
    { title: 'Underwriting', sub: 'Capex / Opex\nExecutive PDF', badge: 'STEP 5' },
  ];

  steps.forEach((st, idx) => {
    const curX = margin + 6 + idx * (boxW + stepSpacing);
    doc.setFillColor(...colors.surfaceDark);
    doc.setDrawColor(...colors.borderLight);
    doc.roundedRect(curX, boxY, boxW, boxH, 1.5, 1.5, 'FD');

    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.accentPrimary);
    doc.text(st.badge, curX + 2, boxY + 4);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.textPrimary);
    doc.text(st.title, curX + 2, boxY + 8.5);

    doc.setFontSize(5.8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.textSecondary);
    doc.text(st.sub, curX + 2, boxY + 12.5);

    // Arrow to next
    if (idx < steps.length - 1) {
      const arrX = curX + boxW + 1;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.accentPrimary);
      doc.text('→', arrX + (stepSpacing / 2) - 2, boxY + 10);
    }
  });

  doc.setFontSize(6.8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...colors.textMuted);
  doc.text('Centralized state synchronization managed by Zustand with immutable parameter dispatching and zero-lag DOM recalculation.', margin + 6, y + 37);

  y += 48;

  // 5 In-Depth Feature Modules
  y = drawSectionHeader(doc, '7. Deep Dive: Key Functional Modules Built', 'Overview of the operational components delivered in the MVP', y);

  const modH = 29;

  // Mod 1: GIS Map
  drawCard(doc, margin, y, contentWidth, modH, colors.surfaceDark);
  drawBadge(doc, 'MODULE 1: GIS & SPATIAL INGESTION', margin + 5, y + 6, [23, 37, 84], colors.accentPrimary);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.textPrimary);
  doc.text('Cartesian & Geodetic Boundary Engine', margin + 5, y + 14);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textSecondary);
  const m1Desc = "Integrates Leaflet and OpenStreetMap with a custom fallback layer. Translates latitude/longitude coordinates into local Cartesian coordinates (feet) around the centroid, computes polygon area, perimeter, and aspect ratio, and enables interactive site boundary adjustments.";
  doc.text(doc.splitTextToSize(m1Desc, contentWidth - 10), margin + 5, y + 19);

  y += modH + 3;

  // Mod 2: Zoning Logic
  drawCard(doc, margin, y, contentWidth, modH, colors.surfaceDark);
  drawBadge(doc, 'MODULE 2: REGULATORY ENGINE', margin + 5, y + 6, [49, 46, 129], [199, 210, 254]);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.textPrimary);
  doc.text('Hyderabad GHMC/HMDA Rules Translator', margin + 5, y + 14);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textSecondary);
  const m2Desc = "Encodes regulatory tables matching road widths (e.g., <20ft, 20-30ft, 30-40ft, 40-60ft, 60-80ft, >80ft). Dynamically computes front, rear, and side setback buffers, allowable FAR (up to 4.0), and maximum building height envelopes, while allowing expert manual overrides.";
  doc.text(doc.splitTextToSize(m2Desc, contentWidth - 10), margin + 5, y + 19);

  y += modH + 3;

  // Mod 3: 3D Massing & Solar
  drawCard(doc, margin, y, contentWidth, modH, colors.surfaceDark);
  drawBadge(doc, 'MODULE 3: 3D PARAMETRIC MASSING', margin + 5, y + 6, [6, 78, 59], colors.accentPositive);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.textPrimary);
  doc.text('WebGL Extrusions & SunCalc Solar Simulation', margin + 5, y + 14);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textSecondary);
  const m3Desc = "Renders dynamic 3D building masses via React Three Fiber. Generates floor slab demarcations, setbacks, and road baselines. Integrates SunCalc to accurately position astronomical directional sunlight and cast real-time shadows for Morning, Noon, and Evening solar analysis.";
  doc.text(doc.splitTextToSize(m3Desc, contentWidth - 10), margin + 5, y + 19);

  y += modH + 3;

  // Mod 4: Financial Underwriting
  drawCard(doc, margin, y, contentWidth, modH, colors.surfaceDark);
  drawBadge(doc, 'MODULE 4: FINANCIAL & CAPACITY ANALYTICS', margin + 5, y + 6, [69, 26, 26], [248, 113, 113]);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.textPrimary);
  doc.text('Real Estate Pro-Forma & Sensitivity Modeler', margin + 5, y + 14);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textSecondary);
  const m4Desc = "Calculates Gross Floor Area (GFA), net saleable area (based on efficiency factor), and mandatory parking bays. Instantly projects Land Acquisition Cost, Construction Cost, Additional Approvals/Contingency Capex, Projected Gross Revenue, Net Profit, and ROI Margin.";
  doc.text(doc.splitTextToSize(m4Desc, contentWidth - 10), margin + 5, y + 19);

  y += modH + 3;

  // Mod 5: PDF Export
  drawCard(doc, margin, y, contentWidth, 23, colors.surfaceDark);
  drawBadge(doc, 'MODULE 5: EXECUTIVE REPORTING', margin + 5, y + 5.5, [30, 41, 59], colors.accentWarning);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.textPrimary);
  doc.text('Vectorized Investment Feasibility PDF Generation', margin + 5, y + 13.5);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textSecondary);
  doc.text('Exports complete, branded investment memos via jsPDF containing all dimensional, regulatory, massing, and financial metrics.', margin + 5, y + 18.5);

  // =========================================================================
  // PAGE 4: STAKEHOLDER IMPACT & MARKET VIABILITY
  // =========================================================================
  doc.addPage();
  applyPageTemplate(doc, 4, 'Impact & Market Opportunity');
  y = 20;

  y = drawSectionHeader(doc, '8. Target Stakeholders & Transformative Impact', 'Whose lives change and how SiteGen fundamentally reshapes real estate acquisition', y);

  const stakeH = 34;

  // Stakeholder 1: Developers
  drawCard(doc, margin, y, contentWidth, stakeH, colors.surfaceCard);
  drawBadge(doc, 'PRIMARY USER GROUP', margin + 5, y + 6, [23, 37, 84], colors.accentPrimary);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.textPrimary);
  doc.text('Real Estate Developers, Land Syndicates & Builders', margin + 5, y + 14.5);
  doc.setFontSize(7.6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textSecondary);
  const s1Txt = "• Impact: Cuts due diligence time from 20 days to 2 minutes during competitive land bidding.\n• Value Created: Eliminates multi-crore capital misallocations on unbuildable plots; gives rigorous quantitative leverage during landowner price negotiations and Joint Development (JD) ratio determinations.";
  doc.text(s1Txt, margin + 5, y + 20);

  y += stakeH + 4;

  // Stakeholder 2: Architects
  drawCard(doc, margin, y, contentWidth, stakeH, colors.surfaceCard);
  drawBadge(doc, 'DESIGN PROFESSIONALS', margin + 5, y + 6, [49, 46, 129], [199, 210, 254]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.textPrimary);
  doc.text('Architectural Firms, Master Planners & Urban Designers', margin + 5, y + 14.5);
  doc.setFontSize(7.6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textSecondary);
  const s2Txt = "• Impact: Automates mundane setback offset calculations, height checks, and initial building massing.\n• Value Created: Frees design talent from tedious pre-feasibility math; allows studios to deliver rapid, client-facing volumetric options and competitive bids with near-zero unbillable preliminary overhead.";
  doc.text(s2Txt, margin + 5, y + 20);

  y += stakeH + 4;

  // Stakeholder 3: Institutional Investors
  drawCard(doc, margin, y, contentWidth, stakeH, colors.surfaceCard);
  drawBadge(doc, 'CAPITAL ALLOCATORS', margin + 5, y + 6, [6, 78, 59], colors.accentPositive);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.textPrimary);
  doc.text('Private Equity Real Estate Funds, NBFCs & Sovereign Wealth Funds', margin + 5, y + 14.5);
  doc.setFontSize(7.6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textSecondary);
  const s3Txt = "• Impact: Standardizes investment committee underwriting with automated, defensible feasibility reports.\n• Value Created: Reduces risk by verifying that projected cashflows are rooted in true spatial reality rather than speculative spreadsheet formulas; accelerates deal underwriting throughput.";
  doc.text(s3Txt, margin + 5, y + 20);

  y += stakeH + 4;

  // Stakeholder 4: Municipal Bodies & Cities
  drawCard(doc, margin, y, contentWidth, stakeH, colors.surfaceCard);
  drawBadge(doc, 'CIVIC & URBAN ECOSYSTEM', margin + 5, y + 6, [69, 26, 26], [248, 113, 113]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.textPrimary);
  doc.text('Municipal Planning Authorities (GHMC / HMDA) & Urban Corridors', margin + 5, y + 14.5);
  doc.setFontSize(7.6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textSecondary);
  const s4Txt = "• Impact: Submissions pre-aligned with statutory road-width and setback codes reduce permit rejection rates.\n• Value Created: Promotes healthier urban morphology with compliant setbacks, adequate fire corridors, realistic parking provisions, and solar exposure across dense emerging metropolitan centers.";
  doc.text(s4Txt, margin + 5, y + 20);

  y += stakeH + 8;

  // Commercial & Market Model
  y = drawSectionHeader(doc, '9. Commercial Model & Monetization Strategy', 'Scalable B2B SaaS business model targeting high-value enterprise accounts', y);

  const tierW = (contentWidth - 6) / 3;
  const tierH = 40;

  // Tier 1
  drawCard(doc, margin, y, tierW, tierH, colors.surfaceDark);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.accentPrimary);
  doc.text('PRO DEVELOPER', margin + 4, y + 8);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.textPrimary);
  doc.text('₹15,000 / mo', margin + 4, y + 16);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textSecondary);
  doc.text('• Unlimited plot feasibility runs\n• 3D massing & solar shadows\n• Up to 20 exportable PDF reports\n• Hyderabad jurisdiction access', margin + 4, y + 22);

  // Tier 2
  drawCard(doc, margin + tierW + 3, y, tierW, tierH, colors.surfaceDark, colors.accentPrimary);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.accentPositive);
  doc.text('ENTERPRISE FUND', margin + tierW + 7, y + 8);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.textPrimary);
  doc.text('₹75,000 / mo', margin + tierW + 7, y + 16);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textSecondary);
  doc.text('• Multi-seat team workspace\n• Unlimited PDF acquisition memos\n• Custom financial pro-forma rules\n• Direct PostGIS API access', margin + tierW + 7, y + 22);

  // Tier 3
  drawCard(doc, margin + (tierW + 3) * 2, y, tierW, tierH, colors.surfaceDark);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.accentWarning);
  doc.text('INSTITUTIONAL API', margin + (tierW + 3) * 2 + 4, y + 8);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.textPrimary);
  doc.text('Custom Pricing', margin + (tierW + 3) * 2 + 4, y + 16);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textSecondary);
  doc.text('• Headless programmatic API\n• Batch cadastral plot analysis\n• Bank collateral valuation engine\n• SLA dedicated support', margin + (tierW + 3) * 2 + 4, y + 22);

  // =========================================================================
  // PAGE 5: CURRENT STAGE, ROADMAP & CONCLUSION
  // =========================================================================
  doc.addPage();
  applyPageTemplate(doc, 5, 'Stage & Strategic Roadmap');
  y = 20;

  y = drawSectionHeader(doc, '10. Current Stage of Development', 'Detailed breakdown of verified prototype capabilities vs planned enhancements', y);

  // Stage Badge Box
  drawCard(doc, margin, y, contentWidth, 34, colors.surfaceCard);
  drawBadge(doc, 'CURRENT OPERATIONAL STATUS', margin + 6, y + 7, [6, 78, 59], colors.accentPositive);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.textPrimary);
  doc.text('Stage: Functional Working Prototype (MVP)', margin + 6, y + 16);

  doc.setFontSize(7.8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textSecondary);
  const stageDesc = "SiteGen has successfully transitioned beyond the conceptual and wireframe phase into an interactive, browser-based working prototype. The core client-side mathematical engines (geometry, setbacks, building height, FAR constraints, solar positioning, and financial calculations) are fully implemented and running synchronously at zero latency.";
  doc.text(doc.splitTextToSize(stageDesc, contentWidth - 12), margin + 6, y + 22);

  y += 40;

  // Implementation Matrix: Built vs Upcoming
  y = drawSectionHeader(doc, '11. Technical Implementation Status', 'Current capabilities versus planned pilot architecture', y);

  drawCard(doc, margin, y, contentWidth, 54, colors.surfaceDark);

  // Table header
  doc.setFillColor(...colors.surfaceCard);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.textPrimary);
  doc.text('COMPONENT / CAPABILITY', margin + 4, y + 5);
  doc.text('TECHNICAL STACK', margin + 70, y + 5);
  doc.text('STATUS', margin + 130, y + 5);

  const tableRows = [
    { comp: 'Interactive Leaflet GIS Mapping', tech: 'React Leaflet / OpenStreetMap', stat: 'Completed & Live', col: colors.accentPositive },
    { comp: 'Geometric Setback Offset Engine', tech: 'Custom Polygon Offset Math (TS)', stat: 'Completed & Live', col: colors.accentPositive },
    { comp: 'Parametric 3D WebGL Massing', tech: 'React Three Fiber / Three.js', stat: 'Completed & Live', col: colors.accentPositive },
    { comp: 'Astronomical Sun & Shadow Path', tech: 'SunCalc / Real-time Dir Light', stat: 'Completed & Live', col: colors.accentPositive },
    { comp: 'Real-time Financial Pro-Forma', tech: 'Zustand / Recharts / TS Engine', stat: 'Completed & Live', col: colors.accentPositive },
    { comp: 'Automated Feasibility PDF Report', tech: 'jsPDF Client-side Generator', stat: 'Completed & Live', col: colors.accentPositive },
    { comp: 'PostGIS Spatial Registry Backend', tech: 'Django REST / PostgreSQL PostGIS', stat: 'Under Development', col: colors.accentWarning },
    { comp: 'Multi-City Zoning Rule Expansion', tech: 'Bengaluru (BDA) / Mumbai (BMC)', stat: 'Roadmap (Q1 2027)', col: colors.textMuted },
  ];

  let trY = y + 7;
  tableRows.forEach((row, i) => {
    trY += 5.5;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.textPrimary);
    doc.text(row.comp, margin + 4, trY);

    doc.setTextColor(...colors.textSecondary);
    doc.text(row.tech, margin + 70, trY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...row.col);
    doc.text(row.stat, margin + 130, trY);

    doc.setDrawColor(...colors.borderLight);
    doc.setLineWidth(0.15);
    doc.line(margin + 2, trY + 1.5, margin + contentWidth - 2, trY + 1.5);
  });

  y += 62;

  // Strategic Roadmap: 3 Phases
  y = drawSectionHeader(doc, '12. Strategic Product Roadmap', 'Phased plan from current MVP to institutional pilot and pan-India expansion', y);

  const phaseW = (contentWidth - 6) / 3;
  const phaseH = 46;

  // Phase 1
  drawCard(doc, margin, y, phaseW, phaseH, colors.surfaceCard);
  drawBadge(doc, 'PHASE 1 (COMPLETED)', margin + 4, y + 7, [6, 78, 59], colors.accentPositive);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.textPrimary);
  doc.text('Core MVP Validation', margin + 4, y + 16);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textSecondary);
  const ph1 = "• Parametric calculations\n• Real-time 3D extrusion\n• Hyderabad GHMC ruleset\n• Integrated financial dashboard\n• PDF memo export";
  doc.text(ph1, margin + 4, y + 22);

  // Phase 2
  drawCard(doc, margin + phaseW + 3, y, phaseW, phaseH, colors.surfaceCard);
  drawBadge(doc, 'PHASE 2 (MONTHS 1-4)', margin + phaseW + 7, y + 7, [23, 37, 84], colors.accentPrimary);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.textPrimary);
  doc.text('Cloud Backend & Pilot', margin + phaseW + 7, y + 16);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textSecondary);
  const ph2 = "• Django + PostGIS deployment\n• Persistent user project accounts\n• Multi-scenario comparison\n• Pilot testing with 5 Hyderabad developers and architecture firms";
  doc.text(doc.splitTextToSize(ph2, phaseW - 8), margin + phaseW + 7, y + 22);

  // Phase 3
  drawCard(doc, margin + (phaseW + 3) * 2, y, phaseW, phaseH, colors.surfaceCard);
  drawBadge(doc, 'PHASE 3 (MONTHS 5-12)', margin + (phaseW + 3) * 2 + 4, y + 7, [49, 46, 129], [199, 210, 254]);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.textPrimary);
  doc.text('Scale & Cadastral Ingestion', margin + (phaseW + 3) * 2 + 4, y + 16);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textSecondary);
  const ph3 = "• Pan-India regulatory engines (Bengaluru BDA, Mumbai BMC)\n• Automated government land parcel registry overlay\n• Institutional fund underwriting portal";
  doc.text(doc.splitTextToSize(ph3, phaseW - 8), margin + (phaseW + 3) * 2 + 4, y + 22);

  y += phaseH + 6;

  // Conclusion / Sign-off Callout
  drawCard(doc, margin, y, contentWidth, 18, [15, 23, 42], colors.accentPrimary);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.accentPrimary);
  doc.text('PROJECT CONCLUSION & SUMMARY:', margin + 5, y + 6);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.textSecondary);
  doc.text('SiteGen bridges computational geometry, municipal law, and investment finance to eliminate guesswork from land acquisition. Currently operating as a high-fidelity prototype, the platform is prepared for pilot deployment across institutional real-estate syndicates.', margin + 5, y + 12);

  // Save PDF to workspace root
  const outputPath = path.resolve('c:/Users/vinay/OneDrive/Documents/SiteGen/SiteGen_Concept_Document.pdf');
  const pdfBytes = doc.output('arraybuffer');
  fs.writeFileSync(outputPath, Buffer.from(pdfBytes));

  const stats = fs.statSync(outputPath);
  console.log(`Concept Document PDF successfully generated!`);
  console.log(`Path: ${outputPath}`);
  console.log(`File size: ${(stats.size / 1024).toFixed(2)} KB (${(stats.size / (1024 * 1024)).toFixed(3)} MB)`);
}

generateConceptDocument();
