export const UPDATE_POST = 'UPDATE_POST';
export const CREATE_POST = 'CREATE_POST';
export const DELETE_POST = 'DELETE_POST';
export const SET_POSTS = 'SET_POSTS';
export const TOGGLE_FAVORITE = 'TOGGLE_FAVORITE';
import Post from '../../models/post';
import * as firebase from 'firebase';
import { firebaseConfig } from '../../constants/FirebaseConfig';
import { Alert } from 'react-native';
import { deleteAllComments } from './comments';
import * as ImageManipulator from 'expo-image-manipulator';



//Alle Posts aus der DB holen
export const fetchPosts = () => {
    return async (dispatch, getState) => {
        //Token und UserId aus dem State holen
        const token = getState().auth.token;
        const userId = getState().auth.userId;

        try {
            //GET-Req. Posts aus DB holen
            const response = await fetch(`${firebaseConfig.databaseURL}/posts.json?auth=${token}`);
            //pruefen
            if (!response.ok) {
                throw new Error('Error');
            }
            //Daten rausholen
            const resData = await response.json();
            //Daten aufbereiten
            const loadedPosts = [];
            for (const key in resData) {
                loadedPosts.push(new Post(
                    key,
                    resData[key].ownerId,
                    resData[key].userEmail,
                    resData[key].title,
                    resData[key].imageURL,
                    resData[key].postcode,
                    resData[key].town,
                    resData[key].latitude,
                    resData[key].longitude,
                    resData[key].date,
                    resData[key].wikiSearchString,
                    resData[key].fav
                )
                );
            }
            //Sortieren nach Zeitpunkt
            loadedPosts.sort((a, b) => a.date < b.date ? 1 : -1);
            //dispatch SET_POSTS
            dispatch({ type: SET_POSTS, posts: loadedPosts, userPosts: loadedPosts.filter(post => post.ownerId === userId) });
        } catch (err) {
            throw new Error(err);
        }
    };
};

//Einen neuen Post erstellen
//Bekommt neben den Post-Daten, eine Referenz auf den Fortschritts-'handler' uebergeben
export const createPost = (myPost, progressChangeHandler) => {

    //Daten aufbereiten
    const title = myPost.postTitle;
    const postcode = myPost.postPostcode;
    const town = myPost.postTown;
    const latitude = myPost.latitude;
    const longitude = myPost.longitude;
    let imageURL = myPost.postImage;
    const date = new Date();

    //redux-thunk ruft fkt dann auf
    return async (dispatch, getState) => {

        //UserId, token, Email aus dem State holen
        const userId = getState().auth.userId;
        const token = getState().auth.token;
        let userEmail = getState().auth.userEmail;
        //Leaf Classification Server Adresse aus dem State holen
        const LeafClServerAddress = getState().server.address; 
        const LeafClServerAddressPort = getState().server.port; 
        const classificationServerAdress = LeafClServerAddress + ':' + LeafClServerAddressPort;
        console.log(classificationServerAdress);
        //Nur den vorderen Teil der Email abspeichern
        const userEmailArray = userEmail.split('@', [1]);
        userEmail = userEmailArray[0];
  
        
         
        const resolutionResp = await fetch(classificationServerAdress + '/dimension');
        console.log(resolutionResp);
        if (!resolutionResp.ok) { 
            throw new Error('Error');
        }
        const resolutionResData = await resolutionResp.json();
        console.log(resolutionResData);
      
         //Bild aufbereiten (groesse)
         const resizedImage = await ImageManipulator.manipulateAsync(imageURL,
            [{ resize: { width: resolutionResData.width, height: resolutionResData.height } }], //manipulate actions in array
            {
                format: ImageManipulator.SaveFormat.PNG,
                base64: true
            } //saveOptions as js-object
        );
       
        //base64String
        const base64String = resizedImage.base64;
   
      
                //ResizedImage zum Server schicken + antwort abwarten
                const clResponse = await fetch(classificationServerAdress + '/predict', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "resizedImage" : base64String
                    })
                });
                //pruefen
                if (!clResponse.ok) { 
                    throw new Error('Error');
                }
                //Daten rausholen
                const clResData = await clResponse.json();
                console.log(clResData);
        
       
     

        //Blatt klassifizierung setzen, fuer spaeteren Wikipedia aufruf
        let wikiSearchString;
        wikiSearchString = clResData.prediction;


        //Daten aufbereiten
        const imgResp = await fetch(imageURL); //Bild holen
        const blob = await imgResp.blob(); //Blob erstellen/rausholen aus der Antwort
        var ref = firebase.storage().ref().child("images/" + userId   + date.toISOString()).put(blob); //Bild unter images/ im fb Storage hochladen

        //Observer registrieren
        var progress = 0;
        //'state_changed' observer, called any time the state changes
        ref.on('state_changed', function (snapshot) {
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            //Fortschritt an Fortschrittsanzeige weitergeben
            progressChangeHandler(progress);

        }, function (error) {
            //Error observer, called on failure
            // Handle unsuccessful uploads
            Alert.alert("Error", "Upload failed, " + error, [
                {
                    text: "OK",
                    onPress: () => { },
                    style: "default"
                }]
            );
        }, function () {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            ref.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                imageURL = downloadURL; //download URL


                //Neuen Post in der DB erstellen
                fetch(`${firebaseConfig.databaseURL}/posts.json?auth=${token}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title,
                        ownerId: userId,
                        userEmail,
                        postcode,
                        town,
                        latitude,
                        longitude,
                        imageURL,
                        date: date.toISOString(),
                        wikiSearchString,
                        fav: [] //Beim Erzeugen ist fav ein leeres Array
                    })
                }).then(response => {
                    response.json().then(resData => {
                        //dispatch CREATE_POST
                        dispatch({
                            type: CREATE_POST,
                            postData: {
                                id: resData.name, //Unter resData.name befindet sich die eindeutige Id, die von Firebase zurueckgegeben wird
                                title,
                                ownerId: userId,
                                userEmail,
                                postcode,
                                town,
                                latitude,
                                longitude,
                                imageURL,
                                date: date.toISOString(),
                                wikiSearchString,
                                fav: []
                            }
                        });
                    })
                });
            });
        });
    };
};

//Einen bestehenden Post aktualisieren
export const updatePost = (myPost) => {
    //Id und titel notwendig
    const id = myPost.postId;
    const title = myPost.postTitle;

    return async (dispatch, getState) => {
        //Token aus dem State holen
        const token = getState().auth.token;
        //Post unter der Id aktualisieren
        const response = await fetch(`${firebaseConfig.databaseURL}/posts/${id}.json?auth=${token}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title //geaenderter titel
            })
        });
        //pruefen
        if (!response.ok) {
            Alert.alert('Error', 'try again later', [{ text: 'OK', onPress: () => { }, style: 'default' }]);
            return;
        }

        //dispatch UPDATE_POST
        dispatch({
            type: UPDATE_POST,
            postId: id,
            postData: {
                title,
            }
        });
    };
};

//Einen Post aus der DB loeschen
export const deletePost = (id) => {
    return async (dispatch, getState) => {
        //UserId und token holen
        const userId = getState().auth.userId;
        const token = getState().auth.token;
        //Datensatz aus db holen um den Imageidentifier zu bekommen
        let imgResp = await fetch(`${firebaseConfig.databaseURL}/posts/${id}.json?auth=${token}`);
        //Pruefen
        if (!imgResp.ok) {
            Alert.alert('Error', 'try again later', [{ text: 'OK', onPress: () => { }, style: 'default' }]);
            return;
        }
        //Daten rausholen als JSON
        const resData = await imgResp.json();
        //ImageIdentifier bestehend aus userId und Datum
        const imageIdentifier = userId + resData.date;
        //Zugriff auf firebase Storage um das Bild zu loeschen
        var ref = firebase.storage().ref().child("images/" + imageIdentifier);
        await ref.delete(); //Bild loeschen
        //Post aus der DB loeschen
        const response = await fetch(`${firebaseConfig.databaseURL}/posts/${id}.json?auth=${token}`, {
            method: 'DELETE',
        });
        //Pruefen
        if (!response.ok) {
            throw new Error('Error');
        }

        //dispatch deleteAllComments
        //Alle Kommentare zu dem Post muessen ebenfalls rausgeloescht werden
        dispatch(deleteAllComments(id));
        //dispatch DELETE_POST
        dispatch({ type: DELETE_POST, postId: id });
    };
};

//Post zu den Favoriten mitaufnehmen oder rausnehmen
export const toggleFavorite = (postId, userId, addToFav) => {

    return async (dispatch, getState) => {
        //Token holen
        const token = getState().auth.token;
        //Post anhand der PostId aus der DB holen
        const fetchedPost = await fetch(`${firebaseConfig.databaseURL}/posts/${postId}.json?auth=${token}`);

        //pruefen
        if (!fetchedPost.ok) {
            Alert.alert('Post not found.', '', [{ text: 'OK', onPress: () => { }, style: 'default' }]);
            return;
        }
        //Daten als JSON rausholen
        const fetchedPostJson = await fetchedPost.json();
        //Falls null nicht weitermachen
        if (fetchedPostJson === null){
            return;
        }
        //Favs falls vorhanden kopieren
        let newFavs = [];
        if (fetchedPostJson.fav && fetchedPostJson.fav.length > 0) {
            newFavs = [...fetchedPostJson.fav];
        }

        //Falls der User den Post Favorisiert hat > hinzufuegen
        if (addToFav) {
            newFavs.push(userId);
        } else {//Ansonsten, raussuchen und entfernen
            newFavs = newFavs.filter(id => id !== userId); //User rausloeschen
        }

        //Favoriten des Posts aktualisieren
        const response = await fetch(`${firebaseConfig.databaseURL}/posts/${postId}.json?auth=${token}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fav: newFavs
            })
        });
        //pruefen
        if (!response.ok) {
            throw new Error('Error');
        }
        //dispatch TOGGLE_FAVORITE
        dispatch({
            type: TOGGLE_FAVORITE,
            postId: postId,
            userId: userId,
            postData: {
                fav: newFavs
            }
        });
    };
};


