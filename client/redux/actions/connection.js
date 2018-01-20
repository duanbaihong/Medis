'use strict';

import {createAction} from 'Utils';
import {Client} from 'ssh2';
import net from 'net';
import Redis from 'ioredis';
import _ from 'lodash';

function getIndex(getState) {
  const {activeInstanceKey, instances} = getState()
  return instances.findIndex(instance => instance.get('key') === activeInstanceKey)
}

export const updateConnectStatus = createAction('UPDATE_CONNECT_STATUS', status => ({getState, next}) => {
  next({status, index: getIndex(getState)})
})

export const disconnect = createAction('DISCONNECT', () => ({getState, next}) => {
  next({index: getIndex(getState)})
})

export const connectToRedis = createAction('CONNECT', config => ({getState, dispatch, next}) => {
  let sshErrorThrown = false
  let redisErrorThrown = false
  let redisErrorMessage
  let server
  let conn
  if (config.ssh) {
    dispatch(updateConnectStatus('SSH 连接中...'))

    const conn = new Client();
    conn.on('ready', () => {
      const server = net.createServer(function (sock) {
        console.log(server.address().port)
        conn.forwardOut(sock.remoteAddress, sock.remotePort, config.host, config.port, (err, stream) => {
          if (err) {
            sock.end()
          } else {
            sock.pipe(stream).pipe(sock)
          }
        })
      }).listen(0, function () {
        handleRedis(config, { host: '127.0.0.1', port: server.address().port },conn,server)
      })
    }).on('error', err => {
      sshErrorThrown = true;
      dispatch(disconnect());
      alert(`SSH 错误: ${err.message}`);
    })
    try {
      const connectionConfig = {
        host: config.sshHost,
        port: config.sshPort || 22,
        username: config.sshUser
      }
      if (config.sshKey) {
        conn.connect(Object.assign(connectionConfig, {
          privateKey: config.sshKey,
          passphrase: config.sshKeyPassphrase
        }))
      } else {
        conn.connect(Object.assign(connectionConfig, {
          password: config.sshPassword
        }))
      }
    } catch (err) {
      dispatch(disconnect());
      alert(`SSH 错误: ${err.message}`);
    }
  } else {
    handleRedis(config);
  }
  
  function handleRedis(config, override, sshconn,netserver) {
    dispatch(updateConnectStatus('Redis 连接中...'))
    if (config.ssl) {
      config.tls = {};
      if (config.tlsca) config.tls.ca = config.tlsca;
      if (config.tlskey) config.tls.key = config.tlskey;
      if (config.tlscert) config.tls.cert = config.tlscert;
    }
    const redis = new Redis(_.assign({}, config, override, {
      retryStrategy() {
        return false;
      }
    }));
    redis.defineCommand('setKeepTTL', {
      numberOfKeys: 1,
      lua: 'local ttl = redis.call("pttl", KEYS[1]) if ttl > 0 then return redis.call("SET", KEYS[1], ARGV[1], "PX", ttl) else return redis.call("SET", KEYS[1], ARGV[1]) end'
    });
    redis.defineCommand('lremindex', {
      numberOfKeys: 1,
      lua: 'local FLAG = "$$#__@DELETE@_REDIS_@PRO@__#$$" redis.call("lset", KEYS[1], ARGV[1], FLAG) redis.call("lrem", KEYS[1], 1, FLAG)'
    });
    redis.defineCommand('duplicateKey', {
      numberOfKeys: 2,
      lua: 'local dump = redis.call("dump", KEYS[1]) local pttl = 0 if ARGV[1] == "TTL" then pttl = redis.call("pttl", KEYS[1]) end return redis.call("restore", KEYS[2], pttl, dump)'
    });
    redis.once('connect', function () {
      redis.ping((err, res) => {
        if (err) {
          if (err.message === 'Ready check failed: NOAUTH Authentication required.') {
            err.message = 'Redis 错误：访问被拒绝。请检查密码是否正确。';
          }
          if (err.message !== 'Connection is closed.') {
            alert(err.message);
            redis.disconnect();
          }
          return;
        }
        const version = redis.serverInfo.redis_version;
        if (version && version.length >= 5) {
          const versionNumber = Number(version[0] + version[2]);
          if (versionNumber < 28) {
            alert('Medis 只支持 Redis 版本 >= 2.8 是因为小于 2.8 版本的，不支持 SCAN 命令, which means it not possible to access keys without blocking Redis.');
            dispatch(disconnect());
            return;
          }
        }
        next({redis, config, index: getIndex(getState)});
      })
    });
    redis.once('error', function (error) {
      redisErrorMessage = error;
    });
    redis.once('end', function (syselft=true) {
      dispatch(disconnect());
      if(sshconn){
        sshconn.end();
      }
      if(netserver){
        netserver.close();
      }
      let msg
      if (!sshErrorThrown && syselft) {
        let msg = 'Redis 错误: 连接失败Connection failed. ';
        if (redisErrorMessage) {
          msg += `(${redisErrorMessage})`;
        }
        alert(msg);
      }
      console.log('退出连接['+config.host+':'+config.port+']成功'+(msg?'.退出原因：'+msg:'')+'!')
    });
  }
})
