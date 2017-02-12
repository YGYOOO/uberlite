import React, { Component, PropTypes } from 'react';
import { View, Text, TextInput, StyleSheet, Dimensions, TouchableHighlight, Animated, AsyncStorage } from 'react-native';
import { Button, Card, Toolbar } from 'react-native-material-design';
import { MKTextField} from 'react-native-material-kit';
import Animation from 'lottie-react-native';

import {themeColor, MKThemeColor} from './style/Theme.js';
import {$f} from './modules/functions';
import {domain} from './global';

var window = Dimensions.get('window');

export default class Login extends Component{
  state = {
    processingLogin: false,
    progress: new Animated.Value(0),
  }

    componentDidMount() {
    Animated.timing(this.state.progress, {
      toValue: 1,
      duration: 5000,
    }).start();
  }

  navRegistration(){
    this.props.updateTitle('Sign Up');
    this.props.navigator.push({title: 'Registration'});
  }

  navMain(){
    this.props.updateTitle('Uber Lite');
    this.props.navigator.push({title: 'Main'});
  }

  login(){
    if(this.state.processingLogin) return;
    this.setState({processingLogin: true});

    var body = {email: this.state.email, password: this.state.password};
    $f.ajax({
      url: domain + '/riderLogin',
      body: body,
      method: 'POST',
      success: (result) => {
        if(result.success){
          this.navMain();
          this.props.updateEmail(this.state.email);
          this.setState({processingLogin: false});
        }
        else alert("Loing failed. Pleace check your email or password");
      },
      error: (err) => {
        alert("Loing failed. Pleace check your email or password");
      }
    });
  }

  render(){
    return(
      <View style={styles.container} primary={themeColor}>
      {/*<Animation
        style={{
          width: 200,
          height: 200,
        }}
        source={require('./animations/Watermelon.json')}
        progress={this.state.progress}
      />*/}
        <TextField placeholder="Email" onChangeText={(email) => this.setState({email})}/>
        <TextField placeholder="Password" onChangeText={(password) => this.setState({password})} password={true}/>
        <View style={styles.loginBtn}>
          <Button text="SIGN IN" primary={themeColor} onPress={this.login.bind(this)} raised/>
        </View>
        <View style={styles.loginBtn}>
          <Button text="SIGN UP" primary={themeColor} onPress={this.navRegistration.bind(this)} raised theme={'dark'}/>
        </View>
        <Card style={{
          position: 'absolute',
          right: 0,
          bottom:0,
          width: 1,
          height: 8
        }} onPress={() => {AsyncStorage.removeItem('@uberLiteRider:state');}}>
          <Text></Text>
        </Card>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  input: {
    width: window.width * .9,
    marginTop: 10
  },
  loginBtn: {
    width: window.width * .9,
    marginTop: 10
  }
})

const TextField = MKTextField.textfieldWithFloatingLabel()
  .withHighlightColor(MKThemeColor)
  .withStyle(styles.input)
  .build();

function ajax(url, method, body, callback){
  var obj = {};
  obj.method = method;
  obj.headers = {
    "Content-type": "application/json; charset=UTF-8"
  };
  if(body) obj.body = JSON.stringify(body);
  fetch(url, obj)
  .then((res) => {
    return res.json();
  })
  .then((res) => {
    callback.call(this, res);
    return res.test;
  })
  .catch((error) => {
    console.error(error);
  });
}
