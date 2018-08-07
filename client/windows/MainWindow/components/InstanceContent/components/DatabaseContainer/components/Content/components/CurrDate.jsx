'use strict'

import React from 'react'


class CurrDate extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      Y: "1970",
      M: "01",
      D: "01",
      H: "01",
      m: "01",
      s: "01"
    }
    this.stoptime
  }
  getTime(){
    let now=new Date()
    if(this._isMounted){
      this.setState({
          Y: now.getFullYear(),
          M: now.getMonth()<10?"0"+(now.getMonth()+1):now.getMonth()+1,
          D: now.getDate()<10?"0"+now.getDate():now.getDate(),
          H: now.getHours()<10?"0"+now.getHours():now.getHours(),
          m: now.getMinutes()<10?"0"+now.getMinutes():now.getMinutes(),
          s: now.getSeconds()<10?"0"+now.getSeconds():now.getSeconds()
        })
      }
  }
  componentDidMount() {
    this._isMounted=true;
    this.stoptime=setInterval(this.getTime.bind(this),1000)
  }
  componentWillUnmount() {
    this._isMounted=false;
    clearInterval(this.stoptime);
  }
  render() {
    return (
      <div style={{float: 'right',paddingRight: "10px"}}>
        {this.state.Y+"/"+this.state.M+"/"+this.state.D+" "+this.state.H+":"+this.state.m+":"+this.state.s}
      </div>
    )
  }
}

export default CurrDate;