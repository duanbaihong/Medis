'use strict'

import React, {PureComponent} from 'react'
import ConnectionSelectorContainer from './components/ConnectionSelectorContainer'
import DatabaseContainer from './components/DatabaseContainer'
import Modal from './components/Modal'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
require('./index.scss');
class InstanceContent extends PureComponent {
  constructor() {
    super()
    this.state = {}
  }

  // listener = 
  componentDidMount() {
    let {instances} = this.props
    window.onbeforeunload=(event) => {
      this.props.instances.map(instance=>{
        let isConRedis=instance.get('redis')
        if(isConRedis){
          isConRedis.emit('end',false)
        }
      });
      // return confirm("确定离开此页面吗？");
    }
    window.showModal = modal => {
      this.activeElement = document.activeElement
      this.setState({modal})

      return new Promise((resolve, reject) => {
        this.promise = {resolve, reject}
      })
    }
  }
  modalSubmit(result) {
    if(this.state.modal.submit){
      let err= this.state.modal.submit(result);
      if(err){
        this.setState({modal: null})
        if (this.activeElement) {
          this.activeElement.focus()
        }
      }
    }else{
      this.promise.resolve(result);
      this.setState({modal: null})
      if (this.activeElement) {
        this.activeElement.focus()
      }
    }
  }

  modalCancel() {
    this.promise.reject()
    this.setState({modal: null})
    if (this.activeElement) {
      this.activeElement.focus()
    }
  }

  componentWillUnmount() {
    delete window.showModal;
  }

  render() {
    const {instances, activeInstanceKey} = this.props
    const contents = instances.map(instance => (
      <div
        key={instance.get('key')}
        style={{display: instance.get('key') === activeInstanceKey ? 'block' : 'none'}}
        >
        <ReactCSSTransitionGroup
          transitionName="loginContainer"
          component="div"
          transitionAppear={true}
          transitionAppearTimeout={500}
          transitionEnterTimeout={500}
          transitionLeave={false}
          >
          {
           (instance.get('redis')
              ? <DatabaseContainer key="DatabaseContainer" instance={instance} />
              : <ConnectionSelectorContainer key="ConnectionSelectorContainer" instance={instance}/>)
          }
        </ReactCSSTransitionGroup>
      </div>
    ))

    return (
      <div className="main">
        <ReactCSSTransitionGroup
          transitionName="modal"
          component="div"
          transitionEnterTimeout={250}
          transitionLeaveTimeout={250}
          >
          {
          this.state.modal &&
          <Modal
            key="modal"
            {...this.state.modal}
            onSubmit={this.modalSubmit.bind(this)}
            onCancel={this.modalCancel.bind(this)}
            />
        }
        </ReactCSSTransitionGroup>
        {contents}
      </div>
    )
  }
}

export default InstanceContent
