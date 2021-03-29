import React from 'react';
import { Text, View, FlatList, ImageBackground } from 'react-native';
import { useSelector } from 'react-redux';//Zugriff auf den Redux Store
import PostItem from '../../components/PostItem';

//FavoritenScreen zeigt alle Posts die man als User "geliked" hat
const FavScreen = props => {

    //Posts aus dem Redux Store State holen
    const posts = useSelector(state => state.posts.availablePosts);
    //Zugriff auf die UserId durch den store
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

    //Falls man keine Posts Favorisiert hat, wird ein Text zurückgegeben
    if (favPosts.length === 0) {
        return (
            <ImageBackground source={require('../../assets/images/background.jpg')} style={{ width: '100%', height: '100%' }}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontWeight: 'bold' }}>No favorites found!</Text>
                    </View>
            </ImageBackground >
        );
    }


    //Favorisierte Posts darstellen
    return (
        <View >
            <ImageBackground source={require('../../assets/images/background.jpg')} style={{ width: '100%', height: '100%' }}>
                <View style={{ height: '100%', backgroundColor: 'rgba(255,255,255,0.5)' }}>
                    <FlatList
                        data={favPosts} //Array übergeben, das gerendert werden soll
                        keyExtractor={item => item.id} //braucht evtl. unique key, fürs interne Management von React
                        renderItem={itemData =>
                            <PostItem //Einzelne Objekte uebergeben und als PostItem-Komponente rendern
                                image={itemData.item.imageUrl}
                                title={itemData.item.title}
                                postcode={itemData.item.postcode}
                                town={itemData.item.town}
                                date={itemData.item.date}
                                onSelectedPost={() => { //Falls ein Post ausgewaehlt wird, wird zur Seite navigiert
                                    props.navigation.navigate('PostDetail', { //parameter übergeben
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
                </View>
            </ImageBackground>
        </View>
    );
};

//Headertitel setzen
FavScreen.navigationOptions = {
    headerTitle: 'Favorites',
};

export default FavScreen; 