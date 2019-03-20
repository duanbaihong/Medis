import {handleActions} from 'Utils'
import {
  createFavorite,
  removeFavorite,
  updateFavorite,
  reorderFavorites,
  importFavorites,
  exportFavorites,
  reloadFavorites
} from 'Redux/actions'
import {Favorites} from '../../storage'
import {Map, fromJS} from 'immutable'
import fs from 'fs'

function FavoriteFactory(data) {
  return Map(Object.assign({name: '快速连接'}, data))
}

export const favorites = handleActions(fromJS(Favorites.get()), {
  [createFavorite](state, data) {
    return state.push(FavoriteFactory(data))
  },
  [removeFavorite](state, key) {
    return state.filterNot(item => item.get('key') === key)
  },
  [updateFavorite](state, {key, data}) {
    return state.map(item => item.get('key') === key ? item.merge(data) : item)
  },
  [reorderFavorites](state, {from, to}) {
    const target = state.get(from);
    return state.splice(from, 1).splice(to, 0, target);
  },
  [reloadFavorites](state, data) {
    return fromJS(data)
  },
  [exportFavorites](state,{data,filepath}){
    let favoriteData=JSON.stringify(state.toJS(),null,'\t')
    try{
      fs.writeFileSync(filepath, favoriteData)
      Notification.requestPermission(function (permission) {
        var redisNotification=new Notification('导出收藏成功！',{
          body: '导出收藏成功！导出文件为:'+filepath,
          silent: true
        })
      })
    } catch(e){
      console.log(e)
      alert("导出收藏失败！"+e)
    }
  },
  [importFavorites](state,{data,filepath}) {
    let newData={}
    let oldStateData={}
    let newStateData=[]
    data.forEach((item,index)=>{
      newData[item.key]=item
    })
    state.toJS().forEach((item,index)=>{
      oldStateData[item.key]=item
    })
    let tmp=fromJS(Object.assign(oldStateData,newData))
    tmp.map((value)=>{
      newStateData.push(value.toJS())
    })
    Notification.requestPermission(function (permission) {
      var redisNotification=new Notification('导入收藏成功！',{
          body: '成功从文件['+filepath+']导入收藏！',
          silent: true
        })
    })
    return fromJS(newStateData)
  }
})
