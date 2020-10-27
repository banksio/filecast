const { app } = require('electron');

// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}

// Main.js
require('update-electron-app')();
const { BrowserWindow, dialog, ipcRenderer } = require('electron');
const { networkInterfaces } = require('os');
const fs = require('fs');
const path = require('path');

const express = require('express');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.loadFile('app/index.html')
  // win.webContents.openDevTools()
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Events
// In the Main process
const { ipcMain } = require('electron')

ipcMain.handle('folder-select', async (event, arg) => {
  // console.log(arg) // prints "ping"
  return await selectFolder();
})

// Functions
// Express
// Include dependencies


// Constants 
const port = 80;
const Server = new (require('./folderServer').Server)(port, express(), app.getAppPath());

console.log("Starting express...");
Server.listen();


async function selectFolder() {
  let filePaths;
  var selectedPath
  const folderPickResult = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  if (!folderPickResult.canceled) {
    selectedPath = folderPickResult.filePaths[0];
    filePaths = getFullPathsFromDir(selectedPath);
    Server.setPath(selectedPath);
  }
  return {
    fpr: selectedPath,
    paths: filePaths
  };
}

function getFullPathsFromDir(folderPath) {
  let fullPaths = [];
  let dir = fs.readdirSync(folderPath);
    for (let filePath of dir) {
      let absPath = path.join(folderPath, filePath);
      if (fs.lstatSync(absPath).isDirectory()) continue;
      fullPaths.push(filePath);
    }
  return fullPaths;
}


// Squirrel
function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }

  const ChildProcess = require('child_process');
  const path = require('path');

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawn = function (command, args) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, { detached: true });
    } catch (error) { }

    return spawnedProcess;
  };

  const spawnUpdate = function (args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit();
      return true;
  }
};