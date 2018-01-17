'use strict'

import React from 'react'
import store from 'Redux/store'
import Immutable from 'immutable'
import {remote} from 'electron'
import fs from 'fs'

require('./index.scss')

class Config extends React.PureComponent {
  constructor() {
    super()
    this.state = {
      data: new Immutable.Map()
    }
  }

  getProp(property) {
    if (this.state.data.has(property)) {
      return this.state.data.get(property)
    }
    return this.props.favorite ? this.props.favorite.get(property) : ''
  }

  setProp(property, value) {
    this.setState({
      data: typeof property === 'string' ? this.state.data.set(property, value) : this.state.data.merge(property),
      changed: Boolean(this.props.favorite)
    })
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.connect && nextProps.connect) {
      this.connect()
    }
    if (this.props.favorite || nextProps.favorite) {
      const leaving = !this.props.favorite || !nextProps.favorite ||
        (this.props.favorite.get('key') !== nextProps.favorite.get('key'))
      if (leaving) {
        this.setState({changed: false, data: new Immutable.Map()})
      }
    }
  }

  connect() {
    const {favorite, connectToRedis} = this.props
    const data = this.state.data
    const config = favorite ? favorite.merge(data).toJS() : data.toJS()
    config.host = config.host || 'localhost'
    config.port = config.port || '6379'
    config.sshPort = config.sshPort || '22'
    connectToRedis(config)
    this.save()
  }

  handleChange(property, e) {
    let value = e.target.value
    if (property === 'ssh' || property === 'ssl') {
      value = e.target.checked
    }
    this.setProp(property, value)
  }

  duplicate() {
    if (this.props.favorite) {
      const data = Object.assign(this.props.favorite.toJS(), this.state.data.toJS())
      delete data.key
      this.props.onDuplicate(data)
    } else {
      const data = this.state.data.toJS()
      data.name = '快速连接'
      this.props.onDuplicate(data)
    }
  }

  save() {
    if (this.props.favorite && this.state.changed) {
      this.props.onSave(this.state.data.toJS())
      this.setState({changed: false, data: new Immutable.Map()})
    }
  }

  renderCertInput(label, id) {
    return (<div className="nt-form-row">
      <label htmlFor="cert">{label}:</label>
      <input
        type="text"
        id={id}
        readOnly
        value={this.getProp(`${id}File`)}
        placeholder={`Select ${label} File (PEM)`}
        />
      <button
        className={'icon icon-dot-3 ssh-key'}
        onClick={() => {
          const win = remote.getCurrentWindow()
          const files = remote.dialog.showOpenDialog(win, {
            properties: ['openFile']
          })
          if (files && files.length) {
            const file = files[0]
            const content = fs.readFileSync(file, 'utf8')
            this.setProp({[id]: content, [`${id}File`]: file})
          }
        }}
        />
    </div>)
  }

  render() {
    return (<div>
      <div className="nt-box" style={{width: 500, margin: '60px auto 0'}}>
        <div className="nt-form-row" style={{display: this.props.favorite ? 'block' : 'none'}}>
          <label htmlFor="name">连接名称:</label>
          <input type="text" id="name" value={this.getProp('name')} onChange={this.handleChange.bind(this, 'name')} placeholder="Bookmark name"/>
        </div>
        <div className="nt-form-row">
          <label htmlFor="host">主机地址:</label>
          <input type="text" id="host" value={this.getProp('host')} onChange={this.handleChange.bind(this, 'host')} placeholder="localhost"/>
        </div>
        <div className="nt-form-row">
          <label htmlFor="port">主机端口:</label>
          <input type="text" id="port" value={this.getProp('port')} onChange={this.handleChange.bind(this, 'port')} placeholder="6379"/>
        </div>
        <div className="nt-form-row">
          <label htmlFor="password">主机密码:</label>
          <input type="password" id="password" onChange={this.handleChange.bind(this, 'password')} value={this.getProp('password')}/>
        </div>
        <div className="nt-form-row">
          <label htmlFor="ssl">启用SSL:</label>
          <input type="checkbox" id="ssl" onChange={this.handleChange.bind(this, 'ssl')} checked={this.getProp('ssl')}/>
        </div>
        <div style={{display: this.getProp('ssl') ? 'block' : 'none'}}>
          {this.renderCertInput('私钥Key', 'tlskey')}
          {this.renderCertInput('证书Certificate', 'tlscert')}
          {this.renderCertInput('根证书CA', 'tlsca')}
        </div>
        <div className="nt-form-row">
          <label htmlFor="ssh">SSH隧道:</label>
          <input type="checkbox" id="ssh" onChange={this.handleChange.bind(this, 'ssh')} checked={this.getProp('ssh')}/>
        </div>
        <div style={{display: this.getProp('ssh') ? 'block' : 'none'}}>
          <div className="nt-form-row">
            <label htmlFor="sshHost">SSH主机地址:</label>
            <input type="text" id="sshHost" onChange={this.handleChange.bind(this, 'sshHost')} value={this.getProp('sshHost')} placeholder=""/>
          </div>
          <div className="nt-form-row">
            <label htmlFor="sshUser">SSH用户:</label>
            <input type="text" id="sshUser" onChange={this.handleChange.bind(this, 'sshUser')} value={this.getProp('sshUser')} placeholder=""/>
          </div>
          <div className="nt-form-row">
            <label htmlFor="sshPassword">SSH {this.getProp('sshKey') ? '密钥' : '密码'}:</label>
            <input
              type={this.getProp('sshKeyFile') ? 'text' : 'password'}
              id="sshPassword"
              readOnly={Boolean(this.getProp('sshKey'))}
              onChange={this.handleChange.bind(this, 'sshPassword')}
              value={this.getProp('sshKeyFile') || this.getProp('sshPassword')}
              placeholder=""
              />
            <button
              className={'icon icon-key ssh-key' + (this.getProp('sshKey') ? ' is-active' : '')}
              onClick={() => {
                if (this.getProp('sshKey')) {
                  this.setProp({
                    sshKey: false,
                    sshKeyFile: false
                  })
                  return
                }
                const win = remote.getCurrentWindow()
                const files = remote.dialog.showOpenDialog(win, {
                  message: '选择一个私钥(默认在 ~/.ssh 目录下。)',
                  properties: ['openFile', 'showHiddenFiles']
                })
                if (files && files.length) {
                  const file = files[0]
                  const content = fs.readFileSync(file, 'utf8')
                  this.setProp({sshKey: content, sshKeyFile: file})
                }
              }}
              />
          </div>
          <div className="nt-form-row" style={{display: this.getProp('sshKey') && this.getProp('sshKey').indexOf('ENCRYPTED') > -1 ? 'block' : 'none'}}>
            <label htmlFor="sshKeyPassphrase">SSH Key密码:</label>
            <input type="password" id="sshKeyPassphrase" onChange={this.handleChange.bind(this, 'sshKeyPassphrase')} value={this.getProp('sshKeyPassphrase')}/>
          </div>
          <div className="nt-form-row">
            <label htmlFor="sshPort">SSH 端口:</label>
            <input type="text" id="sshPort" onChange={this.handleChange.bind(this, 'sshPort')} value={this.getProp('sshPort')}/>
          </div>
        </div>
      </div>
      <div className="nt-button-group nt-button-group--pull-right" style={{width: 500, margin: '10px auto 0', paddingBottom: 10}}>
        <button
          className="nt-button" style={{float: 'left'}} onClick={() => {
            this.duplicate()
          }}
                                                        >{ this.props.favorite ? '复制项目' : '添加到收藏' }</button>
        <button
          className="nt-button"
          style={{display: this.state.changed ? 'inline-block' : 'none'}}
          onClick={() => {
            this.save()
          }}
          >保存修改</button>
        <button
          disabled={Boolean(this.props.connectStatus)} ref="connectButton" className="nt-button nt-button--primary" onClick={() => {
            this.connect()
          }}
                                                                                                                    >{this.props.connectStatus || (this.state.changed ? '保存并连接' : '连接')}</button>
      </div>
    </div>)
  }
}

export default Config
