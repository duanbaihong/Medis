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
      backgroundColor: '#ececec'
    };
    if (type === 'main') {
      option.width = 1020;
      option.height = 600;
      option.show = false;
      option.minWidth = 940;
      option.autoHideMenuBar=true;
      option.icon='../../icns/Icon1024.png',
      option.webPreferences = {
        nodeIntegrationInWorker: true
      };
    } else if (type === 'patternManager') {
      option.width = 700;
      option.height = 300;
      option.title = '管理过滤正则';
      option.show=false;
      option.alwaysOnTop = true;
      option.resizable = true;
      option.modal = true;
      option.autoHideMenuBar=true;
      option.parent= 'top';
      option.icon='../../icns/Icon1024.png',
      option.webPreferences = {
        nodeIntegrationInWorker: true
      };
      option.fullscreen = false;
      option.minimizable = false;
      option.maximizable = false;
      // option.frame: false;
    }
    if(this.windows.size>1){
      return false
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
      })
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

  dispatch(action, args) {
    this.windows.forEach(win => {
      if (win && win.webContents) {
        win.webContents.send('action', action, args);
      }
    });
  }
}

module.exports = new WindowManager();
