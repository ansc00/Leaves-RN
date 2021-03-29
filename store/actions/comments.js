export const CREATE_COMMENT = 'CREATE_COMMENT';
export const DELETE_COMMENT = 'DELETE_COMMENT';
export const SET_COMMENTS = 'SET_COMMENTS';
export const DELETE_ALL_COMMENTS = 'DELETE_ALL_COMMENTS';
export const CLEAR_COMMENTS = 'CLEAR_COMMENTS';
import Comment from '../../models/comment';
import User from '../../models/user';
import { firebaseConfig } from '../../constants/FirebaseConfig';
import { Alert } from 'react-native';

//Alle COMMENTS aus DB holen
export const fetchComments = (postId) => {
    return async (dispatch, getState) => {
        //token aus dem State holen
        const token = getState().auth.token;

        try {
            let comments = [];
            let loadedUsers = [];
            //GET-Req. Kommetare zu dem ausgewahlten Post holen
            let respComments = await fetch(`${firebaseConfig.databaseURL}/comments/${postId}.json?auth=${token}`);
            //pruefen
            if (!respComments.ok) {
                throw new Error('Error');
            }
            //Daten rausholen
            let resDataComments = await respComments.json();
            //User Daten holen fuer die Email Adresse + Profilbild
            let respUsers = await fetch(`${firebaseConfig.databaseURL}/users.json?auth=${token}`);
            //pruefen
            if (!respUsers.ok) {
                throw new Error('Error');
            }
            //Daten rausholen
            let resDataUsers = await respUsers.json();

            //Daten aufbereiten
            for (const key in resDataUsers) {
                let imageURL = 'null';
                let userEmail = 'unknown';
                imageURL = resDataUsers[key].imageURL !== undefined ? resDataUsers[key].imageURL : "null"
                userEmail = resDataUsers[key].userEmail !== undefined ? resDataUsers[key].userEmail : "unknown"
                loadedUsers.push(new User(
                    key,
                    userEmail,
                    imageURL));
            }

            for (const id in resDataComments) {
                let imageURL = 'null';
                let userEmail = 'unknown';
                for (const key in loadedUsers) {
                    if (resDataComments[id].ownerId === loadedUsers[key].id) {
                        imageURL = loadedUsers[key].imageURL;
                        userEmail = loadedUsers[key].userEmail;
                    }
                }
                comments.push(
                    new Comment(id,
                        resDataComments[id].content,
                        resDataComments[id].date,
                        imageURL,
                        userEmail,
                    )
                )
            }

            //Nach Zeitpunkt sortieren
            comments.sort((a, b) => a.date < b.date ? 1 : -1);
            //dispatch SET_COMMMENTS
            dispatch({ type: SET_COMMENTS, comments });
        } catch (err) {
            throw new Error('Error: ' + err);
        }
    };
};


//Einen neuen Kommentar erzeugen
export const createComment = (myComment, postId) => {

    const content = myComment.content; //Content
    const ownerId = myComment.ownerId; //Id des Post Erstellers
    const date = new Date(); //Aktueller Zeitpunkt

    return async (dispatch, getState) => {
        //Daten aus dem State holen
        const token = getState().auth.token;
        const userEmail = getState().auth.userEmail;
        const imageURL = getState().auth.imageURL;


        //Pruefen ob der Post noch vorhanden ist (quasi noch nicht geloescht wurde) 
        let response = await fetch(`${firebaseConfig.databaseURL}/posts/${postId}.json?auth=${token}`);
        //Antwort pruefen
        if (!response.ok) {
            throw new Error('Error');
        }

        const responseJson = await response.json();
        //pruefen
        if (responseJson === null){
            Alert.alert('Post not found.', '', [{ text: 'OK', onPress: () => { }, style: 'default' }]);
            return;
        }

        //Kommtar erstellen/ senden
        response = await fetch(`${firebaseConfig.databaseURL}/comments/${postId}.json?auth=${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content,
                date: date.toISOString(),
                ownerId,
            })
        });

        //Antwort pruefen
        if (!response.ok) {
            throw new Error('Error');
        }
        //Daten als JSON rausholen
        const resData = await response.json();

        //dispatch CREATE_COMMENT
        dispatch({
            type: CREATE_COMMENT,
            id: resData.name,
            content,
            date: date.toISOString(),
            userEmail,
            imageURL,
        });
    };
};


//Einen Kommentar loeschen
export const deleteComment = (postId, commentId) => {
    return async (dispatch, getState) => {
        //Token aus dem State holen
        const token = getState().auth.token;

        //Kommentar aus der DB loeschen
        const response = await fetch(`${firebaseConfig.databaseURL}/comments/${postId}/${commentId}.json?auth=${token}`, {
            method: 'DELETE',
        });
        //pruefen
        if (!response.ok) {
            throw new Error('Error');
        }
        //dispatch DELETE_COMMENT
        dispatch({ type: DELETE_COMMENT, id: commentId });
    };
};

//Alle Kommentare aus der DB loeschen
export const deleteAllComments = (postId) => {
    return async (dispatch, getState) => {
        //Token aus dem State holen
        const token = getState().auth.token;

        //Alle Kommentare aus der DB loeschen
        const response = await fetch(`${firebaseConfig.databaseURL}/comments/${postId}.json?auth=${token}`, {
            method: 'DELETE',
        });
        //pruefen
        if (!response.ok) {
            throw new Error('Error');
        }
        //dispatch DELETE_ALL_COMMENTS
        dispatch({ type: DELETE_ALL_COMMENTS });
    };
};

//Kommentare nur aus dem lokalen State loeschen (nicht aus der DB!)
export const clearComments = () => {
    return async (dispatch) => {
        await dispatch({ type: CLEAR_COMMENTS });
    }
};