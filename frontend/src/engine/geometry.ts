/* ─── Geometry Calculation Engine ─── */
import type { Point2D, Polygon } from '../types';

/** Calculate area of a polygon using the Shoelace formula (in square units) */
export function calculateArea(polygon: Polygon): number {
  const n = polygon.length;
  if (n < 3) return 0;
  let area = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += polygon[i].x * polygon[j].y;
    area -= polygon[j].x * polygon[i].y;
  }
  return Math.abs(area) / 2;
}

/** Calculate perimeter of a polygon */
export function calculatePerimeter(polygon: Polygon): number {
  let perimeter = 0;
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    const dx = polygon[j].x - polygon[i].x;
    const dy = polygon[j].y - polygon[i].y;
    perimeter += Math.sqrt(dx * dx + dy * dy);
  }
  return perimeter;
}

/** Calculate centroid of a polygon */
export function calculateCentroid(polygon: Polygon): Point2D {
  const n = polygon.length;
  if (n === 0) return { x: 0, y: 0 };
  let cx = 0, cy = 0;
  for (const p of polygon) {
    cx += p.x;
    cy += p.y;
  }
  return { x: cx / n, y: cy / n };
}

/** Calculate approximate bounding box dimensions */
export function calculateDimensions(polygon: Polygon): { width: number; depth: number } {
  if (polygon.length === 0) return { width: 0, depth: 0 };
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of polygon) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  return { width: maxX - minX, depth: maxY - minY };
}

/** 
 * Calculate inward-offset polygon (setback boundary).
 * Uses simplified parallel-edge offset for convex-ish polygons.
 * For a proper implementation, this would use Clipper.js or PostGIS ST_Buffer.
 */
export function calculateSetbackPolygon(
  polygon: Polygon,
  frontSetback: number,
  rearSetback: number,
  sideSetbackLeft: number,
  sideSetbackRight: number
): Polygon {
  if (polygon.length < 3) return [];

  // For a rectangular-ish plot, apply setbacks per edge
  // We determine which edges are front/rear/sides by convention:
  // Bottom edge (min Y) = front, Top edge (max Y) = rear
  // Left edge (min X) = left side, Right edge (max X) = right side
  const dims = calculateDimensions(polygon);
  const centroid = calculateCentroid(polygon);

  // Use uniform inset approach: shrink polygon by the average setback as a simplified method
  // Then apply per-side offsets for rectangular plots
  const minX = centroid.x - dims.width / 2;
  const maxX = centroid.x + dims.width / 2;
  const minY = centroid.y - dims.depth / 2;
  const maxY = centroid.y + dims.depth / 2;

  // For any polygon, create an inward offset approximation
  // Identify edges and apply appropriate setbacks
  const result: Polygon = polygon.map(p => {
    const relX = (p.x - minX) / (dims.width || 1);
    const relY = (p.y - minY) / (dims.depth || 1);

    let offsetX = 0;
    let offsetY = 0;

    // Apply front setback (bottom edge, near minY)
    if (relY < 0.5) {
      offsetY += frontSetback * (1 - relY * 2);
    }
    // Apply rear setback (top edge, near maxY)
    if (relY > 0.5) {
      offsetY -= rearSetback * ((relY - 0.5) * 2);
    }
    // Apply left side setback
    if (relX < 0.5) {
      offsetX += sideSetbackLeft * (1 - relX * 2);
    }
    // Apply right side setback
    if (relX > 0.5) {
      offsetX -= sideSetbackRight * ((relX - 0.5) * 2);
    }

    return {
      x: p.x + offsetX,
      y: p.y + offsetY,
    };
  });

  return result;
}

/** Generate a rectangular buildable polygon from setbacks (simpler, more reliable) */
export function calculateBuildableRect(
  width: number,
  depth: number,
  frontSetback: number,
  rearSetback: number,
  sideSetbackLeft: number,
  sideSetbackRight: number
): Polygon {
  const bw = width - sideSetbackLeft - sideSetbackRight;
  const bd = depth - frontSetback - rearSetback;

  if (bw <= 0 || bd <= 0) return [];

  const left = -width / 2 + sideSetbackLeft;
  const right = width / 2 - sideSetbackRight;
  const bottom = -depth / 2 + frontSetback;
  const top = depth / 2 - rearSetback;

  return [
    { x: left, y: bottom },
    { x: right, y: bottom },
    { x: right, y: top },
    { x: left, y: top },
  ];
}

/** Square feet to square meters */
export function sqftToSqm(sqft: number): number {
  return sqft * 0.092903;
}

/** Square meters to square feet */
export function sqmToSqft(sqm: number): number {
  return sqm / 0.092903;
}

/** Feet to meters */
export function ftToM(ft: number): number {
  return ft * 0.3048;
}

/** Meters to feet */
export function mToFt(m: number): number {
  return m / 0.3048;
}
