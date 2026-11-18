// Token Radar, radar-2: the program that turns the sealed snapshot into
// the ranked board, the dashboard's data, and the dossier the judge reads.
//
// What it does, in order:
//   - finds the snapshot (a --input path, else the sealed /input location,
//     else the kit's input/ folder beside this repository)
//   - scores every protocol with the model in lib/model.ts
//   - stops, writing nothing, if the board fails the gate's own checks
//   - writes board.json and data.js, copies the dashboard and the
//     screenshots into the output directory, and builds dossier.json
//     from what it just copied, so the dossier always matches the page
//
// Node 22, standard library only, erasable TypeScript: run it as
// `node main.ts`. The output directory comes from MAKEFUN_OUTPUT_DIR
// (a relative path is taken from the working directory); without it the
// sealed /output directory is used, which is where the grade reads.

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  boardIssue,
  buildRadar,
  dataScript,
  parseSnapshot,
} from "./lib/model.ts";
import { buildDossier } from "./vendor/makefun-board.ts";

/** The directory this file lives in: the repository root. */
const ROOT = dirname(fileURLToPath(import.meta.url));

/** The sealed snapshot's usual home in the grading sandbox. */
const SEALED_INPUT = "/input/snapshot.json";

/** The output directory the grade reads when nothing else is given. */
const SEALED_OUTPUT = "/output";

/** The dossier's text cap, in UTF-8 bytes, from the competition's gate. */
const DOSSIER_TEXT_BYTES = 65536;

/** The value of a `--name value` flag, or null when the flag is absent. */
function flag(argv: string[], name: string): string | null {
  const at = argv.indexOf(name);
  if (at < 0 || at + 1 >= argv.length) return null;
  return argv[at + 1]!;
}

/**
 * Where the snapshot comes from: --input wins, then the sealed path,
 * then the kit's input/ beside this repository. Failing that, it says
 * so instead of guessing at a file that is not there.
 */
function snapshotPath(argv: string[]): string {
  const given = flag(argv, "--input");
  if (given !== null) return given;
  if (existsSync(SEALED_INPUT)) return SEALED_INPUT;
  const beside = join(ROOT, "..", "input", "snapshot.json");
  if (existsSync(beside)) return beside;
  throw new Error(
    `no snapshot: pass --input <path>, or place it at ${SEALED_INPUT}`,
  );
}

/** Where the outputs go: MAKEFUN_OUTPUT_DIR wins, else the sealed directory. */
function outputDir(): string {
  const env = process.env.MAKEFUN_OUTPUT_DIR;
  return env !== undefined && env !== "" ? env : SEALED_OUTPUT;
}

/** Copy a directory tree, files only, creating each destination folder. */
function copyTree(from: string, to: string): void {
  mkdirSync(to, { recursive: true });
  for (const entry of readdirSync(from, { withFileTypes: true })) {
    const src = join(from, entry.name);
    const dst = join(to, entry.name);
    if (entry.isDirectory()) copyTree(src, dst);
    else if (entry.isFile()) copyFileSync(src, dst);
  }
}

/** The whole run: read, score, check, write, and say what it wrote. */
function run(): void {
  const argv = process.argv.slice(2);
  const input = snapshotPath(argv);
  const out = outputDir();
  const snapshot = parseSnapshot(readFileSync(input, "utf8"));
  const { board, radar } = buildRadar(snapshot);
  const problem = boardIssue(board, snapshot);
  if (problem !== null) throw new Error(`board refused: ${problem}`);

  mkdirSync(out, { recursive: true });
  copyTree(join(ROOT, "dashboard"), join(out, "dashboard"));
  copyTree(join(ROOT, "screenshots"), join(out, "screenshots"));
  writeFileSync(join(out, "board.json"), `${JSON.stringify({ rows: board })}\n`, "utf8");
  writeFileSync(join(out, "data.js"), dataScript(radar), "utf8");
  const dossier = buildDossier(out, { text_max_bytes: DOSSIER_TEXT_BYTES });
  writeFileSync(join(out, "dossier.json"), dossier);

  const top = board[0];
  console.log(
    `token-radar: ${board.length} rows from ${snapshot.protocols.length} protocols, ` +
      `watchlist ${snapshot.watchlist.length}/${snapshot.watchlist.length}, ` +
      `top ${top?.name ?? "?"} at $${top?.implied_value_usd ?? 0}, ` +
      `dossier ${dossier.length} bytes, wrote ${out}`,
  );
}

run();
