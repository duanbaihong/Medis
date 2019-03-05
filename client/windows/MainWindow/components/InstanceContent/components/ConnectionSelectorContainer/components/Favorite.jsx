'use strict'

import React from 'react'
import ReactDOM from 'react-dom'
import Immutable from 'immutable'
import Sortable from 'sortablejs'
// import {remote,ipcRenderer} from 'electron'
// import fs from 'fs'
require('./Favorite.scss')

class Favorite extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      activeKey: null,
      exportKeyUp: false,
      data: new Immutable.Map()
    }
    this._updateSortableKey()
  }

  _updateSortableKey() {
    this.sortableKey = `sortable-${Math.round(Math.random() * 10000)}`
  }

  _bindSortable() {
    const {reorderFavorites} = this.props

    this.sortable = Sortable.create(this.refs.sortable, {
      animation: 200,
      onStart: evt => {
        this.nextSibling = evt.item.nextElementSibling
      },
      onAdd: () => {
        this._updateSortableKey()
      },
      onUpdate: evt => {
        this._updateSortableKey()
        reorderFavorites({from: evt.oldIndex, to: evt.newIndex})
      }
    })
  }
  componentDidMount() {
    this._bindSortable()
    $.contextMenu({
      selector:'.'+this.props.instance.get('key')+' .favorite .favorite_item',
      appendTo: '.'+this.props.instance.get('key'),
      zIndex: 9999,
      position: function(opt, x, y){
        opt.$menu.css({
          top: y-3-($("#instancesId").css('display')=='none'?0:$("#instancesId").height()),
          left: x-2
        });
      }, 
      build: ($triggerElement, e)=>{
        return {
          callback: (key, opt) => {
            switch(key){
              case 'import':
                this.props.importFavorite()
                break;
              case 'export':
                this.props.exportFavorite()
                break;
              case 'delete':
                this.delFavoriteItem()
                break;
              case 'copy':
                this.onDuplicate();
                break;
              default:
                console.log(key)
            }
          },
          items: {
            copy: {name: '复制收藏',icon: 'add',
            disabled: ()=>{
              if(this.state.activeKey) {
                return false
              }else{
                return true;
              }
            }},
            delete: {name: '删除收藏',icon: "delete",
            disabled: ()=>{
              if(this.state.activeKey) {
                return false
              }else{
                return true;
              }
            }},
            sep1: '---------',
            import: {name: '导入配置',icon:'import'},
            export: {name: '导出配置',icon:'export',disabled: ()=>{
              if(this.props.favorites.size>0) {
                return false
              }else{
                return true;
              }
            }},
            sep2: '---------',
            setting: {name: '参数设置',icon: 'setting'}
          }
        }
      }
    })
  }

  componentDidUpdate() {
    this._bindSortable()
  }
  onClick(index, evt) {
    evt.preventDefault()
    this.selectIndex(index,false)
  }
  onDoubleClick(index, evt) {
    evt.preventDefault()
    this.selectIndex(index, true)
  }

  delFavoriteItem(){
    const key = this.state.activeKey
    if (!key) {
      return
    }
    showModal({
      title: '删除项目在收藏夹?',
      button: '删除',
      content: '你确定要删除收藏夹中的此项目? 删除后将不能恢复！'
    }).then(() => {
      const index = this.props.favorites.findIndex(favorite => key === favorite.get('key'))
      this.props.removeFavorite(key)
      this.selectIndex(index - 1,false)
    })
  }
  selectIndex(index, connect) {
    this.select(index === -1 ? null : this.props.favorites.get(index), connect)
  }

  select(favorite, connect) {
    const activeKey = favorite ? favorite.get('key') : null
    this.setState({activeKey})
    this.props.onSelect(activeKey)
    if (connect) {
      this.props.onRequireConnecting(activeKey)
    }
  }
  onDuplicate(){
    if (this.props.favorite) {
      const data = Object.assign(this.props.favorite.toJS(), this.state.data.toJS())
      delete data.key
      this.props.createFavorite(data)
    } else {
      const data = this.state.data.toJS()
      data.name = '快速连接'
      this.props.createFavorite(data)
    }
  }
  render() {
    return (<div className='favorite'>
      <nav className="nav-group">
        <h5 className="nav-group-title"/>
        <a className={'nav-quick-item' + (this.state.activeKey ? '' : ' active')}
           onClick={this.onClick.bind(this, -1)}
           onDoubleClick={this.onDoubleClick.bind(this, -1)}>
          <span className="icon icon-flash"/>
          快速连接
        </a>
        <div className='favoriteline'></div>
        <h5 className="nav-group-title">收藏</h5>
        <div ref="sortable" 
          key={this.sortableKey} 
          tabIndex="0" 
          className='favorite_item'>
        {
          this.props.favorites.map((favorite, index) => {
            return (<a
              key={favorite.get('key')}
              className={'nav-group-item' + (favorite.get('key') === this.state.activeKey ? ' active' : '')}
              onClick={this.onClick.bind(this, index)}
              onMouseDown={this.onClick.bind(this, index)}
              onDoubleClick={this.onDoubleClick.bind(this, index)}
              >
              <div className={(favorite.get('tag') && favorite.get('tag')!='')?'nav-item-cir '+favorite.get('tag'):'nav-item-cir' }>
                <span className="icon icon-database"/>
                <span className="nameformat">{favorite.get('name')}</span>
              </div>
            </a>)
          })
        }</div>
      </nav>
      <footer className="toolbar toolbar-footer">      
        <button
          className="icon icon-plus"
          onClick={() => {
            this.props.createFavorite({'curmodel':'standalone'})
          }}
          ></button>
        <button
          className="icon icon-minus"
          onClick={this.delFavoriteItem.bind(this)}></button>
        <button className='pull-right' onMouseLeave={()=>{
          if(this.state.exportKeyUp){
            this.setState({exportKeyUp: false})
          }
        }}><div className="icon icon-menu " onClick={(e)=>{
          this.setState({exportKeyUp: !this.state.exportKeyUp})
          var btnMenu=$(e.target).parent()
          var menu=$(ReactDOM.findDOMNode(this.refs.export))
          var instancesBar=$('#instancesId')
          var instancesBarHeight=0
          if(instancesBar.css('display') !== 'none'){
              instancesBarHeight=26
          }
          menu.css({'top':btnMenu.offset().top-menu.height()-instancesBarHeight,'left':btnMenu.offset().left-menu.width()+btnMenu.width()})
        }}></div>
          <div 
          ref="export"
          className={'js-pattern-dropdown pattern-dropup'+(this.state.exportKeyUp?" is-active":"")} >
            <ul>
              <li>
                <a className={this.props.favorites.size>0?'':'disabled'} 
                   onClick={this.props.favorites.size>0?this.props.exportFavorite:''}>
                  <span className="icon icon-export"></span>
                  导出收藏
                </a>
              </li>
              <li><hr/></li>
              <li>
                <a onClick={this.props.importFavorite}>
                  <span className="icon icon-download"></span>
                  导入收藏
                </a>
              </li>
              <li><hr/></li>
              <li>
                <a onClick={()=>{}}>
                  <span className="icon icon-cog"></span>
                  参数设置
                </a>
              </li>
            </ul>
          </div>
        </button>
      </footer>
    </div>)
  }

  componentWillUnmount() {
    this.sortable.destroy()
    $.contextMenu( 'destroy','.'+this.props.instance.get('key')+' .favorite .favorite_item');
  }
}

export default Favorite
