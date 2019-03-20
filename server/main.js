
'use strict';

const { app, Menu, ipcMain, globalShortcut,Tray } = require('electron')
const windowManager = require('./windowManager')
const {menu,dockMenu} = require('./menu')
const path =require('path')
ipcMain.on('create patternManager', function (event, arg) {
  windowManager.create('patternManager', arg);
});

ipcMain.on('create SettingWindow', function (event) {
  windowManager.create('SettingWindow');
});

ipcMain.on('dispatch', function (event, action, arg) {
  windowManager.dispatch(action, arg);
});
ipcMain.on('app-min', e=> windowManager.current.minimize());
ipcMain.on('app-max', e=> {
    if (windowManager.current.isMaximized()) {
        windowManager.current.unmaximize()
    } else {
        windowManager.current.maximize()
    }
});
ipcMain.on('app-fullmax', e=> {
    if (windowManager.current.isFullScreen()) {
        windowManager.current.setFullScreen(false);
    } else {
        windowManager.current.setFullScreen(true);
    }
});
ipcMain.on('app-close', e=> windowManager.current.close());

if(process.platform=='darwin'){
  app.dock.setMenu(dockMenu)
}
// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
  globalShortcut.unregister('ESC');
});

app.on('activate', function (e, hasVisibleWindows) {
  if (!hasVisibleWindows) {
    windowManager.create();
  }
});
app.on('browser-window-blur',function() {
  globalShortcut.unregister('ESC')
})
app.on('browser-window-focus',function() {
    globalShortcut.register('ESC', () => {
    if (windowManager.current.isFullScreen()) {
      windowManager.current.webContents.send('action', 'setFullScreen');
      windowManager.current.setFullScreen(false);
    }
  })
})
app.on('ready', function () {
  let logo;
  switch (process.platform) {
    case 'darwin':
    case 'linux':
      logo = path.join(__dirname, '..', 'icns', 'medis2.png')
      break;
    default:
      logo = path.join(__dirname, '..', 'icns', 'medis64.ico')
      break;
  }
  let tray = new Tray(logo);
  tray.setToolTip('我的Medis')
  tray.setContextMenu(dockMenu)
  Menu.setApplicationMenu(menu);
  console.log("tray")
  windowManager.create();
});