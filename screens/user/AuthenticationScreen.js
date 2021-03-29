import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, KeyboardAvoidingView, Text, TextInput, Platform, Button, ActivityIndicator, Alert, Image } from 'react-native';
import Colors from '../../constants/Colors';
import { useDispatch } from 'react-redux';
import * as authActions from '../../store/actions/authenticate';
import RoundedButton from '../../components/RoundedButton';
import { LinearGradient } from 'expo-linear-gradient';

//AuthenticationScreen um sich zu registiereren oder anzumelden
const AuthenticationScreen = props => {

    const [email, setEmail] = useState(''); //email
    const [password, setPassword] = useState(''); //password
    const [inputErrorEmailMsg, setInputErrorEmailMsg] = useState(''); //Error Msg fuer Email
    const [inputErrorPasswordMsg, setInputErrorPasswordMsg] = useState(''); //Error Msg fuer Password
    const [isSignUp, setIsSignUp] = useState(false); //SignUp/Anmeldung oder einloggen
    const [isLoading, setIsLoading] = useState(false);//Loading status
    const [error, setError] = useState(); //Error handling

    const dispatch = useDispatch();

    //Falls ein Error auftritt, erscheint eine entsprechende Meldung
    useEffect(() => {
        if (error) {
            Alert.alert('Error', error, [{ text: 'Ok' }]);
        }
    }, [error]);

    //AuthenticationHandler ruft signup oder login auf
    const authenticationHandler = async () => {
        //Falls eine ErrorMsg vorliegt, geht es nicht weiter
        if (inputErrorEmailMsg !== '' || inputErrorPasswordMsg !== '') {
            return;
        }

        setError(null); //Error auf null setzen, bevor wir ein request abschicken
        setIsLoading(true);//isLoading auf true setzen
        try {
            if (isSignUp) {
                await dispatch(authActions.signup(email, password)); //signUp
            } else {

                await dispatch(authActions.login(email, password)); //login
            }

   
            props.navigation.navigate('StartApp');
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }

    };



    //Je nach Platform und je nach Login oder SignUp wird der Button angepasst
    let loginOrSignUpButton;
    if (Platform.OS === 'android') { //fuer android
        loginOrSignUpButton =
            <RoundedButton
                style={{
                    backgroundColor: isSignUp ? 'orange' : Colors.secondary,
                    width: 100
                }}
                title={isSignUp ? "Sign Up" : "Login"}
                onPress={authenticationHandler} />
    } else {//fuer IOS
        loginOrSignUpButton =
            <Button
                title={isSignUp ? "Sign Up" : "Login"}
                color={isSignUp ? 'orange' : Colors.secondary}
                onPress={authenticationHandler} />
    }


    //Eingabe validieren und ggf. ErrorMsg setzen
    const inputHandler = (text, inputType) => {

        switch (inputType) {
            case 'email':
                setEmail(text); //Eingabe setzen
                if (text.length < 6) {
                    setInputErrorEmailMsg('email is to short (min. 6 characters)');
                    return;
                }
                const searchForAt = text.indexOf('@');
                if (searchForAt === -1) {
                    setInputErrorEmailMsg('missing @ sign');
                    return;
                }

                setInputErrorEmailMsg(''); //Falls korrekte eingabe, Error Msg leeren
                break;
            case 'password':
                setPassword(text); //Eingabe setzen
                if (text.length < 6) {
                    setInputErrorPasswordMsg('min. 6 characters needed');
                    return;
                }

                setInputErrorPasswordMsg('');  //Falls korrekte eingabe, Error Msg leeren
                break;
            default:
                break;
        }
    };



    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior="padding"
        //keyboardVerticalOffset={100}
        >
            <LinearGradient
                style={styles.linearGradient}
                colors={['white', 'white', 'white', Colors.linearGradient]}
            >

                <View style={styles.screen}>
                    <ScrollView >
                        <View style={styles.switchButtonContainer}>

                            {Platform.OS === 'android' ? //Android //Switch to Login/SignUp Button
                                (<RoundedButton
                                    style={{
                                        flexDirection: 'row-reverse',
                                        backgroundColor: "orange",
                                        width: 150
                                    }}
                                    title={`Switch to  ${isSignUp ? 'Login' : 'Sign Up'}`}
                                    onPress={() => {
                                        setIsSignUp(prevState => !prevState);
                                    }} />) :
                                //IOS
                                (<Button
                                    title={`Switch to  ${isSignUp ? 'Login' : 'Sign Up'}`}
                                    color="orange"
                                    onPress={() => {
                                        setIsSignUp(prevState => !prevState);
                                    }}
                                />

                                )}
                        </View>

                        <View style={styles.imageContainer}>
                            <Image source={require('../../assets/images/ahorn2.png')} style={styles.image} />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={{ fontWeight: 'bold' }}>Email:</Text>
                            <TextInput
                                title="email"
                                label="E-mail"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                onChangeText={(text) => inputHandler(text, 'email')}
                                value={email}
                                style={{ borderBottomWidth: 1, borderBottomColor: 'grey', marginTop: 7 }}
                            //returnKeyType="next" //Nur die Darstellung
                            />
                            {inputErrorEmailMsg === '' ? null : <Text style={{ color: "red" }}>{inputErrorEmailMsg}</Text>}

                            <View style={{ marginTop: 20 }}>
                                <Text style={{ fontWeight: 'bold' }}>Password:</Text>
                                <TextInput
                                    title="password"
                                    label="Password"
                                    keyboardType="default"
                                    secureTextEntry //****/
                                    minLength={6} //muss mind. 6 zeichen lang sein
                                    autoCapitalize="none"
                                    onChangeText={(text) => inputHandler(text, 'password')}
                                    value={password}
                                    style={{ borderBottomWidth: 1, borderBottomColor: 'grey', marginTop: 7 }}
                                // returnKeyType="send"
                                />
                            </View>
                            {inputErrorPasswordMsg === '' ? null : <Text style={{ color: "red" }}>{inputErrorPasswordMsg}</Text>}
                        </View>

                        <View style={styles.loginButtonContainer}>

                            {isLoading ? (
                                <View style={styles.spinner}>
                                    <ActivityIndicator size="small" color={Colors.spinner} />
                                </View>) : (
                                    <View style={styles.loginButton}>
                                        {loginOrSignUpButton}
                                    </View>)
                            }
                        </View>

                    </ScrollView>
                </View>

            </LinearGradient>
        </KeyboardAvoidingView>
    );
};

//NavigationOptions Konfigurieren
AuthenticationScreen.navigationOptions = {
    headerTitle: "Authenticate"
};

//styling
const styles = StyleSheet.create({
    screen: { flex: 1, },
    linearGradient: { width: '100%', height: '100%' },
    switchButtonContainer: { flexDirection: 'row-reverse', margin: 5, borderRadius: 15, overflow: 'hidden' },
    imageContainer: { width: '100%', height: '30%', alignItems: 'center' },
    image: { width: 150, height: 150 },
    inputContainer: { marginVertical: 10, paddingHorizontal: 40 },
    loginButtonContainer: { marginTop: 10, alignItems: 'center' },
    spinner: { height: 200, width: 100, borderRadius: 10 },
    loginButton: { height: 200, width: 100, alignItems: 'center', borderRadius: 15 }

});

export default AuthenticationScreen;