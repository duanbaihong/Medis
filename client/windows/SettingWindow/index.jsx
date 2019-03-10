import React, { Component } from 'react';
import { Window, TitleBar, Toolbar, ToolbarNav,ToolbarNavItem,SegmentedControl, SegmentedControlItem, Text} from 'react-desktop/macOs';
import { ipcRenderer } from 'electron';

export default class extends Component {
  constructor(){
    super()
    this.state={
      selected: 1
    }
  }
  // circle = ;

  // const star = (
  //   <span style={{ fontSize: "26px" }} className="icon icon-globe"></span>
  // );

  // const polygon = (
  //   <span style={{ fontSize: "26px" }} className="icon icon-lifebuoy"></span>
  // );

  windowAction(type){
    switch (type) {
      case 'close':
        ipcRenderer.send('app-close');
        break;
    }
  }
  renderItems() {
    return [
      this.renderItem(1, 'Tab 1', <Text>Content 1</Text>),
      this.renderItem(2, 'Tab 2', <Text>Content 2</Text>),
      this.renderItem(3, 'Tab 3', <Text>Content 3</Text>)
    ];
  }

  renderItem(key, title, content) {
    return (
      <SegmentedControlItem
        key={key}
        title={title}
        selected={this.state.selected === key}
        onSelect={() => this.setState({ selected: key })}
      >
        {content}
      </SegmentedControlItem>
    );
  }
  
  render() {
    return (
      <Window >
        <TitleBar
          controls
          disableMinimize
          disableResize
          onCloseClick={this.windowAction.bind(this, 'close')}
        >
            <Toolbar>
              <ToolbarNav>
                <ToolbarNavItem
                  title="基本设置"
                  style={{marginLeft: "-55px"}}
                  icon={(
                    <span style={{ 
                      fontSize: "26px", 
                      color: this.state.selected === 1?"blue":""  }} className="icon icon-tools"></span>
                  )}
                  selected={this.state.selected === 1}
                  onClick={() => this.setState({ selected: 1 })}
                />
                <ToolbarNavItem
                  title="高级设置"
                  icon={(
                    <span style={{ 
                      fontSize: "26px",
                      color: this.state.selected === 2 ? "blue" : "" }} className="icon icon-globe"></span>
                    )}
                  selected={this.state.selected === 2}
                  onClick={() => this.setState({ selected: 2 })}
                />
                <ToolbarNavItem
                  title="关于"
                  icon={(
                      <span style={{ 
                        fontSize: "26px",
                        color: this.state.selected === 3 ? "blue" : "" }} className="icon icon-lifebuoy"></span>
                    )}
                  selected={this.state.selected === 3}
                  onClick={() => this.setState({ selected: 3 })}
                />
              </ToolbarNav>
            </Toolbar>
          </TitleBar>
        <SegmentedControl box>
          {this.renderItems()}
        </SegmentedControl>
      </Window>
    );
  }
}