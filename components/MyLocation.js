
import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Alert } from 'react-native';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';

//Standort der Bildaufnahme
const MyLocation = props => {


    const [location, setLocation] = useState('Waiting...'); //Location


    useEffect(() => { //Wenn Komponente fertig gerendert ist, wird nach der Permission gefragt und der Standort geholt
        let isSubscribed = true;
        //Location holen
        getLocationHandler().then(location => {
            if (isSubscribed) { //Nur fals wir noch subscribed sind, darf die Location gesetzt werden
                setLocation(location);
            }
        });

        //clean up fkt
        return cleanup = () => {
            isSubscribed = false; //isSubscribed false setzen
        };
    }, [setLocation]);

    //Permission abfragen
    const verifyPermissions = async () => {
        let result = await Permissions.askAsync(Permissions.LOCATION);
        if (result.status !== 'granted') {
            setLocation(""); //Location leeren, da keine Berechtigung
            Alert.alert('No Location Permission!', '', [{ text: 'Ok' }]);
            return false;
        }
        return true;
    }


    //Location holen
    const getLocationHandler = async () => {
        const hasPermission = await verifyPermissions(); //Permission abfragen
        if (!hasPermission) {
            return;
        }

        try {
            //koordianten holen
            let locationInfo = await Location.getCurrentPositionAsync({});

            //neues obj. mit Koordinaten erzeugen
            const locationObj = {
                "latitude": locationInfo.coords.latitude,
                "longitude": locationInfo.coords.longitude
            };

            //Ort holen
            let currentCity = await Location.reverseGeocodeAsync(locationObj);
           
            //Daten aufbereiten
            const newLocationObj = {
                    ...locationObj,
                    postalCode: currentCity[0].postalCode,
                    city: currentCity[0].city,
            }
            
            //Zur Anzeige auf dem Screen 
            currentCity = currentCity[0].postalCode + ' ' + currentCity[0].city;

            props.onLocationAdded(newLocationObj);
            return currentCity;

        } catch (err) {
            console.log(err.message);
            setLocation("");
        }

    };






    return (
        <View style={styles.container}>
            <Text style={styles.paragraph}>{location}</Text>
        </View>
    );
};

//Styling
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: Constants.statusBarHeight,
    },
    paragraph: {
        margin: 24,
        fontSize: 18,
        textAlign: 'center',
        fontWeight: 'bold'
    },
});

export default MyLocation;