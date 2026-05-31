#!/usr/bin/env node

/**
 * High-Quality Video Optimizer: MP4 to WebM
 * Tailored for Achmad Zaini (Zaynfolio)
 * 
 * This script runs FFmpeg to compress and convert MP4 video files into highly optimized,
 * lightweight WebM (VP9 + Opus) files suitable for fast, smooth web background video streaming.
 * 
 * Usage:
 *   node optimize-video.js <path-to-video.mp4> [output-name.webm]
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
\x1b[1m\x1b[36mZaynfolio Video Optimizer\x1b[0m
=========================
A utility to convert MP4 to highly optimized WebM (VP9/Opus) for high-performance web streams.

\x1b[1mUsage:\x1b[0m
  node optimize-video.js <input_file.mp4> [output_file.webm]

\x1b[1mExample:\x1b[0m
  node optimize-video.js public/video/hero.mp4
  node optimize-video.js showreel.mp4 public/video/showreel.webm
`);
  process.exit(0);
}

const inputPath = path.resolve(args[0]);
if (!fs.existsSync(inputPath)) {
  console.error(`\x1b[31mError: Input file does not exist at "${inputPath}"\x1b[0m`);
  process.exit(1);
}

// Generate output path if not specified
let outputPath = args[1] 
  ? path.resolve(args[1])
  : path.join(path.dirname(inputPath), path.basename(inputPath, path.extname(inputPath)) + '.webm');

// Ensure output has webm extension
if (path.extname(outputPath).toLowerCase() !== '.webm') {
  outputPath += '.webm';
}

console.log(`\n\x1b[32m✔ Input:\x1b[0m  ${inputPath}`);
console.log(`\x1b[32m✔ Output:\x1b[0m ${outputPath}`);
console.log(`\x1b[36mOptimizing using VP9 + Opus (High Efficiency & Web Optimized)...\x1b[0m\n`);

// ffmpeg arguments optimized for Web distribution:
// -crf 32: Excellent balance between file size and quality (lower is better, 30-35 is ideal for web)
// -b:v 0: Required when using constant quality (CRF) for VP9
// -row-mt 1: Enables row-based multi-threading for faster encoding
// -speed 3: Faster encoding speed while maintaining high quality
// -c:a libopus: Best quality audio compression for web
// -pix_fmt yuv420p: Wide compatibility across all modern web browsers
const ffmpegArgs = [
  '-i', inputPath,
  '-c:v', 'libvpx-vp9',
  '-crf', '32',
  '-b:v', '0',
  '-row-mt', '1',
  '-speed', '3',
  '-c:a', 'libopus',
  '-b:a', '96k',
  '-pix_fmt', 'yuv420p',
  '-y', // Overwrite output file if exists
  outputPath
];

const ffmpeg = spawn('ffmpeg', ffmpegArgs);

ffmpeg.stdout.on('data', (data) => {
  process.stdout.write(data.toString());
});

ffmpeg.stderr.on('data', (data) => {
  // FFmpeg outputs progress and logs to stderr
  const log = data.toString();
  // Filter out noisy frame logs and keep readable output
  if (log.includes('frame=') || log.includes('size=')) {
    process.stdout.write(`\r\x1b[33m[Encoding]\x1b[0m ${log.trim()}`);
  } else {
    // Show startup metadata
    if (log.startsWith('ffmpeg version') || log.includes('Configuration:')) return;
    if (log.includes('libavutil') || log.includes('built with')) return;
    console.log(log.trim());
  }
});

ffmpeg.on('close', (code) => {
  console.log('\n');
  if (code === 0) {
    const originalSize = (fs.statSync(inputPath).size / (1024 * 1024)).toFixed(2);
    const optimizedSize = (fs.statSync(outputPath).size / (1024 * 1024)).toFixed(2);
    const savings = ((1 - (optimizedSize / originalSize)) * 100).toFixed(1);

    console.log(`\x1b[32m\x1b[1m✔ Optimization Complete!\x1b[0m`);
    console.log(`  └─ Original Size:  ${originalSize} MB`);
    console.log(`  └─ Optimized Size: ${optimizedSize} MB (\x1b[36m-${savings}% smaller\x1b[0m)`);
    console.log(`\n\x1b[1mReady for direct web deployment!\x1b[0m`);
  } else {
    console.error(`\x1b[31mOptimization failed with exit code ${code}\x1b[0m`);
  }
});
