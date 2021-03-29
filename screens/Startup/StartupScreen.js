import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, AsyncStorage, Alert } from 'react-native';
import Colors from '../../constants/Colors';
import { useDispatch } from 'react-redux';
import * as authActions from '../../store/actions/authenticate';
import * as firebase from 'firebase';
import { firebaseConfig } from '../../constants/FirebaseConfig'


const StartupScreen = props => {

    //hook to access the redux dispatch function
    const dispatch = useDispatch();

    //Aufruf, sobald die Komponente gemountet ist.
    useEffect(() => {

        //Versuch sich zunächst einzuloggen, falls die Daten noch aktuell sind.
        const tryLogin = async () => {

            //Daten aus dem Storage holen
            const userData = await AsyncStorage.getItem('userData');
            //Evtl. falls token erneurt wurde, das token aus dem Storage holen
            let newUserToken = await AsyncStorage.getItem('newToken');
            let tokenIsExpired = false;
            let response;
            let resData;

            if (!userData) { //Falls keine Daten dort abgelegt waren, wird zum Authenticationscreen navigiert.
                props.navigation.navigate('Authentication');
                return;
            }

            const transformedData = JSON.parse(userData); //Daten zu JSON-Object konvertieren
            let { token, userId, userEmail } = transformedData; //Daten aus dem JSON-Object rausholen

            //Versuch Daten zu holen, falls das token noch AKTIV ist -> direkt einloggen
            try {
                response = await fetch(`${firebaseConfig.databaseURL}/users/${userId}.json?auth=${token}`);
                
                if (!response.ok && response.status === 401) { //Error 401: Unauthorized
                    tokenIsExpired = true;

                    if (newUserToken == null || newUserToken === undefined) { //Falls kein token vorher ausgetauscht wurde -> User muss sich neu einloggen.
                        return;
                    }

                   //Neuer Versuch auf die Daten zuzugreifen, mit einem neuen token.
                    response = await fetch(`${firebaseConfig.databaseURL}/users/${userId}.json?auth=${newUserToken}`);

                    if (!response.ok) { //Neueres token ist ebenfalls abgelaufen.
                        const errorResData = await response.json();
                        const errorId = errorResData.error.message;

                        let message;

                        //Error Message setzen
                        switch (errorId) {
                            case 'TOKEN_EXPIRED':
                                message = 'The users credential is no longer valid. The user must sign in again';
                                break;
                            case 'INVALID_REFRESH_TOKEN':
                                message = 'An invalid refresh token is provided';
                                break;
                            case 'INVALID_GRANT_TYPE':
                                message = 'the grant type specified is invalid!';
                                break;
                            case 'MISSING_GRANT_TYPE':
                                message = 'missing grant_type'
                            default: message = 'Error';
                        }

                        //logout loescht Daten aus dem Storage 
                        dispatch(authActions.logout());
                        Alert.alert('Please Login', "", [{ text: 'OK' }]); //Hinweis an den Nutzer ausgeben
                        props.navigation.navigate('Authentication'); //Zum AuthenticationScreen gehen
                        return;
                    }

                //Erste Anfrage war generell nicht OK, z. B. kein Internet etc.
                } else if (!response.ok) {
                    throw new Error('Error. Please try again later.');
                }

                //Nutzer rausholen
                resData = await response.json();

                //handler registrieren, damit der token immer erneuert wird
                firebase.auth().onIdTokenChanged(function async(user) {
                    if (user) {
                        // User is signed in or token was refreshed.
                        user.getIdToken().then(token => { //Neuen token holen und im Storage abspeichern
                             AsyncStorage.setItem('newToken', token).then(() => {});
                        });
                    }
                });

                //Userdaten setzen
                dispatch(authActions.setUserData(userId, resData.imageURL, resData.userEmail));
                //Falls token abgelaufen war, neues token weitergeben, sonst altes
                dispatch(authActions.authenticate(tokenIsExpired ? newUserToken : token)); //token daten setzen
                props.navigation.navigate('StartApp'); //zum Startscreen navigieren
            } catch (err) {
                throw err;
            }
        };

        //Funktion aufrufen
        tryLogin();
    }, [dispatch]); //Abhängigkeit


    //Spinner anzeigen
    return (
        <View style={styles.screen}>
            <ActivityIndicator size="large" color={Colors.spinner} />
        </View>
    );
};

//styling
const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default StartupScreen;