import { readFileSync, readdirSync } from "fs";
import path from "path";
import { generateAudio } from "./src/tts.js";
import { recordWalkthrough } from "./src/record.js";
import { mergeVideoAudio } from "./src/merge.js";

const done = new Set(["coach-01-narvaro.json"]); // already completed

const files = readdirSync("walkthroughs")
  .filter((f) => f.endsWith(".json") && !done.has(f))
  .sort();

console.log(`\n=== Batch Pipeline: ${files.length} walkthroughs ===\n`);

for (let i = 0; i < files.length; i++) {
  const file = files[i];
  const walkthroughPath = path.resolve("walkthroughs", file);
  const walkthrough = JSON.parse(readFileSync(walkthroughPath, "utf-8"));

  console.log(`\n[${ i + 1}/${files.length}] ${file} → ${walkthrough.outputName}`);
  console.log("─".repeat(50));

  try {
    // TTS
    console.log("  [1/3] Generating audio...");
    const durations = await generateAudio(walkthrough);

    // Record
    console.log("  [2/3] Recording...");
    await recordWalkthrough(walkthrough, durations);

    // Merge
    console.log("  [3/3] Merging...");
    await mergeVideoAudio(walkthrough, durations);

    console.log(`  ✓ Done: output/final/${walkthrough.outputName}.mp4`);
  } catch (e) {
    console.error(`  ✗ FAILED: ${e.message}`);
  }
}

console.log("\n=== All done! ===\n");
