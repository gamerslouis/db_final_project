import React, { Component } from 'react';
import { Text, View, StyleSheet, Alert } from 'react-native';
import { Constants } from 'expo';
import MapView from 'react-native-maps'; // 0.19.0
import { Searchbar } from 'react-native-paper';

// You can import from local files
import AssetExample from './components/AssetExample';

// or any pure javascript modules available in npm

import "prop-types";
import "@expo/vector-icons";

export default class App extends Component {
  state = {
    mapRegion: { latitude: 23.6, longitude: 120.7324, latitudeDelta: 0.922*4.5, longitudeDelta: 0.421*4.5 },
    currentLatitude: 23.6,
    currentLongitude: 120.7324,
    firstQuery: '',
  };

  _handleMapRegionChange = mapRegion => {
    this.setState({ mapRegion });
  };
  
  _handleRegionChangeComplete = mapRegion => {
    //Alert.alert('Change fired');
  }

  render() {
    return (
      <View style={{flex: 1}}>
      <Searchbar
        placeholder="Please input the Creature. (In Chinese)"
        onChangeText={query => { this.setState({ firstQuery: query }); }}
        value={this.state.firstQuery}
      />
      <MapView
        style={{ flex: 1 }}
        region={this.state.mapRegion}
        onRegionChange={this._handleMapRegionChange}
        onRegionChangeComplete={this._handleRegionChangeComplete}
        >
         <MapView.Marker
          //coordinate={{latitude: this.state.currentLatitude,
          //    longitude: this.state.currentLongitude,}}
          coordinate={{latitude: 23.6,
              longitude: 120.6,}}
          title={"marker.title"}
          description={"desss"}
        />
      </MapView>
      </View>
    
    );
  }
}
