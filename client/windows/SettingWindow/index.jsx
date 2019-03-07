import React from 'react'
import ReactDOM from 'react-dom'
import {connect} from 'react-redux'
import {createPattern, reloadPatterns, updatePattern, removePattern} from 'Redux/actions'
import {List} from 'immutable'

require('./app.scss')

class App extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {index: 0}
  }

  handleChange(property, e) {
    this.setState({[property]: e.target.value})
  }

  render() {
    return (
      <div className="window" style={{"-webkitAppRegion": "drag"}}>
        <div class="window-content">
          <div class="pane-group">
            <div class="pane pane-sm sidebar">
              <nav class="nav-group">
                <h5 class="nav-group-title">Favorites</h5>
                <a class="nav-group-item active">
                  <span class="icon icon-home"></span>
                  connors
                </a>
                <span class="nav-group-item">
                  <span class="icon icon-download"></span>
                  Downloads
                </span>
                <span class="nav-group-item">
                  <span class="icon icon-folder"></span>
                  Documents
                </span>
                <span class="nav-group-item">
                  <span class="icon icon-print"></span>
                  Applications
                </span>
                <span class="nav-group-item">
                  <span class="icon icon-cloud"></span>
                  Desktop
                </span>
              </nav>
              <nav class="nav-group">
                <h5 class="nav-group-title">Devices</h5>
                <span class="nav-group-item">
                  <span class="icon icon-drive"></span>
                  Backup disk
                </span>
                <span class="nav-group-item">
                  <span class="icon icon-drive"></span>
                  Backup disk
                </span>
                <span class="nav-group-item">
                  <span class="icon icon-drive"></span>
                  Backup disk
                </span>
              </nav>
            </div>
            <div class="pane"></div>
          </div>
        </div>
      </div>
      )
  }
}

export default App
