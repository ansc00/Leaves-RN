import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Dimensions, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

//Zeigt die genaue Location mit dem Bild auf einer Karte an
const LocationScreen = props => {

    //Datenuebergabe speichern und weiterverwenden
    const image = props.navigation.getParam('img');
    const town = props.navigation.getParam('town');
    const postcode = props.navigation.getParam('postcode');
    const lat = props.navigation.getParam('lat');
    const lng = props.navigation.getParam('lng');

    //Region bestehen aus lat, long, latDelta, longDelta
    const [region, setRegion] = useState();
    //Marker Konfiguration
    const [markerConfig, setMarkerConfig] = useState();



    useEffect(() => {
        //Default Region
        let reg = {
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        };

        //Default: kein Marker
        let markerConfiguration = null;


        //Falls der User die Location erlaubt hatte, wird lat und lng entsprechend gesetzt um es auf der Map anzuzeigen.
        if (lat !== null && lat !== undefined && lat !== '') {
            if (lng !== null && lng !== undefined && lng !== '') {
                //Region Konfiguration
                reg = {
                    ...reg,
                    latitude: lat,
                    longitude: lng,
                };

                //Marker Konfiguration
                markerConfiguration = {
                    latlng: {
                        latitude: lat,
                        longitude: lng,
                    },
                    title: postcode + " " + town,
                    //description: 'juhu'
                    /* point: {
                         x: 5,
                         y: 5
                     }*/
                };
            }
        }

        setRegion(reg);
        setMarkerConfig(markerConfiguration);
    }, []);


    //Zwei Marker setzen (1x "normalen" + einen als Bild)
    //Falls der User keine Location hatte, wird "Mountain View" ausgewaehlt und angezeigt.
    return (
        <View style={styles.container}>
            <MapView
                style={styles.mapStyle}
                region={region}
            >
                {markerConfig ? <View>
                    <Marker
                        coordinate={markerConfig.latlng} //Koordinaten
                        title={markerConfig.title} //Titel
                        description={markerConfig.description} //Beschreibung
                    //centerOffset={markerConfig.point}
                    />
                    <Marker coordinate={markerConfig.latlng}>
                        <View style={{ marginLeft: Platform.OS === 'android' ? 92 : 140, marginBottom: Platform.OS === 'android' ? 44 : 150 }}>
                            <View style={{ borderColor: 'black', borderWidth: 1, height: 100, width: 100, overflow: 'hidden', borderRadius: 10 }}>
                                <Image style={{ height: '100%', width: '100%' }} source={{ uri: image }} />
                            </View>
                        </View>
                    </Marker>
                </View> : null}
            </MapView>
        </View>
    );
};

//HeaderTitle setzen
LocationScreen.navigationOptions = {
    headerTitle: 'Location',
};

//Styling
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mapStyle: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
});

export default LocationScreen;