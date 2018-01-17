'use strict'

import React from 'react'

require('./index.scss')

class Content extends React.PureComponent {
  constructor() {
    super()

    this.tabs = [
      '内容(Content)',
      '终端(Terminal)',
      '系统配置(Config)'
    ]

    this.state = {activeTab: '内容(Content)'}
  }

  render() {
    return (<div className="TabBar">
      {
        this.tabs.map(tab => {
          return (<div
            className={'item' + (tab === this.state.activeTab ? ' is-active' : '')}
            key={tab}
            onClick={() => {
              this.setState({activeTab: tab})
              this.props.onSelectTab(tab)
            }}
            >
            {
              (() => {
                if (tab === '内容(Content)') {
                  return <span className="icon icon-book"/>
                } else if (tab === '终端(Terminal)') {
                  return <span className="icon icon-window"/>
                } else if (tab === '系统配置(Config)') {
                  return <span className="icon icon-cog"/>
                }
              })()
            }
            {tab}
          </div>)
        })
      }
      <div className="exitredis" ><span className="icon icon-cancel-circled"/>退出连接</div>
    </div>)
  }
}

export default Content
