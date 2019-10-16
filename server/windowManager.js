'use strict';

const {app, BrowserWindow} = require('electron');
const url = require('url');
const path = require('path');
const EventEmitter = require('events');

class WindowManager extends EventEmitter {
  constructor() {
    super();
    this.windows = new Set();
    app.on('browser-window-blur', this.emit.bind(this, 'blur'));
    app.on('browser-window-focus', this.emit.bind(this, 'focus'));
  }

  get current() {
    return BrowserWindow.getFocusedWindow() || this.create();
  }

  create(type, arg) {
    if (!type) {
      type = 'main';
    }
    const option = {
      icon: '../../icns/Icon1024.png',
      show: false,
      autoHideMenuBar: true,
      frame: true,
      backgroundColor: '#ffffff',
      webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInWorker: true
      }
    };
    if (type === 'main') {
      option.width = 1020;
      option.height = 600;
      option.minWidth = 940;
    } else {
      option.width = 585;
      if(process.platform === 'darwin'){
        option.height = 310;
      }else{
        option.height = 295;
      }
      option.alwaysOnTop = true;
      option.resizable = false;
      option.modal = true;
      option.parent= 'top';
      option.fullscreen = false;
      option.minimizable = false;
      option.maximizable = false;
    }
    const newWindow = new BrowserWindow(option);
    var loadurl=url.format({
        pathname: path.join(__dirname, `/windows/${type}.html`),
        protocol: 'file:',
        slashes: true,
        search: (arg ? '?arg=' + arg : '')
        })
    console.log(loadurl);
    newWindow.loadURL(loadurl);
    this._register(newWindow);
    if (!option.show) {
      newWindow.once('ready-to-show', () => {
        newWindow.show()
      });
    }
    return newWindow;
  }
  _register(win) {
    this.windows.add(win);
    win.on('closed', () => {
      this.windows.delete(win);
      if (!BrowserWindow.getFocusedWindow()) {
        this.emit('blur');
      }
    });
    this.emit('focus');
  }

  dispatch(action, args,filepath) {
    this.windows.forEach(win => {
      if (win && win.webContents) {
        if(action === 'reloadPatterns' || action === 'reloadFavorites'){
          win.webContents.send('action', action, args,filepath);
        }else if(win.isFocused()){
          win.webContents.send('action', action, args,filepath);
        }
      }
    });
  }
}

module.exports = new WindowManager();
