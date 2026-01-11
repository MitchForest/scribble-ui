#!/usr/bin/env node
/**
 * Validate `registry.json` matches the on-disk `registry/` files.
 *
 * This repo is primarily a shadcn registry; validation here is about ensuring
 * the registry is internally consistent and publishable/servable.
 */

import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import process from "node:process"
import { pathToFileURL } from "node:url"

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function normalizeRegistryDepName(dep) {
  const prefix = "@scribble-ui/"
  if (typeof dep !== "string") return undefined
  if (!dep.startsWith(prefix)) return undefined
  return dep.slice(prefix.length)
}

export function validateRegistry(options) {
  const rootDir = options?.rootDir ?? process.cwd()
  const registryJsonPath = path.join(rootDir, "registry.json")

  if (!existsSync(registryJsonPath)) {
    return {
      ok: false,
      errors: [`Missing registry.json at ${registryJsonPath}`],
    }
  }

  let raw
  try {
    raw = JSON.parse(readFileSync(registryJsonPath, "utf8"))
  } catch (e) {
    return {
      ok: false,
      errors: [`Invalid JSON in registry.json: ${e instanceof Error ? e.message : String(e)}`],
    }
  }

  if (!isRecord(raw)) {
    return { ok: false, errors: ["registry.json must be a JSON object at the top level"] }
  }

  const items = raw.items
  if (!Array.isArray(items)) {
    return { ok: false, errors: ["registry.json must include an `items` array"] }
  }

  const itemNames = new Set()
  const errors = []
  const filePaths = new Set()

  for (const [idx, item] of items.entries()) {
    if (!isRecord(item)) {
      errors.push(`items[${idx}] must be an object`)
      continue
    }

    const name = item.name
    if (typeof name !== "string" || name.trim() === "") {
      errors.push(`items[${idx}].name must be a non-empty string`)
    } else {
      if (itemNames.has(name)) errors.push(`Duplicate item name: ${name}`)
      itemNames.add(name)
    }

    const files = item.files
    if (!Array.isArray(files) || files.length === 0) {
      errors.push(`items[${idx}].files must be a non-empty array`)
      continue
    }

    for (const [fIdx, file] of files.entries()) {
      if (!isRecord(file) || typeof file.path !== "string") {
        errors.push(`items[${idx}].files[${fIdx}] must be an object with a string \`path\``)
        continue
      }

      const rel = file.path
      const abs = path.resolve(rootDir, rel)

      // Prevent path traversal / accidental escapes.
      const rootResolved = path.resolve(rootDir) + path.sep
      if (!abs.startsWith(rootResolved)) {
        errors.push(`items[${idx}].files[${fIdx}].path escapes repo root: ${rel}`)
        continue
      }

      if (!existsSync(abs)) {
        errors.push(`Missing file referenced by registry.json: ${rel}`)
        continue
      }

      filePaths.add(rel)
    }

    const registryDeps = item.registryDependencies
    if (registryDeps !== undefined) {
      if (!Array.isArray(registryDeps)) {
        errors.push(`items[${idx}].registryDependencies must be an array of strings`)
      } else {
        for (const dep of registryDeps) {
          const depName = normalizeRegistryDepName(dep)
          if (!depName) continue
          if (!itemNames.has(depName)) {
            // Can't validate forward references without a second pass, so we track these and check later.
          }
        }
      }
    }
  }

  // Second pass for registryDependencies now that we have all names.
  for (const [idx, item] of items.entries()) {
    if (!isRecord(item) || !Array.isArray(item.registryDependencies)) continue
    for (const dep of item.registryDependencies) {
      const depName = normalizeRegistryDepName(dep)
      if (!depName) continue
      if (!itemNames.has(depName)) {
        errors.push(`items[${idx}].registryDependencies references unknown item: ${dep}`)
      }
    }
  }

  return { ok: errors.length === 0, errors }
}

function isMain() {
  const thisUrl = import.meta.url
  const argv1 = process.argv[1]
  if (!argv1) return false
  return thisUrl === pathToFileURL(path.resolve(argv1)).href
}

if (isMain()) {
  const result = validateRegistry({ rootDir: process.cwd() })
  if (result.ok) {
    process.stdout.write("registry.json is valid\n")
    process.exit(0)
  }
  for (const err of result.errors) {
    process.stderr.write(`- ${err}\n`)
  }
  process.exit(1)
}

