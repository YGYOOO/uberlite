import React, { Component, PropTypes } from 'react';
import { View, Text, TextInput, StyleSheet, Dimensions, TouchableHighlight, ScrollView } from 'react-native';
import { Button, Card, COLOR, PRIMARY_COLORS, Toolbar } from 'react-native-material-design';
import MapView from 'react-native-maps';
import * as Animatable from 'react-native-animatable';

import {$f} from './modules/functions.js';
import {themeColor, MKThemeColor} from './style/Theme.js';
import {domain} from './url.js';
import polyline from 'polyline';

var windowD = Dimensions.get('window');
var getRidersInterval, updateRegionInterval, sendMyGeoInterval;
const GOOGLE_API_KEY = 'AIzaSyDZdy8t-8pUwPjntJk45AMyIhn5Q37OOnE';
const FIREBASE_API_KEY = 'AIzaSyARPJwJHdYb5wjDJkAatuD-4C76CTe9MYg';
const VIEWING = 'VIEWING', ACCEPTED = 'ACCEPTED', RIDING = 'RIDING', CHECKOUT = 'CHECKOUT';

export default class Main extends Component{
  constructor(){
    super();
    var PushNotification = require('react-native-push-notification');
    PushNotification.configure({
        onRegister: (gcm_token) => {
          this.setState({gcm_token});
          // console.log( 'TOKEN:', gcm_token );
          // this.setState({directionGeos: this.convertDirectionGeos(polyline.decode('gdmjGzdykPsB@GrFEdHGdIdAhIbAdId@|Dn@~FWDw@JoDd@c@R}APiFh@_DPa\\f@wIHeAAw@GuHw@@z@rA~FnDhOJh@@|FCpPmIC}EBkHDaH@yAA?fC?lCjA?xABzAJjEF`B?tFE'))});
        },
        onNotification: (notification) => {
            // console.log( 'NOTIFICATION:', notification );
            if(notification.gettingDriverGeo){
              let rider_gcm_token = JSON.parse(notification.rider_gcm_token);
              this.setState({rider_gcm_token});
              // sendMyGeoInterval = setInterval(() => {this.sendMyGeo(rider_gcm_token)}, 5000);
            }
            // else if(notification.stopGettingDriverGeo){
            //   clearInterval(sendMyGeoInterval);
            // }
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
    rider_gcm_token: null, //不为null时会触发sendMyGeo()
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
    startLocation: null,
    endLocation: null,
    directionGeos:null,
    riders_old:[],
    riders:[],
    status: VIEWING,
    show_btn_pickedDriverUp: false,
    show_btn_finished: false
  };

  convertDirectionGeos(geos){
    var newGeos = geos.map(function(geo){
      return {
        latitude: geo[0],
        longitude: geo[1]
      };
    });
    return newGeos;
  }

  onRegionChange(region){
    this.setState({region});
  }

  updateGeo(){
    navigator.geolocation.getCurrentPosition(
      (position) => {

        var driverGeo = JSON.parse(JSON.stringify(this.state.driverGeo));
        driverGeo.latitude = position.coords.latitude;
        driverGeo.longitude = position.coords.longitude;
        this.setState({driverGeo});

        if(this.state.status === ACCEPTED && this.state.startLocation && this.state.endLocation){
          let distance = $f.distance(driverGeo.latitude, driverGeo.longitude, this.state.startLocation.latitude, this.state.startLocation.longitude, 'K')
        }

        if(this.state.status === ACCEPTED || this.state.status === RIDING){
          var region = JSON.parse(JSON.stringify(this.state.region));
          region.latitude = position.coords.latitude;
          region.longitude = position.coords.longitude;
          this.setState({region});
        }

        if(this.state.rider_gcm_token){
          this.sendMyGeo(this.state.rider_gcm_token, driverGeo, position.coords.heading);
        }

        if(this.state.status === ACCEPTED || this.state.status === RIDING){
          var region = JSON.parse(JSON.stringify(this.state.region));
          region.latitude = position.coords.latitude;
          region.longitude = position.coords.longitude;
          this.setState({region});
        }

        if(this.state.rider_gcm_token){
          this.sendMyGeo(this.state.rider_gcm_token, driverGeo, position.coords.heading);
        }
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
        let riders = this.state.riders.slice().filter(function(r1){
          let finded = false;
          result.data.forEach(function(r2){
            if(r1.key == r2.key) finded = true;
          });
          return finded;
        });

        let newRiders = result.data.filter(function(r1){
          let finded = false;
          riders.forEach(function(r2){
            if(r1.key == r2.key) finded = true;
          });
          return !finded;
        });

        if(newRiders){
          riders = riders.concat(newRiders);
          this.setState({riders});
          newRiders.forEach(function(r){
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

  sendMyGeo(rider_gcm_token, driverGeo, heading){
    $f.gcm({
      key: FIREBASE_API_KEY,
      token: rider_gcm_token.token,
      data: {
        driverGeo: driverGeo,
        heading: heading
      },
      success: () => {
        console.log('Send gcm succeeded.');
      },
      error: () => {

      }
    });
  }

  getDirection(start, end){
    let origin = start.latitude + ',' + start.longitude;
    let destination = end.latitude + ',' + end.longitude;
    $f.ajax({
      url: 'https://maps.googleapis.com/maps/api/directions/json?origin=' + origin + '&destination=' + destination +'&key=' + GOOGLE_API_KEY,
      method: 'GET',
      success: (result) => {
        this.setState({directionGeos: this.convertDirectionGeos(polyline.decode(result.routes[0].overview_polyline.points))});
      },
      error: (err) => {

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
                setTimeout(() => this.setState({show_btn_pickedDriverUp: true}), 5000);
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
                      this.getDirection(this.state.driverGeo, result.data.startLocation);
                      this.setState({startLocation: result.data.startLocation});
                      this.setState({endLocation: result.data.endLocation});
                    }
                    else alert(result.msg);
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

    const startPointMarker = this.state.startLocation ? (
      <MapView.Marker
        coordinate={this.state.startLocation}
        title={'Start Point'}
      >
      </MapView.Marker>
    ) : null;

    const endPointMarker = this.state.endLocation ? (
      <MapView.Marker
        coordinate={this.state.endLocation}
        title={'End Point'}
        pinColor={"rgb(68, 146, 239)"}
      >
      </MapView.Marker>
    ) : null;

    const direction = this.state.directionGeos ? (
      <MapView.Polyline
          key={1}
          coordinates={this.state.directionGeos}
          strokeColor="rgb(87,146,251)"
          strokeWidth={5}
        />
    ) : null;

    const btn_pickedDriverUp = this.state.show_btn_pickedDriverUp ? (
      <Animatable.View animation="bounceInDown" duration={500}>
        <View style={styles.btn_pickedDriverUp}>
          <Button text="Picked Driver Up" primary={themeColor}
            onPress={() => {
              this.setState({status: RIDING});
              this.setState({show_btn_pickedDriverUp: false});
              setTimeout(() => this.setState({show_btn_finished: true}), 5000);
              this.getDirection(this.state.startLocation, this.state.endLocation);
              $f.gcm({
                key: FIREBASE_API_KEY,
                token: this.state.rider_gcm_token.token,
                data: {
                  status: RIDING,
                },
                success: () => {
                  console.log('Send gcm succeeded.');
                },
                error: () => {

                }
              });
            }} raised
          />
        </View>
      </Animatable.View>
    ) : null;

    const btn_finished = this.state.show_btn_finished ? (
      <Animatable.View animation="bounceInDown" duration={500}>
        <View style={styles.btn_pickedDriverUp}>
          <Button text="Finished trip" primary={themeColor}
            onPress={() => {
              this.setState({status: CHECKOUT});
              this.setState({show_btn_pickedDriverUp: false});
              $f.gcm({
                key: FIREBASE_API_KEY,
                token: this.state.rider_gcm_token.token,
                data: {
                  status: CHECKOUT,
                },
                success: () => {
                  console.log('Send gcm succeeded.');
                },
                error: () => {

                }
              });
            }} raised
          />
        </View>
      </Animatable.View>
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
          {endPointMarker}
          {direction}
        </MapView>
        <View style={styles.riderList}>
          <ScrollView>
            {riderRequests}
          </ScrollView>
        </View>
        {btn_pickedDriverUp}
        {btn_finished}
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
    width: windowD.width * .9,
    marginBottom: 0
  },
  btn_pickedDriverUp: {
    width: windowD.width * .9
  }
});
