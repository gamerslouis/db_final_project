import React, { Component } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
// import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomePage from './HomePage';
import LeftPage from './LeftPage';
import RightPage from './RightPage';


function HomeScreen() { return <HomePage />; }
function LeftScreen() { return <LeftPage />; }
function RightScreen() { return <RightPage />; }

const Tab = createBottomTabNavigator();
function MyTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Creature" component={LeftScreen} />
      <Tab.Screen name="Location" component={RightScreen} />
    </Tab.Navigator>
  );
 }
export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      isLoading: true
    };
  }

  componentDidMount() {
    fetch('https://reactnative.dev/movies.json')
      .then((response) => response.json())
      .then((json) => {
        this.setState({ data: json.movies });
      })
      .catch((error) => console.error(error))
      .finally(() => {
        this.setState({ isLoading: false });
      });
  }

  render() {
    const { data, isLoading } = this.state;

    return (
      <View style={{ flex: 5, padding: 5, top: 20}}>
        
    <NavigationContainer>
      <MyTabs />
    </NavigationContainer>
      </View>
    );
  }
 }



 
