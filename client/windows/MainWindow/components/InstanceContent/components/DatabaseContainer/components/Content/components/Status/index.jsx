'use strict'

import React from 'react'
import SimplePieChart from './Graphics'
// import commands from 'redis-commands'
require('./status.scss')

class Status extends React.Component {
  constructor() {
    super()
    // this.$window=$(window);
    this.state = {}
  }
  // updateWidth(){
  //   // this.$window.on('resize',()=>{
  //   //   this.state.width=$(this.refs.divwidth).width()-50;
  //   //   console.log($(this.refs.divwidth).width())
  //   // })
  // }
  componentDidMount() {
    // this.state.width=$(this.refs.divwidth).width();
    // this.updateWidth();
  }
  componentWillUnmount() {
    // delete this.$window
  }
  
  render() {
    return ( 
      <div style={this.props.style}  ref='divwidth' className="redisStatus" >
        <SimplePieChart />
      </div>)
  }
}




export default Status;