// In the Renderer process
const { ipcRenderer, shell } = require('electron')

// const castBtn = document.getElementById("castNow");
const btnFolderPicker = document.getElementById("btn-folderpicker");
const textStatusFolderPath = document.getElementById("status-path");
const listFilesDiscovered = document.getElementById("list-files");
const btnOpenClienet = document.getElementById("btnOpenClient");
// const castName = document.getElementById("castDevice");
// const subnet = document.getElementById("ip");

// castBtn.addEventListener("click", () => {
//     ipcRenderer.invoke('folder-select');
// })


btnFolderPicker.addEventListener("click", () => {
    ipcRenderer.invoke('folder-select').then((result) => {
        if (result.fpr) {
            textStatusFolderPath.innerText = "Selected Path: " + result.fpr;
            // alert(result.paths);
            listFilesDiscovered.innerHTML = "";
            for (path of result.paths) {
                listFilesDiscovered.innerHTML += "<li>" + path + "</li>";
            }
        } else {
            textStatusFolderPath.innerText = "Folder selection was cancelled. " + textStatusFolderPath.innerText;
        }
    });
})

btnOpenClienet.addEventListener("click", (event) => {
    shell.openExternal("http://localhost/");
})