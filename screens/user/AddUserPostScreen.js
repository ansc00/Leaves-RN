import React, { useState, useEffect, useCallback } from 'react';
import { ImageBackground, Text, View, Platform, StyleSheet, ScrollView, Alert, KeyboardAvoidingView } from 'react-native';
import { HeaderButtons, Item, } from 'react-navigation-header-buttons';
import HeaderButton from '../../components/HeaderButton';
import Input from '../../components/Input';
import ImagePicker from '../../components/ImagePicker';
import { useDispatch } from 'react-redux';
import { createPost } from '../../store/actions/posts';
import MyLocation from '../../components/MyLocation';
import UploadModal from '../../components/UploadModal';


//Screen um einen neuen Post zu erstellen
const AddUserPostScreen = props => {

    const dispatch = useDispatch(); //Zugriff auf Redux dispatch fkt
    const [pickedImage, setPickedImage] = useState(); //Ausgewaehltes Bild
    const [title, setTitle] = useState(''); //Titel
    const [location, setLocation] = useState(); //Location mit PLZ und ORT
    const [coord, setCoord] = useState([]) //Array mit den Location Koordianten Breitengrad/Laengengrad (lat,lng)
    const [isLoading, setIsLoading] = useState(false); //fuer Spinner
    const [error, setError] = useState(); //Error handling
    const [showModal, setShowModal] = useState(false); //Upload Pop-up
    const [uploadProgress, setUploadProgress] = useState(0); //Fortschrittsanzeige
    const [inputErrorMsg, setInputErrorMsg] = useState(''); //Error Message fuer die Titeleingabe

    //Error anzeigen, falls es zu einem kommt
    useEffect(() => {
        if (error) {
            Alert.alert('Error', error, [{ text: 'OK' }])
        }
    }, [error]);


    //Title pruefen und setzen
    //Title muss mind. 3 Zeichen haben
    const titleInputHandler = inputText => {
        setTitle(inputText);
        if (inputText.length < 3) {
            setInputErrorMsg('min 3 characters needed'); //Input Error Message setzen
        } else {
            setInputErrorMsg(''); //Falls die Anford. erfuellt sind, Error Message bereinigen
        }
    };

    //Bildaufnahme setzen
    const onImageTakenHandler = input => {
        setPickedImage(input);
    };

    //Location setzen
    const onLocationAddedHandler = input => {
        //Daten aufbereiten
        const loc = input.postalCode + " " + input.city; //PLZ, ORT
        const coordArr = [input.latitude, input.longitude]; //Breiten- und Laengengrade

        setCoord(coordArr);
        setLocation(loc);
    };



    //Den neu erstellten Post abspeichern 'handler'
    const saveNewPostHandler = useCallback(async () => {
        //pruefen ob alles gesetzt wurde
        if (!title || !pickedImage || inputErrorMsg !== '') {
            Alert.alert('Bild und Titel wählen', "", [{ text: 'OK' }])
            return;
        }

        //Falls keine Location abgefragt werden konnte, wird auch keine gesetzt
        if (location === null || location === undefined) {
            setLocation("");
        }
        if (coord === null || coord === undefined) {
            setCoord("");
        }

        //Daten aufbereiten
        let town = "";
        let postcode = "";
        if (location && location.length > 0) {
            let locArray = location.split(' ');
            if (locArray.length >= 3) {
                postcode = locArray[0];
                for (let i = 1; i < locArray.length; i++) {
                    town += locArray[i] + " ";
                }
            } else { //2
                postcode = locArray[0];
                town = locArray[1];
            }
        }


        //Neuen Post als JS-Obj. anlegen
        const newPost = {
            postTitle: title,
            postPostcode: postcode,
            postTown: town,
            latitude: coord[0],
            longitude: coord[1],
            postImage: pickedImage,
        };

        setError(null); //Error zuruecksetzen
        setIsLoading(true);
        try {
            //dispatch createPost, Referenz auf den 'Fortschritt' mitgeben
            await dispatch(createPost(newPost, onProgressChangeHandler));
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            setShowModal(false);
        }
    }, [dispatch, title, pickedImage, location, coord, inputErrorMsg]);


    //Fortschritt verwalten
    const onProgressChangeHandler = (progress) => {
        if (progress < 100) {
            setShowModal(true);
            setUploadProgress(progress);
        } else { //Bei 100% isLoading false setzen
            setUploadProgress(progress);
            setIsLoading(false);
        }
    };

    //Falls 100% erreicht, zu UserManageScreen wechseln
    useEffect(() => {
        if (uploadProgress === 100) {
            props.navigation.navigate('UserManage');
        }

    }, [onProgressChangeHandler]); //Abhaengigkeit onPressChangeHandler


    //Referenz uebergeben
    useEffect(() => {
        props.navigation.setParams({ save: saveNewPostHandler });
    }, [saveNewPostHandler]);


    //Button, Titeleingabe und ggf. aufgenommenes Bild einblenden
    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior="padding"
            keyboardVerticalOffset={100}
        >

            <ImageBackground source={require('../../assets/images/background.jpg')} style={{ width: '100%', height: '100%' }}>
                <View style={styles.screen}>
                    <ScrollView>
                        {showModal ? <UploadModal visible={showModal} progress={uploadProgress} /> : null}
                        <ImagePicker
                            onImageTaken={onImageTakenHandler}
                        />
                        <MyLocation onLocationAdded={onLocationAddedHandler} />
                        <Text style={{ marginTop: 10, fontWeight: 'bold', fontSize: 18 }}>Title: </Text>
                        <Input style={styles.input}
                            blurOnSubmit
                            autoCapatilize='none'
                            autoCorrect={false}
                            maxLength={20}
                            onChangeText={titleInputHandler}
                            value={title}
                            //borderBottomWidth={2}
                            borderBottomColor="black"
                        />
                        {inputErrorMsg === '' ? null : <Text style={{ color: 'red', }}>{inputErrorMsg}</Text>}
                    </ScrollView>
                </View>
            </ImageBackground>
        </KeyboardAvoidingView>
    );
};

//Header
//Titel und rechten save-Button setzen
AddUserPostScreen.navigationOptions = (navData) => {
    return {
        headerTitle: 'create new post',
        headerRight: (<HeaderButtons HeaderButtonComponent={HeaderButton} >
            <Item //Save-Button setzen
                title="save"
                iconName={Platform.OS === 'android' ? 'md-save' : 'ios-save'}
                onPress={navData.navigation.getParam('save')} //Referenz auf Fkt
            />
        </HeaderButtons>)
    };
};


//Styling
const styles = StyleSheet.create({
    screen: {
        flex: 1,
        padding: 10,
        backgroundColor: 'rgba(255,255,255,0.5)'
    },
    image: {
        height: 100,
        width: 100,
    },
    input: {
        fontSize: 20,
        marginVertical: 10,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default AddUserPostScreen; 