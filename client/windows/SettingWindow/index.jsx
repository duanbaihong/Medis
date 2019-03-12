import React, { Component } from 'react';
import { Window, 
  TitleBar,
  Toolbar, 
  Button,
  ToolbarNav, 
  ToolbarNavItem, 
  SegmentedControl, 
  SegmentedControlItem, 
  Text } from 'react-desktop/macOs';
import { ipcRenderer } from 'electron';

require('./setting.scss');
export default class extends Component {
  constructor() {
    super()
    this.state = {
      selected: 1
    }
  }

  windowAction(type) {
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
          onCloseClick={this.windowAction.bind(this, 'close')} >
          <Toolbar className="setting_toolbar">
            <ToolbarNav height="48" style={{ alignItems: "flex-end"}}>
              <ToolbarNavItem 
                className={this.state.selected === 1 ? "items active" : "items"}
                title={(<span className="fontcolor">基本设置</span>)}
                style={{ marginLeft: "-60px" }}
                icon={(
                  <span className={this.state.selected === 1 ? "icon icon-tools iconsize active_icon" :"icon icon-tools iconsize"}></span>
                )}
                selected={this.state.selected === 1}
                onClick={() => this.setState({ selected: 1 })}
              />
              <ToolbarNavItem
                className={this.state.selected === 2 ? "items active" : "items"}
                title={(<span className="fontcolor">高级设置</span>)}
                icon={(
                  <span className={this.state.selected === 2 ? "icon icon-globe iconsize active_icon" : "icon icon-globe iconsize"}></span>
                )}
                selected={this.state.selected === 2}
                onClick={() => this.setState({ selected: 2 })}
              />
              <ToolbarNavItem
                className={this.state.selected === 3 ? "items active" : "items"}
                title={(<span className="fontcolor">关于</span>)}
                icon={(
                  <span className={this.state.selected === 3 ? "icon icon-lifebuoy iconsize active_icon" : "icon icon-lifebuoy iconsize"}></span>
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
        
          <Button color="blue" onClick={() => console.log('Clicked!')}>
            Press me!
          </Button>
      </Window>
    );
  }
}