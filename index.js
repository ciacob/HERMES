#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

if (process.argv.length < 3 || process.argv.length > 4) {
  console.error("Usage: check-remote-updates <workspace-path> [--pull]");
  process.exit(1);
}

const WORKSPACE_DIR = path.resolve(process.argv[2]);
const SHOULD_PULL = process.argv[3] === "--pull";

if (
  !fs.existsSync(WORKSPACE_DIR) ||
  !fs.lstatSync(WORKSPACE_DIR).isDirectory()
) {
  console.error("❌ Invalid workspace path:", WORKSPACE_DIR);
  process.exit(1);
}

console.log(`🔍 Scanning Git repositories in: ${WORKSPACE_DIR}\n`);

const repos = fs.readdirSync(WORKSPACE_DIR).filter((dir) => {
  const gitPath = path.join(WORKSPACE_DIR, dir, ".git");
  return fs.existsSync(gitPath) && fs.lstatSync(gitPath).isDirectory();
});

if (repos.length === 0) {
  console.log("🚫 No Git repositories found.");
  process.exit(0);
}

let updatesFound = false;

repos.forEach((repo) => {
  const repoPath = path.join(WORKSPACE_DIR, repo);
  try {
    execSync(`git -C "${repoPath}" fetch`, { stdio: "ignore" });
    const status = execSync(`git -C "${repoPath}" status -sb`).toString();

    if (status.includes("behind")) {
      console.log(`📌 ${repo} is BEHIND the remote branch! Needs pull.`);

      updatesFound = true;

      if (SHOULD_PULL) {
        try {
          console.log(`🔄 Pulling updates for ${repo}...`);
          execSync(`git -C "${repoPath}" pull --rebase`, { stdio: "inherit" });
          console.log(`✅ Successfully pulled updates for ${repo}.\n`);
        } catch (pullError) {
          console.error(
            `❌ Failed to pull updates for ${repo}:`,
            pullError.message
          );
        }
      }
    }
  } catch (error) {
    console.error(`⚠️ Error checking ${repo}:`, error.message);
  }
});

if (!updatesFound) {
  console.log("✅ All repositories are up to date.");
}
