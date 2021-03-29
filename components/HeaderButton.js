import React from 'react';
import { HeaderButton } from 'react-navigation-header-buttons';
import { Ionicons } from '@expo/vector-icons'; //<< basiert auf dem REACT NATIVE ICON package !!!


const CustomHeaderButton = props => {
    return <HeaderButton {...props} //Alle Key-Value paare an die HeaderButton-Komponente weitergeben
        IconComponent={Ionicons} //type von vector-icons Ionicons
        iconSize={23} //Groesse
        color="black" //Farbe
    />
};

export default CustomHeaderButton; 