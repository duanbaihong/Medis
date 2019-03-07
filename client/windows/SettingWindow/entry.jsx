'use strict'

import React from 'react'
import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
import SettingWindow from './'
import store from 'Redux/store'
import * as actions from 'Redux/actions'
import {remote, ipcRenderer} from 'electron'

require('../../styles/global.scss')

ipcRenderer.on('action', (evt, action) => {
  if (action === 'delInstance') {
    remote.getCurrentWindow().close()
    return
  }
  store.skipPersist = true
  store.dispatch(actions[action]())
  store.skipPersist = false
})

ReactDOM.render(
  <Provider store={store}>
    <SettingWindow/>
  </Provider>,
  document.getElementById('content')
)
