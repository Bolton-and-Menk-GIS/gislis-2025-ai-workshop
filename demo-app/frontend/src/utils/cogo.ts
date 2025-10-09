import Point from '@arcgis/core/geometry/Point'
import Polygon from '@arcgis/core/geometry/Polygon'
import Polyline from '@arcgis/core/geometry/Polyline'
import type { SurveyInfo, CornerDirection } from '@/typings';
import { log } from './logger'
import { v4 as uuidv4 } from 'uuid'
import { destination, point, toWgs84, toMercator } from '@turf/turf'
import * as intersectionOperator from "@arcgis/core/geometry/operators/intersectionOperator";
import Graphic from '@arcgis/core/Graphic';

/**
 * Convert quadrant bearing (e.g. "S01-42-10E") to azimuth in radians.
 * Azimuth measured clockwise from north.
 */
function dmsBearingToAzimuth(bearing: string, format: 'radians' | 'degrees'='degrees'): number {
  const dir1 = bearing[0].toUpperCase(); // N or S
  const dir2 = bearing.slice(-1); // E or W
  const [deg, min, sec] = bearing.slice(1, -1).split("-").map(Number) as [number, number, number]
  const angle = deg + min / 60 + sec / 3600;

  let azimuth: number;
  if (dir1 === "N" && dir2 === "E") azimuth = angle;
  else if (dir1 === "N" && dir2 === "W") azimuth = 360 - angle;
  else if (dir1 === "S" && dir2 === "E") azimuth = 180 - angle;
  else if (dir1 === "S" && dir2 === "W") azimuth = 180 + angle;
  else throw new Error(`Invalid bearing: ${bearing}`);

  const radians = (azimuth * Math.PI) / 180; 
  return format === 'radians' ? radians : radians * 180 / Math.PI
}

/**
 * create an offset point using the [turf.destination](https://turfjs.org/docs/api/destination) function
 * @param lon 
 * @param lat 
 * @param bearing 
 * @param distance 
 * @param conversionFactor 
 * @returns 
 */
export function offsetPoint(
  lon: number,
  lat: number,
  bearing: string, 
  distance: number, 
  conversionFactor=1,
  debug=false
): [number, number] {
  const azimuth = dmsBearingToAzimuth(bearing, 'degrees') // Turf expects degrees!
  const start = point([lon, lat])
  const dest = destination(start, (distance * conversionFactor) / 1000, azimuth, { units: 'kilometers' })
  // only show when debugging
  if (debug){
    console.table({
      azimuth,
      bearing,
      distance,
      'distance (converted)': (distance * conversionFactor) / 1000,
      lon,
      lat,
    })
  }
  const [destLon, destLat] = dest.geometry.coordinates
  return [destLon, destLat]
}

/**
 * will get the section corner point by intersecting section/quarter/quarter-quarter polygons
 * @param polygons 
 * @param cornerDirection 
 * @returns 
 */
export function getSectionCornerPoint(polygons: __esri.Polygon[], cornerDirection: CornerDirection='NE') {
  if (!polygons.length){
    throw new Error('no polygons provided')
  }

  // get SR
  const spatialReference = polygons[0]?.spatialReference ?? {
    wkid: 4326
  }

  let coords: [number, number][] = []
  if (polygons.length === 1){
    coords = polygons[0].rings.flat() as [number, number][]
  } else {
    // get the shared boundary (line intersect)
    const polyline = intersectionOperator.execute(...polygons.map(ft => new Polyline({ 
        paths: (ft as __esri.Polygon).rings,
        spatialReference: ft.spatialReference ?? spatialReference
      })) as [__esri.Polyline, __esri.Polyline]
    ) as __esri.Polyline
  
    // Flatten all coordinates
    coords = polyline.paths.flat() as [number, number][]

    if (!coords.length){
      throw new Error('no valid coordinates found for PLSS boundaries')
    }

    /**
     * if using a line boundary, we need to find the appropriate point 
     * based on a single direction (N,S,E,W) to find point on that side
     * of the line
     */
    if (cornerDirection?.length === 1) {
      // Single direction - find point on appropriate side of line
      const direction = cornerDirection as 'N' | 'S' | 'E' | 'W'
      let ptCoords: [number, number] | undefined = undefined
      if (direction === 'N' || direction === 'S') {
        // Find northernmost or southernmost point
        const targetY = direction === 'N' ? Math.max(...coords.map(([_, y]) => y)) : Math.min(...coords.map(([_, y]) => y))
        ptCoords = coords.filter(([_, y]) => y === targetY).flat() as [number, number]
      } else {
        // Find easternmost or westernmost point  
        const targetX = direction === 'E' ? Math.max(...coords.map(([x, _]) => x)) : Math.min(...coords.map(([x, _]) => x))
        ptCoords = coords.filter(([x, _]) => x === targetX).flat() as [number, number]
      }
      const [x, y] = ptCoords ?? []
      if (!isNaN(x) && !isNaN(y)){

        // return point based on side of line
        return new Point({ 
          x, 
          y, 
          spatialReference 
        });
      }
    }
  }

  if (!coords.length){
    throw new Error('no valid coordinates found for PLSS boundaries')
  }

  const northings = coords.map(([_, y])=> y)
  const eastings = coords.map(([x, _])=> x)
  const xmin = Math.min(...eastings)
  const xmax = Math.max(...eastings)
  const ymin = Math.min(...northings)
  const ymax = Math.max(...northings)

  // determine corner direction in each axis for (x|y)(min|max)
  const northerly = (cornerDirection ?? 'NE')[0]
  const easterly = (cornerDirection ?? 'NE')[1] ?? 'E' 
  log(`[cogo]: Corner direction will be: ${northerly} and ${easterly} for the "Northing" and "Easting" respectively, in numerical terms.`)

  return new Point({ 
    x: easterly === 'W' ? xmin: xmax, 
    y: northerly === 'N' ? ymax: ymin, 
    spatialReference
  });
}

/**
 * Build a GeoJSON Polygon from a PLSS reference point, tie line, and traverse calls.
 *
 * @param refX  X coordinate of reference corner (same units as distances, typically feet)
 * @param refY  Y coordinate of reference corner
 * @param payload  Parsed legal description payload from AI
 * @returns Turf.js Polygon
 */
export function buildSurveyFeatures(
  refX: number,
  refY: number,
  survey: SurveyInfo,
  conversionFactor=0.3048
){
  const spatialReference = { 
    wkid: 4326
  }

  const surveyId = uuidv4()

  const plssAttributes = {
    surveyId,
    range: survey.range,
    rangeDir: survey.rangeDirection,
    township: survey.township,
    townshipDir: survey.townshipDirection,
    section: survey.section,
    divisionLevel: survey.referencePoint.divisionLevel,
    quarterQuarer: survey.quarterQuarter,
  }

  const tiePoint = new Graphic({
    geometry: {
      type: 'point',
      x: refX,
      y: refY,
      spatialReference
    },
    attributes: {
      latitude: refY,
      longitude: refX,
      description: survey.referencePoint.corner,
      ...plssAttributes
    }
  })
  // Step 1: Compute Point of Beginning (POB)
  let [x, y] = offsetPoint(
    refX,
    refY,
    survey.referencePoint.tieLine.bearing,
    survey.referencePoint.tieLine.distance,
    conversionFactor
  );
  const coords: [number, number][] = [[x, y]];
  const lines: __esri.Graphic[] = []

  // Step 2: Traverse calls
  for (const [idx, call] of survey.traverse.entries()) {
    const start = [x, y] as [number, number]
    const offset = offsetPoint(x, y, call.bearing, call.distance, conversionFactor);
    x = offset[0]
    y = offset[1]
    coords.push([x, y]);

    // create polyline graphic with label
    lines.push(
      new Graphic({
        geometry: {
          type: 'polyline',
          paths:  [[ start, [ x, y] ]],
          spatialReference
        },
        attributes: {
          surveyId,
          lineIndex: idx,
          distanceFt: call.distance,
          bearing: call.bearing,
          label: `${call.bearing}   ${call.distance}'`,
          startLongitude: start[0],
          startLatitude: start[1],
          endLongitude: x,
          endLatitude: y
        }
      })
    )
  }

  // Step 3: Close polygon
  coords.push(coords[0]);

  const boundaryPolygon = new Graphic({ 
    geometry: {
      type: 'polygon',
      rings: [coords],
      spatialReference
    },
    attributes: {
      ...plssAttributes,
      area: survey.area,
    }
  })

  return {
    lines,
    tiePoint,
    boundaryPolygon
  }
}

/**
 * Check closure error of a parcel traverse.
 *
 * @returns misclosure vector and distance
 */
export function checkClosure(
  refX: number,
  refY: number,
  survey: SurveyInfo
): { misclosure: [number, number]; distance: number } {
  // Compute Point of Beginning
  let [x, y] = offsetPoint(
    refX,
    refY,
    survey.referencePoint.tieLine.bearing,
    survey.referencePoint.tieLine.distance
  );
  const pob = [x, y];

  // Traverse calls
  for (const call of survey.traverse) {
    const offset = offsetPoint(x, y, call.bearing, call.distance);
    x = offset[0]
    y = offset[1]
  }

  // Misclosure vector
  const dx = x - pob[0];
  const dy = y - pob[1];
  const dist = Math.sqrt(dx * dx + dy * dy);

  return { misclosure: [dx, dy], distance: dist };
}

