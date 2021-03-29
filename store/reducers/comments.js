import { CREATE_COMMENT, DELETE_COMMENT, SET_COMMENTS, DELETE_ALL_COMMENTS, CLEAR_COMMENTS } from "../actions/comments";
import Comment from '../../models/comment';

//Initialer Zustand
const initialState = {
    availableComments: [],
};

//Je nach Aktion wird der State entsprechend gesetzt
const commentsReducer = (state = initialState, action) => {

    switch (action.type) {
        //Kommentare setzen
        case SET_COMMENTS:
            return {
                availableComments: action.comments
            };
        //Neuen Kommentar hinzufuegen
        case CREATE_COMMENT:
            //Neuen Kommentar erzeugen
            const newComment = new Comment(
                action.id,
                action.content,
                action.date,
                action.imageURL, 
                action.userEmail
            );
            //Kommentar den alten Kommentaren hinzufuegen
            let newArray = state.availableComments.concat(newComment);
            //Nach Zeitpunkt sortieren
            newArray.sort((a, b) => a.date < b.date ? 1 : -1);
            //Neuen state zurueckgeben
            return {
                ...state, //obligatorisch, falls sich in Zukunft mehr aendert
                availableComments: newArray
            };
        //Kommentar loeschen
        case DELETE_COMMENT:
            return {
                ...state,
                availableComments: state.availableComments.filter(comment => comment.id !== action.id)
            };
        //Alle Kommentare loeschen (falls ein Post geloscht wird)
        case DELETE_ALL_COMMENTS:
            return initialState;
        //Loescht alle Kommentare aus dem State (temporaer fuer den einzelenen Post noetig)
        case CLEAR_COMMENTS:
            return initialState;
        default:
            return state;
    }
}

export default commentsReducer;