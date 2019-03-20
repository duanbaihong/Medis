'use strict'

import React from 'react'
import ReactDOM from 'react-dom'
import MainWindow from './'
import {ipcRenderer} from 'electron'
import store from 'Redux/store'
import * as actions from 'Redux/actions'

require('../../styles/global.scss')
// const config = require('../../../webpack.production.config');
// if (config.mode === 'development') {
//     const electronHot = require('electron-hot-loader');
//     electronHot.install();
//     electronHot.watchJsx(['../../client/**/\*.jsx']);
//     electronHot.watchCss(['../../client/**/\*.css','../../client/**/\*.scss']);
// }


ipcRenderer.on('action', (evt, action, value,filepath) => {
  if ($('.Modal').length && (action.indexOf("portFavorites") !== -1 
    || action.indexOf('setFullScreen') === -1 
    || action.indexOf('Instance') !== -1)) {
    return
  }
  store.skipPersist = true
  if(value){
  	store.dispatch(actions[action](value,filepath))
  }else{
	store.dispatch(actions[action]())
  }
  store.skipPersist = false
})

ReactDOM.render(MainWindow, document.getElementById('content'))
