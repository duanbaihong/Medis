'use strict';

import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import Draggable from 'react-draggable';

class Tabs extends React.Component {
  constructor(props) {
    super(props);

    const defaultState = this._tabStateFromProps(this.props);
    defaultState.selectedTab = this.props.selectedTab ? this.props.selectedTab :
                                                        this.props.tabs ? this.props.tabs[0].key : '';
    this.state = defaultState;

    // Dom positons
    // do not save in state
    this.startPositions = [];
  }

  _tabStateFromProps(props) {
    const tabs = [];
    let idx = 0;
    React.Children.forEach(props.tabs, (tab) => {
      tabs[idx++] = tab;
    });

    return { tabs };
  }

  _getIndexOfTabByKey(key) {
    return _.findIndex(this.state.tabs, (tab) => {
      return tab.key === key;
    });
  }

  _saveStartPositions() {
    const positions = _.map(this.state.tabs, (tab) => {
      const el = this.refs[tab.key];
      const pos = el ? el.getBoundingClientRect() : {};
      return { key: tab.key, pos };
    });
    // Do not save in state
    this.startPositions = positions;
  }

  componentDidMount() {
    this._saveStartPositions();
  }

  componentWillReceiveProps(nextProps) {
    const newState = this._tabStateFromProps(nextProps);
    if (nextProps.selectedTab !== 'undefined') {
      newState.selectedTab = nextProps.selectedTab;
    }
    // reset closedTabs, respect props from application
    this.setState(newState);
  }

  componentDidUpdate() {
    this._saveStartPositions();
  }

  handleDrag(key, e) {
    const deltaX = (e.pageX || e.clientX);
    _.each(this.startPositions, (pos) => {
      const tempMoved = pos.moved || 0;
      const shoudBeSwap = key !== pos.key && pos.pos.left + tempMoved < deltaX && deltaX < pos.pos.right + tempMoved;
      if (shoudBeSwap) {
        const el = this.refs[pos.key];
        const idx1 = this._getIndexOfTabByKey(key);
        const idx2 = this._getIndexOfTabByKey(pos.key);
        const minus = idx1 > idx2 ? 1 : -1;
        const movePx = (minus * (pos.pos.right - pos.pos.left)) - tempMoved;
        el.style.transform = `translate(${movePx}px, 0px)`;
        this.startPositions[idx2].moved = movePx;
      }
    });
  }

  handleDragStop(key, e) {
    const deltaX = (e.pageX || e.clientX);
    let from;
    let to;
    for (let i = 0; i < this.startPositions.length; i++) {
      const pos = this.startPositions[i];
      const needSwap = key !== pos.key && pos.pos.left < deltaX && deltaX < pos.pos.right;
      if (needSwap) {
        from = key;
        to = pos.key;
      }
      const el = this.refs[pos.key];
      el.style.transform = 'translate(0px, 0px)';
    }
    if (from && to) {
      this.props.onTabPositionChange(from, to);
    }
  }

  handleTabClick(key) {
    this.props.onTabSelect(key);
  }

  handleCloseButtonClick(key, e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.onTabClose(key);
  }

  handleAddButtonClick(e) {
    this.props.onTabAddButtonClick(e);
  }

  render() {
    const tabs = _.map(this.state.tabs, (tab) => {
      const tabTitle = tab.props.title;
      const tabStyle=tab.props.instanceStyle;
      let  tabCss
      if(tabStyle!= "" && typeof(tabStyle) === 'object' && tabStyle['tag'] != undefined){
          tabCss=tabStyle.tag
      }
      return (
        <Draggable
          key={'draggable_tabs_' + tab.key }
          axis='x'
          cancel='.rdTabCloseIcon'
          start={{ x: 0, y: 0 }}
          moveOnStartChange={true}
          zIndex={1000}
          bounds='parent'
          onDrag={this.handleDrag.bind(this, tab.key)}
          onStop={this.handleDragStop.bind(this, tab.key)}>
          <div
              onClick={this.handleTabClick.bind(this, tab.key)}
              className={'tab-item '+(this.state.selectedTab === tab.key ? 'active' : '') }
              ref={tab.key}>
              <div className={"instanceItem "+tabCss}>
                {tabTitle}
              </div>
            <span className="icon icon-cancel icon-close-tab"
              onClick={this.handleCloseButtonClick.bind(this, tab.key)}></span>
          </div>
        </Draggable>
      );
    });

    return <div className="tab-group">
      {tabs}
      <div className='tab-item tab-item-btn' style={{padding:"0px"}} onClick={this.handleAddButtonClick.bind(this)}>
        {this.props.tabAddButton}
      </div>
    </div>;
  }
}

Tabs.defaultProps = {
  tabAddButton: (<span title='新连接' style={{fontSize:"14px"}} className="icon icon-plus"></span>),
  onTabSelect: () => {},
  onTabClose: () => {},
  onTabAddButtonClick: () => {},
  onTabPositionChange: () => {}
};

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.element),
  selectedTab: PropTypes.string,
  tabAddButton: PropTypes.element,
  onTabSelect: PropTypes.func,
  onTabClose: PropTypes.func,
  onTabAddButtonClick: PropTypes.func,
  onTabPositionChange: PropTypes.func

};

export default Tabs;
