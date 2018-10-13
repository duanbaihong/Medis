'use strict'

import React,{PureComponent} from 'react'
import ReactEcharts from 'echarts-for-react';

class SimplePieChart extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      cnt: 0,
    };
  }
  onChartClick = (param, echarts) => {
    this.setState({
      cnt: this.state.cnt + 1,
    })
  };

  onChartLegendselectchanged = (param, echart) => {
    console.log(param, echart);
  };

  onChartReady = (echarts) => {
    console.log('echart is ready', echarts);
  };

  render() {
    let onEvents = {
      'click': this.onChartClick,
      'legendselectchanged': this.onChartLegendselectchanged
    };

    return (
      <ReactEcharts
        option={this.props.options}
        style={{height: "100%",width:"100%"}}
        onChartReady={this.onChartReady}
        theme={this.props.theme||''}
        onEvents={onEvents} />
    );
  }
}
export default SimplePieChart


