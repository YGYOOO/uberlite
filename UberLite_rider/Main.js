import React, { Component, PropTypes } from 'react';
import { View, Text, TextInput, StyleSheet, Dimensions, TouchableHighlight } from 'react-native';
import { Button, Card, COLOR, PRIMARY_COLORS, Toolbar } from 'react-native-material-design';
import { MKTextField, MKButton, MKColor} from 'react-native-material-kit';
import MapView from 'react-native-maps';
import {$f} from './modules/functions.js';
var {GooglePlacesAutocomplete} = require('react-native-google-places-autocomplete');

var windowDimension = Dimensions.get('window');
const GOOGLE_API_KEY = 'AIzaSyDZdy8t-8pUwPjntJk45AMyIhn5Q37OOnE';

export default class Main extends Component{
  constructor(){
    super();
    navigator.geolocation.getCurrentPosition(
      (position) => {
        var region = this.state.region;
        region.latitude = position.coords.latitude;
        region.longitude = position.coords.longitude;
        this.setState({region});
        this.setState({driverCoor: region});
      },
      (error) => alert(JSON.stringify(error)),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
  }

  state = {
    riderCoor: {
      latitude: 43,
      longitude: -91,
    },
    region: {
      latitude: 43,
      longitude: -91,
      latitudeDelta: 0.025,
      longitudeDelta: 0.0121,
    }
  };

  onRegionChange(region){
    this.setState({region});
  }

  sendCoor(){
    // alert(JSON.stringify(this.state.region));
    $f.ajax({
      url: 'http://ivandembp.intra.uwlax.edu:3000/rider/location/' + this.props.email,
      body: this.state.region,
      method: 'POST',
      success: function(result){
        console.log(result);
      },
      error: function(err){
        console.err(err);
      }
    });
  }

  render() {
    return (
      <View style ={styles.container}>
        <MapView
          style={styles.map}
          region={this.state.region}
          showsUserLocation={true}
          onRegionChange={this.onRegionChange.bind(this)}
        >
          <MapView.Marker
            coordinate={this.state.region}
            title={'Get on at here'}
          >
            <MapView.Callout onPress={this.sendCoor.bind(this)}>
            </MapView.Callout>
          </MapView.Marker>
        </MapView>
        <Card style={styles.startPointSearcher}>
          <GooglePlacesAutocomplete
            placeholder='Enter Location'
            minLength={2}
            autoFocus={false}
            onPress={(data) => {
              $f.ajax({
                url: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + data.description + '&key=' + GOOGLE_API_KEY,
                method: 'GET',
                success: function(result){
                  var region = JSON.parse(JSON.stringify(this.state.region));
                  region.latitude = result.results[0].geometry.location.lat;
                  region.longitude = result.results[0].geometry.location.lng;
                  this.setState({region});
                }.bind(this),
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
                height: 38,
                width: windowDimension.width,
                color: '#5d5d5d',
                fontSize: 16
              },
              predefinedPlacesDescription: {
                color: '#1faadb'
              },
            }}
            currentLocation={false}
          />
        </Card>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  startPointSearcher: {
    position: 'absolute',
    top: 55,
  }
});
