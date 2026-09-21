# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

A single-user, self-hosted TODO editor. Quarkus REST backend serving plain `.todo`
text files from a directory on disk, plus a vanilla-JS frontend built around
CodeMirror 5. No database, no build step for the frontend, no framework.

## Build & run

```bash
gradle quarkusBuild                      # build
gradle quarkusDev                        # dev mode, live reload, port 4711
gradle test                              # JUnit 5 tests
cd build/quarkus-app && java -jar quarkus-run.jar
```

`scripts/start-server.sh` / `scripts/stop-server.sh` wrap the production start.
The app listens on `http://localhost:4711`.

Frontend files are static resources under `src/main/resources/META-INF/resources/`
and are served directly — a browser reload is enough in dev mode, no rebuild.

## Configuration

`src/main/resources/application.properties` holds the defaults. In production the
values are overridden by `build/quarkus-app/config/application.properties`
(not in git).

- `todos.path` — directory holding the `.todo` files. Settings live in
  `<todos.path>/.settings/todo-settings.json`.
- `application.version` — shown in the settings modal; bump it on release.
- `todo.auth.password` — empty disables authentication entirely.

## Architecture

**Backend** (`src/main/java/net/tfassbender/todo/`)

- `rest/TodoResource` — the whole API under `/todos`: list, read, create,
  update (`PUT`, body is `text/plain`), open/close, reorder, version.
- `rest/AuthenticationResource` + `AuthenticationFilter` — password in a cookie,
  checked on every request unless `todo.auth.password` is blank.
- `service/TodoService` — file I/O. A todo's *filename* never carries the
  `.todo` extension anywhere in the API or the frontend; the service adds it.
- `service/SettingsService` — caches `TodoSettingsDto` in memory, writes it back
  on every mutation. Only persists which files are open and their order.
- `analyzer/TodoFileAnalyzer` — classifies each line by prefix and picks the file
  icon (important > question > todo > done). Pure static utility, unit tested.
- `startup/TodoStartupInitializer` — creates directories, drops opened files that
  no longer exist.

**Frontend** (`src/main/resources/META-INF/resources/`)

Four plain scripts sharing globals, loaded in order and with no module system:

- `code_mirror_editor.js` — creates the CodeMirror instance, exposes it as
  `window.cm` / `editor`, owns `toggleLinePrefix()` and `addHighlighting()`,
  and auto-saves on change through a 300 ms debounce.
- `file_handling.js` — `openedFiles` / `currentFile` state, load, select, close,
  save, drag-and-drop ordering (SortableJS). Runs `loadFileList()` at load time.
- `functions.js` — modals, settings, sidebar collapse, toolbar buttons. All DOM
  wiring happens in one `DOMContentLoaded` handler.
- `search.js` — client-side search over the cached content of opened files.

CodeMirror, Font Awesome and SortableJS come from CDNs in `index.html`.

## Todo file format

Line type is decided by the line's prefix, and the same rules are implemented
**twice** — in `TodoFileAnalyzer.determineLineType()` (Java, for the icon) and in
`addHighlighting()` (JS, for editor styling). Change one, change the other.

| Prefix | Meaning |
|--------|---------|
| `# ` … `#### ` | headlines, levels 1–4 |
| `! ` | important |
| `? ` | question |
| `/ ` | done |
| `// ` | comment |
| `/- ` | struck |
| `//- ` | struck comment |
| `> ` | result / answer |
| anything else | open todo |

Styling for these lives in `editor_highlighting.css`; everything else is in
`styles.css`.

## Conventions

- Java 17, two-space indent, `settings/java_format.xml` is the IntelliJ profile.
- DTOs are public-field classes serialized by Jackson — keep them that way,
  records would change the JSON contract handling.
- Errors go back as `ErrorResponseDto` with an `errorMessage` field; the frontend
  reads that field in `parseJsonResponse()` and shows the error modal.
- Escape filenames in CSS selectors with `CSS.escape()` — they may contain spaces.
- Tests: JUnit 5. Only `TodoFileAnalyzerTest` exists so far.

## Gotchas

- Saving is implicit. Every editor change triggers a `PUT` after 300 ms; there is
  no save button and `Ctrl-S` is deliberately a no-op.
- The `PUT /todos/{filename}` response carries the recomputed icon — the frontend
  relies on that to refresh the sidebar icon.
- `styles.css` currently has **no media queries and no viewport meta tag**; the
  layout assumes a desktop-sized window.
