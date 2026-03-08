import { readFileSync } from "fs";
import path from "path";
import { generateAudio } from "./src/tts.js";
import { recordWalkthrough } from "./src/record.js";
import { mergeVideoAudio } from "./src/merge.js";

// Re-run all walkthroughs that had selector issues
const files = [
  "coach-02-schema.json",
  "coach-03-larare.json",
  "coach-04-statistik.json",
  "coach-05-meddelanden.json",
  "coach-06-kalender.json",
  "student-01-projekt.json",
  "student-02-ovningar.json",
  "student-05-meddelanden.json",
  "student-06-terminal.json",
];

console.log(`\n=== Re-running ${files.length} fixed walkthroughs ===\n`);

for (let i = 0; i < files.length; i++) {
  const file = files[i];
  const walkthroughPath = path.resolve("walkthroughs", file);
  const walkthrough = JSON.parse(readFileSync(walkthroughPath, "utf-8"));

  console.log(`\n[${i + 1}/${files.length}] ${file} → ${walkthrough.outputName}`);
  console.log("─".repeat(50));

  try {
    console.log("  [1/3] Generating audio...");
    const durations = await generateAudio(walkthrough);

    console.log("  [2/3] Recording...");
    await recordWalkthrough(walkthrough, durations);

    console.log("  [3/3] Merging...");
    await mergeVideoAudio(walkthrough, durations);

    console.log(`  Done: output/final/${walkthrough.outputName}.mp4`);
  } catch (e) {
    console.error(`  FAILED: ${e.message}`);
  }
}

console.log("\n=== All done! ===\n");
