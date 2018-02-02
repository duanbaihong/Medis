
'use strict';

const {app, Menu, ipcMain, remote} = require('electron')
const windowManager = require('./windowManager')
const menu = require('./menu')


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
// var childrenMenu=new remote.Menu()
// childrenMenu.append(new remote.MenuItem({
//   label: "test",
//   click(){
//     console.log('test')
//   }
// },{
//   type: 'separator'
// },{
//   label: 'MenuItem2',
//   type: 'checkbox', 
//   checked: true
// }))
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function () {
    Menu.setApplicationMenu(menu);
    // window.addEventListener('contextmenu', (e) => {
    // e.preventDefault()
    // childrenMenu.popup(remote.getCurrentWindow())
    // }, false)
  windowManager.create();
});