'use strict'

import React from 'react'
import {LineChart,CartesianGrid,XAxis,YAxis,Line,Tooltip,Legend} from 'recharts'
import commands from 'redis-commands'
import {clone} from 'lodash'

require('./status.scss')

class Status extends React.Component {
  constructor() {
    super()
    this.$window=$(window);
    this.state = {
      data: [
        {name: 'Page A', uv: 4000, pv: 2400, amt: 2400},
        {name: 'Page B', uv: 3000, pv: 1398, amt: 2210},
        {name: 'Page C', uv: 2000, pv: 9800, amt: 2290},
        {name: 'Page D', uv: 2780, pv: 3908, amt: 2000},
        {name: 'Page D', uv: 2780, pv: 3908, amt: 2000},
        {name: 'Page D', uv: 2780, pv: 3908, amt: 2000},
        {name: 'Page D', uv: 2780, pv: 3908, amt: 2000},
        {name: 'Page E', uv: 1890, pv: 4800, amt: 2181},
        {name: 'Page F', uv: 2390, pv: 3800, amt: 2500},
        {name: 'Page G', uv: 3490, pv: 4300, amt: 2100},
      ],
      width: 500
    }
  }
  updateWidth(){
    this.$window.on('resize',()=>{
      this.state.width=$(this.refs.divwidth).width()-50;
      console.log($(this.refs.divwidth).width())
    })
  }
  componentDidMount() {
    this.state.width=$(this.refs.divwidth).width();
    this.updateWidth();
  }

  render() {
    return (<div style={this.props.style} ref='divwidth' className="redisStatus" >
        <LineChart width={this.state.width} height={300} data={this.state.data}>
          <XAxis dataKey="name" />
          <YAxis/>
          <CartesianGrid stroke="#eee" strokeDasharray="4 4"/>
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="uv" stroke="#8884d8" strokeWidth={2} />
          <Line type="monotone" dataKey="pv" stroke="#82ca9d" strokeWidth={2} />
        </LineChart>
      </div>)
  }
}

export default Status