'use strict'

import React from 'react'
import commands from 'redis-commands'
import {clone} from 'lodash'

require('./index.scss')

class Config extends React.Component {
  constructor(props) {
    super(props)
    this.fieldType={
      "aof-enabled": 'boolean',
      "cluster-enabled": 'boolean'
    }
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
          {name: 'databases', type: 'number'},
          {name: 'atomicvar-api'},  
          {name: 'supervised',type: 'boolean'}
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
          {name: 'master-repl-offset'},
          {name: 'slave-repl-offset'},
          {name: 'slave-announce-ip'},
          {name: 'slave-announce-port'},
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
          {name: 'min-slaves-max-lag', type: 'number'},
          {name: 'master-replid'},
          {name: 'master-replid2'},
          {name: 'second-repl-offset'},
          {name: 'second-repl-offset'},
          {name: 'slave-expires-tracked-keys'},
          {name: 'slave-lazy-flush', type: 'boolean'}
        ]
      },
      {
        name: '安全(Security)',
        configs: [
          {name: 'requirepass'},
          {name: 'rename-command'},
          {name: 'protected-mode',type: 'boolean'}
        ]
      },
      {
        name: '配额(Limits)',
        configs: [
          {name: 'maxclients'},
          {name: 'maxmemory'},
          {name: 'maxmemory-policy', type: ['noeviction', 'volatile-lru', 'allkeys-lru', 'volatile-random', 'allkeys-random', 'volatile-ttl']},
          {name: 'maxmemory-samples', type: 'number'},
          {name: 'client-query-buffer-limit', type: 'number'}
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
          {name: 'aof-load-truncated', type: 'boolean'},
          {name: 'rdb-changes-since-last-save',type: 'number'},
          {name: 'rdb-bgsave-in-progress',type: 'number'},
          {name: 'rdb-last-save-time',type: 'number'},
          {name: 'rdb-last-bgsave-status',type: 'boolean'},
          {name: 'rdb-last-bgsave-time-sec',type: 'number'},
          {name: 'rdb-current-bgsave-time-sec',type: 'number'},
          {name: 'rdb-last-cow-size',type: 'number'},
          {name: 'aof-last-cow-size',type: 'number'},
          {name: 'aof-rewrite-in-progress',type: 'number'},
          {name: 'aof-rewrite-scheduled',type: 'number'},
          {name: 'aof-last-rewrite-time-sec',type: 'number'},
          {name: 'aof-current-rewrite-time-sec',type: 'number'},
          {name: 'aof-last-bgrewrite-status',type: 'boolean'},
          {name: 'aof-last-write-status',type: 'boolean'},
          {name: 'aof-current-size',type: 'number'},
          {name: 'aof-base-size',type: 'number'},
          {name: 'aof-pending-rewrite',type: 'number'},
          {name: 'aof-buffer-length',type: 'number'},
          {name: 'aof-rewrite-buffer-length',type: 'number'},
          {name: 'aof-pending-bio-fsync',type: 'number'},
          {name: 'aof-delayed-fsync',type: 'number'},
          {name: 'aof-rewrite-incremental-fsync', type: 'boolean'},
          {name: 'aof-use-rdb-preamble', type: 'boolean'}
        ]
      },
      {
        name: '集群配置(Cluster)',
        configs: [
          {name: 'cluster-enabled', type: 'boolean'},
          {name: 'cluster-state'},
          {name: 'cluster-config-file'},
          {name: 'cluster-node-timeout', type: 'number'},
          {name: 'cluster-slave-validity-factor', type: 'nubmer'},
          {name: 'cluster-migration-barrier', type: 'number'},
          {name: 'cluster-require-full-coverage', type: 'boolean'},
          {name: 'cluster-known-nodes',type:'number'},
          {name: 'cluster-size'},
          {name: 'cluster-current-epoch'},
          {name: 'cluster-my-epoch'},
          {name: 'cluster-stats-messages-ping-sent',type:'number'},
          {name: 'cluster-stats-messages-pong-sent',type:'number'},
          {name: 'cluster-stats-messages-meet-sent',type:'number'},
          {name: 'cluster-stats-messages-sent',type:'number'},
          {name: 'cluster-stats-messages-ping-received',type:'number'},
          {name: 'cluster-stats-messages-pong-received',type:'number'},
          {name: 'cluster-stats-messages-received',type:'number'},
          {name: 'cluster-slots-assigned'},
          {name: 'cluster-slots-ok'},
          {name: 'cluster-slots-pfail'},
          {name: 'cluster-slots-fail'},
          {name: 'cluster-stats-messages-update-sent'},
          {name: 'cluster-stats-messages-fail-sent'},
          {name: 'cluster-stats-messages-fail-received'},
          {name: 'cluster-announce-ip',type:'number'},
          {name: 'cluster-slave-no-failover', type: 'boolean'},
          {name: 'cluster-announce-port',type:'number'},
          {name: 'cluster-announce-bus-port',type:'number'},
        ]
      },
      {
        name: 'LUA脚本(LUA Scripting)',
        configs: [
          {name: 'lua-time-limit', type: 'number'}
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
        name: '监控延迟(Latency Monitor)',
        configs: [
          {name: 'latency-monitor-threshold', type: 'number'}
        ]
      },
      {
        name: '状态(Stats)',
        configs: [
          {name: 'total-connections-received'},
          {name: 'total-commands-processed'},
          {name: 'instantaneous-ops-per-sec'},
          {name: 'total-net-input-bytes'},
          {name: 'total-net-output-bytes'},
          {name: 'instantaneous-input-kbps'},
          {name: 'instantaneous-output-kbps'},
          {name: 'rejected-connections'},
          {name: 'sync-full'},
          {name: 'sync-partial-ok'},
          {name: 'sync-partial-err'},
          {name: 'expired-keys'},
          {name: 'evicted-keys'},
          {name: 'keyspace-hits'},
          {name: 'keyspace-misses'},
          {name: 'pubsub-channels'},
          {name: 'pubsub-patterns'},
          {name: 'latest-fork-usec'},
          {name: 'migrate-cached-sockets'}
        ]
      },
      {
        name: '内存(Memory)',
        configs: [
          {name: 'used-memory'},
          {name: 'used-memory-human'},
          {name: 'used-memory-rss'},
          {name: 'used-memory-rss-human'},
          {name: 'used-memory-peak'},
          {name: 'used-memory-peak-human'},
          {name: 'total-system-memory'},
          {name: 'total-system-memory-human'},
          {name: 'used-memory-lua'},
          {name: 'used-memory-lua-human'},
          {name: 'maxmemory-human'},
          {name: 'mem-fragmentation-ratio'},
          {name: 'mem-allocator'},
          {name: 'used-memory-peak-perc'},
          {name: 'used-memory-dataset-perc'},
          {name: 'used-memory-dataset'},
          {name: 'used-memory-overhead'},
          {name: 'used-memory-startup'},
          {name: 'activedefrag',  type: 'boolean'}
        ]
      },
      {
        name: '客户端(Clients)',
        configs: [
          {name: 'connected-clients'},
          {name: 'client-longest-output-list'},
          {name: 'client-biggest-input-buf'},
          {name: 'blocked-clients'}
        ]
      },
      {
        name: '服务器(CPU)',
        configs: [
          {name: 'used-cpu-sys'},
          {name: 'used-cpu-user'},
          {name: 'used-cpu-sys-children'},
          {name: 'used-cpu-user-children'}
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
          {name: 'master1'},
          {name: 'master2'},
          {name: 'master3'}
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
          {name: 'list-compress-depth'},
          {name: 'lazyfree-lazy-server-del', type: 'boolean'},
          {name: 'lazyfree-lazy-expire', type: 'boolean'},
          {name: 'lazyfree-lazy-eviction', type: 'boolean'}
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
  redismodel(){
    let {redis}=this.props
    let cnf=this.props.config.toJS()
    // let model=(cnf.curmodel != undefined?cnf.curmodel:'')
    let model=redis.serverInfo.redis_mode
    if(model=='sentinel' && redis.serverInfo.redis_mode=='sentinel'){
      return redis.sentinel('masters');
    }else if(redis.serverInfo.redis_mode=='cluster' && model != ''){
      return redis.cluster('info');
    }else{
      return redis.config('get','*');
    }
  }
  load(reload=false) {
    let {redis}=this.props
    const configs = {}
    ///////
    let configtmp={}
    this.redismodel().then(config1 =>{
      let model=redis.serverInfo.redis_mode;
      let fI=(model=='cluster'?1:2)
      config1=(model=='sentinel'?config1[0]:(model=='cluster'?config1.split('\n'):config1))
      for (let i = 0; i < config1.length - 1; i += fI) {
        if (model!= 'sentinel' && config1[i] == 'port') continue;
        if(model == 'cluster'){
          var sVal=config1[i].replace(/_/g,"-").split(":")
          if (sVal[0]== undefined) continue;
          configs[sVal[0]] = sVal[1]
        }else{
          configs[config1[i]] = config1[i + 1]
        }
      }
      var info=redis.serverInfo;
      for( var key in info){
        configs[key.replace(/_/g,'-')]=info[key];
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
        (config.value === 'yes' || config.value === 'no' || (config.value.length === 1 && parseInt(config.value,10)<2))) {
      input = (<input
        type="checkbox" checked={config.value === 'yes' || (config.value.length === 1 && parseInt(config.value,10)<2)} onChange={e => {
          if(config.value.length === 1){
            config.value = e.target.checked ? '1' : '0'
          }else{
            config.value = e.target.checked ? 'yes' : 'no'
          }
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
        this.load(true)
      })
    } else {
      this.load(true)
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
    return (<div key="contentConfig" className="Config">
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
