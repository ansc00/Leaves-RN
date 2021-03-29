import React, { useState } from 'react';
import { View, Button, Text, StyleSheet, Image, Alert, } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import Colors from '../constants/Colors';

//Ein Bild aufnehmen oder aus der Galery auswaehlen
//Falls props.galery true uebergeben wird, soll die galery geoeffnet werden
const ImgPicker = props => {

    const [pickedImage, setPickedImage] = useState(); //gewaehltes Bild

    //Funktion um permissions abzufragen
    const verifyPermissions = async () => {
        const result = await Permissions.askAsync(Permissions.CAMERA, Permissions.CAMERA_ROLL);
        if (result.status !== 'granted') {
            Alert.alert('No Camera Permission granted!', '', [{ text: 'Ok' }]);
            return false;
        }
        return true;
    }

    //Funktion um ein Bild aufzunehmen
    const takeImageHandler = async () => {
        const hasPermission = await verifyPermissions(); //permissions abfragen
        if (!hasPermission) {
            return; //nicht weitermachen, falls keine permisson
        }

        let image;
        if (props.galery) { //oeffne Galerie
            image = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true, //cropping zb erlaubt
                quality: 0.3, //zwischen 0 und 1
            });

        } else { //neues bild aufnehmen
            image = await ImagePicker.launchCameraAsync({
                allowsEditing: true, //cropping zb erlaubt
                aspect: [4, 3],
                quality: 0.3, //zwischen 0 und 1
                //base64: true //Ein base64 String als Rückgabe
            });
        }

        setPickedImage(image.uri);
        //Daten weitergeben
        props.onImageTaken(image.uri);
    };


    //Falls kein BILD gemacht wurde, soll es den Platz NICHT verschwenden
    if (pickedImage === undefined) {
        styles.imagePreview = {
            ...styles.imagePreview, //Voreignestellte Einstellung uebernehmen
            height: 10 //anpassung der hoehe
        };
        styles.image = {
            ...styles.image,
            borderColor: null,
            borderWidth: 0
        }

    } else {
        styles.imagePreview = {
            ...styles.imagePreview,
            height: 200,
        };
        styles.image = {
            ...styles.image,
            borderColor: 'black',
            borderWidth: 2,
            overflow: 'hidden',
            borderRadius: 20
        };
    }

    return (
        <View style={styles.imagePicker}>
            <View style={styles.imagePreview}>
                <Text>{' '}</Text>
                <Image style={styles.image} source={{ uri: pickedImage }} />
            </View>
            <View style={{ paddingTop: 10 }} >
                <View style={styles.buttonContainer}>
                    <Button
                        title={pickedImage ? "Take another one?" : "take a picture"}
                        color={Colors.secondary}
                        onPress={takeImageHandler} />
                </View>
            </View>
        </View>
    );
};

//Styling
let styles = StyleSheet.create({
    imagePicker: {
        alignItems: 'center',
        marginBottom: 10
    },
    imagePreview: {
        width: '100%',
        height: 200,
        marginBottom: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    buttonContainer: {
        overflow: 'hidden',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    }

});

export default ImgPicker;