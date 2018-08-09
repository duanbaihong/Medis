'use strict'

import React from 'react'
import BaseContent from './BaseContent'
import SplitPane from 'react-split-pane'
import {Table, Column} from 'fixed-data-table-contextmenu'
import Editor from './Editor'
import SortHeaderCell from './SortHeaderCell'
import AddButton from '../../../../AddButton'
import ReactDOM from 'react-dom'

class ListContent extends BaseContent {
  save(value, callback) {
    if (typeof this.state.selectedIndex === 'number') {
      this.state.members[this.state.selectedIndex] = value.toString()
      this.setState({members: this.state.members})
      this.props.redis.lset(this.state.keyName, this.state.selectedIndex, value, (err, res) => {
        this.props.onKeyContentChange()
        callback(err, res)
      })
    } else {
      alert('Please wait for data been loaded before saving.')
    }
  }

  create() {
    return this.props.redis.lpush(this.state.keyName, '')
  }

  load(index) {
    if (!super.load(index)) {
      return
    }

    const from = this.state.members.length
    const to = Math.min(from === 0 ? 200 : from + 1000, this.state.length - 1)
    if (to < from) {
      return
    }

    this.props.redis.lrange(this.state.keyName, from, to, (_, results) => {
      const diff = to - from + 1 - results.length
      this.setState({
        members: this.state.members.concat(results),
        length: this.state.length - diff
      }, () => {
        if (typeof this.state.selectedIndex !== 'number' && this.state.members.length) {
          this.handleSelect(null, 0)
        }
        this.loading = false
        if (this.state.members.length - 1 < this.maxRow && !diff) {
          this.load()
        }
      })
    })
  }

  handleOrderChange(desc) {
    this.setState({desc})
  }

  handleSelect(_, selectedIndex) {
    const content = this.state.members[this.state.desc ? this.state.length - 1 - selectedIndex : selectedIndex]
    if (typeof content !== 'undefined') {
      this.setState({selectedIndex, content})
    } else {
      this.setState({selectedIndex: null, content: null})
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
        this.props.redis.lremindex(this.state.keyName, this.state.selectedIndex)
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
        delete: {name: '删除'}
      }
    })
  }

  insert() {
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
        minSize={80}
        split="vertical"
        ref="node"
        defaultSize={this.props.contentBarWidth}
        onChange={this.props.setSize.bind(null, 'content')}
      >
      <div
        tabIndex="0"
        ref="table"
        onKeyDown={this.handleKeyDown.bind(this)}
        className={'base-content ' + this.randomClass}
        >
        <Table
          rowHeight={24}
          rowsCount={this.state.length}
          rowClassNameGetter={this.rowClassGetter.bind(this)}
          onRowClick={this.handleSelect.bind(this)}
          onRowContextMenu={this.showContextMenu.bind(this)}
          isColumnResizing={false}
          onColumnResizeEndCallback={this.props.setSize.bind(null, 'index')}
          width={this.props.contentBarWidth}
          height={this.props.height}
          headerHeight={24}
          >
          <Column
            header={
              <SortHeaderCell
                title="序号"
                onOrderChange={desc => this.setState({
                  desc,
                  selectedIndex: typeof this.state.selectedIndex === 'number' ? this.state.length - 1 - this.state.selectedIndex : null
                })}
                desc={this.state.desc}
                />
            }
            width={this.props.indexBarWidth}
            isResizable
            cell={({rowIndex}) => {
              return <div className="index-label">{ this.state.desc ? this.state.length - 1 - rowIndex : rowIndex }</div>
            }}
            />
          <Column
            header={
              <AddButton
                title="成员" onClick={() => {
                  showModal({
                    button: '插入成员',
                    form: {
                      type: 'object',
                      properties: {
                        '插入到:': {
                          type: 'string',
                          enum: ['前', '后']
                        }
                      }
                    }
                  }).then(res => {
                    return res['插入到:'] === '前' ? 'lpush' : 'rpush'
                  }).then(method => {
                    const data = '新成员'
                    this.props.redis[method](this.state.keyName, data).then(() => {
                      this.state.members[method === 'lpush' ? 'unshift' : 'push'](data)
                      this.setState({
                        members: this.state.members,
                        length: this.state.length + 1
                      }, () => {
                        this.props.onKeyContentChange()
                        this.handleSelect(null, method === 'lpush' ? 0 : this.state.members.length - 1)
                      })
                    })
                  })
                }}
                             />
            }
            width={this.props.contentBarWidth - this.props.indexBarWidth}
            cell={({rowIndex}) => {
              const data = this.state.members[this.state.desc ? this.state.length - 1 - rowIndex : rowIndex]
              if (typeof data === 'undefined') {
                this.load(rowIndex)
                return 'Loading...'
              }
              return <div className="overflow-wrapper"><span>{ data }</span></div>
            }}
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

export default ListContent
