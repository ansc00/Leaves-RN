import React, { useState } from 'react';
import { View, StyleSheet, DatePickerIOS, Platform, Button, DatePickerAndroid, Text } from 'react-native';

const DatePicker = props => {

    const [choosenDate, setChoosenDate] = useState(new Date().toISOString()); //Datum



    //DatePicker fuer Android
    const androidDayPicker = async () => {
        let selectedDay;
        try {
            const { action, year, month, day } = await DatePickerAndroid.open({
                // Use `new Date()` for current date.
                // May 25 2020. Month 0 is January.
                mode: 'calendar',
                date: new Date(),
            });
            if (action !== DatePickerAndroid.dismissedAction) {//Falls Datum gewaehlt
                // Selected year, month (0-11), day
                selectedDay = new Date(year, month, day).toISOString(); //Datum erzeugen
                const idx = selectedDay.indexOf('T');
                selectedDay = selectedDay.substring(0, idx);
                setChoosenDate(selectedDay); //Datum setzen
                props.onChoosenDate(selectedDay); //Datum weitergeben

            }
        } catch ({ code, message }) {
            console.warn('Cannot open date picker', message);
        }
    };



    if (Platform.OS === 'android') { //Android
        return (
            <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginHorizontal: 5, marginTop: 20 }}>
                <Text>{choosenDate.substring(0, 10)}</Text>

                <View style={{ width: 100, marginTop: 10, overflow: 'hidden', borderRadius: 20 }}>
                    <Button title='Pick a day' color='orange' onPress={() => {
                        androidDayPicker();
                    }} />
                </View>

            </View>
        );
    } else { //IOS

        return (
            <View style={styles.datePicker}>
                <DatePickerIOS date={new Date(choosenDate)} mode="date" onDateChange={(date) => {
                    setChoosenDate(date); //Datum setzen
                    props.onChoosenDate(date); //Datum weitergeben
                }} />
            </View>
        );
    }
};

//Styling
const styles = StyleSheet.create({
    datePicker: {
        flex: 1,
        justifyContent: 'center'
    }
});

export default DatePicker;