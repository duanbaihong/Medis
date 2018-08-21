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
      text: '某站点用户访问来源',
      x:'right'
    },
    tooltip : {
      trigger: 'item',
      formatter: "{a} <br/>{b} : {c} ({d}%)"
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: ['直接访问','邮件营销']
    },
    series : [
      {
      name: '访问来源',
      type: 'pie',
      radius : '55%',
      center: ['50%', '60%'],
      data:[
        {value:335, name:'直接访问'},
        {value:310, name:'邮件营销'},
      ],
      itemStyle: {
        emphasis: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
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
        <div className='parent'>
          <ReactEcharts
            option={this.getOption()}
            style={{height: 200,width:250}}
            onChartReady={this.onChartReady}
            onEvents={onEvents} />
          
        </div>
    );
  }
}
export default SimplePieChart


