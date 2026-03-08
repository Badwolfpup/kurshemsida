import { readFileSync } from "fs";
import path from "path";
import { generateAudio } from "./src/tts.js";
import { recordWalkthrough } from "./src/record.js";
import { mergeVideoAudio } from "./src/merge.js";

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const files = args.filter((a) => !a.startsWith("--"));

if (files.length === 0) {
  console.error("Usage: node pipeline.js <walkthrough.json> [--skip-tts] [--skip-record]");
  process.exit(1);
}

const walkthroughPath = path.resolve(files[0]);
console.log(`\n=== Video Pipeline ===`);
console.log(`Walkthrough: ${walkthroughPath}\n`);

const walkthrough = JSON.parse(readFileSync(walkthroughPath, "utf-8"));

// Step 1: TTS
let durations;
if (flags.has("--skip-tts")) {
  console.log("[1/3] TTS: skipped (--skip-tts)");
  const durPath = path.resolve(`output/audio/${walkthrough.outputName}-durations.json`);
  durations = JSON.parse(readFileSync(durPath, "utf-8"));
} else {
  console.log("[1/3] Generating audio...");
  durations = await generateAudio(walkthrough);
}

// Step 2: Record
if (flags.has("--skip-record")) {
  console.log("\n[2/3] Recording: skipped (--skip-record)");
} else {
  console.log("\n[2/3] Recording walkthrough...");
  await recordWalkthrough(walkthrough, durations);
}

// Step 3: Merge
console.log("\n[3/3] Merging audio + video...");
const finalPath = await mergeVideoAudio(walkthrough, durations);

console.log(`\n=== Done! ===`);
console.log(`Output: ${finalPath}\n`);
