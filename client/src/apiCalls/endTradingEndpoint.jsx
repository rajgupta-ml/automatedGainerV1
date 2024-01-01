import axios from "axios";
import { COMMAN_API_ENDPOINT } from "./commanEndpoint";


const endTradingEndpoint = async () => {
  const token = localStorage.getItem('token')
 const response = await axios.post(`${COMMAN_API_ENDPOINT}api/logout`, {token})
 return response;
}

export default endTradingEndpoint
