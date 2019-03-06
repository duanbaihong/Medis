import {handleActions} from 'Utils'
import {
  createFavorite,
  removeFavorite,
  updateFavorite,
  reorderFavorites,
  importFavorites,
  reloadFavorites
} from 'Redux/actions'
import {Favorites} from '../../storage'
import {Map, fromJS} from 'immutable'

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
  [importFavorites](state, {data}) {
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
    return fromJS(newStateData)
  }
})
