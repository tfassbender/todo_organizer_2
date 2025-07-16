let modalOverlay;
let inputField;

let errorModalOverlay;
let errorModalMessage;

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
});

function showNewFileModal() {
  modalOverlay.classList.remove("hidden");
  inputField.value = "";
  inputField.focus();
}

function createNewTodo(filename) {
  fetch(`/todos/${encodeURIComponent(filename)}`, {
    method: "POST",
  })
    .then(async res => {
      if (!res.ok) {
        const errorText = await res.text();
        const errorJson = JSON.parse(errorText);
        throw { response: res, message: errorJson.errorMessage || "Unknown error" };
      }
      return res.json();
    })
    .then(newFileDto => {
      openedFiles.push(newFileDto);

      const fileList = document.getElementById('file-list');
      const item = createFileItem(newFileDto);
      fileList.appendChild(item);

      selectFile(newFileDto);
    })
    .catch(err => {
      console.error("Error creating new file:", err);
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

  return item;
}

function showErrorModal(message) {
  errorModalMessage.textContent = message;
  errorModalOverlay.classList.remove("hidden");
}
