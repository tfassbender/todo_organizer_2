let modalOverlay;
let inputField;

let errorModalOverlay;
let errorModalMessage;

let openFileModal;
let selectedToOpen = null;

document.addEventListener("DOMContentLoaded", () => {
  // Hook up modal references
  modalOverlay = document.getElementById("modal-overlay");
  inputField = document.getElementById("new-filename-input");

  document.getElementById("new-file-button").addEventListener("click", () => {
    showNewFileModal();
  });

  inputField.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent form submit or other default behavior
      const filename = inputField.value.trim();
      if (!filename) return;
      modalOverlay.classList.add("hidden");
      createNewTodo(filename);
    }
  });

  document.getElementById("create-file-btn").addEventListener("click", () => {
    const filename = inputField.value.trim();
    if (!filename) return;
    modalOverlay.classList.add("hidden");
    createNewTodo(filename);
  });

  document.getElementById("cancel-modal-btn").addEventListener("click", () => {
    modalOverlay.classList.add("hidden");
  });

  // Error modal setup
  errorModalOverlay = document.getElementById("error-modal-overlay");
  errorModalMessage = document.getElementById("error-modal-message");

  document.getElementById("error-modal-ok-btn").addEventListener("click", () => {
    errorModalOverlay.classList.add("hidden");
  });

  // Open file modal setup
  openFileModal = document.getElementById("open-file-modal");
  document.getElementById("open-file-button").addEventListener("click", showOpenFileModal);
  document.getElementById("confirm-open-btn").addEventListener("click", openFile);
  document.getElementById("cancel-open-btn").addEventListener("click", () => {
    openFileModal.classList.add("hidden");
    selectedToOpen = null;
  });
});

function showNewFileModal() {
  modalOverlay.classList.remove("hidden");
  inputField.value = "";
  inputField.focus();
}

function createNewTodo(filename) {
  fetch(`/todos/${encodeURIComponent(filename)}`, {method: "POST"})
    .then(parseJsonResponse)
    .then(newFileDto => {
      openedFiles.push(newFileDto);

      const fileList = document.getElementById('file-list');
      const item = createFileItem(newFileDto);
      fileList.appendChild(item);

      selectFile(newFileDto);
    })
    .catch(err => {
      console.log("Error creating new file:", err);
      showErrorModal("Failed to create new file: " + err.message);
    });
}

function createFileItem(file) {
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

  // Add close button
  const closeButton = document.createElement('button');
  closeButton.className = 'file-close-button';
  closeButton.innerHTML = '&times;'; // × symbol
  closeButton.title = 'Close file';
  closeButton.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent triggering file select
    closeFile(file.filename, item);
  });
  item.appendChild(closeButton);

  return item;
}

function showErrorModal(message) {
  errorModalMessage.textContent = message;
  errorModalOverlay.classList.remove("hidden");
}

function showOpenFileModal() {
  const fileListEl = document.getElementById("open-file-list");
  fileListEl.innerHTML = "";
  selectedToOpen = null;

  fetch("/todos?no-content")
    .then(parseJsonResponse)
    .then(allFiles => {
      // Filter out opened files
      const openedFilenames = openedFiles.map(file => file.filename);
      const unopenedFiles = allFiles.filter(file => !openedFilenames.includes(file.filename));

      const select = document.getElementById("open-file-list");
      select.innerHTML = ""; // Clear previous options

      if (unopenedFiles.length === 0) {
        const option = document.createElement("option");
        option.textContent = "All files are already opened";
        option.disabled = true;
        select.appendChild(option);

        // If no unopened files, hide the button and return
        if (unopenedFiles.length === 0) {
          document.getElementById("confirm-open-btn").style.display = "none";
        }
      } else {
        unopenedFiles.forEach(file => {
          const item = document.createElement("div");
          item.textContent = file.filename || file; // support old or new format
          item.addEventListener("click", () => {
            document.querySelectorAll("#open-file-list div").forEach(el => el.classList.remove("selected"));
            item.classList.add("selected");
            selectedToOpen = file.filename || file;
          });
          fileListEl.appendChild(item);
        });

        // The button might be hidden (if no files were available before), so show it now
        document.getElementById("confirm-open-btn").style.display = "inherit";
      }

      openFileModal.classList.remove("hidden");
    })
    .catch(err => {
      console.log("Error loading file list:", err);
      showErrorModal("Failed to load file list: " + err.message);
    });
}

function openFile() {
  if (!selectedToOpen) {
    return;
  }

  fetch(`/todos/opened/${encodeURIComponent(selectedToOpen)}`, {method: "POST"})
    .then(parseJsonResponse)
    .then(fileDto => {
      openedFiles.push(fileDto);

      const fileList = document.getElementById('file-list');
      const item = createFileItem(fileDto);
      fileList.appendChild(item);

      selectFile(fileDto);
      openFileModal.classList.add("hidden");
    })
    .catch(err => {
      console.log("Failed to open file:", err);
      showErrorModal("Failed to open file: " + err.message);
    });
}
