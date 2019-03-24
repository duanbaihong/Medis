'use strict'

import React from 'react'
import {Tabs} from './components/draggable-tab'

require('./main.scss')

class InstanceTabs extends React.Component {
  constructor() {
    super()
  }

  render() {
    const {instances, activeInstanceKey, onCreateInstance, onSelectInstance,
      onDelInstance, onMoveInstance} = this.props

    return (<div id="instancesId" className={"instance-tabs"} style={{height: instances.toJS().length>1?"auto":0}}>
      <Tabs
        onTabAddButtonClick={() => {
          if (!$('.Modal').length) {
            onCreateInstance()
          }
        }}
        onTabSelect={key => {
          if (!$('.Modal').length) {
            onSelectInstance(key)
          }
        }}
        onTabClose={key => {
          if (!$('.Modal').length) {
            onDelInstance(key)
          }
        }}
        onTabPositionChange={onMoveInstance}
        selectedTab={activeInstanceKey}
        tabs={instances.toJS()} 
        />
    </div>)
  }
}

export default InstanceTabs
