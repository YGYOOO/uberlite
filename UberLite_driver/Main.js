import React, { Component, PropTypes } from 'react';
import { View, Text, TextInput, StyleSheet, Dimensions, TouchableHighlight, ScrollView } from 'react-native';
import { Button, Card, COLOR, PRIMARY_COLORS, Toolbar } from 'react-native-material-design';
import MapView from 'react-native-maps';
import * as Animatable from 'react-native-animatable';

import {$f} from './modules/functions.js';
import {themeColor, MKThemeColor} from './style/Theme.js';
import {domain} from './url.js';

var windowD = Dimensions.get('window');
var getRidersInterval, updateRegionInterval, sendMyGeoInterval;
const GOOGLE_API_KEY = 'AIzaSyDZdy8t-8pUwPjntJk45AMyIhn5Q37OOnE';
const FIREBASE_API_KEY = 'AIzaSyARPJwJHdYb5wjDJkAatuD-4C76CTe9MYg';
const VIEWING = 'VIEWING', ACCEPTED = 'ACCEPTED', RIDING = 'RIDING';

export default class Main extends Component{
  constructor(){
    super();
    var PushNotification = require('react-native-push-notification');
    PushNotification.configure({
        onRegister: (gcm_token) => {
          this.setState({gcm_token});
          console.log( 'TOKEN:', gcm_token );
        },
        onNotification: (notification) => {
            console.log( 'NOTIFICATION:', notification );
            if(notification.status === ACCEPTED){
              this.setState({status: ACCEPTED});
              this.judgeStatus(ACCEPTED);
              this.getDriverInfo(notification.driver_email);
            }
            if(notification.gettingDriverGeo){
              var rider_gcm_token = JSON.parse(notification.rider_gcm_token);
              this.setState({rider_gcm_token});
              sendMyGeoInterval = setInterval(() => {this.sendMyGeo(rider_gcm_token)}, 5000);
            }
            else if(notification.stopGettingDriverGeo){
              clearInterval(sendMyGeoInterval);
            }
        },
        senderID: "728367311402",
        popInitialNotification: true,
        requestPermissions: true,
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        var region = JSON.parse(JSON.stringify(this.state.region));
        region.latitude = position.coords.latitude;
        region.longitude = position.coords.longitude;
        this.setState({region});
        this.setState({driverGeo: region});
        this.getRiders();
        getRidersInterval = setInterval(() => {this.getRiders()}, 3000);
        updateRegionInterval = setInterval(() => {this.updateGeo()}, 5000);
      },
      (error) => alert(JSON.stringify(error)),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
  }

  state = {
    gcm_token: {},
    rider_gcm_token: {},
    driverGeo: {
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
    status: VIEWING
  };

  onRegionChange(region){
    this.setState({region});
  }

  updateGeo(){
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // var region = JSON.parse(JSON.stringify(this.state.region));
        // region.latitude = position.coords.latitude;
        // region.longitude = position.coords.longitude;
        // this.setState({region});

        var driverGeo = JSON.parse(JSON.stringify(this.state.driverGeo));
        driverGeo.latitude = position.coords.latitude;
        driverGeo.longitude = position.coords.longitude;
        this.setState({driverGeo});
      },
      (error) => alert(JSON.stringify(error)),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
  }

  getRiders(){
    $f.ajax({
      url: domain + '/geo/riders/?radius=5000&latitude=' + this.state.region.latitude + '&longitude=' + this.state.region.longitude,
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

  sendMyGeo(rider_gcm_token){
    $f.gcm({
      key: FIREBASE_API_KEY,
      token: rider_gcm_token.token,
      data: {
        driverGeo: this.state.driverGeo,
      },
      success: () => {
        console.log('Send gcm succeeded.');
      },
      error: () => {

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
                  currentLatitude: this.state.driverGeo.latitude,
                  currentLongitude : this.state.driverGeo.longitude,
                  driver_gcm_token: this.state.gcm_token
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
