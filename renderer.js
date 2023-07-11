const { ipcRenderer } = require("electron");
const path = require("path");

window.addEventListener("DOMContentLoaded", () => {
    createDocumentBtn = document.getElementById("createDocumentBtn");
    openDocumentBtn = document.getElementById("openDocumentBtn");
    documentName = document.getElementById("documentName");
    fileTextarea = document.getElementById("fileTextarea");
    saveBtn = document.getElementById("saveBtn");
    
    const handleDocumentChange = (filePath, content) => {
        documentName.innerText = path.basename(filePath);
        fileTextarea.removeAttribute("disabled");
        fileTextarea.value = content;
        fileTextarea.focus();
    };

    createDocumentBtn.addEventListener("click", () => {
        ipcRenderer.send("create-document-triggered");
    });

    ipcRenderer.on("document-created", (_, filePath) => {
        handleDocumentChange(filePath, "");
    }); 
    
    openDocumentBtn.addEventListener("click", () => {
        ipcRenderer.send("open-document-triggered");
    });
    
    ipcRenderer.on("document-opened", (_, { filePath, content }) => {
        handleDocumentChange(filePath, content);
    });

    saveBtn.addEventListener("click", () => {
        ipcRenderer.send("save-document", fileTextarea.value);
    });
});