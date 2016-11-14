import React, { Component, PropTypes } from 'react';
import { View, Text, TextInput, StyleSheet, Dimensions,TouchableOpacity, TouchableHighlight, Image, ScrollView } from 'react-native';
import { Button} from 'react-native-material-design';
import { MKTextField, MKButton, MKColor, theme, MKSpinner} from 'react-native-material-kit';
import Icon from 'react-native-vector-icons/FontAwesome';
import PopupDialog, { DialogButton, ScaleAnimation, SlideAnimation } from 'react-native-popup-dialog';

var Platform = require('react-native').Platform;
var ImagePicker = require('react-native-image-picker');

import {$f} from './modules/functions.js';
import {themeColor, MKThemeColor} from './style/Theme.js'

var window = Dimensions.get('window');

export default class Registration extends Component{
  constructor(){
    super();
    this.Btn_camera = MKButton
      .coloredFab()
      .withBackgroundColor(MKColor.Pink)
      .withStyle(styles.Btn_camera)
      .withOnPress(selectAvatar.bind(this))
      .build();
  }

  state = {
    riderShot: require('./img/avatar_blank.jpg'),
    defaultRiderShot: true,
    msg: 'An email has been sent to you, yet again. Please check it to verify your account.',
    passColor: null,
    emailColor: null,
    emailJustChanged: false,
    password1: null,
    password2: null,
    emailPlaceHolder: 'Email',
  };

  navPop(){
    this.props.updateTitle('Sign In');
    this.props.navigator.pop();
  }

  onPressBtn(){
    // console.log(this.state.riderShot);
    // return;
    if(!this.state.riderShot){
      this.setState({msg: 'Please upload your avatar.'});
      this.popupDialog.openDialog();
      return;
    }
    if(!this.state.email){
      this.setState({msg: 'Please fill your email.'});
      this.popupDialog.openDialog();
      return;
    }
    if(!this.state.password){
      this.setState({msg: 'Please fill your password.'});
      this.popupDialog.openDialog();
      return;
    }
    if(!this.state.given_name){
      this.setState({msg: 'Please fill your given name.'});
      this.popupDialog.openDialog();
      return;
    }
    if(!this.state.last_name){
      this.setState({msg: 'Please fill your last name.'});
      this.popupDialog.openDialog();
      return;
    }
    if(!this.state.age){
      this.setState({msg: 'Please fill your age.'});
      this.popupDialog.openDialog();
      return;
    }
    if(!this.state.sex){
      this.setState({msg: 'Please fill your sex.'});
      this.popupDialog.openDialog();
      return;
    }
    if(!this.state.creditCard_number){
      this.setState({msg: 'Please fill your credit card number.'});
      this.popupDialog.openDialog();
      return;
    }
    if(!this.state.creditCard_name){
      this.setState({msg: 'Please fill the cardholder name of your credit card.'});
      this.popupDialog.openDialog();
      return;
    }
    if(!this.state.creditCard_expire){
      this.setState({msg: 'Please fill the expires date of your credit card.'});
      this.popupDialog.openDialog();
      return;
    }


    this.popupSpinner.openDialog();
    sendFile.call(this, 'riderShot', (success, msg) => {
      if(success){
        var body = {
          password: this.state.password,
          full_name: this.state.given_name + ' ' + this.state.last_name,
          age: this.state.age,
          sex: this.state.sex,
          creditCard_number: this.state.creditCard_number,
          creditCard_name: this.state.creditCard_name,
          creditCard_expire: this.state.creditCard_expire,
        };
        var obj = {
          url: 'http://ivandembp.intra.uwlax.edu:3000/riders/' + this.state.email + '/registrationInfo',
          method: 'POST',
          body: body,
          success: function(res){
            if(res.success){
              this.setState({msg: res.msg});
              this.setState({finished: true});
              this.popupSpinner.closeDialog();
              this.popupDialog.openDialog();
            }
            else{
              this.setState({msg: 'Sign up failed'});
              this.popupSpinner.closeDialog();
              this.popupDialog.openDialog();
            }
            console.log(res);
          }.bind(this),
          error: function(err){
            this.setState({msg: 'Sign up failed'});
            this.popupSpinner.closeDialog();
            this.popupDialog.openDialog();
            console.log(err);
          }.bind(this)
        }
        $f.ajax.call(this, obj);
      }
    });
  }

  checkEmail(){
    if(this.state.emailJustChanged){
      this.setState({emailJustChanged: false});
      $f.ajax({
        url: 'http://ivandembp.intra.uwlax.edu:3000/riders/' + this.state.email,
        method: 'GET',
        success: function(result, status){
          if(status == 200){
            this.setState({emailColor: MKColor.Red});
            this.setState({emailPlaceHolder: "Email Exists"});
          }
        }.bind(this),
        error: function(){

        }.bind(this)
      });
    }
  }

  render(){
    return(
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={this.state.riderShot} style={styles.img}/>
        <this.Btn_camera>
          <Icon name="camera" size={18} color="#FFFFFF"/>
        </this.Btn_camera>
        <TextField placeholder={this.state.emailPlaceHolder} onChangeText={(email) => {
          this.setState({email});
          this.setState({emailPlaceHolder: "Email"});
          this.setState({emailColor: null});
          if(email) this.setState({emailJustChanged: true});
          else this.setState({emailJustChanged: false});
        }} tintColor={this.state.emailColor}/>
        <TextField placeholder="Password"
          onChangeText={(password) => {
            this.setState({password1: password})
            if(this.state.password2){
              if(this.state.password2 == password){
                this.setState({password});
                this.setState({passColor: null});
              }
              else{
                this.setState({password: false});
                this.setState({passColor: MKColor.Red});
              }
            }
          }}
          password={true}
          onFocus={this.checkEmail.bind(this)}
        />
        <TextField placeholder="Reenter Password" onChangeText={(password) => {
          this.setState({password2: password})
          if(this.state.password1){
            if(this.state.password1 == password){
              this.setState({password});
              this.setState({passColor: null});
            }
            else{
              // this.setState({password: false});
              this.setState({passColor: MKColor.Red});
            }
          }
        }} password={true}
          tintColor={this.state.passColor}
          onFocus={this.checkEmail.bind(this)}
        />
        <TextField placeholder="Last Name" onChangeText={(last_name) => this.setState({last_name})} onFocus={this.checkEmail.bind(this)}/>
        <TextField placeholder="Given Name" onChangeText={(given_name) => this.setState({given_name})} onFocus={this.checkEmail.bind(this)}/>
        <TextField placeholder="Age" onChangeText={(age) => this.setState({age})} onFocus={this.checkEmail.bind(this)}/>
        <TextField placeholder="Sex" onChangeText={(sex) => this.setState({sex})} onFocus={this.checkEmail.bind(this)}/>
        <View style={styles.creditCardView}>
          <Text style={{marginBottom: -10}}>Credit Card</Text>
          <TextField placeholder="Number" onChangeText={(creditCard_number) => this.setState({creditCard_number})} onFocus={this.checkEmail.bind(this)}/>
          <TextField placeholder="Cardholder Name" onChangeText={(creditCard_name) => this.setState({creditCard_name})} onFocus={this.checkEmail.bind(this)}/>
          <TextField placeholder="Expires" onChangeText={(creditCard_expire) => this.setState({creditCard_expire})} onFocus={this.checkEmail.bind(this)}/>
        </View>
        <View style={styles.loginBtn}>
          <Button text="SIGN UP" primary={themeColor} onPress={this.onPressBtn.bind(this)} raised/>
        </View>
        <View style={styles.popupOuterView}>
          <PopupDialog
            width={.7}
            height={.25}
            ref={(popupDialog) => {
              this.popupDialog = popupDialog;
            }}
            onClosed={() => {if(this.state.finished) this.navPop();}}
            dialogAnimation={ new ScaleAnimation() }
            actions={[
              <DialogButton
                text="CLOSE"
                onPress={() => {
                  this.popupDialog.closeDialog();
                }}
                key="button-1"
                textContainerStyle={{paddingHorizontal:0, paddingVertical:0}}
                textStyle={{fontSize:15}}
              />,
            ]}
          >
            <View style={styles.popupInnerView}>
              <Text>{this.state.msg}</Text>
            </View>
          </PopupDialog>
          <PopupDialog
            width={.65}
            height={.19}
            ref={(popupDialog) => { this.popupSpinner = popupDialog; }}
            dialogAnimation = { new ScaleAnimation() }
            overlayPointerEvents={'none'}
          >
            <View style={styles.popupInnerView}>
              <MKSpinner/>
            </View>
          </PopupDialog>
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container:{
    alignItems: 'center',
  },
  input: {
    width: window.width * .9,
    marginTop: 10
  },
  loginBtn: {
    width: window.width * .9,
    marginBottom: 20,
    marginTop: 10
  },
  img: {
    marginTop: 50,
    width: window.width,
    height: window.width * 0.6
  },
  Btn_camera: {
    position: 'absolute',
    right: 15,
    top: window.width * 0.6 + 50 -25
  },
  View_plus: {
    height: 40,
    width: window.width * 0.95,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    // marginTop: 10,
    marginLeft: window.width * 0.05,
    marginTop: 12
  },
  Btn_plus: {
    marginRight: 10,
    width: 40,
  },
  popupOuterView: {
    position: 'absolute',
    bottom: 0,
    width: window.width,
    height: window.height,
  },
  popupInnerView: {
    height: window.height * .19,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  creditCardView: {
    borderWidth: 1,
    borderColor: '#d6d7da',
    padding: 10,
    marginTop: 10,
    marginBottom: 5
  }
})

const TextField = MKTextField
  .textfieldWithFloatingLabel()
  .withHighlightColor(MKThemeColor)
  .withStyle(styles.input)
  .build();

function selectAvatar() {
  selectPhoto.call(this,function(source){
    this.setState({
      riderShot: source
    });
  });
  this.setState({defaultRiderShot: false});
}

function selectPhoto(callback) {
  const options = {
    quality: 1.0,
  };

  ImagePicker.showImagePicker(options, (response) => {
    console.log(response);
    if(response.didCancel) return;
    var source = {
      uri: response.uri,
      res: response
    };
    callback.call(this, source, response.data);
  });
}

function sendFile(name, callback){
  var formData = new FormData();
  var key = name;
  if(this.state.defaultRiderShot){
    formData.append(name, {
      uri: this.state.riderShot.replace('file://', ''),
      fileName: 'default',
      name: name,
      type: 'image/jpeg',
    });
  }
  else{
    var file = this.state[name].res;
    formData.append(name, {
      uri: file.uri,
      fileName: file.fileName,
      name: name,
      type: file.type,
    });
  }
  var options = {};
  options.body = formData;
  options.method = 'POST';
  options.headers = {
      'Content-Type':'multipart/form-data',
    };
  var current = this;
  name = name.replace('rider','')
  fetch('http://ivandembp.intra.uwlax.edu:3000/riders/' + this.state.email + '/' + name[0].toLowerCase() + name.slice(1), options).then((response) => {
    return response.json();
  }).then((res) => {
    console.log(res);
    if(res.success) callback.call(current, true);
  }).catch((error) => {
    console.warn(error);
  });
}
