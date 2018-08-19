'use strict'

import React from 'react'
import TabBar from './components/TabBar'
import KeyContent from './components/KeyContent'
import Terminal from './components/Terminal'
import Config from './components/Config'
import Status from './components/Status'
import Footer from './components/Footer'
require('./index.scss')
class Content extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      pattern: '',
      db: 0,
      version: 0
    }
    this.intervalObj=''
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
  setRedisInfo(redis){
    if(this._isMounted){
      redis.info(function(err,info) {
        if (err) {
          return callback(err);
        }
        if (typeof info !== 'string') {
          return callback(info);
        }
        var lines = info.split('\r\n');
        for (var i = 0; i < lines.length; ++i) {
          var parts = lines[i].split(':');
          if (parts[1]) {
            redis.serverInfo[parts[0]] = parts[1];
          }
        }
      })
    }
  }
  componentDidMount() {
    this.init(this.props.keyName);
    this._isMounted=true;
    this.intervalObj=setInterval(this.setRedisInfo.bind(this),1000,this.props.redis)
  }
  componentWillUnmount(){
    this._isMounted=false;
    clearInterval(this.intervalObj);
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
    const contentValue=(<KeyContent
        style={{display: this.props.tab === '内容(Content)' ? 'block' : 'none'}}
        keyName={this.props.keyName}
        height={this.props.height}
        keyType={this.state.keyType}
        redis={this.props.redis}
        config={this.props.config}
        onKeyContentChange={() => {
          this.setState({version: this.state.version + 1})
        }}
        />)
    return (<div className="pane sidebar" >
      <TabBar
        onSelectTab={this.props.onSelectTab}
        redis={this.props.redis}
        config={this.props.config}
        tab={this.props.tab}
        />
        {contentValue}
      <Terminal
        style={{display: this.props.tab === '终端(Terminal)'? 'block' : 'none'}}
        redis={this.props.redis}
        config={this.props.config}
        connectionKey={this.props.connectionKey}
        onDatabaseChange={this.props.onDatabaseChange}
        />
      <Config
        style={{display: this.props.tab === '系统配置(Config)' ? 'block' : 'none'}}
        redis={this.props.redis}
        config={this.props.config}
        connectionKey={this.props.connectionKey}
        />
      <Status
        style={{display: this.props.tab === '状态(Status)' ? 'block' : 'none'}}
        redis={this.props.redis}
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
