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

// xml
import XMLParser from 'react-xml-parser'


window.jsonlint = jsonlint.parser
const msgpack = require('msgpack5')()

require('./index.scss')

class Editor extends React.PureComponent {
  constructor() {
    super()
    this.randomClass = 'menu-value-' + (Math.random() * 100000 | 0)
    this.editor=null
    this.state = {
      currentMode: '',
      wrapping: true,
      changed: false,
      modes: {
        raw: false,
        json: false,
        xml: false,
        messagepack: false
      }
    }
  }

  componentDidMount() {
    this.init(this.props.buffer)
    $.contextMenu({
      context: ReactDOM.findDOMNode(this),
      selector: '.' + this.randomClass,
      zIndex: 99999,
      callback: (key, opt) => {
        setTimeout(() => {
          switch(key){
            case 'delete':
              
              break;
            case 'rename':
              
              break;
            case 'copy':
              
              break;
            case 'ttl':
              
              break;
            case 'reload':
              
              break;
            case 'turn':
             
              break;
          }
        }, 0)
        this.editor.focus()
      },
      items: {
        copy: {name: '复制',icon: 'copy'},
        reload: {name: '粘贴',icon: 'reload'},
        sep1: '---------',
        allchoise: {name: '全选',icon: 'failtime'},
        turn: {name: '转换',icon: 'copy'},
        sep2: '---------',
        delete: {name: '清空',icon:'delete'}
      }
    })
  }
  showContextMenu(v,e) {
    console.log(v)
    console.log(e)
    $(ReactDOM.findDOMNode(this)).contextMenu({
      x: e.pageX,
      y: e.pageY+1,
      zIndex: 99999
    })
  }
  componentWillUnmount() {
    this.editor=null
    $.contextMenu('destroy','.' + this.randomClass)
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
    modes.xml=(modes.json || modes.messagepack)?false:tryFormatXML(content,true)
    let currentMode = 'raw'
    if (modes.messagepack) {
      currentMode = 'messagepack'
    } else if (modes.json) {
      currentMode = 'json'
    } else if (modes.xml) {
      currentMode='xml'
    }
    this.setState({modes: Object.assign(this.state.modes,modes), currentMode, changed: false})
  }

  save() {
    let content = this.editor.getValue()
    if (this.state.currentMode === 'json') {
      content = tryFormatJSON(this.editor.getValue())
      if (!content) {
        showModal({
          title: '检查提示！',
          button: ['是'],
          content: `这JSON数据无效，请检查格式是否正确！`
        }).then(() => {

        }).catch((e)=>{
          
        })
        return
      }
    } else if (this.state.currentMode === 'messagepack') {
      content = tryFormatMessagepack(this.editor.getValue())
      if (!content) {
        showModal({
          title: '检查提示！',
          button: ['是'],
          content: `这Messagepack数据无效，请检查格式是否正确！`
        }).then(() => {

        }).catch((e)=>{
          
        })
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
      this.setState({changed: true})
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
        mode: 'application/json',
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
        onContextMenu={this.showContextMenu.bind(this)}
        options={options}
        editorDidMount={editor => { 
            this.editor = editor
            editor.focus(); 
          }}
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
          <option value="XML" disabled={typeof this.state.modes.json !== 'string'}>XML</option>
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
function tryFormatXML(xmlString,beautify) {
  // body...
  try {
    const o = new XMLParser().parseFromString(xmlString)
    if (o && typeof o === 'object' && o !== null) {
      if (beautify) {
        return XMLParser().toString(o)
      }
      return XMLParser().toString(o)
    }
  } catch (e) { /**/ }
  return false
}
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
