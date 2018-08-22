'use strict'

import React, {PureComponent} from 'react'
import {connect} from 'react-redux'
import {setSize} from 'Redux/actions'
import StringContent from './components/StringContent'
import ListContent from './components/ListContent'
import SetContent from './components/SetContent'
import HashContent from './components/HashContent'
import ZSetContent from './components/ZSetContent'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

require('./index.scss')

class KeyContent extends PureComponent {
  constructor() {
    super()
    this.state = {}
  }

  render() {
    const props = {key: this.props.keyName, ...this.props}
    let view
    switch (this.props.keyType) {
    case 'string': view = <StringContent key="StringContent" {...props}/>; break
    case 'list': view = <ListContent key="ListContent" {...props}/>; break
    case 'set': view = <SetContent key="SetContent" {...props}/>; break
    case 'hash': view = <HashContent key="HashContent" {...props}/>; break
    case 'zset': view = <ZSetContent key="ZSetContent" {...props}/>; break
    case 'none':
      view = (<div key="notfound" className="notfound">
        <span className="icon icon-trash"/>
        <p>此键已经删除！</p>
        <p>The key has been deleted</p>
      </div>)
      break
    }
    return (
      <ReactCSSTransitionGroup
        transitionName="contentwrapper"
        component="div"
        transitionAppear={true}
        className={"BaseContent"}
        transitionAppearTimeout={500}
        transitionEnterTimeout={500}
        transitionLeave={false} >
          { view }
      </ReactCSSTransitionGroup>
      )
  }
}

function mapStateToProps(state) {
  return {
    contentBarWidth: state.sizes.get('contentBarWidth') || 200,
    scoreBarWidth: state.sizes.get('scoreBarWidth') || 60,
    indexBarWidth: state.sizes.get('indexBarWidth') || 60
  }
}

const mapDispatchToProps = {
  setSize
}

export default connect(mapStateToProps, mapDispatchToProps)(KeyContent)
