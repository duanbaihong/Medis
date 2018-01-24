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
      version: 0
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

  render() {
    return (<div className="pane sidebar" >
      <TabBar
        onSelectTab={this.props.onSelectTab}
        redis={this.props.redis}
        tab={this.props.tab}
        />
      <KeyContent
        style={{display: this.props.tab === '内容(Content)' ? 'flex' : 'none'}}
        keyName={this.props.keyName}
        keyType={this.state.keyType}
        redis={this.props.redis}
        onKeyContentChange={() => {
          this.setState({version: this.state.version + 1})
        }}
        />
      <Terminal
        style={{display: this.props.tab === '终端(Terminal)' ? 'block' : 'none'}}
        redis={this.props.redis}
        connectionKey={this.props.connectionKey}
        onDatabaseChange={this.props.onDatabaseChange}
        />
      <Config
        style={{display: this.props.tab === '系统配置(Config)' ? 'block' : 'none'}}
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
