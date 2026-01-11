/**
 * ScribbleIcon - Hand-drawn icons from SVG paths using Rough.js
 *
 * Takes pre-extracted path commands and renders them with a sketchy,
 * hand-drawn aesthetic using Rough.js. This mirrors the iOS RoughSFSymbol
 * component approach.
 *
 * The pipeline:
 * 1. Path commands extracted from Lucide SVGs → icon-paths.ts
 * 2. This component linearizes curves (bezier/arc → line segments)
 * 3. Rough.js renders with organic jitter and double-stroke effect
 */

import { useEffect, useMemo, useRef } from "react";
import rough from "roughjs";
import { cn } from "../lib/utils";
import { getIconPath, type IconName, type PathCommand } from "./icon-paths";

export interface ScribbleIconProps {
  /** Icon name from Lucide icon set */
  name: IconName;
  /** Size in pixels (default: 24) */
  size?: number;
  /** Stroke color */
  color?: "default" | "muted" | "accent" | "success" | "warning" | "error" | string;
  /** Stroke width (default: 1.5) */
  strokeWidth?: number;
  /** Roughness level (0 = smooth, 2+ = very rough). Default: 1.2 */
  roughness?: number;
  /** Bowing - how much curves bow inward/outward. Default: 1 */
  bowing?: number;
  /** Seed for deterministic rendering (default: 42) */
  seed?: number;
  /** Additional CSS classes */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Color Mapping
// ─────────────────────────────────────────────────────────────────────────────

const colorMap: Record<string, string> = {
  default: "var(--scribble-stroke)",
  muted: "var(--scribble-stroke-muted)",
  accent: "var(--scribble-stroke-accent)",
  success: "var(--scribble-stroke-success)",
  warning: "var(--scribble-stroke-warning)",
  error: "var(--scribble-stroke-error)",
};

function getColor(color: string): string {
  if (color in colorMap) {
    if (typeof window !== "undefined") {
      const varName = colorMap[color].slice(4, -1);
      return (
        getComputedStyle(document.documentElement).getPropertyValue(varName).trim() ||
        "#1a1a1a"
      );
    }
    return "#1a1a1a";
  }
  return color;
}

// ─────────────────────────────────────────────────────────────────────────────
// Path Linearization (mirrors iOS RoughSFSymbol)
// ─────────────────────────────────────────────────────────────────────────────

interface Point {
  x: number;
  y: number;
}

interface Subpath {
  points: Point[];
  closed: boolean;
}

/**
 * Approximate a cubic bezier curve with line segments.
 */
function linearizeCubicBezier(
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  segments: number = 6
): Point[] {
  const points: Point[] = [];
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const t2 = t * t;
    const t3 = t2 * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;

    points.push({
      x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
      y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y,
    });
  }
  return points;
}

/**
 * Approximate a quadratic bezier curve with line segments.
 */
function linearizeQuadBezier(
  p0: Point,
  p1: Point,
  p2: Point,
  segments: number = 4
): Point[] {
  const points: Point[] = [];
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const mt = 1 - t;

    points.push({
      x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
      y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
    });
  }
  return points;
}

/**
 * Convert SVG arc endpoint parameterization to center parameterization.
 * Based on the SVG spec: https://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
 */
function arcEndpointToCenter(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  rx: number,
  ry: number,
  phi: number,
  largeArc: boolean,
  sweep: boolean
): { cx: number; cy: number; theta1: number; dTheta: number; rx: number; ry: number } | null {
  // Step 1: Compute (x1', y1') - rotate to align ellipse axes
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);
  const dx = (x1 - x2) / 2;
  const dy = (y1 - y2) / 2;
  const x1p = cosPhi * dx + sinPhi * dy;
  const y1p = -sinPhi * dx + cosPhi * dy;

  // Correct radii if needed
  let rxSq = rx * rx;
  let rySq = ry * ry;
  const x1pSq = x1p * x1p;
  const y1pSq = y1p * y1p;

  // Check if radii are large enough
  const lambda = x1pSq / rxSq + y1pSq / rySq;
  if (lambda > 1) {
    const sqrtLambda = Math.sqrt(lambda);
    rx *= sqrtLambda;
    ry *= sqrtLambda;
    rxSq = rx * rx;
    rySq = ry * ry;
  }

  // Step 2: Compute (cx', cy')
  const sq = Math.max(0,
    (rxSq * rySq - rxSq * y1pSq - rySq * x1pSq) /
    (rxSq * y1pSq + rySq * x1pSq)
  );
  const coef = (largeArc !== sweep ? 1 : -1) * Math.sqrt(sq);
  const cxp = coef * (rx * y1p / ry);
  const cyp = coef * -(ry * x1p / rx);

  // Step 3: Compute (cx, cy) from (cx', cy')
  const cx = cosPhi * cxp - sinPhi * cyp + (x1 + x2) / 2;
  const cy = sinPhi * cxp + cosPhi * cyp + (y1 + y2) / 2;

  // Step 4: Compute theta1 and dTheta
  const ux = (x1p - cxp) / rx;
  const uy = (y1p - cyp) / ry;
  const vx = (-x1p - cxp) / rx;
  const vy = (-y1p - cyp) / ry;

  // Angle between two vectors
  const angleBetween = (ux: number, uy: number, vx: number, vy: number): number => {
    const dot = ux * vx + uy * vy;
    const lenU = Math.sqrt(ux * ux + uy * uy);
    const lenV = Math.sqrt(vx * vx + vy * vy);
    let cos = dot / (lenU * lenV);
    cos = Math.max(-1, Math.min(1, cos)); // Clamp for floating point errors
    const angle = Math.acos(cos);
    return ux * vy - uy * vx < 0 ? -angle : angle;
  };

  const theta1 = angleBetween(1, 0, ux, uy);
  let dTheta = angleBetween(ux, uy, vx, vy);

  // Adjust dTheta based on sweep flag
  if (!sweep && dTheta > 0) {
    dTheta -= 2 * Math.PI;
  } else if (sweep && dTheta < 0) {
    dTheta += 2 * Math.PI;
  }

  return { cx, cy, theta1, dTheta, rx, ry };
}

/**
 * Approximate an elliptical arc with line segments.
 * Properly handles largeArc and sweep flags per SVG spec.
 */
function linearizeArc(
  p0: Point,
  rx: number,
  ry: number,
  xAxisRotation: number,
  largeArc: number,
  sweep: number,
  p1: Point,
  segmentsPerQuadrant: number = 4
): Point[] {
  // Handle degenerate cases
  if (rx === 0 || ry === 0) {
    return [p1];
  }
  if (p0.x === p1.x && p0.y === p1.y) {
    return [];
  }

  // Make radii positive
  rx = Math.abs(rx);
  ry = Math.abs(ry);

  const phi = (xAxisRotation * Math.PI) / 180;
  const result = arcEndpointToCenter(
    p0.x, p0.y,
    p1.x, p1.y,
    rx, ry,
    phi,
    largeArc === 1,
    sweep === 1
  );

  if (!result) return [p1];

  const { cx, cy, theta1, dTheta } = result;
  const correctedRx = result.rx;
  const correctedRy = result.ry;

  // Calculate number of segments based on arc length
  const arcAngle = Math.abs(dTheta);
  const numSegments = Math.max(1, Math.ceil((arcAngle / (Math.PI / 2)) * segmentsPerQuadrant));

  const points: Point[] = [];
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);

  for (let i = 1; i <= numSegments; i++) {
    const t = i / numSegments;
    const theta = theta1 + t * dTheta;
    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);

    // Point on the ellipse (before rotation)
    const x = correctedRx * cosTheta;
    const y = correctedRy * sinTheta;

    // Rotate and translate to final position
    points.push({
      x: cosPhi * x - sinPhi * y + cx,
      y: sinPhi * x + cosPhi * y + cy,
    });
  }

  return points;
}

/**
 * Convert path commands to linearized subpaths.
 * This mirrors the iOS RoughSFSymbolShape.roughenPath approach.
 */
function linearizeCommands(commands: PathCommand[], scale: number): Subpath[] {
  const subpaths: Subpath[] = [];
  let currentSubpath: Point[] = [];
  let currentPoint: Point = { x: 0, y: 0 };
  let startPoint: Point = { x: 0, y: 0 };
  let lastControlPoint: Point = { x: 0, y: 0 };
  let lastCommand = "";

  const s = (v: number) => v * scale;

  for (const cmd of commands) {
    const { c, a } = cmd;

    switch (c) {
      case "M":
        if (currentSubpath.length > 0) {
          subpaths.push({ points: currentSubpath, closed: false });
          currentSubpath = [];
        }
        currentPoint = { x: s(a[0]), y: s(a[1]) };
        startPoint = { ...currentPoint };
        currentSubpath.push({ ...currentPoint });
        break;

      case "L":
        currentPoint = { x: s(a[0]), y: s(a[1]) };
        currentSubpath.push({ ...currentPoint });
        break;

      case "H":
        currentPoint = { x: s(a[0]), y: currentPoint.y };
        currentSubpath.push({ ...currentPoint });
        break;

      case "V":
        currentPoint = { x: currentPoint.x, y: s(a[0]) };
        currentSubpath.push({ ...currentPoint });
        break;

      case "C": {
        const cp1 = { x: s(a[0]), y: s(a[1]) };
        const cp2 = { x: s(a[2]), y: s(a[3]) };
        const end = { x: s(a[4]), y: s(a[5]) };
        const points = linearizeCubicBezier(currentPoint, cp1, cp2, end);
        currentSubpath.push(...points);
        lastControlPoint = cp2;
        currentPoint = end;
        break;
      }

      case "S": {
        // Smooth cubic - reflect last control point
        let cp1: Point;
        if (lastCommand === "C" || lastCommand === "S") {
          cp1 = {
            x: 2 * currentPoint.x - lastControlPoint.x,
            y: 2 * currentPoint.y - lastControlPoint.y,
          };
        } else {
          cp1 = { ...currentPoint };
        }
        const cp2 = { x: s(a[0]), y: s(a[1]) };
        const end = { x: s(a[2]), y: s(a[3]) };
        const points = linearizeCubicBezier(currentPoint, cp1, cp2, end);
        currentSubpath.push(...points);
        lastControlPoint = cp2;
        currentPoint = end;
        break;
      }

      case "Q": {
        const cp = { x: s(a[0]), y: s(a[1]) };
        const end = { x: s(a[2]), y: s(a[3]) };
        const points = linearizeQuadBezier(currentPoint, cp, end);
        currentSubpath.push(...points);
        lastControlPoint = cp;
        currentPoint = end;
        break;
      }

      case "T": {
        // Smooth quad - reflect last control point
        let cp: Point;
        if (lastCommand === "Q" || lastCommand === "T") {
          cp = {
            x: 2 * currentPoint.x - lastControlPoint.x,
            y: 2 * currentPoint.y - lastControlPoint.y,
          };
        } else {
          cp = { ...currentPoint };
        }
        const end = { x: s(a[0]), y: s(a[1]) };
        const points = linearizeQuadBezier(currentPoint, cp, end);
        currentSubpath.push(...points);
        lastControlPoint = cp;
        currentPoint = end;
        break;
      }

      case "A": {
        const rx = s(a[0]);
        const ry = s(a[1]);
        const xRot = a[2];
        const largeArc = a[3];
        const sweep = a[4];
        const end = { x: s(a[5]), y: s(a[6]) };
        const points = linearizeArc(currentPoint, rx, ry, xRot, largeArc, sweep, end);
        currentSubpath.push(...points);
        currentPoint = end;
        break;
      }

      case "Z":
      case "z":
        if (currentSubpath.length > 0) {
          // Close the path by returning to start
          currentSubpath.push({ ...startPoint });
          subpaths.push({ points: currentSubpath, closed: true });
          currentSubpath = [];
        }
        currentPoint = { ...startPoint };
        break;
    }

    lastCommand = c;
  }

  if (currentSubpath.length > 0) {
    subpaths.push({ points: currentSubpath, closed: false });
  }

  return subpaths;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ScribbleIcon({
  name,
  size = 24,
  color = "default",
  strokeWidth = 1.5,
  roughness = 1.2,
  bowing = 1,
  seed = 42,
  className,
}: ScribbleIconProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const iconDef = useMemo(() => getIconPath(name), [name]);
  const computedColor = useMemo(() => getColor(color), [color]);

  // Calculate scale factor from 24x24 viewBox to desired size
  const scale = useMemo(() => size / (iconDef?.viewBox ?? 24), [size, iconDef]);

  useEffect(() => {
    if (!svgRef.current || !iconDef) return;

    const svg = svgRef.current;
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const rc = rough.svg(svg);
    const subpaths = linearizeCommands(iconDef.commands, scale);

    // Draw each subpath with Rough.js
    subpaths.forEach((subpath, index) => {
      if (subpath.points.length < 2) return;

      const points: [number, number][] = subpath.points.map((p) => [p.x, p.y]);

      const element = rc.linearPath(points, {
        roughness,
        bowing,
        stroke: computedColor,
        strokeWidth,
        seed: seed + index,
        disableMultiStroke: false,
      });

      svg.appendChild(element);
    });
  }, [iconDef, scale, computedColor, strokeWidth, roughness, bowing, seed]);

  if (!iconDef) {
    console.warn(`ScribbleIcon: Unknown icon name "${name}"`);
    return null;
  }

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      style={{ overflow: "visible" }}
      aria-hidden="true"
    />
  );
}

// Re-export types for convenience
export type { IconName as ScribbleIconName } from "./icon-paths";
export { iconNames as scribbleIconNames } from "./icon-paths";
