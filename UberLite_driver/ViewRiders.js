import React, { Component, PropTypes } from 'react';
import { View, Text, TextInput, StyleSheet, Dimensions, TouchableHighlight } from 'react-native';
import { Button, Card, COLOR, PRIMARY_COLORS, Toolbar } from 'react-native-material-design';
import { MKTextField, MKButton, MKColor} from 'react-native-material-kit';

var window = Dimensions.get('window');

export default class ViewRider extends Component{


  render(){
    return(
      <View style={styles.container} primary={'paperTeal'}>

      </View>
    )
  }
}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
