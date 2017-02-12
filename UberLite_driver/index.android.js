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
import ViewRiders from './ViewRiders';
import Main from './Main'

export default class UberLite_driver extends Component {
  state = {
    title: 'Sign In'
  }

  updateTitle(title){
    this.setState({title: title});
  }

  updateProfile(profile){
    this.setState({profile});
  }

  navigatorRenderScene(route, navigator) {
    switch(route.title) {
      case 'Login':
        return (<Login navigator={navigator} updateTitle={this.updateTitle.bind(this)} updateProfile={this.updateProfile.bind(this)}/>);
      case 'Registration':
        return (<Registration navigator={navigator} updateTitle={this.updateTitle.bind(this)}/>);
      case 'ViewRiders':
        return (<ViewRiders navigator={navigator} updateTitle={this.updateTitle.bind(this)}/>);
      case 'Main':
        return (<Main navigator={navigator} updateTitle={this.updateTitle.bind(this)} profile={this.state.profile}/>);
    }
  }

  render() {
    return (
      <Navigator
        navigationBar={
          <Toolbar title={this.state.title}/>
          }
          // navigator = {() => {}}
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

  const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  });
AppRegistry.registerComponent('UberLite_driver', () => UberLite_driver);
