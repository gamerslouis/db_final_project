import React from 'react';
import { Button, Image, View, Text } from 'react-native';
import { createStackNavigator, createAppContainer } from 'react-navigation';
import { AppRegistry, StyleSheet, TextInput, Alert, //简单的JS弹出框
    TouchableOpacity, Dimensions, //获取屏幕宽高
    FlatList
    } from 'react-native';

var width = Dimensions.get('window').width;//得到屏幕宽度
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import queryString from 'query-string'
var params_out = { username: '', password:'' };

class HomeScreen extends React.Component {
  static navigationOptions = {
    headerTitle: 'CreaScribe',
  };
  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <TextInput  placeholder="Username"
                    underlineColorAndroid={'transparent'}
                    style={LoginStyles.username}
                    onChangeText={(user_text) => this.setState({user_text})}
                    clearButtonMode="always"
                    />
        <TextInput  placeholder="Password"
                    secureTextEntry={true} //隐藏输入内容
                    underlineColorAndroid={'transparent'}
                    style={LoginStyles.username}
                    onChangeText={(pass_text) => this.setState({pass_text})}/>
        <Button
          title="Login"
          onPress={() => {
            /* 1. Navigate to the Details route with params */
            params_out.password = this.state.pass_text;
            params_out.username = this.state.user_text;
            try { // s1
              fetch(`http://parto.nctu.me:25564/accounts/login?${queryString.stringify(params_out)}`, { 
                method:'GET',
                credentials: 'include'
              })
              .then((response) => {
                this.setState({
                    response: response,
                    res_status: response.status
                })
                console.log(this.state.res_status);
                if (this.state.res_status == 200) {
                    //Handle success
                    console.log('inside home')
                    this.setState({error: ""});
                    this.props.navigation.navigate('Login', {
                      pass_text: this.state.pass_text,
                      user_text: this.state.user_text
                    });
                } else {
                    //Handle error
                    alert('Failed!');
                }
              })
            } catch(error) {
                this.setState({error: error});
                console.log("error " + error);
            }
          }}
        />
        <Text>Doesn't have an account yet?</Text>
        <Text>Create one right now!</Text>
        <Button
          title="Create"
          onPress={() => {
            /* 1. Navigate to the Details route with params */
            this.props.navigation.navigate('Create');
          }}
        />
      </View>
    );
  }
 }
class LoginScreen extends React.Component {
  state = {
    anony: "oops"
  }
  static navigationOptions = ({ navigation, navigationOptions }) => {
    const { params } = navigation.state;
    return {
      title: 'Login Success!',
      /* These values are used instead of the shared configuration! */
      headerStyle: {
        backgroundColor: navigationOptions.headerTintColor,
      },
      headerTintColor: navigationOptions.headerStyle.backgroundColor,
    };
  };

  componentDidMount() {
    // check profile
    fetch('http://parto.nctu.me:25564/accounts/me', {
      method:'GET',
      credentials: 'same-origin'
    })
    .then((response) =>  response.json())
    .then(( json ) => {
      console.log('inside profile');
      this.setState((state, props) => {
        return{
          response: json,
          name: json.username,
          anony: json.is_anonymous,
          his: json.uploads
        }
      })
      console.log(this.state.his);
    })
  }
  render() {
    /* 2. Read the params from the navigation state */
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Hi { this.state.name }</Text>
        <Text>Your history is as follows.</Text>
        <FlatList
          data = { this.state.his }
          keyExtractor={(item, index) => item.key}
          renderItem = {({item}) => (
            <Text>Find { item.scientific_name }, at ({ item.longitude }, { item.latitude })</Text>
          )}
          />
        <Button
          title="Upload"
          onPress={() => {
            /* 1. Navigate to the Details route with params */
            this.props.navigation.navigate('Upload');
          }}
        />
        <Button
          title="Logout"
          onPress={() => {
            /* 1. Navigate to the Details route with params */
            fetch('http://parto.nctu.me:25564/accounts/logout', {
              method:'GET',
              credentials: 'same-origin'
            })
            .then((response) => {
              console.log(response.status);
            })
            this.props.navigation.navigate('Home');
          }}
        />
      </View>
    );
  }
 }
class UploadScreen extends React.Component {
  state = {
    anony: "oops",
    image: null,
   }
  static navigationOptions = ({ navigation, navigationOptions }) => {
    const { params } = navigation.state;
    return {
      title: 'Upload',
      /* These values are used instead of the shared configuration! */
      headerStyle: {
        backgroundColor: navigationOptions.headerTintColor,
      },
      headerTintColor: navigationOptions.headerStyle.backgroundColor,
    };
   };
  componentDidMount() {
    this.getPermissionAsync();
   }
  render() {
    /* 2. Read the params from the navigation state */
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Button // picker
          title="Pick an image"
          onPress={this._pickImage}
          />{ this.state.image &&
          <Image 
            source={{ uri: this.state.image }} 
            style={{ width: 150, height: 150, resizeMode: 'contain', backgroundColor: 'black' }} 
          />}
        <Text>Please input some infomation for this creature</Text>
        <TextInput  placeholder="Name"
                    underlineColorAndroid={'transparent'}
                    style={LoginStyles.username}
                    onChangeText={(find_name) => this.setState({find_name})}/>
        <TextInput  placeholder="Latitude"
                    underlineColorAndroid={'transparent'}
                    style={LoginStyles.username}
                    onChangeText={(find_latitude) => this.setState({find_latitude})}/>
        <TextInput  placeholder="Longitude"
                    underlineColorAndroid={'transparent'}
                    style={LoginStyles.username}
                    onChangeText={(find_longitude) => this.setState({find_longitude})}/>
        <Button // fetch post upload
          title="And upload now!"
          onPress={() => {
            /* 1. Navigate to the Details route with params */
            console.log(params_out.username, params_out.password);
            console.log(this.state.image);
            const formData = new FormData();
            formData.append('latitude', this.state.find_latitude);
            formData.append('longitude', this.state.find_longitude);
            formData.append('name', this.state.find_name);
            formData.append('file',{
              uri: this.state.image, // uri
              type: 'image/jpg', // or photo.type
              name: 'tri.jpg'
            });
            // http post6
            fetch(`http://parto.nctu.me:25564/species/upload`, {
              method:'POST',
              credentials: 'same-origin',
              body: formData,
            })
            .then(response => {
              console.log(response)
            })
            .catch(
              error => console.log('uploadImage error:', error)
            );
            this.props.navigation.navigate('Login');
          }}
        />
      </View>
    );
  }
  getPermissionAsync = async () => {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    }
   };

  _pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.cancelled) {
        this.setState({ image: result.uri });
      }

      console.log(result);
    } catch (E) {
      console.log(E);
    }
   };
 }
class CreateScreen extends React.Component {
  static navigationOptions = ({ navigation, navigationOptions }) => {
    const { params } = navigation.state;

    return {
      title: 'Create your account here!',
      /* These values are used instead of the shared configuration! */
      headerStyle: {
        backgroundColor: navigationOptions.headerTintColor,
      },
      headerTintColor: navigationOptions.headerStyle.backgroundColor,
    };
  };
  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <TextInput  placeholder="Username"
                    underlineColorAndroid={'transparent'}
                    style={LoginStyles.username}
                    onChangeText={(user_text) => this.setState({user_text})}/>
        <TextInput  placeholder="Password"
                    secureTextEntry={true} //隐藏输入内容
                    underlineColorAndroid={'transparent'}
                    style={LoginStyles.username}
                    onChangeText={(pass_text) => this.setState({pass_text})}/>
        <Button
          title="Done"
          onPress={() => {
            /* 1. Navigate to the Details route with params */
            params_out.password = this.state.pass_text;
            params_out.username = this.state.user_text;
            console.log(params_out.password,params_out.username);
            fetch(`http://parto.nctu.me:25564/accounts/register?${queryString.stringify(params_out)}`, { 
              method:'GET',
            })
            .then((response) => response.json())
            .then((json) => {
              this.setState((state, props) => {
                return{
                  res_status: json.status,
                }
              })
              console.log(json.status);
              if (this.state.res_status === 'OK') {
                  //Handle success
                  alert("Success")
              } else {
                  //Handle error
                  alert('Failed')
              }
            })
            .catch((error) => {
              console.error(error);
            });
          }}
        />
      </View>
    );
  }
 }

const RootStack = createStackNavigator(
  {
    Home: {
      screen: HomeScreen,
    },
    Login: {
      screen: LoginScreen,
    },
    Create: {
      screen: CreateScreen,
    },
    Upload: {
      screen: UploadScreen,
    },
    /*
    Profile: {
      screen: ProfileScreen,
    },
    */
  },
  {
    initialRouteName: 'Home',
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: 'green',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    },
   }
 );
const AppContainer = createAppContainer(RootStack);
export default class App extends React.Component {
  render() {
    return <AppContainer />;
  }
 }
const LoginStyles = StyleSheet.create({
    username: {
        width:width-32,//居中，宽度为屏幕宽度-32，这样左右都有16的边距
        borderRadius: 20,//输入框边界圆角度数
        borderColor: 'skyblue',//输入框边界颜色
        marginBottom:16,
        paddingLeft:10,//这里是为了在圆角之后输入
        padding:0,//去掉Android默认的padding
        borderWidth: 1,
        alignSelf:'center'//自身居中
    },
 });
