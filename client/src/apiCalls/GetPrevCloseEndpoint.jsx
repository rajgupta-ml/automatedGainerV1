/* eslint-disable react-hooks/rules-of-hooks */
import { COMMAN_API_ENDPOINT } from './commanEndpoint.jsx'
import axios from 'axios'
const getPrevCloseEndpoint = async () => {

    const response = await axios.get(`${COMMAN_API_ENDPOINT}api/handle-get-prev-day-close`);
    // console.log(response.data.success);
    return response

}

export default getPrevCloseEndpoint
