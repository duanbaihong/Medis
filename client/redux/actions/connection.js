'use strict';

import {createAction} from 'Utils';
import {Client} from 'ssh2';
import net from 'net';
import Redis from 'ioredis';
import _ from 'lodash';

function getIndex(getState,targetInstanceKey) {
  const {activeInstanceKey, instances} = getState()
  return instances.findIndex(instance => instance.get('key') === (targetInstanceKey?targetInstanceKey:activeInstanceKey))
}
 
export const updateConnectStatus = createAction('UPDATE_CONNECT_STATUS', status => ({getState, next}) => {
  next({status, index: getIndex(getState)})
})

export const disconnect = createAction('DISCONNECT', (targetInstanceKey) => ({getState, next}) => {
  next({index: getIndex(getState,targetInstanceKey)})
})

export const connectToRedis = createAction('CONNECT', config => ({getState, dispatch, next}) => {
  let sshErrorThrown = false
  let redisErrorThrown = false
  let redisErrorMessage = ""
  let server
  let conn
  if(config.host == ""){
    alert('host为空');
    return false;
  }
  if (config.curmodel=='cluster'){
    config['cluster']=Array()
    config.host.split(',').map(h=>{
      config.cluster.push({host: h.split(":")[0],port: h.split(":")[1]})
    })
  }
  if (config.ssh) {
    dispatch(updateConnectStatus('SSH 连接中...'))
    const conn = new Client();
    conn.on('ready', () => {
      const server = net.createServer(function (sock) {
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
      redisErrorMessage=`SSH连接失败，请确认地址/端口/密码是否正确.失败内容: ${err.message}`
      showModal({
        title: 'SSH连接失败',
        content: redisErrorMessage
      }).then(() => {
        return ;
      }).catch(()=>{
        return ;
      })
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
          passphrase: config.sshKeyPassphrase,
          keepaliveInterval: 30000
          // agentForward: true
        }))
      } else {
        conn.connect(Object.assign(connectionConfig, {
          password: config.sshPassword
        }))
      }
    } catch (err) {
      dispatch(disconnect());
      redisErrorMessage=`SSH连接失败，请确认地址/端口/密码是否正确.失败内容: ${err.message}`
      // alert(`SSH 错误: ${err.message}`);
      showModal({
        title: 'SSH连接失败',
        content: redisErrorMessage
      }).then(() => {
        return ;
      }).catch(()=>{
        return ;
      })
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
    var redis
    if(config.curmodel=='cluster'){
      redis = new Redis.Cluster(config.cluster,{enableReadyCheck: true});
    }else{
      redis = new Redis(_.assign({}, config, override, {
        retryStrategy() {
          return false;
        }
      }));
    }
    redis.once('ready',()=>{
      Notification.requestPermission(function(permission) {
        var redisNotification=new Notification('Medis连接成功',{
          body: '连接到['+config.host+':'+config.port+']的REDIS成功!',
          icon: '../../icns/Icon1024.png',
          silent: true
        })
      }); 
    })
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
    redis.once('connect', function (err) {
      if(!redis.hasOwnProperty('serverInfo')){
          redis.serverInfo={}
        }
      redis.info(function(err,info) {
        if (typeof info !== 'string') {
          // redis.disconnect()
          return false;
        }

        var lines = info.split('\r\n');
        for (var i = 0; i < lines.length; ++i) {
          var parts = lines[i].split(':');
          if (parts[1]) {
            redis.serverInfo[parts[0]] = parts[1];
          }
        }
        redis.ping((err, res) => {
          if (err) {
            if (err.message === 'Ready check failed: NOAUTH Authentication required.') {
              redisErrorMessage = 'Redis 错误：访问被拒绝。请检查密码是否正确。';
            }
            if (err.message !== 'Connection is closed.') {
              alert(redisErrorMessage);
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
      })      
    });
    redis.once('error', function (error) {
      redisErrorMessage += error;
      console.log("1->",error)
      if(error=="ReplyError: ERR invalid password"){
        showModal({
          title: 'Redis连接失败',
          content: `Redis连接密码不正确！${redisErrorMessage}`
        }).then(() => {
          return ;
        }).catch(()=>{
          return ;
        })
      }
    });
    redis.once('end', targetInstanceKey => {
      try{
        redis.quit();
      }catch(e){
        console.warn(e)
      }
      dispatch(disconnect(targetInstanceKey));
      if(sshconn){
        sshconn.end();
      }
      if(netserver){
        netserver.close();
      }
      Notification.requestPermission(function(permission) {
        if(redisErrorMessage){
          var redisNotification=new Notification('Medis连接失败提示',{
            body: `连接[${config.host}:${config.port}]失败！失败原因：\n${redisErrorMessage}!`,
            icon: '../../icns/Icon1024.png',
            silent: true
          })
        }else{
            var redisNotification=new Notification('Medis退出连接提示',{
            body: `已经退出连接[${config.host}:${config.port}]!`,
            icon: '../../icns/Icon1024.png',
            silent: true
          })
        }
      }); 
      console.log('退出连接['+config.host+':'+config.port+']'+(redisErrorMessage?'.退出原因：'+redisErrorMessage:'')+'!')
    });
  }
})
