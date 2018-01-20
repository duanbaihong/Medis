'use strict'

import React from 'react'
import ExitRedis from '../ExitRedis/'

require('./index.scss')

class Content extends React.PureComponent {
  constructor() {
    super()

    this.tabs = [
      ['内容(Content)','icon-book'],
      ['终端(Terminal)','icon-window'],
      ['系统配置(Config)','icon-cog']
    ]
    this.state = {activeTab: '内容(Content)'}

  }
  componentDidMount(){
    // console.log(this.props.tab+" "+this.props.)
    // this.props.onSelectTab(this.props.tab)
    // if(this.props.tab){
    //   this.setState({activeTab: '内容(Content)'})
    // }
  }
  // componentWillReceiveProps(){
  //   this.props.onSelectTab(this.props.tab)
  // }

  render() {
    return (<div className="TabBar">
      {
        this.tabs.map(tab => {
          return (<div
            className={'item' + (tab[0] === this.props.tab ? ' is-active' : '')}
            key={tab[0]}
            onClick={() => {
              // this.setState({activeTab: tab[0]})
              this.props.onSelectTab({tab: tab[0]})
            }}
            >
            <span className={'icon '+ tab[1]} />
            {tab[0]}
          </div>)
        })
      }
      <ExitRedis redis={this.props.redis} alert="true" />
    </div>)
  }
}

export default Content
