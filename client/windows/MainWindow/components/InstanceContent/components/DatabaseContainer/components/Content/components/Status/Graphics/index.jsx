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
  getOptions = (arg) =>{
    switch(arg){
      case "connectline":
        return {
            title : {
                text: '未来一周气温变化',
                subtext: '纯属虚构'
            },
            tooltip : {
                trigger: 'axis'
            },
            legend: {
                data:['最高气温','最低气温']
            },
            toolbox: {
                show : true,
                feature : {
                    mark : {show: true},
                    dataView : {show: true, readOnly: false},
                    magicType : {show: true, type: ['line', 'bar']},
                    restore : {show: true},
                    saveAsImage : {show: true}
                }
            },
            calculable : true,
            xAxis : [
                {
                    type : 'category',
                    boundaryGap : false,
                    data : ['周一','周二','周三','周四','周五','周六','周日']
                }
            ],
            yAxis : [
                {
                    type : 'value',
                    axisLabel : {
                        formatter: '{value} °C'
                    }
                }
            ],
            series : [
                {
                    name:'最高气温',
                    type:'line',
                    data:[11, 11, 15, 13, 12, 13, 10],
                    markPoint : {
                        data : [
                            {type : 'max', name: '最大值'},
                            {type : 'min', name: '最小值'}
                        ]
                    },
                    markLine : {
                        data : [
                            {type : 'average', name: '平均值'}
                        ]
                    }
                },
                {
                    name:'最低气温',
                    type:'line',
                    data:[1, -2, 2, 5, 3, 2, 0],
                    markPoint : {
                        data : [
                            {name : '周最低', value : -2, xAxis: 1, yAxis: -1.5}
                        ]
                    },
                    markLine : {
                        data : [
                            {type : 'average', name : '平均值'}
                        ]
                    }
                }
            ]
        };
        break;
      case "memuseline":
        return {
              title : {
                  text: '某站来源',
                  subtext: '纯属虚构',
                  x:'center'
              },
              tooltip : {
                  trigger: 'item',
                  formatter: "{a} <br/>{b} : {c} ({d}%)"
              },
              legend: {
                  orient : 'vertical',
                  x : 'left',
                  data:['直接访问','邮件营销']
              },
              toolbox: {
                  show : false,
                  feature : {
                      dataView : {show: true, readOnly: false},
                      magicType : {
                          show: false, 
                          type: ['pie'],
                          option: {
                              funnel: {
                                  x: '25%',
                                  width: '50%',
                                  funnelAlign: 'left',
                                  max: 1548
                              }
                          }
                      },
                  }
              },
              calculable : false,
              series : [
                  {
                      name:'访问来源',
                      type:'pie',
                      radius : '55%',
                      center: ['50%', '60%'],
                      data:[
                          {value:335, name:'直接访问'},
                          {value:310, name:'邮件营销'}
                      ]
                  }
              ]
          };
        break;
      default:
        return {
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
        };
    }
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
        option={this.getOptions(this.props.chartType)}
        style={{height: "100%",width:"100%"}}
        onChartReady={this.onChartReady}
        onEvents={onEvents} />
    );
  }
}
export default SimplePieChart


