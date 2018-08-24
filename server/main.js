
'use strict';

const {app, Menu, ipcMain, remote} = require('electron')
const windowManager = require('./windowManager')
const menu = require('./menu')
const path =require('path')
require('electron-reload')(path.join(__dirname,'..','dist'))
console.log(path.join(__dirname,'..','dist'))
ipcMain.on('create patternManager', function (event, arg) {
  windowManager.create('patternManager', arg);
});

ipcMain.on('dispatch', function (event, action, arg) {
  windowManager.dispatch(action, arg);
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function (e, hasVisibleWindows) {
  if (!hasVisibleWindows) {
    windowManager.create();
  }
});

app.on('ready', function () {
  Menu.setApplicationMenu(menu);
  windowManager.create();
});