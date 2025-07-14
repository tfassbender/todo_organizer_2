let currentFile = null;

function loadFileList() {
  fetch('/todos')
    .then(res => res.json())
    .then(files => {
      const fileList = document.getElementById('file-list');
      fileList.innerHTML = '';

      files.forEach(filename => {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.textContent = filename;

        item.addEventListener('click', () => {
          selectFile(filename);
        });

        fileList.appendChild(item);
      });
    })
    .catch(err => console.error('Error loading file list:', err));
}

function selectFile(filename) {
  if (filename === currentFile) return;

  fetch(`/todos/${filename}`)
    .then(res => res.text())
    .then(content => {
      currentFile = filename;

      document.querySelectorAll('.file-item').forEach(el => el.classList.remove('selected'));
      Array.from(document.querySelectorAll('.file-item'))
        .find(el => el.textContent === filename)
        ?.classList.add('selected');

      editor.setValue(content);
      addHighlighting();
    })
    .catch(err => console.error('Failed to load file:', err));
}

function sendContentToBackend(content) {
  if (!currentFile) return;

  fetch(`/todos/${currentFile}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'text/plain'
    },
    body: content
  })
  .then(response => {
    if (!response.ok) throw new Error("Failed to save content");
  })
  .catch(error => {
    console.error("Error saving content:", error);
  });
}

loadFileList();
