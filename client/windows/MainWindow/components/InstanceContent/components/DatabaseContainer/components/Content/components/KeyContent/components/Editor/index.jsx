'use strict'
 
import React from 'react'
import ReactDOM from 'react-dom'
import {UnControlled as CodeMirror} from 'react-codemirror2'
import jsonlint from 'jsonlint'

require('codemirror/addon/dialog/dialog.css')
require('codemirror/lib/codemirror.css')
require('codemirror/addon/lint/lint.css')

require('codemirror/mode/javascript/javascript')
require('codemirror/addon/lint/lint')
require('codemirror/addon/lint/json-lint')
require('codemirror/addon/selection/active-line')
require('codemirror/addon/edit/closebrackets')
require('codemirror/addon/edit/matchbrackets')
require('codemirror/addon/search/search')
require('codemirror/addon/search/searchcursor')
require('codemirror/addon/search/jump-to-line')
require('codemirror/addon/dialog/dialog')

window.jsonlint = jsonlint.parser
const msgpack = require('msgpack5')()

require('./index.scss')

class Editor extends React.PureComponent {
  constructor() {
    super()
    this.state = {
      currentMode: '',
      wrapping: true,
      changed: false,
      changeValue:"",
      modes: {
        raw: false,
        json: false,
        messagepack: false
      }
    }
  }

  componentDidMount() {
    this.init(this.props.buffer)
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.buffer !== this.props.buffer) {
      this.init(nextProps.buffer)
    }
  }

  init(buffer) {
    if (!buffer) {
      this.setState({currentMode: '', changed: false})
      return
    }
    const content = buffer.toString()
    const modes = {}
    modes.raw = content
    modes.json = tryFormatJSON(content, true)
    modes.messagepack = modes.json ? false : tryFormatMessagepack(buffer, true)
    let currentMode = 'raw'
    if (modes.messagepack) {
      currentMode = 'messagepack'
    } else if (modes.json) {
      currentMode = 'json'
    }
    this.setState({modes, currentMode, changed: false})
  }

  save() {
    let content = this.state.changeValue
    if (this.state.currentMode === 'json') {
      content = tryFormatJSON(this.state.changeValue)
      if (!content) {
        alert('The json is invalid. Please check again.')
        return
      }
    } else if (this.state.currentMode === 'messagepack') {
      content = tryFormatMessagepack(this.state.changeValue)
      if (!content) {
        alert('The json is invalid. Please check again.')
        return
      }
      content = msgpack.encode(JSON.parse(content))
    }
    this.props.onSave(content, err => {
      if (err) {
        alert(`Redis save failed: ${err.message}`)
      } else {
        this.init(typeof content === 'string' ? Buffer.from(content) : content)
      }
    })
  }

  updateContent(mode, content) {
    let content1,content2
    if(this.state.currentMode==='json'){
      content1=tryFormatJSON(content)
      content2=tryFormatJSON(this.state.modes[mode])
    }
    if(this.state.currentMode==='messagepack'){
      content1=tryFormatMessagepack(content)
      content2=tryFormatMessagepack(this.state.modes[mode])
    }
    if(this.state.currentMode==='raw'){
      content1=content
      content2=this.state.modes[mode]
    }
    if (content1 !== content2) {
      this.setState({changed: true,changeValue: content})
    }
  }

  updateMode(evt) {
    const newMode = evt.target.value
    this.setState({currentMode: newMode})
  }

  focus() {
    const codemirror = this.refs.codemirror
    if (codemirror) {
      const node = ReactDOM.findDOMNode(codemirror)
      if (node) {
        node.focus()
      }
    }
  }

  handleKeyDown(evt) {
    if (!evt.ctrlKey && evt.metaKey && evt.keyCode === 83) {
      this.save()
      evt.preventDefault()
      evt.stopPropagation()
    }
  }

  render() {
    let options={
          mode: 'none',
          tabSize: 2,
          styleActiveLine: true,
          autoCloseBrackets: true,
          indentWithTabs: true,
          matchTags: true,
          lineWrapping: this.state.wrapping,
          gutters: ['CodeMirror-lint-markers'],
          lineNumbers: true
        }
    if (this.state.currentMode === 'json') {
      options=Object.assign(options,{
        mode: {
          name: 'javascript',
          json: true
        },
        lint: Boolean(this.state.modes.json)
      })
    } else if (this.state.currentMode === 'messagepack') {
      options=Object.assign(options,{
        mode: {
          name: 'javascript',
          json: true
        },
        lint: Boolean(this.state.modes.messagepack)
      })
    }
    return (<div className="Editor" onKeyDown={this.handleKeyDown.bind(this)} >
      <CodeMirror
        className="RactCodeMirror"
        value={this.state.modes[this.state.currentMode]}
        options={options}
        // editorDidMount={editor => { this.editor = editor }}
        onChange={(editor, data, value)=>this.updateContent(this.state.currentMode,value)} />

      <div className="operation-pannel" >
        <label className="wrap-selector" ref="wrapSelector">
          <input
            type="checkbox"
            checked={this.state.wrapping}
            onChange={evt => this.setState({wrapping: evt.target.checked})}
            />
          <span>自动换行</span>
        </label>
        <select
          className="mode-selector"
          value={this.state.currentMode}
          onChange={this.updateMode.bind(this)}
          >
          <option value="raw" disabled={typeof this.state.modes.raw !== 'string'}>Raw</option>
          <option value="json" disabled={typeof this.state.modes.json !== 'string'}>JSON</option>
          <option value="messagepack" disabled={typeof this.state.modes.messagepack !== 'string'}>MessagePack</option>
        </select>
        <button
          className="nt-button"
          disabled={!this.state.changed}
          onClick={this.save.bind(this)}
          >保存改变</button>
      </div>
    </div>)
  }
}

export default Editor

function tryFormatJSON(jsonString, beautify) {
  try {
    const o = JSON.parse(jsonString)
    if (o && typeof o === 'object' && o !== null) {
      if (beautify) {
        return JSON.stringify(o, null, '\t')
      }
      return JSON.stringify(o)
    }
  } catch (e) { /**/ }

  return false
}

function tryFormatMessagepack(buffer, beautify) {
  try {
    let o
    if (typeof buffer === 'string') {
      o = JSON.parse(buffer)
    } else {
      o = msgpack.decode(buffer)
    }
    if (o && typeof o === 'object' && o !== null) {
      if (beautify) {
        return JSON.stringify(o, null, '\t')
      }
      return JSON.stringify(o)
    }
  } catch (e) { /**/ }

  return false
}
