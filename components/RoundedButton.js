import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';

//Abgerundete Buttons
const RoundedButton = props => {

    return (
        <TouchableOpacity style={{ ...styles.button, ...props.style }} activeOpacity={0.5} onPress={props.onPress}>
            <Text style={styles.buttonText}>{props.title}</Text>
        </TouchableOpacity>
    );
};

//Styling
const styles = StyleSheet.create({
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
        overflow: 'hidden',
        backgroundColor: "green",
        width: 100,
        height: 35,
        margin: 5,
    },
    buttonText: {
        fontWeight: 'bold',
        color: 'white',
        fontSize: 16
    }
});

export default RoundedButton;