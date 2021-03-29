import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import moment from 'moment'; //Fuer Datumsformatierung


//Repraesentiert den einzelnen Kommentar
const CommentItem = props => {

    return (
        <View style={styles.item}>
            <View style={{ flexDirection: 'row' }}>
                <View style={styles.imageContainer}>
                    <Image //Profilbild des Users
                        source={props.imageURL !== "null" ? { uri: props.imageURL } : require('../../assets/images/profileImage.png')}
                        style={styles.image}
                        resizeMode="cover"
                    />
                </View>
                <TouchableOpacity //Kommentar
                    onLongPress={props.onSelectedComment}
                    activeOpacity={0.2}
                    disabled={props.disabled} 
                    style={{ width: '80%' }}>
                    <View style={{ backgroundColor: 'rgba(200,200,200,0.3)', borderRadius: 15 }}>
                        <View style={{ backgroundColor: 'rgba(135,217,234,0.3)', borderBottomRightRadius: 15, borderTopLeftRadius: 15, padding: 5, width: '50%' }}>
                            <Text style={{ fontWeight: 'bold' }}>{props.userEmail}</Text>
                        </View>

                        <View style={{ padding: 5 }}>
                            <Text>{props.content}</Text>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={{ fontSize: 12 }}>{moment(props.date).format('DD-MM hh:mm:ss a')}</Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

//Styling
const styles = StyleSheet.create({
    item: {
        margin: 5
    },
    imageContainer: {
        width: 50,
        height: 50,
        borderRadius: 150,
        borderWidth: 1,
        borderColor: 'grey',
        overflow: 'hidden',
        margin: 5
    },
    image: {
        width: '100%',
        height: '100%',
    },

});

export default CommentItem;
