
import {Animated} from 'react-native';

const domain =  "http://ivandembp.intra.uwlax.edu:3000";
const mapAPI =  "https://maps.googleapis.com/maps/api";
const GOOGLE_API_KEY = 'AIzaSyDZdy8t-8pUwPjntJk45AMyIhn5Q37OOnE';
const FIREBASE_API_KEY = 'AIzaSyARPJwJHdYb5wjDJkAatuD-4C76CTe9MYg';
const VIEWING = 'VIEWING', ACCEPTED = 'ACCEPTED', RIDING = 'RIDING', CHECKOUT = 'CHECKOUT';
const initState = {
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
  show_btn_finished: false,
  show_paySuccesBoard: false ,
  bounceInValue: new Animated.Value(0),
  keep_getRiders: false,
  keep_updateRegion: false
};

export {initState, domain, mapAPI, GOOGLE_API_KEY, FIREBASE_API_KEY,
  VIEWING, ACCEPTED, RIDING, CHECKOUT};