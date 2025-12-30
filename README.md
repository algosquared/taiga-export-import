# Taiga Import/Export

Electron app for exporting Taiga user stories and epics between projects.

## Downloads
Prebuilt binaries are published on GitHub Releases:
https://github.com/algosquared/taiga-export-import/releases

## Features
- Export a user story by reference number or export all user stories from an epic.
- Optional copying of assigned users, watchers, description, status, tags, comments, attachments, points, epics, and tasks.
- Member verification to prevent assigning users who are not in the destination project.
- Attachment re-upload and comment URL rewrite where possible.

## Requirements
- Node.js and Yarn.
- Taiga account with owner access to both source and destination projects.

## Install
```
yarn install
```

## Run (development)
```
yarn electron:serve
```

## Build
```
yarn electron:build
```

## Distribution builds
Artifacts are written to `dist_electron/`.

Build for macOS:
```
yarn dist:mac
```

Build for Windows:
```
yarn dist:win
```

Build for macOS + Windows:
```
yarn dist:all
```

Notes:
- Building Windows binaries on macOS requires Wine; otherwise, run the Windows build on a Windows machine.
- macOS builds are unsigned unless you configure code signing and notarization.

## Usage
1. Log in with your Taiga credentials.
2. Select origin and destination projects.
3. Enter a user story reference or switch to epic mode.
4. Pick export options and start the export.

## Configuration
The Taiga API base URL is defined in `src/store/index.js`. Update it if you use a self-hosted Taiga instance.

## Notes
- Comments export requires attachments to be enabled.
- Exports will fail if referenced users are not members of the destination project.

## License
MIT. See `LICENSE`.
