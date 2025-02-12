# HERMES

**HERMES** (*Handling & Evaluating Repository Maintenance, Enhancements & Synchronization*) is a simple tool for managing multiple Git repositories in a workspace.

⚠️ **This project is in its early stages. Expect frequent updates and improvements.**  

## Features
- Check if any Git repositories in a given workspace have **remote changes** that need to be pulled.
- Optionally, **automatically pull** updates with `--pull`.
- **Smart stashing with `--stash`** (Only if necessary).

## Installation
Once published on npm, you’ll be able to install it globally:
```sh
npm install -g hermes
```

## Usage
```
hermes <workspace-path> [--pull] [--stash]
```

Where:
- `<workspace-path>`: The folder containing multiple Git repositories.
- `--pull`: (Optional) If provided, repositories that need updates will be pulled.
- `--stash`: (Optional) If provided, local changes will be stashed before pulling and popped back after—but only if no untracked files or conflicts exist.

### Example:
```
hermes ~/projects --pull --stash
```

This will:
1. Check all repositories inside `~/projects`.
2. Pull updates for outdated repositories.
3. Stash local changes if safe, otherwise it will skip stashing and log a warning.

### Smart Stashing Behavior:
Will stash only if safe.
If untracked files or conflicts exist, it skips stashing and logs:
```
⚠️ Skipping stash for <repo>: Untracked files or conflicts detected.
```

## Roadmap
- Improve error handling
- Add more workspace-wide Git operations
- Interactive mode for easier control

## License
MIT