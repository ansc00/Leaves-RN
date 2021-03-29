import React from 'react';

 //createSwitchNavigator: zeigt immer nur einen Screen an, sodass man von da aus NICHT zurück gehen auf einen anderen! (fuer Authentication use Case)
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';

//Fuer Platform ueberprüfung, Platform spezifischen code
import { Platform } from 'react-native';

//Screen importieren für die Navigatoren
import PostsOverviewScreen from '../screens/overview/PostsOverviewScreen';
import PostDetailScreen from '../screens/overview/PostDetailScreen';
import LocationScreen from '../screens/overview/LocationScreen';
import WebViewScreen from '../screens/overview/WebViewScreen';

import FavScreen from '../screens/Favorites/FavScreen';

import AddUserPostScreen from '../screens/user/AddUserPostScreen';
import EditUserPostScreen from '../screens/user/EditUserPostScreen';
import UserManageScreen from '../screens/user/UserManageScreen';
import AuthenticationScreen from '../screens/user/AuthenticationScreen';
import SettingsScreen from '../screens/user/SettingsScreen';

//Globale Farbkonstanten
import Colors from '../constants/Colors';
//Fuer bestimmte Icons
import { FontAwesome } from '@expo/vector-icons';

import StartupScreen from '../screens/Startup/StartupScreen';




//StackNAVIGATOR für 'All posts' Seite erstellen
const PostsNavigator = createStackNavigator({
    PostsOverview: PostsOverviewScreen,
    PostDetail: PostDetailScreen,
    WebView: WebViewScreen,
    Location: LocationScreen
}, {
    //Konfiguration
    defaultNavigationOptions: {
        headerStyle: {
            backgroundColor: Platform.OS === 'android' ? Colors.primary : ''
        },
        headerTintColor: 'black',
    }
});

//StackNAVIGATOR fuer 'Favorites' Seite erstellen
const FavNavigator = createStackNavigator({
    Fav: FavScreen,
}, {
    //Konfiguration
    defaultNavigationOptions: {
        headerStyle: {
            backgroundColor: Platform.OS === 'android' ? Colors.primary : ''
        },
        headerTintColor: 'black',
    }
});


//StackNAVIGATOR fuer 'User' Seite erstellen
const UserNavigator = createStackNavigator({
    UserManage: UserManageScreen,
    EditUserPost: EditUserPostScreen,
    AddUserPost: AddUserPostScreen,
    Settings: SettingsScreen
}, {
    //Konfiguration
    defaultNavigationOptions: {
        headerStyle: {
            backgroundColor: Platform.OS === 'android' ? Colors.primary : ''
        },
        headerTintColor: 'black'
    }
});



//Konfiguration des Tab-Navigator
const tabScreenConfig = {
    //Screen Einstiegspunkt
    AllPosts: {
        screen: PostsNavigator, //PostsNavigator uebergeben
        //Konfiguration
        navigationOptions: {
            tabBarLabel: 'Posts', //Labelname des Tabs
            tabBarIcon: (tabInfo) => {
                //icon newspaper-o 
                return <FontAwesome name='newspaper-o' size={25} color={tabInfo.tintColor} />
            },
            tabBarColor: Colors.primary
        }
    },
    Fav: {
        screen: FavNavigator,
        navigationOptions: {
            tabBarLabel: 'Favorites', 
            tabBarIcon: (tabInfo) => {
                return <FontAwesome name='heart-o' size={30} color={tabInfo.tintColor} />
            },
        }
    },
    User: {
        screen: UserNavigator, 
        navigationOptions: {
            tabBarLabel: 'User', 
            tabBarIcon: (tabInfo) => {
                 return <FontAwesome name='user-o' size={25} color={tabInfo.tintColor} />
            },
        }
    },
};

//BottomTabNavigator erstellen
const PostsFavUserTabNavigator = createBottomTabNavigator(
    tabScreenConfig,
    {
        //Konfiguration
        tabBarOptions: {
            activeTintColor: Colors.secondary, //farbe des AKTIVEN tabs
            inactiveTintColor: Platform.OS === 'android' ? 'black' : 'grey',
            activeBackgroundColor: Platform.OS === 'android' ? Colors.primary : '',
            inactiveBackgroundColor: Platform.OS === 'android' ? Colors.primary : '',
        }
    }
);

//StackNAVIGATOR für 'Authenticate' erstellen
const AuthenticationNavigator = createStackNavigator({
    Authentication: AuthenticationScreen
},
    {
        //Konfiguration
        defaultNavigationOptions: {
            headerStyle: {
                backgroundColor: Platform.OS === 'android' ? Colors.primary : ''
            },
            headerTintColor: 'black',
        }
    }
);

//SwitchNAVIGATOR erstellen
const MainNavigator = createSwitchNavigator({
    //Startet beim StartupScreen
    Startup: StartupScreen,
    Authentication: AuthenticationNavigator,
    StartApp: PostsFavUserTabNavigator
});

export default createAppContainer(MainNavigator);