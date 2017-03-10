import React, { Component } from 'react';
import { PropTypes, Text, View } from 'react-native';
import { Toolbar as MaterialToolbar } from 'react-native-material-design';
import {themeColor} from '../style/Theme.js'

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
          primary={themeColor.themeColor}
          icon={this.props.show_backspace ? 'keyboard-backspace' : 'menu'}
          rightIconStyle={{
              margin: 10
          }}
          onIconPress={this.handleIconPress.bind(this)}
      />
    )
  }
}
