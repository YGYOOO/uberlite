import React, { Component } from 'react';
import { PropTypes, Text, View } from 'react-native';
import { Toolbar as MaterialToolbar } from 'react-native-material-design';

export default class Toolbar extends Component {
  handleIconPress() {
    if (this.props.show_backspace) {
      // this.props.updateTitle('Sign In');
      // alert(1)
      this.props.navigator.pop();
      this.props.updateIcon(false);
    }
  }

  render(){
    return(
      <MaterialToolbar
          title={this.props.title}
          primary={'paperTeal'}
          icon={this.props.show_backspace ? 'keyboard-backspace' : 'menu'}
          onIconPress={this.handleIconPress.bind(this)}
          rightIconStyle={{
              margin: 10
          }}
      />
    )
  }
}
