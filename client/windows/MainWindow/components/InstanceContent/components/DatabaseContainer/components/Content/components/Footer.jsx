'use strict'

import React from 'react'
import humanFormat from 'human-format'
import ExitRedis from './ExitRedis'
import CurrDate from './CurrDate'

const timeScale = new humanFormat.Scale({
  ms: 1,
  s: 1000,
  min: 60000,
  h: 3600000,
  d: 86400000
})


class Footer extends React.PureComponent {
  constructor() {
    super()
    this.resetState(true)
  }

  resetState(sync) {
    const values = {
      ttl: null,
      encoding: null,
      size: null
    }
    if (sync) {
      this.state = values
    } else {
      this.setState(values)
    }
  }

  init(keyName, keyType) {
    if (!keyType && keyType !== 'none') {
      this.resetState()
      return
    }
    const pipeline = this.props.redis.pipeline()
    pipeline.pttl(keyName)
    pipeline.object('ENCODING', keyName)

    let sizeUnit = '成员数量(Members)'
    switch (keyType) {
    case 'string': pipeline.strlen(keyName); sizeUnit = '字节(Bytes)'; break
    case 'hash': pipeline.hlen(keyName); break
    case 'list': pipeline.llen(keyName); break
    case 'set': pipeline.scard(keyName); break
    case 'zset': pipeline.zcard(keyName); break
    }

    pipeline.exec((err, [[err1, pttl], [err2, encoding], res3]) => {
      this.setState({
        encoding: encoding ? `编码格式(Encoding): ${encoding}` : '',
        ttl: pttl >= 0 ? `TTL: ${humanFormat(pttl, {scale: timeScale}).replace(' ', '')}` : null,
        size: (res3 && res3[1]) ? `${sizeUnit}: ${res3[1]}` : null
      })
    })
  }

  componentDidMount() {
    this.init(this.props.keyName, this.props.keyType)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.keyName !== this.props.keyName ||
        nextProps.keyType !== this.props.keyType ||
        nextProps.version !== this.props.version) {
      this.init(nextProps.keyName, nextProps.keyType)
    }
  }

  render() {
    let {redis}=this.props;
    const desc = ['size', 'encoding', 'ttl']
    .map(key => ({key, value: this.state[key]}))
    .filter(item => typeof item.value === 'string')
    return (<footer className="toolbar toolbar-footer">
      <ExitRedis cstyle='cbutton' redis={this.props.redis} />
      <CurrDate />
      {
        desc.map(({key, value}) => <span
          key={key}
          style={{margin: '0 5px'}}
          >{value}</span>)
      }
      <span>当前模式:{redis.serverInfo.redis_mode}</span>
    </footer>)
  }
}

export default Footer
