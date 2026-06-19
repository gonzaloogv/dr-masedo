import { readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { TextDecoder } from "node:util";
import { describe, expect, it } from "vitest";

const TEXT_EXTENSIONS = new Set([
  ".css",
  ".html",
  ".json",
  ".md",
  ".ts",
  ".tsx",
  ".txt",
  ".xml",
]);

const ROOT_FILES = [".editorconfig", ".gitignore", "index.html", "README.md"];
const ROOT_DIRS = ["public", "src"];
const IGNORED_DIRS = new Set(["dist", "node_modules"]);
const MOJIBAKE_MARKERS = new Set([0x00c2, 0x00c3, 0x00e2, 0xfffd]);

function collectTextFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      return IGNORED_DIRS.has(entry.name) ? [] : collectTextFiles(fullPath);
    }
    return TEXT_EXTENSIONS.has(extname(entry.name)) ? [fullPath] : [];
  });
}

function hasMojibakeMarker(value: string) {
  for (let index = 0; index < value.length; index++) {
    const codepoint = value.codePointAt(index);
    if (codepoint && MOJIBAKE_MARKERS.has(codepoint)) return true;
    if (codepoint && codepoint > 0xffff) index++;
  }
  return false;
}

describe("source encoding", () => {
  it("keeps project text files valid UTF-8 without mojibake markers", () => {
    const decoder = new TextDecoder("utf-8", { fatal: true });
    const files = [
      ...ROOT_DIRS.flatMap(collectTextFiles),
      ...ROOT_FILES,
    ];

    const failures = files.flatMap((file) => {
      try {
        const text = decoder.decode(readFileSync(file));
        return hasMojibakeMarker(text) ? [`${file}: mojibake marker found`] : [];
      } catch {
        return [`${file}: invalid UTF-8 bytes`];
      }
    });

    expect(failures).toEqual([]);
  });
});
