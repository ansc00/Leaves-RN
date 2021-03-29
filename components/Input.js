import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

//Eingabefeld mit gesetzten Standard werten
//Funktionale Komponente
const Input = props => { 
    return <TextInput {...props}
        style={{ ...styles.input, ...props.style }} //Uebergebene Einstellungen ueberschreiben
    />
};

//Styling
const styles = StyleSheet.create({
    input: {
        height: 30, //hoehe
        borderBottomColor: 'grey',
        borderBottomWidth: 1, //Muss gesetzt werden, sonst sieht man keine Border
        marginVertical: 10
    }

});

export default Input;