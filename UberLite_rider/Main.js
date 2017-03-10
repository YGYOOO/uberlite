import React, { Component, PropTypes } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, AsyncStorage } from 'react-native';
import { Button, Card, COLOR, PRIMARY_COLORS, Toolbar } from 'react-native-material-design';
import MapView from 'react-native-maps';
import PlacesAutocomplete from './components/PlacesAutocomplete';
import * as Animatable from 'react-native-animatable';
import Spinner from 'react-native-spinkit';
import StarRating from 'react-native-star-rating';

import {$f} from './modules/functions.js';
import {themeColor, MKThemeColor} from './style/Theme.js';
import {initState, domain, mapAPI, GOOGLE_API_KEY, FIREBASE_API_KEY, 
  VIEWING, WATING, ACCEPTED, RIDING, CHECKOUT, NORMAL, LARGE, SUV} from './global.js'
import polyline from 'polyline';


let windowD = Dimensions.get('window');
let trip_info = {
    rider_email: null,
    driver_email: null,
    star_location: null,
    end_location: null,
    estimated_price: null,
    price: null,
    score: 4,
    post_time: null,
    accepted_time: null,
    pickup_time: null,
    arrival_time: null
  }

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
                trip_info.accepted_time = Date.now();
                this.setState({status: ACCEPTED});
                this.judgeStatus(ACCEPTED);
                this.getDriverInfo(notification.driver_email);
                trip_info.driver_email = notification.driver_email;
                let driver_gcm_token = JSON.parse(notification.driver_gcm_token);
                this.setState({driver_gcm_token});
                this.startGettingDriverGeo(driver_gcm_token);
                break;
              case RIDING:
                trip_info.pickup_time = Date.now();
                this.setState({status: RIDING});
                this.setState({show_driverBoard: false});
                this.setState({show_restTimeBoard: true});
                let d = new Date();
                this.setState({startTime: d.getHours() + d.getMinutes()/60});
                this.getRestTime();
                this.setState({keep_getRestTime: true});
                break;
              case CHECKOUT:
                trip_info.arrival_time = Date.now();
                this.countPrice(() => {
                  this.setState({show_checkoutBoard: true});
                  this.setState({show_restTimeBoard: false});
                });
                break;
            }
            if(notification.driverGeo){
              console.log(notification.driverGeo)
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

    this.getCurrentPosition();

    // setTimeout(() => {
    //   // console.log(this.state.status);
    //   // this.setState({status: RIDING});
    //   this.props.navigator.pop();
    //   // this.props.navigator.push({title: 'Main'});
    // }, 2000);
    this.retrieveStates();
    setInterval(this.getRestTime.bind(this), 10000);
  }

  state = initState;

  storeStateDebounce = $f.debounce(this.storeState.bind(this), 1000);

  componentDidMount() {
    // this.setState({show_thanksBoard: true});
    // this.setState({show_checkoutBoard: false});

    // Animated.sequence([ 
    //   Animated.spring(          // Uses easing functions
    //     this.state.bounceInValue,    // The value to drive
    //     {
    //       toValue: 1,
    //       friction: 7,
    //       tension: 40
    //     }            // Configuration
    //   ),
    //   Animated.delay(1000),
    //   Animated.spring(          // Uses easing functions
    //     this.state.bounceInValue,    // The value to drive
    //     {
    //       toValue: 0,
    //       friction: 7,
    //       tension: 35
    //     }            // Configuration
    //   )
    // ]).start(() => {
    //   for(var key in initState){
    //     let stateObj = {};
    //     stateObj[key] = initState[key];
    //     this.setState(stateObj);
    //   }
    // });
  }

  componentDidUpdate(){
    this.storeStateDebounce();
  }
  

  storeState(){
    try {
      let storeObj = {};
      storeObj.state = this.state;
      storeObj.date = Date.now();
      AsyncStorage.setItem('@uberLiteRider:state', JSON.stringify(storeObj));
    } catch (error) {
      // Error saving data
    }
  }

  retrieveStates(){
    AsyncStorage.getItem('@uberLiteRider:state', (err, value) => {
      if(err){
        console.log(err);
      }
      else if(value){
        let storeObj = JSON.parse(value);
        let state = storeObj.state,
            date = storeObj.date,
            minPast = (Date.now() - date) / 1000 / 60;

        if(minPast > 30){
          AsyncStorage.removeItem('@uberLiteRider:state');
          return;
        }
        else{
          for(var key in state){
            if(key === 'region') continue;
            let obj = {};
            obj[key] = state[key];
            this.setState(obj);
          }
        }
      }
    });
  }

  getCurrentPosition(){
    navigator.geolocation.getCurrentPosition(
      (position) => {
        var region = JSON.parse(JSON.stringify(this.state.region));
        region.latitude = position.coords.latitude;
        region.longitude = position.coords.longitude;
        this.setState({region});
        this.setState({startLocation: region});
      },
      (error) => alert(JSON.stringify(error)),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
  }

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

  estimateTotalPrice(){
    let origins = this.state.startLocation.latitude + ',' + this.state.startLocation.longitude;
    let destinations = this.state.endLocation.latitude + ',' + this.state.endLocation.longitude;
    let url = mapAPI + '/distancematrix/json?origins=' + 
      origins + 
      '&destinations=' + 
      destinations + 
      '&mode= driving&key=' + 
      GOOGLE_API_KEY;

    $f.ajax({
      url: url,
      method: 'GET',
      success: (result) => {
        if(result.status === 'OK'){
          let totalMile = result.rows[0].elements[0].distance.text.split(' ')[0],
              totalTime = result.rows[0].elements[0].duration.text.split(' ')[0];
          let d = new Date();
          let days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
          let startDay = days[d.getDay()];
          let startTime = d.getHours() + (d.getMinutes() + 1)/60;
          this.setState({totalMile});
          let url = domain + '/tripPrice?startDay=' + 
          startDay +'&startTime=' + 
          startTime + '&totalTime=' + 
          totalTime + '&totalMile=' + 
          totalMile + '&per_mile_price_type=normal' +  
          '&car_type=' + this.state.carType;

          $f.ajax({
            url: url,
            method: 'GET',
            success: (result) => {
              if(result.success){
                let estimatedPrice = result.data.totalPrice;
                trip_info.estimated_price = estimatedPrice;
                this.setState({estimatedPrice});
              }
              else{
                alert('Sending request failed, please check your network');
                console.log(result.msg);
              }
            },
            error: (err) => {
              console.log(err);
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
        console.log(err);
        alert('Sending request failed, please check your network');
        this.navLogin();
      }
    });
  }

  postRidingRequest(){
    trip_info.rider_email = this.props.email;
    trip_info.star_location = {
      latitude: this.state.startLocation.latitude,
      longitude: this.state.startLocation.longitude
    };
    trip_info.end_location= this.state.endLocation;
    trip_info.post_time = Date.now();

    this.setState({show_watingSpinner: true});
    this.setState({show_markerTitle : false});
    this.setState({show_searcher_startingPoint: false});
    this.setState({show_searcher_destination: false});
    this.setState({show_btn_askCar: false});

    var body = {
      startLocation: {
        latitude: this.state.startLocation.latitude,
        longitude: this.state.startLocation.longitude
      },
      endLocation: this.state.endLocation,
      gcm_token: this.state.gcm_token,
      car_type: this.state.carType
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
    this.setState({show_driverMarker: true});
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
    if(this.state.keep_getRestTime){
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
  }

  updateRegion(){
    if(this.state.status === RIDING){
      let region = JSON.parse(JSON.stringify(this.state.region));
      region.latitude = this.state.driverGeo.latitude;
      region.longitude = this.state.driverGeo.longitude;
      this.setState({region});
    }
  }

  onStarRatingPress(rating) {
    trip_info.score = rating;
    this.setState({
      starCount: rating
    });
  }

  countPrice(callback){
    let d = new Date(),
        days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
        startDay = days[d.getDay()],
        startTime = this.state.startTime,
        totalTime = (d.getHours() + d.getMinutes()/60 - startTime) * 60,
        totalMile = this.state.totalMile;
    let url = domain + '/tripPrice?startDay=' + 
    startDay +'&startTime=' + 
    startTime + '&totalTime=' + 
    totalTime + '&totalMile=' + 
    totalMile + '&car_type=' + this.state.carType

    $f.ajax({
      url: url,
      method: 'GET',
      success: (result) => {
        if(result.success){
          let price = result.data.totalPrice;
          trip_info.price = price;
          this.setState({price});
          callback();
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

  onConfirmCheckout(){
    console.log(trip_info);
    $f.ajax({
      url: domain + '/tripInfo',
      method: 'POST',
      body: trip_info,
      success: (result) => {
        if(result.success){
          $f.gcm({
            key: FIREBASE_API_KEY,
            token: this.state.driver_gcm_token.token,
            data: {
              tripFinished: true
            },
            success: () => {
              console.log('Send gcm succeeded.');
              // this.setState({show_checkoutBoard: false});
            },
            error: () => {

            }
          });

          this.setState({show_thanksBoard: true});
          this.setState({show_checkoutBoard: false});

          Animated.sequence([ 
            Animated.spring(          // Uses easing functions
              this.state.bounceInValue,    // The value to drive
              {
                toValue: 1,
                friction: 7,
                tension: 40
              }            // Configuration
            ),
            Animated.delay(1000),
            Animated.spring(          // Uses easing functions
              this.state.bounceInValue,    // The value to drive
              {
                toValue: 0,
                friction: 7,
                tension: 35
              }            // Configuration
            )
          ]).start(() => {
            for(var key in initState){
              if(key == 'gcm_token') continue;
              let stateObj = {};
              stateObj[key] = initState[key];
              this.setState(stateObj);
            }
            this.getCurrentPosition();
            setTimeout(() => console.log(this.state), 1500);
          });
        }
        else{
          alert('Sending request failed, please check your network');
          console.err(result.msg);
          this.navLogin();
        }
      },
      error: (err) => {
        console.err(err);
        alert('Sending request failed, please check your network');
        this.navLogin();
      }
    });
    let url = mapAPI + `/geocode/json?latlng=${this.state.startLocation.latitude},${this.state.startLocation.longitude}` +
          `&language=EN&result_type=locality&key=${GOOGLE_API_KEY}`;
    console.log(url);
    $f.ajax({
      url,
      method: 'GET',
      success: (result) => {
        console.log(result)
        let name = result.results[0].formatted_address.split(',')[0];
        let geo = [
          this.state.startLocation.longitude,
          this.state.startLocation.latitude
        ];
        let riding = new Date().getTime();
        $f.ajax({
          url: domain + '/statistics/ridingsAmount',
          method: 'POST',
          body: {
            name,
            geo,
            riding
          },
          success: (result) => {
            console.log(result);
          },
          error: (err) => {
            console.err(err);
          }
        });
      },
      error: (err) => {
        console.err(err);
      }
    });
  }

  hanlePressOnCarType(carType) {
    this.setState({carType}, this.estimateTotalPrice.bind(this));
    this.setState({estimatedPrice: '...'});
  }

  render() {
    const searcher_startingPoint = this.state.show_searcher_startingPoint ? (
      <Card>
        <PlacesAutocomplete
          width={windowD.width}
          height={30}
          placeholder={'Enter Starting Point'}
          callback={(result) => {
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
            width={windowD.width}
            height={30}
            placeholder={'Enter Destination'}
            callback={(result) => {
              this.setState({endLocation: {
                latitude: result.results[0].geometry.location.lat,
                longitude: result.results[0].geometry.location.lng
              }});
              this.estimateTotalPrice();
              this.setState({show_btn_askCar: true});
            }}
          />
        </Card>
      </Animatable.View>
    ) : null;

    let carType = this.state.carType;
    const carTypeBoard = this.state.show_btn_askCar ? (
      <Animatable.View animation="fadeInUp" duration={350}>
        <View style={styles.carTypeBoard}>
          <Card style={[styles.carType, carType === NORMAL ? styles.carTypeBoard_selected : null]} onPress={this.hanlePressOnCarType.bind(this, NORMAL)}>
            <Text>{'Normal'}</Text>
          </Card>
          <Card style={[styles.carType, carType === LARGE ? styles.carTypeBoard_selected : null]} onPress={this.hanlePressOnCarType.bind(this, LARGE)}>
            <Text>{'Large'}</Text>
          </Card>
          <Card style={[styles.carType, carType === SUV ? styles.carTypeBoard_selected : null]} onPress={this.hanlePressOnCarType.bind(this, SUV)}>
            <Text>{'SUV'}</Text>
          </Card>
        </View>
      </Animatable.View>
    ) : null;

    const priceEstimationBoard = this.state.show_btn_askCar ? (
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
          <Text style={styles.watingText}>{'Please wating for a driver...'}</Text>
        </View>
      </View>
    ) : null;

    const driverBoard = (this.state.show_driverBoard && this.state.driverInfo)  ? (
      <Animatable.View animation="fadeInDown" duration={500}>
        <Card style={styles.infoBoard}>
          <Text>{'Driver ' + this.state.driverInfo.full_name + ' is on the way.'}</Text>
          <Text>{'Licence Number: ' + this.state.driverInfo.licence_number}</Text>
          <Text>{'Phone Number: ' + this.state.driverInfo.phone_number}</Text>
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

    const driverMarker = this.state.show_driverMarker && this.state.driverGeo ? (
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
      >
      </MapView.Marker>
    ) : null;

    const checkoutBoard = this.state.show_checkoutBoard ? (
      <View style={styles.shade}>
        <Animatable.View animation="bounceIn" duration={700}>
          <Card style={styles.checkoutBoard}>
            <Text style={styles.checkoutBoardTitle}>{'Rate for driver'}</Text>
            <View style={{width: 130, margin: 10}}>
              <StarRating 
                disabled={false}
                maxStars={5}
                starSize={20}
                starColor={'#FFCC00'}
                rating={this.state.starCount}
                selectedStar={(rating) => this.onStarRatingPress(rating)}
              />
            </View>
            <Text style={{textAlign: 'center'}}>{'Pay for trip: $' + this.state.price}</Text>
            <View style={{marginTop: 5}}>
              <Button text="PAY" primary={themeColor} onPress={this.onConfirmCheckout.bind(this)} raised theme={'dark'}/>
            </View>
          </Card>
        </Animatable.View>
      </View>
    ) : null;

    const thanksBoard = this.state.show_thanksBoard ? (
      <Animated.View style={{transform: [{scale: this.state.bounceInValue}]}}>
        <Card style={styles.thanksBoard}>
          <Text style={{fontSize: 20}}>{'Thanks!'}</Text>
        </Card>
      </Animated.View>
    ) : null;

    return (
      <View style ={styles.container}>
        <MapView
          style={styles.map}
          region={this.state.region}
          showsUserLocation={true}
          onRegionChange={this.onRegionChange.bind(this)}
          onPress={() => this.marker.showCallout()}
        >
          <MapView.Marker
            coordinate={this.state.startLocation}
            pinColor={"rgb(68, 146, 239)"}
            title={'Get on at here'}
            ref={ref => { this.marker = ref; if(this.marker && this.state.show_markerTitle) this.marker.showCallout();}}
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
          {carTypeBoard}
          {priceEstimationBoard}
          {btn_askCar}
        </View>
        <View style={styles.driverBoardView}>
          {driverBoard}
          {restTimeBoard}
        </View>
        {watingSpinner}
        {checkoutBoard}
        {thanksBoard}
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
    justifyContent: 'center',
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
    width: windowD.width
  },
  priceEstimationBoard: {
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: 3,
    marginTop: 6
  },
  carTypeBoard: {
    flex:1,
    flexDirection: 'row',
    marginBottom: 3,
  },
  carType: {
    'flex':1,
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
    marginBottom: 0
  },
  carTypeBoard_selected: {
    borderWidth: 1,
    borderColor: MKThemeColor
  },
  shade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkoutBoard: {
    width: windowD.width * .8,
    padding: 18,
    alignItems: 'center'
  },
  checkoutBoardTitle: {
    textAlign: 'center', 
    alignItems: 'center'
  },
  watingTextView: {
    position: 'absolute',
    top: windowD.height/2 + 15,
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
    width: windowD.width
  },
  infoBoard: {
    alignItems: 'center',
    padding: 10,
    paddingTop: 20,
    width: windowD.width * .9
  },
  thanksBoard: {
    width: 200,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
