import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import MyNavigator from './MyNavigator';
import { NavigationActions } from 'react-navigation'; //erlaubt zu navigieren


//Diese komponente ist damit wir zugriff auf REDUX haben (in MyNavigator ist das nicht moeglich, da die komponente schon so fertig ausgeliefert wird!)

const NavigationContainer = props => {
    const isAuth = useSelector(state => !!state.auth.token);

    //ref erstellen
    const navRef = useRef();

    useEffect(() => {
        if (!isAuth) { //Falls isAuth FALSE ist, navigieren wir auf den Authenticationscreen
            navRef.current.dispatch(
                NavigationActions.navigate({ routeName: 'Authentication' })
                );
        };
    }, [isAuth]); 

    //Zugriff auf dispatch und Navigation.navigate herstellen
    return <MyNavigator ref={navRef} />;
};

export default NavigationContainer; 