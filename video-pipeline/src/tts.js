import { execFileSync } from "child_process";
import { existsSync, writeFileSync } from "fs";
import path from "path";
import { FFPROBE } from "./config.js";

const VOICE = "sv-SE-SofieNeural";
const RATE = "+0%";

export async function generateAudio(walkthrough) {
  const { outputName, steps } = walkthrough;
  const durations = [];

  for (const step of steps) {
    const audioPath = path.resolve(`output/audio/${outputName}-step-${step.id}.mp3`);

    if (existsSync(audioPath)) {
      console.log(`  [tts] Skipping step ${step.id} (exists)`);
    } else {
      console.log(`  [tts] Generating step ${step.id}...`);
      execFileSync("python", [
        "-m", "edge_tts",
        "--voice", VOICE,
        "--rate", RATE,
        "--text", step.narration,
        "--write-media", audioPath,
      ], { stdio: "pipe" });
    }

    // Get duration via ffprobe
    const raw = execFileSync(FFPROBE, [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "csv=p=0",
      audioPath,
    ], { encoding: "utf-8" }).trim();
    const durationMs = Math.round(parseFloat(raw) * 1000);
    durations.push({ id: step.id, durationMs });
    console.log(`  [tts] Step ${step.id}: ${durationMs}ms`);
  }

  const durationsPath = path.resolve(`output/audio/${outputName}-durations.json`);
  writeFileSync(durationsPath, JSON.stringify(durations, null, 2));
  console.log(`  [tts] Durations saved`);

  return durations;
}
