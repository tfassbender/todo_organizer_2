const editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
  mode: 'markdown',
  theme: 'dracula',
  lineNumbers: true,
  lineWrapping: true,
  keyMap: 'sublime',
  extraKeys: {
    'Ctrl-S': function(cm) {
      const content = cm.getValue();
      const cursor = cm.getCursor();
      alert('Ctrl+S pressed!\n\nContent:\n' + content + '\n\nCursor at line ' + cursor.line);
    },
    'Ctrl-D': function(cm) {
      const line = cm.getCursor().line;
      cm.replaceRange("", { line, ch: 0 }, { line: line + 1, ch: 0 });
    },
    'Ctrl-Alt-D': function(cm) {
      toggleLinePrefix(cm, '/ ');
      return true; // Prevent default behavior
    },
    'Ctrl-Alt-C': function(cm) {
      toggleLinePrefix(cm, '// ');
      return true; // Prevent default behavior
    },
    'Ctrl-Alt-I': function(cm) {
      toggleLinePrefix(cm, '! ');
      return true; // Prevent default behavior
    },
    'Ctrl-Alt-A': function(cm) {
      toggleLinePrefix(cm, '? ');
      return true; // Prevent default behavior
    },
    'Ctrl-Alt-S': function(cm) {
      toggleLinePrefix(cm, '/- ');
      return true; // Prevent default behavior
    },
    'Ctrl-Alt-1': function(cm) {
      toggleLinePrefix(cm, '# ');
      return true; // Prevent default behavior
    },
    'Ctrl-Alt-2': function(cm) {
      toggleLinePrefix(cm, '## ');
      return true; // Prevent default behavior
    },
    'Ctrl-Alt-3': function(cm) {
      toggleLinePrefix(cm, '### ');
      return true; // Prevent default behavior
    },
    'Ctrl-Alt-4': function(cm) {
      toggleLinePrefix(cm, '#### ');
      return true; // Prevent default behavior
    },
  }
});

function addHighlighting() {
  const totalLines = editor.lineCount();

  for (let i = 0; i < totalLines; i++) {
    const line = editor.getLine(i);
    const trimmed = line.trim();

    // Remove all previously applied custom line classes
    editor.removeLineClass(i, "wrap", null);

    // Headings
    if (/^#### /.test(line)) {
      editor.addLineClass(i, "wrap", "line-headline-4");
    } else if (/^### /.test(line)) {
      editor.addLineClass(i, "wrap", "line-headline-3");
    } else if (/^## /.test(line)) {
      editor.addLineClass(i, "wrap", "line-headline-2");
    } else if (/^# /.test(line)) {
      editor.addLineClass(i, "wrap", "line-headline-1");
    }

    // Other prefixes (ignore leading whitespace)
    else if (/^\s*!/.test(line)) {
      editor.addLineClass(i, "wrap", "line-important");
    } else if (/^\s*\?/.test(line)) {
      editor.addLineClass(i, "wrap", "line-question");
    } else if (/^\s*\/\/\-/.test(line)) {
      editor.addLineClass(i, "wrap", "line-struck-comment");
    } else if (/^\s*\/\/ /.test(line)) {
      editor.addLineClass(i, "wrap", "line-comment");
    } else if (/^\s*\/ /.test(line)) {
      editor.addLineClass(i, "wrap", "line-done");
    } else if (/^\s*>/.test(line)) {
      editor.addLineClass(i, "wrap", "line-result");
    } else if (/^\s*\/-/.test(line)) {
      editor.addLineClass(i, "wrap", "line-struck");
    }
  }
}

function toggleLinePrefix(cm, prefix) {
  const selections = cm.listSelections();

  cm.operation(() => {
    selections.forEach(sel => {
      const fromLine = sel.from().line;
      const toLine = sel.to().line;

      const allPrefixed = [];
      for (let i = fromLine; i <= toLine; i++) {
        const lineContent = cm.getLine(i);
        allPrefixed.push(lineContent.trimStart().startsWith(prefix));
      }

      const shouldRemove = allPrefixed.every(Boolean);

      for (let i = fromLine; i <= toLine; i++) {
        const lineContent = cm.getLine(i);
        const leadingSpaces = lineContent.match(/^\s*/)[0];

        if (shouldRemove) {
          if (lineContent.trimStart().startsWith(prefix)) {
            const updated = lineContent.replace(new RegExp(`^\\s*${escapeRegex(prefix)}`), leadingSpaces);
            cm.replaceRange(updated, { line: i, ch: 0 }, { line: i, ch: lineContent.length });
          }
        } else {
          cm.replaceRange(leadingSpaces + prefix + lineContent.trimStart(), { line: i, ch: 0 }, { line: i, ch: lineContent.length });
        }
      }
    });
  });
}

// Utility to escape regex special characters
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function debounce(func, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

const debouncedSave = debounce(() => {
  const content = editor.getValue();
  sendContentToBackend(content);
}, 300);  // 300 ms delay

// Run on load
addHighlighting();

// Run on change
editor.on('change', () => {
  debouncedSave();
  addHighlighting();
});