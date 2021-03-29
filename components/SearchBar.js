import React, { useState } from 'react';
import { Text, View, Platform, Button, Dimensions } from 'react-native';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import HeaderButton from './HeaderButton';
import Colors from '../constants/Colors';
import Input from './Input';
import Modal from "react-native-modal";
import GestureRecognizer from 'react-native-swipe-gestures';
import DatePicker from './DatePicker';


//Suchleiste
const SearchBar = props => {

    const [searchString, setSearchString] = useState(''); //Suchwort
    const [choosenDate, setChoosenDate] = useState(new Date()); //fuer Datumssuche
    const [selectedSearchButton, setSelectedSearchButton] = useState('title'); //'type'-(Button) der gewaehlt wurde

    //Handler fuer den augewaehlten Tag nachdem gefiltert werden soll
    const onChoosenDateHandler = (date) => {
        setChoosenDate(date);
    };

    //Suchwort setzen
    const inputHandler = inputText => {
        setSearchString(inputText);
    };


    //Kalkulierte Margin fuer die Buttons
    let calculatedMarginTopForDateSearchButton;
    if (Platform.OS === 'android') { //Android
        if (selectedSearchButton === 'date') {
            calculatedMarginTopForDateSearchButton = -25;
        } else {
            calculatedMarginTopForDateSearchButton = 11;
        }
    } else { //IOS
        if (selectedSearchButton === 'date') {
            calculatedMarginTopForDateSearchButton = 220;
        } else {
            calculatedMarginTopForDateSearchButton = 11;
        }
    }

    //Filter Funktion
    const filterPostsHandler = () => {
        let searchText;
        let filtPosts;

        switch (selectedSearchButton) { //Auswahl nach title, town, postcode, date
            default:
            case 'title':
                searchText = searchString.toLowerCase();
                //Alles filter, wo das Suchwort in irgendeinerweise drin vorkommt.
                filtPosts = props.posts.filter(post => post.title.toLowerCase().replace(/\s/g, '').indexOf(searchText) !== -1);
                break;
            case 'town'://town koennte undefined sein
                searchText = searchString.toLowerCase();
                filtPosts = props.posts.filter(post => {
                    return post.town !== undefined && post.town.toLowerCase().indexOf(searchText) !== -1;
                });
                break;
            case 'postcode': //postcode koennte undefined sein
                searchText = searchString
                //Alles filtern, was mit der PLZ beginnt
                filtPosts = props.posts.filter(post => {
                    return post.postcode !== undefined && post.postcode.startsWith(searchText);
                });
                break;
            case 'date':
                //Daten aufbereiten
                searchText = new Date(choosenDate).toISOString();
                const idx = searchText.indexOf('T');
                searchText = searchText.substring(0, idx);
                //Nach Datum filtern
                filtPosts = props.posts.filter(post => {
                    return post.date.startsWith(searchText);
                });
                break;
        }

        //Header entsprechend anpassen
        if (filtPosts) {
            props.onHeaderTitle('Result for ' + searchText);
        } else {
            props.onHeaderTitle('All Posts');
        }
        props.onFilteredPosts(filtPosts);
        setChoosenDate(new Date()); //clear
        setSearchString(''); //clear
    };

    return ( //Gestenerkennung
        <GestureRecognizer
            onSwipeUp={() => { //Beim hoch wischen
                props.onSearchBarToggle();
                if (searchString === '') {
                    props.onFilteredPosts(null);
                }
            }}
            onSwipeDown={() => { //Beim runter wischen
                props.onSearchBarToggle();
                if (searchString === '') {
                    props.onFilteredPosts(null);
                }
            }}
            config={{ velocityThreshold: 0.4, directionalOffsetThreshold: 100 }}
        >
            <Modal //Pop up ein- und ausblenden
                animationIn='fadeInUp'
                animationOut='fadeOutDown'
                isVisible={props.showSearchbar}
                backdropColor='white'
                backdropOpacity={0.95}
                deviceHeight={Dimensions.get('window').height}
                animationInTiming={400}
                animationOutTiming={400}
            >
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 5 }}>
                    <HeaderButtons HeaderButtonComponent={HeaderButton} >
                        <Item //Toggle Button zum Ein und Ausblenden des Pop-ups
                            title="search"
                            color={Colors.secondary}
                            iconName={Platform.OS === 'android' ? 'md-arrow-dropup' : 'ios-arrow-dropup-circle'}
                            onPress={() => {
                                props.onSearchBarToggle();
                            }}
                        />
                    </HeaderButtons>
                </View>


                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, borderRadius: 20, overflow: 'hidden' }}>
                    <View style={{ width: 90, backgroundColor: selectedSearchButton === 'title' ? Colors.secondary : "orange", }}>
                        <Button color={selectedSearchButton === 'title' ? "orange" : Colors.secondary} title=" Title  " onPress={() => {
                            setSelectedSearchButton("title");
                            setSearchString('');
                        }} />
                    </View>
                    <View style={{ width: 95, backgroundColor: selectedSearchButton === 'postcode' ? Colors.secondary : "orange" }}>
                        <Button color={selectedSearchButton === 'postcode' ? "orange" : Colors.secondary} title="Postcode" onPress={() => {
                            setSelectedSearchButton("postcode");
                            setSearchString('');

                        }} />
                    </View>
                    <View style={{ width: 90, backgroundColor: selectedSearchButton === 'town' ? Colors.secondary : "orange" }}>
                        <Button color={selectedSearchButton === 'town' ? "orange" : Colors.secondary} title="  Town  " onPress={() => {
                            setSelectedSearchButton("town");
                            setSearchString('');
                        }} />
                    </View>
                    <View style={{ width: 90, backgroundColor: selectedSearchButton === 'date' ? Colors.secondary : "orange", }}>
                        <Button color={selectedSearchButton === 'date' ? "orange" : Colors.secondary} title="  Date  " onPress={() => {
                            setSelectedSearchButton("date");
                            setSearchString('');
                        }} />
                    </View>
                </View>

                <View style={{ marginLeft: 8, marginTop: 15 }}>
                    <Text >Search: </Text>
                </View>

                <View style={{ flexDirection: selectedSearchButton !== 'date' ? 'row' : 'column', marginHorizontal: 10 }}>

                    {selectedSearchButton !== 'date' ? //Falls Date-Button ausgewaehlt soll der entsprechende Date-Picker Angezeigt werden, ansonsten das Eingabefeld
                        (<Input
                            style={{ width: '80%' }}
                            blurOnSubmit
                            autoCapatilize='none'
                            autoCorrect={false}
                            maxLength={20}
                            onChangeText={inputHandler}
                            value={searchString}
                            keyboardType={selectedSearchButton === 'postcode' ? "number-pad" : 'default'}
                        />) :
                        <DatePicker onChoosenDate={onChoosenDateHandler} />
                    }

                    {Platform.OS === 'android' || selectedSearchButton === 'date' ? <View /> : (
                        <View style={{ marginLeft: 3, marginTop: 3 }}>
                            <Button //Loesch-Button, nur bei ios Anzeigen
                                title='X'
                                color="red"
                                disabled={searchString.length === 0}
                                onPress={() => {
                                    setSearchString('');
                                }} />
                        </View>)}

                    <View style={{ marginLeft: selectedSearchButton !== 'date' ? 10 : 240, marginTop: calculatedMarginTopForDateSearchButton }}>
                        <HeaderButtons HeaderButtonComponent={HeaderButton} >
                            <Item //Search-Button zum filtern
                                title="search"
                                color={Colors.secondary}
                                iconName={Platform.OS === 'android' ? 'md-send' : 'md-arrow-forward'}
                                onPress={() => {
                                    console.log("clicked");
                                    props.onSearchBarToggle();
                                    filterPostsHandler();
                                }}
                            />
                        </HeaderButtons>
                    </View>
                </View>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ width: 100, borderRadius: 20, overflow: 'hidden', marginTop: selectedSearchButton !== 'date' ? 40 : 80 }}>
                        <Button title="Reset" color="red" onPress={() => { //Reset Button zum zuruecksetzen der Filterung
                            setSearchString('');
                            props.onLoadPosts();
                            props.onSearchBarToggle();
                        }} />
                    </View>
                </View>
            </Modal>
        </GestureRecognizer>
    );
};

export default SearchBar;