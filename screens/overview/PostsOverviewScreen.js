import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, Text, ActivityIndicator, View, StyleSheet, Platform, Button, ImageBackground } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import PostItem from '../../components/PostItem';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import HeaderButton from '../../components/HeaderButton';
import { fetchPosts } from '../../store/actions/posts';
import Colors from '../../constants/Colors';
import SearchBar from '../../components/SearchBar';

//PostOverviewScreen zeigt alle verfuegbaren Posts an
const PostsOverviewScreen = props => {

    const [isLoading, setIsLoading] = useState(true); //fuer den Spinner
    const [isRefreshing, setIsRefreshing] = useState(false); //fuer den Spinner bei einem Refresh
    const [error, setError] = useState();//fuer error handling

    const [filteredPosts, setFilteredPosts] = useState(); //gefilterte Posts nach einer Suche
    const [showSearchbar, setShowSearchbar] = useState(false); //Filteroptionen anzeigen/ausblenden

    const [headerTitle, setHeaderTitle] = useState('All Posts'); //Headertitel

    //Posts aus dem State holen
    const posts = useSelector(state => state.posts.availablePosts);
    //userId aus dem State holen
    const userId = useSelector(state => state.auth.userId);
    //Favoriten filtern
    const favPosts = posts.filter(post => {
        if (post.fav && post.fav !== undefined) {
            for (let i = 0; i < post.fav.length; i++) {
                if (post.fav[i] === userId) {
                    return post;
                }
            }
        }
    });

    //Zugriff auf Redux dispatch fkt
    const dispatch = useDispatch();

    //Postsdaten vom Server holen
    const loadPostsHandler = useCallback(async () => {
        setError(null); 
        setFilteredPosts(null);
        setHeaderTitle('All Posts');
        setIsRefreshing(true); //Refresh beginn

        try {
            await dispatch(fetchPosts());
        } catch (err) {
            setError(err.message); //Falls error auftritt, message setzen
        }
        setIsRefreshing(false); //Refresh ende
    }, [dispatch, setIsLoading, setError]);


    //Nachdem die Komponente fertig gerendert ist, Daten vom Server holen
    useEffect(() => {
        setIsLoading(true);//Spinner anzeigen  
        loadPostsHandler().then(() => {
            setIsLoading(false);
        });
    }, [dispatch, loadPostsHandler]);


    //Daten vom Server erneut holen, damit sie immer aktuell bleiben
    useEffect(() => {
        //Listner registrieren
        const willFocusSub = props.navigation.addListener('willFocus', loadPostsHandler);
        //Listner entfernen
        return () => {
            willFocusSub.remove();
        };
    }, [loadPostsHandler]);


    //HeaderTitle setzen
    const headerTitleHandler = (title) => {
        setHeaderTitle(title);
    };

    //gefilterte Posts setzen
    const filteredPostsHandler = (filtPosts) => {
        setFilteredPosts(filtPosts);
    };

    //Suchleiste anzeigen/ausblenden
    const searchBarToggleHandler = useCallback(() => {
        setShowSearchbar(prevState => !prevState);
    }, [setShowSearchbar]);


    //Headertitle und Funktionsreferenz uebergeben
    useEffect(() => {
        props.navigation.setParams({ 'headerTitle': headerTitle });
        props.navigation.setParams({ search: searchBarToggleHandler }); //Referenz uebergeben
    }, [searchBarToggleHandler, headerTitle]);


    //Falls ein Error auftritt, wird ein Button zum moeglichen nachladen angezeigt werden
    if (error) {
        return (
            <ImageBackground source={require('../../assets/images/background.jpg')} style={{ width: '100%', height: '100%' }}>
                <View style={styles.centered}>
                    <Text>Error</Text>
                    <View style={{ overflow: 'hidden', borderRadius: 20, marginTop: 5 }}>
                        <Button title="Reload" onPress={loadPostsHandler} color={Colors.secondary} />
                    </View>
                </View>
            </ImageBackground>
        );
    }

    //Falls die Daten gerade vom Server gefetched werden, wird ein Spinner angezeigt
    if (isLoading) {
        return (
            <ImageBackground source={require('../../assets/images/background.jpg')} style={{ width: '100%', height: '100%' }}>
                <View style={styles.centered}>
                    <ActivityIndicator size='large' color={Colors.spinner} />
                </View>
            </ImageBackground>
        );
    }

    //Falls es keine Daten gibt und der Ladevorgang abgeschlossen ist.
    if (!isLoading && posts.length === 0) {
        return (
            <ImageBackground source={require('../../assets/images/background.jpg')} style={{ width: '100%', height: '100%' }}>
                <View style={styles.centered}>
                    <Text style={{ fontWeight: 'bold' }}>Keine Posts gefunden!</Text>
                </View>
            </ImageBackground>
        );
    }

    //Falls es keine Posts zu der gewueschten Suchanfrage gibt
    if (filteredPosts && filteredPosts.length === 0) {
        return (
            <ImageBackground source={require('../../assets/images/background.jpg')} style={{ width: '100%', height: '100%' }}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    {showSearchbar ? <SearchBar
                        showSearchbar={showSearchbar}
                        posts={posts}
                        onFilteredPosts={filteredPostsHandler}
                        onLoadPosts={loadPostsHandler}
                        onHeaderTitle={headerTitleHandler}
                        onSearchBarToggle={searchBarToggleHandler} /> : null}
                    <Text style={{ fontWeight: 'bold' }}>Unfortunately nothing was found!</Text>
                    <View style={{ overflow: 'hidden', borderRadius: 20, marginTop: 5 }}>
                        <Button title="Reset" onPress={loadPostsHandler} color="red" />
                    </View>
                </View>
            </ImageBackground>
        );
    }



    //Alle verfuebaren Posts anzeigen
    return (
        <View>
            <ImageBackground source={require('../../assets/images/background.jpg')} style={{ width: '100%', height: '100%' }}>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>
                    {showSearchbar ? <SearchBar showSearchbar={showSearchbar} posts={posts} onFilteredPosts={filteredPostsHandler} onLoadPosts={loadPostsHandler} onHeaderTitle={headerTitleHandler} onSearchBarToggle={searchBarToggleHandler} /> : null}
                </View>
                <FlatList
                    onRefresh={loadPostsHandler} //Wenn man die Posts runterzieht > "Refreshen" 
                    refreshing={isRefreshing}
                    data={filteredPosts ? filteredPosts : posts} //Array uebergeben den man Rendern moechte
                    keyExtractor={item => item.id}
                    renderItem={itemData =>
                        <PostItem //Einzelne Objekte uebergeben und als PostItem-Komponente rendern
                            image={itemData.item.imageUrl}
                            title={itemData.item.title}
                            postcode={itemData.item.postcode}
                            town={itemData.item.town}
                            date={itemData.item.date}
                            onSelectedPost={() => { //Falls ein Post ausgewaehlt wird, wird zur Seite navigiert
                                props.navigation.navigate('PostDetail', { //parameter uebergeben
                                    postId: itemData.item.id,
                                    postTitle: itemData.item.title,
                                    postPostcode: itemData.item.postcode,
                                    postTown: itemData.item.town,
                                    postDate: itemData.item.date,
                                    isFav: favPosts.some(elem => (elem.id === itemData.item.id)), //pruefen ob es ein fav ist
                                });
                            }}
                        />
                    }
                />
            </ImageBackground>
        </View>
    );
};

//Screen navigation Optionen setzen
//Search-Button rechts in den Header setzen
PostsOverviewScreen.navigationOptions = (navData) => {

    //headerTitle rausholen 
    const headerTitle = navData.navigation.getParam('headerTitle');

    return {
        headerTitle: headerTitle ? headerTitle : 'All Posts', //Headertitle setzen
        headerRight: (<HeaderButtons HeaderButtonComponent={HeaderButton} >
            <Item //Such-Button setzen
                title="search"
                iconName={Platform.OS === 'android' ? 'md-search' : 'ios-search'}
                onPress={navData.navigation.getParam('search')}
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
    searchContainer: {
        width: '80%',
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginHorizontal: 5
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
        justifyContent: 'center',
    },
    input: {
        fontSize: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'grey',
        width: '80%'
    },
});

export default PostsOverviewScreen;