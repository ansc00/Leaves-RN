import React from 'react';
import { WebView } from 'react-native-webview';

//Die WebView-Komponente zeigt den ausgewaehlten Link als Wikipedia Artikel in der App an
const WebViewScreen = props => {

    //link holen
    const link = props.navigation.getParam('link'); 

    //WebView
    return <WebView source={{ uri: link }} />

};

//Headertitel setzen
WebViewScreen.navigationOptions = {
    headerTitle: 'Wiki'
};

export default WebViewScreen;