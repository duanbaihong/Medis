'use strict'

import React from 'react'
import TabBar from './components/TabBar'
import KeyContent from './components/KeyContent'
import Terminal from './components/Terminal'
import Config from './components/Config'
import Status from './components/Status'
import Footer from './components/Footer'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

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
  getRedisInfo(redis){
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
    this.intervalObj=setInterval(this.getRedisInfo.bind(this),1000,this.props.redis)
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
    let contentValue=""
    switch(this.props.tab){
      case "内容(Content)":
        contentValue=(<KeyContent
          key="keycontent"
          keyName={this.props.keyName}
          height={this.props.height}
          keyType={this.state.keyType}
          redis={this.props.redis}
          config={this.props.config}
          onKeyContentChange={() => {
            this.setState({version: this.state.version + 1})
          }} />)
        break;
      case "终端(Terminal)":
        contentValue=(<Terminal
          key="contentTerminal"
          redis={this.props.redis}
          config={this.props.config}
          connectionKey={this.props.connectionKey}
          onDatabaseChange={this.props.onDatabaseChange}
          />)
        break;
      case "系统配置(Config)":
        contentValue=(<Config
          key="contentconfig"
          redis={this.props.redis}
          config={this.props.config}
          connectionKey={this.props.connectionKey}
          />)
        break;
      case "状态(Status)":
        contentValue=(<Status
          key="contentstatus"
          redis={this.props.redis}
        />)
        break;
    }
    return (<div className="pane sidebar" >
      <TabBar
        onSelectTab={this.props.onSelectTab}
        redis={this.props.redis}
        config={this.props.config}
        tab={this.props.tab}
        />
      <ReactCSSTransitionGroup
        transitionName="contentwrapper"
        component="div"
        style={{flex:1,display:"flex"}}
        transitionAppear={true}
        transitionAppearTimeout={500}
        transitionEnterTimeout={500}
        transitionLeave={false}
        // transitionLeaveTimeout={500} 
        >
        {contentValue}
      </ReactCSSTransitionGroup>
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
