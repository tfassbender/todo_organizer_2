let currentFile = null;
var openedFiles = [];

function loadFileList() {
  fetch('/todos/opened')
    .then(parseJsonResponse)
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

    initializeDragAndDrop();
}

function selectFile(file) {
  if (currentFile != null && file.filename === currentFile.filename) return;

  fetch(`/todos/${file.filename}`)
    .then(parseJsonResponse)
    .then(dto => {
      currentFile = dto;

      // Update selection UI
      document.querySelectorAll('.file-item').forEach(el => el.classList.remove('selected'));
      const selectedElement = document.querySelector(`.file-item[data-filename="${CSS.escape(dto.filename)}"]`);
      if (selectedElement) {
        selectedElement.classList.add('selected');
      }

      // Update editor content and file title
      editor.setValue(dto.content);
      addHighlighting();

      const titleEl = document.querySelector('.file-title');
      if (titleEl) {
        titleEl.textContent = dto.filename;
      }

      // Set focus to editor (end of first line)
      editor.focus();
      editor.setCursor(0, editor.getLine(0).length);
    })
    .catch(err => {
      console.log("Error loading file:", err);
      showErrorModal("Failed to load file: " + err.message);
    });
}

function closeFile(filename, element) {
  fetch(`/todos/opened/${encodeURIComponent(filename)}`, {
    method: "DELETE"
  })
  .then(res => {
    if (!res.ok) throw new Error("Failed to close file");

    // Remove from openedFiles list
    const index = openedFiles.findIndex(f => f.filename === filename);
    if (index !== -1) openedFiles.splice(index, 1);

    // Remove element from DOM
    element.remove();

    // If currentFile is the one we closed, reset editor
    if (currentFile && currentFile.filename === filename) {
      currentFile = null;
      editor.setValue("");
    }
  })
  .catch(err => {
    console.error("Error closing file:", err);
    showErrorModal("Failed to close file: " + err.message);
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
  .then(parseJsonResponse)
  .then(dto => {
    updateFileIcon(dto);
    updateCachedContent(dto.filename, content);

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

function updateFileIcon(dto) {
  const fileItem = document.querySelector(`.file-item[data-filename="${CSS.escape(dto.filename)}"]`);
  if (fileItem && dto.icon) {
    fileItem.querySelector('.file-icon').src = "icons/" + dto.icon;
  }
}

// Keep the openedFiles cache in sync, the search works on it
function updateCachedContent(filename, content) {
  const cachedFile = openedFiles.find(f => f.filename === filename);
  if (cachedFile) {
    cachedFile.content = content;
  }
}

// Fetches the current file again, because it might have been edited on another device in the meantime
function reloadCurrentFile() {
  if (!currentFile) return;

  const filename = currentFile.filename;
  const generation = editor.changeGeneration();

  fetch(`/todos/${filename}`)
    .then(parseJsonResponse)
    .then(dto => {
      // The user switched files or already typed while the request was running - don't overwrite that
      if (!currentFile || currentFile.filename !== filename || !editor.isClean(generation)) return;

      updateFileIcon(dto);
      updateCachedContent(dto.filename, dto.content);
      currentFile.content = dto.content;

      if (dto.content !== editor.getValue()) {
        replaceEditorContentKeepingPosition(dto.content);
      }
    })
    .catch(err => {
      console.log("Error reloading file:", err);
      showErrorModal("Failed to reload file: " + err.message);
    });
}

function replaceEditorContentKeepingPosition(content) {
  const cursor = editor.getCursor();
  const scrollInfo = editor.getScrollInfo();

  editor.setValue(content);
  // Undoing past the reload would bring back the outdated content and save it
  editor.clearHistory();

  editor.setCursor(cursor);
  editor.scrollTo(scrollInfo.left, scrollInfo.top);
}

function initializeDragAndDrop() {
  const fileList = document.getElementById('file-list');
  new Sortable(fileList, {
    animation: 150,
    ghostClass: 'drag-ghost',
    // Without a delay every attempt to scroll the file list on a touch screen
    // starts a drag instead. Long press to reorder, short touch to scroll.
    delay: 300,
    delayOnTouchOnly: true,
    touchStartThreshold: 5,
    onEnd: (evt) => {
      // Grab the new order from the DOM
      const newOrder = Array.from(fileList.children).map(item => {
        const span = item.querySelector('span');
        return span ? span.textContent : null;
      }).filter(Boolean);

      // Send to backend
      sendNewOrderToBackend(newOrder);
    }
  });
}

function sendNewOrderToBackend(order) {
  fetch('/todos/order', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(order) // Array of filenames in new order
  })
  .then(parseJsonResponse)
  .catch(err => {
    console.error("Failed to send new file order to backend:", err);
    showErrorModal("Failed to update file order: " + err.message);
  });
}

async function parseJsonResponse(res) {
  if (!res.ok) {
    const errorText = await res.text();
    let errorMessage;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.errorMessage || "Unknown error";
    } catch {
      errorMessage = errorText || "Unknown error";
    }
    throw { response: res, message: errorMessage };
  }

  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  } else {
    return null;
  }
}


// Only fires when the tab is shown or hidden (switching tabs/apps, unlocking the phone), not on clicks
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    reloadCurrentFile();
  } else {
    // Mobile browsers may freeze a hidden tab before the debounce timer fires
    debouncedSave.flush();
  }
});

// A page restored from the back/forward cache doesn't always fire visibilitychange
window.addEventListener('pageshow', event => {
  if (event.persisted) {
    reloadCurrentFile();
  }
});

loadFileList();
