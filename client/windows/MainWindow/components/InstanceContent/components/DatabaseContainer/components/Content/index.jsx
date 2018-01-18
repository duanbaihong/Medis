'use strict'

import React from 'react'
import TabBar from './components/TabBar'
import KeyContent from './components/KeyContent'
import Terminal from './components/Terminal'
import Config from './components/Config'
import Footer from './components/Footer'
require('./index.scss')
class Content extends React.PureComponent {
  constructor() {
    super()
    this.state = {
      pattern: '',
      db: 0,
      version: 0,
      tab: '内容(Content)'
    }
  }

  init(keyName) {
    this.setState({keyType: null})
    if (keyName !== null) {
      this.setState({keyType: null})
      this.props.redis.type(keyName).then(keyType => {
        if (keyName === this.props.keyName) {
          this.setState({keyType})
        }
      })
    }
  }

  componentDidMount() {
    this.init(this.props.keyName)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.keyName !== this.props.keyName || nextProps.version !== this.props.version) {
      this.init(nextProps.keyName)
    }
    if (nextProps.metaVersion !== this.props.metaVersion) {
      this.setState({version: this.state.version + 1})
    }
  }

  handleTabChange(tab) {
    this.setState({tab})
  }

  render() {
    return (<div className="pane sidebar" style={{height: '100%'}}>
      <TabBar
        onSelectTab={this.handleTabChange.bind(this)}
        disconnect={this.props.disconnect}
        />
      <KeyContent
        style={{display: this.state.tab === '内容(Content)' ? 'flex' : 'none'}}
        keyName={this.props.keyName}
        keyType={this.state.keyType}
        height={this.props.height - 66}
        redis={this.props.redis}
        onKeyContentChange={() => {
          this.setState({version: this.state.version + 1})
        }}
        />
      <Terminal
        style={{display: this.state.tab === '终端(Terminal)' ? 'block' : 'none'}}
        height={this.props.height - 67}
        redis={this.props.redis}
        connectionKey={this.props.connectionKey}
        onDatabaseChange={this.props.onDatabaseChange}
        />
      <Config
        style={{display: this.state.tab === '系统配置(Config)' ? 'block' : 'none'}}
        height={this.props.height - 67}
        redis={this.props.redis}
        connectionKey={this.props.connectionKey}
        />
      <Footer
        keyName={this.props.keyName}
        keyType={this.state.keyType}
        version={this.state.version}
        redis={this.props.redis}
        />
    </div>)
  }
}

export default Content
