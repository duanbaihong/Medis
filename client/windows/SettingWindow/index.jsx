import React, { Component } from 'react';
import { Window, TitleBar, SegmentedControl, SegmentedControlItem, Text} from 'react-desktop/macOs';
import { ipcRenderer } from 'electron';
export default class extends Component {
  constructor(){
    super()
    this.state={
      selected: 1
    }
  }
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
          height="26"
          disableMinimize
          disableResize
          title="参数设置"
          onCloseClick={this.windowAction.bind(this, 'close')}
        >
        </TitleBar>
        <SegmentedControl box>
          {this.renderItems()}
        </SegmentedControl>
      </Window>
    );
  }
}