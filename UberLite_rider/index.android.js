/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

 import React, { Component } from 'react';
 import {
   AppRegistry,
   StyleSheet,
   Text,
   View,
   Navigator,
   TouchableHighlight
 } from 'react-native';
 import { Button, Card } from 'react-native-material-design';

 import Toolbar from './components/Toolbar';
 import Login from './Login';
 import Registration from './Registration';
 import Main from './Main';
 import Test from './Test';


export default class UberLite_rider extends Component {
  state = {
    title: 'Sign In',
    email: '',
    show_backspace: false,
  }

  updateTitle(title){
    this.setState({title});
  }

  updateEmail(email){
    this.setState({email});
  }

  updateIcon(show_backspace) {
    this.setState({show_backspace});
  }
  

  navigatorRenderScene(route, navigator) {
    switch(route.title) {
      case 'Login':
        return (<Login navigator={navigator} updateTitle={this.updateTitle.bind(this)} updateIcon={this.updateIcon.bind(this)} updateEmail={this.updateEmail.bind(this)}/>);
      case 'Registration':
        return (<Registration navigator={navigator} updateTitle={this.updateTitle.bind(this)} updateIcon={this.updateIcon.bind(this)}/>);
      case 'Main':
        return (<Main navigator={navigator} updateTitle={this.updateTitle.bind(this)} email={this.state.email}/>);
      case 'Test':
        return (<Test/>);
    }
  }

  render() {
    return (
      <Navigator
        navigationBar={
          <Toolbar title={this.state.title} show_backspace={this.state.show_backspace} updateIcon={this.updateIcon.bind(this)}/>
        }
        initialRoute={{title: 'Login'}}
        renderScene={this.navigatorRenderScene.bind(this)}
        configureScene={(route) => {
          // if(route.title == 'Registration')
          if(route.title == 'Main') return Navigator.SceneConfigs.FloatFromRight;
          return Navigator.SceneConfigs.HorizontalSwipeJump;
        }}
      />
    )
  }
}

AppRegistry.registerComponent('UberLite_rider', () => UberLite_rider);
