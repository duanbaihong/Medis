import {createAction} from 'Utils';
import {remote} from 'electron';
import {fromJS} from 'immutable'
import fs from 'fs'
import {Favorites} from '../../storage'


export const createFavorite = createAction('CREATE_FAVORITE', (data) => {
  const key = `favorite-${Math.round(Math.random() * 100000)}`
  return Object.assign({key}, data)
})

export const reloadFavorites = createAction('RELOAD_FAVORITES', Favorites.get)
export const removeFavorite = createAction('REMOVE_FAVORITE')
export const reorderFavorites = createAction('REORDER_FAVORITES')
export const updateFavorite = createAction('UPDATE_FAVORITE', (key, data) => ({key, data}))
export const exportFavorite = createAction('EXPORT_FAVORITES', ()=>{
	const win = remote.getCurrentWindow()
    const files = remote.dialog.showSaveDialog(win, {
      title: "导出收藏",
      defaultPath: "~/Desktop/",
      filters:[{name: 'JSON Files', extensions: ['json']}]
    })
    let favoriteData=JSON.stringify(Favorites.get(),null,'\t')
    if (files && files.length) {
      try{
        fs.writeFileSync(files, favoriteData)
        Notification.requestPermission(function (permission) {
          var redisNotification=new Notification('导出收藏成功！',{
            body: '导出收藏成功！导出文件为:'+files,
            icon: '../../icns/Icon1024.png',
            silent: true
          })
        })
      } catch(e){
      	console.log(e)
        alert("导出收藏失败！"+e)
      }
    }
})
export const importFavorite = createAction('IMPORT_FAVORITES', () => {
	const win = remote.getCurrentWindow()
    const files = remote.dialog.showOpenDialog(win, {
      properties: ['openFile'],
      title: "导入收藏",
      defaultPath: "~/Desktop/",
      filters:[{name: 'JSON Files', extensions: ['json']}]
    })
    if (files && files.length) {
      const file = files[0]
      try{
        const content = fs.readFileSync(file, 'utf8')
        var objData=JSON.parse(content)
          Favorites.set(objData)
      }catch(e){
      	console.log(e)
        alert("导入数据失败，请检查文件是否准确！")
        return false
      }
      Notification.requestPermission(function (permission) {
        var redisNotification=new Notification('导入收藏成功！',{
            body: '从文件['+file+']导入收藏成功！',
            icon: '../../icns/Icon1024.png',
            silent: true
          })
      })
    }
})
