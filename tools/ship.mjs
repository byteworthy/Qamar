#!/usr/bin/env node
/**
 * Noor Ship Runner
 * Single-command verification before release
 * Node standard library only - no dependencies
 */

import { spawn } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import * as http from "node:http";

const ROOT = path.resolve(import.meta.dirname, "..");
const STORE_PACK = path.join(ROOT, "release", "STORE_PACK");
const REPORT_PATH = path.join(STORE_PACK, "SHIP_REPORT.json");
const PORT = 5000;
const SERVER_TIMEOUT = 15000;

// Platform-aware: Windows requires shell:true for .cmd files
const IS_WINDOWS = process.platform === "win32";
const NPM = "npm";
const NPX = "npx";

const report = {
  timestamp: new Date().toISOString(),
  nodeVersion: process.version,
  verifyTypesResult: null,
  verifyTestsResult: null,
  serverBootResult: null,
  healthResponse: { headers: null, body: null, requestId: null },
  notFoundResponse: { headers: null, body: null, requestId: null },
  storePackFilesCheck: { passed: false, missing: [], found: [] },
  metadataLimitsCheck: { passed: false, issues: [], values: {} },
  screenshotCheck: {
    folderExists: false,
    pngCount: 0,
    uniqueCount: 0,
    skipped: true,
    skipReason: null,
    files: [],
  },
  warnings: [],
  overallPass: false,
};

function log(msg) {
  console.log(`[ship] ${msg}`);
}

function fail(msg) {
  console.error(`[ship] ERROR: ${msg}`);
  report.overallPass = false;
  writeReport();
  process.exit(1);
}

function writeReport() {
  // Ensure directory exists using Node fs
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
  log(`Report written to ${REPORT_PATH}`);
}

function runCmd(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, {
      shell: IS_WINDOWS,
      stdio: opts.silent ? "pipe" : "inherit",
      cwd: ROOT,
      ...opts,
    });
    let stdout = "";
    let stderr = "";
    if (opts.silent) {
      proc.stdout?.on("data", (d) => {
        stdout += d.toString();
      });
      proc.stderr?.on("data", (d) => {
        stderr += d.toString();
      });
    }
    proc.on("close", (code) => {
      if (code === 0) resolve({ code, stdout, stderr });
      else
        reject(
          new Error(
            `Command ${cmd} ${args.join(" ")} exited with code ${code}`,
          ),
        );
    });
    proc.on("error", reject);
  });
}

async function runVerify() {
  log("Running type check...");
  try {
    await runCmd(NPM, ["run", "check:types"]);
    report.verifyTypesResult = "passed";
    log("Type check passed.");
  } catch (e) {
    report.verifyTypesResult = "failed";
    fail("Type check failed.");
  }

  log("Running tests...");
  try {
    await runCmd(NPM, ["test", "--", "--watchAll=false"]);
    report.verifyTestsResult = "passed";
    log("Tests passed.");
  } catch (e) {
    report.verifyTestsResult = "failed";
    fail("Tests failed.");
  }
}

function httpGet(urlPath) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "localhost",
        port: PORT,
        path: urlPath,
        method: "GET",
      },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          resolve({ statusCode: res.statusCode, headers: res.headers, body });
        });
      },
    );
    req.on("error", reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error("timeout"));
    });
    req.end();
  });
}

async function waitForServer() {
  const start = Date.now();
  while (Date.now() - start < SERVER_TIMEOUT) {
    try {
      await httpGet("/health");
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  return false;
}

async function runServerChecks() {
  log("Starting server in validation mode...");

  const env = {
    ...process.env,
    VALIDATION_MODE: "true",
    AI_INTEGRATIONS_OPENAI_API_KEY: "sk-placeholder",
    PORT: String(PORT),
  };

  const serverProc = spawn(NPX, ["tsx", "server/index.ts"], {
    shell: IS_WINDOWS,
    stdio: "inherit",
    cwd: ROOT,
    env,
  });

  let serverExited = false;
  serverProc.on("exit", () => {
    serverExited = true;
  });

  const cleanup = () => {
    if (!serverExited) {
      serverProc.kill();
    }
  };

  try {
    log("Waiting for server readiness...");
    const ready = await waitForServer();
    if (!ready) {
      report.serverBootResult = "timeout";
      cleanup();
      fail("Server did not become ready within 15 seconds.");
    }
    report.serverBootResult = "ready";
    log("Server is ready.");

    // GET /health
    log("Checking /health...");
    const healthRes = await httpGet("/health");
    report.healthResponse.headers = healthRes.headers;
    report.healthResponse.body = healthRes.body;
    report.healthResponse.requestId = healthRes.headers["x-request-id"] || null;

    // GET /api/nonexistent
    log("Checking /api/nonexistent (expect 404)...");
    const notFoundRes = await httpGet("/api/nonexistent");
    report.notFoundResponse.headers = notFoundRes.headers;
    report.notFoundResponse.body = notFoundRes.body;
    report.notFoundResponse.requestId =
      notFoundRes.headers["x-request-id"] || null;

    // Assertions
    if (!report.healthResponse.requestId) {
      cleanup();
      fail("/health response missing X-Request-ID header.");
    }
    if (!report.notFoundResponse.requestId) {
      cleanup();
      fail("/api/nonexistent response missing X-Request-ID header.");
    }

    let notFoundJson;
    try {
      notFoundJson = JSON.parse(notFoundRes.body);
    } catch {
      cleanup();
      fail(
        `/api/nonexistent returned non-JSON. First 200 chars: ${notFoundRes.body.slice(0, 200)}`,
      );
    }

    if (notFoundJson.requestId !== report.notFoundResponse.requestId) {
      cleanup();
      fail(
        `/api/nonexistent JSON requestId (${notFoundJson.requestId}) does not match header (${report.notFoundResponse.requestId}).`,
      );
    }

    log("Server checks passed.");
  } finally {
    cleanup();
    // Give it a moment to shut down
    await new Promise((r) => setTimeout(r, 500));
  }
}

function checkStorePackFiles() {
  log("Checking required STORE_PACK files...");
  const required = [
    "APP_STORE_DESCRIPTION_FINAL.md",
    "APP_STORE_REVIEW_NOTES.md",
    "APP_STORE_CONNECT_FIELDS.md",
    "UPLOAD_ORDER_CHECKLIST.md",
    "FINAL_SUBMISSION_CHECKLIST.md",
    "SCREENSHOT_CAPTIONS.md",
    "LEGAL_URLS.md",
    "privacy-policy.md",
    "terms-of-service.md",
  ];

  for (const f of required) {
    const fp = path.join(STORE_PACK, f);
    if (fs.existsSync(fp)) {
      report.storePackFilesCheck.found.push(f);
    } else {
      report.storePackFilesCheck.missing.push(f);
    }
  }

  if (report.storePackFilesCheck.missing.length > 0) {
    report.storePackFilesCheck.passed = false;
    fail(
      `Missing STORE_PACK files: ${report.storePackFilesCheck.missing.join(", ")}`,
    );
  }
  report.storePackFilesCheck.passed = true;
  log("All required STORE_PACK files present.");
}

function parseFieldValue(content, sectionHeader) {
  // Match section like "## B. Subtitle (30 characters max)" then find triple-backtick block
  const headerPattern = new RegExp(`##\\s*[A-Z]\\.\\s*${sectionHeader}`, "i");
  const headerMatch = content.match(headerPattern);
  if (!headerMatch) return null;

  const afterHeader = content.slice(headerMatch.index);
  const codeBlockMatch = afterHeader.match(/```\r?\n([\s\S]*?)\r?\n```/);
  return codeBlockMatch ? codeBlockMatch[1].trim() : null;
}

function checkMetadataLimits() {
  log("Checking metadata character limits...");
  const fieldsPath = path.join(STORE_PACK, "APP_STORE_CONNECT_FIELDS.md");
  if (!fs.existsSync(fieldsPath)) {
    report.warnings.push(
      "APP_STORE_CONNECT_FIELDS.md not found for limit check.",
    );
    report.metadataLimitsCheck.passed = false;
    return;
  }

  let content = fs.readFileSync(fieldsPath, "utf8");

  // Fix known encoding artifacts (replace with ASCII equivalents for safety)
  // These patterns match UTF-8 bytes misinterpreted as Windows-1252
  const originalContent = content;
  content = content
    .replace(/\xE2\x80\xA2/g, "-") // bullet •
    .replace(/\xE2\x80\x94/g, "-") // em dash —
    .replace(/\xE2\x80\x99/g, "'") // right single quote '
    .replace(/\xE2\x80\x9C/g, '"') // left double quote "
    .replace(/\xE2\x80\x9D/g, '"'); // right double quote "

  if (content !== originalContent) {
    fs.writeFileSync(fieldsPath, content, "utf8");
    log("Fixed encoding artifacts in APP_STORE_CONNECT_FIELDS.md");
    report.warnings.push(
      "Fixed encoding artifacts in APP_STORE_CONNECT_FIELDS.md",
    );
  }

  const limits = {
    Subtitle: 30,
    "Promotional Text": 170,
    Keywords: 100,
  };

  for (const [name, max] of Object.entries(limits)) {
    const val = parseFieldValue(content, name);
    if (val === null) {
      report.warnings.push(
        `Could not parse ${name} from APP_STORE_CONNECT_FIELDS.md`,
      );
      continue;
    }
    report.metadataLimitsCheck.values[name] = {
      value: val,
      length: val.length,
      limit: max,
    };
    if (val.length > max) {
      report.metadataLimitsCheck.issues.push(
        `${name} exceeds limit: ${val.length}/${max}`,
      );
    }
  }

  if (report.metadataLimitsCheck.issues.length > 0) {
    report.metadataLimitsCheck.passed = false;
    fail(
      `Metadata limit violations: ${report.metadataLimitsCheck.issues.join("; ")}`,
    );
  }
  report.metadataLimitsCheck.passed = true;
  log("Metadata character limits OK.");
}

function checkScreenshots() {
  log("Checking screenshots...");
  const screenshotDir = path.join(STORE_PACK, "screenshots");

  // Check if folder exists
  if (!fs.existsSync(screenshotDir)) {
    report.screenshotCheck.folderExists = false;
    report.screenshotCheck.skipped = true;
    report.screenshotCheck.skipReason = "Screenshots directory does not exist";
    log("Screenshots directory does not exist, skipping.");
    return;
  }

  report.screenshotCheck.folderExists = true;

  // Get all files in directory
  const allFiles = fs.readdirSync(screenshotDir);
  const pngFiles = allFiles.filter((f) => f.toLowerCase().endsWith(".png"));

  report.screenshotCheck.files = pngFiles;
  report.screenshotCheck.pngCount = pngFiles.length;

  // Check for unique filenames (case-insensitive)
  const lowerNames = pngFiles.map((f) => f.toLowerCase());
  const uniqueNames = new Set(lowerNames);
  report.screenshotCheck.uniqueCount = uniqueNames.size;

  if (pngFiles.length === 0) {
    report.screenshotCheck.skipped = true;
    report.screenshotCheck.skipReason =
      "Folder exists but contains no PNG files";
    log("No PNG screenshots found, treated as skipped.");
    return;
  }

  // Check for duplicates
  if (uniqueNames.size !== pngFiles.length) {
    report.screenshotCheck.skipped = false;
    fail(
      `Screenshot filenames are not unique: ${pngFiles.length} files, ${uniqueNames.size} unique`,
    );
    return;
  }

  // Check minimum count
  if (pngFiles.length < 4) {
    report.screenshotCheck.skipped = false;
    report.warnings.push(
      `Only ${pngFiles.length} PNG screenshots found (expected at least 4).`,
    );
    log(`Warning: Only ${pngFiles.length} PNG screenshots found.`);
    return;
  }

  report.screenshotCheck.skipped = false;
  report.screenshotCheck.skipReason = null;
  log(`Found ${pngFiles.length} PNG screenshots.`);
}

async function main() {
  try {
    await runVerify();
    await runServerChecks();
    checkStorePackFiles();
    checkMetadataLimits();
    checkScreenshots();

    report.overallPass = true;
    writeReport();
    log("Ship verification PASSED.");
    process.exit(0);
  } catch (e) {
    console.error(e);
    report.overallPass = false;
    writeReport();
    process.exit(1);
  }
}

main();
