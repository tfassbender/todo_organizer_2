let currentFile = null;
let openedFiles = [];

function loadFileList() {
  fetch('/todos/opened')
    .then(res => res.json())
    .then(files => {
      openedFiles = files; // Save for later search
      const fileList = document.getElementById('file-list');
      fileList.innerHTML = '';

      files.forEach(file => {
        const item = document.createElement('div');
        item.className = `file-item data-filename-${file.filename}`;

        if (file.icon) {
          const icon = document.createElement('img');
          icon.src = `/icons/${file.icon}`;
          icon.alt = 'icon';
          icon.className = 'file-icon';
          item.appendChild(icon);
        }

        const text = document.createElement('span');
        text.textContent = file.filename;
        item.appendChild(text);

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
    return response.json(); // Expecting a TodoFileDto with updated icon
  })
  .then(dto => {
    // Update the icon in the file list UI
    const fileItem = document.querySelector(`.file-item.data-filename-${dto.filename}`);
    if (fileItem && dto.icon) {
      fileItem.querySelector('.file-icon').src = "icons/" + dto.icon;
    }

    // Manually update the content in the openedFiles list
    const updatedFile = openedFiles.find(f => f.filename === dto.filename);
    if (updatedFile) {
      updatedFile.content = content;
    }

    // Also update currentFile if it's the one that was saved
    if (currentFile.filename === dto.filename) {
      currentFile.content = content;
    }
  })
  .catch(error => {
    console.error("Error saving content:", error);
  });
}

loadFileList();
