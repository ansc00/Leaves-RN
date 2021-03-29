import { SET_SERVER_ADDRESS, SET_SERVER_PORT } from "../actions/server";

//Initialer Zustand
const initialState = {
    address: 'http://79.199.21.182',
    port: '16222'
};

//Je nach Aktion wird der State entsprechend gesetzt
const serverAddress = (state = initialState, action) => {

    switch (action.type) {
        //Neue ServerAdresse setzen
        case SET_SERVER_ADDRESS:
            if (!action.address || action.address === '' || action.address === undefined) {
                return initialState;
            } else {
                return {
                    ...state,
                    address: action.address
                } 
            }
            //Port setzen
            case SET_SERVER_PORT:
            if (!action.port || action.port === '' || action.port === undefined) {
                return initialState;
            } else {
                return {
                    ...state,
                    port: action.port
                }
            }

        default:
            return state;

    }
}
export default serverAddress;