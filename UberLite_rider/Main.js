import React, { Component, PropTypes } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { Button, Card, COLOR, PRIMARY_COLORS, Toolbar } from 'react-native-material-design';
import MapView from 'react-native-maps';
import PlacesAutocomplete from './components/PlacesAutocomplete';
import * as Animatable from 'react-native-animatable';
import Spinner from 'react-native-spinkit';

import {$f} from './modules/functions.js';
import {themeColor, MKThemeColor} from './style/Theme.js';
import {domain, mapAPI} from './url.js';
import polyline from 'polyline';
const GOOGLE_API_KEY = 'AIzaSyDZdy8t-8pUwPjntJk45AMyIhn5Q37OOnE';
const FIREBASE_API_KEY = 'AIzaSyARPJwJHdYb5wjDJkAatuD-4C76CTe9MYg';
const VIEWING = 'VIEWING', WATING = 'WATING', ACCEPTED = 'ACCEPTED', RIDING = 'RIDING', CHECKOUT = 'CHECKOUT';

var windowDimension = Dimensions.get('window');
let getRestTimeInterval, updateRegionInterval;

export default class Main extends Component{
  constructor(){
    super();
    var PushNotification = require('react-native-push-notification');
    PushNotification.configure({
        onRegister: (gcm_token) => {
          this.setState({gcm_token});
          console.log( 'TOKEN:', gcm_token );
          // console.log(this.convertDirectionGeos(polyline.decode('gdmjGneykP?oFfJwQ')));
          // this.setState({directionGeo: this.convertDirectionGeos(polyline.decode('gdmjGneykP?oFfJwQ'))});
        },
        onNotification: (notification) => {
            // console.log( 'NOTIFICATION:', notification );
            switch(notification.status){
              case ACCEPTED:
                this.setState({status: ACCEPTED});
                this.judgeStatus(ACCEPTED);
                this.getDriverInfo(notification.driver_email);
                var driver_gcm_token = JSON.parse(notification.driver_gcm_token);
                this.setState(driver_gcm_token);
                this.startGettingDriverGeo(driver_gcm_token);
                break;
              case RIDING:
                this.setState({status: RIDING});
                this.setState({show_driverBoard: false});
                this.setState({show_restTimeBoard: true});
                this.getRestTime();
                getRestTimeInterval = setInterval(this.getRestTime.bind(this), 10000);
                break;
            }
            if(notification.driverGeo){
              var driverGeo = JSON.parse(notification.driverGeo);
              this.setState({driverGeo}, this.updateRegion);
              var driverHeading = parseInt(notification.heading);
              this.setState({driverHeading});
            }
        },
        senderID: "728367311402",
        popInitialNotification: true,
        requestPermissions: true,
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        var region = this.state.region;
        region.latitude = position.coords.latitude;
        region.longitude = position.coords.longitude;
        this.setState({region});
        this.setState({startLocation: region});
        this.setState({driverCoor: region});
      },
      (error) => alert(JSON.stringify(error)),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
  }

  state = {
    status: VIEWING,
    gcm_token: '',
    driver_gcm_token: '',
    riderGeo: {
      latitude: 43,
      longitude: -91
    },
    driverGeo: null,
    region: {
      latitude: 43,
      longitude: -91,
      latitudeDelta: 0.025,
      longitudeDelta: 0.0121
    },
    startLocation: {
      latitude: 43,
      longitude: -91
    },
    endLocation: null,
    directionGeo: [{
      latitude: 43.8178,
      longitude: -91.2292
      },
      {
        latitude: 43.814,
        longitude: -91.2292
      }
    ],
    startLocationName:'',
    show_searcher_startingPoint: true,
    show_searcher_destination: false,
    show_priceEstimationBoard: false,
    show_restTimeBoard: false,
    restTime: null,
    estimatedPrice: '',
    startTime: 0,
    show_btn_askCar: false,
    show_watingSpinner: false,
    show_driverBoard: false,
    driverInfo: null,
    driverHeading: 0,
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

  navLogin(){
    this.props.updateTitle('Login');
    this.props.navigator.pop();
  }

  onRegionChange(region){
    this.setState({region});
    if(this.state.status === VIEWING){
      this.setState({startLocationName: ''});
      this.setState({startLocation: region});
    }
  }

  fillStartLocation(){
    let latitude = this.state.startLocation.latitude, longitude = this.state.startLocation.longitude;
    $f.ajax({
      url: mapAPI + '/geocode/json?latlng=' + latitude + ',' + longitude + '&key=' + GOOGLE_API_KEY,
      method: 'GET',
      success: (result) => {
        let startLocationName = result.results[0].formatted_address;
        this.setState({startLocationName});
        this.setState({show_searcher_destination: true});
      },
      error: (err) => {
        console.err(err);
      }
    });
  }

  getTotalPrice(){
    let origins = this.state.startLocation.latitude + ',' + this.state.startLocation.longitude;
    let destinations = this.state.endLocation.latitude + ',' + this.state.endLocation.longitude;
    let url = mapAPI + '/distancematrix/json?origins=' + origins + '&destinations=' + destinations + '&mode= driving&key=' + GOOGLE_API_KEY
    $f.ajax({
      url: url,
      method: 'GET',
      success: (result) => {
        if(result.status === 'OK'){
          let totalMile = result.rows[0].elements[0].distance.text.split(' ')[0];
          let totalTime = result.rows[0].elements[0].duration.text.split(' ')[0];
          let d = new Date();
          let days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
          let startDay = days[d.getDay()];
          let startTime = d.getHours() + d.getMinutes()/60;
          this.setState({startTime});
          let url = domain + '/tripPrice?startDay=' + startDay +'&startTime=' + startTime + '&totalTime=' + totalTime + '&totalMile=' + totalMile + '&per_mile_price_type=normal'
          $f.ajax({
            url: url,
            method: 'GET',
            success: (result) => {
              if(result.success){
                let estimatedPrice = result.data.totalPrice;
                this.setState({estimatedPrice});
              }
              else{
                alert('Sending request failed, please check your network');
                console.err(result.msg);
              }
            },
            error: (err) => {
              console.err(err);
              alert('Sending request failed, please check your network');
              this.navLogin();
            }
          });
        }
        else{
          alert('Sending request failed, please check your network');
        }
      },
      error: (err) => {
        console.err(err);
        alert('Sending request failed, please check your network');
        this.navLogin();
      }
    });
  }

  postRidingRequest(){
    this.setState({show_watingSpinner: true});
    this.setState({show_searcher_startingPoint: false});
    this.setState({show_searcher_destination: false});
    this.setState({show_btn_askCar: false});
    this.setState({show_priceEstimationBoard: false});

    var body = {
      startLocation: {
        latitude: this.state.startLocation.latitude,
        longitude: this.state.startLocation.longitude
      },
      endLocation: this.state.endLocation,
      gcm_token: this.state.gcm_token
    };
    $f.ajax({
      url: domain + '/ridingRequests/' + this.props.email,
      method: 'POST',
      body: body,
      success: (result) => {
        console.log(result);
        if(result.success){

        }
        else{
          alert('Sending request failed, please check your network');
          this.navLogin();
        }
      },
      error: (err) => {
        console.err(err);
        alert('Sending request failed, please check your network');
        this.navLogin();
      }
    });
  }

  judgeStatus(status){
    if((status && status === ACCEPTED) || this.state.status === ACCEPTED){
      this.setState({show_watingSpinner: false});
      this.setState({show_driverBoard: true});
    }
  }

  getDriverInfo(driver_email){
    $f.ajax({
      url: domain + '/drivers/' + driver_email,
      method: 'GET',
      success: (result) => {
        if(result.success){
          this.setState({driverInfo: result.data});
        }
        else{

        }
      },
      error: (err) => {
        console.err(err);
      }
    });
  }

  startGettingDriverGeo(driver_gcm_token){
    console.log(driver_gcm_token);
    $f.gcm({
      key: FIREBASE_API_KEY,
      token: driver_gcm_token.token,
      data: {
        gettingDriverGeo: true,
        rider_gcm_token: this.state.gcm_token
      },
      success: () => {
        console.log('Send gcm succeeded.');
      },
      error: () => {

      }
    });
  }

  getRestTime(){
    let origins = this.state.driverGeo.latitude + ',' + this.state.driverGeo.longitude;
    let destinations = this.state.endLocation.latitude + ',' + this.state.endLocation.longitude;
    let url = mapAPI + '/distancematrix/json?origins=' + origins + '&destinations=' + destinations + '&mode= driving&key=' + GOOGLE_API_KEY
    $f.ajax({
      url: url,
      method: 'GET',
      success: (result) => {
        if(result.status === 'OK'){
          // let totalMile = result.rows[0].elements[0].distance.text.split(' ')[0];
          let restTime = result.rows[0].elements[0].duration.text.split(' ')[0];
          this.setState({restTime})
        }
        else{
          alert('Sending request failed, please check your network');
        }
      },
      error: (err) => {
        console.err(err);
        alert('Sending request failed, please check your network');
        this.navLogin();
      }
    });
  }

  updateRegion(){
    if(this.state.status === RIDING){
      let region = JSON.parse(JSON.stringify(this.state.region));
      region.latitude = this.state.driverGeo.latitude;
      region.longitude = this.state.driverGeo.longitude;
      this.setState({region});
    }
  }

  render() {
    const searcher_startingPoint = this.state.show_searcher_startingPoint ? (
      <Card>
        <PlacesAutocomplete
          width={windowDimension.width}
          height={30}
          placeholder={'Enter Starting Point'}
          callback={(result) => {
            console.log(1);
            var startLocation = JSON.parse(JSON.stringify(this.state.startLocation));
            startLocation.latitude = result.results[0].geometry.location.lat;
            startLocation.longitude = result.results[0].geometry.location.lng;
            this.setState({startLocation});
            this.setState({region: startLocation})
            this.setState({show_searcher_destination: true});
          }}
          value={this.state.startLocationName}
        />
      </Card>
    ) : null;

    const searcher_destination = this.state.show_searcher_destination ? (
      <Animatable.View animation="fadeInDown" duration={350}>
        <Card style={styles.endPointSearcher}>
          <PlacesAutocomplete
            width={windowDimension.width}
            height={30}
            placeholder={'Enter Destination'}
            callback={(result) => {
              this.setState({endLocation: {
                latitude: result.results[0].geometry.location.lat,
                longitude: result.results[0].geometry.location.lng
              }});
              this.getTotalPrice();
              this.setState({show_btn_askCar: true});
              this.setState({show_priceEstimationBoard: true});
            }}
          />
        </Card>
      </Animatable.View>
    ) : null;

    const priceEstimationBoard = this.state.show_priceEstimationBoard ? (
      <Animatable.View animation="fadeInUp" duration={350}>
        <Card style={styles.priceEstimationBoard}>
          <Text>{this.state.estimatedPrice ? 'Estimated Price: ' + this.state.estimatedPrice : 'Estimating Price...'}</Text>
        </Card>
      </Animatable.View>
    ) : null;

    const btn_askCar = this.state.show_btn_askCar ? (
      <Animatable.View animation="fadeInUp" duration={350}>
        <Button text="ASK FOR A CAR" primary={themeColor} onPress={this.postRidingRequest.bind(this)} raised theme={'dark'}/>
      </Animatable.View>
    ) : null;

    const watingSpinner = this.state.show_watingSpinner ? (
      <View style={styles.shade}>
        <Spinner style={styles.spinner} isVisible={true} size={60} type={'Pulse'} color={'white'}/>
        <View style={styles.watingTextView}>
          <Text style={styles.watingText}>{'Please wating for a rider...'}</Text>
        </View>
      </View>
    ) : null;

    const driverBoard = (this.state.show_driverBoard && this.state.driverInfo)  ? (
      <Animatable.View animation="fadeInDown" duration={500}>
        <Card style={styles.infoBoard}>
          <Text>{'Driver ' + this.state.driverInfo.full_name + ' is on the way.'}</Text>
        </Card>
      </Animatable.View>
    ) : null;

    const restTimeBoard = (this.state.show_restTimeBoard && this.state.restTime)  ? (
      <Animatable.View animation="fadeInDown" duration={500}>
        <Card style={styles.infoBoard}>
          <Text>{'About ' + this.state.restTime + ' min to destination.'}</Text>
        </Card>
      </Animatable.View>
    ) : null;

    const driverMarker = this.state.driverGeo ? (
      <MapView.Marker
        coordinate={this.state.driverGeo}
        image={require('./img/car_up.png')}
        anchor={{x: .5, y:.5}}
        rotation={this.state.driverHeading}
      >
      </MapView.Marker>
    ) : null;

    const endPointMarker = this.state.endLocation ? (
      <MapView.Marker
        coordinate={this.state.endLocation}
        pinColor={"rgb(68, 146, 239)"}
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
        >
          <MapView.Marker
            coordinate={this.state.startLocation}
            title={'Get on at here'}
          >
            <MapView.Callout onPress={this.fillStartLocation.bind(this)}>
            </MapView.Callout>
          </MapView.Marker>
          {endPointMarker}
          {driverMarker}
          {/* <MapView.Polyline
              key={1}
              coordinates={this.state.directionGeo}
              strokeColor="#000"
              fillColor="rgba(255,0,0,0.5)"
              strokeWidth={1}
            /> */}
        </MapView>
        <View style={styles.searchers}>
          {searcher_startingPoint}
          {searcher_destination}
        </View>
        <View style={styles.confirm}>
          {priceEstimationBoard}
          {btn_askCar}
        </View>
        <View style={styles.driverBoardView}>
          {driverBoard}
          {restTimeBoard}
        </View>
        {watingSpinner}
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
  searchers:{
    position: 'absolute',
    top: 55,
  },
  startPointSearcher: {
    // position: 'absolute',
    // top: 55,
  },
  endPointSearcher: {
    marginTop: 0
  },
  confirm: {
    position: 'absolute',
    bottom: 10,
    width: windowDimension.width
  },
  priceEstimationBoard: {
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: 3
  },
  shade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
    opacity: .5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  watingTextView: {
    position: 'absolute',
    top: windowDimension.height/2 + 15,
    left: 0,
    right: 0,
    alignItems: 'center'
  },
  watingText: {
    color: 'white',
    fontSize: 18
  },
  driverBoardView: {
    position: 'absolute',
    top: 41,
    alignItems: 'center',
    width: windowDimension.width
  },
  infoBoard: {
    alignItems: 'center',
    padding: 10,
    paddingTop: 20,
    width: windowDimension.width * .9
  }
});
