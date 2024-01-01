/* eslint-disable react-hooks/rules-of-hooks */
import {COMMAN_API_ENDPOINT} from '../apiCalls/commanEndpoint.jsx'
import axios from 'axios'
const handleLogin = async () => {

    const response = await axios.get(`${COMMAN_API_ENDPOINT}api/auth`);
    return response 

}

export default handleLogin
