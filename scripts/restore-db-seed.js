import fs from "fs/promises";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import db from "../config/dbConfig.js";
import { prepareDatabase } from "../services/bootstrap-data.js";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

function printUsage() {
  console.log(`
Usage:
  npm run restore:seed -- --input <path>

Options:
  --input <path>            Path to a generated seed export file.
  --help                    Show this help text.

Examples:
  npm run restore:seed -- --input data/seed-exports/20260509_db_export.cjs
`.trim());
}

function parseArgs(argv) {
  const options = {
    input: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help") {
      printUsage();
      process.exit(0);
    }

    if (arg === "--input") {
      options.input = argv[index + 1] || null;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!options.input) {
    throw new Error("--input is required.");
  }

  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const inputPath = path.resolve(repoRoot, options.input);

  await fs.access(inputPath);

  const seedModule = require(inputPath);
  if (typeof seedModule.seed !== "function") {
    throw new Error(`Seed file does not export a seed function: ${inputPath}`);
  }

  await prepareDatabase();
  await seedModule.seed(db);

  console.log(`Restored seed data from ${inputPath}`);
}

try {
  await main();
} catch (error) {
  console.error(`[restore-db-seed] ${error.message}`);
  process.exitCode = 1;
} finally {
  await db.destroy();
}
