export const AUTHENTICATE = 'AUTHENTICATE';
export const LOGOUT = 'LOGOUT';
export const SET_USERDATA = 'SET_USERDATA';
export const UPDATE_USERDATA = 'UPDATE_USERDATA';
import { AsyncStorage } from 'react-native';
import User from '../../models/user';
import * as firebase from 'firebase';
import { firebaseConfig } from '../../constants/FirebaseConfig';

//authentifizieren
export const authenticate = token => {
    return dispatch => {
        dispatch({ type: AUTHENTICATE, token });  //Authenticate Action dispatchen
    };
};

//User mit seinem email und passwort einloggen
export const login = (email, password) => {
    return async dispatch => {

        //Bei firebase einloggen mit der email + passwort
        const loginResp = await firebase.auth().signInWithEmailAndPassword(email, password);
        //Zugriffs token holen
        let accessToken = await loginResp.user.getIdToken();

        //Listner registrieren, der bei einem neuen token den austausch vornimmt
        firebase.auth().onIdTokenChanged(function async(user) {
            if (user) {
                // User is signed in or token was refreshed.
                user.getIdToken().then(token => {
                    AsyncStorage.setItem('newToken', token).then(() => { }); //im Storage sichern
                    dispatch(authenticate(token)); //lokal im State aktualisieren
                });
            }
        });

        //user aus DB holen
        const fetchedUserResp = await fetch(`${firebaseConfig.databaseURL}/users.json?auth=${accessToken}`);

        //pruefen
        if (!fetchedUserResp.ok) {
            throw new Error('Error');
        }
        //Daten rausholen
        const fetchedUserResData = await fetchedUserResp.json();

        //Daten aufbereiten
        let users = [];
        for (const key in fetchedUserResData) {
            users.push(new User(key, fetchedUserResData[key].userEmail, fetchedUserResData[key].imageURL));
        }
        const user = users.find(user => user.userEmail === email); //Email ist eindeutig, wird von firebase gemanaged und vom Email-Provider

        //dispatch SET_USERDATA
        dispatch({
            type: SET_USERDATA,
            userId: user.id, //Id vom angeleten User
            token: accessToken, //token
            imageURL: user.imageURL,
            userEmail: user.userEmail,
        });

        //Id, token und email fuer ein Re-login speichern
        saveDataToStorage(user.id, accessToken, email);
    };
};

//Sign up mit Email und Passwort
export const signup = (email, password) => {
    return async dispatch => {

        //User mit Email und Passwort anmelden
        const signUpResp = await firebase.auth().createUserWithEmailAndPassword(email, password);
        //Zugriffs token holen
        let accessToken = await signUpResp.user.getIdToken();

        //Listner registrieren, der bei einem neuen token den austausch vornimmt
        firebase.auth().onIdTokenChanged(function async(user) {
            if (user) {
                // User is signed in or token was refreshed.
                user.getIdToken().then(token => {
                    AsyncStorage.setItem('newToken', token).then(() => { }); //im Storage sichern
                    dispatch(authenticate(token)); //lokal im State aktualisieren
                });
            }
        });

        //--------------------------------
        //User in eigener DB-Struktur erzeugen
        const createUserResp = await fetch(`${firebaseConfig.databaseURL}/users.json?auth=${accessToken}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            //JSON-object als anhang senden
            body: JSON.stringify({
                userEmail: email,
                //imageURL //Noch nicht vorhanden, da der User erst angelegt wird
            })
        });
        //pruefen
        if (!createUserResp.ok) {
            throw new Error('Error');
        }
        //Daten holen
        const createUserResData = await createUserResp.json();

        //dispatch SET_USERDATA
        dispatch({
            type: SET_USERDATA,
            userId: createUserResData.name,//Id vom angeleten User
            token: accessToken, //token
            imageURL: null, //Noch nicht vorhanden, da der User erst angelegt wird
            userEmail: email,
        });

        //Id, token und email fuer ein Re-login speichern
        saveDataToStorage(createUserResData.name, accessToken, email);
    };
};

//User Daten aktualisieren
export const updateUserData = (imageURL) => {
    return async (dispatch, getState) => {

        //UserId und token aus dem State holen
        const userId = getState().auth.userId;
        const token = getState().auth.token;

        //Daten aufbereiten
        const imgResp = await fetch(imageURL);
        const blob = await imgResp.blob();
        var ref = firebase.storage().ref().child(`profile/${userId}/image.png`); //Ausgewaehltes Profilbild wird immer ueberschrieben
        await ref.put(blob);
        imageURL = await ref.getDownloadURL(); //Adresse holen


        //PATCH, aktualisierte Daten senden
        const response = await fetch(`${firebaseConfig.databaseURL}/users/${userId}.json?auth=${token}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                imageURL
            })
        });
        //pruefen
        if (!response.ok) {
            const errorResData = await response.json();
            throw new Error("ERROR: " + errorResData.error.message);
        }

        //const resData = await response.json();

        //dispatch UPDATE_USERDATA
        dispatch({
            type: UPDATE_USERDATA,
            imageURL
        });
    };
};

//User ausloggen, dabei login-Daten aus dem Store loeschen
export const logout = () => {
    AsyncStorage.removeItem('userData'); //Daten loeschen
    AsyncStorage.removeItem('newToken');
    firebase.auth().signOut(); //ausloggen
    return { type: LOGOUT };
};


//User Daten setzen
export const setUserData = (userId, imageURL, userEmail) => {
    return dispatch => {
        dispatch({ type: SET_USERDATA, userId, imageURL, userEmail });
    };
};




const saveDataToStorage = (userId, token, email) => {
    AsyncStorage.setItem(
        'userData',
        JSON.stringify({
            token: token,
            userId: userId,
            userEmail: email
        })
    );
};
