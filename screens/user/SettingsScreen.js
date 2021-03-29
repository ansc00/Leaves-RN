import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Button, Image, Alert, ImageBackground, KeyboardAvoidingView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import { useSelector, useDispatch } from 'react-redux';
import * as authActions from '../../store/actions/authenticate';
import Input from '../../components/Input';
import * as serverActions from '../../store/actions/server';
import { ScrollView } from 'react-native-gesture-handler';
import Colors from '../../constants/Colors';


//Einstellungscreen
//Profilbild kann hier eingestellt werden 
//Logout ist hierrueber ebenfalls moeglich
const SettingsScreen = props => {

    const dispatch = useDispatch();
    //Profilbild holen
    const [pickedImage, setPickedImage] = useState(useSelector(state => state.auth.imageURL));
    const [servAddress, setServAddress] = useState(useSelector(state => state.server.address)); //Server Address
    const [servPort, setServPort] = useState(useSelector(state => state.server.port)); //Server Address

    //Permissions abfragen
    const verifyPermissions = async () => {
        const result = await Permissions.askAsync(Permissions.CAMERA, Permissions.CAMERA_ROLL);
        if (result.status !== 'granted') {
            Alert.alert('No Camera Permission granted!', '', [{ text: 'Ok' }]);
            return false;
        }
        return true;
    }

    //Bild Aufnehmen oder aus der Galery auswaehlen 'handler'
    //Falls selectImageFromGalary true ist > aus Galerie auswaehlen
    const takeImageHandler = async (selectImageFromGalary) => {
        const hasPermission = await verifyPermissions(); //permissions abfragen
        if (!hasPermission) {
            return; //nicht weitermachen, falls keine permisson
        }
        let image;
        if (selectImageFromGalary) { //oeffne Galerie
            image = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true, //cropping zb erlaubt
                quality: 0.3, //zwischen 0 und 1
            });
        } else { //Neues Bild aufnehmen
            image = await ImagePicker.launchCameraAsync({
                allowsEditing: true, //cropping zb erlaubt
                aspect: [4, 3],
                quality: 0.3, //zwischen 0 und 1
            });
        }

        if (image && image.cancelled !== true) {//Nur wenns trueisch ist setzen
            setPickedImage(image.uri);
            //dispatch updateUserData > Profilbild speichern
            await dispatch(authActions.updateUserData(image.uri));
        }
    };


    //Abfrage von wo man das Bild hernehmen moechte
    const imageHandler = () => {
        Alert.alert("", "please select", [{
            text: 'cancel',
            onPress: () => { },
        },
        {
            text: 'new image',
            onPress: () => { takeImageHandler(false) },
        },
        {
            text: 'galery',
            onPress: () => { takeImageHandler(true) }
        }
        ])
    }

    //Abfrage ob man sich ausloggen moechte 
    const loggoutHandler = () => {
        Alert.alert("Logout?", "", [
            {
                text: "no",
                onPress: () => { },
                style: "default"
            },
            {
                text: "yes",
                onPress: () => {
                    //dispatch logout
                    dispatch(authActions.logout())
                },
                style: 'default'
                //ausloggen
            }
        ] 
        );
    };

    //Sobald sich die Adresse aendert, wird es im State uebernommen
    useEffect(() => {
        dispatch(serverActions.setServerAddress(servAddress));
    }, [servAddress])

    //Sobald sich der Port aendert, wird es im State uebernommen
    useEffect(() => {
        dispatch(serverActions.setServerPort(servPort));
    }, [servPort])

    //Profilbild und Logout-Button anzeigen
    return (
        <ImageBackground source={require('../../assets/images/background.jpg')} style={{ width: '100%', height: '100%' }}>

            <KeyboardAvoidingView
                style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.5)' }}
                behavior="padding"
                keyboardVerticalOffset={120}
            >

                <ScrollView style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ margin: 5, padding: 5, fontWeight: 'bold', fontSize: 22 }}>Profile</Text>

                        <TouchableOpacity onPress={imageHandler}>
                            <View style={styles.imageContainer}>
                                <Image
                                    source={pickedImage ? { uri: pickedImage } : require('../../assets/images/profileImage.png')}
                                    style={styles.image}
                                    resizeMode="cover"
                                />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 30 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 20 }}>Server Address </Text>
                        <Input style={styles.input}
                            blurOnSubmit
                            autoCapatilize='none'
                            autoCorrect={false}
                            onChangeText={(address) => setServAddress(address)}
                            value={servAddress}
                            borderBottomColor="black"
                        />
                    </View>
                    <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 5}}>
                        <Text style={{ fontWeight: 'bold', fontSize: 20 }}>Port</Text>
                        <Input style={styles.input}
                            blurOnSubmit
                            autoCapatilize='none'
                            autoCorrect={false}
                            onChangeText={(port) => setServPort(port)}
                            value={servPort}
                            borderBottomColor="black"
                        />
                    </View>

                    <View style={{ justifyContent: 'center', alignItems: 'center', marginVertical: 110 }}>
                        <View style={{ width: 100, marginBottom: 1, borderRadius: 20, overflow: 'hidden' }}>
                            <Button title="Logout" color={Colors.secondary} onPress={loggoutHandler} />
                        </View>
                    </View>

                </ScrollView>

            </KeyboardAvoidingView>
        </ImageBackground>
    );
};

//Headertitle setzen
SettingsScreen.navigationOptions = {
    headerTitle: 'Settings'
};

//Styling
const styles = StyleSheet.create({
    imageContainer: {
        width: 150,
        height: 150,
        borderRadius: 150,
        borderWidth: 3,
        borderColor: 'black',
        overflow: 'hidden',
        margin: 30
    },
    image: {
        width: '100%',
        height: '100%',
    },
    input: {
        fontWeight: '600',
        //width: '50%'
    }
});

export default SettingsScreen;