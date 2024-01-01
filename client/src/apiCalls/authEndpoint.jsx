import axios from "axios"
import { COMMAN_API_ENDPOINT } from "./commanEndpoint"
const authEndpoint = async ({accessCode}) => {
    const response = await axios.post(`${COMMAN_API_ENDPOINT}api/verify-access-code`, {accessCode});
    return response;
}   

export default authEndpoint
