import React, { useState } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import CommentItem from './CommentItem';
import Input from '../Input';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import HeaderButton from '../HeaderButton';

//Kommentar Funktion innerhalb eines Posts
const CommentBox = props => {

    const [inputComment, setInputComment] = useState(); //Kommentar


    //Gibt den eingegebenen Kommentar weiter und loescht das Eingabefeld
    const commentHandler = () => {
        //Kommentar an den onClickedCommentHandler weitergeben
        props.onClickedCommentHandler(inputComment);
        setInputComment(""); //clear input
    };



    return (
        <View>
            <TouchableOpacity activeOpacity={0.5} onPress={props.onRefreshHandler} >
                <View style={{ margin: 10 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Comments:</Text>
                </View>
            </TouchableOpacity>

            <View style={{ maxHeight: 290 }}>
                <ScrollView
                    scrollEnabled={props.data.length > 3}
                    nestedScrollEnabled={true}
                >
                    <View>
                        <FlatList
                            data={props.data} //comments 
                            keyExtractor={item => item.id}
                            renderItem={itemData => //comments als CommentItem rendern
                                <CommentItem //daten weitergeben
                                    content={itemData.item.content}
                                    userEmail={itemData.item.userEmail}
                                    imageURL={itemData.item.imageURL}
                                    date={itemData.item.date}
                                    disabled={itemData.item.userEmail !== props.loggedInUserEmail} //Wenn der eingeloggte User den Kommentar verfasst hat, kann er ihn auch loeschen
                                    onSelectedComment={() => {
                                        //Id des angeklickten Elementes weiterreichen
                                        props.onSelectedComment(itemData.item.id)
                                    }}
                                />
                            }
                        />
                    </View>
                </ScrollView>
            </View>


            <View style={{ margin: 10, }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                    <Input //Eingabefeld
                        padding={5}
                        placeholder='leave a comment...'
                        placeholderTextColor='grey'
                        //multiline={true}
                        //numberOfLines={4}
                        onChangeText={(text) => setInputComment(text)}
                        value={inputComment}
                        style={{ borderWidth: 1, width: '88%', backgroundColor: 'rgba(200,200,200,0.3)', borderRadius: 10 }}
                    />
                    <View style={{ width: '12%', }}>
                        <HeaderButtons HeaderButtonComponent={HeaderButton} >
                            <Item //Absende Button
                                title="send"
                                iconName='md-send'
                                onPress={commentHandler}
                            />
                        </HeaderButtons>
                    </View>
                </View>
            </View>
        </View>
    );


};

export default CommentBox;
