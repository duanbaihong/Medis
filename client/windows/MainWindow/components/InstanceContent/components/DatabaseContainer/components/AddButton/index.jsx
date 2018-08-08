import React from 'react'

require('./index.scss')

export default class AddButton extends React.PureComponent {
  render() {
    return (<div className="AddButton">
      {this.props.title}
      {
        this.props.reload && <span className="reload icon icon-cw" onClick={this.props.onReload} title='刷新键值'/>
      }
      <span className="icon icon-plus plus" onClick={this.props.onClick} title='添加键值'></span>
    </div>)
  }
}
