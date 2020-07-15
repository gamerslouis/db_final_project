import React, { Component } from 'react';
import { Text, View, StyleSheet, Alert, Button } from 'react-native';
import { Constants } from 'expo';
import MapView from 'react-native-maps'; // 0.19.0
import queryString from 'query-string'
var params_loca = { latitude: 23.83, longitude: 120.8 };

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
    status: 'out',
    n1: 'none',
    n2: 'none',
    n3: 'none',
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
      <View style={{flex: 1}}>
        <Text>status: {this.state.status}</Text>
        <Text>latitude: {this.state.currentLatitude}</Text>
        <Text>longitude: {this.state.currentLongitude}</Text>
        <Text>the most common creature nearby is {this.state.n1}, {this.state.n2}, {this.state.n3} </Text>
        <Button
          title="Search"
          onPress={() => {
            //params_loca.latitude = this.state.currentLatitude;
            //params_loca.longitude = this.state.currentLongitude;
            console.log(params_loca.latitude, params_loca.longitude);
            fetch(`http://parto.nctu.me:25564/species/find/location?${queryString.stringify(params_loca)}`, {
              method:'GET',
            })
            .then((response) =>  response.json())
            .then(( json ) => {
                this.setState((state, props) => {
                  return{
                    response: json,
                    res_status: json.status,
                    records: json.data,
                    status: 'in'
                  }
                })
                if(json.data.length>0){
                  this.setState((state, props) => {
                    return{
                      n1: json.data[0].species.scientific_name
                    }
                })}
                if(json.data.length>1){
                  this.setState((state, props) => {
                    return{
                      n2: json.data[1].species.scientific_name
                    }
                })}
                if(json.data.length>2){
                  this.setState((state, props) => {
                    return{
                      n3: json.data[2].species.scientific_name
                    }
                })}
                console.log(this.state.res_status);
                console.log(this.state.response);
                console.log(json.data.length);
                console.log('Here',this.state.n1,this.state.n2,this.state.n3);
            })
          }}
        />
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
          />
        </MapView>
      </View>
    );
  }
}
