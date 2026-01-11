#!/usr/bin/env node
/**
 * Build steps for this registry.
 *
 * Currently:
 * - Regenerate `registry/icons/icon-paths.ts` from lucide-static SVGs
 * - Validate registry.json references
 */

import { spawnSync } from "node:child_process"
import path from "node:path"
import process from "node:process"

import { validateRegistry } from "./validate-registry.js"

function run(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, {
    cwd: options.cwd ?? process.cwd(),
    stdio: "inherit",
    shell: false,
  })
  return result.status ?? 1
}

const rootDir = process.cwd()

// Regenerate icon paths (best-effort; will fail if lucide-static isn't installed).
const extractScript = path.join(rootDir, "scripts", "extract-lucide-paths.js")
const extractExit = run("node", [extractScript], { cwd: rootDir })
if (extractExit !== 0) {
  process.stderr.write("\nFailed to regenerate icon paths.\n")
  process.exit(extractExit)
}

const validation = validateRegistry({ rootDir })
if (!validation.ok) {
  process.stderr.write("\nregistry.json validation failed:\n")
  for (const err of validation.errors) process.stderr.write(`- ${err}\n`)
  process.exit(1)
}

process.stdout.write("Registry build complete.\n")

