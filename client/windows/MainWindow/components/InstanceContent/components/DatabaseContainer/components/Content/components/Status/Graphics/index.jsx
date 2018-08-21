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
  getOption = () => ({
    title : {
      text: '内存使用率',
      x:'right'
    },
    tooltip : {
      trigger: 'item',
      padding:1,
      textStyle: {
          "fontSize": 11
        },
      formatter: "{a} <br/>{b} : {c} ({d}%)"
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      padding: 1,
      textStyle: {
          "fontSize": 11
        },
      data: ['使用内存','空闲内存']
    },
    series : [
      {
      name: '占比情况(%)',
      type: 'pie',
      radius : '55%',
      center: ['50%', '60%'],
      data:[
        {value:335, name:'使用内存'},
        {value:310, name:'空闲内存'},
      ],
      itemStyle: {
        emphasis: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.4)'
        }
      }
      }
    ]
  });

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
        option={this.getOption()}
        style={{height: "100%",width:"100%"}}
        onChartReady={this.onChartReady}
        onEvents={onEvents} />
    );
  }
}
export default SimplePieChart


