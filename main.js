// Main.js
const { app, BrowserWindow, dialog, ipcRenderer, Menu } = require('electron');
const log = require('electron-log');
const { autoUpdater } = require("electron-updater");
const { networkInterfaces } = require('os');
const fs = require('fs');
const path = require('path');
const express = require('express');

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

//-------------------------------------------------------------------
// Open a window that displays the version
//
// THIS SECTION IS NOT REQUIRED
//
// This isn't required for auto-updates to work, but it's easier
// for the app to show a window than to have to click "About" to see
// that updates are working.
//-------------------------------------------------------------------
let win;

function sendStatusToWindow(text) {
  log.info(text);
  // win.webContents.send('message', text);
}
// function createDefaultWindow() {
//   win = new BrowserWindow();
//   win.webContents.openDevTools();
//   win.on('closed', () => {
//     win = null;
//   });
//   win.loadURL(`file://${__dirname}/version.html#v${app.getVersion()}`);
//   return win;
// }
autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded');
});

//-------------------------------------------------------------------

app.on('ready', function()  {
  autoUpdater.checkForUpdatesAndNotify();
});

//-------------------------------------------------------------------

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  let name = app.getName();

  var menu = Menu.buildFromTemplate([
    {
      label: "Help",
      submenu: [
        {
          label: 'About ' + name,
          role: 'about'
        }]
    }
])
Menu.setApplicationMenu(menu); 

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
  // log.info(arg) // prints "ping"
  return await selectFolder();
})

// Functions
// Express
// Include dependencies


// Constants 
const port = 80;
const Server = new (require('./folderServer').Server)(port, express(), app.getAppPath());

log.info("Starting express...");
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