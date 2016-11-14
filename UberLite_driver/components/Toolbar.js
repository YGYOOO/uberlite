import React, { Component } from 'react';
import { PropTypes, Text, View } from 'react-native';
import { Toolbar as MaterialToolbar } from 'react-native-material-design';

export default class Toolbar extends Component {
  presFunc(){
    console.log(this.props);
    console.log(this.props.navState.routeStack.slice(-1)[0].title);
  }

  render(){
    return(
      <MaterialToolbar
          title={this.props.title}
          primary={'paperTeal'}
          icon={navigator && navigator.isChild ? 'keyboard-backspace' : 'menu'}
          onIconPress={this.presFunc.bind(this)}
          rightIconStyle={{
              margin: 10
          }}
      />
    )
  }
}
