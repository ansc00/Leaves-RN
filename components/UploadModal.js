import React from 'react';
import Modal from "react-native-modal";
import { Text, View, ActivityIndicator, Dimensions } from 'react-native';//damit jeder Input erreichbar ist

//Pop-up Fenster fuer den Upload
//Zeigt einen Aktivityindikator mit dem entsprechenden Fortschritt als % an.
const UploadModal = props => {

    return (
        <Modal //Pop-up
            animationIn='tada'
            animationOut='tada'
            isVisible={props.visible}
            backdropColor='white'
            backdropOpacity={0.2}
            deviceHeight={Dimensions.get('window').height / 2}
            deviceWidth={Dimensions.get('window').width / 2}
            animationInTiming={600}
            animationOutTiming={600}
        >
            <View style={{ marginHorizontal: Dimensions.get('window').width / 6, width: 250, height: 250, backgroundColor: 'rgba(0,0,102,0.9)', borderRadius: 10, }}>

                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginVertical: 5 }}>
                    <View>
                        <ActivityIndicator size="small" color='white' />
                    </View>
                    <View style={{ marginTop: 10 }}>
                        <Text style={{ color: 'white', fontSize: 20 }}>{props.progress.toFixed(2)} %</Text>
                    </View>
                </View>

            </View>
        </Modal>
    );

};

export default UploadModal;