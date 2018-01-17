'use strict'

import React from 'react'

class ExitRedis extends React.Component{
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <div className={this.props.cstyle?this.props.cstyle:'exitredis'} onClick={()=>{
        alert('');
      }}>
        <span className="icon icon-cancel-circled"/>
        退出连接
      </div>
    )
  }
}

export default ExitRedis;