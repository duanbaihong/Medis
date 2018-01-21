import React from 'react'
import ReactDOM from 'react-dom'
import {connect} from 'react-redux'
import {createPattern, reloadPatterns, updatePattern, removePattern} from 'Redux/actions'
import {List} from 'immutable'

require('./app.scss')

const connectionKey = getParameterByName('arg')

class App extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {index: 0}
  }

  handleChange(property, e) {
    this.setState({[property]: e.target.value})
  }

  render() {
    const {patterns, createPattern, removePattern,updatePattern,reloadPatterns} = this.props
    const activePattern = patterns.get(this.state.index)
    return (<div className="window">
      <div className="patternList">
        <div>{
          patterns.map((pattern, index) => {
            return (<a
              key={pattern.get('key')}
              className={'nav-group-item' + (index === this.state.index ? ' is-active' : '')}
              onClick={() => {
                this.setState({index:index,name: pattern.get('name'),value: pattern.get('value')})
              }}
              >
              <span>{pattern.get('name')}</span>
            </a>)
          })
        }</div>
        <footer>
          <button
            onClick={() => {
              const index = patterns.size
              this.props.createPattern(connectionKey)
              this.setState({index})
            }}
            >+</button>
          <button
            className={activePattern ? '' : 'is-disabled'}
            onClick={() => {
              if (activePattern) {
                this.props.removePattern(connectionKey, this.state.index)
                this.setState({index: this.state.index > 0 ? this.state.index - 1 : 0})
              }
            }}
            >-</button>
        </footer>
      </div>
      <div
        key={this.state.indexKey}
        className="form nt-box"
        style={{display: activePattern ? 'block' : 'none'}}
        >
        <div className="nt-form-row nt-form-row--vertical">
          <label htmlFor="name">规则名称:</label>
          <input
            type="text" id="name"
            readOnly={!activePattern}
            value={this.state.name || (activePattern?activePattern.get('name'):"")}
            onChange={this.handleChange.bind(this, 'name')}
            />
        </div>
        <div className="nt-form-row nt-form-row--vertical">
          <label htmlFor="value">正则条件:</label>
          <input
            type="text" id="value"
            readOnly={!activePattern}
            value={ this.state.value || (activePattern?activePattern.get('value'):"")}
            onChange={this.handleChange.bind(this, 'value')}
            />
        </div>
        <div className="nt-button-group nt-button-group--pull-right" style={{margin: '10px auto 0'}}>
          <button
            className="nt-button nt-button--primary"
            onClick={() => {
              this.props.updatePattern(connectionKey, this.state.index, {
                name: this.state.name || activePattern.get('name'),
                value: this.state.value || activePattern.get('value')
              })
              alert('保存成功！')
              this.props.reloadPatterns()
              // console.info(this.state.name)
              // console.info(this.state.value)
              // console.info(this.state.index)
            }}
            >保存规则</button>
        </div>
      </div>
    </div>)
  }
}

function mapStateToProps(state) {
  return {
    patterns: state.patterns.get(connectionKey, List())
  }
}

const mapDispatchToProps = {
  updatePattern,
  reloadPatterns,
  createPattern,
  removePattern
}

export default connect(mapStateToProps, mapDispatchToProps)(App)

function getParameterByName(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]')
  const regex = new RegExp('[\\?&]' + name + '=([^&#]*)')
  const results = regex.exec(location.search)
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '))
}
