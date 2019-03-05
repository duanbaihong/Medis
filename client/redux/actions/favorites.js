import {createAction} from 'Utils';
import {Favorites} from '../../storage'

export const createFavorite = createAction('CREATE_FAVORITE', (data) => {
  const key = `favorite-${Math.round(Math.random() * 100000)}`
  return Object.assign({key}, data)
})

export const reloadFavorites = createAction('RELOAD_FAVORITES', Favorites.get)
export const removeFavorite = createAction('REMOVE_FAVORITE')
export const reorderFavorites = createAction('REORDER_FAVORITES')
export const updateFavorite = createAction('UPDATE_FAVORITE', (key, data) => ({key, data}))
export const importFavorites = createAction('IMPORT_FAVORITES',(data)=>({data}))
