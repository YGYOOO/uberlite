import React, { Component, PropTypes } from 'react';
import { View, Text, TextInput, StyleSheet, Dimensions, TouchableHighlight, ScrollView } from 'react-native';
import { Button, Card, COLOR, PRIMARY_COLORS, Toolbar } from 'react-native-material-design';
import MapView from 'react-native-maps';
import * as Animatable from 'react-native-animatable';

import {$f} from './modules/functions.js';
import {themeColor, MKThemeColor} from './style/Theme.js';
import {domain} from './url.js';

var windowD = Dimensions.get('window');
var getRidersInterval;
const GOOGLE_API_KEY = 'AIzaSyDZdy8t-8pUwPjntJk45AMyIhn5Q37OOnE';
const VIEWING = 'VIEWING', ACCEPTED = 'ACCEPTED', RIDING = 'RIDING';

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
        this.getRiders();
        getRidersInterval = setInterval(() => {this.getRiders()}, 5000);
      },
      (error) => alert(JSON.stringify(error)),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
  }

  state = {
    driverCoor: {
      latitude: 43,
      longitude: -91,
    },
    region: {
      latitude: 43,
      longitude: -91,
      latitudeDelta: 0.025,
      longitudeDelta: 0.0121,
    },
    riders_old:[],
    riders:[],
    startPoint: null,
    status: VIEWING,
  };

  onRegionChange(region){
    this.setState({region});
  }

  getRiders(){
    $f.ajax({
      url: domain + '/geo/riders/?radius=5000&latitude=' + this.state.driverCoor.latitude + '&longitude=' + this.state.driverCoor.longitude,
      method: 'GET',
      success: function(result){
        var riders = this.state.riders.slice();
        var newriders = result.data.filter(function(r1){
          var finded = true;
          riders.forEach(function(r2){
            if(r1.key == r2.key) finded = false;
          });
          return finded;
        });
        if(newriders){
          riders = riders.concat(newriders);
          this.setState({riders});
          newriders.forEach(function(r){
            this.getRiderInfo(r);
          }.bind(this));
        }
      }.bind(this),
      error: function(err){
        console.err(err);
      }
    });
  }

  getRiderInfo(rider){
    $f.ajax({
      url: 'http://ivandembp.intra.uwlax.edu:3000/riders/' + rider.key,
      method: 'GET',
      success: function(result){
        var riders = JSON.parse(JSON.stringify(this.state.riders));
        riders.forEach(function(r){
          if(r.key == rider.key){
            r.full_name = result.data.full_name;
          }
        })
        this.setState({riders: riders});
      }.bind(this),
      error: function(err){
        console.err(err);
      }
    });
    $f.ajax({
      url: 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + rider.latitude + ',' + rider.longitude + '&key=' + GOOGLE_API_KEY,
      method: 'GET',
      success: function(result){
        var region = JSON.parse(JSON.stringify(this.state.region));
        region.latitude = result.results[0].geometry.location.lat;
        region.longitude = result.results[0].geometry.location.lng;
        if(result.results[0].formatted_address){
          var riders = JSON.parse(JSON.stringify(this.state.riders));
          riders.forEach(function(r){
            if(r.key == rider.key){
              r.location = result.results[0].formatted_address.split(',').slice(0, 1).join(',');
            }
          })
          this.setState({riders: riders});
        }
      }.bind(this),
      error: function(err){
        console.err(err);
      }
    });
  }

  render() {
    let riderRequests = (() => {
      if(this.state.status !== VIEWING) return;
      return this.state.riders.map(function(rider, index){
        if(rider.full_name && rider.location) {
          return (
            <Animatable.View key={rider.key} animation="bounceInDown" duration={700}>
              <Card style={styles.rider} onPress={() => {
                this.setState({startPoint: {
                  latitude: rider.latitude,
                  longitude: rider.longitude
                }});
                this.setState({status: ACCEPTED});
                clearInterval(getRidersInterval);
                var body = {
                  email: this.props.email,
                  currentLatitude: this.state.driverCoor.latitude,
                  currentLongitude : this.state.driverCoor.longitude
                };
                $f.ajax({
                  url: domain + '/ridingRequests/' + rider.key,
                  body: body,
                  method: 'PUT',
                  success: (result) => {
                    if(result.success){
                      
                    }
                    else alert('Processing failed, please check your network');
                  },
                  error: (err) => {
                    alert('Processing failed, please check your network');
                  }
                });
              }}>
                <Text>{rider.full_name + ' at ' + rider.location}</Text>
                {/* <Text>{rider.key}</Text> */}
              </Card>
            </Animatable.View>
          );
        }
        else return null;
      }.bind(this));
    })();

    const startPointMarker = this.state.startPoint ? (
      <MapView.Marker
        coordinate={this.state.startPoint}
        title={'Start Point'}
      >
      </MapView.Marker>
    ) : null;

    return (
      <View style ={styles.container}>
        <MapView
          style={styles.map}
          region={this.state.region}
          showsUserLocation={true}
          onRegionChange={this.onRegionChange.bind(this)}
          animateToRegion={{region: this.state.region, duration: this.state}}
        >
          {startPointMarker}
        </MapView>
        <View style={styles.riderList}>
          <ScrollView>
            {riderRequests}
          </ScrollView>
        </View>
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
    alignItems: 'center'
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  riderList: {
    marginTop: 60,
    alignItems: 'center'
  },
  rider: {
    alignItems: 'center',
    padding: 10,
    width: windowD.width * .9
  }
});
