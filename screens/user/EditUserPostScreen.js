import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, Platform, StyleSheet, Image, ScrollView, KeyboardAvoidingView } from 'react-native';
import { HeaderButtons, Item, } from 'react-navigation-header-buttons';
import HeaderButton from '../../components/HeaderButton';
import Input from '../../components/Input';
import { useDispatch } from 'react-redux';
import { updatePost } from '../../store/actions/posts';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../constants/Colors';


//Bearbeitungsscreen eines ausgewaehlten User Posts
//Titel kann geandert werden
const EditUserPostScreen = props => {

    const { navigation } = props; //navigation aus props rausholen

    const [title, setTitle] = useState(props.navigation.getParam('postTitle')); //titel
    const [inputErrorMsg, setInputErrorMsg] = useState(''); //Error Message fuer die Titeleingabe


    //Zugriff auf Redux dispatch fkt
    const dispatch = useDispatch();

    //Title pruefen und setzen
    //Title muss mind. 3 Zeichen haben
    const titleInputHandler = inputText => {
        setTitle(inputText);
        if (inputText.length < 3) {
            setInputErrorMsg('min 3 characters needed');
        } else {
            setInputErrorMsg('')
        }
    };

    //Editierten Post abspeichern
    const saveEditedPost = useCallback(async () => {
        //Falls eine Error Message angezeigt wird, geht es nicht weiter
        if (inputErrorMsg !== '') {
            return;
        }

        //Daten aufbereiten
        const editedPost = {
            postId: props.navigation.getParam('postId'),
            postTitle: title,
        };

        //dispatch updatePost
        await dispatch(updatePost(editedPost));
         
        navigation.navigate('UserManage');
    }, [dispatch, title, inputErrorMsg]);


    //Refrenz auf saveEditPost uebergeben
    useEffect(() => {
        navigation.setParams({ save: saveEditedPost });
    }, [saveEditedPost]);

    //Bild und Titel Eingabefeld anzeigen
    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior="padding"
            keyboardVerticalOffset={120}>
            <LinearGradient
                style={{ width: '100%', height: '100%' }}
                colors={['white', 'white', 'white', Colors.linearGradient]}
            >
                <View >
                    <ScrollView>

                        <Image source={{ uri: props.navigation.getParam('postImage') }} style={styles.image} />

                        <Text style={{ marginTop: 10, marginHorizontal: 20, fontWeight: 'bold' }}>Title: </Text>
                        <Input style={styles.input}
                            blurOnSubmit
                            autoCapatilize='none'
                            autoCorrect={false}
                            maxLength={20}
                            onChangeText={titleInputHandler}
                            value={title}
                        />
                        {inputErrorMsg === '' ? null : <Text style={{ color: 'red', marginHorizontal: 20 }}>{inputErrorMsg}</Text>}

                    </ScrollView>
                </View>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
};

//Header setzen
EditUserPostScreen.navigationOptions = (navData) => {
    return {
        headerTitle: 'Edit',
        headerRight: <HeaderButtons HeaderButtonComponent={HeaderButton} >
            <Item //Save-Button
                title="save"
                iconName={Platform.OS === 'android' ? 'md-save' : 'ios-save'}
                onPress={navData.navigation.getParam('save')} //Referenz auf Fkt
            />
        </HeaderButtons>
    };
};

//Styling
const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    image: {
        height: 300,
        width: '100%',
    },
    input: {
        fontSize: 20,
        marginVertical: 10,
        marginHorizontal: 20
    },
    descriptionContainer: {
        marginTop: 10,
        height: 200,
        padding: 5,

        //ios
        shadowColor: 'black',
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,

        //android
        elevation: 5,

        //allg
        borderRadius: 5,
        borderWidth: 0.6,
        backgroundColor: 'white',
    },
    descriptionInput: {
        fontSize: 20,
        marginVertical: 10,
        minHeight: 10,
        height: 'auto'
    },
});

export default EditUserPostScreen; 