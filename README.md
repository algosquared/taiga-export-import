# Taiga Import/Export

Electron app for exporting Taiga user stories and epics between projects.

## Downloads
Get macOS `.zip` or Windows `.exe` from:
https://github.com/algosquared/taiga-export-import/releases

## Usage
1. Download and run the app.
2. Log in with your Taiga credentials.
3. Select origin and destination projects.
4. Enter a user story ref or switch to epic mode.
5. Choose options and export.

## Notes
- You need owner access to both projects.
- Comments export requires attachments.
- Exports fail if referenced users are not members of the destination project.
- Credentials are used only to request a Taiga token; nothing is stored locally.

## Development
Requirements: Node.js and npm.

Install:
```
npm install
```

Run:
```
npm run electron:serve
```

Build:
```
npm run electron:build
```

Distribution builds:
```
npm run dist:mac
npm run dist:win
npm run dist:all
```

## License
MIT. See `LICENSE`.
