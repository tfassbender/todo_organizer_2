let currentFile = null;
var openedFiles = [];

function loadFileList() {
  fetch('/todos/opened')
    .then(async res => {
      if (!res.ok) {
        const errorText = await res.text();
        const errorJson = JSON.parse(errorText);
        throw { response: res, message: errorJson.errorMessage || "Unknown error" };
      }
      return res.json();
    })
    .then(files => {
      openedFiles = files; // Save for later search
      const fileList = document.getElementById('file-list');
      fileList.innerHTML = '';

      files.forEach(file => {
        const item = createFileItem(file);
        fileList.appendChild(item);
      });
    })
    .then(() => {
        // If there's a current file, select it
        if (openedFiles.length > 0) {
            selectFile(openedFiles[0]);
        }
    })
    .catch(err => {
      console.warning("Error loading file list:", err);
      showErrorModal("Failed to load file list: " + err.message);
    });
}

function selectFile(file) {
  if (currentFile != null && file.filename === currentFile.filename) return;

  fetch(`/todos/${file.filename}`)

    .then(async res => {
      if (!res.ok) {
        const errorText = await res.text();
        const errorJson = JSON.parse(errorText);
        throw { response: res, message: errorJson.errorMessage || "Unknown error" };
      }
      return res.json();
    })
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
    .catch(err => {
      console.log("Error loading file:", err);
      showErrorModal("Failed to load file: " + err.message);
    });
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
  .then(async res => {
      if (!res.ok) {
        const errorText = await res.text();
        const errorJson = JSON.parse(errorText);
        throw { response: res, message: errorJson.errorMessage || "Unknown error" };
      }
      return res.json();
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
  .catch(err => {
    console.log("Error saving file:", err);
    showErrorModal("Failed to save changes: " + err.message);
  });
}

loadFileList();
