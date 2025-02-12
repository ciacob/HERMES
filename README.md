# HERMES

**HERMES** (*Handling & Evaluating Repository Maintenance, Enhancements & Synchronization*) is a simple tool for managing multiple Git repositories in a workspace.

⚠️ **This project is in its early stages. Expect frequent updates and improvements.**  

## Features
- Check if any Git repositories in a given workspace have **remote changes** that need to be pulled.
- Optionally, **automatically pull** updates with `--pull`.

## Installation
Once published on npm, you’ll be able to install it globally:
```sh
npm install -g hermes
```

## Usage
```
hermes <workspace-path> [--pull]
```

Where:
`<workspace-path>`: The folder containing multiple Git repositories.
`--pull`: (Optional) If provided, repositories that need updates will be pulled.

### Example:
```
hermes ~/projects --pull
```

This will check all repositories inside ~/projects and pull updates where needed.

## Roadmap
- Improve error handling
- Add more workspace-wide Git operations
- Interactive mode for easier control

## License
MIT