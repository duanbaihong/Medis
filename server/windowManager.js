'use strict';

const {app, BrowserWindow} = require('electron');
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
      option.width = 960;
      option.height = 600;
      option.show = false;
      option.minWidth = 840;
      option.minHeight = 400;
    } else if (type === 'patternManager') {
      option.width = 600;
      option.height = 300;
      option.title = '管理过滤正则';
      option.show=false;
      option.alwaysOnTop = true;
      option.resizable = true;
      option.modal = true;
      option.fullscreen = false;
      option.minimizable = false;
      option.maximizable = false;
      // option.frame: false;
    }
    if(this.windows.size>1){
      return false
    }
    const newWindow = new BrowserWindow(option);
    newWindow.loadURL(`file://${__dirname}/windows/${type}.html${arg ? '?arg=' + arg : ''}`);
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
