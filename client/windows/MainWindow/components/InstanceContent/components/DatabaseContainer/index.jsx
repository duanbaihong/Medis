'use strict'

import React from 'react'
import {connect} from 'react-redux'
import SplitPane from 'react-split-pane'
import KeyBrowser from './components/KeyBrowser'
import Content from './components/Content'
import {List} from 'immutable'
require('./index.scss')

class Database extends React.PureComponent {
  constructor() {
    super()
    this.$window=$(window)
    this.state = {
      sidebarWidth: 260,
      key: null,
      db: 0,
      version: 0,
      metaVersion: 0,
      pattern: '',
      tab: '内容(Content)',
      clientHeight: this.$window.height() - $('.tab-group').height()-64
    }
  }
  componentWillMount() {
    let {redis,config}=this.props;
    if(config.curmodel!=redis.serverInfo.redis_mode){
      showModal({
        title: '连接警告?',
        button: ['是','否'],
        content: `你选择连接模式${config.curmodel}与当前连接实例模式${redis.serverInfo.redis_mode}不一致！你是否要继续？`
      }).then(() => {

      }).catch((e)=>{
        redis.emit('end',false);
      })
    }
    if (config.curmodel=='sentinel'){
      this.setState({tab:"终端(Terminal)"})
    }
  }
  componentDidMount() {
    this.updateLayoutBinded = this.updateLayout.bind(this)
    $(window).on('resize', this.updateLayoutBinded)
    this.updateLayout()
  }

  componentWillUnmount() {
    $(window).off('resize', this.updateLayoutBinded)
  }

  updateLayout() {
    this.setState({
      clientHeight: this.$window.height() - $('.tab-group').height()-64
    })
  }

  handleTabChange(tab) {
    this.setState(tab)
  }

  handleCreateKey(key) {
    this.setState({key, pattern: key})
  }

  render() {
    let {redis,config,connectionKey}=this.props
    const content=(<Content
        height={this.state.clientHeight}
        keyName={this.state.key}
        version={this.state.version}
        metaVersion={this.state.metaVersion}
        connectionKey={connectionKey}
        redis={redis}
        config={config}
        db={this.state.db}
        onDatabaseChange={db => this.setState({db})}
        onSelectTab={this.handleTabChange.bind(this)}
        tab={this.state.tab}
        />)
    const keybrow=(<KeyBrowser
        patterns={this.props.patterns}
        pattern={this.state.pattern}
        height={this.state.clientHeight}
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
        />)
    return (config.curmodel!='sentinel' && this.props.redis.serverInfo.redis_mode!='sentinel')?(
      <SplitPane
      className="pane-group"
      split="vertical"
      minSize={250}
      defaultSize={260}
      ref="node"
      maxSize={450}
      onChange={size => {
        this.setState({sidebarWidth: size})
      }}
      >
      {keybrow}
      {content}
    </SplitPane>):(
      <div className='pane-group'>{content}</div>
    )
  } 
}

function mapStateToProps(state, {instance}) {
  return {
    patterns: state.patterns.get(`${instance.get('connectionKey')}|0`, List()),
    redis: instance.get('redis'),
    config: instance.get('config'),
    connectionKey: instance.get('connectionKey')
  }
}

export default connect(mapStateToProps)(Database)
