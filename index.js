#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function parseArguments() {
  if (process.argv.length < 3 || process.argv.length > 5) {
    console.error("Usage: hermes <workspace-path> [--pull] [--stash]");
    process.exit(1);
  }

  const workspacePath = path.resolve(process.argv[2]);
  const options = {
    pull: process.argv.includes("--pull"),
    stash: process.argv.includes("--stash"),
  };

  return { workspacePath, options };
}

function validateWorkspace(workspacePath) {
  if (
    !fs.existsSync(workspacePath) ||
    !fs.lstatSync(workspacePath).isDirectory()
  ) {
    console.error("❌ Invalid workspace path:", workspacePath);
    process.exit(1);
  }
}

function findGitRepositories(workspacePath) {
  return fs.readdirSync(workspacePath).filter((dir) => {
    const gitPath = path.join(workspacePath, dir, ".git");
    return fs.existsSync(gitPath) && fs.lstatSync(gitPath).isDirectory();
  });
}

function checkRepositoryStatus(repoPath) {
  try {
    execSync(`git -C "${repoPath}" fetch`, { stdio: "ignore" });
    const status = execSync(`git -C "${repoPath}" status -sb`).toString();
    return status.includes("behind");
  } catch (error) {
    console.error(`⚠️ Error checking ${repoPath}:`, error.message);
    return false;
  }
}

function pullUpdates(repoPath, useStash) {
    try {
        // Check `git status --porcelain` to detect untracked files or conflicts
        const statusOutput = execSync(`git -C "${repoPath}" status --porcelain`).toString();

        const hasUntrackedFiles = statusOutput.split("\n").some(line => line.startsWith("??"));
        const hasConflicts = statusOutput.includes("U ") || statusOutput.includes("AA");

        if (useStash && !hasUntrackedFiles && !hasConflicts) {
            console.log(`💾 Stashing changes in ${repoPath}...`);
            execSync(`git -C "${repoPath}" stash`, { stdio: 'ignore' });
        } else if (useStash) {
            console.log(`⚠️ Skipping stash for ${repoPath}: Untracked files or conflicts detected.`);
        }

        console.log(`🔄 Pulling updates for ${repoPath}...`);
        execSync(`git -C "${repoPath}" pull --rebase`, { stdio: 'inherit' });

        if (useStash && !hasUntrackedFiles && !hasConflicts) {
            console.log(`📂 Restoring stashed changes in ${repoPath}...`);
            execSync(`git -C "${repoPath}" stash pop`, { stdio: 'inherit' });
        }

        console.log(`✅ Successfully pulled updates for ${repoPath}.\n`);
    } catch (error) {
        console.error(`❌ Failed to pull updates for ${repoPath}:`, error.message);
    }
}

function processRepositories(repos, workspacePath, options) {
  if (repos.length === 0) {
    console.log("🚫 No Git repositories found.");
    process.exit(0);
  }

  let updatesFound = false;

  repos.forEach((repo) => {
    const repoPath = path.join(workspacePath, repo); // ✅ workspacePath now correctly passed
    if (checkRepositoryStatus(repoPath)) {
      console.log(`📌 ${repo} is BEHIND the remote branch! Needs pull.`);
      updatesFound = true;

      if (options.pull) {
        pullUpdates(repoPath, options.stash);
      }
    } else {
        console.log(`✅ ${repo} is up to date.`);
    }
  });

  if (!updatesFound) {
    console.log("✅ All repositories are up to date.");
  }
}

// --- MAIN EXECUTION ---
const { workspacePath, options } = parseArguments();
validateWorkspace(workspacePath);
const repos = findGitRepositories(workspacePath);
processRepositories(repos, workspacePath, options);
