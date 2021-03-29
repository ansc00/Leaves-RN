import { AUTHENTICATE, LOGOUT, UPDATE_USERDATA, SET_USERDATA } from "../actions/authenticate";

//Initialer Zustand
const initialState = {
    token: null,
    userId: null,
    userEmail: null,
    imageURL: null,
};

//Je nach Aktion wird der State entsprechend gesetzt
const authenticate = (state = initialState, action) => {

    switch (action.type) {
        //Authentifizierung
        case AUTHENTICATE:
            return {
                ...state, //Alten State kopieren
                token: action.token, //token updaten
            };
        //User Daten setzen
        case SET_USERDATA:
            return {
                ...state,
                token: action.token,
                userId: action.userId,
                userEmail: action.userEmail,
                imageURL: action.imageURL,
            };
        //Logout
        case LOGOUT:
            return initialState; //Alle State Daten loeschen
        //User Daten aktualisiern
        case UPDATE_USERDATA:
            return {
                ...state,
                imageURL: action.imageURL
            };
        default:
            return state;
    }
};

export default authenticate;