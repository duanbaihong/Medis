'use strict'

import React, {PureComponent} from 'react'
import {createSelector} from 'reselect'
import {Provider, connect} from 'react-redux'
import InstanceTabs from './components/InstanceTabs'
import InstanceContent from './components/InstanceContent'
import {createInstance, 
  selectInstance, 
  delInstance,
  moveInstance,
  setFullScreen} from 'Redux/actions'
import store from 'Redux/store'
import DocumentTitle from 'react-document-title'
// import { Window, TitleBar } from 'react-desktop/macOs';
import { ipcRenderer } from 'electron';

class MainWindow extends PureComponent {
  constructor(){
    super()
  }
  componentDidMount() {
    $(window).on('keydown.redis', this.onHotKey.bind(this))
  }
  componentWillUnmount() {
    $(window).off('keydown.redis')
  }
  onHotKey(e) {
    const {instances, selectInstance} = this.props
    if (!e.ctrlKey && e.metaKey) {
      const code = e.keyCode
      if (code >= 49 && code <= 57) {
        const number = code - 49
        if (number === 8) {
          const instance = instances.get(instances.count() - 1)
          if (instance) {
            selectInstance(instance.get('key'))
            return false
          }
        } else {
          const instance = instances.get(number)
          if (instance) {
            selectInstance(instance.get('key'))
            return false
          }
        }
      }
    }
    return true
  }

  getTitle() {
    const {activeInstance} = this.props
    if (!activeInstance) {
      return ''
    }
    const version = activeInstance.get('version')
      ? `(Redis ${activeInstance.get('version')}) `
      : ''

    return version + activeInstance.get('title')
  }
  windowAction(type){
    switch (type) {
      case 'min':
        ipcRenderer.send('app-min');
        break;
      case 'max':
        ipcRenderer.send('app-max');
        break;
        break;
      case 'fullmax':
        this.props.setFullScreen();
        ipcRenderer.send('app-fullmax');
        break;
      case 'close':
        ipcRenderer.send('app-close');
        break;
    }
  }
  render() {
    const {instances, activeInstance, createInstance,
      selectInstance, delInstance, moveInstance} = this.props

    return (
      <DocumentTitle title={this.getTitle()}>
        <div className="window" style={{ minWidth: "895px" }}>
          <InstanceTabs
            instances={instances}
            onCreateInstance={createInstance}
            onSelectInstance={selectInstance}
            onDelInstance={delInstance}
            onMoveInstance={moveInstance}
            activeInstanceKey={activeInstance.get('key')}
          />
          <InstanceContent
            instances={instances}
            onDelInstance={delInstance}
            activeInstanceKey={activeInstance.get('key')}
          />
        </div>
      </DocumentTitle>
    )
  }
}

const selector = createSelector(
  state => state.instances,
  state => state.activeInstanceKey,
  state => state.windowAction.fullscreen,
  (instances, activeInstanceKey, fullscreen) => {
    return {
      instances,
      activeInstance: instances.find(instance => instance.get('key') === activeInstanceKey),
      fullscreen
    }
  }
)

const mapDispatchToProps = {
  createInstance,
  selectInstance,
  delInstance,
  moveInstance,
  setFullScreen
}

const MainWindowContainer = connect(selector, mapDispatchToProps)(MainWindow)

export default <Provider store={store}>
  <MainWindowContainer/>
</Provider>
