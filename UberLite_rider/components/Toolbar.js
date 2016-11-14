import React, { Component } from 'react';
import { PropTypes, Text, View } from 'react-native';
import { Toolbar as MaterialToolbar } from 'react-native-material-design';
import {themeColor} from '../style/Theme.js'

export default class Toolbar extends Component {
  render(){
    return(
      <MaterialToolbar
          title={this.props.title}
          primary={themeColor.themeColor}
          icon={navigator && navigator.isChild ? 'keyboard-backspace' : 'menu'}
          rightIconStyle={{
              margin: 10
          }}
      />
    )
  }
}
