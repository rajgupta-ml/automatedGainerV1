import axios from "axios"
import { COMMAN_API_ENDPOINT } from "./commanEndpoint"

const startTradingEndpoint = async () => {
    const token = localStorage.getItem("token")

    const response = await axios.post(`${COMMAN_API_ENDPOINT}api/start-trading`, {token})
    return response
}

export default startTradingEndpoint
