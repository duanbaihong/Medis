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
      curClients: 0,
      historyClients:[],
      timeLine: []
    }
    this.stoptime
  }
  componentWillMount() {
    let storeData=localStorage.getItem('redisStatusData')
    if(storeData){
      try{
        this.setState(JSON.parse(storeData))
      }
      catch(err){
        console.log(err)
      }
    }
  }
  getServerInfo() {
    console.log(this.state)
    let curSec=this.props.redis.serverInfo.uptime_in_seconds
    let useMem=this.props.redis.serverInfo.used_memory
    let curClients=this.props.redis.serverInfo.connected_clients
    let tmpClientsList=this.state.historyClients;
    let tmpTimeLine=this.state.timeLine
    let tmpTime=new Date();
    tmpClientsList.push(curClients)
    tmpTimeLine.push(`${tmpTime.getHours()}:${tmpTime.getMinutes()}:${tmpTime.getSeconds()}`)
    // 保存两个小时的数据
    if(tmpClientsList.length>=7200){
      tmpClientsList.splice(0,1)
      tmpTimeLine.splice(0,1)
    }
    
    localStorage.setItem('redisStatusData',JSON.stringify({
      historyClients: tmpClientsList,
      timeLine: tmpTimeLine
    }))
    this.setState({
      runTime: this.timeFilter(curSec),
      useMem: this.byteFilter(useMem),
      curClients: curClients,
      historyClients: tmpClientsList,
      timeLine: tmpTimeLine
    })
    // console.log(this.state)
  }
  // 格式化字节
  byteFilter(bytes) {
    if(bytes>1024*1024*1024){
      return (bytes/(1024*1024*1024)).toFixed(2)+"GB"
    }else if(bytes>1024*1024){
      return (bytes/(1024*1024)).toFixed(2)+"MB"
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
      <div ref='divwidth' className="redisStatus" >
        
        <div style={{width:300,height:200,display:"inline-block",borderRadius:5,padding:5,background:"aliceblue",margin:5,float:"left"}}>
          <div style={{textAlign: "center",fontSize: "20px"}}>运行时间：{this.state.runTime}</div>
          <div style={{textAlign: "center",fontSize: "20px"}}>使用内存：{this.state.useMem}</div>
          <div style={{textAlign: "center",fontSize: "20px"}}>当前连接数：{this.state.curClients}</div>
        </div>
        <div style={{width:300,height:200,display:"inline-block",borderRadius:5,padding:5,background:"aliceblue",margin:5}}>
          <SimplePieChart />
        </div>
        <div style={{width:300,height:200,display:"inline-block",borderRadius:5,padding:5,background:"aliceblue",margin:5}}>
          <SimplePieChart />
        </div>
        <div style={{width:300,height:200,display:"inline-block",borderRadius:5,padding:5,background:"aliceblue",margin:5}}>
          <SimplePieChart />
        </div>
        <div style={{width:300,height:200,display:"inline-block",borderRadius:5,padding:5,background:"aliceblue",margin:5}}>
          <SimplePieChart />
        </div>
      </div>)
  }
}




export default Status;