import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Button, Platform } from 'react-native';
import Colors from '../constants/Colors';
import moment from 'moment';

//Repreasentiert einen Post in dem User Account (Darstellung der eigenen Posts die Bearbeitet werden koennen)
const UserPostItem = props => {

    return (
        <TouchableOpacity style={styles.postItem} onPress={props.onEditPostHandler} onLongPress={props.onDeletePostHandler} activeOpacity={0.5}>
            <View  >

                <View style={styles.imageContainer}>

                    <ImageBackground style={styles.image} source={{ uri: props.image }}>
                        <View style={styles.titleContainer}>
                            <View style={{ backgroundColor: 'white', overflow: 'hidden', borderRadius: 15, paddingRight: 3}}>
                                <Text style={styles.title} numberOfLines={1}>
                                    {props.title}
                                </Text>
                            </View>
                        </View>
                    </ImageBackground>

                    <View style={styles.locationContainer}>
                        <Text style={styles.location} numberOfLines={1}>
                            {moment(props.date).format('DD-MM-YYYY hh:mm a')}{props.postcode ? (', ' + props.postcode) : ''} {props.town ? (' ' + props.town) : ''}
                        </Text>
                    </View>

                </View>
            </View>
        </TouchableOpacity>
    );
};

//Styling
const styles = StyleSheet.create({
    postItem: {
        //ios
        shadowColor: 'black',
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,

        //android
        elevation: 5,

        //allg
        borderRadius: 5,
        borderWidth: 1,
        backgroundColor: 'white',
        height: 210,
        margin: 5,
        marginVertical: 10,
        overflow: "hidden"
    },
    imageContainer: {
        height: '90%'
       // height: Platform.OS === 'android' ? '90%' : '60%'
    },
    image: {
        width: '100%',
        height: '100%',
    },
    titleContainer: {
        //backgroundColor: 'rgba(153,217,234,0.4)',
        padding: 5,
        flexDirection: "row-reverse",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        //color: 'white',
        marginVertical: 5,
        marginLeft: 5
    },
    locationContainer: {
        flexDirection: "column-reverse",
        backgroundColor: Colors.userPostItemLocation,
        paddingVertical: 5,
        paddingHorizontal: 12,
        // height: '25%',
        alignItems: "flex-end"
    },
    location: {
        fontSize: 16,
        marginLeft: 5,
        // fontStyle: "italic",
        //fontWeight: 'bold'
    }
});

export default UserPostItem;