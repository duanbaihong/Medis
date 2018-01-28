import {createAction} from 'Utils';
import {remote} from 'electron'
import {getId} from 'Utils'

export const createInstance = createAction('CREATE_INSTANCE', data => (
  Object.assign({}, data, {key: getId('instance')})
))

export const selectInstance = createAction('SELECT_INSTANCE')

export const moveInstance = createAction('MOVE_INSTANCE', (from, to) => ({getState, next}) => {
  const {instances} = getState()

  const [fromIndex, instance] = instances.findEntry(v => v.get('key') === from);
  const toIndex = instances.findIndex(v => v.get('key') === to);

  next({fromIndex, toIndex, activeInstanceKey: instance.get('key')})
})

export const delInstance = createAction('DEL_INSTANCE', key => ({getState, next}) => {
  const {activeInstanceKey, instances} = getState()
  if (!key) {
    key = activeInstanceKey
  }
  const targetIndex = instances.findIndex(instance => instance.get('key') === key);
  const instance=instances.get(targetIndex)
  if (instance.get('redis')){
    instance.get('redis').emit('end',false);
    Notification.requestPermission(function(permission) {
        let redisNotification=new Notification('Medis退出成功',{
          body: '退出Redis实例'+instance.get('key')+'['+targetIndex+']成功!'
        })
      }); 
  }

  const ret = {activeInstanceKey, targetIndex}

  if (key === activeInstanceKey) {
    const item = instances.get(targetIndex + 1) || (targetIndex > 0 && instances.get(targetIndex - 1))

    // console.log('still', item, targetIndex, instances.size)
    if (item) {
      ret.activeInstanceKey = item.get('key')
    } else {
      remote.getCurrentWindow().close();
      return;
    }
  }

  next(ret)
})
