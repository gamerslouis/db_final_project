import React, { Component } from 'react';
import { Text, View, StyleSheet, Alert } from 'react-native';
import { Constants } from 'expo';
import MapView from 'react-native-maps'; // 0.19.0

// You can import from local files
import AssetExample from './components/AssetExample';

// or any pure javascript modules available in npm

import "prop-types";
import "@expo/vector-icons";

export default class App extends Component {
  state = {
    mapRegion: { latitude: 23.6, longitude: 120.7324, latitudeDelta: 0.922*4.5, longitudeDelta: 0.421*4.5 },
    //mapRegion: { latitude: 40.7579067, longitude: -73.9726483, latitudeDelta: 0.922*4.5, longitudeDelta: 0.421*4.5 },
    currentLatitude: 23.6,
    currentLongitude: 120.7324,
  };

  _handleMapRegionChange = mapRegion => {
    this.setState({ mapRegion });
  };
  
  _handleRegionChangeComplete = mapRegion => {
    //Alert.alert('Change fired');
  }
  
  componentDidMount = () => {
    navigator.geolocation.getCurrentPosition(
      //Will give you the current location
      position => {
        const currentLongitude = position.coords.longitude;
        //const currentLongitude = JSON.stringify(position.coords.longitude);
        //getting the Longitude from the location json
        const currentLatitude = position.coords.latitude;
        //const currentLatitude = JSON.stringify(position.coords.latitude);
        //getting the Latitude from the location json
        this.setState({ currentLongitude: currentLongitude });
        //Setting state Longitude to re re-render the Longitude Text
        this.setState({ currentLatitude: currentLatitude });
        //Setting state Latitude to re re-render the Longitude Text
      },
      error => alert(error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
    this.watchID = navigator.geolocation.watchPosition(position => {
      //Will give you the location on location change
      console.log(position);
      const currentLongitude = position.coords.longitude;
      //const currentLongitude = JSON.stringify(position.coords.longitude);
      //getting the Longitude from the location json
      const currentLatitude = position.coords.latitude;
      //const currentLatitude = JSON.stringify(position.coords.latitude);
      //getting the Latitude from the location json
      this.setState({ longitude: currentLongitude });
      //Setting state Longitude to re re-render the Longitude Text
      this.setState({ latitude: currentLatitude });
      //Setting state Latitude to re re-render the Longitude Text
    });
  };
  componentWillUnmount = () => {
    navigator.geolocation.clearWatch(this.watchID);
  };

  render() {
    
    //console.log(typeof this.state.currentLatitude);
    //console.log(this.state.currentLatitude);
    //console.log(this.state.currentLongitude);
    return (
      
      <MapView
        style={{ flex: 1 }}
        region={this.state.mapRegion}
        onRegionChange={this._handleMapRegionChange}
        onRegionChangeComplete={this._handleRegionChangeComplete}
        >
         <MapView.Marker
          coordinate={{latitude: this.state.currentLatitude,
              longitude: this.state.currentLongitude,}}
          // coordinate={{latitude: 23.6,
          //    longitude: 120.6,}}
          title={"marker.title"}
          description={"desss"}
        />
      </MapView>
    
    );
  }
}
