import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableWithoutFeedback, TouchableOpacity, ImageBackground, FlatList, RefreshControl, ActivityIndicator, Modal, Dimensions, KeyboardAvoidingView, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment'; //fuer Datumsanzeige
import LinkItem from '../../components/LinkItem';
import Colors from '../../constants/Colors';
import GestureRecognizer from 'react-native-swipe-gestures';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import HeaderButton from '../../components/HeaderButton';
import { toggleFavorite } from '../../store/actions/posts';
import CommentBox from '../../components/comment/CommentBox';
import { createComment, fetchComments, deleteComment, clearComments } from '../../store/actions/comments';

//Darstellung eines einzelnen Posts mit samt allen Details
//Datum, Location, Wikipedia-links, Kommentare
const PostDetailScreen = props => {

    //Zugriff auf Redux dispatch fkt
    const dispatch = useDispatch();
    //postId des ausgewaehlten posts
    const postId = props.navigation.getParam('postId');
    //Gesamte Daten ueber den Post holen
    const selectedPosts = useSelector(state =>
        state.posts.availablePosts.find(post => post.id === postId));
    //UserId des eingeloggten Users
    const userId = useSelector(state =>
        state.auth.userId);
    //Email des eingeloggten Users
    const userEmail = useSelector(state =>
        state.auth.userEmail);
    //Ob der Post als Fav markiert ist
    const [isFav, setIsFav] = useState(selectedPosts && selectedPosts.fav !== undefined && selectedPosts.fav && selectedPosts.fav.includes(userId) ? true : false);

    //Kommentare
    const comments = useSelector(state => state.comments.availableComments);

    const [wikiDetails, setWikiDetails] = useState(); //Wikipedia content
    const [isLoading, setIsLoading] = useState(false); //fuer Spinner
    const [isLoadingComments, setIsLoadingComments] = useState(false); //fuer Spinner
    const [disabledLink, setDisableLink] = useState(false); //Falls es kein Eintrag gibt, wird der Link disabled
    const [isModalVisible, setIsModalVisible] = useState(false); //fuer Fullscreen + zoom des Bildes


  
    useEffect(() => {
        setIsLoading(true); //fuer Spinner
        fetchWikiDetails(selectedPosts.wikiSearchString).then(() => {
            setIsLoading(false);
        });
        return cleanUp = () => {
            //Daten aus dem State wieder loeschen
            dispatch(clearComments());
        };
    }, [fetchWikiDetails]);


    //Daten von Wikipedia holen und setzen
    const fetchWikiDetails = useCallback(async (searchString) => {
        try {
            let myData = [];
            const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${searchString}`);

            if (!response.ok) {
                const res = await response.json();
                if (res.title === 'Not found.') {
                    myData.push({ title: res.title, link: res.uri }); //Link trotzdem notwendig, da er als Key fuer React intern (DOM) genutzt wird
                    setDisableLink(true); //link disablen
                    setWikiDetails(myData); //Daten setzen
                    return;
                }
                throw new Error('Error');
            }

            //Daten aus der Antwort holen
            const resData = await response.json();

            //Daten aufbereiten
            let contentData = resData.extract;
            if (resData.extract === (resData.title + ' may refer to:')) {
                contentData += ' ' + resData.content_urls.mobile.page
            }
            myData.push({
                link: resData.content_urls.mobile.page,
                content: contentData,
                title: resData.title
            })
            setWikiDetails(myData); //Daten setzen

        } catch (err) {
            console.log(err.message);
            throw err;
        }
    }, [setIsLoading]);




    //Favoriten handler zum "liken" und "unliken"
    const toggleFavHandler = useCallback(async() => {
        setIsFav(prevState => !prevState);
        const addToFav = !isFav;
        
        await dispatch(toggleFavorite(postId, userId, addToFav));

    }, [isFav, dispatch]);


    //Referenz zum Header herstellen
    useEffect(() => {
        props.navigation.setParams({ isFav: isFav });
        props.navigation.setParams({ toggleFav: toggleFavHandler });
    }, [toggleFavHandler, setIsFav]);


    //Nachladen der Kommentar-Daten
    const onRefreshHandler = useCallback(async () => {
        setIsLoadingComments(true);
        dispatch(fetchComments(postId)).then(() => {
            setIsLoadingComments(false);
        })
    }, [dispatch, fetchComments]);


    //Kommentare laden
    const fetchCommentsHandler = useCallback(async () => {
        setIsLoadingComments(true);
        try {
            //fetchComments dispatchen
            await dispatch(fetchComments(postId));
        } catch (err) {
            console.log(err.message);
        }
    }, [fetchComments, dispatch]);


    //Zu Beginn, Kommentare laden
    useEffect(() => {
        fetchCommentsHandler().then(() => {
            setIsLoadingComments(false);
        });
    }, [fetchCommentsHandler, setIsLoading]);



    //Handler um einen Kommtar hinzuzufuegen
    const addCommentHandler = async (inputTextComment) => {
        
        if (inputTextComment === "") {
            return;
        }

        //Ansonsten neuen Kommetar erstellen
        const newComment = {
            content: inputTextComment,
            ownerId: userId, //ownerId ist der User der den Kommentar postet
        };

        setIsLoadingComments(true);
        try {
            //createComment dispatchen
            await dispatch(createComment(newComment, postId));
            setIsLoadingComments(false);
        } catch (err) {
            setIsLoadingComments(false);
        }
    };



    //Kommentar loeschen handler
    const onDeleteCommentHandler = useCallback(async (commentId) => {

        //Abfrage
        Alert.alert("Delete item?", "Do you really want to delete this item?", [
            {
                text: "no",
                onPress: () => { },
                style: "default"
            },
            {
                text: "delete",
                onPress: async () => { //Falls ja, Kommentar loeschen

                    setIsLoadingComments(true);
                    try {
                        //dispatch deleteComment
                        await dispatch(deleteComment(postId, commentId));
                        setIsLoadingComments(false);
                    } catch (err) {

                        setIsLoadingComments(false);
                    }
                }
            }
        ]
        );
    }, [dispatch, comments]);


    //Falls wir Daten laden, den Spinner anzeigen
    if (isLoading) {
        return (
            <ImageBackground source={require('../../assets/images/background.jpg')} style={{ width: '100%', height: '100%' }}>
                <View style={{ height: '100%', backgroundColor: 'rgba(255,255,255,0.5)' }}>
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color={Colors.spinner} />
                    </View>
                </View>
            </ImageBackground>
        );
    }

    //Falls der Post nicht mehr existiert 
    if (!selectedPosts || selectedPosts === undefined) {
        return (
            <ImageBackground source={require('../../assets/images/background.jpg')} style={{ width: '100%', height: '100%' }}>
                <View style={{ height: '100%', backgroundColor: 'rgba(255,255,255,0.5)' }}>
                    <View style={styles.centered}>
                        <Text>No Post found!</Text>
                    </View>
                </View>
            </ImageBackground>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior="padding"
            keyboardVerticalOffset={80} //Bildschirm hochruecken, damit man sieht was man in das Feld eingibt
        >

            <ScrollView
                nestedScrollEnabled={true}
                refreshControl={ //Beim runterziehen, Kommentare neuladen
                    <RefreshControl refreshing={isLoadingComments} onRefresh={onRefreshHandler} />
                }
            >
                <View >
                    <GestureRecognizer //Gestenerkennung
                        onSwipeRight={() => {
                            setIsModalVisible(false);
                        }}
                        onSwipeUp={() => {
                            setIsModalVisible(false);
                        }}
                        onSwipeDown={() => {
                            setIsModalVisible(false);
                        }}
                        config={{ velocityThreshold: 0.6, directionalOffsetThreshold: 120 }}
                    >

                        <Modal //Pop-up Fenster mit Image als Fullscreen zum zoomen
                            animationType="slide"
                            transparent={false}
                            visible={isModalVisible}
                            style={{ width: '100%', height: '100%' }}
                            onRequestClose={() => {
                                //Android req.
                            }}
                        >
                            <View >

                                <ScrollView scrollEnabled={true} maximumZoomScale={5} minimumZoomScale={1} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
                                    <Image style={{ width: Math.round(Dimensions.get('window').width), height: Math.round(Dimensions.get('window').height), resizeMode: 'contain', backgroundColor: 'black' }} source={{ uri: selectedPosts.imageUrl }} />
                                </ScrollView>

                            </View>

                        </Modal>
                    </GestureRecognizer>
                </View>

                <TouchableWithoutFeedback onPress={() => { setIsModalVisible(true) }}>
                    <Image style={styles.image} source={{ uri: selectedPosts.imageUrl }} />
                </TouchableWithoutFeedback>

                <View style={styles.textContainer}>
                    <Text style={styles.dateAndUser}>Created: {moment(selectedPosts.date).format('DD-MM-YYYY hh:mm a') +
                        ' from User: ' + selectedPosts.userEmail}***</Text>
                    <Text style={styles.location}>{selectedPosts.postcode ? selectedPosts.postcode : ''} {selectedPosts.town ? ' ' + selectedPosts.town : ''}</Text>
                    {selectedPosts.latitude ? <TouchableOpacity activeOpacity={0.5} onPress={() => {
                        props.navigation.navigate('Location', { //Navigation zum LocationScreen
                            town: selectedPosts.town,
                            postcode: selectedPosts.postcode,
                            lat: selectedPosts.latitude,
                            lng: selectedPosts.longitude,
                            img: selectedPosts.imageUrl
                        })
                    }}>
                        <View style={{ marginTop: 5 }}>
                            <Text style={{ color: "red", fontWeight: 'bold' }}>
                                show location on map
                            </Text>
                        </View>
                    </TouchableOpacity> : null}
                </View>
                <Text style={styles.info}>{wikiDetails ? 'Wikipedia links: ' : ''} </Text>
                <FlatList
                    data={wikiDetails} //Array uebergeben der gerendert werden soll
                    keyExtractor={item => item.link}
                    renderItem={itemData =>
                        <LinkItem
                            disabled={disabledLink}
                            title={itemData.item.title}
                            content={itemData.item.content}
                            onLinkClickedHandler={() => { //Link der zur Wikipedia Seite weisst
                                props.navigation.navigate('WebView', { //Navigation zum WebViewScreen
                                    link: itemData.item.link //Link als Parameter uebergeben
                                });
                            }
                            }
                        />
                    }
                />

                <CommentBox //Kommentar Box
                    data={comments}
                    onClickedCommentHandler={addCommentHandler}
                    loggedInUserId={userId} //Eingeloggte UserId uebergeben
                    loggedInUserEmail={userEmail} //Eingeloggte Email uebergeben
                    onSelectedComment={(id) => {
                        //Falls ein Element ausgewahlt wird, id uebergeben
                        onDeleteCommentHandler(id);
                    }}
                    isLoadingComments={isLoadingComments}
                    onRefreshHandler={onRefreshHandler}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

//Header
//Rechten Fav-Button setzen
//Dynamisch als Fkt implementiert, erlaubt den Zugriff auf 'navigationData' um die Parameter auszulesen
PostDetailScreen.navigationOptions = navigationData => {

    //Referenz auf die Fav-Fkt
    const toggleFav = navigationData.navigation.getParam('toggleFav');
    const isFav = navigationData.navigation.getParam('isFav');

    return {
        headerTitle: navigationData.navigation.getParam('postTitle'), //Header setzen
        headerRight: (<HeaderButtons HeaderButtonComponent={HeaderButton} >
            <Item //Fav-Button
                title="Fav"
                iconName={isFav ? 'ios-heart' : 'ios-heart-empty'}
                onPress={toggleFav}
            />
        </HeaderButtons>)
    };
};

//Styling
let styles = StyleSheet.create({
    image: {
        width: '100%',
        height: 300
    },
    textContainer: {
        alignItems: 'center',
        margin: 5
    },
    dateAndUser: {
        fontSize: 14,
    },
    location: {
        fontSize: 14,
        textAlign: 'center',
    },
    info: {
        fontSize: 14,
        textAlign: "left",
        marginTop: 30,
        marginBottom: 10,
        fontWeight: "bold",
        marginHorizontal: 15
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
});

export default PostDetailScreen;