import { execSync } from "child_process";
import { readdirSync } from "fs";
import path from "path";

function findFF(tool) {
  // Try system PATH first
  try {
    execSync(`where ${tool}`, { stdio: "pipe" });
    return tool;
  } catch {}

  // Search winget install location
  const base = path.join(process.env.LOCALAPPDATA || "", "Microsoft", "WinGet", "Packages");
  try {
    const dirs = readdirSync(base).filter((d) => d.toLowerCase().includes("ffmpeg"));
    for (const dir of dirs) {
      const binDir = path.join(base, dir);
      const found = findExe(binDir, `${tool}.exe`);
      if (found) return found;
    }
  } catch {}

  throw new Error(`Could not find ${tool}. Install ffmpeg and ensure it's on PATH.`);
}

function findExe(dir, name) {
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const found = findExe(full, name);
        if (found) return found;
      } else if (entry.name.toLowerCase() === name.toLowerCase()) {
        return full;
      }
    }
  } catch {}
  return null;
}

export const FFMPEG = findFF("ffmpeg");
export const FFPROBE = findFF("ffprobe");

console.log(`[config] ffmpeg:  ${FFMPEG}`);
console.log(`[config] ffprobe: ${FFPROBE}`);
