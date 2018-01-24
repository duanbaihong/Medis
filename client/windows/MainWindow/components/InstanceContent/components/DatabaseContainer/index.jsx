'use strict'

import React from 'react'
import {connect} from 'react-redux'
import SplitPane from 'react-split-pane'
import KeyBrowser from './components/KeyBrowser'
import Content from './components/Content'
require('./index.scss')

class Database extends React.PureComponent {
  constructor() {
    super()
    this.state = {
      sidebarWidth: 260,
      key: null,
      db: 0,
      version: 0,
      metaVersion: 0,
      pattern: '',
      tab: '内容(Content)'
    }
  }


  handleTabChange(tab) {
    // this.props.onSelectTab(tab)
    this.setState(tab)
  }

  handleCreateKey(key) {
    this.setState({key, pattern: key})
  }

  render() {
    return (<SplitPane
      className="pane-group"
      split="vertical"
      minSize={250}
      defaultSize={260}
      ref="node"
      onChange={size => {
        this.setState({sidebarWidth: size})
      }}
      >
      <KeyBrowser
        patterns={this.props.patterns}
        pattern={this.state.pattern}
        // height={this.state.clientHeight}
        width={this.state.sidebarWidth}
        redis={this.props.redis}
        connectionKey={this.props.connectionKey}
        onSelectKey={key => this.setState({key, version: this.state.version + 1})}
        onCreateKey={this.handleCreateKey.bind(this)}
        db={this.state.db}
        onDatabaseChange={db => this.setState({db})}
        onKeyMetaChange={() => this.setState({metaVersion: this.state.metaVersion + 1})}
        onSelectTab={this.handleTabChange.bind(this)}
        tab={this.state.tab}
        />
      <Content
        keyName={this.state.key}
        version={this.state.version}
        metaVersion={this.state.metaVersion}
        connectionKey={this.props.connectionKey}
        redis={this.props.redis}
        db={this.state.db}
        onDatabaseChange={db => this.setState({db})}
        onSelectTab={this.handleTabChange.bind(this)}
        tab={this.state.tab}
        />
    </SplitPane>)
  }
}

function mapStateToProps(state, {instance}) {
  return {
    patterns: state.patterns,
    redis: instance.get('redis'),
    connectionKey: instance.get('connectionKey')
  }
}

export default connect(mapStateToProps)(Database)
