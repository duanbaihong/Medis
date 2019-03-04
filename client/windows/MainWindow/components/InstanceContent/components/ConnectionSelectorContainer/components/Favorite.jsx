'use strict'

import React from 'react'
import ReactDOM from 'react-dom'
import Sortable from 'sortablejs'
// import {remote,ipcRenderer} from 'electron'
// import fs from 'fs'
require('./Favorite.scss')

class Favorite extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      activeKey: null,
      exportKeyUp: false
    }
    this._updateSortableKey()
  }

  _updateSortableKey() {
    this.sortableKey = `sortable-${Math.round(Math.random() * 10000)}`
  }

  _bindSortable() {
    const {reorderFavorites} = this.props

    this.sortable = Sortable.create(this.refs.sortable, {
      animation: 100,
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
    let contMenu=$.contextMenu({
      selector: '.favorite .favorite_item',
      zIndex: 9999,
      callback: (key, opt) => {
        setTimeout(() => {
          switch(key){
            case 'import':
              this.props.importFavorite()
              break;
            case 'export':
              this.props.exportFavorite()
              break;
            default:
              console.log(key)
          }
        }, 0)
      },
      items: {
        copy: {name: '复制收藏',icon:'icon icon-export'},
        delete: {name: '删除收藏',icon: "edit"},
        sep1: '---------',
        import: {name: '导入配置'},
        export: {name: '导出配置'},
        sep2: '---------',
        setting: {name: '参数设置'}
      }
    })
  console.log(contMenu)
  }

  componentDidUpdate() {
    this._bindSortable()
  }

  onClick(index, evt) {
    this.selectIndex(index)
  }
  showContextMenu(index,evt) {
    this.selectIndex(index)
    let mouseBtnType=evt.button;
    if(mouseBtnType==2){
      $(".favorite .favorite_item").contextMenu({
        x: evt.pageX,
        y: evt.pageY+2,
        zIndex: 99999
      })
    }
  }
  onDoubleClick(index, evt) {
    evt.preventDefault()
    this.selectIndex(index, true)
  }

  selectIndex(index, connect) {
    this.select(index === -1 ? null : this.props.favorites.get(index), connect)
  }

  select(favorite, connect) {
    const activeKey = favorite ? favorite.get('key') : null
    this.setState({activeKey})
    if (connect) {
      this.props.onRequireConnecting(activeKey)
    } else {
      this.props.onSelect(activeKey)
    }
  }
  render() {
    return (<div className='favorite'>
      <nav className="nav-group">
        <h5 className="nav-group-title"/>
        <a
          className={'nav-quick-item' + (this.state.activeKey ? '' : ' active')}
          onClick={this.onClick.bind(this, -1)}
          onDoubleClick={this.onDoubleClick.bind(this, -1)}
          >
          <span className="icon icon-flash"/>
          快速连接
        </a>
        <div className='favoriteline'></div>
        <h5 className="nav-group-title">收藏</h5>
        <div ref="sortable" key={this.sortableKey} tabIndex="0" className='favorite_item'>
        {
          this.props.favorites.map((favorite, index) => {
            return (<a
              key={favorite.get('key')}
              className={'nav-group-item' + (favorite.get('key') === this.state.activeKey ? ' active' : '')}
              onClick={this.onClick.bind(this, index)}
              onMouseDown={this.showContextMenu.bind(this,index)}
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
          onClick={
          () => {
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
              this.selectIndex(index - 1)
            })
          }
        }
          ></button>
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
              <li><a onClick={this.props.exportFavorite}><span className="icon icon-export"></span>
              导出收藏</a></li>
              <li><hr/></li>
              <li><a onClick={this.props.importFavorite}><span className="icon icon-download"></span>
              导入收藏</a></li>
              <li><hr/></li>
              <li><a onClick={()=>{
                
              }}><span className="icon icon-cog"></span>
              参数设置</a></li>
            </ul>
          </div>
        </button>
      </footer>
    </div>)
  }

  componentWillUnmount() {
    this.sortable.destroy()
  }
}

export default Favorite
