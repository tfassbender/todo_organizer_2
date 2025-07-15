document.getElementById("search-button").addEventListener("click", searchTodos);
document.getElementById("search-input").addEventListener("keydown", function (e) {
  if (e.key === "Enter") searchTodos();
});

document.getElementById('clear-button').addEventListener('click', () => {
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');

  searchInput.value = '';               // Clear input field
  searchResults.innerHTML = '';         // Clear results display
});

function searchTodos() {
  const query = document.getElementById("search-input").value.trim().toLowerCase();
  const resultContainer = document.getElementById("search-results");
  resultContainer.innerHTML = '';

  if (!query) return;

  const results = [];

  openedFiles.forEach(file => {
    if (!file.content) return;

    const lines = file.content.split('\n');
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(query)) {
        const matchIndex = line.toLowerCase().indexOf(query);
        if (matchIndex !== -1) {
          const start = Math.max(0, matchIndex - 100);
          const end = Math.min(line.length, matchIndex + query.length + 100);
          const croppedLine = (start > 0 ? '…' : '') + line.substring(start, end) + (end < line.length ? '…' : '');

          results.push({
            filename: file.filename,
            lineNumber: index + 1,
            line: croppedLine
          });
        }

      }
    });
  });

  if (results.length === 0) {
    resultContainer.textContent = 'No matches found.';
    return;
  }

  results.forEach(result => {
    const item = document.createElement('div');
    item.className = 'search-result';
    item.innerHTML = `<strong>${result.filename}</strong> (line ${result.lineNumber}): ${highlightMatch(result.line)}`;
    item.addEventListener('click', () => {
      const file = openedFiles.find(f => f.filename === result.filename);
      if (file) selectFile(file);
    });
    resultContainer.appendChild(item);
  });
}

function highlightMatch(line) {
  const query = document.getElementById("search-input").value.trim();
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return line.replace(regex, '<mark>$1</mark>');
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
