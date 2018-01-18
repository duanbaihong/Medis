'use strict';

const {app, Menu, ipcMain,globalShortcut} = require('electron')
const windowManager = require('./windowManager')
const menu = require('./menu')
// require('electron-react-devtools').install()

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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function (event) {
  // 关闭刷新快捷键
  // globalShortcut.register('CommandOrControl+R', () => {
  //   // Do stuff when Y and either Command/Control is pressed.
  //   return false;
  // })
  Menu.setApplicationMenu(menu);
  windowManager.create();
});
