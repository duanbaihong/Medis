'use strict'

import React from 'react'
import BaseContent from './BaseContent'
import SplitPane from 'react-split-pane'
import {Table, Column} from 'fixed-data-table-contextmenu'
import Editor from './Editor'
import AddButton from '../../../../AddButton'
import ContentEditable from '../../../../ContentEditable'
import ReactDOM from 'react-dom'
import {clipboard} from 'electron'

class HashContent extends BaseContent {
  save(value, callback) {
    if (typeof this.state.selectedIndex === 'number') {
      const [key] = this.state.members[this.state.selectedIndex]
      this.state.members[this.state.selectedIndex][1] = Buffer.from(value)
      this.setState({members: this.state.members})
      this.props.redis.hset(this.state.keyName, key, value, (err, res) => {
        this.props.onKeyContentChange()
        callback(err, res)
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
    this.props.redis.hscanBuffer(this.state.keyName, this.cursor, 'MATCH', '*', 'COUNT', count, (_, [cursor, result]) => {
      for (let i = 0; i < result.length - 1; i += 2) {
        this.state.members.push([result[i].toString(), result[i + 1]])
      }
      this.cursor = cursor
      this.setState({members: this.state.members}, () => {
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
    const item = this.state.members[selectedIndex]
    if (item) {
      this.setState({selectedIndex, content: item[1]})
    }
  }

  handleKeyDown(e) {
    if (typeof this.state.selectedIndex === 'number' && typeof this.state.editableIndex !== 'number') {
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
      title: '删除选中项目?',
      button: '删除',
      content: '你确定要删除选中的项目，删除后将无法恢复.'
    }).then(() => {
      const members = this.state.members
      const deleted = members.splice(this.state.selectedIndex, 1)
      if (deleted.length) {
        this.props.redis.hdel(this.state.keyName, deleted[0])
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
  componentWillUnmount() {
    this._isMounted=false;
  }
  componentDidMount() {
    super.componentDidMount()
    this._isMounted=true;
    $.contextMenu({
      context: ReactDOM.findDOMNode(this.refs.table),
      selector: '.' + this.randomClass,
      trigger: 'none',
      zIndex: 99999,
      callback: (key, opt) => {
        setTimeout(() => {
          if (key === 'delete') {
            this.deleteSelectedMember()
          } else if (key === 'copy') {
            clipboard.writeText(this.state.members[this.state.selectedIndex][0])
          } else if (key === 'rename') {
            this.setState({editableIndex: this.state.selectedIndex})
          }
        }, 0)
        ReactDOM.findDOMNode(this.refs.table).focus()
      },
      items: {
        copy: {name: '拷贝到粘贴板'},
        sep1: '---------',
        rename: {name: '重命名键'},
        delete: {name: '删除键'}
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
        minSize={80}
        split="vertical"
        ref="node"
        defaultSize={this.props.contentBarWidth}
        onChange={this.props.setSize.bind(null, 'content')}
      >
      <div
        style={{marginTop: -1}}
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
          onRowDoubleClick={(evt, index) => {
            this.handleSelect(evt, index)
            this.setState({editableIndex: index})
          }}
          width={this.props.contentBarWidth}
          height={this.props.height}
          headerHeight={24}
          >
          <Column
            header={
              <AddButton
                title="key" onClick={() => {
                  showModal({
                    button: '插入成员',
                    form: {
                      type: 'object',
                      properties: {
                        'Key:': {
                          type: 'string'
                        }
                      }
                    }
                  }).then(res => {
                    const data = res['Key:']
                    const value = 'New Member'
                    this.props.redis.hsetnx(this.state.keyName, data, value).then(inserted => {
                      if (!inserted) {
                        alert('The field already exists')
                        return
                      }
                      this.state.members.push([data, Buffer.from(value)])
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
            width={this.props.contentBarWidth}
            cell={({rowIndex}) => {
              const member = this.state.members[rowIndex]
              if (!member) {
                this.load(rowIndex)
                return 'Loading...'
              }
              return (<ContentEditable
                className="ContentEditable overflow-wrapper"
                enabled={rowIndex === this.state.editableIndex}
                onChange={target => {
                  const members = this.state.members
                  const member = members[rowIndex]
                  const keyName = this.state.keyName
                  const source = member[0]
                  if (source !== target && target) {
                    this.props.redis.hexists(keyName, target).then(exists => {
                      if (exists) {
                        return showModal({
                          title: '你是否要覆盖字此字段？',
                          button: '覆盖',
                          content: `字段 "${target}" 已经存在. 你是否要覆盖字此字段？`
                        }).then(() => {
                          let found
                          for (let i = 0; i < members.length; i++) {
                            if (members[i][0] === target) {
                              found = i
                              break
                            }
                          }
                          if (typeof found === 'number') {
                            members.splice(found, 1)
                            this.setState({length: this.state.length - 1})
                          }
                        })
                      }
                    }).then(() => {
                      member[0] = target
                      this.props.redis.multi()
                      .hdel(keyName, source)
                      .hset(keyName, target, member[1]).exec()
                      this.setState({members})
                    }).catch(() => {})
                  }
                  this.setState({editableIndex: null})
                  ReactDOM.findDOMNode(this).focus()
                }}
                html={member[0]}
                />)
            }}
            />
        </Table>
      </div>
      <Editor
        buffer={this.state.content}
        onSave={this.save.bind(this)}
        />
    </SplitPane>)
  }
}

export default HashContent
