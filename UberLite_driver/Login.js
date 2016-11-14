import React, { Component, PropTypes } from 'react';
import { View, Text, TextInput, StyleSheet, Dimensions, TouchableHighlight } from 'react-native';
import { Button, Card, COLOR, PRIMARY_COLORS, Toolbar } from 'react-native-material-design';
import { MKTextField, MKButton, MKColor} from 'react-native-material-kit';
import {$f} from './modules/functions.js';


var window = Dimensions.get('window');

export default class Login extends Component{
  navRegistration(){
    this.props.updateTitle('Sign Up');
    this.props.navigator.push({title: 'Registration'});
  }

  navViewRiders(){
    this.props.updateTitle('Uber Lite');
    this.props.navigator.push({title: 'Main'});
  }

  login(){
    var body = {email: this.state.email, password: this.state.password};
    // ajax.call(this, 'http://ivandembp.intra.uwlax.edu:3000/driverLogin', 'POST', body, function(res){
    //   if(res.success) this.navViewRiders();
    // });

    $f.ajax({
      url: 'http://172.31.153.29:3000/PriderLogin',
      body: body,
      method: 'POST',
      success: (result) => {
        if(result.success) this.navViewRiders();
      },
      error: (err) => {

      }
    });
  }

  render(){
    return(
      <View style={styles.container} primary={'paperTeal'}>
        <TextField placeholder="Email" onChangeText={(email) => this.setState({email})}/>
        <TextField placeholder="Password" onChangeText={(password) => this.setState({password})} password={true}/>
        <View style={styles.loginBtn}>
          <Button text="SIGN IN" primary={'paperTeal'} onPress={this.login.bind(this)} raised/>
        </View>
        <View style={styles.loginBtn}>
          <Button text="SIGN UP" primary={'paperTeal'} onPress={this.navRegistration.bind(this)} raised theme={'dark'}/>
        </View>
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
  .withHighlightColor(MKColor.Teal)
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
