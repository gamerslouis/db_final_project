import React, { Component } from 'react';
import { Text, View, TextInput, StyleSheet, Alert, Button } from 'react-native';
import { Constants } from 'expo';
import MapView from 'react-native-maps'; // 0.19.0
import { Searchbar } from 'react-native-paper';
import queryString from 'query-string'
var params_crea = { name: '' };

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
    reports: [
      {"latitude": 23.6, "longitude": 120.7, location:"ttt"},
      {"latitude": 23.5, "longitude": 120.6, location:"rrr"},
      {"latitude": 23.3, "longitude": 120.1, location:"rrr"},
    ],
    records: [
      {"latitude": 23.6, "longitude": 120.7, location:"ttt"},
    ],
    status: 'yes',
  };

  _handleMapRegionChange = mapRegion => {
    this.setState({ mapRegion });
  };
  
  _handleRegionChangeComplete = mapRegion => {
    //Alert.alert('Change fired');
  }
  handleKeyPress(e) {
      //if (e.key == "Enter") {
    //}
  }
  render() {
    
    console.log(this.state.records);
    return (
      <View style={{flex: 1}}>
      <TextInput
        placeholder="Please input the Creature. (In Chinese/English)"
        onChangeText={query => { this.setState({ firstQuery: query })}}
      />
      <Button
        title="Search"
        onPress={() => {
          params_crea.name = this.state.firstQuery;
          try { // s1
            fetch(`http://parto.nctu.me:25564/species/find/species?${queryString.stringify(params_crea)}`, {
              method:'GET',
            })
            .then((response) =>  response.json())
            .then(( json ) => {
              this.setState({
                  response: json,
                  res_status: json.status,
                  records: json.data,
                  status: 'yeep'
              })
              console.log(this.state.records);
            })
            .catch((error) => {
              console.error(error);
            });
          } catch(error) {
              this.setState({error: error});
              console.log("error " + error);
          }
        }}
      />
      <MapView
        style={{ flex: 1 }}
        region={this.state.mapRegion}
        onRegionChange={this._handleMapRegionChange}
        onRegionChangeComplete={this._handleRegionChangeComplete}
        >
        {this.mapMarkers()}
      </MapView>
      </View>
    
    );
  }
  mapMarkers = () => {
    return this.state.records.map((report) => <MapView.Marker
      coordinate = {{ latitude: report.latitude, longitude: report.longitude }}
      title = { this.state.firstQuery }
    />)
  }
}
