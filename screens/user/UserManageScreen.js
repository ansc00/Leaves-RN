import React, { useState, useCallback } from 'react';
import { Text, View, Alert, SafeAreaView, StyleSheet, FlatList, ImageBackground, Platform } from 'react-native';
import UserPostItem from '../../components/UsersPostItem';
import { useSelector, useDispatch } from 'react-redux';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import HeaderButton from '../../components/HeaderButton';
import { deletePost } from '../../store/actions/posts';
import { ScrollView } from 'react-native-gesture-handler';

//Verwaltung der eigenen User posts
const UserManageScreen = props => {

    const dispatch = useDispatch(); //Zugriff auf Redux dispatch fkt
    const posts = useSelector(state => state.posts.userPosts); //posts
    const userEmail = useSelector(state => state.auth.userEmail); //Email vom eingeloggten User
    const [isLoading, setIsLoading] = useState(false); //fuer Spinner 


    //Loeschen eines eigenene User postings
    const deletePostHandler = useCallback(async (id) => {
        //Abfrage ob das Element wirklich geloescht werden soll
        Alert.alert("Delete item?", "Do you really want to delete this item?", [
            {
                text: "no",
                onPress: () => { },
                style: "default"
            },
            {
                text: "delete",
                onPress: async () => {
                    setIsLoading(true);
                    try {
                        //dispatch deletePost
                        await dispatch(deletePost(id));
                        setIsLoading(false);
                    } catch (err) {
                        setIsLoading(false);
                    }
                }
            }
        ]
        );
    }, [dispatch, posts]);




    //Anzeigen, wenn es keine Daten gibt und der Ladevorgang abgeschlossen ist. 
    if (!isLoading && posts.length === 0) {
        return (
            <View style={{ flex: 1 }}>
                <ImageBackground source={require('../../assets/images/background.jpg')} style={{ width: '100%', height: '100%' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', padding: 5 }}><Text style={styles.welcomeText}>{"Welcome: " + userEmail}</Text></View>
                    <View style={styles.centered}>
                        <Text style={{ fontWeight: 'bold' }}>You havent't created a post yet</Text>
                    </View>
                </ImageBackground>
            </View>
        );
    }

    //Eingeloggten User mit seinen eigenen Posts anzeigen
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ImageBackground source={require('../../assets/images/background.jpg')} style={{ width: '100%', height: '100%' }}>
                <View style={{ height: '100%', backgroundColor: 'rgba(255,255,255,0.5)' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', padding: 5 }}>
                        <Text style={styles.welcomeText}>{"Welcome: " + userEmail}</Text>
                    </View>

                    <ScrollView>
                        <FlatList
                            data={posts} //Array uebergeben den man rendern moechte
                            keyExtractor={item => item.id} //braucht evtl. unique key, fuers interne Management von React
                            renderItem={itemData =>

                                <UserPostItem //Ein einzelner UserPost
                                    image={itemData.item.imageUrl} //Parameter uebergeben
                                    title={itemData.item.title}
                                    date={itemData.item.date}
                                    postcode={itemData.item.postcode}
                                    town={itemData.item.town}
                                    onDeletePostHandler={() => {
                                        deletePostHandler(itemData.item.id);//Post loeschen
                                        props.navigation.navigate('UserManage'); //Wieder auf dieselbe Seite navigieren bzw. neu laden
                                    }}
                                    onEditPostHandler={() => {
                                        //Falls auf edit gedrueckt, geht es zum 'EditierScreen'
                                        props.navigation.navigate('EditUserPost', {
                                            postId: itemData.item.id,
                                            postTitle: itemData.item.title,
                                            postImage: itemData.item.imageUrl,
                                            postPostcode: itemData.item.postcode,
                                            postTown: itemData.item.town
                                        });
                                    }}
                                />
                            }
                        />
                    </ScrollView>
                </View>
            </ImageBackground>
        </SafeAreaView>
    );
};


//Header setzen
//Titel und Buttons setzen
//Links den 'Settings'-Button
//Rechts den 'Add'-Button
UserManageScreen.navigationOptions = (navData) => {
    return {
        headerTitle: 'My Posts',
        headerLeft: (
            <HeaderButtons HeaderButtonComponent={HeaderButton} >
                <Item //Settings-Button
                    title="Settings"
                    iconName={Platform.OS === 'android' ? 'md-settings' : 'ios-settings'}
                    onPress={() => {
                        navData.navigation.navigate('Settings') //Zu den Settings navigieren
                    }}
                />
            </HeaderButtons>
        ),
        headerRight: (
            <HeaderButtons HeaderButtonComponent={HeaderButton} >
                <Item //Add-Button
                    title="Add"
                    iconName="md-add"
                    onPress={() => {
                        navData.navigation.navigate('AddUserPost')
                    }}
                />
            </HeaderButtons>)
    };
};

//Styling
const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    welcomeText: {
        fontSize: 26,
        fontWeight: "bold",
        color: 'black',
        fontStyle: 'italic'
    }
});


export default UserManageScreen; 