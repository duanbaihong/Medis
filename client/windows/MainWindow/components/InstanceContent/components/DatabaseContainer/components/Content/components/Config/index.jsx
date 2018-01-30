'use strict'

import React from 'react'
import commands from 'redis-commands'
import {clone} from 'lodash'

require('./index.scss')

class Config extends React.Component {
  constructor(props) {
    super(props)
    this.writeableFields = [
      'dbfilename',
      'requirepass',
      'masterauth',
      'maxclients',
      'appendonly',
      'save',
      'dir',
      'client-output-buffer-limit',
      'notify-keyspace-events',
      'rdbcompression',
      'repl-disable-tcp-nodelay',
      'repl-diskless-sync',
      'cluster-require-full-coverage',
      'aof-rewrite-incremental-fsync',
      'aof-load-truncated',
      'slave-serve-stale-data',
      'slave-read-only',
      'activerehashing',
      'stop-writes-on-bgsave-error',
      'lazyfree-lazy-eviction',
      'lazyfree-lazy-expire',
      'lazyfree-lazy-server-del',
      'slave-lazy-flush',
      'tcp-keepalive',
      'maxmemory-samples',
      'timeout',
      'auto-aof-rewrite-percentage',
      'auto-aof-rewrite-min-size',
      'hash-max-ziplist-entries',
      'hash-max-ziplist-value',
      'list-max-ziplist-entries',
      'list-max-ziplist-value',
      'list-max-ziplist-size',
      'list-compress-depth',
      'set-max-intset-entries',
      'zset-max-ziplist-entries',
      'zset-max-ziplist-value',
      'hll-sparse-max-bytes',
      'lua-time-limit',
      'slowlog-log-slower-than',
      'slowlog-max-len',
      'latency-monitor-threshold',
      'repl-ping-slave-period',
      'repl-timeout',
      'repl-backlog-ttl',
      'repl-diskless-sync-delay',
      'slave-priority',
      'min-slaves-to-write',
      'min-slaves-max-lag',
      'cluster-node-timeout',
      'cluster-migration-barrier',
      'cluster-slave-validity-factor',
      'hz',
      'watchdog-period',
      'maxmemory',
      'repl-backlog-size',
      'loglevel',
      'maxmemory-policy',
      'appendfsync'
    ]
    this.groups = [
      {
        name: '通用(General)',
        configs: [
          {name: 'os'},
          {name: 'redis-version'},
          {name: 'redis-git-sha1'},
          {name: 'redis-git-dirty'},
          {name: 'multiplexing-api'},
          {name: 'gcc-version'},
          {name: 'lru-clock'},
          {name: 'redis-build-id'},
          {name: 'tcp-port', type: 'number'},
          {name: 'bind'},
          {name: 'daemonize', type: 'boolean'},
          {name: 'arch-bits'},
          {name: 'process-id'},
          {name: 'redis-mode'},
          {name: 'run-id'},
          {name: 'executable'},
          {name: 'tcp-port',type:'number'},
          {name: 'uptime-in-days'},
          {name: 'uptime-in-seconds'},
          {name: 'config-file'},
          {name: 'pidfile'},
          {name: 'unixsocket'},
          {name: 'unixsocketperm', type: 'number'},
          {name: 'tcp-backlog', type: 'number'},
          {name: 'tcp-keepalive', type: 'number'},
          {name: 'timeout', type: 'number'},
          {name: 'databases', type: 'number'}
        ]
      },
      {
        name: '日志(Logging)',
        configs: [
          {name: 'loglevel', type: ['debug', 'verbose', 'notice', 'warning']},
          {name: 'logfile'},
          {name: 'syslog-enabled', type: 'boolean'},
          {name: 'syslog-ident'},
          {name: 'syslog-facility'}
        ]
      },
      {
        name: '快照(Snap Shotting)',
        configs: [
          {name: 'dbfilename'},
          {name: 'dir'},
          {name: 'save'},
          {name: 'stop-writes-on-bgsave-error', type: 'boolean'},
          {name: 'rdbcompression', type: 'boolean'},
          {name: 'rdbchecksum', type: 'boolean'}
        ]
      },
      {
        name: '同步(Replication)',
        configs: [
          {name: 'role'},
          {name: 'slaveof'},
          {name: 'master-link-status'},
          {name: 'master-host'},
          {name: 'master-port'},
          {name: 'connected-slaves'},
          {name: 'masterauth'},
          {name: 'slave0'},
          {name: 'master-link-status'},
          {name: 'master-last-io-seconds-ago'},
          {name: 'master-sync-in-progress'},
          {name: 'slave-repl-offset'},
          {name: 'master-repl-offset'},
          {name: 'repl-backlog-active'},
          {name: 'repl-backlog-first-byte-offset'},
          {name: 'repl-backlog-histlen'},
          {name: 'slave-serve-stale-data', type: 'boolean'},
          {name: 'slave-read-only', type: 'boolean'},
          {name: 'repl-diskless-sync', type: 'boolean'},
          {name: 'repl-diskless-sync-delay', type: 'number'},
          {name: 'repl-ping-slave-period', type: 'number'},
          {name: 'repl-timeout', type: 'number'},
          {name: 'repl-disable-tcp-nodelay', type: 'boolean'},
          {name: 'repl-backlog-size'},
          {name: 'repl-backlog-ttl', type: 'number'},
          {name: 'slave-priority', type: 'number'},
          {name: 'min-slaves-to-write', type: 'number'},
          {name: 'min-slaves-max-lag', type: 'number'}
        ]
      },
      {
        name: '安全(Security)',
        configs: [
          {name: 'requirepass'},
          {name: 'rename-command'}
        ]
      },
      {
        name: '配额(Limits)',
        configs: [
          {name: 'maxclients'},
          {name: 'maxmemory'},
          {name: 'maxmemory-policy', type: ['noeviction', 'volatile-lru', 'allkeys-lru', 'volatile-random', 'allkeys-random', 'volatile-ttl']},
          {name: 'maxmemory-samples', type: 'number'}
        ]
      },
      {
        name: '持久化(Append Only Mode)',
        configs: [
          {name: 'appendonly', type: 'boolean'},
          {name: 'loading',type: 'number'},
          {name: 'aof-enabled', type: 'boolean'},
          {name: 'appendfilename'},
          {name: 'appendfsync', type: ['everysec', 'always', 'no']},
          {name: 'no-appendfsync-on-rewrite', type: 'boolean'},
          {name: 'auto-aof-rewrite-percentage', type: 'number'},
          {name: 'auto-aof-rewrite-min-size'},
          {name: 'aof-load-truncated', type: 'number'},
          {name: 'rdb-changes-since-last-save',type: 'number'},
          {name: 'rdb-bgsave-in-progress',type: 'number'},
          {name: 'rdb-last-save-time',type: 'number'},
          {name: 'rdb-last-bgsave-status'},
          {name: 'rdb-last-bgsave-time-sec',type: 'number'},
          {name: 'rdb-current-bgsave-time-sec',type: 'number'},
          {name: 'aof-rewrite-in-progress',type: 'number'},
          {name: 'aof-rewrite-scheduled',type: 'number'},
          {name: 'aof-last-rewrite-time-sec',type: 'number'},
          {name: 'aof-current-rewrite-time-sec',type: 'number'},
          {name: 'aof-last-bgrewrite-status'},
          {name: 'aof-last-write-status'},
          {name: 'aof-current-size',type: 'number'},
          {name: 'aof-base-size',type: 'number'},
          {name: 'aof-pending-rewrite',type: 'number'},
          {name: 'aof-buffer-length',type: 'number'},
          {name: 'aof-rewrite-buffer-length',type: 'number'},
          {name: 'aof-pending-bio-fsync',type: 'number'},
          {name: 'aof-delayed-fsync',type: 'number'}
        ]
      },
      {
        name: 'LUA脚本(LUA Scripting)',
        configs: [
          {name: 'lua-time-limit', type: 'number'}
        ]
      },
      {
        name: '集群配置(Cluster)',
        configs: [
          {name: 'cluster-enabled', type: 'boolean'},
          {name: 'cluster-config-file'},
          {name: 'cluster-node-timeout', type: 'number'},
          {name: 'cluster-slave-validity-factor', type: 'nubmer'},
          {name: 'cluster-migration-barrier', type: 'number'},
          {name: 'cluster-require-full-coverage', type: 'boolean'}
        ]
      },
      {
        name: '慢查询日志(Slow Log)',
        configs: [
          {name: 'slowlog-log-slower-than', type: 'number'},
          {name: 'slowlog-max-len', type: 'number'}
        ]
      },
      {
        name: '监控(Latency Monitor)',
        configs: [
          {name: 'latency-monitor-threshold', type: 'number'}
        ]
      },
      {
        name: '事件提醒(Event Notification)',
        configs: [
          {name: 'notify-keyspace-events'}
        ]
      },
      {
        name: '哨兵(sentinel)',
        configs:[
          {name: 'sentinel-masters'},
          {name: 'sentinel-tilt'},
          {name: 'sentinel-running-scripts'},
          {name: 'sentinel-scripts-queue-length'},
          {name: 'sentinel-simulate-failure-flags'},
          {name: 'master0'},
          {name: 'master1'}
        ]
      },
      {
        name: '哨兵(sentinel)监听Master',
        configs:[
          {name: 'name'},
          {name: 'port'},
          {name: 'ip'},{name: 'runid'},
          {name: 'flags'},
          {name: 'link-pending-commands'},
          {name: 'link-refcount'},
          {name: 'last-ping-sent'},
          {name: 'last-ok-ping-reply'},
          {name: 'last-ping-reply'},
          {name: 'down-after-milliseconds'},
          {name: 'info-refresh'},
          {name: 'role-reported'},
          {name: 'role-reported-time'},
          {name: 'config-epoch'},
          {name: 'num-slaves'},
          {name: 'num-other-sentinels'},
          {name: 'quorum'},
          {name: 'failover-timeout'},
          {name: 'parallel-syncs'}
        ]
      },
      {
        name: '高级配置(Advanced Config)',
        configs: [
          {name: 'hash-max-ziplist-entries', type: 'number'},
          {name: 'hash-max-ziplist-value', type: 'number'},
          {name: 'list-max-ziplist-entries', type: 'number'},
          {name: 'list-max-ziplist-value', type: 'number'},
          {name: 'set-max-intset-entries', type: 'number'},
          {name: 'zset-max-ziplist-entries', type: 'number'},
          {name: 'zset-max-ziplist-value', type: 'number'},
          {name: 'hll-sparse-max-bytes', type: 'number'},
          {name: 'activerehashing', type: 'boolean'},
          {name: 'client-output-buffer-limit'},
          {name: 'hz', type: 'number'},
          {name: 'aof-rewrite-incremental-fsync', type: 'boolean'}
        ]
      }
    ]
    this.state = {
      groups: [],
      unsavedRewrites: {},
      unsavedConfigs: {}
    }
    this.load()
  }
  redismodel(model){
    let redis=this.props.redis
    if(model=='sentinel' && redis.serverInfo.redis_mode==model && model != ''){
      return redis.sentinel('masters');
    }else{
      return redis.config('get','*');
    }
  }
  load() {
    let redis=this.props.redis
    const configs = {}
    const infoGroupName={'Stats':'状态(Stats)',
                        'Memory':'内存(Memory)',
                        'Clients':'内存(Clients)',
                        'CPU':'服务器(CPU)'}
    ///////
    let cnf=this.props.config.toJS()
    let model=(cnf.curmodel != undefined?cnf.curmodel:'')
    let configtmp={}
    this.redismodel(model).then(config1 =>{
      config1=(model=='sentinel'?config1[0]:config1)
      for (let i = 0; i < config1.length - 1; i += 2) {
        configs[config1[i]] = config1[i + 1]
      }
      redis.info().then(config => {
        var tmpconf=config.replace(/_/g,"-").split("\n")
        var grps={name:'',configs: []}
        for(var v in tmpconf){
          var val=tmpconf[v].trim().split(":")
          if (/^#/.test(val[0])){
            if(grps.configs.length>0){
              this.groups.push(grps)
              grps={name:'',configs: []}
            }
            grps['name']= infoGroupName[val[0].replace(/^#\s+/,'').trim()]
          }
          if ( val[0] == "" || val[0] == undefined || /^#\s/.test(val[0])) {
            continue;
          }
          grps['configs'].push({name: val[0]})
          configs[val[0]]=val[1]
        }
        const groups = clone(this.groups, true).map(g => {
          g.configs = g.configs.map(c => {
            if (typeof configs[c.name] !== 'undefined') {
              c.value = configs[c.name]
              delete configs[c.name]
            }
            return c
          }).filter(c => typeof c.value !== 'undefined')
          return g
        }).filter(g => g.configs.length)
        if (Object.keys(configs).length) {
          groups.push({name: '其它(Other)', configs: Object.keys(configs).map(key => {
            return {
              name: key,
              value: configs[key]
            }
          })})
        }

        this.setState({
          groups,
          unsavedConfigs: {},
          unsavedRewrites: {}
        })
      })
    })
  }

  componentWillUnmount() {
    this.props.redis.removeAllListeners('select', this.onSelectBinded)
  }

  renderGroup(group) {
    return (<div
      key={group.name}
      className="config-group"
      >
      <h3>{group.name}</h3>
      { group.configs.map(this.renderConfig, this) }
    </div>)
  }

  change({name, value}) {
    this.state.unsavedConfigs[name] = value
    this.state.unsavedRewrites[name] = value
    this.setState({
      groups: this.state.groups,
      unsavedConfigs: this.state.unsavedConfigs,
      unsavedRewrites: this.state.unsavedRewrites
    })
  }

  renderConfig(config) {
    let input
    const props = {readOnly: this.writeableFields.indexOf(config.name) === -1}
    props.disabled = props.readOnly
    if (config.type === 'boolean' &&
        (config.value === 'yes' || config.value === 'no')) {
      input = (<input
        type="checkbox" checked={config.value === 'yes'} onChange={e => {
          config.value = e.target.checked ? 'yes' : 'no'
          this.change(config)
        }} {...props}
           />)
    } else if (config.type === 'number' && String(parseInt(config.value, 10)) === config.value) {
      input = (<input
        type="number" value={config.value} onChange={e => {
          config.value = e.target.value
          this.change(config)
        }} {...props}
           />)
    } else if (Array.isArray(config.type) && config.type.indexOf(config.value) !== -1) {
      input = (<select
        value={config.value} onChange={e => {
          config.value = e.target.value
          this.change(config)
        }} {...props}
           >
        {config.type.map(option => <option key={option}>{option}</option>)}
      </select>)
    } else {
      input = (<input
        type="text" value={config.value} onChange={e => {
          config.value = e.target.value
          this.change(config)
        }} {...props}
           />)
    }
    return (<div
      className="nt-form-row"
      key={config.name}
      >
      <label htmlFor={config.name}>{config.name}</label>
      { input }
      <div className="description">{config.description}</div>
    </div>)
  }

  isChanged(rewrite) {
    return Object.keys(this.state[rewrite ? 'unsavedRewrites' : 'unsavedConfigs']).length > 0
  }

  handleReload() {
    if (this.isChanged()) {
      showModal({
        title: '重新加载配置？',
        content: '你确定要重新加载配置？你现在的配置将丢失！',
        button: '重新加载'
      }).then(() => {
        this.load()
      })
    } else {
      this.load()
    }
  }

  handleSave() {
    showModal({
      title: '保存改变',
      content: '你确定要应用改变并保存到配置文件中？',
      button: '保存'
    }).then(() => {
      return this.handleApply(true)
    }).then(res => {
      return this.props.redis.config('rewrite')
    }).then(res => {
      this.setState({unsavedRewrites: {}})
    }).catch(err => {
      alert(err.message)
    })
  }

  handleApply(embed) {
    const confirm = embed ? Promise.resolve(1) : showModal({
      title: '应用改变',
      content: '你确定要应用改变？并且这个应用只能保存在当前会话，重启REDIS就会丢失。',
      button: '应用'
    })
    return confirm.then(() => {
      const pipeline = this.props.redis.pipeline()
      const unsavedConfigs = this.state.unsavedConfigs
      Object.keys(unsavedConfigs).forEach(config => {
        pipeline.config('set', config, unsavedConfigs[config])
      })
      return pipeline.exec()
    }).then(res => {
      this.setState({unsavedConfigs: {}})
    })
  }

  render() {
    return (<div style={this.props.style} className="Config">
      <div className="wrapper">
        <form>
          {
            this.state.groups.map(this.renderGroup, this)
          }
        </form>
        <div className="nt-button-group nt-button-group--pull-right">
          <button
            ref="submit"
            className="nt-button"
            onClick={this.handleReload.bind(this)}
            >重载</button>
          <button
            ref="submit"
            className="nt-button"
            disabled={!this.isChanged(true)}
            onClick={this.handleSave.bind(this)}
            >保存到config文件</button>
          <button
            ref="cancel"
            className="nt-button nt-button--primary"
            disabled={!this.isChanged()}
            onClick={() => {
              this.handleApply()
            }}
            >保存</button>
        </div>
      </div>
    </div>)
  }
}

export default Config
