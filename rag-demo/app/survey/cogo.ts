import { polygon } from "@turf/turf";
import type { Polygon } from 'geojson'

/**
 * Convert quadrant bearing (e.g. "S01-42-10E") to azimuth in radians.
 * Azimuth measured clockwise from north.
 */
function dmsBearingToAzimuth(bearing: string): number {
  const dir1 = bearing[0]; // N or S
  const dir2 = bearing.slice(-1); // E or W
  const [deg, min, sec] = bearing.slice(1, -1).split("-").map(Number) as [number, number, number]
  const angle = deg + min / 60 + sec / 3600;

  let azimuth: number;
  if (dir1 === "N" && dir2 === "E") azimuth = angle;
  else if (dir1 === "N" && dir2 === "W") azimuth = 360 - angle;
  else if (dir1 === "S" && dir2 === "E") azimuth = 180 - angle;
  else if (dir1 === "S" && dir2 === "W") azimuth = 180 + angle;
  else throw new Error(`Invalid bearing: ${bearing}`);

  return (azimuth * Math.PI) / 180; // radians
}

/**
 * Offset a point by bearing + distance in planar feet.
 */
function offsetPoint(
  x: number,
  y: number,
  bearing: string,
  distance: number
): [number, number] {
  const az = dmsBearingToAzimuth(bearing);
  const dx = distance * Math.sin(az);
  const dy = distance * Math.cos(az);
  return [x + dx, y + dy];
}

/**
 * Types for the AI JSON payload
 */
export interface TieLine {
  bearing: string;
  distance: number;
}

export interface TraverseCall {
  bearing: string;
  distance: number;
}

export interface ParcelPayload {
  referencePoint: {
    corner: string;
    tieLine: TieLine;
  };
  traverse: TraverseCall[];
}

/**
 * Build a GeoJSON Polygon from a PLSS reference point, tie line, and traverse calls.
 *
 * @param refX  X coordinate of reference corner (same units as distances, typically feet)
 * @param refY  Y coordinate of reference corner
 * @param payload  Parsed legal description payload from AI
 * @returns Turf.js Polygon
 */
export function buildParcelPolygon(
  refX: number,
  refY: number,
  payload: ParcelPayload
): Polygon {
  // Step 1: Compute Point of Beginning (POB)
  let [x, y] = offsetPoint(
    refX,
    refY,
    payload.referencePoint.tieLine.bearing,
    payload.referencePoint.tieLine.distance
  );
  const coords: [number, number][] = [[x, y]];

  // Step 2: Traverse calls
  for (const call of payload.traverse) {
    [x, y] = offsetPoint(x, y, call.bearing, call.distance);
    coords.push([x, y]);
  }

  // Step 3: Close polygon
  coords.push(coords[0] as any);

  return polygon([coords]).geometry;
}

/**
 * Check closure error of a parcel traverse.
 *
 * @returns misclosure vector and distance
 */
export function checkClosure(
  refX: number,
  refY: number,
  payload: ParcelPayload
): { misclosure: [number, number]; distance: number } {
  // Compute Point of Beginning
  let [x, y] = offsetPoint(
    refX,
    refY,
    payload.referencePoint.tieLine.bearing,
    payload.referencePoint.tieLine.distance
  );
  const pob = [x, y];

  // Traverse calls
  for (const call of payload.traverse) {
    [x, y] = offsetPoint(x, y, call.bearing, call.distance);
  }

  // Misclosure vector
  const dx = x - pob[0];
  const dy = y - pob[1];
  const dist = Math.sqrt(dx * dx + dy * dy);

  return { misclosure: [dx, dy], distance: dist };
}


const test = ()=> {

  const payload: ParcelPayload = {
    referencePoint: {
      corner: "NE corner of NESE Section 19",
      tieLine: { bearing: "S01-42-10E", distance: 495.0 },
    },
    traverse: [
      { bearing: "S89-03-17W", distance: 1320.0 },
      { bearing: "N01-42-10W", distance: 165.0 },
      { bearing: "N89-03-17E", distance: 568.96 },
      { bearing: "S01-42-10E", distance: 145.0 },
      { bearing: "N89-03-17E", distance: 751.04 },
      { bearing: "S01-42-10E", distance: 20.0 },
    ],
  };
  
  const refX = 500000; // from PLSS dataset
  const refY = 100000;
  
  const parcelGeom = buildParcelPolygon(refX, refY, payload);
  
  console.log(JSON.stringify(parcelGeom, null, 2));
}

