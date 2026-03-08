import { execSync } from "child_process";
import { writeFileSync, unlinkSync, existsSync } from "fs";
import path from "path";
import { FFMPEG } from "./config.js";

export async function mergeVideoAudio(walkthrough, durations) {
  const { outputName, steps } = walkthrough;
  const videoPath = path.resolve(`output/video/${outputName}.webm`);
  const finalPath = path.resolve(`output/final/${outputName}.mp4`);

  if (!existsSync(videoPath)) {
    throw new Error(`Video not found: ${videoPath}`);
  }

  // Build FFmpeg filter_complex to concatenate audio clips with silence gaps
  // Each step's audio starts at the cumulative offset
  const inputs = [];
  const filterParts = [];
  let currentTime = 0;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const dur = durations.find((d) => d.id === step.id);
    const audioDurationMs = dur ? dur.durationMs : 0;
    const pauseMs = step.pauseMs || 0;

    const audioFile = path.resolve(`output/audio/${outputName}-step-${step.id}.mp3`);
    inputs.push(`-i "${audioFile}"`);

    // Apply delay to position this clip at the right time
    // Input 0 is the video file, so audio inputs start at index 1
    const inputIdx = i + 1;
    filterParts.push(`[${inputIdx}:a]adelay=${currentTime}|${currentTime}[a${i}]`);

    // Move timeline forward by whichever is longer: audio or pause
    currentTime += Math.max(pauseMs, audioDurationMs);
  }

  // Mix all delayed audio streams together
  const mixInputs = steps.map((_, i) => `[a${i}]`).join("");
  const filterComplex = [
    ...filterParts,
    `${mixInputs}amix=inputs=${steps.length}:duration=longest[aout]`,
  ].join(";");

  // Build ffmpeg command
  const cmd = [
    `"${FFMPEG}"`,
    `-i "${videoPath}"`,
    ...inputs,
    `-filter_complex "${filterComplex}"`,
    `-map 0:v -map "[aout]"`,
    `-c:v libx264 -c:a aac -shortest`,
    `-y "${finalPath}"`,
  ].join(" ");

  console.log(`  [merge] Running FFmpeg...`);
  try {
    execSync(cmd, { stdio: "pipe", timeout: 120000 });
  } catch (e) {
    console.error(`  [merge] FFmpeg failed. Stderr:`, e.stderr?.toString());
    throw e;
  }

  console.log(`  [merge] Final video: ${finalPath}`);
  return finalPath;
}
