
'use strict';

const {app, Menu, ipcMain, remote,Tray } = require('electron')
const windowManager = require('./windowManager')
const {menu,dockMenu} = require('./menu')
const path =require('path')
// require('electron-reload')(path.join(__dirname,'..','dist'))
// console.log(path.join(__dirname,'..','dist'))

app.disableHardwareAcceleration()
ipcMain.on('create patternManager', function (event, arg) {
  windowManager.create('patternManager', arg);
});

ipcMain.on('dispatch', function (event, action, arg) {
  windowManager.dispatch(action, arg);
});
if(process.platform=='darwin'){
  app.dock.setMenu(dockMenu)
}
// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
// app.on('before-quit', function(ev) {
//   // body...
//   // windowManager.current.webContents.send('action', 'exportFavorite');
//   // var redisNotification=new Notification('Medis退出连接提示',{
//   //           body: `已经退出连接[]!`,
//   //           icon: '../../icns/Icon1024.png',
//   //           silent: true
//   //         })
// })

app.on('activate', function (e, hasVisibleWindows) {
  if (!hasVisibleWindows) {
    windowManager.create();
  }
});

app.on('ready', function () {
  let logo;
  switch (process.platform) {
    case 'darwin':
      logo = path.join(__dirname, '..', 'icns', 'medis.icns')
      break;
    case 'linux':
      logo = path.join(__dirname, '..', 'icns', 'medis.png')
      break;
    default:
      logo = path.join(__dirname, '..', 'icns', 'medis64.ico')
      break;
  }
  let tray = new Tray(logo);
  tray.setToolTip('我的Medis')
  tray.setContextMenu(dockMenu)
  Menu.setApplicationMenu(menu);
  windowManager.create();
});