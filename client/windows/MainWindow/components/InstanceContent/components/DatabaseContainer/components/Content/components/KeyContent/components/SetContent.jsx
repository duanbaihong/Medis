'use strict'

import React from 'react'
import BaseContent from './BaseContent'
import SplitPane from 'react-split-pane'
import {Table, Column} from 'fixed-data-table-contextmenu'
import Editor from './Editor'
import AddButton from '../../../../AddButton'
import ReactDOM from 'react-dom'

require('./BaseContent/index.scss')

class SetContent extends BaseContent {
  save(value, callback) {
    if (typeof this.state.selectedIndex === 'number') {
      const oldValue = this.state.members[this.state.selectedIndex]

      const key = this.state.keyName
      this.props.redis.sismember(key, value).then(exists => {
        if (exists) {
          callback(new Error('The value already exists in the set'))
          return
        }
        this.props.redis.multi().srem(key, oldValue).sadd(key, value).exec((err, res) => {
          if (!err) {
            this.state.members[this.state.selectedIndex] = value.toString()
            this.setState({members: this.state.members})
          }
          this.props.onKeyContentChange()
          callback(err, res)
        })
      })
    } else {
      alert('Please wait for data been loaded before saving.')
    }
  }

  load(index) {
    if (!super.load(index)) {
      return
    }
    const count = Number(this.cursor) ? 10000 : 500
    this.props.redis.sscan(this.state.keyName, this.cursor, 'COUNT', count, (_, [cursor, results]) => {
      this.cursor = cursor
      const length = Number(cursor) ? this.state.length : this.state.members.length + results.length

      this.setState({
        members: this.state.members.concat(results),
        length
      }, () => {
        if (typeof this.state.selectedIndex !== 'number' && this.state.members.length) {
          this.handleSelect(null, 0)
        }
        this.loading = false
        if (this.state.members.length - 1 < this.maxRow && Number(cursor)) {
          this.load()
        }
      })
    })
  }

  handleSelect(evt, selectedIndex) {
    const content = this.state.members[selectedIndex]
    if (typeof content !== 'undefined') {
      this.setState({selectedIndex, content})
    }
  }

  handleKeyDown(e) {
    if (typeof this.state.selectedIndex === 'number') {
      if (e.keyCode === 8) {
        this.deleteSelectedMember()
        return false
      }
      if (e.keyCode === 38) {
        if (this.state.selectedIndex > 0) {
          this.handleSelect(null, this.state.selectedIndex - 1)
        }
        return false
      }
      if (e.keyCode === 40) {
        if (this.state.selectedIndex < this.state.members.length - 1) {
          this.handleSelect(null, this.state.selectedIndex + 1)
        }
        return false
      }
    }
  }

  deleteSelectedMember() {
    if (typeof this.state.selectedIndex !== 'number') {
      return
    }
    showModal({
      title: '删除选择项目?',
      button: '删除',
      content: '你确定要删除选中的项目吗？删除后将无法恢复。'
    }).then(() => {
      const members = this.state.members
      const deleted = members.splice(this.state.selectedIndex, 1)
      if (deleted.length) {
        this.props.redis.srem(this.state.keyName, deleted)
        if (this.state.selectedIndex >= members.length - 1) {
          this.state.selectedIndex -= 1
        }
        this.setState({members, length: this.state.length - 1}, () => {
          this.props.onKeyContentChange()
          this.handleSelect(null, this.state.selectedIndex)
        })
      }
    })
  }

  componentDidMount() {
    super.componentDidMount()
    $.contextMenu({
      context: ReactDOM.findDOMNode(this.refs.table),
      selector: '.' + this.randomClass,
      trigger: 'none',
      zIndex: 99999,
      callback: (key, opt) => {
        setTimeout(() => {
          if (key === 'delete') {
            this.deleteSelectedMember()
          }
        }, 0)
        ReactDOM.findDOMNode(this.refs.table).focus()
      },
      items: {
        delete: {name: 'Delete'}
      }
    })
  }

  showContextMenu(e, row) {
    this.handleSelect(null, row)
    $(ReactDOM.findDOMNode(this.refs.table)).contextMenu({
      x: e.pageX,
      y: e.pageY,
      zIndex: 99999
    })
  }

  render() {
    return (<SplitPane
      className="pane-group"
      minSize={80}
      split="vertical"
      ref="node"
      defaultSize={this.props.contentBarWidth}
      onChange={this.props.setSize.bind(null, 'content')}
      >
      <div
        onKeyDown={this.handleKeyDown.bind(this)}
        tabIndex="0"
        ref="table"
        className={'base-content ' + this.randomClass}
        >
        <Table
          rowHeight={24}
          rowsCount={this.state.length}
          rowClassNameGetter={this.rowClassGetter.bind(this)}
          onRowContextMenu={this.showContextMenu.bind(this)}
          onRowClick={this.handleSelect.bind(this)}
          width={this.props.contentBarWidth}
          height={this.props.height}
          headerHeight={24}
          >
          <Column
            width={this.props.contentBarWidth}
            cell={({rowIndex}) => {
              const member = this.state.members[rowIndex]
              if (typeof member === 'undefined') {
                this.load(rowIndex)
                return '加载中...'
              }
              return <div className="overflow-wrapper"><span>{member}</span></div>
            }}
            header={
              <AddButton
                title="成员" onClick={() => {
                  showModal({
                    button: '插入成员',
                    form: {
                      type: 'object',
                      properties: {
                        '值:': {
                          type: 'string'
                        }
                      }
                    }
                  }).then(res => {
                    const data = res['值:']
                    return this.props.redis.sismember(this.state.keyName, data).then(exists => {
                      if (exists) {
                        const error = '成员已经存在。'
                        alert(error)
                        throw new Error(error)
                      }
                      return data
                    })
                  }).then(data => {
                    this.props.redis.sadd(this.state.keyName, data).then(() => {
                      this.state.members.push(data)
                      this.setState({
                        members: this.state.members,
                        length: this.state.length + 1
                      }, () => {
                        this.props.onKeyContentChange()
                        this.handleSelect(null, this.state.members.length - 1)
                      })
                    })
                  })
                }}
                               />
            }
          />
        </Table>
      </div>
      <Editor
        buffer={typeof this.state.content === 'string' && Buffer.from(this.state.content)}
        onSave={this.save.bind(this)}
        />
    </SplitPane>)
  }
}

export default SetContent
