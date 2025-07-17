# Todo Manager

A lightweight, web-based TODO manager with a clean UI, built using Quarkus for the backend and CodeMirror + vanilla JS for the frontend. Manage your todo files easily with features like custom highlighting (based on line start characters), file creation, search, icons, and drag-and-drop ordering.

---

## Features

- Browse and open multiple TODO files  
- Create new TODO files from the UI  
- Search text within all opened TODO files instantly  
- Assign icons to TODO files and update dynamically  
- Drag-and-drop to reorder TODO files  
- Persist opened files and settings on the backend  
- Clean and responsive interface with CodeMirror editor  
- Backend built with Quarkus (Java) and REST API  
- Simple deployment — single JAR file  

---

## Getting Started

### Prerequisites

- Java 17+ (or your compatible JDK)  
- Gradle (for building)

### Build

```bash
gradle quarkusBuild
```

### Run

```bash
cd build/quarkus-app
java -jar quarkus-run.jar
```

Or use the provided startup script in the scripts directory.

---

## Usage

- Start the server
- Open your browser at http://localhost:4711 (or a different port if you changed that in the application.properties file)
- Manage your TODO files on the left panel
- Use the search bar to find text across open TODOs
- Create new TODO files via the "+" button
- Drag and drop files to reorder your list
- Click the "open" button to add more TODOs from existing files
- Close files with the close "×" button that appears on hover

### Highlighting

Todo Manager includes smart syntax highlighting tailored specifically for your TODO files. It recognizes different line types and applies visual styles to make your TODOs easier to scan and understand:

- Headlines with 1 to 4 `#` prefixes (e.g., `# Heading`) are styled distinctly by level  
- Important lines starting with `! ` are highlighted for emphasis  
- Questions starting with `? ` receive special formatting
- Done tasks start with a `/ ` and are displayed in a less visible style
- Other line stylings are:
  - Comments: start with `// `
  - Struck: start with `/- `
  - Struck Comments: start with `//- `
  - Results (or answers): start with `> `

Everything that doesn't start with one of these is handled as an open TODO.

Based on the type of lines that are included, the icon of the file will change for a better overview.

This highlighting is powered by CodeMirror with custom logic in the frontend that parses each line using regex patterns and applies CSS classes accordingly.


