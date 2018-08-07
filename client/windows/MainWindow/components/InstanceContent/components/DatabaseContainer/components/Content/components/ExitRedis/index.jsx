'use strict'

import React from 'react'


class ExitRedis extends React.Component{
  constructor(props) {
    super(props)
  }
  disconnRedis(){
    const {redis} = this.props;
    if (this.props.alert=="true"){
      showModal({
        title: '退出REDIS连接?',
        button: '确定',
        content: '你确定要退出此Redis连接吗'
      }).then(() => {
        redis.emit('end',false);
      }).catch(()=>{
        return ;
      })
    }else{
      redis.emit('end',false);
    }
  }
  render() {
    return (
      <div className={this.props.cstyle?this.props.cstyle:'exitredis'} onClick={()=>{
        this.disconnRedis()        
      }}>
        <span className="icon icon-logout"/>
        退出连接
      </div>
    )
  }
}

export default ExitRedis;