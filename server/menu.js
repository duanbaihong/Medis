'use strict';

const {app, Menu, dialog,shell} = require('electron');
// const path = require('path')
const windowManager = require('./windowManager');

const fs = require('fs');

const menuTemplate = [{
  label: '文件',
  submenu: [{
    label: '新建连接',
    accelerator: 'CmdOrCtrl+N',
    click() {
      windowManager.create();
    }
  }, {
    label: '新建标签连接',
    accelerator: 'CmdOrCtrl+T',
    click() {
      windowManager.dispatch('createInstance');
    }
  }, {
    type: 'separator'
  },{
    label: '导出收藏',
    accelerator: 'CmdOrCtrl+E',
    click() {
      exportFavorites();
    }
  },{
    label: '导入收藏',
    accelerator: 'CmdOrCtrl+I',
    click() {
      importFavorites();
    }
  },{
    type: 'separator'
  },  {
    label: '参数设置',
    accelerator: 'CmdOrCtrl+,',
    click() {
      windowManager.create('SettingWindow');
    }
  },{
    type: 'separator'
  }, {
    label: '关闭窗口',
    accelerator: 'Shift+CmdOrCtrl+W',
    click() {
      windowManager.current.close();
    }
  }, {
    label: '关闭标签',
    accelerator: 'CmdOrCtrl+W',
    click() {
      windowManager.dispatch('delInstance');
    }
  }]
}, {
  label: '编辑',
  submenu: [{
    label: '恢复',
    accelerator: 'CmdOrCtrl+Z',
    role: 'undo'
  }, {
    label: '重做',
    accelerator: 'Shift+CmdOrCtrl+Z',
    role: 'redo'
  }, {
    type: 'separator'
  }, {
    label: '剪切',
    accelerator: 'CmdOrCtrl+X',
    role: 'cut'
  }, {
    label: '拷贝',
    accelerator: 'CmdOrCtrl+C',
    role: 'copy'
  }, {
    label: '粘贴',
    accelerator: 'CmdOrCtrl+V',
    role: 'paste'
  }, {
    label: '选择所有',
    accelerator: 'CmdOrCtrl+A',
    role: 'selectall'
  }]
}, {
  label: '视图',
  submenu: [{
    label: '刷新/重载',
    accelerator: 'CmdOrCtrl+R',
    click(item, focusedWindow) {
      if (focusedWindow) {
        focusedWindow.reload();
      }
    }
  },{
    label: '转为全屏',
    accelerator: (function () {
      if (process.platform === 'darwin') {
        return 'Ctrl+Command+F';
      }
      return 'F11';
    })(),
    click(item, focusedWindow) {
      if (focusedWindow) {
        focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
      }
    }
  },{
    label: '开发工具',
    accelerator: (function () {
      if (process.platform === 'darwin') {
        return 'Alt+Command+I';
      }
      return 'Ctrl+Shift+I';
    })(),
    click(item, focusedWindow) {
      if (focusedWindow) {
        focusedWindow.toggleDevTools();
      }
    }
  }]
}, {
  label: '窗口',
  role: 'window',
  submenu: [{
    label: '最小化',
    accelerator: 'CmdOrCtrl+M',
    role: 'minimize'
  }, {
    label: '关闭',
    accelerator: 'CmdOrCtrl+W',
    role: 'close'
  }]
}, {
  label: '帮助',
  role: 'help',
  submenu: [{
    label: '报告问题...',
    click() {
      shell.openExternal('mailto:duanbaihong@qq.com');
    }
  }, {
    label: '学习更多',
    click() {
      shell.openExternal('http://getmedis.com');
    }
  }]
}]

let baseIndex = 0;
if (process.platform == 'darwin') {
  baseIndex = 1;
  menuTemplate.unshift({
    label: app.getName(),
    submenu: [{
      label: '关于 ' + app.getName(),
      role: 'about'
    }, {
      type: 'separator'
    }, {
      label: '服务',
      role: 'services',
      submenu: []
    }, {
      type: 'separator'
    }, {
      label: '隐藏 ' + app.getName(),
      accelerator: 'Command+H',
      role: 'hide'
    }, {
      label: '隐藏其它',
      accelerator: 'Command+Shift+H',
      role: 'hideothers'
    }, {
      label: '显示所有',
      role: 'unhide'
    }, {
      type: 'separator'
    }, {
      label: '退出',
      accelerator: 'Command+Q',
      click() {
        app.quit();
      }
    }]
  });
}

function importFavorites() {
  const files = dialog.showOpenDialog({
    properties: ['openFile'],
    title: "导入收藏",
    defaultPath: "~/Desktop/",
    filters:[{name: 'JSON Files', extensions: ['json']}]
  })
  if (files && files.length) {
    const file = files[0]
    try{
      const content = fs.readFileSync(file, 'utf8')
      let objData=JSON.parse(content)
      windowManager.dispatch('importFavorites',objData,file);
    }catch(e){
      console.log(e)
      return false
    }
  }
}

function exportFavorites() {
  const files = dialog.showSaveDialog({
    title: "导出收藏",
    defaultPath: "~/Desktop/",
    filters:[{name: 'JSON Files', extensions: ['json']}]
  })
  if (files && files.length) {
    try{
      windowManager.dispatch('exportFavorites',{},files);
    }catch(e){
      console.log(e)
      return false
    }
  }
}

const menu = Menu.buildFromTemplate(menuTemplate);
const dockMenu = Menu.buildFromTemplate([
  {
    label: '新建窗口', 
    accelerator: 'CmdOrCtrl+N',
    click() {
      windowManager.create();
    }
  },{
    label: '新建标签连接',
    accelerator: 'CmdOrCtrl+T',
    click() {
      windowManager.dispatch('createInstance');
    }
  },{
    type: 'separator'
  },{
    label: '导出收藏',
    accelerator: 'CmdOrCtrl+E',
    click() {
      exportFavorites();
    }
  },{
    label: '导入收藏',
    accelerator: 'CmdOrCtrl+I',
    click() {
     importFavorites()
    }
  },{
      type: 'separator'
  },{ label: '参数设置',
    accelerator: 'CmdOrCtrl+,',
    click() {
      windowManager.create('SettingWindow');
    }
  },{
      type: 'separator'
  },{
      label: '退出',
      accelerator: 'Command+Q',
      click() {
        app.quit();
      }
    }
])

// if (process.env.NODE_ENV !== 'debug') {
//   menu.items[baseIndex + 2].submenu.items[0].visible = false;
//   menu.items[baseIndex + 2].submenu.items[2].visible = false;
// }

windowManager.on('blur', function () {
  menu.items[baseIndex + 0].submenu.items[3].enabled = false;
  menu.items[baseIndex + 0].submenu.items[4].enabled = false;
  dockMenu.items[1].enabled=false;
});

windowManager.on('focus', function () {
  menu.items[baseIndex + 0].submenu.items[3].enabled = true;
  menu.items[baseIndex + 0].submenu.items[4].enabled = true;
  dockMenu.items[1].enabled=true;
});

module.exports = {menu, dockMenu};
