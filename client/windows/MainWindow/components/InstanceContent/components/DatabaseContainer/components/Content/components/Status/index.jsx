'use strict'

import React from 'react'
import SimplePieChart from './Graphics'
// import commands from 'redis-commands'
require('./status.scss')

class Status extends React.Component {
  constructor() {
    super()
    // this.$window=$(window);
    this.state = {
      runTime: 0,
      useMem: 0,
      curClients: 0
    }
    this.stoptime
  }
  // updateWidth(){
  //   // this.$window.on('resize',()=>{
  //   //   this.state.width=$(this.refs.divwidth).width()-50;
  //   //   console.log($(this.refs.divwidth).width())
  //   // })
  // }
  getServerInfo() {
    let curSec=this.props.redis.serverInfo.uptime_in_seconds
    let useMem=this.props.redis.serverInfo.used_memory
    let curClients=this.props.redis.serverInfo.connected_clients
    this.setState({runTime: this.timeFilter(curSec),useMem: this.byteFilter(useMem),curClients: curClients})
  }
  // 格式化字节
  byteFilter(bytes) {
    if(bytes>1024*1024*1024){
      return Math.round(bytes/(1024*1024*1024),2)+"GB"
    }else if(bytes>1024*1024){
      return Math.round(bytes/(1024*1024),2)+"MB"
    }else if(bytes>1024){
      return Math.round(bytes/(1024),2)+"KB"
    }else{
      return Math.round(bytes,0)+"B"
    }
  }
  timeFilter(secdons){
    let timeFormat="";
    let month= parseInt((secdons /(3600*24))/30,10);
    let day=parseInt(secdons /(3600*24),10);
    let hour=parseInt((secdons % (3600*24))/3600,10);
    let minute=parseInt(((secdons % (3600*24))% 3600 )/60,10);
    let seconds=secdons % 60;
    if (month>0){
      timeFormat = `${timeFormat}${month}月`
    }
    if (day>0){
      timeFormat = `${timeFormat}${day}天`
    }
    if(hour>0){
      timeFormat = `${timeFormat}${hour}时`
    }
    if(minute>0){
      timeFormat = `${timeFormat}${minute}分`
    }
    if(seconds>0){
      timeFormat = `${timeFormat}${seconds}秒`
    } 
    return timeFormat;
  }
  componentDidMount() {
    this.stoptime=setInterval(this.getServerInfo.bind(this),1000)
  }
  componentWillUnmount() {
    // delete this.$window
   clearInterval(this.stoptime);
  }
  
  render() {
    return ( 
      <div style={this.props.style}  ref='divwidth' className="redisStatus" >
        <div style={{textAlign: "center",fontSize: "20px"}}>运行时间：{this.state.runTime}</div>
        <div style={{textAlign: "center",fontSize: "20px"}}>使用内存：{this.state.useMem}</div>
        <div style={{textAlign: "center",fontSize: "20px"}}>当前连接数：{this.state.curClients}</div>
        <SimplePieChart />
      </div>)
  }
}




export default Status;