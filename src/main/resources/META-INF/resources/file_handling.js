let currentFile = null;

function loadFileList() {
  fetch('/todos')
    .then(res => res.json())
    .then(files => {
      const fileList = document.getElementById('file-list');
      fileList.innerHTML = '';

      files.forEach(file => {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.textContent = file.filename;

        item.addEventListener('click', () => {
          selectFile(file);
        });

        fileList.appendChild(item);
      });
    })
    .catch(err => console.error('Error loading file list:', err));
}

function selectFile(file) {
  if (currentFile != null && file.filename === currentFile.filename) return;

  fetch(`/todos/${file.filename}`)
    .then(res => res.json())
    .then(dto => {
      currentFile = dto;

      // Update selection UI
      document.querySelectorAll('.file-item').forEach(el => el.classList.remove('selected'));
      Array.from(document.querySelectorAll('.file-item'))
        .find(el => el.textContent === file.filename)
        ?.classList.add('selected');

      // Update editor content and file title
      editor.setValue(dto.content);
      addHighlighting();

      const titleEl = document.querySelector('.file-title');
      if (titleEl) {
        titleEl.textContent = dto.filename;
      }
    })
    .catch(err => console.error('Failed to load file:', err));
}

function sendContentToBackend(content) {
  if (!currentFile) return;

  fetch(`/todos/${currentFile.filename}`, {
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
