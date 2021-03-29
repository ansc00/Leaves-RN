import React, { useEffect } from 'react';
import { createStore, combineReducers, applyMiddleware } from 'redux';//applyMiddleware: Creates a store enhancer that applies middleware to the dispatch method of the Redux store.
import { Provider } from 'react-redux'; //Makes the Redux store available to the connect() calls in the component hierarchy below
import ReduxThunk from 'redux-thunk'; //für asynchrone requests
import * as firebase from 'firebase';
import { firebaseConfig } from './constants/FirebaseConfig';
import NavigationContainer from './navigation/NavigationContainer';
import postsReducer from './store/reducers/posts';
import authReducer from './store/reducers/authenticate';
import commentsReducer from './store/reducers/comments';
import serverReducer from './store/reducers/server';

//turns an object whose values are different reducer functions, into a single reducer function
//rootReducer anlegen und mit den anderen "verbinden/erreichbar" machen
const rootReducer = combineReducers({
  posts: postsReducer,
  auth: authReducer,
  comments: commentsReducer,
  server: serverReducer
});

//Firebase Instanz konfigurieren und anlegen
firebase.initializeApp(firebaseConfig);

//Store erstellen
const store = createStore(rootReducer, applyMiddleware(ReduxThunk));

export default function App() {

  useEffect(() => {
    //This is a warning that certain javascript dependencies 
    //will raise on react-native due to an issue on their side and must be solved in react-native's codebase
    //problem in firebase
    console.disableYellowBox = true;
  }, []);

  //Provider: Makes the Redux store available to the connect() calls in the component hierarchy below.
  return (
    <Provider store={store}>
      <NavigationContainer />
    </Provider>
  );
}


