import {Animated} from 'react-native';

const domain =  "http://ivandembp.intra.uwlax.edu:3000";
const mapAPI =  "https://maps.googleapis.com/maps/api";
const GOOGLE_API_KEY = 'AIzaSyDZdy8t-8pUwPjntJk45AMyIhn5Q37OOnE';
const FIREBASE_API_KEY = 'AIzaSyARPJwJHdYb5wjDJkAatuD-4C76CTe9MYg';
const VIEWING = 'VIEWING', WATING = 'WATING', ACCEPTED = 'ACCEPTED', RIDING = 'RIDING', CHECKOUT = 'CHECKOUT';
const NORMAL = 'normal',  LARGE = 'large', SUV = 'suv';
const initState = {
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
  startLocationName: '',
  show_markerTitle: true,
  show_searcher_startingPoint: true,
  show_searcher_destination: false,
  show_restTimeBoard: false,
  restTime: null,
  estimatedPrice: '',
  startTime: 0,
  totalMile: 0,
  price: 0,
  show_btn_askCar: false,
  show_watingSpinner: false,
  show_driverBoard: false,
  show_checkoutBoard: false,
  show_thanksBoard: false,
  show_driverMarker: false,
  show_carPicture: 0,
  driverInfo: null,
  driverHeading: 0,
  starCount: 4,
  bounceInValue: new Animated.Value(0),
  keep_getRestTime: false,
  carType: NORMAL
};

export {initState, domain, mapAPI, GOOGLE_API_KEY, FIREBASE_API_KEY,
  VIEWING, WATING, ACCEPTED, RIDING, CHECKOUT, NORMAL, LARGE, SUV};
