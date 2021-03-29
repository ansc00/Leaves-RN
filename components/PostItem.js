import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import moment from 'moment'; //fuer Datum
import Colors from '../constants/Colors';


//Repräsentiert einen einzelnen Post
const PostItem = props => {

    return (
        <View style={styles.postItem}>
            <TouchableOpacity onPress={props.onSelectedPost} activeOpacity={1.0}>

                <View style={styles.imageContainer}>
                    <ImageBackground style={styles.image} source={{ uri: props.image }}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.title} numberOfLines={1}>
                                {props.title}
                            </Text>
                        </View>
                    </ImageBackground>
                </View>

                <View style={styles.locationContainer}>
                    <Text style={styles.location} numberOfLines={1}>
                        {moment(props.date).format('DD-MM-YYYY hh:mm a')}{props.postcode ? (', ' + props.postcode) : ''} {props.town ? (' ' + props.town) : ''}
                    </Text>
                </View>

            </TouchableOpacity>
        </View>
    );
};


//Styling
const styles = StyleSheet.create({
    postItem: {
        backgroundColor: 'white',
        height: 300,
        marginVertical: 1
    },
    imageContainer: {
        height: '90%'
    },
    image: {
        width: '100%',
        height: '100%',
    },
    titleContainer: {
        backgroundColor: Colors.postItemTitle,
        paddingVertical: 5,
        paddingHorizontal: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginVertical: 5,
        marginLeft: 5
    },
    locationContainer: {
        flexDirection: "column-reverse",
        backgroundColor: Colors.postLocation,
        paddingVertical: 5,
        paddingHorizontal: 12,
        height: '10%',
        alignItems: "flex-end"
    },
    location: {
        fontSize: 16,
        marginLeft: 5,
        fontStyle: "italic",
        fontWeight: 'bold'
    }
});

export default PostItem;