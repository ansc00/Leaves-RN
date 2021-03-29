import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';


//Repraesentiert einen Link (Wikipedia Verlinkungen)
const LinkItem = props => {

    //Ausgabe von Titel und Content
    //Falls kein Link vorhanden ist, wird er disabled
    return (
        <TouchableOpacity style={styles.item} onPress={props.onLinkClickedHandler} disabled={props.disabled}>
            <View >
                <Text style={styles.title}>
                    {props.title}
                </Text>
                <Text style={styles.content}>
                    {props.content}
                </Text>
            </View>
        </TouchableOpacity>
    );

};

//Styling
const styles = StyleSheet.create({
    item: {
        backgroundColor: 'lightblue',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'black',
        margin: 10,
        marginVertical: 5,
    },
    title: {
        fontSize: 14,
        marginBottom: 10,
        fontWeight: "bold",
        marginVertical: 5,
        marginLeft: 5
    },
    content: {
        fontSize: 12,
        padding: 5
    }
});

export default LinkItem;