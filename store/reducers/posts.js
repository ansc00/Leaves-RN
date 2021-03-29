
import { CREATE_POST, UPDATE_POST, DELETE_POST, SET_POSTS, TOGGLE_FAVORITE } from '../actions/posts';
import Post from '../../models/post';

//Initialer Zustand
const initialState = {
    availablePosts: [], //Alle verfuegbaren Posts aus DB
    userPosts: [] //Nur die jeweiligen User Posts
};

//Je nach Aktion wird der State entsprechend gesetzt
const postsReducer = (state = initialState, action) => {

    switch (action.type) {
        //Posts setzen
        case SET_POSTS: {
            return {
                availablePosts: action.posts,
                userPosts: action.userPosts
            };
        }
        //Neuen Post hinzufuegen
        case CREATE_POST: {
            //Neuen Post erzeugen
            const newPost = new Post(
                action.postData.id,
                action.postData.ownerId,
                action.postData.userEmail,
                action.postData.title,
                action.postData.imageURL,
                action.postData.postcode,
                action.postData.town,
                action.postData.latitude,
                action.postData.longitude,
                action.postData.date,
                action.postData.wikiSearchString,
                action.postData.fav
            );
            //Post zu den alten hinzufuegen
            const newArray = state.availablePosts.concat(newPost);
            //Sortieren nach Zeitpunkt
            newArray.sort((a, b) => {
                if (a.date < b.date) {
                    return 1;
                } else {
                    return -1;
                }  //Sortieren damit neuster Post ganz oben erscheint
            });

            //neuen State setzen
            const newState = {
                ...state,
                availablePosts: newArray,
                userPosts: newArray.filter(post => post.ownerId === action.postData.ownerId)
            };
            return newState;
        }
        //Post aktualisieren
        case UPDATE_POST:

            //Index raussuchen
            const postIndex = state.userPosts.findIndex(post => post.id === action.postId);

            //Neuen Post mit aktualisierten Daten anlegen
            const updatedPost = new Post(
                action.postId,
                state.userPosts[postIndex].ownerId, //beibehalten
                state.userPosts[postIndex].userEmail, //beibehalten
                action.postData.title, //Neue Daten setzen
                state.userPosts[postIndex].imageUrl,//beibehalten
                state.userPosts[postIndex].postcode, //postcode
                state.userPosts[postIndex].town,
                state.userPosts[postIndex].latitude,
                state.userPosts[postIndex].longitude,
                state.userPosts[postIndex].date, //beibehalten
                state.userPosts[postIndex].wikiSearchString,
                state.userPosts[postIndex].fav,
            );
            //Alten User Post kopieren
            const updatedUserPosts = [...state.userPosts];
            updatedUserPosts[postIndex] = updatedPost; //Aktualisierten drauf setzen

            //Index aus den all Verfuegbaren Posts finden
            const availablePostIndex = state.availablePosts.findIndex(
                post => post.id === action.postId
            );

            //Den alten User Post aus den Insgesamt Verfuebaren Posts kopieren
            const updatedAvailablePosts = [...state.availablePosts];
            updatedAvailablePosts[availablePostIndex] = updatedPost; //Dort ebenfalls aktualisieren

            //State setzen
            const newState = {
                ...state,
                availablePosts: updatedAvailablePosts,
                userPosts: updatedUserPosts.filter(post => post.ownerId === state.userPosts[postIndex].ownerId)
            }
            return newState;
        //Post loeschen
        case DELETE_POST:
            //Post rausloeschen aus 'availablePosts'
            const availablePostsAfterDelete = state.availablePosts.filter(post => post.id !== action.postId);
            //Post rausloeschen aus 'userPosts'
            const newUserPosts = state.userPosts.filter(post => post.id !== action.postId)

            //Neuen State zurueck geben
            return {
                ...state,
                availablePosts: availablePostsAfterDelete,
                userPosts: newUserPosts
            };

        //Favoriten hinzufuegen/entfernen
        case TOGGLE_FAVORITE:
            //Index raussuchen
            const postIdx = state.availablePosts.findIndex(post => post.id === action.postId);

            //Neuen Post mit geaendertem Fav eintrag erstellen
            const updated_Post = new Post(
                action.postId,
                state.availablePosts[postIdx].ownerId, //beibehalten
                state.availablePosts[postIdx].userEmail, //beibehalten
                state.availablePosts[postIdx].title, 
                state.availablePosts[postIdx].imageUrl,
                state.availablePosts[postIdx].postcode,
                state.availablePosts[postIdx].town,
                state.availablePosts[postIdx].latitude,
                state.availablePosts[postIdx].longitude,
                state.availablePosts[postIdx].date,
                state.availablePosts[postIdx].wikiSearchString,
                action.postData.fav, //aendern
            );
            //Alten Posts kopieren
            const updated_availablePosts = [...state.availablePosts];
            updated_availablePosts[postIdx] = updated_Post; //Aktualisierten drauf setzen


            //Neuen State zurück geben
            return {
                ...state,
                availablePosts: updated_availablePosts,
                userPosts: updated_availablePosts.filter(post => post.ownerId === action.userId)
            };
        default:
            return state;
    }
};

export default postsReducer;