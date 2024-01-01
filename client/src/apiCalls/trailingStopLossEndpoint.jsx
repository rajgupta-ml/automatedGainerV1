import axios from "axios";
import { COMMAN_API_ENDPOINT } from "./commanEndpoint";


const tralingStopLossEndpoint = async ({ orderBook }) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${COMMAN_API_ENDPOINT}api/handle-stoploss`, { orderBook, token })
    return response;
}

export default tralingStopLossEndpoint
