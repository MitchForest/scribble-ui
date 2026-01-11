#!/usr/bin/env node
/**
 * Lucide SVG → TypeScript Path Converter
 *
 * Reads SVG files from Lucide icons package and generates TypeScript code
 * with path definitions for use with Rough.js roughening.
 *
 * This mirrors the iOS pipeline in AppAssets/symbols/extract_paths.py
 *
 * Usage:
 *   node scripts/extract-lucide-paths.js
 *
 * Prerequisites:
 *   npm install lucide-static
 *   (or have node_modules/lucide-static available)
 *
 * Output:
 *   registry/icons/icon-paths.ts
 */

import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─────────────────────────────────────────────────────────────────────────────
// SVG Path Parser
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} PathCommand
 * @property {string} command
 * @property {number[]} args
 */

/**
 * Tokenize SVG path data string.
 * @param {string} d
 * @returns {string[]}
 */
function tokenizePath(d) {
  const pattern = /([MmZzLlHhVvCcSsQqTtAa])|(-?\d*\.?\d+(?:[eE][+-]?\d+)?)/g;
  const tokens = [];
  let match;
  while ((match = pattern.exec(d)) !== null) {
    if (match[0]) tokens.push(match[0]);
  }
  return tokens;
}

/**
 * Parse SVG path data string into commands.
 * @param {string} d
 * @returns {PathCommand[]}
 */
function parsePath(d) {
  const tokens = tokenizePath(d);
  const commands = [];

  const argCounts = {
    M: 2, m: 2, L: 2, l: 2,
    H: 1, h: 1, V: 1, v: 1,
    C: 6, c: 6, S: 4, s: 4,
    Q: 4, q: 4, T: 2, t: 2,
    A: 7, a: 7, Z: 0, z: 0,
  };

  let i = 0;
  let currentCommand = null;

  while (i < tokens.length) {
    const token = tokens[i];

    if (token in argCounts) {
      currentCommand = token;
      i++;

      if (argCounts[currentCommand] === 0) {
        commands.push({ command: currentCommand, args: [] });
        continue;
      }
    }

    if (currentCommand === null) {
      i++;
      continue;
    }

    const argCount = argCounts[currentCommand];
    const args = [];

    while (args.length < argCount && i < tokens.length) {
      if (tokens[i] in argCounts) break;
      const num = parseFloat(tokens[i]);
      if (isNaN(num)) break;
      args.push(num);
      i++;
    }

    if (args.length === argCount) {
      commands.push({ command: currentCommand, args });

      // After M/m, subsequent coordinate pairs are treated as L/l
      if (currentCommand === "M") currentCommand = "L";
      else if (currentCommand === "m") currentCommand = "l";
    }
  }

  return commands;
}

// ─────────────────────────────────────────────────────────────────────────────
// Path Normalization (convert to absolute coordinates)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert path commands to absolute coordinates.
 * @param {PathCommand[]} commands
 * @returns {PathCommand[]}
 */
function toAbsolute(commands) {
  const result = [];
  let currentX = 0;
  let currentY = 0;
  let startX = 0;
  let startY = 0;

  for (const cmd of commands) {
    const { command, args } = cmd;

    switch (command) {
      case "M":
        currentX = args[0];
        currentY = args[1];
        startX = currentX;
        startY = currentY;
        result.push({ command: "M", args: [currentX, currentY] });
        break;

      case "m":
        currentX += args[0];
        currentY += args[1];
        startX = currentX;
        startY = currentY;
        result.push({ command: "M", args: [currentX, currentY] });
        break;

      case "L":
        currentX = args[0];
        currentY = args[1];
        result.push({ command: "L", args: [currentX, currentY] });
        break;

      case "l":
        currentX += args[0];
        currentY += args[1];
        result.push({ command: "L", args: [currentX, currentY] });
        break;

      case "H":
        currentX = args[0];
        result.push({ command: "L", args: [currentX, currentY] });
        break;

      case "h":
        currentX += args[0];
        result.push({ command: "L", args: [currentX, currentY] });
        break;

      case "V":
        currentY = args[0];
        result.push({ command: "L", args: [currentX, currentY] });
        break;

      case "v":
        currentY += args[0];
        result.push({ command: "L", args: [currentX, currentY] });
        break;

      case "C":
        result.push({ command: "C", args: [...args] });
        currentX = args[4];
        currentY = args[5];
        break;

      case "c":
        result.push({
          command: "C",
          args: [
            currentX + args[0], currentY + args[1],
            currentX + args[2], currentY + args[3],
            currentX + args[4], currentY + args[5],
          ],
        });
        currentX += args[4];
        currentY += args[5];
        break;

      case "S":
        result.push({ command: "S", args: [...args] });
        currentX = args[2];
        currentY = args[3];
        break;

      case "s":
        result.push({
          command: "S",
          args: [
            currentX + args[0], currentY + args[1],
            currentX + args[2], currentY + args[3],
          ],
        });
        currentX += args[2];
        currentY += args[3];
        break;

      case "Q":
        result.push({ command: "Q", args: [...args] });
        currentX = args[2];
        currentY = args[3];
        break;

      case "q":
        result.push({
          command: "Q",
          args: [
            currentX + args[0], currentY + args[1],
            currentX + args[2], currentY + args[3],
          ],
        });
        currentX += args[2];
        currentY += args[3];
        break;

      case "T":
        result.push({ command: "T", args: [...args] });
        currentX = args[0];
        currentY = args[1];
        break;

      case "t":
        result.push({
          command: "T",
          args: [currentX + args[0], currentY + args[1]],
        });
        currentX += args[0];
        currentY += args[1];
        break;

      case "A":
        result.push({ command: "A", args: [...args] });
        currentX = args[5];
        currentY = args[6];
        break;

      case "a":
        result.push({
          command: "A",
          args: [
            args[0], args[1], args[2], args[3], args[4],
            currentX + args[5], currentY + args[6],
          ],
        });
        currentX += args[5];
        currentY += args[6];
        break;

      case "Z":
      case "z":
        result.push({ command: "Z", args: [] });
        currentX = startX;
        currentY = startY;
        break;
    }
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG Element Parser
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse simple SVG element to path commands (handles line, rect, circle, etc.)
 * @param {string} tagName
 * @param {Record<string, string>} attrs
 * @returns {PathCommand[]}
 */
function elementToPathCommands(tagName, attrs) {
  switch (tagName) {
    case "line": {
      const x1 = parseFloat(attrs.x1) || 0;
      const y1 = parseFloat(attrs.y1) || 0;
      const x2 = parseFloat(attrs.x2) || 0;
      const y2 = parseFloat(attrs.y2) || 0;
      return [
        { command: "M", args: [x1, y1] },
        { command: "L", args: [x2, y2] },
      ];
    }

    case "rect": {
      const x = parseFloat(attrs.x) || 0;
      const y = parseFloat(attrs.y) || 0;
      const w = parseFloat(attrs.width) || 0;
      const h = parseFloat(attrs.height) || 0;
      const rx = parseFloat(attrs.rx) || 0;
      const ry = parseFloat(attrs.ry) || rx;

      if (rx === 0 && ry === 0) {
        return [
          { command: "M", args: [x, y] },
          { command: "L", args: [x + w, y] },
          { command: "L", args: [x + w, y + h] },
          { command: "L", args: [x, y + h] },
          { command: "Z", args: [] },
        ];
      } else {
        // Rounded rectangle
        const r = Math.min(rx, w / 2, h / 2);
        return [
          { command: "M", args: [x + r, y] },
          { command: "L", args: [x + w - r, y] },
          { command: "A", args: [r, r, 0, 0, 1, x + w, y + r] },
          { command: "L", args: [x + w, y + h - r] },
          { command: "A", args: [r, r, 0, 0, 1, x + w - r, y + h] },
          { command: "L", args: [x + r, y + h] },
          { command: "A", args: [r, r, 0, 0, 1, x, y + h - r] },
          { command: "L", args: [x, y + r] },
          { command: "A", args: [r, r, 0, 0, 1, x + r, y] },
          { command: "Z", args: [] },
        ];
      }
    }

    case "circle": {
      const cx = parseFloat(attrs.cx) || 0;
      const cy = parseFloat(attrs.cy) || 0;
      const r = parseFloat(attrs.r) || 0;
      // Approximate circle with 4 arcs
      return [
        { command: "M", args: [cx + r, cy] },
        { command: "A", args: [r, r, 0, 0, 1, cx, cy + r] },
        { command: "A", args: [r, r, 0, 0, 1, cx - r, cy] },
        { command: "A", args: [r, r, 0, 0, 1, cx, cy - r] },
        { command: "A", args: [r, r, 0, 0, 1, cx + r, cy] },
        { command: "Z", args: [] },
      ];
    }

    case "ellipse": {
      const cx = parseFloat(attrs.cx) || 0;
      const cy = parseFloat(attrs.cy) || 0;
      const rx = parseFloat(attrs.rx) || 0;
      const ry = parseFloat(attrs.ry) || 0;
      return [
        { command: "M", args: [cx + rx, cy] },
        { command: "A", args: [rx, ry, 0, 0, 1, cx, cy + ry] },
        { command: "A", args: [rx, ry, 0, 0, 1, cx - rx, cy] },
        { command: "A", args: [rx, ry, 0, 0, 1, cx, cy - ry] },
        { command: "A", args: [rx, ry, 0, 0, 1, cx + rx, cy] },
        { command: "Z", args: [] },
      ];
    }

    case "polyline": {
      const points = (attrs.points || "").trim().split(/\s+|,/).map(parseFloat);
      const commands = [];
      for (let i = 0; i < points.length - 1; i += 2) {
        if (i === 0) {
          commands.push({ command: "M", args: [points[i], points[i + 1]] });
        } else {
          commands.push({ command: "L", args: [points[i], points[i + 1]] });
        }
      }
      return commands;
    }

    case "polygon": {
      const points = (attrs.points || "").trim().split(/\s+|,/).map(parseFloat);
      const commands = [];
      for (let i = 0; i < points.length - 1; i += 2) {
        if (i === 0) {
          commands.push({ command: "M", args: [points[i], points[i + 1]] });
        } else {
          commands.push({ command: "L", args: [points[i], points[i + 1]] });
        }
      }
      commands.push({ command: "Z", args: [] });
      return commands;
    }

    case "path": {
      const d = attrs.d || "";
      return toAbsolute(parsePath(d));
    }

    default:
      return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG File Parser (Simple regex-based for Lucide's consistent format)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract elements from SVG content.
 * @param {string} svgContent
 * @returns {Array<{tag: string, attrs: Record<string, string>}>}
 */
function extractSvgElements(svgContent) {
  const elements = [];
  
  // Match self-closing elements like <path d="..." /> or <line x1="..." />
  const elementRegex = /<(path|line|rect|circle|ellipse|polyline|polygon)\s+([^>]*?)\s*\/?>/gi;
  
  let match;
  while ((match = elementRegex.exec(svgContent)) !== null) {
    const tag = match[1].toLowerCase();
    const attrString = match[2];
    
    // Parse attributes
    const attrs = {};
    const attrRegex = /(\w+)=["']([^"']*)["']/g;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(attrString)) !== null) {
      attrs[attrMatch[1]] = attrMatch[2];
    }
    
    elements.push({ tag, attrs });
  }
  
  return elements;
}

// ─────────────────────────────────────────────────────────────────────────────
// TypeScript Code Generator
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert icon name to camelCase function name.
 * @param {string} name
 * @returns {string}
 */
function toCamelCase(name) {
  return name
    .split(/[-_]/)
    .map((part, i) => i === 0 ? part.toLowerCase() : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

/**
 * Format path commands as TypeScript array literal.
 * @param {PathCommand[]} commands
 * @returns {string}
 */
function formatCommands(commands) {
  if (commands.length === 0) return "[]";
  
  const lines = commands.map(cmd => {
    const args = cmd.args.map(n => Number(n.toFixed(3))).join(", ");
    return `    { c: "${cmd.command}", a: [${args}] }`;
  });
  
  return `[\n${lines.join(",\n")}\n  ]`;
}

/**
 * Generate TypeScript file content.
 * @param {Array<{name: string, camelName: string, commands: PathCommand[]}>} icons
 * @returns {string}
 */
function generateTypeScript(icons) {
  const lines = [
    "// ═══════════════════════════════════════════════════════════════════════════",
    "// ICON PATHS",
    "// ═══════════════════════════════════════════════════════════════════════════",
    "// Auto-generated from Lucide icon SVGs.",
    "// Do not edit manually - regenerate using scripts/extract-lucide-paths.js",
    "//",
    `// Generated: ${icons.length} icons`,
    "// Source: Lucide Icons (https://lucide.dev) - ISC License",
    "",
    "/**",
    " * Path command for SVG rendering.",
    " * c = command type (M, L, C, Q, A, Z, etc.)",
    " * a = arguments array",
    " */",
    "export interface PathCommand {",
    "  c: string;",
    "  a: number[];",
    "}",
    "",
    "/**",
    " * Icon definition with path commands.",
    " */",
    "export interface IconDefinition {",
    "  name: string;",
    "  viewBox: number;",
    "  commands: PathCommand[];",
    "}",
    "",
    "// ─────────────────────────────────────────────────────────────────────────────",
    "// Icon Paths Registry",
    "// ─────────────────────────────────────────────────────────────────────────────",
    "",
    "export const iconPaths: Record<string, IconDefinition> = {",
  ];

  for (const icon of icons) {
    lines.push(`  "${icon.name}": {`);
    lines.push(`    name: "${icon.name}",`);
    lines.push(`    viewBox: 24,`);
    lines.push(`    commands: ${formatCommands(icon.commands)},`);
    lines.push(`  },`);
  }

  lines.push("};");
  lines.push("");
  lines.push("/**");
  lines.push(" * Get icon path commands by name.");
  lines.push(" */");
  lines.push("export function getIconPath(name: string): IconDefinition | undefined {");
  lines.push("  return iconPaths[name];");
  lines.push("}");
  lines.push("");
  lines.push("/**");
  lines.push(" * All available icon names.");
  lines.push(" */");
  lines.push(`export type IconName = keyof typeof iconPaths;`);
  lines.push("");
  lines.push("/**");
  lines.push(" * List of all icon names.");
  lines.push(" */");
  lines.push("export const iconNames = Object.keys(iconPaths) as IconName[];");
  lines.push("");

  return lines.join("\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

// Icons to extract (commonly used subset - add more as needed)
const ICON_LIST = [
  // Navigation
  "home",
  "arrow-left",
  "arrow-right",
  "arrow-up",
  "arrow-down",
  "chevron-left",
  "chevron-right",
  "chevron-up",
  "chevron-down",
  "menu",
  
  // Actions
  "plus",
  "minus",
  "x",
  "check",
  "search",
  "refresh-cw",
  "edit",
  "trash-2",
  "copy",
  "download",
  "upload",
  "share",
  "external-link",
  "link",
  "unlink",
  
  // Media
  "play",
  "pause",
  "volume-2",
  "volume-x",
  "shuffle",
  
  // Users
  "user",
  "users",
  "user-plus",
  "log-out",
  
  // Communication
  "message-circle",
  "message-square",
  "mail",
  "bell",
  
  // UI Elements
  "settings",
  "sliders",
  "filter",
  "eye",
  "eye-off",
  "lock",
  "unlock",
  "info",
  "alert-circle",
  "alert-triangle",
  "help-circle",
  "check-circle",
  "x-circle",
  
  // Objects
  "star",
  "heart",
  "bookmark",
  "flag",
  "calendar",
  "clock",
  "folder",
  "file",
  "image",
  "camera",
  "smartphone",
  "tablet",
  "monitor",
  "sun",
  "moon",
  "cloud",
  "zap",
  "flame",
  "trophy",
  
  // Misc
  "lightbulb",
  "sparkles",
  "wand-2",
  "palette",
  "graduation-cap",
  "book-open",
  "pencil",
  "eraser",
  "hand",
  "pointer",
  "move",
  "grip-vertical",
  
  // Additional icons for scribble apps/web (hugeicons migration)
  "archive",
  "key",
  "credit-card",
  "qr-code",
  "bar-chart-2",
  "rotate-ccw",
  "loader-2",
  "file-text",
  "undo-2",
];

function main() {
  const scriptDir = __dirname;
  const repoRoot = join(scriptDir, "..");
  const outputPath = join(repoRoot, "registry", "icons", "icon-paths.ts");
  
  // Try to find lucide-static package
  const possiblePaths = [
    join(repoRoot, "node_modules", "lucide-static", "icons"),
    join(scriptDir, "..", "..", "scribble", "node_modules", "lucide-static", "icons"),
    join(scriptDir, "..", "node_modules", "lucide-static", "icons"),
  ];
  
  let iconsDir = null;
  for (const p of possiblePaths) {
    if (existsSync(p)) {
      iconsDir = p;
      break;
    }
  }
  
  if (!iconsDir) {
    console.error("Error: Could not find lucide-static package.");
    console.error("Please install it: npm install lucide-static");
    console.error("Searched paths:", possiblePaths);
    process.exit(1);
  }
  
  console.log(`Found Lucide icons at: ${iconsDir}`);
  console.log(`Processing ${ICON_LIST.length} icons...`);
  
  const icons = [];
  const missing = [];
  
  for (const iconName of ICON_LIST) {
    const svgPath = join(iconsDir, `${iconName}.svg`);
    
    if (!existsSync(svgPath)) {
      missing.push(iconName);
      continue;
    }
    
    const svgContent = readFileSync(svgPath, "utf-8");
    const elements = extractSvgElements(svgContent);
    
    // Combine all element paths
    let allCommands = [];
    for (const elem of elements) {
      const commands = elementToPathCommands(elem.tag, elem.attrs);
      allCommands = allCommands.concat(commands);
    }
    
    if (allCommands.length === 0) {
      console.warn(`  Warning: No paths extracted from ${iconName}`);
      continue;
    }
    
    icons.push({
      name: iconName,
      camelName: toCamelCase(iconName),
      commands: allCommands,
    });
    
    console.log(`  ✓ ${iconName} (${allCommands.length} commands)`);
  }
  
  if (missing.length > 0) {
    console.warn(`\nWarning: ${missing.length} icons not found:`, missing.join(", "));
  }
  
  console.log(`\nGenerating TypeScript for ${icons.length} icons...`);
  const tsCode = generateTypeScript(icons);
  
  writeFileSync(outputPath, tsCode);
  console.log(`✓ Written to ${outputPath}`);
}

main();
