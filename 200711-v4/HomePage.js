import React from 'react';
import { Button, Image, View, Text } from 'react-native';
import { createStackNavigator, createAppContainer } from 'react-navigation';

import { AppRegistry, StyleSheet, TextInput, Alert, //简单的JS弹出框
    TouchableOpacity, Dimensions //获取屏幕宽高
    } from 'react-native';

var width = Dimensions.get('window').width;//得到屏幕宽度


class HomeScreen extends React.Component {
  static navigationOptions = {
    headerTitle: 'Talon Talon yeeeee',
  };

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <TextInput  placeholder="Username"
                    underlineColorAndroid={'transparent'}//去掉下划线
                    style={LoginStyles.username}
                    //将文本写入state
                    onChangeText={(user_text) => this.setState({user_text})}/>
        <TextInput  placeholder="Password"
                    secureTextEntry={true}//隐藏输入内容
                    underlineColorAndroid={'transparent'}
                    style={LoginStyles.username}
                    onChangeText={(pass_text) => this.setState({pass_text})}/>
        <Text>Home Screen</Text>
        <Button
          title="Login"
          onPress={() => {
            /* 1. Navigate to the Details route with params */
            this.props.navigation.navigate('Login', {
              pass_text: this.state.pass_text,
              user_text: this.state.user_text
            });
          }}
        />
      </View>
    );
  }
}

class LoginScreen extends React.Component {
  static navigationOptions = ({ navigation, navigationOptions }) => {
    const { params } = navigation.state;

    return {
      title: params ? params.otherParam : 'A Nested Details Screen',
      /* These values are used instead of the shared configuration! */
      headerStyle: {
        backgroundColor: navigationOptions.headerTintColor,
      },
      headerTintColor: navigationOptions.headerStyle.backgroundColor,
    };
  };

  render() {
    /* 2. Read the params from the navigation state */
    const { params } = this.props.navigation.state;

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Login Success!</Text>
        <Text>Hi { params.user_text }</Text>
        <Text>Your Upload History is as following.</Text>
        <Button
          title="Upload now"
          onPress={() =>
            this.props.navigation.setParams({ otherParam: 'Updated!' })}
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
  },
  {
    initialRouteName: 'Home',
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: '#f4511e',
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
    container:{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center'
    },
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
    login :{
        width:width-32,
        height:35,
        borderRadius: 20,//按钮圆角
        alignSelf:'center',
        backgroundColor:'skyblue',
        marginTop:20,
        justifyContent:'center',
        alignItems:'center'//显示Text组件居中
    },
});
