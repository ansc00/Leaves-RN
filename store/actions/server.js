export const SET_SERVER_ADDRESS = 'SET_SERVERADDRESS';
export const SET_SERVER_PORT = 'SET_SERVER_PORT';

//ServerAddress setzen
export const setServerAddress = address => {
    return dispatch => {
        dispatch({ type: SET_SERVER_ADDRESS, address });  //SET_SERVERADDRESS Action dispatchen
    };
};

//Port setzen
export const setServerPort = port => { 
    return dispatch => {
        dispatch({ type: SET_SERVER_PORT, port });  //SET_SERVER_PORT Action dispatchen
    };
};
