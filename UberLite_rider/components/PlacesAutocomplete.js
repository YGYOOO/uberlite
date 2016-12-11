import React, { Component } from 'react';
import { PropTypes, Text, View } from 'react-native';
import {themeColor} from '../style/Theme.js'
var {GooglePlacesAutocomplete} = require('react-native-google-places-autocomplete');
import {$f} from '../modules/functions.js';
const GOOGLE_API_KEY = 'AIzaSyDZdy8t-8pUwPjntJk45AMyIhn5Q37OOnE';

// var windowDimension = Dimensions.get('window');

export default class PlacesAutocomplete extends Component {
  render(){
    return(
      <GooglePlacesAutocomplete
        placeholder={this.props.placeholder}
        minLength={2}
        autoFocus={false}
        // getDefaultValue={() => {
        //   return this.props.value;
        // }}
        // updateValue={this.props.updateValue}
        value={this.props.value}
        onPress={(data) => {
          let url = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=' + data.description + '&key=' + GOOGLE_API_KEY;
          console.log(url);
          $f.ajax({
            url: url,
            method: 'GET',
            success: (result) => {
              this.props.callback(result);
              // var region = JSON.parse(JSON.stringify(this.state.region));
              // region.latitude = result.results[0].geometry.location.lat;
              // region.longitude = result.results[0].geometry.location.lng;
              // this.setState({region});
            },
            error: function(err){
              console.err(err);
            }
          });
          // alert(JSON.stringify(data));
        }}
        query={{
          key: GOOGLE_API_KEY,
          language: 'en', // language of the results
          // types: 'geocode', // default: 'geocode'
        }}
        styles={{
          listView:{
            backgroundColor: 'white'
          },
          textInputContainer: {
            backgroundColor: 'rgba(0,0,0,0)',
            borderTopWidth: 0,
            borderBottomWidth:0
          },
          textInput: {
            marginLeft: 0,
            marginRight: 0,
            height: this.props.height,
            width: this.props.width,
            color: '#5d5d5d',
            fontSize: 16
          },
          predefinedPlacesDescription: {
            color: '#1faadb'
          },
        }}
        currentLocation={false}
      />
    )
  }
}
