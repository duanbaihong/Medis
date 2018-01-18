'use strict'

import React from 'react'
// import store from 'Redux/store'
// import {disconnect} from 'Redux/actions'

class ExitRedis extends React.Component{
  constructor(props) {
    super(props)
  }
  disconnRedis(){
    // const {disconnect} = this.props
    this.props.disconnect()
  }
  render() {
    return (
      <div className={this.props.cstyle?this.props.cstyle:'exitredis'} onClick={()=>{
        this.disconnRedis()        
      }}>
        <span className="icon icon-cancel-circled"/>
        退出连接
      </div>
    )
  }
}

export default ExitRedis;